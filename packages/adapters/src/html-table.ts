import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { NormalizedWarnNotice, USStateAbbrev } from '@lni/core';

type TableParseOptions = {
  state: USStateAbbrev;
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  tableSelector?: string;
};

type FetchTableOptions = TableParseOptions & {
  maxPages?: number;
  nextPageSelector?: string;
  requestHeaders?: Record<string, string>;
  timeoutMs?: number;
};

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (match) {
    let [, month, day, year] = match;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const nameMatch = value.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i);
  if (nameMatch) {
    const [, monthName, day, year] = nameMatch;
    const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec']
      .indexOf(monthName.toLowerCase());
    if (monthIndex >= 0) {
      const month = String(monthIndex === 9 ? 9 : monthIndex + 1).padStart(2, '0');
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }
  const altMatch = value.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (altMatch) {
    const [, year, month, day] = altMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return undefined;
}

function parseEmployees(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9]/g, '');
  if (!cleaned) return undefined;
  const num = Number.parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : undefined;
}

function parseCityFromLocation(value: string | undefined, state: USStateAbbrev): string | undefined {
  if (!value) return undefined;
  const match = value.match(new RegExp(`^(.+?),\\s*${state}\\b`, 'i'));
  return match ? match[1].trim() : value.trim();
}

function normalizeCellText($: cheerio.CheerioAPI, cell: cheerio.Cheerio<any>): string {
  return cell.text().replace(/\s+/g, ' ').trim();
}

function hasHeaderContent(value: string): boolean {
  const key = normalizeHeader(value);
  return [
    'employer', 'company', 'business', 'location', 'city', 'town', 'county',
    'notice', 'received', 'layoff', 'effective', 'impact', 'workers', 'employees',
    'number', 'reason', 'type', 'naics', 'industry'
  ].some(token => key.includes(token));
}

function getHeaders($: cheerio.CheerioAPI, table: cheerio.Cheerio<any>): { headers: string[]; headerRowIndex: number } {
  const theadHeaders = table.find('thead th').map((_: number, th: any) => $(th).text().trim()).get();
  if (theadHeaders.length) {
    return { headers: theadHeaders, headerRowIndex: -1 };
  }

  const firstRow = table.find('tr').first();
  const rowHeaders = firstRow.find('th, td').map((_: number, cell: any) => $(cell).text().trim()).get();
  return { headers: rowHeaders, headerRowIndex: 0 };
}

function resolveUrl(href: string | undefined, baseUrl: string): string | undefined {
  if (!href) return undefined;
  try {
    return href.startsWith('http') ? href : new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function findNextPageUrl(html: string, baseUrl: string, selector?: string): string | undefined {
  const $ = cheerio.load(html);
  if (selector) {
    const candidate = resolveUrl($(selector).first().attr('href'), baseUrl);
    if (candidate) return candidate;
  }

  const relCandidate = resolveUrl($('a[rel="next"]').first().attr('href'), baseUrl);
  if (relCandidate) return relCandidate;

  const anchors = $('a').toArray();
  for (const anchor of anchors) {
    const el = $(anchor);
    const text = el.text().replace(/\s+/g, ' ').trim().toLowerCase();
    const aria = (el.attr('aria-label') || '').toLowerCase();
    const rel = (el.attr('rel') || '').toLowerCase();
    const cls = (el.attr('class') || '').toLowerCase();
    const isNext = [
      text === 'next',
      text === 'next ›',
      text === 'next »',
      text === '›',
      text === '»',
      text === '>',
      text.startsWith('next '),
      aria.includes('next'),
      rel.includes('next'),
      cls.includes('next')
    ].some(Boolean);
    if (isNext) {
      const candidate = resolveUrl(el.attr('href'), baseUrl);
      if (candidate) return candidate;
    }
  }

  return undefined;
}

async function fetchHtml(url: string, options: FetchTableOptions): Promise<string> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)',
    ...options.requestHeaders
  };
  const res = await axios.get(url, {
    timeout: options.timeoutMs ?? 30000,
    headers
  });
  return res.data as string;
}

export async function fetchHtmlTableNotices(url: string, options: FetchTableOptions): Promise<NormalizedWarnNotice[]> {
  const noticesById = new Map<string, NormalizedWarnNotice>();
  const visited = new Set<string>();
  const maxPages = options.maxPages ?? 5;
  let currentUrl: string | undefined = url;

  for (let page = 0; page < maxPages && currentUrl; page += 1) {
    if (visited.has(currentUrl)) break;
    visited.add(currentUrl);

    const html = await fetchHtml(currentUrl, options);
    const pageNotices = parseHtmlTableNotices(html, {
      ...options,
      sourceUrl: currentUrl
    });
    for (const notice of pageNotices) {
      noticesById.set(notice.id, notice);
    }

    currentUrl = findNextPageUrl(html, currentUrl, options.nextPageSelector);
  }

  return Array.from(noticesById.values());
}

