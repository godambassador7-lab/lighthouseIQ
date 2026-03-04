#!/usr/bin/env python3
"""
Healthcare Strike Feed Aggregator

Fetches and normalizes healthcare labor action data from:
  - Cornell ILR Labor Action Tracker (primary)
  - Nurse.org strike list (secondary)
  - AFL-CIO Strike Map (tertiary)
  - Curated manual entries (always preserved)

Adds verification logic so stale curated "active" alerts are not treated as
confirmed active indefinitely when upstream feeds fail.

Output: public/data/strikes.json
"""

import json
import os
import re
import sys
import urllib.parse
from email.utils import parsedate_to_datetime
from datetime import datetime, timedelta, timezone
from pathlib import Path
import xml.etree.ElementTree as ET

try:
    import requests
except ImportError:
    print("[Strikes] requests not installed - run: pip install requests")
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("[Strikes] beautifulsoup4 not installed - HTML scraping limited")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
OUTPUT_DIR = os.environ.get("LNI_OUTPUT_DIR", "public/data")
OUTPUT_FILE = Path(OUTPUT_DIR) / "strikes.json"
NOW_UTC = datetime.now(timezone.utc)
CURRENT_YEAR = NOW_UTC.year

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; LighthouseIQ/1.0; "
        "healthcare-intelligence-platform; +https://lighthouseiq.app)"
    ),
    "Accept": "application/json, text/html, */*",
}
TIMEOUT = 20

# Degrade curated active entries if no reconfirmation.
ACTIVE_STALE_DAYS = int(os.environ.get("STRIKE_ACTIVE_STALE_DAYS", "45"))

# Healthcare NAICS prefixes (sector 62 = Health Care & Social Assistance)
HEALTHCARE_NAICS = ("62",)

# Keywords that indicate a healthcare employer/action
HEALTHCARE_KEYWORDS = [
    "hospital", "medical center", "medical ctr", "health system", "healthcare",
    "nurse", "nursing", "clinic", "pharmacy", "behavioral health",
    "kaiser", "hca healthcare", "ascension", "commonspirit", "dignity health",
    "providence health", "allina health", "mayo clinic", "intermountain health",
    "advocate health", "sutter health", "montefiore", "mount sinai", "beth israel",
    "newyork-presbyterian", "brigham and women's", "cedars-sinai",
    "nysna", "national nurses united", "nnoc", "hpae", "onac", "wsna",
    "home health", "hospice", "skilled nursing", "nursing home", "long-term care", "ltc",
]

HEALTHCARE_INDUSTRY_KEYWORDS = [
    "health", "hospital", "nursing", "medical", "ambulatory", "home health", "hospice",
]

RSS_EMPLOYER_SIGNAL_KEYWORDS = [
    "hospital", "medical center", "health", "clinic", "healthcare", "nursing home", "facility",
]

HEALTHCARE_UNION_KEYWORDS = [
    "nysna", "national nurses united", "nnoc", "hpae", "onac", "wsna",
    "nurse", "nurses association",
]

STRIKE_KEYWORDS = [
    "strike", "walkout", "work stoppage", "informational picket",
    "strike authorization", "lockout",
]

RESOLVED_KEYWORDS = [
    "tentative agreement", "ratified", "agreement reached", "agreement approved",
    "return to work", "ended strike", "end strike", "strike ends", "settlement",
    "contract deal", "contract ratified",
]

PENDING_KEYWORDS = [
    "authorize", "authorization", "authorize strike", "strike vote",
    "voted to strike", "filed notice", "notice of strike",
]

STATE_ABBREVS = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
}

SEARCH_TEMPLATES = {
    "massnurses.org": "https://www.massnurses.org/?s={q}",
    "hpae.org": "https://www.hpae.org/?s={q}",
    "nationalnursesunited.org": "https://www.nationalnursesunited.org/search?search_api_fulltext={q}",
    "nysna.org": "https://www.nysna.org/search/node/{q}",
    "mnnurses.org": "https://www.mnnurses.org/?s={q}",
    "pasnap.org": "https://pasnap.org/?s={q}",
    "seiu.org": "https://www.seiu.org/search/{q}",
    "nurse.org": "https://nurse.org/articles/nurse-strikes-list/",
}

SOURCE_HEALTH = []

UNION_RSS_SOURCES = [
    ("nnu_rss", "https://www.nationalnursesunited.org/rss.xml"),
    ("nysna_rss", "https://www.nysna.org/rss.xml"),
    ("massnurses_rss", "https://www.massnurses.org/feed/"),
    ("hpae_rss", "https://www.hpae.org/feed/"),
    ("mnnurses_rss", "https://www.mnnurses.org/feed/"),
    ("pasnap_rss", "https://pasnap.org/feed/"),
    ("seiu_rss", "https://www.seiu.org/feed"),
]

