# Nursing Layoff Radar (LighthouseIQ)

A public UI for tracking WARN Act layoff notices in the healthcare/nursing sector across all US states.

## Public/Private Split

This repository contains the public UI only. All data collection, scoring, enrichment, and backend mechanics
live in the private core repository and run in GitHub Actions.

- Public UI (this repo): `apps/web/`, `public/`
- Private core (separate repo): adapters, scoring, exports, API

The workflow in this repo checks out the private core to generate JSON into `public/data`.

## Live Demo

Visit: `https://<username>.github.io/nursing-layoff-radar/`

Default passcode: `IUH126`

## How It Works

```
+--------------------------------------------------------------------------+
¦                 GitHub Actions (Every 6 Hours)                           ¦
¦                                                                          ¦
¦  1. Checks out private lighthouse-core                                   ¦
¦  2. Fetches WARN notices and enriches data                               ¦
¦  3. Writes JSON to public/data/                                          ¦
¦  4. Deploys to GitHub Pages / triggers Vercel                            ¦
+--------------------------------------------------------------------------+
                              ¦
                              ?
+--------------------------------------------------------------------------+
¦                        Static Host (Pages/Vercel)                         ¦
¦                                                                          ¦
¦  Static JSON API:                                                        ¦
¦  - /data/notices.json      (all notices)                                 ¦
¦  - /data/states.json       (state counts)                                ¦
¦  - /data/metadata.json     (last update)                                 ¦
¦  - /data/by-state/XX.json  (per-state)                                   ¦
+--------------------------------------------------------------------------+
                              ¦
                              ?
+--------------------------------------------------------------------------+
¦                      Static Frontend                                     ¦
¦                                                                          ¦
¦  - Client-side filtering and search                                      ¦
¦  - Interactive US map with layoff intensity                              ¦
¦  - Project management (localStorage)                                     ¦
¦  - CSV/JSON export                                                       ¦
+--------------------------------------------------------------------------+
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

1. Go to **Settings** ? **Pages**
2. Source: **GitHub Actions**

### 3. Trigger First Build

1. Go to **Actions** ? **Fetch WARN Notices**
2. Click **Run workflow**

### 4. Access Your Dashboard

```
https://<your-username>.github.io/nursing-layoff-radar/
```

## Local Development

The public repo is UI-only. To run data exports locally, use the private
`lighthouse-core` repo.

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
+-- .github/workflows/      # GitHub Actions
¦   +-- fetch-notices.yml   # Scheduled data fetch (uses lighthouse-core)
+-- apps/web/               # Frontend
¦   +-- index.html
¦   +-- app-static.js       # Static JSON client
¦   +-- styles.css
+-- public/                 # Pages/Vercel output
¦   +-- data/               # Generated JSON
+-- README.md
```

## Manual Data Refresh

1. Go to **Actions** tab
2. Select **Fetch WARN Notices**
3. Click **Run workflow**

## License

All rights reserved.
