import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://virginiaworks.gov/im-an-employer/retain-and-grow/warn-notices/';
const FETCH_URLS = [
  SOURCE_URL,
  'https://r.jina.ai/http://virginiaworks.gov/im-an-employer/retain-and-grow/warn-notices/',
  'https://www.vec.virginia.gov/'
];

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!match) return undefined;
  let [, month, day, year] = match;
  if (year.length === 2) year = `20${year}`;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeCellLines(html: string): string[] {
  const withBreaks = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/br>/gi, '\n');
  const $ = cheerio.load(`<div>${withBreaks}</div>`);
  const text = $('div').text();
  return text.split('\n').map(line => line.trim()).filter(Boolean);
}

function parseCityFromLocation(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(.+?),\s*VA\b/i);
  return match ? match[1].trim() : value.trim();
}

async function fetchWithFallback(urls: string[]): Promise<string> {
  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
        }
      });
      return res.data as string;
    } catch {
      continue;
    }
  }
  return '';
}

export const VAAdapter: StateAdapter = {
  state: 'VA',
  sourceName: 'Virginia Works WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    if (SOURCE_URL && !SOURCE_URL.startsWith('TODO')) {
      const html = await fetchWithFallback(FETCH_URLS);
      if (html) {
        const $ = cheerio.load(html);
        $('#warn-notice-table tbody tr').each((_, tr) => {
          const tds = $(tr).find('td');
          if (tds.length < 8) return;

          const companyHtml = $(tds[0]).html() || '';
          const lines = normalizeCellLines(companyHtml);
          const employerName = $(tds[0]).find('a').first().text().trim() || lines[0];
          if (!employerName) return;

          const address = lines.length > 1 ? lines.slice(1).join(', ') : undefined;
          const noticeDate = parseDate($(tds[1]).text().trim());
          const effectiveDate = parseDate($(tds[2]).text().trim());
          const employeesAffectedRaw = $(tds[3]).text().replace(/[^0-9]/g, '');
          const employeesAffected = employeesAffectedRaw ? Number.parseInt(employeesAffectedRaw, 10) : undefined;
          const location = $(tds[4]).text().trim();
          const city = parseCityFromLocation(location);
          const contact = $(tds[5]).text().trim() || undefined;
          const noticeType = $(tds[6]).text().trim() || undefined;

          const attachmentUrl = $(tds[0]).find('a').attr('href');

          const id = hashId(['VA', employerName, noticeDate || '', city || '', address || '']);

          const notice: NormalizedWarnNotice = {
            id,
            state: 'VA',
            employerName,
            city,
            address,
            noticeDate,
            effectiveDate,
            employeesAffected,
            reason: noticeType,
            source: {
              state: 'VA',
              sourceName: 'Virginia Works WARN',
              sourceUrl: SOURCE_URL,
              retrievedAt
            },
            attachments: attachmentUrl
              ? [{ url: attachmentUrl, label: 'WARN Notice PDF', contentType: 'application/pdf' }]
              : undefined,
            rawText: [location, contact].filter(Boolean).join(' | ') || undefined
          };

          notices.push(scoreNursingImpact(notice));
        });
      }
    }

    return {
      state: 'VA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
