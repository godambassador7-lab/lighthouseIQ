import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.nj.gov/labor/worker-protections/layoffs/warn/';

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!match) return undefined;
  let [, month, day, year] = match;
  if (year.length === 2) year = `20${year}`;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseEmployees(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9]/g, '');
  if (!cleaned) return undefined;
  const num = Number.parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : undefined;
}

function parseCityFromLocation(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(.+?),\s*NJ\b/i);
  return match ? match[1].trim() : value.trim();
}

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  const res = await axios.get(SOURCE_URL, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });
  const html = res.data as string;
  const $ = cheerio.load(html);
  const table = $('table').first();
  if (!table.length) return [];

  const headers = table.find('thead th').map((_, th) => $(th).text().trim()).get();
  const headerIndex: Record<string, number> = {};
  headers.forEach((header, idx) => {
    const key = normalizeHeader(header);
    if (key.includes('employer') || key.includes('company')) headerIndex.employer = idx;
    if (key.includes('city') || key.includes('location') || key.includes('town')) headerIndex.city = idx;
    if (key.includes('county')) headerIndex.county = idx;
    if (key.includes('address')) headerIndex.address = idx;
    if (key.includes('notice') || key.includes('received') || key.includes('notification')) headerIndex.noticeDate = idx;
    if (key.includes('layoff') || key.includes('effective') || key.includes('impact') || key.includes('termination')) headerIndex.effectiveDate = idx;
    if (key.includes('affected') || key.includes('workers') || key.includes('employees')) headerIndex.employees = idx;
    if (key.includes('reason') || key.includes('type')) headerIndex.reason = idx;
    if (key.includes('naics') || key.includes('industry')) headerIndex.naics = idx;
  });

  const notices: NormalizedWarnNotice[] = [];

  table.find('tbody tr').each((_, tr) => {
    const cells = $(tr).find('td');
    if (!cells.length) return;

    const employerCell = headerIndex.employer !== undefined ? cells.eq(headerIndex.employer) : cells.eq(0);
    const employerName = employerCell.text().replace(/\s+/g, ' ').trim();
    if (!employerName) return;

    const cityRaw = headerIndex.city !== undefined ? cells.eq(headerIndex.city).text().trim() : '';
    const city = cityRaw ? parseCityFromLocation(cityRaw) : undefined;
    const county = headerIndex.county !== undefined ? cells.eq(headerIndex.county).text().trim() || undefined : undefined;
    const address = headerIndex.address !== undefined ? cells.eq(headerIndex.address).text().trim() || undefined : undefined;
    const noticeDate = headerIndex.noticeDate !== undefined ? parseDate(cells.eq(headerIndex.noticeDate).text()) : undefined;
    const effectiveDate = headerIndex.effectiveDate !== undefined ? parseDate(cells.eq(headerIndex.effectiveDate).text()) : undefined;
    const employeesAffected = headerIndex.employees !== undefined ? parseEmployees(cells.eq(headerIndex.employees).text()) : undefined;
    const reason = headerIndex.reason !== undefined ? cells.eq(headerIndex.reason).text().trim() || undefined : undefined;
    const naics = headerIndex.naics !== undefined ? cells.eq(headerIndex.naics).text().trim() || undefined : undefined;

    const attachmentLinks = employerCell.find('a').map((_, a) => $(a).attr('href')).get();
    const attachments = attachmentLinks
      .filter(Boolean)
      .map(link => ({
        url: link!.startsWith('http') ? link! : new URL(link!, SOURCE_URL).toString()
      }));

    const id = hashId(['NJ', employerName, noticeDate || '', city || '', address || '']);

    notices.push(scoreNursingImpact({
      id,
      state: 'NJ',
      employerName,
      city,
      county,
      address,
      noticeDate,
      effectiveDate,
      employeesAffected,
      naics,
      reason,
      source: {
        state: 'NJ',
        sourceName: 'New Jersey WARN',
        sourceUrl: SOURCE_URL,
        retrievedAt
      },
      attachments: attachments.length ? attachments : undefined
    }));
  });

  return notices;
}

export const NJAdapter: StateAdapter = {
  state: 'NJ',
  sourceName: 'New Jersey WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    let notices: NormalizedWarnNotice[] = [];
    try {
      notices = await fetchOfficialNotices(retrievedAt);
    } catch {
      notices = [];
    }
    if (!notices.length) {
      try {
        notices = await fetchLayoffdataNotices({ state: 'NJ', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'NJ',
          retrievedAt,
          sourceName: 'WARNTracker (NJ)',
          sourceUrl: 'https://www.warntracker.com/?state=NJ'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'NJ', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'NJ',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