GOOGLE_NEWS_RSS_SOURCES = [
    ("google_news_nurse_strike", "https://news.google.com/rss/search?q=nurse+strike+hospital+when:30d&hl=en-US&gl=US&ceid=US:en"),
    ("google_news_healthcare_strike", "https://news.google.com/rss/search?q=healthcare+workers+strike+hospital+when:30d&hl=en-US&gl=US&ceid=US:en"),
    ("google_news_nurses_vote_strike", "https://news.google.com/rss/search?q=nurses+vote+to+strike+hospital+when:30d&hl=en-US&gl=US&ceid=US:en"),
]

SOURCE_CONFIDENCE_WEIGHTS = {
    "cornell_ilr": 72,
    "nurse_org": 75,
    "nnu_rss": 70,
    "nysna_rss": 70,
    "massnurses_rss": 70,
    "hpae_rss": 70,
    "mnnurses_rss": 70,
    "pasnap_rss": 70,
    "seiu_rss": 66,
    "google_news_nurse_strike": 45,
    "google_news_healthcare_strike": 45,
    "google_news_nurses_vote_strike": 45,
    "curated": 62,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def get_domain(url: str) -> str:
    try:
        return urllib.parse.urlparse(url).netloc.lower().replace("www.", "")
    except Exception:
        return ""


def source_health(source: str, url: str, ok: bool, status_code=None, error=None, records=0):
    SOURCE_HEALTH.append({
        "source": source,
        "url": url,
        "ok": bool(ok),
        "statusCode": status_code,
        "error": str(error)[:250] if error else None,
        "records": int(records or 0),
        "checkedAt": NOW_UTC.strftime("%Y-%m-%dT%H:%M:%SZ"),
    })


def is_healthcare(record: dict) -> bool:
    """Return True if this record is a healthcare labor action."""
    naics = str(record.get("naics") or record.get("naics_code") or "")
    if any(naics.startswith(n) for n in HEALTHCARE_NAICS):
        return True
    industry = str(record.get("industry") or "").lower()
    if industry and any(k in industry for k in HEALTHCARE_INDUSTRY_KEYWORDS):
        return True
    fields = " ".join([
        str(record.get("employer") or record.get("employer_name") or ""),
        str(record.get("industry") or ""),
        str(record.get("union") or record.get("union_name") or ""),
        str(record.get("sector") or ""),
    ]).lower()
    return any(kw in fields for kw in HEALTHCARE_KEYWORDS)


def is_healthcare_cornell(record: dict) -> bool:
    """
    Stricter healthcare check for Cornell ILR records to reduce false positives
    from generic "health and safety" wording in non-healthcare labor actions.
    """
    naics = str(record.get("naics") or "").strip()
    if any(naics.startswith(n) for n in HEALTHCARE_NAICS):
        return True
    employer = str(record.get("employer") or "").lower()
    industry = str(record.get("industry") or "").lower()
    union = str(record.get("union") or "").lower()
    if any(k in industry for k in HEALTHCARE_INDUSTRY_KEYWORDS):
        return True
    if any(k in employer for k in ("hospital", "medical", "health", "clinic", "nursing", "pharmacy")):
        return True
    if any(k in union for k in HEALTHCARE_UNION_KEYWORDS):
        return True
    return False


def normalize_state(raw: str) -> str:
    if not raw:
        return ""
    raw = raw.strip()
    if len(raw) == 2:
        return raw.upper()
    return STATE_ABBREVS.get(raw.title(), raw[:2].upper())


def parse_workers(raw) -> int:
    if raw is None:
        return 0
    try:
        return int(str(raw).replace(",", "").strip())
    except (ValueError, TypeError):
        m = re.search(r"[\d,]+", str(raw))
        return int(m.group().replace(",", "")) if m else 0


def parse_iso_date(value: str):
    if not value:
        return None
    s = value.strip()
    fmts = (
        "%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y", "%B %d, %Y", "%b %d, %Y",
        "%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z",
    )
    for fmt in fmts:
        try:
            return datetime.strptime(s[:20], fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    try:
        dt = parsedate_to_datetime(s)
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        if dt:
            return dt.astimezone(timezone.utc)
    except Exception:
        pass
    return None


def parse_date_str(value: str) -> str:
    dt = parse_iso_date(value)
    if not dt:
        return ""
    return dt.strftime("%Y-%m-%d")


def extract_state_from_text(text: str) -> str:
    if not text:
        return ""
    up = text.upper()
    m = re.search(r"\(([A-Z]{2})\)", up)
    if m:
        return m.group(1)
    m = re.search(r"(?:,\s*|\s-\s)([A-Z]{2})(?:\b|\))", up)
    if m and m.group(1) in set(STATE_ABBREVS.values()):
        return m.group(1)
    lower = text.lower()
    for full_name, abbr in STATE_ABBREVS.items():
        if full_name.lower() in lower:
            return abbr
    return ""


def infer_hc_type(employer: str, union: str, reason: str) -> str:
    combined = f"{employer} {union} {reason}".lower()
    if any(k in combined for k in ("home health", "home care", "homecare", "hospice")):
        return "homecare"
    if any(k in combined for k in ("skilled nursing", "snf", "nursing home", "long-term", "ltc")):
        return "nursing_home"
    if any(k in combined for k in ("clinic", "outpatient", "medical office", "ambulatory")):
        return "clinic"
    return "hospital"


def make_id(source: str, employer: str, city: str, state: str, start: str) -> str:
    raw = f"{employer}{city}{state}{start}".lower()
    h = hash(raw) & 0xFFFFFF
    return f"{source}-{h:06x}"


def normalize_record(raw: dict, source: str) -> dict:
    employer = clean_text(
        raw.get("employer") or raw.get("employer_name") or raw.get("Employer") or raw.get("company") or "Unknown"
    )
    city = clean_text(
        raw.get("city") or raw.get("City") or raw.get("location_city") or raw.get("location") or ""
    )
    state = normalize_state(
        raw.get("state") or raw.get("State") or raw.get("location_state") or raw.get("stateAbbr") or ""
    )
    workers = parse_workers(
        raw.get("workers")
        or raw.get("num_workers")
        or raw.get("Workers")
        or raw.get("workers_involved")
        or raw.get("number_of_workers")
        or raw.get("approx_workers")
    )
    start = (
        raw.get("start_date")
        or raw.get("Start Date")
        or raw.get("date")
        or raw.get("action_date")
        or raw.get("begin_date")
        or ""
    )
    end = (
        raw.get("end_date")
        or raw.get("End Date")
        or raw.get("end")
        or raw.get("resolution_date")
        or None
    )
    status = str(raw.get("status") or ("resolved" if end else "active")).lower()
    if status not in ("active", "pending", "resolved"):
        status = "resolved" if end else "active"
    start_dt = parse_iso_date(start)
    if source == "cornell_ilr" and status == "active" and not end and start_dt:
        if (NOW_UTC - start_dt).days > 120:
            status = "pending"

    union = clean_text(
        raw.get("union") or raw.get("Union") or raw.get("union_name") or raw.get("organizing_union") or ""
    )
    reason = clean_text(
        raw.get("reason")
        or raw.get("demands")
        or raw.get("Demands")
        or raw.get("issues")
        or raw.get("cause")
        or ""
    )
    action_type = str(
        raw.get("action_type") or raw.get("type") or raw.get("strike_type") or "strike"
    ).lower().replace(" ", "_")

    hc_type = infer_hc_type(employer, union, reason)
    is_opp = workers >= 500 and status in ("active", "pending")

    return {
        "id": make_id(source, employer, city, state, start),
        "employer": employer,
        "city": city,
        "state": state,
        "workers": workers,
        "union": union,
        "reason": reason,
        "actionType": action_type,
        "startDate": start,
        "endDate": end,
        "status": status,
        "source": source,
        "sourceUrl": (raw.get("source_url") or raw.get("url") or ""),
        "healthcareType": hc_type,
        "isTravelOpportunity": is_opp,
        "notes": clean_text(raw.get("notes") or raw.get("description") or ""),
    }


# ---------------------------------------------------------------------------
# Source: Cornell ILR Labor Action Tracker
# ---------------------------------------------------------------------------
CORNELL_ILR_TRIES = [
    "https://striketracker.ilr.cornell.edu/labor_actions.json",
    "https://striketracker.ilr.cornell.edu/api/v1/actions/?format=json&page_size=500",
    "https://striketracker.ilr.cornell.edu/api/actions/?format=json&page_size=500",
    "https://striketracker.ilr.cornell.edu/api/lat/actions/?format=json",
    "https://striketracker.ilr.cornell.edu/actions.json",
    "https://striketracker.ilr.cornell.edu/data/actions.json",
    "https://striketracker.ilr.cornell.edu/static/data/actions.json",
]


def fetch_cornell_ilr() -> list:
    for url in CORNELL_ILR_TRIES:
        try:
            print(f"[ILR] GET {url}")
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code != 200:
                source_health("cornell_ilr", url, ok=False, status_code=r.status_code)
                print(f"[ILR]   -> {r.status_code}")
                continue
            data = r.json()
            if isinstance(data, dict) and "results" not in data and "data" not in data and "actions" not in data:
                # Current tracker structure: { "23": { ... }, "24": { ... } }
                records = list(data.values())
            else:
                records = (
                    data
                    if isinstance(data, list)
                    else data.get("results") or data.get("data") or data.get("actions") or []
                )
            if not records:
                source_health("cornell_ilr", url, ok=False, status_code=200, error="empty response")
                print("[ILR]   -> empty response")
                continue
            normalized_raw = []
            for rec in records:
                normalized_raw.append({
                    "employer": rec.get("Employer") or rec.get("employer"),
                    "start_date": rec.get("Start_date") or rec.get("start_date"),
                    "end_date": rec.get("End_date") or rec.get("end_date"),
                    "union": rec.get("Labor_Organization") or rec.get("labor_organization"),
                    "action_type": rec.get("Action_type") or rec.get("action_type"),
                    "industry": ", ".join(rec.get("Industry", [])) if isinstance(rec.get("Industry"), list) else rec.get("Industry"),
                    "reason": ", ".join(rec.get("Worker_demands", [])) if isinstance(rec.get("Worker_demands"), list) else rec.get("Worker_demands"),
                    "workers": rec.get("Approximate_Number_of_Participants"),
                    "status": "resolved" if rec.get("End_date") else "active",
                    "source_url": "https://striketracker.ilr.cornell.edu/labor_actions.json",
                    "notes": rec.get("Notes") or "",
                    "city": (rec.get("locations") or [{}])[0].get("City", "") if isinstance(rec.get("locations"), list) and rec.get("locations") else "",
                    "state": (rec.get("locations") or [{}])[0].get("State", "") if isinstance(rec.get("locations"), list) and rec.get("locations") else "",
                    "naics": rec.get("NAICS") or rec.get("naics"),
                })
            hc = [rec for rec in normalized_raw if is_healthcare_cornell(rec)]
            source_health("cornell_ilr", url, ok=True, status_code=200, records=len(hc))
            print(f"[ILR]   -> {len(hc)} healthcare records from {len(records)} total")
            return [normalize_record(rec, "cornell_ilr") for rec in hc]
        except Exception as exc:
            source_health("cornell_ilr", url, ok=False, error=exc)
            print(f"[ILR]   -> error: {exc}")
    print("[ILR] All endpoints failed - skipping Cornell ILR")
    return []


# ---------------------------------------------------------------------------
# Source: AFL-CIO Strike Map
# ---------------------------------------------------------------------------
AFLCIO_TRIES = [
    "https://aflcio.org/api/1.0/strikes?_format=json",
    "https://aflcio.org/api/strikes?_format=json",
    "https://aflcio.org/strike-map/data",
]


def fetch_aflcio() -> list:
    for url in AFLCIO_TRIES:
        try:
            print(f"[AFL-CIO] GET {url}")
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code != 200:
                err = None
                if r.status_code == 403 and "cloudflare" in (r.text or "").lower():
                    err = "blocked by cloudflare"
                source_health("aflcio", url, ok=False, status_code=r.status_code, error=err)
                print(f"[AFL-CIO]   -> {r.status_code}")
                if err:
                    print("[AFL-CIO]   -> Cloudflare block detected; skipping remaining AFL-CIO endpoints")
                    break
                continue
            data = r.json()
            records = data if isinstance(data, list) else data.get("data", [])
            if not records:
                source_health("aflcio", url, ok=False, status_code=200, error="empty response")
                continue
            hc = [rec for rec in records if is_healthcare(rec)]
            source_health("aflcio", url, ok=True, status_code=200, records=len(hc))
            print(f"[AFL-CIO]   -> {len(hc)} healthcare records")
            return [normalize_record(rec, "aflcio") for rec in hc]
        except Exception as exc:
            source_health("aflcio", url, ok=False, error=exc)
            print(f"[AFL-CIO]   -> error: {exc}")
    print("[AFL-CIO] All endpoints failed - skipping")
    return []


# ---------------------------------------------------------------------------
# Source: Nurse.org (HTML scrape)
# ---------------------------------------------------------------------------
NURSE_ORG_URL = "https://nurse.org/articles/nurse-strikes-list/"


def fetch_nurse_org() -> list:
    if not HAS_BS4:
        print("[Nurse.org] Skipping - beautifulsoup4 not installed")
        source_health("nurse_org", NURSE_ORG_URL, ok=False, error="beautifulsoup4 missing")
        return []
    try:
        print(f"[Nurse.org] GET {NURSE_ORG_URL}")
        r = requests.get(NURSE_ORG_URL, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            source_health("nurse_org", NURSE_ORG_URL, ok=False, status_code=r.status_code)
            print(f"[Nurse.org]   -> {r.status_code}")
            return []
        soup = BeautifulSoup(r.text, "html.parser")
        results = []
        for el in soup.select("table tr, .strike-entry, li, p"):
            text = clean_text(el.get_text(" ", strip=True))
            if not text or len(text) < 20:
                continue

            lower_text = text.lower()
            if not any(k in lower_text for k in STRIKE_KEYWORDS):
                continue
            if any(
                bad in lower_text
                for bad in (
                    "rn to bsn", "nurse practitioner", "adn", "lpn", "career", "degree",
                    "how to", "salary", "articles", "programs", "travel nurse jobs",
                )
            ):
                continue

            state_m = re.search(r"\(([A-Z]{2})\)", text)
            workers_m = re.search(r"([\d,]+)\s*(?:nurses?|workers?|RNs?)", text, re.I)
            date_m = re.search(r"(\d{4}-\d{2}-\d{2}|\w+ \d+,?\s*\d{4})", text)
            if not state_m or not workers_m:
                continue
            employer_m = re.match(r"(.+?)\s*\([A-Z]{2}\)", text)
            employer = clean_text(employer_m.group(1) if employer_m else text[:80])

            raw = {
                "employer": employer,
                "state": state_m.group(1),
                "workers": workers_m.group(1).replace(",", "") if workers_m else 0,
                "start_date": date_m.group(1) if date_m else "",
                "source_url": NURSE_ORG_URL,
                "reason": "Scraped from Nurse.org strike list",
                "status": "active",
            }
            if is_healthcare(raw):
                results.append(normalize_record(raw, "nurse_org"))
        source_health("nurse_org", NURSE_ORG_URL, ok=True, status_code=200, records=len(results))
        print(f"[Nurse.org]   -> {len(results)} records parsed")
        return results
    except Exception as exc:
        source_health("nurse_org", NURSE_ORG_URL, ok=False, error=exc)
        print(f"[Nurse.org]   -> error: {exc}")
        return []


# ---------------------------------------------------------------------------
# Source: Union RSS feeds (official union updates)
# ---------------------------------------------------------------------------
def extract_channel_items(xml_text: str):
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []
    items = []
    for item in root.findall(".//item"):
        title = clean_text(item.findtext("title") or "")
        description = clean_text(item.findtext("description") or "")
        link = clean_text(item.findtext("link") or "")
        pub_date = clean_text(item.findtext("pubDate") or "")
        items.append({
            "title": title,
            "description": description,
            "link": link,
            "pubDate": pub_date,
        })
    return items


def infer_rss_status(text: str) -> str:
    lower = text.lower()
    if any(k in lower for k in RESOLVED_KEYWORDS):
        return "resolved"
    if any(k in lower for k in PENDING_KEYWORDS):
        return "pending"
    return "active"


def infer_news_status(text: str) -> str:
    lower = text.lower()
    if any(k in lower for k in RESOLVED_KEYWORDS):
        return "resolved"
    # News aggregation is valuable for discovery, but not sufficient to mark
    # "active" without direct confirmation from primary labor/union sources.
    return "pending"


def infer_rss_action_type(text: str) -> str:
    lower = text.lower()
    if "informational picket" in lower:
        return "informational_picket"
    if "lockout" in lower:
        return "lockout"
    return "strike"


def infer_employer_from_text(title: str, description: str) -> str:
    text = clean_text(title or description)
    if " at " in text.lower():
        parts = re.split(r"\bat\b", text, flags=re.I)
        if len(parts) >= 2:
            return clean_text(parts[-1])[:90]
    m = re.match(r"(.+?)\s+nurses?\b", text, flags=re.I)
    if m:
        return clean_text(m.group(1))[:90]
    return text[:90]


def is_low_quality_employer(employer: str) -> bool:
    e = clean_text(employer).lower()
    if not e:
        return True
    if e.startswith("nurses "):
        return True
    if e in {"la", "reno", "redding"}:
        return True
    if len(e) < 6 and not any(k in e for k in ("hospital", "medical", "health", "clinic", "center", "care")):
        return True
    return False


def fetch_union_rss() -> list:
    results = []
    for source_name, feed_url in UNION_RSS_SOURCES:
        try:
            print(f"[{source_name}] GET {feed_url}")
            r = requests.get(feed_url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code != 200:
                source_health(source_name, feed_url, ok=False, status_code=r.status_code)
                print(f"[{source_name}]   -> {r.status_code}")
                continue

            items = extract_channel_items(r.text)
            matched = 0
            for it in items:
                blob = clean_text(f"{it['title']} {it['description']}").lower()
                if not any(k in blob for k in STRIKE_KEYWORDS + PENDING_KEYWORDS + RESOLVED_KEYWORDS):
                    continue
                if not any(k in blob for k in HEALTHCARE_KEYWORDS):
                    continue

                employer = infer_employer_from_text(it["title"], it["description"])
                state = extract_state_from_text(f"{it['title']} {it['description']}")
                status = infer_news_status(blob)
                action_type = infer_rss_action_type(blob)
                start_date = parse_date_str(it["pubDate"])
                start_dt = parse_iso_date(it["pubDate"])
                if start_dt and (NOW_UTC - start_dt).days > 400:
                    continue
                employer_signal = any(k in blob for k in RSS_EMPLOYER_SIGNAL_KEYWORDS)
                if is_low_quality_employer(employer) and not employer_signal:
                    continue

                raw = {
                    "employer": employer,
                    "state": state,
                    "workers": 0,
                    "start_date": start_date,
                    "status": status,
                    "action_type": action_type,
                    "reason": "Union feed signal",
                    "source_url": it["link"] or feed_url,
                    "notes": clean_text(it["title"]),
                    "union": source_name.replace("_rss", "").upper(),
                }
                if is_healthcare(raw):
                    matched += 1
                    results.append(normalize_record(raw, source_name))

            source_health(source_name, feed_url, ok=True, status_code=200, records=matched)
            print(f"[{source_name}]   -> {matched} strike-related healthcare records")
        except Exception as exc:
            source_health(source_name, feed_url, ok=False, error=exc)
            print(f"[{source_name}]   -> error: {exc}")
    return results


def fetch_google_news_rss() -> list:
    results = []
    for source_name, feed_url in GOOGLE_NEWS_RSS_SOURCES:
        try:
            print(f"[{source_name}] GET {feed_url}")
            r = requests.get(feed_url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code != 200:
                source_health(source_name, feed_url, ok=False, status_code=r.status_code)
                print(f"[{source_name}]   -> {r.status_code}")
                continue

            items = extract_channel_items(r.text)
            matched = 0
            for it in items:
                blob = clean_text(f"{it['title']} {it['description']}").lower()
                if not any(k in blob for k in STRIKE_KEYWORDS + PENDING_KEYWORDS + RESOLVED_KEYWORDS):
                    continue
                if not any(k in blob for k in HEALTHCARE_KEYWORDS):
                    continue
                if not any(k in blob for k in RSS_EMPLOYER_SIGNAL_KEYWORDS):
                    continue

                title = clean_text(it["title"])
                # Most Google News titles are "Headline - Source Name"
                headline = title.rsplit(" - ", 1)[0] if " - " in title else title
                employer = infer_employer_from_text(headline, it["description"])
                if is_low_quality_employer(employer):
                    continue

                state = extract_state_from_text(f"{headline} {it['description']}")
                status = infer_news_status(blob)
                action_type = infer_rss_action_type(blob)
                start_date = parse_date_str(it["pubDate"])

                raw = {
                    "employer": employer,
                    "state": state,
                    "workers": 0,
                    "start_date": start_date,
                    "status": status,
                    "action_type": action_type,
                    "reason": "Google News nurse-strike signal",
                    "source_url": it["link"] or feed_url,
                    "notes": headline[:180],
                    "union": "",
                }
                if is_healthcare(raw):
                    matched += 1
                    results.append(normalize_record(raw, source_name))

            source_health(source_name, feed_url, ok=True, status_code=200, records=matched)
            print(f"[{source_name}]   -> {matched} healthcare strike signals")
        except Exception as exc:
            source_health(source_name, feed_url, ok=False, error=exc)
            print(f"[{source_name}]   -> error: {exc}")
    return results


# ---------------------------------------------------------------------------
# Verification of curated active/pending entries
# ---------------------------------------------------------------------------
def build_search_url(strike: dict) -> str:
    source_url = strike.get("sourceUrl") or ""
    domain = get_domain(source_url)
    employer = strike.get("employer") or ""
    query = urllib.parse.quote_plus(f"{employer} nurse strike")
    template = SEARCH_TEMPLATES.get(domain)
    if template:
        return template.format(q=query)
    if source_url:
        return source_url
    return "https://nurse.org/articles/nurse-strikes-list/"


def extract_recent_year(text: str):
    years = [int(y) for y in re.findall(r"\b(20\d{2})\b", text)]
    if not years:
        return None
    return max(years)


def verify_status(strike: dict) -> dict:
    """
    Returns verification metadata and suggested status update.
    """
    search_url = build_search_url(strike)
    employer = clean_text(strike.get("employer", ""))
    employer_tokens = [t for t in re.split(r"[^A-Za-z0-9]+", employer.lower()) if len(t) >= 4][:4]
    result = {
        "verifiedAt": NOW_UTC.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "verificationSource": search_url,
        "verificationStatus": "unverified",
        "evidenceYear": None,
        "evidenceHint": "",
    }

    try:
        resp = requests.get(search_url, headers=HEADERS, timeout=TIMEOUT)
        if resp.status_code != 200:
            result["evidenceHint"] = f"source returned {resp.status_code}"
            return result
        text = clean_text(re.sub(r"<[^>]+>", " ", resp.text)).lower()
    except Exception as exc:
        result["evidenceHint"] = f"verification error: {exc}"
        return result

    year = extract_recent_year(text)
    result["evidenceYear"] = year
    contains_employer = bool(employer_tokens) and any(tok in text for tok in employer_tokens)
    has_strike_term = any(k in text for k in STRIKE_KEYWORDS)
    has_resolved_term = any(k in text for k in RESOLVED_KEYWORDS)
    has_recent_year = year is not None and year >= (CURRENT_YEAR - 1)

    if contains_employer and has_resolved_term and has_recent_year:
        result["verificationStatus"] = "resolved_signal"
        result["evidenceHint"] = "recent resolution/contract language found"
        return result

    if contains_employer and has_strike_term and has_recent_year:
        result["verificationStatus"] = "active_signal"
        result["evidenceHint"] = "recent strike language found"
        return result

    if contains_employer and has_resolved_term:
        result["verificationStatus"] = "resolved_signal"
        result["evidenceHint"] = "resolution language found (older coverage)"
        return result

    if contains_employer and has_strike_term:
        result["verificationStatus"] = "stale_signal"
        result["evidenceHint"] = "strike language found but not recent"
        return result

    result["evidenceHint"] = "no strong employer/status signal"
    return result


def apply_verification_rules(strikes: list) -> list:
    adjusted = []
    for strike in strikes:
        s = dict(strike)
        s["isTravelOpportunity"] = bool((s.get("workers") or 0) >= 500 and s.get("status") in ("active", "pending"))

        if not s.get("curated") or s.get("status") not in ("active", "pending"):
            adjusted.append(s)
            continue

        verification = verify_status(s)
        s.update({
            "verifiedAt": verification["verifiedAt"],
            "verificationStatus": verification["verificationStatus"],
            "verificationSource": verification["verificationSource"],
            "verificationEvidenceYear": verification["evidenceYear"],
            "verificationEvidence": verification["evidenceHint"],
        })

        start_dt = parse_iso_date(s.get("startDate", ""))
        age_days = (NOW_UTC - start_dt).days if start_dt else None
        status = s.get("status")

        if verification["verificationStatus"] == "resolved_signal":
            s["status"] = "resolved"
            s["endDate"] = s.get("endDate") or NOW_UTC.strftime("%Y-%m-%d")
            s["isTravelOpportunity"] = False
            note = s.get("notes", "")
            marker = "Auto-resolved after verification signal."
            s["notes"] = clean_text(f"{note} {marker}")
        elif verification["verificationStatus"] == "active_signal":
            pass
        elif verification["verificationStatus"] in ("stale_signal", "unverified"):
            if status == "active" and age_days is not None and age_days > ACTIVE_STALE_DAYS:
                s["status"] = "pending"
                s["isTravelOpportunity"] = False
                note = s.get("notes", "")
                marker = "Auto-downgraded to pending: no recent confirmation."
                s["notes"] = clean_text(f"{note} {marker}")

        adjusted.append(s)
    return adjusted


# ---------------------------------------------------------------------------
# Merge, entity resolution, and confidence scoring
# ---------------------------------------------------------------------------
def normalize_employer_name(name: str) -> str:
    text = clean_text(name).lower()
    text = re.sub(r"[^\w\s]", " ", text)
    stop = {
        "hospital", "medical", "center", "health", "healthcare", "system",
        "workers", "worker", "nurses", "nurse", "the", "of", "and", "for",
    }
    tokens = [t for t in text.split() if t and t not in stop]
    return " ".join(tokens[:6]) if tokens else text


def status_rank(status: str) -> int:
    rank = {"active": 3, "pending": 2, "resolved": 1}
    return rank.get((status or "").lower(), 0)


def choose_status(statuses: list) -> str:
    if not statuses:
        return "pending"
    uniq = {s for s in statuses if s}
    if "active" in uniq:
        return "active"
    if "pending" in uniq:
        return "pending"
    return "resolved"


def event_bucket_date(start_date: str) -> str:
    dt = parse_iso_date(start_date or "")
    return dt.strftime("%Y-%m") if dt else "unknown"


def canonical_event_key(s: dict) -> str:
    employer_key = normalize_employer_name(s.get("employer", ""))
    state = (s.get("state") or "").upper() or "NA"
    month = event_bucket_date(s.get("startDate") or "")
    action = (s.get("actionType") or "strike").lower()
    return f"{employer_key}|{state}|{month}|{action}"


def source_weight(source: str) -> int:
    return SOURCE_CONFIDENCE_WEIGHTS.get((source or "").lower(), 50)


def confidence_label(score: int) -> str:
    if score >= 80:
        return "high"
    if score >= 60:
        return "medium"
    return "low"


def score_confidence(strike: dict) -> int:
    sources = strike.get("corroboratedBy") or [strike.get("source")]
    base = max(source_weight(s) for s in sources if s)
    corroboration_bonus = min(20, max(0, len(set(sources)) - 1) * 8)
    recency_bonus = 0
    start_dt = parse_iso_date(strike.get("startDate") or "")
    if start_dt:
        age_days = (NOW_UTC - start_dt).days
        if age_days <= 30:
            recency_bonus = 10
        elif age_days <= 90:
            recency_bonus = 5
    status_penalty = 0
    if strike.get("status") == "pending":
        status_penalty = -8
    elif strike.get("status") == "resolved":
        status_penalty = -15
    score = base + corroboration_bonus + recency_bonus + status_penalty
    return max(5, min(99, score))


def consolidate_events(strikes: list) -> list:
    groups = {}
    for s in strikes:
        key = canonical_event_key(s)
        groups.setdefault(key, []).append(s)

    consolidated = []
    for _, items in groups.items():
        if len(items) == 1:
            one = dict(items[0])
            one["corroboratedBy"] = [one.get("source")] if one.get("source") else []
            one["sourceCount"] = len(one["corroboratedBy"])
            one["confidenceScore"] = score_confidence(one)
            one["confidenceLabel"] = confidence_label(one["confidenceScore"])
            consolidated.append(one)
            continue

        items_sorted = sorted(
            items,
            key=lambda s: (
                status_rank(s.get("status")),
                source_weight(s.get("source")),
                parse_workers(s.get("workers") or 0),
            ),
            reverse=True,
        )
        top = dict(items_sorted[0])
        sources = sorted({(s.get("source") or "") for s in items if s.get("source")})
        statuses = [s.get("status") for s in items]
        notes = [clean_text(s.get("notes", "")) for s in items if s.get("notes")]
        source_urls = [s.get("sourceUrl") for s in items if s.get("sourceUrl")]

        top["status"] = choose_status(statuses)
        top["workers"] = max(parse_workers(s.get("workers") or 0) for s in items)
        top["source"] = top.get("source") or (sources[0] if sources else "")
        top["sourceUrl"] = source_urls[0] if source_urls else top.get("sourceUrl", "")
        top["corroboratedBy"] = sources
        top["sourceCount"] = len(sources)
        if notes:
            top["notes"] = clean_text(" | ".join(dict.fromkeys(notes)))
        top["isTravelOpportunity"] = bool((top.get("workers") or 0) >= 500 and top.get("status") in ("active", "pending"))
        top["confidenceScore"] = score_confidence(top)
        top["confidenceLabel"] = confidence_label(top["confidenceScore"])
        consolidated.append(top)

    return consolidated


def dedup_key(s: dict) -> str:
    emp = re.sub(r"\s+", " ", (s.get("employer") or "").lower().strip())
    state = (s.get("state") or "").upper()
    start = (s.get("startDate") or "")[:7]
    if not start:
        src = (s.get("source") or "").lower()
        return f"{emp}|{state}|{src}"
    return f"{emp}|{state}|{start}"


def load_existing() -> list:
    if not OUTPUT_FILE.exists():
        return []
    try:
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            return json.load(f).get("strikes", [])
    except Exception as exc:
        print(f"[Strikes] Could not read existing file: {exc}")
        return []


def merge_strikes(fetched: list, existing: list) -> list:
    """
    Merge strategy:
    - Start with all freshly fetched records
    - Add curated manual entries not already present (by dedup key)
    - Drop non-curated existing records older than 18 months with status=resolved
    """
    cutoff = NOW_UTC - timedelta(days=548)
    merged = {dedup_key(s): s for s in fetched}
    fetched_keys = set(merged.keys())

    for ex in existing:
        key = dedup_key(ex)
        if key in merged:
            continue
        if ex.get("curated"):
            merged[key] = ex
            continue

        source = (ex.get("source") or "").lower()
        if source in ("nurse_org", "aflcio", "cornell_ilr") or source.endswith("_rss") or source.startswith("google_news_"):
            # Keep live-feed records only when they are re-fetched this run.
            if key in fetched_keys:
                merged[key] = ex
            continue

        start_raw = ex.get("startDate") or ""
        try:
            start_dt = datetime.strptime(start_raw[:10], "%Y-%m-%d")
            keep = start_dt >= cutoff or ex.get("status") in ("active", "pending")
        except ValueError:
            keep = ex.get("status") in ("active", "pending")
        if keep:
            merged[key] = ex

    return list(merged.values())


def sort_strikes(strikes: list) -> list:
    status_rank = {"active": 0, "pending": 1, "resolved": 2}
    return sorted(
        strikes,
        key=lambda s: (
            status_rank.get(s.get("status", "resolved"), 3),
            -(s.get("workers") or 0),
            s.get("startDate") or "",
        ),
        reverse=False,
    )


def summarize_verification(strikes: list) -> dict:
    summary = {"active_signal": 0, "resolved_signal": 0, "stale_signal": 0, "unverified": 0}
    for s in strikes:
        v = s.get("verificationStatus")
        if v in summary:
            summary[v] += 1
    return summary


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("[Strikes] -- Healthcare Strike Feed --------------------------------")
    fetched = []

    ilr = fetch_cornell_ilr()
    fetched.extend(ilr)

    aflcio = fetch_aflcio()
    fetched.extend(aflcio)

    nurse_org = fetch_nurse_org()
    fetched.extend(nurse_org)

    union_rss = fetch_union_rss()
    fetched.extend(union_rss)

    google_news = fetch_google_news_rss()
    fetched.extend(google_news)

    print(f"[Strikes] Fetched {len(fetched)} records across live sources")

    existing = load_existing()
    merged = merge_strikes(fetched, existing)
    verified = apply_verification_rules(merged)
    consolidated = consolidate_events(verified)
    all_strikes = sort_strikes(consolidated)

    active = sum(1 for s in all_strikes if s.get("status") == "active")
    pending = sum(1 for s in all_strikes if s.get("status") == "pending")
    verification_summary = summarize_verification(all_strikes)

    output = {
        "lastUpdated": NOW_UTC.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "totalStrikes": len(all_strikes),
        "activeStrikes": active,
        "pendingStrikes": pending,
        "sources": [
            "cornell_ilr", "aflcio", "nurse_org",
            "nnu_rss", "nysna_rss", "massnurses_rss", "hpae_rss", "mnnurses_rss", "pasnap_rss", "seiu_rss",
            "google_news_nurse_strike", "google_news_healthcare_strike", "google_news_nurses_vote_strike",
            "curated",
        ],
        "sourceHealth": SOURCE_HEALTH,
        "verificationSummary": verification_summary,
        "strikes": all_strikes,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"[Strikes] Wrote {len(all_strikes)} strikes -> {OUTPUT_FILE}")
    print(f"[Strikes]   Active: {active} | Pending: {pending} | Resolved: {len(all_strikes) - active - pending}")
    print(f"[Strikes]   Verification: {verification_summary}")


if __name__ == "__main__":
    main()
