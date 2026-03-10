#!/usr/bin/env node
/**
 * News quality gate + report.
 *
 * Reads public/data/news.json and writes public/data/news-quality.json.
 * Exits non-zero only when strict mode is enabled.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const NEWS_PATH = path.join(DATA_DIR, 'news.json');
const REPORT_PATH = path.join(DATA_DIR, 'news-quality.json');
const STRICT = process.argv.includes('--strict') || process.env.NEWS_QUALITY_STRICT === '1';

const THRESHOLDS = {
  minArticles: 120,
  minUniqueSources: 8,
  maxAgeHours: 24,
  minArticles24h: 20,
  minCategoryBuckets: 4
};

function parseDate(value) {
  if (!value) return null;
  try {
    const raw = String(value).trim();
    if (!raw) return null;
    const d = raw.includes('T') ? new Date(raw) : new Date(`${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

if (!fs.existsSync(NEWS_PATH)) fail(`Missing ${NEWS_PATH}`);

const data = JSON.parse(fs.readFileSync(NEWS_PATH, 'utf-8'));
const articles = Array.isArray(data.articles) ? data.articles : [];
const sourceHealth = data.sourceHealth || {};
const categoryCoverage = data.categoryCoverage || {};

const newsUpdated = parseDate(data.lastUpdated);
const ageHours = newsUpdated ? Math.floor((Date.now() - newsUpdated.getTime()) / (1000 * 60 * 60)) : null;
const uniqueSources = new Set(
  articles.map((a) => String(a?.source || '').trim()).filter(Boolean)
).size;
const since24h = new Date(Date.now() - (24 * 60 * 60 * 1000));
const articles24h = articles.filter((a) => {
  const d = parseDate(a?.publishedAt || a?.date);
  return d && d >= since24h;
}).length;
const categoryBuckets = Object.values(categoryCoverage).filter((row) => Number(row?.count || 0) > 0).length;

const checks = {
  minArticles: { threshold: THRESHOLDS.minArticles, actual: articles.length, pass: articles.length >= THRESHOLDS.minArticles },
  minUniqueSources: { threshold: THRESHOLDS.minUniqueSources, actual: uniqueSources, pass: uniqueSources >= THRESHOLDS.minUniqueSources },
  maxAgeHours: { threshold: THRESHOLDS.maxAgeHours, actual: ageHours, pass: ageHours !== null && ageHours <= THRESHOLDS.maxAgeHours },
  minArticles24h: { threshold: THRESHOLDS.minArticles24h, actual: articles24h, pass: articles24h >= THRESHOLDS.minArticles24h },
  minCategoryBuckets: { threshold: THRESHOLDS.minCategoryBuckets, actual: categoryBuckets, pass: categoryBuckets >= THRESHOLDS.minCategoryBuckets },
  sourceHealthPresent: { threshold: 1, actual: Array.isArray(sourceHealth.sources) ? sourceHealth.sources.length : 0, pass: Array.isArray(sourceHealth.sources) && sourceHealth.sources.length > 0 }
};

const failedChecks = Object.entries(checks).filter(([, v]) => !v.pass).map(([k]) => k);
const report = {
  lastCheckedAt: new Date().toISOString(),
  strict: STRICT,
  status: failedChecks.length ? 'warning' : 'pass',
  failedChecks,
  checks
};

try {
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`Wrote ${REPORT_PATH}`);
} catch (err) {
  console.warn(`Could not write ${REPORT_PATH}: ${err.message}`);
}
if (failedChecks.length) {
  console.warn(`News quality warnings: ${failedChecks.join(', ')}`);
  if (STRICT) process.exit(2);
}
