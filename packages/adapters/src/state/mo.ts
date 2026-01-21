import axios from 'axios';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Missouri publishes WARN logs as XLSX files (e.g., "WARN Log CY 2025.xlsx").
const BASE_URL = 'https://jobs.mo.gov/sites/jobs.mo.gov/files';

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const text = String(dateStr).trim();
  const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (match) {
    let [, month, day, year] = match;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  return undefined;
}

function normalizeKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findHeaderRow(rows: Array<Array<string | number>>): number {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const normalized = row.map(cell => normalizeKey(String(cell || '')));
    if (normalized.includes('company') || normalized.includes('employer')) {
      return i;
    }
  }
  return -1;
}

function mapRowToRecord(headers: string[], row: Array<string | number>): Record<string, string> {
  const record: Record<string, string> = {};
  for (let i = 0; i < headers.length; i += 1) {
    const key = headers[i];
    if (!key) continue;
    record[key] = String(row[i] ?? '').trim();
  }
  return record;
}

function getValue(record: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
}

function parseSheetRows(sheet: xlsx.WorkSheet): Array<Record<string, string>> {
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as Array<Array<string | number>>;
  const headerRowIndex = findHeaderRow(rows);
  if (headerRowIndex === -1) return [];

  const headerRow = rows[headerRowIndex].map(cell => String(cell || '').trim());
  const normalizedHeaders = headerRow.map(h => normalizeKey(h));
  const records: Array<Record<string, string>> = [];

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const record = mapRowToRecord(normalizedHeaders, row);
    const employerName = getValue(record, ['company', 'employer', 'companyname', 'employername']);
    if (!employerName) continue;
    records.push(record);
  }

  return records;
}

function buildWarnLogUrl(year: number): string {
  const filename = `WARN Log CY ${year}.xlsx`;
  return `${BASE_URL}/${encodeURIComponent(filename)}`;
}

export const MOAdapter: StateAdapter = {
  state: 'MO',
  sourceName: 'Missouri WARN Log',
  sourceUrl: `${BASE_URL}/WARN%20Log%20CY%202025.xlsx`,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];
    const currentYear = new Date().getFullYear();
    const yearsToTry = [currentYear, currentYear - 1];

    for (const year of yearsToTry) {
      const reportUrl = buildWarnLogUrl(year);
      try {
        const response = await axios.get(reportUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
          }
        });
        const workbook = xlsx.read(response.data, { type: 'buffer' });

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const records = parseSheetRows(sheet);

          for (const record of records) {
            const employerName = getValue(record, ['company', 'employer', 'companyname', 'employername']) || 'Unknown';
            const city = getValue(record, ['city', 'location']);
            const county = getValue(record, ['county', 'countyname']);
            const noticeDate = parseDate(getValue(record, ['noticedate', 'date', 'datereceived']));
            const effectiveDate = parseDate(getValue(record, ['effectivedate', 'layoffdate', 'lo/cldate', 'startdate']));
            const employeesAffectedRaw = getValue(record, ['numberaffected', 'affectedworkers', 'employeesaffected', 'workersaffected']);
            const employeesAffected = employeesAffectedRaw
              ? Number.parseInt(employeesAffectedRaw.replace(/[^0-9]/g, ''), 10)
              : undefined;
            const reason = getValue(record, ['type', 'layofftype', 'notice', 'action']);

            const id = hashId(['MO', employerName, noticeDate || effectiveDate || '', reportUrl]);
            const notice: NormalizedWarnNotice = {
              id,
              state: 'MO',
              employerName,
              city,
              county,
              noticeDate,
              effectiveDate,
              employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
              reason,
              source: {
                state: 'MO',
                sourceName: 'Missouri WARN Log',
                sourceUrl: reportUrl,
                retrievedAt
              },
              attachments: [{
                url: reportUrl,
                label: `WARN Log CY ${year} (XLSX)`,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              }]
            };

            notices.push(scoreNursingImpact(notice));
          }
        }
      } catch (err) {
        console.warn(`MO adapter: Failed to fetch WARN log for ${year}:`, (err as Error).message);
      }
    }

    const seen = new Set<string>();
    const deduped = notices.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return {
      state: 'MO',
      fetchedAt: retrievedAt,
      notices: deduped
    };
  }
};
