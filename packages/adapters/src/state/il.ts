import axios from 'axios';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Illinois WARN monthly reports are published as XLSX on Illinois WorkNet.
const ARCHIVE_URL = 'https://www.illinoisworknet.com/LayoffRecovery/Pages/ArchivedWARNReports.aspx';
const JINA_ARCHIVE = `https://r.jina.ai/http://${ARCHIVE_URL.replace(/^https?:\/\//, '')}`;

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const clean = String(dateStr).trim();
  const match = clean.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (match) {
    let [, month, day, year] = match;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const longMatch = clean.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (longMatch) {
    const months: Record<string, string> = {
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12'
    };
    const [, monthName, day, year] = longMatch;
    const month = months[monthName.toLowerCase()];
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }
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

function extractXlsxLinks(text: string, maxLinks: number): string[] {
  const matches = text.match(/https?:\/\/www\.illinoisworknet\.com\/DownloadPrint\/[^)\s]+\.xlsx/gi) || [];
  const unique = Array.from(new Set(matches.map(link => link.replace(/&amp;/g, '&'))));
  return unique.slice(0, maxLinks);
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

export const ILAdapter: StateAdapter = {
  state: 'IL',
  sourceName: 'Illinois WARN (WorkNet)',
  sourceUrl: ARCHIVE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    try {
      const response = await axios.get(JINA_ARCHIVE, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
        }
      });
      const text = response.data as string;
      const reportLinks = extractXlsxLinks(text, 3);

      for (const reportUrl of reportLinks) {
        try {
          const fileResponse = await axios.get(reportUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
            }
          });
          const workbook = xlsx.read(fileResponse.data, { type: 'buffer' });
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const records = parseSheetRows(sheet);

            for (const record of records) {
              const employerName = getValue(record, ['company', 'employer', 'companyname', 'employername']) || 'Unknown';
              const city = getValue(record, ['city', 'location', 'municipality']);
              const county = getValue(record, ['county', 'countyname']);
              const noticeDate = parseDate(getValue(record, ['noticedate', 'datereceived', 'noticedt', 'receiveddate']));
              const effectiveDate = parseDate(getValue(record, ['effective', 'layoffdate', 'separationdate', 'firstseparationdate']));
              const employeesAffectedRaw = getValue(record, ['numberaffected', 'affectedworkers', 'affectedemployees', 'workersaffected']);
              const employeesAffected = employeesAffectedRaw
                ? Number.parseInt(employeesAffectedRaw.replace(/[^0-9]/g, ''), 10)
                : undefined;
              const reason = getValue(record, ['notice', 'type', 'action', 'layofftype']);

              const id = hashId(['IL', employerName, noticeDate || effectiveDate || '', reportUrl]);
              const notice: NormalizedWarnNotice = {
                id,
                state: 'IL',
                employerName,
                city,
                county,
                noticeDate,
                effectiveDate,
                employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
                reason,
                source: {
                  state: 'IL',
                  sourceName: 'Illinois WARN (WorkNet)',
                  sourceUrl: reportUrl,
                  retrievedAt
                },
                attachments: [{
                  url: reportUrl,
                  label: 'Monthly WARN Report (XLSX)',
                  contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }]
              };

              notices.push(scoreNursingImpact(notice));
            }
          }
        } catch (err) {
          console.warn('IL adapter: Failed to parse report:', reportUrl, (err as Error).message);
        }
      }
    } catch (err) {
      console.warn('IL adapter: Error fetching archive page:', (err as Error).message);
    }

    const seen = new Set<string>();
    const deduped = notices.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return {
      state: 'IL',
      fetchedAt: retrievedAt,
      notices: deduped
    };
  }
};
