#!/usr/bin/env node
/*
  Fetches and normalizes state hospital rankings from public sources.
  Primary:
  - Newsweek/Statista Best-in-State list
  - U.S. News state list (best-effort parser)
  Optional local overlays (free/public-derived):
  - Healthgrades / Leapfrog / CMS crosswalk fields via overrides JSON

  Output:
  - public/data/hospital-rankings.json
*/

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'hospital-rankings.json');
const OVERRIDES_PATH = path.join(__dirname, 'data', 'hospital-rankings-overrides.json');
const LEGACY_OVERRIDES_PATH = path.join(__dirname, '..', 'public', 'data', 'hospital-rankings-overrides.json');
const FETCH_TIMEOUT_MS = 30000;
const NEWSWEEK_YEAR = process.env.NEWSWEEK_RANKINGS_YEAR || '2026';
const NEWSWEEK_SEED_STATE = process.env.NEWSWEEK_SEED_STATE || 'florida';
const REFRESH_EVERY_DAYS = Number(process.env.HOSPITAL_RANKINGS_REFRESH_DAYS || 30);
const VERSION = '1.2.0';

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
const normalizeKey = (value) => normalize(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const SCORE_WEIGHTS = {
  usnews: 0.45,
  newsweek: 0.35,
  healthgrades: 0.12,
  leapfrog: 0.08
};

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LightkeeperHealthIQHospitalRankings/1.1)',
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

function loadOverrides() {
  try {
    const sourcePath = fs.existsSync(OVERRIDES_PATH)
      ? OVERRIDES_PATH
      : (fs.existsSync(LEGACY_OVERRIDES_PATH) ? LEGACY_OVERRIDES_PATH : null);
    if (!sourcePath) return { states: {}, metadata: {} };
    const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    return {
      states: raw?.states && typeof raw.states === 'object' ? raw.states : {},
      metadata: {
        ...(raw?.metadata && typeof raw.metadata === 'object' ? raw.metadata : {}),
        sourcePath
      }
    };
  } catch {
    return { states: {}, metadata: {} };
  }
}

function rankToScore(rank) {
  if (!Number.isFinite(rank)) return null;
  return Math.max(60, 101 - Math.max(1, rank));
}

function leapfrogToScore(grade) {
  const g = String(grade || '').trim().toUpperCase();
  if (!g) return null;
  if (g === 'A') return 95;
  if (g === 'B') return 85;
  if (g === 'C') return 75;
  if (g === 'D') return 65;
  if (g === 'F') return 55;
  return null;
}

function deriveCompositeScore(sourceRanks = {}, sourceFlags = {}) {
  const parts = [];

  const usnewsScore = rankToScore(Number(sourceRanks.usnews));
  if (usnewsScore !== null) parts.push({ weight: SCORE_WEIGHTS.usnews, score: usnewsScore });

  const newsweekScore = rankToScore(Number(sourceRanks.newsweek));
  if (newsweekScore !== null) parts.push({ weight: SCORE_WEIGHTS.newsweek, score: newsweekScore });

  const healthgradesScore = sourceFlags.healthgradesTop250 ? 96 : sourceFlags.healthgradesTop5Pct ? 92 : null;
  if (healthgradesScore !== null) parts.push({ weight: SCORE_WEIGHTS.healthgrades, score: healthgradesScore });

  const leapfrogScore = leapfrogToScore(sourceFlags.leapfrogGrade);
  if (leapfrogScore !== null) parts.push({ weight: SCORE_WEIGHTS.leapfrog, score: leapfrogScore });

  if (!parts.length) return 60;
  const weighted = parts.reduce((sum, part) => sum + part.score * part.weight, 0);
  const weightTotal = parts.reduce((sum, part) => sum + part.weight, 0);
  return Math.round((weighted / Math.max(weightTotal, 0.0001)) * 10) / 10;
}

function upsertHospital(map, stateAbbr, row) {
  const key = normalizeKey(row.name);
  if (!key) return;
  const existing = map.get(key) || {
    name: row.name,
    system: '',
    metro: '',
    warnWeight: 1,
    match: key,
    sourceRanks: {},
    sourceFlags: {},
    sources: []
  };

  if (row.name && !existing.name) existing.name = row.name;
  if (row.metro && !existing.metro) existing.metro = row.metro;
  if (row.system && !existing.system) existing.system = row.system;
  if (Number.isFinite(row.beds) && row.beds > 0) existing.beds = row.beds;
  if (row.website && row.sourceLabel) {
    existing.sources.push({ name: row.sourceLabel, url: row.website });
  }
  if (Number.isFinite(row.newsweekRank)) existing.sourceRanks.newsweek = row.newsweekRank;
  if (Number.isFinite(row.usnewsRank)) existing.sourceRanks.usnews = row.usnewsRank;
  if (row.leapfrogGrade) existing.sourceFlags.leapfrogGrade = row.leapfrogGrade;
  if (row.healthgradesTop250) existing.sourceFlags.healthgradesTop250 = true;
  if (row.healthgradesTop5Pct) existing.sourceFlags.healthgradesTop5Pct = true;
  if (stateAbbr === 'DC' && !existing.metro) existing.metro = 'Washington';

  map.set(key, existing);
}

