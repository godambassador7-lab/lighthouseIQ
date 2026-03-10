# News Feed Operations

## Weekly QA Loop

Run this every Monday:

1. Open `public/data/news-quality.json`.
2. Review failed checks and source staleness.
3. Spot-check top 20 headlines for relevance quality.
4. Review `public/data/state-news.json` filtering stats (`filtering.summary`).
5. Update source list in `scripts/data/news-source-catalog.json` and in private `core` `export-news.js` as needed.

## Quality Gates

- `npm run news:quality` writes `public/data/news-quality.json`.
- `npm run news:quality:strict` fails if thresholds are not met.

## US-Only Primary Source Pipeline

- Source manifest: `scripts/data/us-health-news-sources.json`
- Supplemental fetch: `npm run news:fetch:us`
- Merge order in pipeline:
  1. private core `export-news.js`
  2. `fetch-us-health-news.js` (US primary sources)
  3. `merge-news.js` (dedupe + retention + telemetry)

Notes:
- Keep this feed US-only. Do not add international sources to this manifest.
- Keep SEC user-agent/contact set in workflow env.

## Source Expansion Plan (Private Core)

Implement in `lighthouse-core` `export-news.js`:

- Add source classes from `scripts/data/news-source-catalog.json`.
- Track per-source fetch health:
  - last success
  - latest article date
  - article count
  - error rate
- Emit `sourceHealth` and `categoryCoverage` in `news.json`.

## Topic Buckets

Use these canonical categories:

- `closures_layoffs`
- `mergers_mna`
- `labor_unions`
- `policy_reimbursement`
- `quality_safety`
- `capacity_expansion`
- `ai_tech`
- `general_market`
