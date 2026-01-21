# Nursing Layoff Radar (LighthouseIQ)

A dashboard for tracking WARN Act layoff notices in the healthcare/nursing sector across all US states.

**100% Free & Serverless** - Runs entirely on GitHub Actions + GitHub Pages.

## Live Demo

Visit: `https://<username>.github.io/nursing-layoff-radar/`

Default passcode: `IUH126`

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Every 6 Hours)                │
│                                                                  │
│  1. Fetches WARN notices from 50+ state adapters                │
│  2. Scores notices for nursing relevance                        │
│  3. Writes JSON to public/data/                                  │
│  4. Deploys to GitHub Pages                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Pages                              │
│                                                                  │
│  Static JSON API:                                               │
│  - /data/notices.json      (all notices)                        │
│  - /data/states.json       (state counts)                       │
│  - /data/metadata.json     (last update)                        │
│  - /data/by-state/XX.json  (per-state)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Static Frontend                             │
│                                                                  │
│  - Client-side filtering and search                             │
│  - Interactive US map with layoff intensity                     │
│  - Project management (localStorage)                            │
│  - CSV/JSON export                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **50+ State Coverage** - WARN notices from all US states
- **Nursing Impact Scoring** - AI-scored relevance (0-100)
- **Interactive Map** - Visual layoff intensity by state
- **Multi-State Filtering** - Select multiple states
- **Project Management** - Organize notices into projects
- **Export** - Download as CSV or JSON
- **Auto-Refresh** - Data updated every 6 hours

## Quick Start

### 1. Fork This Repository

Click "Fork" on GitHub.

### 2. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **GitHub Actions**

### 3. Trigger First Build

1. Go to **Actions** → **Fetch WARN Notices**
2. Click **Run workflow**

### 4. Access Your Dashboard

```
https://<your-username>.github.io/nursing-layoff-radar/
```

## Local Development

```bash
# Install dependencies
npm install

# Build and export data
npm run export

# Serve locally
npm run serve
# Open http://localhost:3000
```

## Configuration

### Change Update Schedule

Edit `.github/workflows/fetch-notices.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours (default)
  - cron: '0 */12 * * *' # Every 12 hours
  - cron: '0 0 * * *'    # Daily at midnight
```

### Change Passcode

Edit `apps/web/app-static.js`:

```javascript
const PASSCODE = 'your-new-passcode';
```

## Project Structure

```
nursing-layoff-radar/
├── .github/workflows/      # GitHub Actions
│   └── fetch-notices.yml   # Scheduled data fetch
├── apps/web/               # Frontend
│   ├── index.html
│   ├── app-static.js       # Static JSON client
│   └── styles.css
├── packages/
│   ├── core/               # Types & scoring
│   └── adapters/           # State WARN fetchers
├── scripts/
│   └── export-notices.ts   # Data export script
├── public/                 # GitHub Pages output
│   └── data/               # Generated JSON
└── package.json
```

## State Adapters

Includes adapters for all 50 states + DC + PR:

| Region | States |
|--------|--------|
| Northeast | CT, ME, MA, NH, NJ, NY, PA, RI, VT |
| Midwest | IL, IN, IA, KS, MI, MN, MO, NE, ND, OH, SD, WI |
| South | AL, AR, DC, DE, FL, GA, KY, LA, MD, MS, NC, OK, SC, TN, TX, VA, WV |
| West | AK, AZ, CA, CO, HI, ID, MT, NM, NV, OR, UT, WA, WY |

## Manual Data Refresh

1. Go to **Actions** tab
2. Select **Fetch WARN Notices**
3. Click **Run workflow**

## License

MIT