function uniqueSources(sources) {
  const seen = new Set();
  const out = [];
  for (const source of sources || []) {
    const name = normalize(source?.name);
    const url = normalize(source?.url);
    const key = `${name}|${url}`;
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push({ name, url });
  }
  return out;
}

function finalizeRows(map) {
  return Array.from(map.values())
    .map((row) => {
      const composite = deriveCompositeScore(row.sourceRanks, row.sourceFlags);
      return {
        name: row.name,
        system: row.system || '',
        metro: row.metro || '',
        compositeScore: composite,
        baseScore: composite,
        warnWeight: row.warnWeight ?? 1,
        match: row.match || normalizeKey(row.name),
        sourceRanks: row.sourceRanks || {},
        sourceFlags: row.sourceFlags || {},
        sourceCount: Object.keys(row.sourceRanks || {}).length + Object.keys(row.sourceFlags || {}).length,
        beds: Number.isFinite(row.beds) ? row.beds : undefined,
        sources: uniqueSources(row.sources)
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore || a.name.localeCompare(b.name))
    .slice(0, 60);
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
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + REFRESH_EVERY_DAYS * 24 * 60 * 60 * 1000);
  const overrides = loadOverrides();
  const output = {
    lastUpdated: now.toISOString(),
    version: VERSION,
    refreshPolicy: {
      updateEveryDays: REFRESH_EVERY_DAYS,
      nextRecommendedUpdate: nextRefresh.toISOString()
    },
    sources: {
      newsweek: `https://rankings.newsweek.com/americas-best-state-hospitals-${NEWSWEEK_YEAR}/<state-slug>`,
      usnews: 'https://health.usnews.com/best-hospitals/area/<state-slug>',
      healthgrades: 'https://www.healthgrades.com/quality/americas-best-hospitals',
      leapfrog: 'https://www.hospitalsafetygrade.org/',
      cmsProviderData: 'https://data.cms.gov/provider-data'
    },
    sourceWeights: SCORE_WEIGHTS,
    overlays: overrides.metadata || {},
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
    const stateMap = new Map();
    const statePayload = {
      hospitalRankings: [],
      sourceSummary: {
        newsweekCount: 0,
        usnewsCount: 0,
        healthgradesCount: 0,
        leapfrogCount: 0
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
        newsweekStateRows.forEach((row) => {
          upsertHospital(stateMap, abbr, {
            name: row.name,
            metro: row.city || '',
            newsweekRank: row.rank,
            sourceLabel: `Newsweek Best Hospitals ${NEWSWEEK_YEAR}`,
            website: row.website || newsweekSourceUrl
          });
        });
      }
    }

    try {
      const usnews = await fetchUsNewsState(slug);
      statePayload.sourceSummary.usnewsCount = usnews.rows.length;
      usnews.rows.forEach((row) => {
        upsertHospital(stateMap, abbr, {
          name: row.name,
          usnewsRank: row.rank,
          sourceLabel: 'U.S. News Best Hospitals by State',
          website: usnews.url
        });
      });
    } catch (err) {
      statePayload.sourceSummary.usnewsError = err.message;
    }

    const overrideRows = Array.isArray(overrides.states?.[abbr]) ? overrides.states[abbr] : [];
    overrideRows.forEach((row) => {
      const type = normalizeKey(row.sourceType || row.source || '');
      const payload = {
        name: row.name,
        metro: row.metro || '',
        system: row.system || '',
        beds: Number(row.beds),
        sourceLabel: row.sourceLabel || row.source || 'Hospital source override',
        website: row.url || ''
      };
      if (type.includes('healthgrades')) {
        payload.healthgradesTop250 = Boolean(row.healthgradesTop250 || row.top250 || row.topFivePercent);
        payload.healthgradesTop5Pct = Boolean(row.healthgradesTop5Pct || row.topFivePercent);
        statePayload.sourceSummary.healthgradesCount += 1;
      }
      if (type.includes('leapfrog')) {
        payload.leapfrogGrade = row.leapfrogGrade || row.grade || '';
        statePayload.sourceSummary.leapfrogCount += 1;
      }
      if (Number.isFinite(Number(row.usnewsRank))) payload.usnewsRank = Number(row.usnewsRank);
      if (Number.isFinite(Number(row.newsweekRank))) payload.newsweekRank = Number(row.newsweekRank);
      upsertHospital(stateMap, abbr, payload);
    });

    statePayload.hospitalRankings = finalizeRows(stateMap);
    statePayload.sourceSummary.compositeCount = statePayload.hospitalRankings.length;
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
