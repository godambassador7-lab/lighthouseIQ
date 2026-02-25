#!/usr/bin/env node
/**
 * Refreshes source freshness metadata for shortage/surplus inputs.
 * The output is consumed by export-recruitment-intel.js.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.env.LNI_OUTPUT_DIR || path.join(__dirname, '..', 'public', 'data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'workforce-sources.json');
const REFRESH_DAYS = Number(process.env.WORKFORCE_REFRESH_DAYS || 7);
const FORCE_REFRESH = process.env.WORKFORCE_FORCE_REFRESH === 'true';

const SOURCES = [
  {
    id: 'hrsa-nchwa',
    name: 'HRSA National Center for Health Workforce Analysis (NCHWA)',
    category: 'federal',
    priority: 'primary',
    url: 'https://bhw.hrsa.gov/data-research/projecting-health-workforce-supply-demand'
  },
  {
    id: 'hrsa-nssrn',
    name: 'HRSA National Sample Survey of Registered Nurses (NSSRN)',
    category: 'federal',
    priority: 'primary',
    url: 'https://bhw.hrsa.gov/data-research/access-data-tools/national-sample-survey-registered-nurses'
  },
  {
    id: 'bls-rn',
    name: 'BLS Occupational Employment and Wage Statistics (RN)',
    category: 'federal',
    priority: 'primary',
    url: 'https://www.bls.gov/oes/current/oes291141.htm'
  },
  {
    id: 'aacn-shortage',
    name: 'AACN Nursing Shortage Fact Sheet',
    category: 'association',
    priority: 'primary',
    url: 'https://www.aacnnursing.org/news-data/fact-sheets/nursing-shortage'
  },
  {
    id: 'ncsbn-workforce',
    name: 'NCSBN Workforce Study',
    category: 'association',
    priority: 'primary',
    url: 'https://www.ncsbn.org/public-files/2024_ncsbn_workforce_study.pdf'
  },
  {
    id: 'nursejournal-summary',
    name: 'NurseJournal State Shortage Summary',
    category: 'secondary',
    priority: 'secondary',
    url: 'https://nursejournal.org/resources/nursing-shortage-by-state/'
  },
  {
    id: 'nightingale-summary',
    name: 'Nightingale State Shortage Summary',
    category: 'secondary',
    priority: 'secondary',
    url: 'https://nightingale.edu/blog/nursing-shortage-by-state/'
  },
  {
    id: 'vivian-summary',
    name: 'Vivian State Shortage Summary',
    category: 'secondary',
    priority: 'secondary',
    url: 'https://www.vivian.com/community/industry-trends/nursing-shortage-by-state/'
  }
];

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function shouldSkipRefresh(existing) {
  if (!existing?.fetchedAt || FORCE_REFRESH) return false;
  const fetchedAt = new Date(existing.fetchedAt).getTime();
  if (!Number.isFinite(fetchedAt)) return false;
  const nextDue = fetchedAt + REFRESH_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() < nextDue;
}

async function fetchSourceMetadata(source) {
  const now = new Date().toISOString();
  const result = {
    ...source,
    fetchedAt: now,
    status: 'ok',
    httpStatus: null,
    finalUrl: source.url,
    lastModified: null,
    etag: null,
    contentType: null,
    error: null
  };

  try {
    let res = await fetch(source.url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'lighthouseiq-workforce-refresh/1.0' }
    });

    // Some sites block HEAD; fall back to GET.
    if (!res.ok || res.status === 405 || res.status === 403) {
      res = await fetch(source.url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'lighthouseiq-workforce-refresh/1.0' }
      });
    }

    result.httpStatus = res.status;
    result.finalUrl = res.url || source.url;
    result.lastModified = res.headers.get('last-modified');
    result.etag = res.headers.get('etag');
    result.contentType = res.headers.get('content-type');

    if (!res.ok) {
      result.status = 'error';
      result.error = `HTTP ${res.status}`;
    }
  } catch (err) {
    result.status = 'error';
    result.error = err?.message || String(err);
  }

  return result;
}

async function main() {
  ensureOutputDir();
  const existing = readJsonSafe(OUTPUT_PATH);

  if (shouldSkipRefresh(existing)) {
    const next = existing?.nextRefreshAt || 'unknown';
    console.log(`Skipping workforce source refresh (next due: ${next})`);
    return;
  }

  console.log(`Refreshing workforce source metadata (${SOURCES.length} sources)...`);
  const refreshed = [];
  for (const source of SOURCES) {
    // Sequential to be polite to upstream sites.
    // eslint-disable-next-line no-await-in-loop
    const meta = await fetchSourceMetadata(source);
    refreshed.push(meta);
    console.log(` - ${source.id}: ${meta.status}${meta.httpStatus ? ` (${meta.httpStatus})` : ''}`);
  }

  const fetchedAt = new Date().toISOString();
  const nextRefreshAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const output = {
    fetchedAt,
    refreshEveryDays: REFRESH_DAYS,
    nextRefreshAt,
    sources: refreshed
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote workforce source snapshot to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Failed to refresh workforce sources:', err);
  process.exit(1);
});

