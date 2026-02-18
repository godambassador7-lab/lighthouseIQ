#!/usr/bin/env python3
"""Update target-state metro labor override values from latest BLS metro release table.

Updates the TARGET_STATE_MONTHLY_LABOR_OVERRIDES block in:
- apps/web/app-static.js
- public/app.js
"""

from __future__ import annotations

import html
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


BLS_METRO_TABLE_URL = "https://www.bls.gov/news.release/metro.t01.htm"

FILES_TO_UPDATE = [
    Path("apps/web/app-static.js"),
    Path("public/app.js"),
]

# label -> BLS metro row prefix
LABEL_TO_METRO = {
    "Indianapolis-Carmel-Anderson unemployment (latest)": "Indianapolis-Carmel-Anderson",
    "Fort Wayne unemployment (latest)": "Fort Wayne",
    "Evansville unemployment (latest)": "Evansville",
    "South Bend-Mishawaka unemployment (latest)": "South Bend-Mishawaka",
    "Louisville/Jefferson County unemployment (latest)": "Louisville/Jefferson County",
    "Lexington-Fayette unemployment (latest)": "Lexington-Fayette",
    "Bowling Green unemployment (latest)": "Bowling Green",
    "Owensboro unemployment (latest)": "Owensboro",
    "Cincinnati (Northern KY market) unemployment (latest)": "Cincinnati",
    "Miami-Fort Lauderdale-West Palm Beach unemployment (latest)": "Miami-Fort Lauderdale-West Palm Beach",
    "Tampa-St. Petersburg-Clearwater unemployment (latest)": "Tampa-St. Petersburg-Clearwater",
    "Orlando-Kissimmee-Sanford unemployment (latest)": "Orlando-Kissimmee-Sanford",
    "Jacksonville unemployment (latest)": "Jacksonville",
    "Chicago-Naperville-Elgin unemployment (latest)": "Chicago-Naperville-Elgin",
    "Springfield unemployment (latest)": "Springfield",
    "Peoria unemployment (latest)": "Peoria",
    "Detroit-Warren-Dearborn unemployment (latest)": "Detroit-Warren-Dearborn",
    "Grand Rapids-Wyoming-Kentwood unemployment (latest)": "Grand Rapids-Wyoming-Kentwood",
    "Ann Arbor unemployment (latest)": "Ann Arbor",
    "New York-Newark-Jersey City unemployment (latest)": "New York-Newark-Jersey City",
    "Buffalo-Cheektowaga unemployment (latest)": "Buffalo-Cheektowaga",
    "Rochester unemployment (latest)": "Rochester",
    "Houston-Pasadena-The Woodlands unemployment (latest)": "Houston-Pasadena-The Woodlands",
    "Dallas-Fort Worth-Arlington unemployment (latest)": "Dallas-Fort Worth-Arlington",
    "Austin-Round Rock-San Marcos unemployment (latest)": "Austin-Round Rock-San Marcos",
    "San Antonio-New Braunfels unemployment (latest)": "San Antonio-New Braunfels",
}

MONTH_LABEL_RE = re.compile(
    r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}"
)


def fetch_table_lines() -> list[str]:
    with urllib.request.urlopen(BLS_METRO_TABLE_URL, timeout=30) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    # Convert HTML to roughly line-based plain text.
    text = html.unescape(raw)
    text = re.sub(r"<[^>]+>", "\n", text)
    lines = []
    for line in text.splitlines():
        clean = re.sub(r"\s+", " ", line).strip()
        if clean:
            lines.append(clean)
    return lines


def extract_latest_and_baseline_rates(lines: list[str], metro_prefix: str) -> tuple[str, str]:
    """Return (latest_rate, baseline_rate)."""
    needle = metro_prefix.lower()
    for idx, line in enumerate(lines):
        if not line.lower().startswith(needle):
            continue
        candidate = line[len(metro_prefix) :].strip()
        if len(re.findall(r"\d+\.\d", candidate)) < 4 and idx + 1 < len(lines):
            candidate = lines[idx + 1]
        rates = re.findall(r"\d+\.\d", candidate)
        if len(rates) >= 4:
            # The row tail contains paired prior/current-year monthly rates.
            # Use the last pair so this keeps working as new monthly releases land.
            baseline_rate = rates[-2]
            latest_rate = rates[-1]
            return latest_rate, baseline_rate
    raise ValueError(f"Could not find metro row for '{metro_prefix}'")


def get_latest_month_pair(lines: list[str]) -> tuple[str, str]:
    tokens: list[str] = []
    seen = set()
    for match in MONTH_LABEL_RE.finditer(" ".join(lines)):
        token = match.group(0)
        if token in seen:
            continue
        seen.add(token)
        tokens.append(token)
    if len(tokens) < 2:
        raise ValueError("Could not determine latest month labels from BLS metro table")
    return tokens[-2], tokens[-1]


def update_file(path: Path, values: dict[str, str], as_of: str) -> None:
    text = path.read_text(encoding="utf-8")
    start = text.find("const TARGET_STATE_MONTHLY_LABOR_OVERRIDES = {")
    end = text.find("const TARGET_STATE_MONTHLY_LABOR_SOURCES = [")
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"Could not find override block in {path}")

    block = text[start:end]
    block = re.sub(r"updatedAt: '\d{4}-\d{2}-\d{2}'", f"updatedAt: '{as_of}'", block)

    for label, value in values.items():
        pattern = r"(\{ label: '" + re.escape(label) + r"', value: ')([^']*)(')"
        block, count = re.subn(pattern, r"\1" + value + r"\3", block, count=1)
        if count != 1:
            raise ValueError(f"Missing label '{label}' in {path}")

    path.write_text(text[:start] + block + text[end:], encoding="utf-8")


def main() -> int:
    lines = fetch_table_lines()
    baseline_label_full, _latest_label_full = get_latest_month_pair(lines)
    baseline_label = f"{baseline_label_full.split()[0][:3]} {baseline_label_full.split()[1]}"

    values: dict[str, str] = {}
    for label, metro_prefix in LABEL_TO_METRO.items():
        latest_rate, baseline_rate = extract_latest_and_baseline_rates(lines, metro_prefix)
        values[label] = f"{latest_rate}% ({baseline_label}: {baseline_rate}%)"

    as_of = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for file_path in FILES_TO_UPDATE:
        update_file(file_path, values, as_of)
        print(f"Updated {file_path}")

    print(f"Updated {len(values)} metro rows from {BLS_METRO_TABLE_URL}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