export function parseHtmlTableNotices(html: string, options: TableParseOptions): NormalizedWarnNotice[] {
  const { state, sourceName, sourceUrl, retrievedAt, tableSelector } = options;
  const $ = cheerio.load(html);
  const tables = tableSelector ? $(tableSelector) : $('table');
  const notices: NormalizedWarnNotice[] = [];

  tables.each((_, table) => {
    const tableEl = $(table);
    const { headers, headerRowIndex } = getHeaders($, tableEl);
    if (!headers.length) return;

    const headerIndex: Record<string, number> = {};
    headers.forEach((header, idx) => {
      const key = normalizeHeader(header);
      if (headerIndex.employer === undefined && (
        key.includes('employer') ||
        key.includes('company') ||
        key.includes('business') ||
        key.includes('establishment') ||
        key.includes('facility') ||
        key.includes('plant') ||
        key.includes('organization')
      )) {
        headerIndex.employer = idx;
      }
      if (headerIndex.city === undefined && (
        key.includes('city') ||
        key.includes('location') ||
        key.includes('town') ||
        key.includes('site')
      )) {
        headerIndex.city = idx;
      }
      if (key.includes('county')) headerIndex.county = idx;
      if (headerIndex.address === undefined && (
        key.includes('address') || key.includes('street')
      )) headerIndex.address = idx;
      if (headerIndex.noticeDate === undefined && (
        key.includes('notice') ||
        key.includes('received') ||
        key.includes('notification') ||
        key.includes('filed') ||
        key.includes('submitted')
      )) headerIndex.noticeDate = idx;
      if (headerIndex.effectiveDate === undefined && (
        key.includes('layoff') ||
        key.includes('effective') ||
        key.includes('impact') ||
        key.includes('termination') ||
        key.includes('closure') ||
        key.includes('closing') ||
        key.includes('separation')
      )) headerIndex.effectiveDate = idx;
      if (headerIndex.employees === undefined && (
        key.includes('affected') ||
        key.includes('workers') ||
        key.includes('employees') ||
        key.includes('number') ||
        key.includes('#')
      )) headerIndex.employees = idx;
      if (headerIndex.naics === undefined && (
        key.includes('naics') || key.includes('industry')
      )) headerIndex.naics = idx;
      if (headerIndex.reason === undefined && (
        key.includes('reason') ||
        key.includes('action') ||
        key.includes('closure') ||
        key.includes('layoff')
      )) headerIndex.reason = idx;
      if (headerIndex.noticeType === undefined && (
        key.includes('type') || key.includes('status')
      )) headerIndex.noticeType = idx;
      if (key.includes('naics') || key.includes('industry')) headerIndex.naics = idx;
    });

    if (headerIndex.employer === undefined) return;

    tableEl.find('tr').each((rowIdx, tr) => {
      if (rowIdx === headerRowIndex) return;
      const thCells = $(tr).find('th');
      if (thCells.length) return;
      const cells = $(tr).find('td');
      if (!cells.length) return;

      const firstCellText = normalizeCellText($, cells.eq(0));
      if (hasHeaderContent(firstCellText)) return;

      const employerCell = headerIndex.employer !== undefined ? cells.eq(headerIndex.employer) : cells.eq(0);
      const employerName = normalizeCellText($, employerCell);
      if (!employerName) return;

      const cityRaw = headerIndex.city !== undefined ? normalizeCellText($, cells.eq(headerIndex.city)) : '';
      const city = cityRaw ? parseCityFromLocation(cityRaw, state) : undefined;
      const county = headerIndex.county !== undefined ? normalizeCellText($, cells.eq(headerIndex.county)) || undefined : undefined;
      const address = headerIndex.address !== undefined ? normalizeCellText($, cells.eq(headerIndex.address)) || undefined : undefined;
      const noticeDate = headerIndex.noticeDate !== undefined ? parseDate(normalizeCellText($, cells.eq(headerIndex.noticeDate))) : undefined;
      const effectiveDate = headerIndex.effectiveDate !== undefined ? parseDate(normalizeCellText($, cells.eq(headerIndex.effectiveDate))) : undefined;
      const employeesAffected = headerIndex.employees !== undefined ? parseEmployees(normalizeCellText($, cells.eq(headerIndex.employees))) : undefined;
      const reason = headerIndex.reason !== undefined ? normalizeCellText($, cells.eq(headerIndex.reason)) || undefined : undefined;
      const noticeType = headerIndex.noticeType !== undefined ? normalizeCellText($, cells.eq(headerIndex.noticeType)) || undefined : undefined;
      const naics = headerIndex.naics !== undefined ? normalizeCellText($, cells.eq(headerIndex.naics)) || undefined : undefined;

      const rowLinks = $(tr).find('a').map((_, a) => $(a).attr('href')).get();
      const attachmentLinks = employerCell.find('a').map((_, a) => $(a).attr('href')).get();
      const attachments = (attachmentLinks.length ? attachmentLinks : rowLinks)
        .filter(Boolean)
        .map(link => ({
          url: link!.startsWith('http') ? link! : new URL(link!, sourceUrl).toString()
        }));

      const id = hashId([state, employerName, noticeDate || '', city || '', address || '']);

      notices.push(scoreNursingImpact({
        id,
        state,
        employerName,
        city,
        county,
        address,
        noticeDate,
        effectiveDate,
        employeesAffected,
        naics,
        reason: [reason, noticeType].filter(Boolean).join(' - ') || undefined,
        source: {
          state,
          sourceName,
          sourceUrl,
          retrievedAt
        },
        attachments: attachments.length ? attachments : undefined
      }));
    });
  });

  return notices;
}
