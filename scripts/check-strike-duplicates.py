#!/usr/bin/env python3
"""
Audit duplicate strike records from public/data/strikes.json.

Usage:
  python scripts/check-strike-duplicates.py
  python scripts/check-strike-duplicates.py public/data/strikes.json
"""

import json
import re
import sys
from pathlib import Path


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def normalize_employer(name: str) -> str:
    text = clean(name).lower()
    text = re.sub(r"[^\w\s]", " ", text)
    stop = {
        "hospital", "medical", "center", "health", "healthcare", "system",
        "workers", "worker", "nurses", "nurse", "the", "of", "and", "for",
    }
    tokens = [t for t in text.split() if t and t not in stop]
    return " ".join(tokens[:6]) if tokens else text


def event_month(value: str) -> str:
    date = clean(value)[:10]
    if re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        return date[:7]
    return "unknown"


def canonical_key(row: dict) -> str:
    employer_key = normalize_employer(row.get("employer", ""))
    state = (row.get("state") or "").upper() or "NA"
    month = event_month(row.get("startDate") or "")
    action = (row.get("actionType") or "strike").lower()
    return f"{employer_key}|{state}|{month}|{action}"


def exact_key(row: dict) -> str:
    employer_key = normalize_employer(row.get("employer", ""))
    state = (row.get("state") or "").upper() or "NA"
    city = clean(row.get("city") or "").upper() or "STATEWIDE"
    start_day = clean(row.get("startDate") or "")[:10] or "unknown"
    action = (row.get("actionType") or "strike").lower()
    source = (row.get("source") or "").lower()
    source_url = clean(row.get("sourceUrl") or "").lower()
    return f"{source}|{employer_key}|{state}|{city}|{start_day}|{action}|{source_url}"


def summarize_groups(rows, key_fn):
    grouped = {}
    for row in rows:
        key = key_fn(row)
        grouped.setdefault(key, []).append(row)
    dup_groups = [items for items in grouped.values() if len(items) > 1]
    dup_groups.sort(key=len, reverse=True)
    samples = []
    for items in dup_groups[:12]:
        top = items[0]
        sources = sorted({row.get("source") for row in items if row.get("source")})
        samples.append({
            "employer": top.get("employer") or "Unknown",
            "state": top.get("state") or "",
            "city": top.get("city") or "",
            "startDate": top.get("startDate") or "",
            "actionType": top.get("actionType") or "strike",
            "recordsInGroup": len(items),
            "sources": sources,
        })
    return {
        "groupCount": len(dup_groups),
        "extraRecordCount": sum(max(0, len(items) - 1) for items in dup_groups),
        "samples": samples,
    }


def main():
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public/data/strikes.json")
    if not input_path.exists():
        print(f"[dup-check] file not found: {input_path}")
        sys.exit(1)

    data = json.loads(input_path.read_text(encoding="utf-8"))
    rows = data.get("strikes", [])
    if not isinstance(rows, list):
        print("[dup-check] invalid strikes payload")
        sys.exit(1)

    exact = summarize_groups(rows, exact_key)
    canonical = summarize_groups(rows, canonical_key)
    summary = {
        "inputFile": str(input_path),
        "records": len(rows),
        "exact": exact,
        "canonical": canonical,
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
