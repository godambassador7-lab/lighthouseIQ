#!/usr/bin/env node
/**
 * Fetch US healthcare market news from public primary sources.
 *
 * Output:
 * - public/data/news-us-extra.json
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const OUTPUT_PATH = path.join(DATA_DIR, 'news-us-extra.json');
const MANIFEST_PATH = path.join(process.cwd(), 'scripts', 'data', 'us-health-news-sources.json');
const MAX_PER_SOURCE = Number(process.env.US_NEWS_MAX_PER_SOURCE || 20);
const REQUEST_TIMEOUT_MS = Number(process.env.US_NEWS_TIMEOUT_MS || 15000);
const USER_AGENT = process.env.US_NEWS_USER_AGENT || 'LighthouseIQ/1.0 (US healthcare news fetcher)';

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

function isoDay(value) {
  const d = parseDate(value);
  return d ? d.toISOString().slice(0, 10) : '';
}

function normalizeUrl(base, href) {
  try {
    return new URL(String(href || '').trim(), base).toString();
  } catch {
    return String(href || '').trim();
  }
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(text) {
  return decodeEntities(String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function sanitizeTitle(value) {
  return stripTags(value).replace(/\s+/g, ' ').trim();
}

function sanitizeSummary(value) {
  return stripTags(value).replace(/\s+/g, ' ').trim();
}

function classifyCategory(text, fallback) {
  const s = String(text || '').toLowerCase();
  if (/(layoff|laid off|closure|closing|furlough|bankrupt|shutdown|shutter)/.test(s)) return 'closures_layoffs';
  if (/(merger|acquisition|acquire|antitrust|transaction|consolidation)/.test(s)) return 'mergers_mna';
  if (/(strike|union|collective bargaining|walkout|contract talks)/.test(s)) return 'labor_unions';
  if (/(medicare|medicaid|cms|payment|reimbursement|hhs|policy|federal register|rule)/.test(s)) return 'policy_reimbursement';
  if (/(quality|safety|infection|adverse|warning|recall|drug shortage|medwatch)/.test(s)) return 'quality_safety';
  if (/(expansion|new hospital|opening|capacity|beds|facility)/.test(s)) return 'capacity_expansion';
  if (/(ai|artificial intelligence|automation|telehealth|digital health|ehr)/.test(s)) return 'ai_tech';
  return fallback || 'general_market';
}

function relevanceScore(text, keywords, priority) {
  const s = String(text || '').toLowerCase();
  const matches = keywords.reduce((acc, kw) => acc + (s.includes(String(kw).toLowerCase()) ? 1 : 0), 0);
  return Math.min(100, Math.max(10, Number(priority || 50) + matches * 5));
}

function dedupe(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    const key = `${String(a.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}|${String(a.url || '').toLowerCase()}|${String(a.publishedAt || '').slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/rss+xml,application/atom+xml,application/json;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    const json = await response.json();
    return { ok: response.ok, status: response.status, json };
  } finally {
    clearTimeout(timer);
  }
}

function parseRssItems(xml, baseUrl) {
  const items = [];
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  itemMatches.forEach((block) => {
    const title = sanitizeTitle((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const link = stripTags((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
    const pubDate = stripTags((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '');
    const description = sanitizeSummary((block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '');
    if (!title || !link) return;
    items.push({
      title,
      url: normalizeUrl(baseUrl, link),
      publishedAt: isoDay(pubDate),
      summary: description
    });
  });
  if (items.length) return items;

  const entryMatches = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  entryMatches.forEach((block) => {
    const title = sanitizeTitle((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const link = (block.match(/<link[^>]*href=["']([^"']+)["']/i) || [])[1] || '';
    const updated = stripTags((block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] || '');
    const summary = sanitizeSummary((block.match(/<(summary|content)[^>]*>([\s\S]*?)<\/(summary|content)>/i) || [])[2] || '');
    if (!title || !link) return;
    items.push({
      title,
      url: normalizeUrl(baseUrl, link),
      publishedAt: isoDay(updated),
      summary
    });
  });
  return items;
}

function parseHtmlLinks(html, baseUrl) {
  const links = [];
  const regex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = normalizeUrl(baseUrl, match[1]);
    const text = sanitizeTitle(match[2]);
    if (!href || !text || text.length < 24) continue;
    if (/^(javascript:|mailto:|tel:)/i.test(href)) continue;
    links.push({
      title: text,
      url: href,
      publishedAt: '',
      summary: ''
    });
  }
  return links;
}

async function fetchFederalRegister(source, keywords) {
  const { ok, status, json } = await fetchJson(source.url);
  const docs = Array.isArray(json?.results) ? json.results : [];
  const articles = docs.map((doc) => {
    const title = sanitizeTitle(doc?.title || '');
    const summary = sanitizeSummary(doc?.abstract || '');
    const url = String(doc?.html_url || doc?.pdf_url || '').trim();
    const publishedAt = isoDay(doc?.publication_date || '');
    const category = classifyCategory(`${title} ${summary}`, source.category);
    return {
      title,
      summary,
      url,
      source: source.name,
      sourceType: source.type,
      sourceId: source.id,
      publishedAt,
      category,
      relevance: relevanceScore(`${title} ${summary}`, keywords, source.priority)
    };
  }).filter((a) => a.title && a.url);
  return { ok, status, articles: articles.slice(0, MAX_PER_SOURCE) };
}

function latestSecFilings(items) {
  const forms = Array.isArray(items?.filings?.recent?.form) ? items.filings.recent.form : [];
  const accession = Array.isArray(items?.filings?.recent?.accessionNumber) ? items.filings.recent.accessionNumber : [];
  const dates = Array.isArray(items?.filings?.recent?.filingDate) ? items.filings.recent.filingDate : [];
  const primaryDocs = Array.isArray(items?.filings?.recent?.primaryDocument) ? items.filings.recent.primaryDocument : [];

  const rows = [];
  for (let i = 0; i < forms.length; i += 1) {
    const form = String(forms[i] || '').trim();
    if (!/^(8-K|10-Q|10-K|6-K)$/i.test(form)) continue;
    rows.push({
      form,
      accession: String(accession[i] || '').replace(/-/g, ''),
      filingDate: String(dates[i] || ''),
      primaryDocument: String(primaryDocs[i] || '')
    });
    if (rows.length >= 4) break;
  }
  return rows;
}

async function fetchSecFilings(source, keywords) {
  const companies = Array.isArray(source.companies) ? source.companies : [];
  const articles = [];
  const sourceHealth = [];

  for (const company of companies) {
    const cikRaw = String(company.cik || '').trim();
    if (!cikRaw) continue;
    const cik = cikRaw.padStart(10, '0');
    const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
    try {
      const { ok, status, json } = await fetchJson(url);
      const filings = latestSecFilings(json || {});
      filings.forEach((f) => {
        const accession = f.accession;
        const filingUrl = accession
          ? `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession}/${f.primaryDocument || ''}`
          : 'https://www.sec.gov/edgar/searchedgar/companysearch';
        const title = `${company.symbol} ${f.form} filing - ${company.name}`;
        const summary = `${company.name} filed ${f.form} with the SEC.`;
        articles.push({
          title,
          summary,
          url: filingUrl,
          source: source.name,
          sourceType: source.type,
          sourceId: source.id,
          publishedAt: isoDay(f.filingDate),
          category: source.category || 'policy_reimbursement',
          relevance: relevanceScore(`${title} ${summary}`, keywords, source.priority)
        });
      });
      sourceHealth.push({ source: `${source.name}:${company.symbol}`, ok, status, records: filings.length });
    } catch (err) {
      sourceHealth.push({ source: `${source.name}:${company.symbol}`, ok: false, status: 0, error: String(err.message || err) });
    }
  }

  return { ok: true, status: 200, articles: articles.slice(0, MAX_PER_SOURCE * 2), sourceHealth };
}

async function fetchRssOrHtml(source, keywords) {
  const { ok, status, text } = await fetchText(source.url);
  const isXml = /<rss|<feed|<entry|<item/i.test(text || '');
  const items = isXml ? parseRssItems(text || '', source.url) : parseHtmlLinks(text || '', source.url);

  const filtered = items
    .map((item) => {
      const title = sanitizeTitle(item.title || '');
      const summary = sanitizeSummary(item.summary || '');
      const combined = `${title} ${summary}`;
      return {
        title,
        summary,
        url: String(item.url || '').trim(),
        source: source.name,
        sourceType: source.type,
        sourceId: source.id,
        publishedAt: isoDay(item.publishedAt || ''),
        category: classifyCategory(combined, source.category),
        relevance: relevanceScore(combined, keywords, source.priority)
      };
    })
    .filter((item) => item.title && item.url)
    .filter((item) => item.relevance >= 55)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, MAX_PER_SOURCE);

  return { ok, status, articles: filtered };
}

async function fetchSource(source, keywords) {
  if (source.type === 'federal_register') return fetchFederalRegister(source, keywords);
  if (source.type === 'sec_filings') return fetchSecFilings(source, keywords);
  return fetchRssOrHtml(source, keywords);
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) throw new Error(`Missing source manifest: ${MANIFEST_PATH}`);
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

async function main() {
  ensureDataDir();
  const manifest = loadManifest();
  const sources = Array.isArray(manifest.sources) ? manifest.sources : [];
  const keywords = Array.isArray(manifest.healthcareKeywords) ? manifest.healthcareKeywords : [];
  const all = [];
  const sourceHealth = [];

  console.log(`Fetching US healthcare sources: ${sources.length}`);
  for (const source of sources) {
    try {
      const result = await fetchSource(source, keywords);
      const records = Array.isArray(result.articles) ? result.articles.length : 0;
      if (records) all.push(...result.articles);
      sourceHealth.push({
        source: source.name,
        id: source.id,
        type: source.type,
        ok: Boolean(result.ok),
        status: Number(result.status || 0),
        records
      });
      if (Array.isArray(result.sourceHealth) && result.sourceHealth.length) {
        sourceHealth.push(...result.sourceHealth);
      }
      console.log(` - ${source.id}: ${records} articles`);
    } catch (err) {
      sourceHealth.push({
        source: source.name,
        id: source.id,
        type: source.type,
        ok: false,
        status: 0,
        records: 0,
        error: String(err.message || err)
      });
      console.log(` - ${source.id}: error`);
    }
  }

  const deduped = dedupe(all)
    .sort((a, b) => {
      const dateDiff = (parseDate(b.publishedAt)?.getTime() || 0) - (parseDate(a.publishedAt)?.getTime() || 0);
      if (dateDiff !== 0) return dateDiff;
      return Number(b.relevance || 0) - Number(a.relevance || 0);
    })
    .slice(0, 300);

  const output = {
    lastUpdated: new Date().toISOString(),
    scope: 'US healthcare',
    sourceManifestVersion: manifest.version || null,
    sourceHealth,
    articles: deduped
  };

  try {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`Wrote ${OUTPUT_PATH} (${deduped.length} articles)`);
  } catch (err) {
    console.warn(`Could not write ${OUTPUT_PATH}: ${err.message}`);
  }
}

main().catch((err) => {
  console.error('Failed to fetch US healthcare news:', err);
  process.exit(1);
});
