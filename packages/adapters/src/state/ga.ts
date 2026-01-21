import axios from 'axios';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.warntracker.com/?state=GA';
const FETCH_URLS = [
  SOURCE_URL,
  'https://www.tcsg.edu/warn-public-view/',
  'https://dol.georgia.gov/employers'
];

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
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

function stripMarkdownLinks(value: string): string {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}

function parseMarkdownTable(text: string): Array<Record<string, string>> {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 2; i += 1) {
    const header = lines[i];
    const separator = lines[i + 1];
    if (!header.includes('|') || !separator.includes('|')) continue;
    if (!separator.replace(/\s/g, '').includes('---')) continue;

    const headers = header.split('|').slice(1, -1).map(col => col.trim().replace(/\s+0$/, ''));
    const rows: Array<Record<string, string>> = [];

    for (let j = i + 2; j < lines.length; j += 1) {
      const line = lines[j];
      if (!line.includes('|')) break;
      const cells = line.split('|').slice(1, -1).map(cell => stripMarkdownLinks(cell));
      if (cells.length !== headers.length) continue;
      const record: Record<string, string> = {};
      headers.forEach((col, idx) => {
        record[col] = cells[idx];
      });
      rows.push(record);
    }

    if (headers.some(col => /company/i.test(col))) {
      return rows;
    }
  }
  return [];
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
  if (parts.length < 2) return undefined;
  return parts[parts.length - 2];
}

function parseAddressFromLocation(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parts = value.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length < 3) return undefined;
  return parts.slice(0, parts.length - 2).join(', ');
}

export const GAAdapter: StateAdapter = {
  state: 'GA',
  sourceName: 'WARNTracker (Georgia)',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    if (SOURCE_URL && !SOURCE_URL.startsWith('TODO')) {
      const text = await fetchWithFallback([
        'https://r.jina.ai/http://www.warntracker.com/?state=GA',
        ...FETCH_URLS
      ]);
      if (text) {
        const rows = parseMarkdownTable(text);
        for (const row of rows) {
          const employerName = row['Company Name'] || row['Company'] || '';
          if (!employerName) continue;

          const noticeDate = row['Notice Date']?.trim() || undefined;
          const effectiveDate = row['Layoff date']?.trim() || undefined;
          const employeesAffected = parseEmployees(row['# Laid off']);
          const location = row['City/Jurisdiction'] || row['City'] || row['Location'];
          const city = parseCityFromLocation(location);
          const address = parseAddressFromLocation(location);

          const id = hashId(['GA', employerName, noticeDate || '', city || '', address || '']);

          const notice: NormalizedWarnNotice = {
            id,
            state: 'GA',
            employerName,
            city,
            address,
            noticeDate,
            effectiveDate,
            employeesAffected,
            source: {
              state: 'GA',
              sourceName: 'WARNTracker (Georgia)',
              sourceUrl: SOURCE_URL,
              retrievedAt
            },
            rawText: location?.trim() || undefined
          };

          notices.push(scoreNursingImpact(notice));
        }
      }
    }

    return {
      state: 'GA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
