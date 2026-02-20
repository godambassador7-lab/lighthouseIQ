#!/usr/bin/env python3
"""
Send Lightworker email alerts.

Reads the Lightworker Pool from Firebase Firestore, compares new WARN notices
(since the last run) against each contact's home state, and sends email alerts
via Gmail SMTP for any matches.

Required environment variables:
  FIREBASE_SERVICE_ACCOUNT_JSON  — full contents of the service account JSON file
  ALERT_EMAIL_USER               — Gmail address to send from
  ALERT_EMAIL_PASS               — Gmail App Password (16 chars)

Gracefully skips (exit 0) if any credentials are missing so CI never breaks
due to missing secrets.
"""

import json
import os
import smtplib
import ssl
import sys
from datetime import date, datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
NOTICES_FILE = Path("public/data/notices.json")

# ---------------------------------------------------------------------------
# Credential check — skip gracefully if not configured
# ---------------------------------------------------------------------------
FIREBASE_SA_JSON = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
EMAIL_USER = os.environ.get("ALERT_EMAIL_USER", "").strip()
EMAIL_PASS = os.environ.get("ALERT_EMAIL_PASS", "").strip()

if not FIREBASE_SA_JSON or not EMAIL_USER or not EMAIL_PASS:
    print("Warning: Lightworker credentials not configured. Skipping alert run.")
    sys.exit(0)

# ---------------------------------------------------------------------------
# Firebase Admin SDK
# ---------------------------------------------------------------------------
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("Warning: firebase-admin not installed. Skipping alert run.")
    sys.exit(0)

try:
    sa_dict = json.loads(FIREBASE_SA_JSON)
    cred = credentials.Certificate(sa_dict)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as exc:
    print(f"Warning: Firebase init failed ({exc}). Skipping alert run.")
    sys.exit(0)


# ---------------------------------------------------------------------------
# Load last-processed date from Firestore
# ---------------------------------------------------------------------------
def get_last_processed_date() -> date:
    try:
        doc = db.collection("lightworker_meta").document("last_run").get()
        if doc.exists:
            raw = doc.to_dict().get("lastProcessedDate", "")
            if raw:
                return date.fromisoformat(raw)
    except Exception as exc:
        print(f"Warning: Could not read last_run ({exc}). Using today minus 1 day.")
    # Default: yesterday — catches notices from the most recent run
    from datetime import timedelta
    return date.today() - timedelta(days=1)


def set_last_processed_date(d: date) -> None:
    try:
        db.collection("lightworker_meta").document("last_run").set(
            {"lastProcessedDate": d.isoformat()},
            merge=True,
        )
    except Exception as exc:
        print(f"Warning: Could not save last_run date ({exc}).")


# ---------------------------------------------------------------------------
# Load WARN notices
# ---------------------------------------------------------------------------
def load_new_notices(since: date) -> list[dict]:
    if not NOTICES_FILE.exists():
        print(f"Warning: {NOTICES_FILE} not found. Skipping.")
        return []
    with NOTICES_FILE.open() as f:
        all_notices = json.load(f)
    new = []
    for n in all_notices:
        raw_date = n.get("notice_date") or n.get("retrieved_at") or ""
        try:
            nd = date.fromisoformat(raw_date[:10])
        except (ValueError, TypeError):
            continue
        if nd > since:
            new.append(n)
    return new


# ---------------------------------------------------------------------------
# Load pool contacts from Firestore
# ---------------------------------------------------------------------------
def load_pool() -> list[dict]:
    try:
        docs = db.collection("lightworker_pool").stream()
        return [{"id": d.id, **d.to_dict()} for d in docs]
    except Exception as exc:
        print(f"Warning: Could not read lightworker_pool ({exc}). Skipping.")
        return []


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
EMAIL_SUBJECT = "LighthouseIQ Alert \u2014 New layoff notice in {state}"

EMAIL_HTML = """\
<html><body style="font-family:sans-serif;color:#1a365d;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1a365d;">LighthouseIQ \u26a1 Lightworker Alert</h2>
  <p>Hi {name},</p>
  <p>A new WARN notice was filed in your home state of <strong>{state}</strong>:</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
    <tr><td style="padding:8px 12px;background:#f0f4f8;font-weight:600;width:40%;">Employer</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">{employer}</td></tr>
    <tr><td style="padding:8px 12px;background:#f0f4f8;font-weight:600;">Location</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">{location}</td></tr>
    <tr><td style="padding:8px 12px;background:#f0f4f8;font-weight:600;">Employees Affected</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">{affected}</td></tr>
    <tr><td style="padding:8px 12px;background:#f0f4f8;font-weight:600;">Notice Date</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">{notice_date}</td></tr>
  </table>
  <p style="color:#4a5568;font-size:14px;">
    This is an automated alert from LighthouseIQ&rsquo;s Lightworker Pool.<br>
    You were added to this pool by a recruiter. Contact them to learn more about opportunities.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="color:#718096;font-size:12px;">&mdash; LighthouseIQ Lightworker Alerts</p>
</body></html>"""

EMAIL_TEXT = """\
LighthouseIQ Lightworker Alert

Hi {name},

A new WARN notice was filed in your home state of {state}:

Employer:           {employer}
Location:           {location}
Employees Affected: {affected}
Notice Date:        {notice_date}

This is an automated alert from LighthouseIQ's Lightworker Pool.
You were added to this pool by a recruiter. Contact them for more information.

-- LighthouseIQ Lightworker Alerts
"""


def send_email(to_email: str, to_name: str, notice: dict) -> bool:
    state = notice.get("state", "Unknown")
    employer = notice.get("employer_name", "Unknown employer")
    city = notice.get("city", "")
    location = f"{city}, {state}".strip(", ") if city else state
    affected = notice.get("employees_affected", "Unknown")
    notice_date = (notice.get("notice_date") or notice.get("retrieved_at") or "")[:10]

    subject = EMAIL_SUBJECT.format(state=state)
    html_body = EMAIL_HTML.format(
        name=to_name, state=state, employer=employer,
        location=location, affected=affected, notice_date=notice_date,
    )
    text_body = EMAIL_TEXT.format(
        name=to_name, state=state, employer=employer,
        location=location, affected=affected, notice_date=notice_date,
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"LighthouseIQ Alerts <{EMAIL_USER}>"
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())
        return True
    except Exception as exc:
        print(f"  ERROR sending to {to_email}: {exc}")
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    last_date = get_last_processed_date()
    print(f"Checking for WARN notices newer than {last_date} ...")

    new_notices = load_new_notices(since=last_date)
    if not new_notices:
        print("No new WARN notices found. Nothing to send.")
        set_last_processed_date(date.today())
        return 0

    print(f"Found {len(new_notices)} new notice(s).")
    pool = load_pool()
    if not pool:
        print("Lightworker Pool is empty. No emails to send.")
        set_last_processed_date(date.today())
        return 0

    print(f"Pool has {len(pool)} contact(s).")

    sent_count = 0
    for notice in new_notices:
        notice_state = notice.get("state", "")
        if not notice_state:
            continue
        matched = [c for c in pool if c.get("homeState") == notice_state]
        for contact in matched:
            name = contact.get("name", "there")
            email = contact.get("email", "")
            if not email:
                continue
            print(f"  Sending alert to {name} <{email}> for notice in {notice_state}...")
            if send_email(email, name, notice):
                sent_count += 1

    print(f"Done. Sent {sent_count} alert email(s).")
    set_last_processed_date(date.today())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
