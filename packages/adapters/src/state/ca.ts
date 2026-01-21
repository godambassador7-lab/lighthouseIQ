import axios from 'axios';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';
import { scoreNursingImpact } from '@lni/core';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://edd.ca.gov/en/jobs_and_training/layoff_services_warn/';
const REPORT_URL = 'https://edd.ca.gov/siteassets/files/jobs_and_training/warn/warn_report1.xlsx';

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

async function fetchReportRows(): Promise<Array<Record<string, string>>> {
  const res = await axios.get(REPORT_URL, {
    timeout: 30000,
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });
  const workbook = xlsx.read(res.data as ArrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: '' }) as Array<Record<string, string>>;
}

function mapRowToNotice(row: Record<string, string>, retrievedAt: string): NormalizedWarnNotice | null {
  const keys = Object.keys(row);
  const headerMap: Record<string, string> = {};
  keys.forEach((key) => {
    const normalized = normalizeHeader(key);
    if (!headerMap.employer && (normalized.includes('employer') || normalized.includes('company') || normalized.includes('business'))) {
      headerMap.employer = key;
    }
    if (!headerMap.city && normalized.includes('city')) headerMap.city = key;
    if (!headerMap.county && normalized.includes('county')) headerMap.county = key;
    if (!headerMap.address && normalized.includes('address')) headerMap.address = key;
    if (!headerMap.noticeDate && (normalized.includes('notice') || normalized.includes('received'))) headerMap.noticeDate = key;
    if (!headerMap.effectiveDate && (normalized.includes('layoff') || normalized.includes('effective') || normalized.includes('separation'))) {
      headerMap.effectiveDate = key;
    }
    if (!headerMap.employees && (normalized.includes('workers') || normalized.includes('employees') || normalized.includes('affected') || normalized.includes('number'))) {
      headerMap.employees = key;
    }
    if (!headerMap.naics && normalized.includes('naics')) headerMap.naics = key;
    if (!headerMap.industry && normalized.includes('industry')) headerMap.industry = key;
  });

  const employerName = headerMap.employer ? row[headerMap.employer]?.trim() : '';
  if (!employerName) return null;

  const noticeDate = headerMap.noticeDate ? parseDate(row[headerMap.noticeDate]) : undefined;
  const effectiveDate = headerMap.effectiveDate ? parseDate(row[headerMap.effectiveDate]) : undefined;
  const employeesAffected = headerMap.employees ? parseEmployees(row[headerMap.employees]) : undefined;

  const city = headerMap.city ? row[headerMap.city]?.trim() || undefined : undefined;
  const county = headerMap.county ? row[headerMap.county]?.trim() || undefined : undefined;
  const address = headerMap.address ? row[headerMap.address]?.trim() || undefined : undefined;
  const naics = headerMap.naics ? row[headerMap.naics]?.trim() || undefined : undefined;
  const industry = headerMap.industry ? row[headerMap.industry]?.trim() || undefined : undefined;

  const id = hashId(['CA', employerName, noticeDate || '', city || '', address || '']);

  return scoreNursingImpact({
    id,
    state: 'CA',
    employerName,
    city,
    county,
    address,
    noticeDate,
    effectiveDate,
    employeesAffected,
    naics,
    reason: industry,
    source: {
      state: 'CA',
      sourceName: 'California WARN (EDD)',
      sourceUrl: SOURCE_URL,
      retrievedAt
    }
  });
}

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  const rows = await fetchReportRows();
  const notices: NormalizedWarnNotice[] = [];
  for (const row of rows) {
    const notice = mapRowToNotice(row, retrievedAt);
    if (notice) notices.push(notice);
  }
  return notices;
}

export const CAAdapter: StateAdapter = {
  state: 'CA',
  sourceName: 'California WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'CA', retrievedAt });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'CA',
          retrievedAt,
          sourceName: 'WARNTracker (CA)',
          sourceUrl: 'https://www.warntracker.com/?state=CA'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'CA', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'CA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

