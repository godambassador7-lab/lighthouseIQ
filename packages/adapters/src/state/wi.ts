import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://dwd.wisconsin.gov/dislocatedworker/warn/';
const SHEET_ID = '1cyZiHZcepBI7ShB3dMcRprUFRG24lbwEnEDRBMhAqsA';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Originals`;

function parseYyyyMmDd(value?: string): string | undefined {
  if (!value) return undefined;
  const s = value.trim();
  if (!/^\d{8}$/.test(s)) return undefined;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function parseDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

export const WIAdapter: StateAdapter = {
  state: 'WI',
  sourceName: 'Wisconsin WARN (DWD)',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const csvText = (await axios.get(CSV_URL)).data as string;
    const rows = parse(csvText, { columns: true, skip_empty_lines: true });

    const notices: NormalizedWarnNotice[] = rows.map((row: any) => {
      const employerName = String(row['Company'] ?? '').trim();
      const city = String(row['City'] ?? '').trim() || undefined;
      const county = String(row['County'] ?? '').trim() || undefined;
      const employeesAffected = Number.parseInt(String(row['AffectedWorkers'] ?? ''), 10);
      const noticeDate = parseYyyyMmDd(String(row['NoticeRcvd'] ?? ''));
      const effectiveDate = parseDate(String(row['LayoffBeginDate'] ?? ''));
      const reason = String(row['NoticeType'] ?? '').trim() || undefined;
      const naics = String(row['NAICSDescription'] ?? '').trim() || undefined;
      const sourceId = String(row['PK'] ?? '').trim() || undefined;

      const notice: NormalizedWarnNotice = {
        id: `WI:${sourceId ?? employerName}:${noticeDate ?? retrievedAt.slice(0, 10)}`,
        state: 'WI',
        employerName,
        city,
        county,
        employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
        noticeDate,
        effectiveDate,
        naics,
        reason,
        source: {
          state: 'WI',
          sourceName: 'Wisconsin WARN (DWD)',
          sourceUrl: SOURCE_URL,
          sourceId,
          retrievedAt
        }
      };

      return scoreNursingImpact(notice);
    });

    return {
      state: 'WI',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
