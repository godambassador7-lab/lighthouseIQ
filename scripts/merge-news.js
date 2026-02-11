/**
 * Merge News Articles
 *
 * Merges freshly fetched news articles (public/data/news.json) with a
 * previously saved snapshot (public/data/news-existing.json) so that
 * articles from the past 14 days are preserved across export runs.
 *
 * Run AFTER export-news.js in the GitHub Actions workflow.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const NEWS_PATH = path.join(DATA_DIR, 'news.json');
const EXISTING_PATH = path.join(DATA_DIR, 'news-existing.json');
const MAX_ARTICLES = 100;
const MAX_AGE_DAYS = 14;

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
    const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
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
    if (!article.publishedAt) return false;
    try {
      const d = new Date(article.publishedAt + 'T00:00:00');
      return d >= cutoff;
    } catch {
      return false;
    }
  });
}

function parseDateTimestamp(dateStr) {
  if (!dateStr) return 0;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
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

merged.sort((a, b) => parseDateTimestamp(b.publishedAt) - parseDateTimestamp(a.publishedAt));
merged = merged.slice(0, MAX_ARTICLES);
console.log(`Final count: ${merged.length}`);

const output = {
  lastUpdated: new Date().toISOString(),
  articles: merged,
};

fs.writeFileSync(NEWS_PATH, JSON.stringify(output, null, 2));
console.log(`Wrote ${NEWS_PATH}`);

// Clean up snapshot
try { fs.unlinkSync(EXISTING_PATH); } catch {}
console.log('=== Done ===');
