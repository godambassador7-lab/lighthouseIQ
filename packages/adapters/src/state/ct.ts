import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://portal.ct.gov/dol/knowledge-base/articles/employment-and-training/rapid-response/warn';
const LIST_URL = 'https://dolpublicdocumentlibrary.ct.gov/CsblrCategory?prefix=%2Frapid_response%2Fwarn_documents';

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDateFromText(value: string): string | undefined {
  const match = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (match) {
    let [, month, day, year] = match;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const altMatch = value.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (altMatch) {
    const [, year, month, day] = altMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const compactMatch = value.match(/(\d{4})(\d{2})(\d{2})/);
  if (compactMatch) {
    const [, year, month, day] = compactMatch;
    return `${year}-${month}-${day}`;
  }
  return undefined;
}

function cleanEmployerName(value: string): string {
  return value
    .replace(/\.(pdf|docx?|xlsx?)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWarnDocuments(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  const res = await axios.get(LIST_URL, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });
  const html = res.data as string;
  if (html.includes('Request Rejected')) return [];

  const $ = cheerio.load(html);
  const notices: NormalizedWarnNotice[] = [];

  $('a').each((_, link) => {
    const href = $(link).attr('href') || '';
    const text = $(link).text().trim();
    if (!href) return;
    if (!/\.(pdf|docx?|xlsx?)$/i.test(href) && !/warn_documents/i.test(href)) return;

    const absoluteUrl = href.startsWith('http')
      ? href
      : new URL(href, LIST_URL).toString();

    const filename = decodeURIComponent(absoluteUrl.split('/').pop() || '');
    const displayName = text || filename;
    const employerName = cleanEmployerName(displayName);
    if (!employerName) return;

    const noticeDate = parseDateFromText(displayName) || parseDateFromText(filename);

    const id = hashId(['CT', employerName, noticeDate || '', absoluteUrl]);

    notices.push(scoreNursingImpact({
      id,
      state: 'CT',
      employerName,
      noticeDate,
      source: {
        state: 'CT',
        sourceName: 'Connecticut WARN',
        sourceUrl: SOURCE_URL,
        sourceId: filename,
        retrievedAt
      },
      attachments: [
        {
          url: absoluteUrl,
          label: filename || 'WARN Notice Document'
        }
      ]
    }));
  });

  return notices;
}

export const CTAdapter: StateAdapter = {
  state: 'CT',
  sourceName: 'Connecticut WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    let notices: NormalizedWarnNotice[] = [];
    try {
      notices = await fetchWarnDocuments(retrievedAt);
    } catch {
      notices = [];
    }
    if (!notices.length) {
      try {
        notices = await fetchLayoffdataNotices({ state: 'CT', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'CT',
          retrievedAt,
          sourceName: 'WARNTracker (CT)',
          sourceUrl: 'https://www.warntracker.com/?state=CT'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'CT', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'CT',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

