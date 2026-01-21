import axios from 'axios';
import * as crypto from 'crypto';
import { parse } from 'csv-parse/sync';
import type { NormalizedWarnNotice, USStateAbbrev } from '@lni/core';
import { scoreNursingImpact } from '@lni/core';

const SHEET_IDS = [
  '1Qx6lv3zAL9YTsKJQNALa2GqBLXq0RER2lHvzyx32pRs', // Current WARN Database (2025+)
  '1ayO8dl7sXaIYBAwkBGRUjbDms6MAbZFvvxxRp8IyxvY'  // Historical WARN Database
];

const STATE_NAME_BY_ABBREV: Record<USStateAbbrev, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
  PR: 'Puerto Rico'
};

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function mergeNotice(existing: NormalizedWarnNotice, incoming: NormalizedWarnNotice): NormalizedWarnNotice {
  return {
    ...existing,
    employerName: existing.employerName || incoming.employerName,
    city: existing.city || incoming.city,
    county: existing.county || incoming.county,
    address: existing.address || incoming.address,
    noticeDate: existing.noticeDate || incoming.noticeDate,
    effectiveDate: existing.effectiveDate || incoming.effectiveDate,
    employeesAffected: existing.employeesAffected ?? incoming.employeesAffected,
    naics: existing.naics || incoming.naics,
    reason: existing.reason || incoming.reason,
    rawText: existing.rawText || incoming.rawText,
    attachments: existing.attachments || incoming.attachments,
    source: existing.source
  };
}

function parseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
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

async function fetchSheetCsv(sheetId: string): Promise<Array<Record<string, string>>> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  const res = await axios.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });
  const records = parse(res.data as string, {
    columns: true,
    skip_empty_lines: true
  }) as Array<Record<string, string>>;
  return records;
}

export async function fetchLayoffdataNotices(params: {
  state: USStateAbbrev;
  retrievedAt: string;
}): Promise<NormalizedWarnNotice[]> {
  const { state, retrievedAt } = params;
  const noticesById = new Map<string, NormalizedWarnNotice>();

  for (const sheetId of SHEET_IDS) {
    let rows: Array<Record<string, string>> = [];
    try {
      rows = await fetchSheetCsv(sheetId);
    } catch {
      continue;
    }

    for (const row of rows) {
      const rowState = row.State?.trim() || '';
      const matchesAbbrev = rowState.toUpperCase() === state;
      const matchesName = rowState.toLowerCase() === STATE_NAME_BY_ABBREV[state].toLowerCase();
      if (!matchesAbbrev && !matchesName) continue;
      const employerName = row.Company?.trim() || '';
      if (!employerName) continue;

      const city = row.City?.trim() || undefined;
      const county = row.County?.trim() || undefined;
      const noticeDate = parseDate(row['WARN Received Date']);
      const effectiveDate = parseDate(row['Effective Date']);
      const employeesAffected = parseEmployees(row['Number of Workers']);
      const industry = row.Industry?.trim() || undefined;
      const reason = [row['Closure / Layoff'], row['Temporary/Permanent']].filter(Boolean).join(' - ') || undefined;

      const id = hashId([state, employerName, noticeDate || '', city || '']);

      const notice: NormalizedWarnNotice = {
        id,
        state,
        employerName,
        city,
        county,
        noticeDate,
        effectiveDate,
        employeesAffected,
        reason,
        rawText: row.Notes?.trim() || undefined,
        source: {
          state,
          sourceName: 'WARN Database (layoffdata.com)',
          sourceUrl: 'https://layoffdata.com/data/',
          retrievedAt
        }
      };

      const scored = scoreNursingImpact(notice);
      const existing = noticesById.get(scored.id);
      noticesById.set(scored.id, existing ? mergeNotice(existing, scored) : scored);
    }
  }

  return Array.from(noticesById.values());
}
