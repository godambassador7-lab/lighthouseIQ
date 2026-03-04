#!/usr/bin/env python3
"""
Healthcare Strike Feed Aggregator
Fetches and normalizes healthcare labor action data from:
  - Cornell ILR Labor Action Tracker (primary)
  - Nurse.org strike list (secondary)
  - AFL-CIO Strike Map (tertiary)
  - Curated manual entries (always preserved)

Output: public/data/strikes.json
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
except ImportError:
    print('[Strikes] requests not installed — run: pip install requests')
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print('[Strikes] beautifulsoup4 not installed — HTML scraping disabled')

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
OUTPUT_DIR = os.environ.get('LNI_OUTPUT_DIR', 'public/data')
OUTPUT_FILE = Path(OUTPUT_DIR) / 'strikes.json'

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (compatible; LighthouseIQ/1.0; '
        'healthcare-intelligence-platform; +https://lighthouseiq.app)'
    ),
    'Accept': 'application/json, text/html, */*',
}
TIMEOUT = 20

# Healthcare NAICS prefixes (sector 62 = Health Care & Social Assistance)
HEALTHCARE_NAICS = ('62',)

# Keywords that indicate a healthcare employer/action
HEALTHCARE_KEYWORDS = [
    'hospital', 'health', 'medical', 'nurse', 'nursing', 'clinic', 'care',
    'kaiser', 'HCA', 'ascension', 'CommonSpirit', 'tenet', 'dignity',
    'providence', 'allina', 'mayo', 'intermountain', 'advocate', 'sutter',
    'montefiore', 'mount sinai', 'presbyterian', 'brigham', 'beth israel',
    'SEIU', 'NYSNA', 'CNA', 'NNU', 'NNOC', 'MNA', 'PASNAP', 'HPAE',
    'ONAC', 'ONA', 'WSNA', 'PNA', 'MASSNURSES',
    'RN', 'LPN', 'CNA', 'EMT', 'paramedic', 'pharmacy', 'therapist',
    'home health', 'hospice', 'skilled nursing', 'SNF', 'long-term care',
]

STATE_ABBREVS = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def is_healthcare(record: dict) -> bool:
    """Return True if this record is a healthcare labor action."""
    naics = str(record.get('naics') or record.get('naics_code') or '')
    if any(naics.startswith(n) for n in HEALTHCARE_NAICS):
        return True
    fields = ' '.join([
        str(record.get('employer') or record.get('employer_name') or ''),
        str(record.get('industry') or ''),
        str(record.get('union') or record.get('union_name') or ''),
        str(record.get('notes') or record.get('description') or ''),
        str(record.get('sector') or ''),
    ]).lower()
    return any(kw.lower() in fields for kw in HEALTHCARE_KEYWORDS)


def normalize_state(raw: str) -> str:
    if not raw:
        return ''
    raw = raw.strip()
    if len(raw) == 2:
        return raw.upper()
    return STATE_ABBREVS.get(raw.title(), raw[:2].upper())


def parse_workers(raw) -> int:
    if raw is None:
        return 0
    try:
        return int(str(raw).replace(',', '').strip())
    except (ValueError, TypeError):
        # Handle ranges like "1,000-2,000" → take lower bound
        m = re.search(r'[\d,]+', str(raw))
        return int(m.group().replace(',', '')) if m else 0


def infer_hc_type(employer: str, union: str, reason: str) -> str:
    combined = f'{employer} {union} {reason}'.lower()
    if any(k in combined for k in ['home health', 'home care', 'homecare', 'hospice']):
        return 'homecare'
    if any(k in combined for k in ['skilled nursing', 'snf', 'nursing home', 'long-term', 'ltc']):
        return 'nursing_home'
    if any(k in combined for k in ['clinic', 'outpatient', 'medical office', 'ambulatory']):
        return 'clinic'
    return 'hospital'


def make_id(source: str, employer: str, city: str, state: str, start: str) -> str:
    raw = f'{employer}{city}{state}{start}'.lower()
    h = hash(raw) & 0xFFFFFF
    return f'{source}-{h:06x}'


def normalize_record(raw: dict, source: str) -> dict:
    employer = (
        raw.get('employer') or raw.get('employer_name') or
        raw.get('Employer') or raw.get('company') or 'Unknown'
    ).strip()
    city = (
        raw.get('city') or raw.get('City') or
        raw.get('location_city') or raw.get('location') or ''
    ).strip()
    state = normalize_state(
        raw.get('state') or raw.get('State') or
        raw.get('location_state') or raw.get('stateAbbr') or ''
    )
    workers = parse_workers(
        raw.get('workers') or raw.get('num_workers') or
        raw.get('Workers') or raw.get('workers_involved') or
        raw.get('number_of_workers') or raw.get('approx_workers')
    )
    start = (
        raw.get('start_date') or raw.get('Start Date') or
        raw.get('date') or raw.get('action_date') or raw.get('begin_date') or ''
    )
    end = (
        raw.get('end_date') or raw.get('End Date') or
        raw.get('end') or raw.get('resolution_date') or None
    )
    status = str(raw.get('status') or ('resolved' if end else 'active')).lower()
    if status not in ('active', 'pending', 'resolved'):
        status = 'resolved' if end else 'active'

    union = (
        raw.get('union') or raw.get('Union') or
        raw.get('union_name') or raw.get('organizing_union') or ''
    ).strip()
    reason = (
        raw.get('reason') or raw.get('demands') or
        raw.get('Demands') or raw.get('issues') or raw.get('cause') or ''
    ).strip()
    action_type = str(
        raw.get('action_type') or raw.get('type') or raw.get('strike_type') or 'strike'
    ).lower().replace(' ', '_')

    hc_type = infer_hc_type(employer, union, reason)
    is_opp = workers >= 500 and status in ('active', 'pending')

    return {
        'id': make_id(source, employer, city, state, start),
        'employer': employer,
        'city': city,
        'state': state,
        'workers': workers,
        'union': union,
        'reason': reason,
        'actionType': action_type,
        'startDate': start,
        'endDate': end,
        'status': status,
        'source': source,
        'sourceUrl': (raw.get('source_url') or raw.get('url') or ''),
        'healthcareType': hc_type,
        'isTravelOpportunity': is_opp,
        'notes': (raw.get('notes') or raw.get('description') or ''),
    }


# ---------------------------------------------------------------------------
# Source: Cornell ILR Labor Action Tracker
# ---------------------------------------------------------------------------
CORNELL_ILR_TRIES = [
    # Paginated REST API (Django REST Framework style)
    'https://striketracker.ilr.cornell.edu/api/v1/actions/?format=json&page_size=500',
    'https://striketracker.ilr.cornell.edu/api/actions/?format=json&page_size=500',
    'https://striketracker.ilr.cornell.edu/api/lat/actions/?format=json',
    # Flat JSON exports
    'https://striketracker.ilr.cornell.edu/actions.json',
    'https://striketracker.ilr.cornell.edu/data/actions.json',
    'https://striketracker.ilr.cornell.edu/static/data/actions.json',
]


def fetch_cornell_ilr() -> list:
    for url in CORNELL_ILR_TRIES:
        try:
            print(f'[ILR] GET {url}')
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code != 200:
                print(f'[ILR]   → {r.status_code}')
                continue
            data = r.json()
            records = (
                data if isinstance(data, list)
                else data.get('results') or data.get('data') or data.get('actions') or []
            )
            if not records:
                print('[ILR]   → empty response')
                continue
            hc = [r for r in records if is_healthcare(r)]
            print(f'[ILR]   → {len(hc)} healthcare records from {len(records)} total')
            return [normalize_record(r, 'cornell_ilr') for r in hc]
        except Exception as exc:
            print(f'[ILR]   → error: {exc}')
    print('[ILR] All endpoints failed — skipping Cornell ILR')
    return []


# ---------------------------------------------------------------------------
# Source: AFL-CIO Strike Map
# ---------------------------------------------------------------------------
AFLCIO_TRIES = [
    'https://aflcio.org/api/1.0/strikes?_format=json',
    'https://aflcio.org/api/strikes?_format=json',
    'https://aflcio.org/strike-map/data',
]


def fetch_aflcio() -> list:
    for url in AFLCIO_TRIES:
        try:
            print(f'[AFL-CIO] GET {url}')
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code != 200:
                print(f'[AFL-CIO]   → {r.status_code}')
                continue
            data = r.json()
            records = data if isinstance(data, list) else data.get('data', [])
            if not records:
                continue
            hc = [r for r in records if is_healthcare(r)]
            print(f'[AFL-CIO]   → {len(hc)} healthcare records')
            return [normalize_record(r, 'aflcio') for r in hc]
        except Exception as exc:
            print(f'[AFL-CIO]   → error: {exc}')
    print('[AFL-CIO] All endpoints failed — skipping')
    return []


# ---------------------------------------------------------------------------
# Source: Nurse.org (HTML scrape)
# ---------------------------------------------------------------------------
NURSE_ORG_URL = 'https://nurse.org/articles/nurse-strikes-list/'


def fetch_nurse_org() -> list:
    if not HAS_BS4:
        print('[Nurse.org] Skipping — beautifulsoup4 not installed')
        return []
    try:
        print(f'[Nurse.org] GET {NURSE_ORG_URL}')
        r = requests.get(NURSE_ORG_URL, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            print(f'[Nurse.org]   → {r.status_code}')
            return []
        soup = BeautifulSoup(r.text, 'html.parser')
        results = []
        # Nurse.org typically publishes a list of <li> or table rows with strike info
        # Try to find structured strike entries
        for el in soup.select('table tr, .strike-entry, li'):
            text = el.get_text(' ', strip=True)
            if not text or len(text) < 20:
                continue
            # Look for state abbreviations and keywords
            state_m = re.search(r'\b([A-Z]{2})\b', text)
            workers_m = re.search(r'([\d,]+)\s*(?:nurses?|workers?|RNs?)', text, re.I)
            date_m = re.search(r'(\d{4}-\d{2}-\d{2}|\w+ \d+,?\s*\d{4})', text)
            if not state_m:
                continue
            raw = {
                'employer': el.get_text(' ', strip=True)[:80],
                'state': state_m.group(1),
                'workers': workers_m.group(1).replace(',', '') if workers_m else 0,
                'start_date': date_m.group(1) if date_m else '',
                'source_url': NURSE_ORG_URL,
            }
            if is_healthcare(raw):
                results.append(normalize_record(raw, 'nurse_org'))
        print(f'[Nurse.org]   → {len(results)} records parsed')
        return results
    except Exception as exc:
        print(f'[Nurse.org]   → error: {exc}')
        return []


# ---------------------------------------------------------------------------
# Merge & deduplication
# ---------------------------------------------------------------------------
def dedup_key(s: dict) -> str:
    """Canonical key for deduplication."""
    emp = re.sub(r'\s+', ' ', (s.get('employer') or '').lower().strip())
    state = (s.get('state') or '').upper()
    start = (s.get('startDate') or '')[:7]  # year-month
    return f'{emp}|{state}|{start}'


def load_existing() -> list:
    if not OUTPUT_FILE.exists():
        return []
    try:
        with open(OUTPUT_FILE) as f:
            return json.load(f).get('strikes', [])
    except Exception as exc:
        print(f'[Strikes] Could not read existing file: {exc}')
        return []


def merge_strikes(fetched: list, existing: list) -> list:
    """
    Merge strategy:
    - Start with all freshly fetched records
    - Add curated manual entries not already present (by dedup key)
    - Drop non-curated existing records older than 18 months with status=resolved
    """
    cutoff = datetime.utcnow() - timedelta(days=548)  # 18 months
    merged = {dedup_key(s): s for s in fetched}

    for ex in existing:
        key = dedup_key(ex)
        if key not in merged:
            # Keep curated entries regardless of age
            if ex.get('curated'):
                merged[key] = ex
            else:
                # Keep non-curated only if recent or active
                start_raw = ex.get('startDate') or ''
                try:
                    start_dt = datetime.strptime(start_raw[:10], '%Y-%m-%d')
                    keep = start_dt >= cutoff or ex.get('status') in ('active', 'pending')
                except ValueError:
                    keep = ex.get('status') in ('active', 'pending')
                if keep:
                    merged[key] = ex

    return list(merged.values())


def sort_strikes(strikes: list) -> list:
    status_rank = {'active': 0, 'pending': 1, 'resolved': 2}
    return sorted(
        strikes,
        key=lambda s: (
            status_rank.get(s.get('status', 'resolved'), 3),
            -(s.get('workers') or 0),
            s.get('startDate') or '',
        ),
        reverse=False,
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print('[Strikes] ── Healthcare Strike Feed ──────────────────────────────')

    # Fetch from all sources
    fetched = []

    ilr = fetch_cornell_ilr()
    fetched.extend(ilr)

    aflcio = fetch_aflcio()
    fetched.extend(aflcio)

    nurse_org = fetch_nurse_org()
    fetched.extend(nurse_org)

    print(f'[Strikes] Fetched {len(fetched)} records across all sources')

    # Load and merge with existing (preserves curated entries)
    existing = load_existing()
    all_strikes = sort_strikes(merge_strikes(fetched, existing))

    active = sum(1 for s in all_strikes if s.get('status') == 'active')
    pending = sum(1 for s in all_strikes if s.get('status') == 'pending')

    output = {
        'lastUpdated': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        'totalStrikes': len(all_strikes),
        'activeStrikes': active,
        'pendingStrikes': pending,
        'sources': ['cornell_ilr', 'aflcio', 'nurse_org', 'curated'],
        'strikes': all_strikes,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)

    print(f'[Strikes] ✓ Wrote {len(all_strikes)} strikes → {OUTPUT_FILE}')
    print(f'[Strikes]   Active: {active} | Pending: {pending} | Resolved: {len(all_strikes) - active - pending}')


if __name__ == '__main__':
    main()
