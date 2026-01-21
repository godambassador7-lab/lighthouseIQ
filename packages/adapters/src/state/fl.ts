import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://floridajobs.org/office-directory/division-of-workforce-services/workforce-programs/reemployment-and-emergency-assistance-coordination-team-react/warn-notices';
const FETCH_URLS = [
  SOURCE_URL,
  'https://r.jina.ai/http://floridajobs.org/office-directory/division-of-workforce-services/workforce-programs/reemployment-and-emergency-assistance-coordination-team-react/warn-notices',
  'https://r.jina.ai/http://www.floridajobs.org/'
];
const RECORDS_BASE_URL = 'https://reactwarn.floridajobs.org/WarnList/Records';
const DOWNLOAD_URL = 'https://reactwarn.floridajobs.org/WarnList/Download';

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!match) return undefined;
  let [, month, day, year] = match;
  if (year.length === 2) year = `20${year}`;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseFirstDate(value: string): string | undefined {
  const match = value.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);
  return match ? parseDate(match[1]) : undefined;
}

function parseCityFromLine(value: string): string | undefined {
  const match = value.match(/^(.+?),\s*FL\b/i);
  return match ? match[1].trim() : undefined;
}

function normalizeCellLines(html: string): string[] {
  const withBreaks = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/br>/gi, '\n');
  const $ = cheerio.load(`<div>${withBreaks}</div>`);
  const text = $('div').text();
  return text.split('\n').map(line => line.trim()).filter(Boolean);
}

async function fetchWithFallback(urls: string[]): Promise<void> {
  for (const url of urls) {
    try {
      await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
        }
      });
      return;
    } catch {
      continue;
    }
  }
}

async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });
  return res.data as string;
}

async function fetchRecordsHtml(year: number): Promise<string> {
  const url = `${RECORDS_BASE_URL}?year=${year}`;
  try {
    return await fetchHtml(url);
  } catch {
    const jinaUrl = `https://r.jina.ai/http://reactwarn.floridajobs.org/WarnList/Records?year=${year}`;
    return await fetchHtml(jinaUrl);
  }
}

export const FLAdapter: StateAdapter = {
  state: 'FL',
  sourceName: 'Florida REACT WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // Scaffold: replace SOURCE_URL and implement parsing.
    if (SOURCE_URL && !SOURCE_URL.startsWith('TODO')) {
      await fetchWithFallback(FETCH_URLS);
    }

    const notices: NormalizedWarnNotice[] = [];
    const now = new Date();
    const years = [now.getFullYear(), now.getFullYear() - 1];

    for (const year of years) {
      const html = await fetchRecordsHtml(year);
      const $ = cheerio.load(html);

      $('#DataTable tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 6) return;

        const cellHtml = $(tds[0]).html() || '';
        const lines = normalizeCellLines(cellHtml);
        const employerName = $(tds[0]).find('b').first().text().trim() || lines[0];
        if (!employerName) return;

        const linesWithoutEmployer = lines[0] === employerName ? lines.slice(1) : lines;
        const locationLine = linesWithoutEmployer[linesWithoutEmployer.length - 1];
        const city = locationLine ? parseCityFromLine(locationLine) : undefined;
        const address = linesWithoutEmployer.length >= 2
          ? linesWithoutEmployer[linesWithoutEmployer.length - 2]
          : undefined;

        const noticeDate = parseFirstDate($(tds[1]).text());
        const effectiveDate = parseFirstDate($(tds[2]).text());
        const employeesAffectedRaw = $(tds[3]).text().replace(/[^0-9]/g, '');
        const employeesAffected = employeesAffectedRaw ? Number.parseInt(employeesAffectedRaw, 10) : undefined;
        const industry = $(tds[4]).text().trim() || undefined;

        const fileInput = $(tds[5]).find('input[type="hidden"]').first();
        const fileNameRaw = fileInput.val() as string | undefined;
        const fileName = fileNameRaw ? decodeURIComponent(fileNameRaw.replace(/\+/g, ' ')) : undefined;
        const attachmentUrl = fileName
          ? `${DOWNLOAD_URL}?file=${encodeURIComponent(fileName)}`
          : undefined;

        const id = hashId(['FL', employerName, noticeDate || '', city || '', address || '']);

        const notice: NormalizedWarnNotice = {
          id,
          state: 'FL',
          employerName,
          city,
          address,
          noticeDate,
          effectiveDate,
          employeesAffected,
          reason: industry,
          source: {
            state: 'FL',
            sourceName: 'Florida REACT WARN',
            sourceUrl: SOURCE_URL,
            sourceId: fileNameRaw,
            retrievedAt
          },
          attachments: attachmentUrl
            ? [{ url: attachmentUrl, label: 'WARN Notice PDF', contentType: 'application/pdf' }]
            : undefined,
          rawText: linesWithoutEmployer.join(' | ') || undefined
        };

        notices.push(scoreNursingImpact(notice));
      });
    }

    return {
      state: 'FL',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
