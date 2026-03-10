#!/usr/bin/env node
/**
 * Filter and normalize state-news.json entries.
 *
 * Goals:
 * - Reduce noisy non-healthcare Google News items.
 * - Keep stronger healthcare-market signals.
 * - Produce per-state filter telemetry for QA.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const STATE_NEWS_PATH = path.join(DATA_DIR, 'state-news.json');
const MAX_PER_STATE = 25;

const ALLOWLIST_HINTS = [
  'health', 'hospital', 'medical', 'clinic', 'nursing', 'medicare', 'medicaid',
  'cms', 'hhs', 'patient', 'pharmacy', 'public health', 'behavioral', 'telehealth'
];

const BLOCKLIST_HINTS = [
  'murder', 'suicide', 'shooting', 'arrested', 'police', 'weather',
  'sports', 'celebrity', 'lottery', 'crime', 'traffic', 'obituary'
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

function getScore(article) {
  const text = `${article.title || ''} ${article.summary || ''} ${article.source || ''}`.toLowerCase();
  let score = 0;
  ALLOWLIST_HINTS.forEach((kw) => {
    if (text.includes(kw)) score += 2;
  });
  BLOCKLIST_HINTS.forEach((kw) => {
    if (text.includes(kw)) score -= 3;
  });
  if (text.includes('google news -')) score += 1;
  return score;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${String(item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}|${normalizeUrl(item.url)}|${String(item.publishedAt || '').slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function main() {
  if (!fs.existsSync(STATE_NEWS_PATH)) {
    console.log(`No state-news file found at ${STATE_NEWS_PATH}; skipping.`);
    return;
  }

  const raw = JSON.parse(fs.readFileSync(STATE_NEWS_PATH, 'utf-8'));
  const states = raw?.states && typeof raw.states === 'object' ? raw.states : {};

  const filteredStates = {};
  const summary = {
    statesProcessed: 0,
    articlesIn: 0,
    articlesOut: 0,
    droppedLowScore: 0
  };
  const perState = {};

  Object.entries(states).forEach(([state, items]) => {
    const rows = Array.isArray(items) ? items : [];
    summary.statesProcessed += 1;
    summary.articlesIn += rows.length;

    const normalized = rows.map((article) => ({
      ...article,
      title: String(article?.title || '').trim(),
      source: String(article?.source || '').trim(),
      summary: String(article?.summary || '').trim(),
      url: String(article?.url || '').trim(),
      publishedAt: String(article?.publishedAt || article?.date || '').trim()
    }));

    const ranked = dedupe(normalized)
      .map((article) => ({ ...article, _score: getScore(article) }))
      .filter((article) => article._score >= 0)
      .sort((a, b) => {
        const dateDiff = (parseDate(b.publishedAt)?.getTime() || 0) - (parseDate(a.publishedAt)?.getTime() || 0);
        if (dateDiff !== 0) return dateDiff;
        return b._score - a._score;
      })
      .slice(0, MAX_PER_STATE)
      .map(({ _score, ...article }) => article);

    summary.articlesOut += ranked.length;
    summary.droppedLowScore += Math.max(0, normalized.length - ranked.length);
    perState[state] = {
      in: normalized.length,
      out: ranked.length
    };
    filteredStates[state] = ranked;
  });

  const output = {
    ...raw,
    lastFilteredAt: new Date().toISOString(),
    filtering: {
      version: '1.0.0',
      maxPerState: MAX_PER_STATE,
      summary,
      perState
    },
    states: filteredStates
  };

  fs.writeFileSync(STATE_NEWS_PATH, JSON.stringify(output, null, 2));
  console.log(`Filtered state-news entries: ${summary.articlesIn} -> ${summary.articlesOut}`);
  console.log(`Wrote ${STATE_NEWS_PATH}`);
}

main();
