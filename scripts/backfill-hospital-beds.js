#!/usr/bin/env node
/*
  Backfills missing hospital bed counts into hospital-rankings-overrides.json
  using CMS/public API data.

  This script is intentionally defensive:
  - If source fetch fails, it exits 0 and emits a report with errors.
  - It only writes override rows when confidence passes thresholds.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const HOSPITAL_RANKINGS_PATH = path.join(DATA_DIR, 'hospital-rankings.json');
const OVERRIDES_PATH = path.join(ROOT, 'scripts', 'data', 'hospital-rankings-overrides.json');
const LEGACY_OVERRIDES_PATH = path.join(DATA_DIR, 'hospital-rankings-overrides.json');
const REPORT_PATH = path.join(DATA_DIR, 'bed-backfill-report.json');

const CMS_BEDS_API_URL = process.env.CMS_BEDS_API_URL
  || 'https://data.cms.gov/data-api/v1/dataset/44060663-47d8-4ced-a115-b53b4c270acb/data';
const CMS_BEDS_CSV_URL = process.env.CMS_BEDS_CSV_URL || '';
const FETCH_TIMEOUT_MS = Number(process.env.CMS_BEDS_FETCH_TIMEOUT_MS || 45000);
const MIN_CONFIDENCE = Number(process.env.CMS_BEDS_MIN_CONFIDENCE || 0.84);
const MIN_MEDIUM_CONFIDENCE = Number(process.env.CMS_BEDS_MIN_MEDIUM_CONFIDENCE || 0.76);
const MAX_MEDIUM_MATCHES_PER_STATE = Number(process.env.CMS_BEDS_MAX_MEDIUM_PER_STATE || 20);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const STOPWORDS = new Set([
  'hospital', 'hosp', 'medical', 'center', 'centre', 'health', 'healthcare', 'system',
  'regional', 'memorial', 'campus', 'the', 'of', 'and', 'inc', 'llc', 'corp', 'corporation',
  'company', 'co', 'saint', 'st', 'mt', 'mount'
]);

const reduceName = (value) => normalize(value)
  .split(' ')
  .filter((token) => token && !STOPWORDS.has(token))
  .join(' ')
  .trim();

const tokenize = (value) => reduceName(value).split(' ').filter(Boolean);

const toBeds = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

const pickFirst = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim()) {
      return row[key];
    }
  }
  return null;
};

const NAME_KEYS = [
  'hospital_name', 'provider_name', 'facility_name', 'name', 'org_name', 'organization_name'
];
const STATE_KEYS = ['state', 'state_code', 'provider_state', 'prvdr_state_cd'];
const CITY_KEYS = ['city', 'provider_city', 'hospital_city'];
const BED_KEYS = [
  'beds', 'bed_count', 'bed_cnt', 'number_of_beds', 'certified_beds', 'crtfd_bed_cnt',
  'staffed_beds', 'hospital_beds', 'total_beds'
];
const MIN_API_ROWS_WITH_BEDS_BEFORE_CSV_FALLBACK = Number(process.env.CMS_BEDS_MIN_API_ROWS || 10);

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json,text/plain,*/*',
        'User-Agent': 'LighthouseIQ-BedBackfill/1.0'
      }
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTextWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/csv,text/plain,*/*',
        'User-Agent': 'LighthouseIQ-BedBackfill/1.0'
      }
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeHeaderKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }
    if (ch !== '\r') field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvRowsToObjects(csvRows) {
  if (!csvRows.length) return [];
  const header = csvRows[0].map((h) => String(h || '').trim());
  const dataRows = csvRows.slice(1);
  return dataRows.map((cells) => {
    const obj = {};
    for (let i = 0; i < header.length; i += 1) {
      const rawKey = header[i];
      const value = cells[i] ?? '';
      obj[rawKey] = value;
      const normalizedKey = normalizeHeaderKey(rawKey);
      if (normalizedKey && obj[normalizedKey] === undefined) {
        obj[normalizedKey] = value;
      }
    }
    return obj;
  });
}

function deriveCsvUrlFromApi(apiUrl) {
  const match = String(apiUrl || '').match(/dataset\/([a-f0-9-]+)\/data/i);
  if (!match) return '';
  return `https://data.cms.gov/provider-data/dataset/${match[1]}/download?format=csv`;
}

async function fetchCmsRows(baseUrl) {
  const attempts = [
    baseUrl,
    `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}size=10000`,
    `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}offset=0&size=10000`,
    `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}$limit=10000`,
    `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}$offset=0&$limit=10000`
  ];

  const errors = [];
  for (const url of attempts) {
    try {
      const json = await fetchJsonWithTimeout(url);
      if (Array.isArray(json)) return { rows: json, usedUrl: url, errors };
      if (Array.isArray(json?.data)) return { rows: json.data, usedUrl: url, errors };
      if (Array.isArray(json?.results)) return { rows: json.results, usedUrl: url, errors };
      if (Array.isArray(json?.items)) return { rows: json.items, usedUrl: url, errors };
      errors.push(`Unexpected response shape from ${url}`);
    } catch (err) {
      errors.push(`${url}: ${err.message}`);
    }
  }
  return { rows: [], usedUrl: baseUrl, errors };
}

async function fetchCmsCsvRows(explicitUrl, apiUrl) {
  const derived = deriveCsvUrlFromApi(apiUrl);
  const attempts = [explicitUrl, derived].filter(Boolean);
  const errors = [];
  for (const url of attempts) {
    try {
      const text = await fetchTextWithTimeout(url);
      const parsed = parseCsv(text);
      const rows = csvRowsToObjects(parsed);
      if (rows.length) return { rows, usedUrl: url, errors };
      errors.push(`CSV had no rows from ${url}`);
    } catch (err) {
      errors.push(`${url}: ${err.message}`);
    }
  }
  return { rows: [], usedUrl: attempts[0] || '', errors };
}

function buildCmsIndex(rows, sourceLabel = 'cms_api') {
  const byState = new Map();
  rows.forEach((row) => {
    const name = pickFirst(row, NAME_KEYS);
    const state = String(pickFirst(row, STATE_KEYS) || '').toUpperCase().trim();
    const city = String(pickFirst(row, CITY_KEYS) || '').trim();
    const beds = toBeds(pickFirst(row, BED_KEYS));
    if (!name || !state || beds === null) return;

    const entry = {
      name: String(name).trim(),
      state,
      city,
      beds,
      source: sourceLabel,
      key: normalizeKey(name),
      reduced: reduceName(name),
      tokens: new Set(tokenize(name))
    };
    if (!byState.has(state)) byState.set(state, []);
    byState.get(state).push(entry);
  });
  return byState;
}

function scoreMatch(target, candidate) {
  if (!target.key || !candidate.key) return 0;
  if (target.key === candidate.key) return 1.0;
  if (target.reduced && candidate.reduced && target.reduced === candidate.reduced) return 0.98;
  if (candidate.key.includes(target.key) || target.key.includes(candidate.key)) return 0.9;

  const tTokens = target.tokens;
  const cTokens = candidate.tokens;
  if (!tTokens.size || !cTokens.size) return 0;

  let overlap = 0;
  for (const t of tTokens) if (cTokens.has(t)) overlap += 1;
  const union = new Set([...tTokens, ...cTokens]).size || 1;
  let score = overlap / union;

  if (target.metro && candidate.city) {
    const metro = normalize(target.metro);
    const city = normalize(candidate.city);
    if (metro && city && (metro.includes(city) || city.includes(metro))) {
      score += 0.06;
    }
  }

  return Math.min(0.97, score);
}

function findBestMatch(target, candidates) {
  let best = null;
  let bestScore = 0;
  for (const candidate of candidates) {
    const score = scoreMatch(target, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return { best, score: bestScore };
}

function loadOverrides() {
  const sourcePath = fs.existsSync(OVERRIDES_PATH)
    ? OVERRIDES_PATH
    : (fs.existsSync(LEGACY_OVERRIDES_PATH) ? LEGACY_OVERRIDES_PATH : OVERRIDES_PATH);
  if (!fs.existsSync(sourcePath)) {
    return {
      sourcePath,
      data: {
        metadata: {
          description: 'Optional public-source overlays merged into hospital rankings fetch output.',
          notes: ['Auto-generated/updated by scripts.'],
          fields: ['name', 'metro', 'system', 'beds', 'sourceType', 'sourceLabel', 'url']
        },
        states: {}
      }
    };
  }
  return { sourcePath, data: readJson(sourcePath) };
}

function upsertOverride(overrideData, state, row) {
  if (!overrideData.states || typeof overrideData.states !== 'object') {
    overrideData.states = {};
  }
  if (!Array.isArray(overrideData.states[state])) {
    overrideData.states[state] = [];
  }
  const list = overrideData.states[state];
  const key = normalizeKey(row.name);
  const existing = list.find((item) => normalizeKey(item?.name) === key);
  if (existing) {
    existing.beds = row.beds;
    existing.metro = row.metro || existing.metro || '';
    existing.system = row.system || existing.system || '';
    existing.sourceType = row.sourceType;
    existing.sourceLabel = row.sourceLabel;
    existing.url = row.url;
    existing.matchConfidence = row.matchConfidence;
    existing.cmsName = row.cmsName;
    existing.cmsCity = row.cmsCity;
    return false;
  }
  list.push(row);
  return true;
}

async function main() {
  if (!fs.existsSync(HOSPITAL_RANKINGS_PATH)) {
    throw new Error(`Missing ${HOSPITAL_RANKINGS_PATH}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    cmsBedsApiUrl: CMS_BEDS_API_URL,
    cmsBedsCsvUrl: CMS_BEDS_CSV_URL || deriveCsvUrlFromApi(CMS_BEDS_API_URL) || null,
    cmsUsedUrl: null,
    cmsCsvUsedUrl: null,
    sourceMode: 'api',
    summary: {
      rankingRowsWithMissingBeds: 0,
      cmsRowsWithBeds: 0,
      addedOverrides: 0,
      updatedOverrides: 0,
      matchedHighConfidence: 0,
      matchedMediumConfidence: 0,
      unresolved: 0
    },
    errors: [],
    unresolved: [],
    matched: []
  };

  const rankings = readJson(HOSPITAL_RANKINGS_PATH);
  const missing = [];
  Object.entries(rankings?.states || {}).forEach(([state, payload]) => {
    (payload?.hospitalRankings || []).forEach((row) => {
      if (toBeds(row?.beds) !== null) return;
      missing.push({
        state,
        name: row?.name || '',
        metro: row?.metro || '',
        system: row?.system || '',
        key: normalizeKey(row?.name),
        reduced: reduceName(row?.name),
        tokens: new Set(tokenize(row?.name))
      });
    });
  });
  report.summary.rankingRowsWithMissingBeds = missing.length;

  const cmsResult = await fetchCmsRows(CMS_BEDS_API_URL);
  report.cmsUsedUrl = cmsResult.usedUrl;
  report.errors.push(...cmsResult.errors);

  const cmsByState = buildCmsIndex(cmsResult.rows, 'cms_api');
  let cmsRowCount = 0;
  cmsByState.forEach((rows) => { cmsRowCount += rows.length; });

  if (cmsRowCount < MIN_API_ROWS_WITH_BEDS_BEFORE_CSV_FALLBACK) {
    const csvResult = await fetchCmsCsvRows(CMS_BEDS_CSV_URL, CMS_BEDS_API_URL);
    report.cmsCsvUsedUrl = csvResult.usedUrl || null;
    report.errors.push(...csvResult.errors);
    const csvIndex = buildCmsIndex(csvResult.rows, 'cms_csv');
    let csvRowsWithBeds = 0;
    csvIndex.forEach((rows, state) => {
      csvRowsWithBeds += rows.length;
      const existing = cmsByState.get(state) || [];
      cmsByState.set(state, existing.concat(rows));
    });
    if (csvRowsWithBeds > 0) {
      report.sourceMode = cmsRowCount > 0 ? 'api+csv' : 'csv';
      cmsRowCount += csvRowsWithBeds;
    }
  }

  report.summary.cmsRowsWithBeds = cmsRowCount;

  const { data: overrideData, sourcePath } = loadOverrides();
  const mediumPerState = new Map();

  for (const hospital of missing) {
    const candidates = cmsByState.get(hospital.state) || [];
    if (!candidates.length) {
      report.unresolved.push({
        state: hospital.state,
        name: hospital.name,
        metro: hospital.metro,
        reason: 'No CMS candidates for state'
      });
      continue;
    }

    const { best, score } = findBestMatch(hospital, candidates);
    if (!best || score < MIN_MEDIUM_CONFIDENCE) {
      report.unresolved.push({
        state: hospital.state,
        name: hospital.name,
        metro: hospital.metro,
        reason: 'No confident match',
        bestScore: Number(score.toFixed(3))
      });
      continue;
    }

    let accepted = false;
    let confidenceBand = 'high';
    if (score >= MIN_CONFIDENCE) {
      accepted = true;
    } else {
      const used = mediumPerState.get(hospital.state) || 0;
      if (used < MAX_MEDIUM_MATCHES_PER_STATE) {
        accepted = true;
        confidenceBand = 'medium';
        mediumPerState.set(hospital.state, used + 1);
      }
    }

    if (!accepted) {
      report.unresolved.push({
        state: hospital.state,
        name: hospital.name,
        metro: hospital.metro,
        reason: 'Medium-confidence cap reached',
        bestScore: Number(score.toFixed(3)),
        cmsName: best.name,
        cmsCity: best.city
      });
      continue;
    }

    const overrideRow = {
      name: hospital.name,
      metro: hospital.metro,
      system: hospital.system,
      beds: best.beds,
      sourceType: best.source === 'cms_csv' ? 'cms_cost_report_csv' : 'cms_cost_report_api',
      sourceLabel: best.source === 'cms_csv'
        ? 'CMS Hospital Provider Cost Report CSV'
        : 'CMS Hospital Provider Cost Report API',
      url: best.source === 'cms_csv'
        ? (report.cmsCsvUsedUrl || CMS_BEDS_CSV_URL || deriveCsvUrlFromApi(CMS_BEDS_API_URL))
        : CMS_BEDS_API_URL,
      matchConfidence: Number(score.toFixed(3)),
      cmsName: best.name,
      cmsCity: best.city
    };
    const added = upsertOverride(overrideData, hospital.state, overrideRow);
    if (added) report.summary.addedOverrides += 1;
    else report.summary.updatedOverrides += 1;
    if (confidenceBand === 'high') report.summary.matchedHighConfidence += 1;
    else report.summary.matchedMediumConfidence += 1;

    report.matched.push({
      state: hospital.state,
      name: hospital.name,
      metro: hospital.metro,
      beds: best.beds,
      confidence: Number(score.toFixed(3)),
      confidenceBand,
      cmsName: best.name,
      cmsCity: best.city
    });
  }

  report.summary.unresolved = report.unresolved.length;

  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  writeJson(sourcePath, overrideData);
  writeJson(REPORT_PATH, report);

  console.log(`Missing ranking rows: ${report.summary.rankingRowsWithMissingBeds}`);
  console.log(`CMS rows with beds: ${report.summary.cmsRowsWithBeds}`);
  console.log(`Overrides added: ${report.summary.addedOverrides}, updated: ${report.summary.updatedOverrides}`);
  console.log(`Unresolved: ${report.summary.unresolved}`);
  console.log(`Wrote overrides: ${sourcePath}`);
  console.log(`Wrote report: ${REPORT_PATH}`);
}

main().catch((err) => {
  // Non-fatal by design for scheduled pipelines; emit report and exit 0.
  const fallback = {
    generatedAt: new Date().toISOString(),
    cmsBedsApiUrl: CMS_BEDS_API_URL,
    cmsBedsCsvUrl: CMS_BEDS_CSV_URL || deriveCsvUrlFromApi(CMS_BEDS_API_URL) || null,
    errors: [err.message || String(err)],
    summary: {
      rankingRowsWithMissingBeds: 0,
      cmsRowsWithBeds: 0,
      addedOverrides: 0,
      updatedOverrides: 0,
      matchedHighConfidence: 0,
      matchedMediumConfidence: 0,
      unresolved: 0
    }
  };
  try {
    writeJson(REPORT_PATH, fallback);
  } catch {
    // no-op
  }
  console.warn(`Bed backfill skipped: ${err.message || err}`);
  process.exit(0);
});
