#!/usr/bin/env node
/*
  Fetches state hospital rankings from:
  - Newsweek rankings dataset embedded in page HTML (primary)
  - U.S. News (best-effort parser, optional supplemental)

  Output:
  - public/data/hospital-rankings.json
*/

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'hospital-rankings.json');
const FETCH_TIMEOUT_MS = 30000;
const NEWSWEEK_YEAR = process.env.NEWSWEEK_RANKINGS_YEAR || '2026';
const NEWSWEEK_SEED_STATE = process.env.NEWSWEEK_SEED_STATE || 'florida';

const STATES = {
  AL: 'alabama', AK: 'alaska', AZ: 'arizona', AR: 'arkansas', CA: 'california',
  CO: 'colorado', CT: 'connecticut', DE: 'delaware', DC: 'district-of-columbia', FL: 'florida',
  GA: 'georgia', HI: 'hawaii', ID: 'idaho', IL: 'illinois', IN: 'indiana',
  IA: 'iowa', KS: 'kansas', KY: 'kentucky', LA: 'louisiana', ME: 'maine',
  MD: 'maryland', MA: 'massachusetts', MI: 'michigan', MN: 'minnesota', MS: 'mississippi',
  MO: 'missouri', MT: 'montana', NE: 'nebraska', NV: 'nevada', NH: 'new-hampshire',
  NJ: 'new-jersey', NM: 'new-mexico', NY: 'new-york', NC: 'north-carolina', ND: 'north-dakota',
  OH: 'ohio', OK: 'oklahoma', OR: 'oregon', PA: 'pennsylvania', PR: 'puerto-rico',
  RI: 'rhode-island', SC: 'south-carolina', SD: 'south-dakota', TN: 'tennessee', TX: 'texas',
  UT: 'utah', VT: 'vermont', VA: 'virginia', WA: 'washington', WV: 'west-virginia',
  WI: 'wisconsin', WY: 'wyoming'
};

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington, D.C.', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming'
};

const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LighthouseIQHospitalRankings/1.1)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseNewsweekRows(html) {
  const marker = '\\"articleTable\\":{\\"rows\\":';
  const markerIdx = html.indexOf(marker);
  if (markerIdx < 0) return [];

  const start = markerIdx + marker.length;
  let depth = 0;
  let end = -1;
  for (let i = start; i < html.length; i += 1) {
    if (html[i] === '[') depth += 1;
    if (html[i] === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) return [];

  let rows;
  try {
    const escaped = html.slice(start, end);
    const unescaped = escaped
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    rows = JSON.parse(unescaped);
  } catch {
    return [];
  }
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    if (!Array.isArray(row) || row.length < 4) return null;
    const rank = Number(row[0]);
    if (Number.isNaN(rank)) return null;

    const linkAndName = normalize(row[1]);
    const sep = linkAndName.indexOf('||');
    const website = sep >= 0 ? normalize(linkAndName.slice(0, sep)) : '';
    const name = sep >= 0 ? normalize(linkAndName.slice(sep + 2)) : linkAndName;

    return {
      rank,
      name,
      city: normalize(row[2]),
      state: normalize(row[3]),
      website
    };
  }).filter((row) => row && row.name);
}

function parseUsNewsSimpleList(html) {
  const matches = [...html.matchAll(/<a[^>]*>\s*([^<]{4,120}?(?:Hospital|Medical Center|Health|Clinic))\s*<\/a>/gi)];
  const out = [];
  const seen = new Set();
  for (const m of matches) {
    const name = normalize(m[1]);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
    if (out.length >= 25) break;
  }
  return out.map((name, idx) => ({ rank: idx + 1, name }));
}

function toRankingRows(rows, sourceUrl, sourceLabel) {
  return rows.map((row) => ({
    name: row.name,
    system: '',
    metro: row.city || '',
    baseScore: Math.max(60, 101 - row.rank),
    warnWeight: 1,
    match: row.name.toLowerCase(),
    sources: [{
      name: sourceLabel,
      url: row.website || sourceUrl
    }]
  }));
}

async function fetchNewsweekAllRows() {
  const seedUrl = `https://rankings.newsweek.com/americas-best-state-hospitals-${NEWSWEEK_YEAR}/${NEWSWEEK_SEED_STATE}`;
  const html = await fetchText(seedUrl);
  return { rows: parseNewsweekRows(html), sourceUrl: seedUrl };
}

async function fetchUsNewsState(stateSlug) {
  const url = `https://health.usnews.com/best-hospitals/area/${stateSlug}`;
  const html = await fetchText(url);
  return { rows: parseUsNewsSimpleList(html), url };
}

async function main() {
  const output = {
    lastUpdated: new Date().toISOString(),
    version: '1.1.0',
    sources: {
      newsweek: `https://rankings.newsweek.com/americas-best-state-hospitals-${NEWSWEEK_YEAR}/<state-slug>`,
      usnews: 'https://health.usnews.com/best-hospitals/area/<state-slug>'
    },
    states: {}
  };

  let newsweekRows = [];
  let newsweekSourceUrl = output.sources.newsweek;
  let newsweekSeedError = null;
  try {
    const fetched = await fetchNewsweekAllRows();
    newsweekRows = fetched.rows;
    newsweekSourceUrl = fetched.sourceUrl;
  } catch (err) {
    newsweekSeedError = err.message;
  }

  for (const [abbr, slug] of Object.entries(STATES)) {
    const stateName = STATE_NAMES[abbr] || '';
    const statePayload = {
      hospitalRankings: [],
      sourceSummary: {
        newsweekCount: 0,
        usnewsCount: 0
      }
    };

    if (newsweekSeedError) {
      statePayload.sourceSummary.newsweekError = newsweekSeedError;
    } else {
      const newsweekStateRows = newsweekRows
        .filter((row) => normalize(row.state).toLowerCase() === normalize(stateName).toLowerCase())
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 50);
      statePayload.sourceSummary.newsweekCount = newsweekStateRows.length;
      if (!newsweekStateRows.length) {
        statePayload.sourceSummary.newsweekError = 'No rows parsed for state';
      } else {
        statePayload.hospitalRankings.push(
          ...toRankingRows(newsweekStateRows, newsweekSourceUrl, `Newsweek Best Hospitals ${NEWSWEEK_YEAR}`)
        );
      }
    }

    try {
      const usnews = await fetchUsNewsState(slug);
      statePayload.sourceSummary.usnewsCount = usnews.rows.length;
      const existing = new Set(statePayload.hospitalRankings.map((row) => row.name.toLowerCase()));
      const deduped = usnews.rows.filter((row) => !existing.has(row.name.toLowerCase()));
      statePayload.hospitalRankings.push(...toRankingRows(deduped, usnews.url, 'U.S. News Best Hospitals by State'));
    } catch (err) {
      statePayload.sourceSummary.usnewsError = err.message;
    }

    output.states[abbr] = statePayload;
    console.log(`${abbr}: rankings=${statePayload.hospitalRankings.length}`);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Failed to fetch hospital rankings:', err);
  process.exit(1);
});
