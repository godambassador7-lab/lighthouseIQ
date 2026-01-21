import axios from 'axios';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { NormalizedWarnNotice, USStateAbbrev } from '@lni/core';

const SOURCE_URL = 'https://data.usatoday.com/see-which-companies-announced-mass-layoffs-closings/';
const JINA_URL = 'https://r.jina.ai/http://data.usatoday.com/see-which-companies-announced-mass-layoffs-closings/';

const STATE_ABBREV_BY_NAME: Record<string, USStateAbbrev> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  NewHampshire: 'NH',
  NewJersey: 'NJ',
  NewMexico: 'NM',
  NewYork: 'NY',
  NorthCarolina: 'NC',
  NorthDakota: 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  RhodeIsland: 'RI',
  SouthCarolina: 'SC',
  SouthDakota: 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  WestVirginia: 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
  'Puerto Rico': 'PR'
};

function normalizeStateName(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function getStateAbbrev(value: string): USStateAbbrev | undefined {
  const normalized = normalizeStateName(value);
  if (!normalized) return undefined;
  if (normalized.length === 2) return normalized.toUpperCase() as USStateAbbrev;
  const direct = STATE_ABBREV_BY_NAME[normalized];
  if (direct) return direct;
  const compact = normalized.replace(/\s+/g, '');
  return STATE_ABBREV_BY_NAME[compact];
}

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseEmployees(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9]/g, '');
  if (!cleaned) return undefined;
  const num = Number.parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : undefined;
}

function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const numeric = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (numeric) {
    let [, month, day, year] = numeric;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const nameMatch = value.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i);
  if (nameMatch) {
    const [, monthName, day, year] = nameMatch;
    const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec']
      .indexOf(monthName.toLowerCase());
    if (monthIndex >= 0) {
      const month = String(monthIndex === 9 ? 9 : monthIndex + 1).padStart(2, '0');
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }
  return undefined;
}

function extractMarkdownLink(value: string): { text: string; url?: string } {
  const match = value.match(/\[([^\]]+)\]\(([^)]+)\)/);
  const text = (match ? match[1] : value).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return { text, url: match?.[2] };
}

function parseMarkdownTable(text: string): Array<Record<string, string>> {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 2; i += 1) {
    const header = lines[i];
    const separator = lines[i + 1];
    if (!header.includes('|') || !separator.includes('|')) continue;
    if (!separator.replace(/\s/g, '').includes('---')) continue;

    const headers = header.split('|').slice(1, -1).map(col => col.trim());
    if (!headers.some(col => /reporting state/i.test(col))) continue;

    const rows: Array<Record<string, string>> = [];
    for (let j = i + 2; j < lines.length; j += 1) {
      const line = lines[j];
      if (!line.includes('|')) break;
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      if (cells.length !== headers.length) continue;
      const record: Record<string, string> = {};
      headers.forEach((col, idx) => {
        record[col] = cells[idx];
      });
      rows.push(record);
    }

    return rows;
  }
  return [];
}

function parseSourceId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1];
  } catch {
    return undefined;
  }
}

export async function fetchUsaTodayNotices(params: {
  state: USStateAbbrev;
  retrievedAt: string;
}): Promise<NormalizedWarnNotice[]> {
  const { state, retrievedAt } = params;
  const res = await axios.get(JINA_URL, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });

  const rows = parseMarkdownTable(res.data as string);
  const notices: NormalizedWarnNotice[] = [];

  for (const row of rows) {
    const stateValue = row['Reporting State'] || row['State'] || '';
    const rowState = getStateAbbrev(stateValue);
    if (!rowState || rowState !== state) continue;

    const nameCell = row.Name || row['Company'] || row['Employer'] || '';
    if (!nameCell) continue;
    const { text: employerName, url } = extractMarkdownLink(nameCell);
    if (!employerName) continue;

    const noticeDate = parseDate(row['Notice Date']);
    const effectiveDate = parseDate(row['Starting Date']);
    const employeesAffected = parseEmployees(row['Number of employees affected']);
    const reason = row.Reason?.trim() || undefined;

    const id = hashId([state, employerName, noticeDate || '', effectiveDate || '']);

    const notice: NormalizedWarnNotice = {
      id,
      state,
      employerName,
      noticeDate,
      effectiveDate,
      employeesAffected,
      reason,
      source: {
        state,
        sourceName: 'USA Today WARN List',
        sourceUrl: url || SOURCE_URL,
        sourceId: parseSourceId(url),
        retrievedAt
      },
      attachments: url ? [{ url }] : undefined
    };

    notices.push(scoreNursingImpact(notice));
  }

  return notices;
}
