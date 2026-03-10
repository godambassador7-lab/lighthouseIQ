/**
 * Merge News Articles
 *
 * Merges freshly fetched news articles (public/data/news.json) with a
 * previously saved snapshot (public/data/news-existing.json) so that
 * articles from the past retention window are preserved across export runs.
 * Also annotates category coverage and source-health telemetry to support
 * feed quality monitoring in the UI and CI checks.
 *
 * Run AFTER export-news.js in the GitHub Actions workflow.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const NEWS_PATH = path.join(DATA_DIR, 'news.json');
const EXISTING_PATH = path.join(DATA_DIR, 'news-existing.json');
const MAX_ARTICLES = 500;
const MAX_AGE_DAYS = 90;
const SOURCE_STALE_HOURS = 72;
const REQUIRED_CATEGORY_KEYS = [
  'closures_layoffs',
  'mergers_mna',
  'labor_unions',
  'policy_reimbursement',
  'quality_safety',
  'capacity_expansion',
  'ai_tech'
];

const CATEGORY_RULES = [
  { key: 'closures_layoffs', label: 'Closures & Layoffs', keywords: ['closure', 'closing', 'shut down', 'shuttering', 'bankrupt', 'bankruptcy', 'layoff', 'laid off', 'job cuts', 'furlough', 'workforce reduction'] },
  { key: 'mergers_mna', label: 'Mergers & M&A', keywords: ['merge', 'merger', 'acquisition', 'acquire', 'transaction', 'consolidation', 'joint venture', 'affiliation'] },
  { key: 'labor_unions', label: 'Labor & Unions', keywords: ['strike', 'union', 'collective bargaining', 'nurses vote', 'walkout', 'contract talks', 'organizing'] },
  { key: 'policy_reimbursement', label: 'Policy & Reimbursement', keywords: ['cms', 'medicare', 'medicaid', 'reimbursement', 'payment rule', '340b', 'hhs', 'federal rule', 'rate notice'] },
  { key: 'quality_safety', label: 'Quality & Safety', keywords: ['patient safety', 'quality', 'infection', 'sentinel event', 'readmission', 'mortality', 'adverse event'] },
  { key: 'capacity_expansion', label: 'Capacity & Expansion', keywords: ['opens', 'opening', 'expansion', 'new hospital', 'new facility', 'beds', 'capacity', 'tower', 'campus'] },
  { key: 'ai_tech', label: 'AI & Digital Tech', keywords: ['ai', 'artificial intelligence', 'machine learning', 'ehr', 'digital health', 'automation', 'telehealth', 'virtual care'] }
];

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

function normalizeUrl(value) {
  try {
    const u = new URL(String(value || '').trim());
    return `${u.hostname}${u.pathname}`.toLowerCase();
  } catch {
    return String(value || '').trim().toLowerCase();
  }
}

function hoursSince(date) {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
}

function normalizeArticle(article) {
  return {
    ...article,
    title: String(article?.title || '').trim(),
    summary: String(article?.summary || '').trim(),
    source: String(article?.source || 'Unknown').trim(),
    url: String(article?.url || '').trim(),
    publishedAt: String(article?.publishedAt || article?.date || '').trim()
  };
}

function classifyArticle(article) {
  const text = `${article.title} ${article.summary}`.toLowerCase();
  let best = { key: 'general_market', label: 'General Market', score: 0 };
  CATEGORY_RULES.forEach((rule) => {
    const score = rule.keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    if (score > best.score) {
      best = { key: rule.key, label: rule.label, score };
    }
  });
  return {
    category: best.key,
    categoryLabel: best.label
  };
}

function loadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data.articles) ? data.articles : [];
  } catch {
    return [];
  }
}

function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const titleKey = String(article.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const urlKey = normalizeUrl(article.url);
    const dateKey = String(article.publishedAt || '').slice(0, 10);
    const key = `${titleKey}|${urlKey}|${dateKey}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pruneOldArticles(articles) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_AGE_DAYS);
  cutoff.setHours(0, 0, 0, 0);
  return articles.filter(article => {
    const d = parseDate(article.publishedAt || article.date);
    return d ? d >= cutoff : false;
  });
}

function parseDateTimestamp(dateStr) {
  const d = parseDate(dateStr);
  return d ? d.getTime() : 0;
}

function buildCategoryCoverage(articles) {
  const counts = {};
  CATEGORY_RULES.forEach((rule) => {
    counts[rule.key] = {
      label: rule.label,
      count: 0
    };
  });
  counts.general_market = {
    label: 'General Market',
    count: 0
  };
  articles.forEach((article) => {
    const key = article.category || 'general_market';
    if (!counts[key]) {
      counts[key] = {
        label: key,
        count: 0
      };
    }
    counts[key].count += 1;
  });
  return counts;
}

function buildSourceHealth(articles) {
  const bySource = new Map();
  articles.forEach((article) => {
    const source = article.source || 'Unknown';
    const published = parseDate(article.publishedAt);
    if (!bySource.has(source)) {
      bySource.set(source, {
        source,
        articleCount: 0,
        latestPublishedAt: null
      });
    }
    const row = bySource.get(source);
    row.articleCount += 1;
    if (published && (!row.latestPublishedAt || published > new Date(row.latestPublishedAt))) {
      row.latestPublishedAt = published.toISOString();
    }
  });

  const rows = Array.from(bySource.values())
    .sort((a, b) => b.articleCount - a.articleCount)
    .map((row) => {
      const latest = parseDate(row.latestPublishedAt);
      const staleHours = hoursSince(latest);
      const status = staleHours !== null && staleHours > SOURCE_STALE_HOURS ? 'stale' : 'ok';
      return {
        ...row,
        staleHours,
        status
      };
    });

  const staleSources = rows.filter((row) => row.status === 'stale').length;
  return {
    totalSources: rows.length,
    staleSources,
    healthySources: rows.length - staleSources,
    sources: rows
  };
}

function buildQualityChecks(articles, sourceHealth, categoryCoverage) {
  const since24h = new Date(Date.now() - (24 * 60 * 60 * 1000));
  const articles24h = articles.filter((article) => {
    const d = parseDate(article.publishedAt);
    return d && d >= since24h;
  }).length;

  const categoriesCovered = REQUIRED_CATEGORY_KEYS.filter((key) => (categoryCoverage[key]?.count || 0) > 0).length;
  const checks = {
    minUniqueSources: {
      threshold: 8,
      actual: sourceHealth.totalSources,
      pass: sourceHealth.totalSources >= 8
    },
    minArticles24h: {
      threshold: 20,
      actual: articles24h,
      pass: articles24h >= 20
    },
    minRequiredCategoriesCovered: {
      threshold: 4,
      actual: categoriesCovered,
      pass: categoriesCovered >= 4
    },
    maxStaleSources: {
      threshold: 2,
      actual: sourceHealth.staleSources,
      pass: sourceHealth.staleSources <= 2
    }
  };

  const failed = Object.entries(checks)
    .filter(([, value]) => !value.pass)
    .map(([name]) => name);

  return {
    status: failed.length ? 'warning' : 'pass',
    failedChecks: failed,
    checks
  };
}

console.log('=== Merge News Articles ===');

const freshArticles = loadJSON(NEWS_PATH);
const existingArticles = loadJSON(EXISTING_PATH);

console.log(`Fresh articles: ${freshArticles.length}`);
console.log(`Existing articles: ${existingArticles.length}`);

// Fresh first so they win on dedup collision
let merged = [...freshArticles, ...existingArticles];
merged = deduplicateArticles(merged);
console.log(`After dedup: ${merged.length}`);

merged = pruneOldArticles(merged);
console.log(`After pruning (>${MAX_AGE_DAYS}d): ${merged.length}`);

merged = merged.map((article) => {
  const normalized = normalizeArticle(article);
  return {
    ...normalized,
    ...classifyArticle(normalized)
  };
});

merged.sort((a, b) => parseDateTimestamp(b.publishedAt) - parseDateTimestamp(a.publishedAt));
merged = merged.slice(0, MAX_ARTICLES);
console.log(`Final count: ${merged.length}`);

const sourceHealth = buildSourceHealth(merged);
const categoryCoverage = buildCategoryCoverage(merged);
const quality = buildQualityChecks(merged, sourceHealth, categoryCoverage);

const output = {
  lastUpdated: new Date().toISOString(),
  retentionDays: MAX_AGE_DAYS,
  maxArticles: MAX_ARTICLES,
  sourceHealth,
  categoryCoverage,
  quality,
  articles: merged,
};

fs.writeFileSync(NEWS_PATH, JSON.stringify(output, null, 2));
console.log(`Wrote ${NEWS_PATH}`);

// Clean up snapshot
try { fs.unlinkSync(EXISTING_PATH); } catch {}
console.log('=== Done ===');
