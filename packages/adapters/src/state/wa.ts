import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://esd.wa.gov/employer-requirements/layoffs-and-employee-notifications/worker-adjustment-and-retraining-notification-warn-layoff-and-closure-database';
const DATA_URL = 'https://fortress.wa.gov/esd/file/WARN';

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
  const parts = value.split(',').map(part => part.trim()).filter(Boolean);
  return parts.length ? parts[0] : undefined;
}

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  const res = await axios.get(DATA_URL, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });
  const $ = cheerio.load(res.data as string);
  const table = $('#ucPSW_gvMain');
  if (!table.length) return [];

  const headers = table.find('th').map((_, th) => $(th).text().trim()).get();
  const headerIndex: Record<string, number> = {};
  headers.forEach((header, idx) => {
    const key = normalizeHeader(header);
    if (key.includes('company')) headerIndex.employer = idx;
    if (key.includes('location')) headerIndex.location = idx;
    if (key.includes('layoff start')) headerIndex.effectiveDate = idx;
    if (key.includes('workers')) headerIndex.employees = idx;
    if (key.includes('closure')) headerIndex.reason = idx;
    if (key.includes('type')) headerIndex.noticeType = idx;
    if (key.includes('received')) headerIndex.noticeDate = idx;
    if (key.includes('notice')) headerIndex.attachment = idx;
  });

  const notices: NormalizedWarnNotice[] = [];

  table.find('tr').each((_, tr) => {
    const cells = $(tr).find('td');
    if (!cells.length) return;

    const employerName = headerIndex.employer !== undefined
      ? cells.eq(headerIndex.employer).text().replace(/\s+/g, ' ').trim()
      : '';
    if (!employerName) return;

    const location = headerIndex.location !== undefined ? cells.eq(headerIndex.location).text().trim() : '';
    const city = parseCityFromLocation(location);
    const noticeDate = headerIndex.noticeDate !== undefined ? parseDate(cells.eq(headerIndex.noticeDate).text()) : undefined;
    const effectiveDate = headerIndex.effectiveDate !== undefined ? parseDate(cells.eq(headerIndex.effectiveDate).text()) : undefined;
    const employeesAffected = headerIndex.employees !== undefined ? parseEmployees(cells.eq(headerIndex.employees).text()) : undefined;
    const reason = headerIndex.reason !== undefined ? cells.eq(headerIndex.reason).text().trim() || undefined : undefined;
    const noticeType = headerIndex.noticeType !== undefined ? cells.eq(headerIndex.noticeType).text().trim() || undefined : undefined;

    const attachmentCell = headerIndex.attachment !== undefined ? cells.eq(headerIndex.attachment) : cells.last();
    const attachmentLinks = attachmentCell.find('a').map((_, a) => $(a).attr('href')).get();
    const attachments = attachmentLinks
      .filter(Boolean)
      .map(link => ({
        url: link!.startsWith('http') ? link! : new URL(link!, DATA_URL).toString()
      }));

    const id = hashId(['WA', employerName, noticeDate || '', city || '', location]);

    notices.push(scoreNursingImpact({
      id,
      state: 'WA',
      employerName,
      city,
      address: location || undefined,
      noticeDate,
      effectiveDate,
      employeesAffected,
      reason: [reason, noticeType].filter(Boolean).join(' - ') || undefined,
      source: {
        state: 'WA',
        sourceName: 'Washington WARN',
        sourceUrl: SOURCE_URL,
        retrievedAt
      },
      attachments: attachments.length ? attachments : undefined
    }));
  });

  return notices;
}

export const WAAdapter: StateAdapter = {
  state: 'WA',
  sourceName: 'Washington WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'WA', retrievedAt });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'WA',
          retrievedAt,
          sourceName: 'WARNTracker (WA)',
          sourceUrl: 'https://www.warntracker.com/?state=WA'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'WA', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'WA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

