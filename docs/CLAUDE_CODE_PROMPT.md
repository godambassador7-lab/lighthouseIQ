# Claude Code Prompt: Build Lighthouse Nursing Intelligence

You are Claude Code working inside this repository. Your job is to turn this scaffold into a working MVP that:

## Goal
Build a production-ready pipeline that ingests NEW WARN notices (near-real-time polling) and surfaces those likely to impact nurses, by state.

## What exists
- packages/core: normalized types + a simple nursing relevance scoring function (scoreNotice)
- packages/adapters: adapter interface + 3 sample state adapters (IN, NY, OR) that are scaffolds
- apps/worker: runs adapters and upserts into Postgres
- apps/api: exposes /notices and /states from Postgres
- docker-compose.yml: Postgres
- docs/schema.sql + scripts/init_db.sh

## Your tasks (DO THEM IN ORDER)

### 1) Confirm + implement real scraping for at least 3 states
Implement working adapters for:
- Indiana (table on official site)
- Oregon (prefer structured open-data JSON if available; otherwise parse official page)
- New York (discover JSON endpoint behind dashboard/table; avoid brittle HTML scraping if possible)

Requirements for each adapter:
- Must return normalized notices using NormalizedWarnNotice
- Must provide stable IDs (hash recommended). Include source.sourceId when available.
- Must parse: employerName, city/county/address when available, noticeDate, effectiveDate, employeesAffected, NAICS/industry when available, and attachment links.
- Must extract rawText when the notice is a PDF (pull PDF and extract text) or when the page has a detail section.
- Must be resilient to minor markup changes (prefer JSON endpoints / downloads when possible).

### 2) Add more adapters as easy wins
Add 5 more states that provide straightforward CSV/HTML tables. Keep each adapter in packages/adapters/src/state/<state>.ts.

### 3) Implement change detection + polling
Create a simple change detection layer:
- Store last-seen IDs/hashes in Postgres (new table warn_ingest_state) or in a local cache file for dev.
- Worker should only upsert new/changed records.

### 4) Improve nursing scoring
Upgrade scoreNotice signals:
- Use NAICS rules: 622 = hospitals, 623 = nursing & residential, 621 = ambulatory; weight accordingly.
- Add facility matching hooks: if employer/location matches a CMS facility record, boost score.
- Expand keyword list and support phrase matching.

### 5) API improvements
Enhance apps/api:
- /notices supports filters: state, since, until, q (full-text on employer/rawText), minAffected, minScore, label, limit, offset
- Add /notice/:id endpoint
- Add basic input validation + safe SQL

### 6) Minimal UI (optional but preferred)
Add a tiny Next.js or Vite React app that shows:
- states with counts
- a searchable list of notices

## Non-negotiable requirements
- Do not break the existing workspace structure.
- Add unit tests for core scoring and for one adapter parser.
- Keep secrets out of repo; use .env.example.
- All code must run on Node 20+.

## Running instructions you must ensure work
- docker compose up -d
- export DATABASE_URL=postgres://nlr:nlr@localhost:5432/nlr
- npm install
- npm run build
- ./scripts/init_db.sh
- node apps/worker/dist/index.js
- node apps/api/dist/index.js

## Notes on sources
WARN is not centralized federally. Each state publishes in different formats. Prefer official state sites; optionally add an aggregator as a paid vendor later.

When done, update README.md with the exact states implemented and any state-specific caveats.
