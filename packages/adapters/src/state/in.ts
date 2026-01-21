import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Indiana DWD publishes current WARN notices at this URL
// Table columns: Company, City, Affected Workers, Notice Date, LO/CL Date, NAICS, Description, Notice Type
const SOURCE_URL = 'https://www.in.gov/dwd/warn-notices/current-warn-notices/';

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  // Indiana uses MM/DD/YYYY format
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return undefined;
}

export const INAdapter: StateAdapter = {
  state: 'IN',
  sourceName: 'Indiana DWD WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const html = (await axios.get(SOURCE_URL, { timeout: 30000 })).data as string;
    const $ = cheerio.load(html);

    const notices: NormalizedWarnNotice[] = [];

    // Table columns: Company, City, Affected Workers, Notice Date, LO/CL Date, NAICS, Description, Notice Type
    // Use tbody tr specifically to avoid header row
    $('tbody tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 5) return;

      // Get text and normalize whitespace
      const getText = (idx: number): string => {
        if (idx >= tds.length) return '';
        return $(tds[idx]).text().replace(/\s+/g, ' ').trim();
      };

      const employerName = getText(0);
      // Skip empty rows or header rows
      if (!employerName || employerName.toLowerCase() === 'company') return;

      const city = getText(1) || undefined;
      const employeesAffectedRaw = getText(2).replace(/,/g, '');
      const noticeDateRaw = getText(3);
      const effectiveDateRaw = getText(4);
      const naics = getText(5) || undefined;
      const industryDesc = getText(6) || undefined;
      const noticeType = getText(7) || undefined;

      const employeesAffected = Number.parseInt(employeesAffectedRaw, 10);
      const noticeDate = parseDate(noticeDateRaw);
      const effectiveDate = parseDate(effectiveDateRaw);

      const id = hashId(['IN', employerName, noticeDate || '', city || '']);

      const notice: NormalizedWarnNotice = {
        id,
        state: 'IN',
        employerName,
        city,
        noticeDate,
        effectiveDate,
        employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
        naics: naics || undefined,
        reason: [industryDesc, noticeType].filter(Boolean).join(' - ') || undefined,
        source: {
          state: 'IN',
          sourceName: 'Indiana DWD WARN',
          sourceUrl: SOURCE_URL,
          retrievedAt
        }
      };

      notices.push(scoreNursingImpact(notice));
    });

    return {
      state: 'IN',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
