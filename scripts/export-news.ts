/**
 * Export News Feed Script
 *
 * Fetches hospital/nursing industry news from RSS feeds and writes to static JSON.
 * Used by GitHub Actions to generate data for the Daily News Feed section.
 *
 * Sources:
 * - Becker's Hospital Review
 * - Healthcare Dive
 * - Fierce Healthcare
 *
 * Output: public/data/news.json
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');

interface RSSSource {
  name: string;
  url: string;
}

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
}

const RSS_SOURCES: RSSSource[] = [
  {
    name: "Becker's Hospital Review",
    url: 'https://www.beckershospitalreview.com/feed/',
  },
  {
    name: 'STAT News',
    url: 'https://www.statnews.com/feed/',
  },
  {
    name: 'Healthcare Dive',
    url: 'https://www.healthcaredive.com/feeds/news/',
  },
  {
    name: 'Fierce Healthcare',
    url: 'https://www.fiercehealthcare.com/rss/xml',
  },
  {
    name: 'Health Affairs',
    url: 'https://www.healthaffairs.org/action/showFeed?type=etoc&feed=rss&jc=hlthaff',
  },
];

const MAX_ARTICLES = 30;
const FETCH_TIMEOUT_MS = 30000;

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Trim text to first 2 sentences */
function trimToTwoSentences(text: string): string {
  if (!text) return '';

  // Split on sentence-ending punctuation followed by a space or end of string
  const sentences = text.match(/[^.!?]*[.!?]+/g);
  if (!sentences || sentences.length === 0) {
    // No sentence-ending punctuation found; return truncated text
    return text.length > 200 ? text.substring(0, 200).trim() + '...' : text;
  }

  const twoSentences = sentences.slice(0, 2).join('').trim();
  return twoSentences;
}

/** Extract text content between XML tags */
function extractTag(xml: string, tag: string): string {
  // Handle both <tag>content</tag> and <tag><![CDATA[content]]></tag>
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

/** Extract the link from an RSS item (handles both <link>url</link> and atom:link) */
function extractLink(itemXml: string): string {
  // Try standard <link>url</link> first
  const linkMatch = itemXml.match(/<link[^>]*>([^<]+)<\/link>/i);
  if (linkMatch) return linkMatch[1].trim();

  // Try self-closing atom link
  const atomMatch = itemXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (atomMatch) return atomMatch[1].trim();

  // Some feeds put the link as bare text after <link/>
  const bareMatch = itemXml.match(/<link\s*\/>\s*([^\s<]+)/i);
  if (bareMatch) return bareMatch[1].trim();

  return '';
}

/** Parse date string to ISO date (YYYY-MM-DD) */
function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/** Parse date string to timestamp for sorting */
function parseDateTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
}

/** Fetch an RSS feed with timeout */
async function fetchRSS(source: RSSSource): Promise<NewsArticle[]> {
  console.log(`  Fetching: ${source.name} (${source.url})`);
  const articles: NewsArticle[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LighthouseNursingIntel/1.0; +https://github.com)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`    WARN: HTTP ${res.status} for ${source.name}`);
      return [];
    }

    const xml = await res.text();

    // Extract all <item> or <entry> elements (RSS 2.0 / Atom)
    const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
    let itemMatch: RegExpExecArray | null;

    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const itemXml = itemMatch[1];

      const title = stripHtml(extractTag(itemXml, 'title'));
      const link = extractLink(itemXml);
      const pubDate =
        extractTag(itemXml, 'pubDate') ||
        extractTag(itemXml, 'published') ||
        extractTag(itemXml, 'dc:date') ||
        extractTag(itemXml, 'updated');
      const rawDescription =
        extractTag(itemXml, 'description') ||
        extractTag(itemXml, 'summary') ||
        extractTag(itemXml, 'content');

      if (!title || !link) continue;

      const cleanDesc = stripHtml(rawDescription);
      const summary = trimToTwoSentences(cleanDesc);

      articles.push({
        title,
        url: link,
        source: source.name,
        publishedAt: parseDate(pubDate),
        summary: summary || 'No summary available.',
      });
    }

    console.log(`    Found ${articles.length} articles from ${source.name}`);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn(`    WARN: Timeout fetching ${source.name}`);
    } else {
      console.warn(`    WARN: Error fetching ${source.name}: ${err.message}`);
    }
  }

  return articles;
}

/** Deduplicate articles by normalized title */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const normalized = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

async function main() {
  console.log('=== News Feed Export ===');
  console.log(`Fetching from ${RSS_SOURCES.length} sources...\n`);

  // Fetch all feeds in parallel
  const results = await Promise.all(RSS_SOURCES.map(fetchRSS));
  let allArticles = results.flat();

  console.log(`\nTotal articles fetched: ${allArticles.length}`);

  // Deduplicate
  allArticles = deduplicateArticles(allArticles);
  console.log(`After deduplication: ${allArticles.length}`);

  // Sort by date (newest first)
  allArticles.sort((a, b) => {
    return parseDateTimestamp(b.publishedAt) - parseDateTimestamp(a.publishedAt);
  });

  // Limit to top N
  allArticles = allArticles.slice(0, MAX_ARTICLES);
  console.log(`Final article count: ${allArticles.length}`);

  // Write output
  const output = {
    lastUpdated: new Date().toISOString(),
    articles: allArticles,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, 'news.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${outputPath}`);
  console.log('=== Done ===');
}

main().catch((err) => {
  console.error('News feed export failed:', err);
  // Write empty fallback so frontend doesn't break
  const fallback = { lastUpdated: new Date().toISOString(), articles: [] };
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'news.json'),
    JSON.stringify(fallback, null, 2)
  );
  process.exit(0); // Don't fail the entire pipeline
});
