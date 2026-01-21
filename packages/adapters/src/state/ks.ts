import axios from 'axios';
import * as crypto from 'crypto';
import { parse } from 'csv-parse/sync';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Kansas WARN data is published via a public Google Sheet (WARN Database).
const SHEET_ID = '1W24JjWtuDSBL1UCK6UYe7zlv04lxi_9Iv0s1Ehc4YhU';
const SOURCE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (match) {
    let [, month, day, year] = match;
    if (year.length === 2) year = `20${year}`;
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

export const KSAdapter: StateAdapter = {
  state: 'KS',
  sourceName: 'Kansas WARN Database',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    try {
      const response = await axios.get(CSV_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
        }
      });

      const records = parse(response.data as string, {
        columns: true,
        skip_empty_lines: true
      }) as Array<Record<string, string>>;

      for (const row of records) {
        if (row.State && row.State.toUpperCase() !== 'KANSAS') continue;

        const employerName = row.Company?.trim() || '';
        if (!employerName) continue;

        const noticeDate = parseDate(row['WARN Received Date']);
        const effectiveDate = parseDate(row['Effective Date']);
        const employeesAffected = parseEmployees(row['Number of Workers']);

        const id = hashId(['KS', employerName, noticeDate || '', row.City || '']);
        const notice: NormalizedWarnNotice = {
          id,
          state: 'KS',
          employerName,
          city: row.City?.trim() || undefined,
          county: row.County?.trim() || undefined,
          noticeDate,
          effectiveDate,
          employeesAffected,
          reason: row['Closure/Layoff']?.trim() || undefined,
          rawText: row.Notes?.trim() || undefined,
          source: {
            state: 'KS',
            sourceName: 'Kansas WARN Database',
            sourceUrl: SOURCE_URL,
            retrievedAt
          }
        };

        notices.push(scoreNursingImpact(notice));
      }
    } catch (err) {
      console.warn('KS adapter: Error fetching data:', (err as Error).message);
    }

    return {
      state: 'KS',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
