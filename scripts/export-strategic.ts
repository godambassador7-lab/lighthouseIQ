/**
 * Export Strategic Market Data Script
 *
 * Generates strategic nursing market intelligence data including:
 * - State-by-state salary comparisons (staff RN vs travel)
 * - Specialty pay rates
 * - Workforce projections
 * - Shortage/surplus analysis
 *
 * Data sources: BLS, Nurse.org, Vivian, HRSA projections
 *
 * Output: public/data/strategic.json
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');

// Ensure output directory exists
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Comprehensive salary data by state (from BLS, Nurse.org, Vivian 2024-2026)
const NURSING_SALARY_DATA: Record<string, {
  staffRN: number;
  staffHourly: number;
  travelWeekly: number;
  travelAnnual: number;
  shortage: 'surplus' | 'shortage' | 'balanced';
  projectedGap: number;
}> = {
  AL: { staffRN: 74970, staffHourly: 36, travelWeekly: 1850, travelAnnual: 96200, shortage: 'shortage', projectedGap: -5200 },
  AK: { staffRN: 112040, staffHourly: 54, travelWeekly: 2564, travelAnnual: 133328, shortage: 'shortage', projectedGap: -1800 },
  AZ: { staffRN: 89850, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -8500 },
  AR: { staffRN: 76890, staffHourly: 37, travelWeekly: 1920, travelAnnual: 99840, shortage: 'shortage', projectedGap: -3200 },
  CA: { staffRN: 148330, staffHourly: 71, travelWeekly: 2643, travelAnnual: 137436, shortage: 'shortage', projectedGap: -44500 },
  CO: { staffRN: 106342, staffHourly: 51, travelWeekly: 2280, travelAnnual: 118560, shortage: 'balanced', projectedGap: -2100 },
  CT: { staffRN: 98760, staffHourly: 47, travelWeekly: 2320, travelAnnual: 120640, shortage: 'balanced', projectedGap: 1200 },
  DE: { staffRN: 87450, staffHourly: 42, travelWeekly: 2180, travelAnnual: 113360, shortage: 'balanced', projectedGap: -800 },
  DC: { staffRN: 114282, staffHourly: 55, travelWeekly: 2450, travelAnnual: 127400, shortage: 'balanced', projectedGap: 500 },
  FL: { staffRN: 84850, staffHourly: 41, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -18900 },
  GA: { staffRN: 86240, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -9800 },
  HI: { staffRN: 123720, staffHourly: 59, travelWeekly: 2380, travelAnnual: 123760, shortage: 'shortage', projectedGap: -2400 },
  ID: { staffRN: 82670, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -1900 },
  IL: { staffRN: 88760, staffHourly: 43, travelWeekly: 2200, travelAnnual: 114400, shortage: 'shortage', projectedGap: -12300 },
  IN: { staffRN: 80250, staffHourly: 39, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -6400 },
  IA: { staffRN: 77780, staffHourly: 37, travelWeekly: 1950, travelAnnual: 101400, shortage: 'surplus', projectedGap: 2800 },
  KS: { staffRN: 79180, staffHourly: 38, travelWeekly: 1980, travelAnnual: 102960, shortage: 'balanced', projectedGap: -1100 },
  KY: { staffRN: 78650, staffHourly: 38, travelWeekly: 1970, travelAnnual: 102440, shortage: 'shortage', projectedGap: -4500 },
  LA: { staffRN: 79450, staffHourly: 38, travelWeekly: 2020, travelAnnual: 105040, shortage: 'shortage', projectedGap: -5600 },
  ME: { staffRN: 86780, staffHourly: 42, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -1400 },
  MD: { staffRN: 95280, staffHourly: 46, travelWeekly: 2350, travelAnnual: 122200, shortage: 'balanced', projectedGap: -800 },
  MA: { staffRN: 110449, staffHourly: 53, travelWeekly: 2420, travelAnnual: 125840, shortage: 'balanced', projectedGap: 1500 },
  MI: { staffRN: 85760, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -7200 },
  MN: { staffRN: 96580, staffHourly: 46, travelWeekly: 2280, travelAnnual: 118560, shortage: 'surplus', projectedGap: 3200 },
  MS: { staffRN: 79470, staffHourly: 38, travelWeekly: 1900, travelAnnual: 98800, shortage: 'shortage', projectedGap: -3800 },
  MO: { staffRN: 79890, staffHourly: 38, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -5100 },
  MT: { staffRN: 83450, staffHourly: 40, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -1200 },
  NE: { staffRN: 80120, staffHourly: 39, travelWeekly: 2000, travelAnnual: 104000, shortage: 'balanced', projectedGap: -600 },
  NV: { staffRN: 102580, staffHourly: 49, travelWeekly: 2350, travelAnnual: 122200, shortage: 'shortage', projectedGap: -4200 },
  NH: { staffRN: 89760, staffHourly: 43, travelWeekly: 2200, travelAnnual: 114400, shortage: 'balanced', projectedGap: 400 },
  NJ: { staffRN: 102340, staffHourly: 49, travelWeekly: 2464, travelAnnual: 128128, shortage: 'shortage', projectedGap: -6800 },
  NM: { staffRN: 88450, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -2100 },
  NY: { staffRN: 110642, staffHourly: 53, travelWeekly: 2380, travelAnnual: 123760, shortage: 'shortage', projectedGap: -18200 },
  NC: { staffRN: 84670, staffHourly: 41, travelWeekly: 2080, travelAnnual: 108160, shortage: 'shortage', projectedGap: -12500 },
  ND: { staffRN: 107006, staffHourly: 51, travelWeekly: 2200, travelAnnual: 114400, shortage: 'surplus', projectedGap: 1100 },
  OH: { staffRN: 82340, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -9400 },
  OK: { staffRN: 78920, staffHourly: 38, travelWeekly: 1980, travelAnnual: 102960, shortage: 'shortage', projectedGap: -3600 },
  OR: { staffRN: 120470, staffHourly: 58, travelWeekly: 2380, travelAnnual: 123760, shortage: 'balanced', projectedGap: -1800 },
  PA: { staffRN: 88450, staffHourly: 43, travelWeekly: 2180, travelAnnual: 113360, shortage: 'shortage', projectedGap: -11200 },
  PR: { staffRN: 41470, staffHourly: 20, travelWeekly: 1600, travelAnnual: 83200, shortage: 'shortage', projectedGap: -2800 },
  RI: { staffRN: 95680, staffHourly: 46, travelWeekly: 2490, travelAnnual: 129480, shortage: 'balanced', projectedGap: 200 },
  SC: { staffRN: 82450, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -5400 },
  SD: { staffRN: 72210, staffHourly: 35, travelWeekly: 2481, travelAnnual: 129012, shortage: 'surplus', projectedGap: 800 },
  TN: { staffRN: 79680, staffHourly: 38, travelWeekly: 2020, travelAnnual: 105040, shortage: 'shortage', projectedGap: -7800 },
  TX: { staffRN: 91450, staffHourly: 44, travelWeekly: 2180, travelAnnual: 113360, shortage: 'shortage', projectedGap: -28500 },
  UT: { staffRN: 85670, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -3400 },
  VT: { staffRN: 107529, staffHourly: 52, travelWeekly: 2200, travelAnnual: 114400, shortage: 'balanced', projectedGap: -300 },
  VA: { staffRN: 89450, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -7600 },
  WA: { staffRN: 115740, staffHourly: 56, travelWeekly: 2420, travelAnnual: 125840, shortage: 'balanced', projectedGap: -2400 },
  WV: { staffRN: 78340, staffHourly: 38, travelWeekly: 1950, travelAnnual: 101400, shortage: 'shortage', projectedGap: -2200 },
  WI: { staffRN: 87650, staffHourly: 42, travelWeekly: 2100, travelAnnual: 109200, shortage: 'balanced', projectedGap: 600 },
  WY: { staffRN: 84760, staffHourly: 41, travelWeekly: 2080, travelAnnual: 108160, shortage: 'shortage', projectedGap: -700 }
};

// Travel nurse specialty pay (weekly rates)
const SPECIALTY_PAY: Record<string, {
  weekly: number;
  annual: number;
  demand: 'very high' | 'high' | 'moderate';
}> = {
  'CRNA': { weekly: 4996, annual: 259707, demand: 'very high' },
  'Cath Lab': { weekly: 4341, annual: 225732, demand: 'very high' },
  'NICU': { weekly: 2449, annual: 127391, demand: 'high' },
  'NP': { weekly: 2506, annual: 130295, demand: 'high' },
  'ICU': { weekly: 2426, annual: 126164, demand: 'very high' },
  'Telemetry': { weekly: 2321, annual: 120690, demand: 'high' },
  'L&D': { weekly: 2400, annual: 124800, demand: 'high' },
  'Oncology': { weekly: 2300, annual: 119600, demand: 'high' },
  'Med-Surg': { weekly: 2118, annual: 110165, demand: 'moderate' },
  'OR': { weekly: 1818, annual: 94573, demand: 'high' },
  'ER': { weekly: 1668, annual: 86737, demand: 'very high' },
  'Psych': { weekly: 1950, annual: 101400, demand: 'high' },
  'Home Health': { weekly: 1700, annual: 88400, demand: 'moderate' },
  'Rehab': { weekly: 1800, annual: 93600, demand: 'moderate' }
};

const SPECIALTY_SIGNAL_SOURCES = [
  { name: 'BLS Public API', url: 'https://api.bls.gov/publicAPI/v2/timeseries/data/', type: 'supply' },
  { name: 'RN Salary Proxy (BLS/Vivian)', url: 'https://nurse.org/articles/highest-paying-states-for-nurses/', type: 'supply' },
  { name: 'HRSA Workforce', url: 'https://bhw.hrsa.gov/data-research', type: 'demand' },
  { name: 'KFF State Health Facts', url: 'https://www.kff.org/state-category/health-workforce/', type: 'demand' },
  { name: 'Lightcast', url: 'https://lightcast.io/', type: 'demand' },
  { name: 'LinkedIn Talent Insights', url: 'https://business.linkedin.com/talent-solutions/talent-insights', type: 'demand' },
  { name: 'Indeed Hiring Lab', url: 'https://www.hiringlab.org/', type: 'demand' },
  { name: 'Vivian Health', url: 'https://www.vivian.com/', type: 'demand' }
];

const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR',
  'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY'
];
const NPI_API_URL = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
const NPI_CONCURRENCY = 4;
const NPI_REQUEST_DELAY_MS = 150;
const NUCC_TAXONOMY_CSV_URL = 'https://www.nucc.org/images/stories/CSV/nucc_taxonomy_251.csv';
const SPECIALTY_DEFINITIONS_PATH = path.join(ROOT_DIR, 'apps', 'web', 'app-static.js');
const RN_FALLBACK_TAXONOMY_CODES = ['163W00000X'];
const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
const BLS_SERIES_MAP_PATH = path.join(ROOT_DIR, 'config', 'bls-rn-series.json');
const ENABLE_NPI = false;

const SPECIALTY_TAXONOMY_MAP: Record<string, {
  label: string;
  taxonomyCodes: string[];
}> = {
  NP: { label: 'Nurse Practitioner', taxonomyCodes: ['363L00000X'] },
  CNS: { label: 'Clinical Nurse Specialist', taxonomyCodes: ['364S00000X'] },
  CRNA: { label: 'Nurse Anesthetist (CRNA)', taxonomyCodes: ['367500000X'] },
  CNM: { label: 'Certified Nurse Midwife', taxonomyCodes: ['367A00000X'] }
};

type SpecialtyDefinition = {
  key: string;
  name: string;
  keywords: string[];
};

type TaxonomyEntry = {
  code: string;
  grouping: string;
  classification: string;
  specialization: string;
  displayName: string;
};

type SpecialtySignalCard = {
  specialty: string;
  specialtyKey: string;
  source: string;
  metric: 'supply' | 'demand';
  topState: { state: string; value: number } | null;
  bottomState: { state: string; value: number } | null;
  tip: string;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson<T>(url: string, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string, timeoutMs = 30000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      current.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (field.length || current.length) {
        current.push(field);
        rows.push(current);
        current = [];
        field = '';
      }
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      continue;
    }

    field += char;
  }

  if (field.length || current.length) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_PHRASES = new Set([
  'nurse', 'nursing', 'care', 'health', 'clinic', 'center', 'unit', 'medical', 'patient',
  'registered', 'rn', 'practice', 'hospital'
]);

function isAbbreviation(value: string): boolean {
  return /^[A-Z]{2,5}$/.test(value);
}

function unescapeValue(value: string): string {
  return value.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

function loadSpecialtyDefinitions(): SpecialtyDefinition[] {
  if (!fs.existsSync(SPECIALTY_DEFINITIONS_PATH)) return [];
  const content = fs.readFileSync(SPECIALTY_DEFINITIONS_PATH, 'utf-8');
  const blockMatch = content.match(/const NURSE_SPECIALTIES = \{([\s\S]*?)\r?\n\};/);
  if (!blockMatch) return [];
  const block = blockMatch[1];
  const entryRegex = /'([^']+)'\s*:\s*\{\s*name:\s*'((?:\\'|[^'])+)'[\s\S]*?keywords:\s*\[([\s\S]*?)\]\s*\}/g;
  const keywordRegex = /'((?:\\'|[^'])+)'/g;
  const definitions: SpecialtyDefinition[] = [];
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(block)) !== null) {
    const key = match[1];
    const name = unescapeValue(match[2]);
    const keywordsText = match[3] ?? '';
    const keywords: string[] = [];
    let keywordMatch: RegExpExecArray | null;
    while ((keywordMatch = keywordRegex.exec(keywordsText)) !== null) {
      keywords.push(unescapeValue(keywordMatch[1]));
    }
    definitions.push({ key, name, keywords });
  }

  return definitions;
}

function resolveSpecialtyList(definitions: SpecialtyDefinition[]): Array<{ key: string; label: string }> {
  if (definitions.length) {
    return definitions.map(def => ({ key: def.key, label: def.name }));
  }
  return Object.entries(SPECIALTY_TAXONOMY_MAP).map(([key, entry]) => ({
    key,
    label: entry.label
  }));
}

function loadBlsSeriesMap(): Record<string, string> {
  if (!fs.existsSync(BLS_SERIES_MAP_PATH)) return {};
  try {
    const raw = fs.readFileSync(BLS_SERIES_MAP_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, string>;
    const cleaned: Record<string, string> = {};
    Object.entries(parsed).forEach(([state, series]) => {
      if (!/^[A-Z]{2}$/.test(state)) return;
      const trimmed = String(series ?? '').trim();
      if (!trimmed) return;
      cleaned[state] = trimmed;
    });
    return cleaned;
  } catch (err) {
    console.warn('Failed to parse BLS series map:', err);
    return {};
  }
}

async function fetchBlsSeriesValues(seriesIds: string[]): Promise<Record<string, number>> {
  if (!seriesIds.length) return {};
  try {
    const res = await fetch(BLS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesid: seriesIds })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as {
      Results?: { series?: Array<{ seriesID: string; data: Array<{ value: string }> }> };
    };
    const map: Record<string, number> = {};
    data?.Results?.series?.forEach(series => {
      const valueRaw = series.data?.[0]?.value;
      const value = Number(valueRaw);
      if (Number.isFinite(value)) {
        map[series.seriesID] = value;
      }
    });
    return map;
  } catch (err) {
    console.warn('Failed to fetch BLS series data:', err);
    return {};
  }
}

async function fetchBlsRnCountsByState(): Promise<Record<string, number> | null> {
  const seriesMap = loadBlsSeriesMap();
  const entries = Object.entries(seriesMap);
  if (!entries.length) return null;

  const counts = initStateCounts();
  const seriesIds = entries.map(([, series]) => series);
  const seriesValues = await fetchBlsSeriesValues(seriesIds);

  entries.forEach(([state, seriesId]) => {
    const value = seriesValues[seriesId];
    if (Number.isFinite(value)) {
      counts[state] = value;
    }
  });

  return counts;
}

async function fetchNuccTaxonomyEntries(): Promise<TaxonomyEntry[]> {
  try {
    const csv = await fetchText(NUCC_TAXONOMY_CSV_URL, 60000);
    const rows = parseCsv(csv);
    if (!rows.length) return [];
    const headers = rows[0].map(cell => cell.trim().toLowerCase());
    const idx = (label: string) => headers.findIndex(h => h === label.toLowerCase());
    const codeIdx = idx('Code');
    const groupingIdx = idx('Grouping');
    const classificationIdx = idx('Classification');
    const specializationIdx = idx('Specialization');
    const displayIdx = idx('Display Name');

    return rows.slice(1)
      .map(row => ({
        code: row[codeIdx] ?? '',
        grouping: row[groupingIdx] ?? '',
        classification: row[classificationIdx] ?? '',
        specialization: row[specializationIdx] ?? '',
        displayName: row[displayIdx] ?? ''
      }))
      .filter(row => row.code);
  } catch (err) {
    console.warn('Failed to load NUCC taxonomy CSV:', err);
    return [];
  }
}

function buildSpecialtyTaxonomyMap(
  specialties: SpecialtyDefinition[],
  taxonomyEntries: TaxonomyEntry[]
): Map<string, { label: string; taxonomyCodes: string[] }> {
  const map = new Map<string, { label: string; taxonomyCodes: string[] }>();
  const nurseEntries = taxonomyEntries.filter(entry => {
    const grouping = entry.grouping.toLowerCase();
    const classification = entry.classification.toLowerCase();
    return grouping.includes('nursing') || classification.includes('nurse');
  });

  specialties.forEach(spec => {
    const phrases = [spec.name, ...spec.keywords]
      .map(phrase => phrase.trim())
      .filter(Boolean);

    const normalizedPhrases = phrases
      .map(phrase => normalizeText(phrase))
      .filter(phrase => phrase && phrase.replace(/\s+/g, '').length >= 3)
      .filter(phrase => !STOP_PHRASES.has(phrase));

    const abbreviations = phrases.filter(isAbbreviation);
    const codes = new Set<string>();

    nurseEntries.forEach(entry => {
      const classification = entry.classification.trim();
      const specialization = entry.specialization.trim();
      if (classification === 'Registered Nurse' && !specialization) return;
      const rawText = `${entry.classification} ${entry.specialization} ${entry.displayName}`.trim();
      const haystack = normalizeText(rawText);
      let score = 0;

      normalizedPhrases.forEach(keyword => {
        if (!haystack.includes(keyword)) return;
        const tokenCount = keyword.split(' ').filter(Boolean).length;
        if (tokenCount >= 2) {
          score += 2;
        } else if (keyword.length >= 6) {
          score += 1.5;
        } else {
          score += 1;
        }
      });

      abbreviations.forEach(abbrev => {
        const regex = new RegExp(`\\b${abbrev}\\b`, 'i');
        if (regex.test(rawText)) {
          score += 1.5;
        }
      });

      if (score >= 1.5) {
        codes.add(entry.code);
      }
    });

    if (codes.size) {
      map.set(spec.key, { label: spec.name, taxonomyCodes: Array.from(codes) });
    }
  });

  return map;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length) as R[];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return results;
}

async function fetchNpiCount(taxonomyCode: string, state: string): Promise<number> {
  const url = `${NPI_API_URL}&taxonomy_code=${encodeURIComponent(taxonomyCode)}&state=${state}&limit=1`;
  try {
    await sleep(NPI_REQUEST_DELAY_MS);
    const data = await fetchJson<{ result_count?: number }>(url, 20000);
    const count = Number(data?.result_count ?? 0);
    return Number.isFinite(count) ? count : 0;
  } catch {
    return 0;
  }
}

async function fetchNpiCountsByState(taxonomyCodes: string[]): Promise<Record<string, number>> {
  const totals: Record<string, number> = {};
  ALL_STATES.forEach(state => {
    totals[state] = 0;
  });

  for (const code of taxonomyCodes) {
    const counts = await mapWithConcurrency(ALL_STATES, NPI_CONCURRENCY, async (state) => {
      const count = await fetchNpiCount(code, state);
      return { state, count };
    });
    counts.forEach(({ state, count }) => {
      totals[state] += count;
    });
  }

  return totals;
}

function buildSignalCardFromCounts(
  specialtyKey: string,
  label: string,
  counts: Record<string, number>,
  sourceLabel: string,
  tip: string
): SpecialtySignalCard | null {
  const entries = Object.entries(counts);
  if (!entries.length) return null;

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const nonZero = sorted.filter(entry => entry[1] > 0).slice().sort((a, b) => a[1] - b[1]);
  const bottom = nonZero[0] ?? sorted[sorted.length - 1];
  const hasSignal = top && top[1] > 0;
  if (!hasSignal) return null;

  return {
    specialty: label,
    specialtyKey,
    source: sourceLabel,
    metric: 'supply',
    topState: { state: top[0], value: top[1] },
    bottomState: { state: bottom[0], value: bottom[1] },
    tip,
  };
}

function mergeCounts(target: Record<string, number>, source: Record<string, number>) {
  Object.entries(source).forEach(([state, count]) => {
    target[state] = (target[state] ?? 0) + count;
  });
}

function initStateCounts(): Record<string, number> {
  const totals: Record<string, number> = {};
  ALL_STATES.forEach(state => {
    totals[state] = 0;
  });
  return totals;
}

function buildSalaryRnProxyCounts(): Record<string, number> {
  const totals = initStateCounts();
  Object.entries(NURSING_SALARY_DATA).forEach(([state, data]) => {
    if (state in totals) {
      totals[state] = data.staffRN;
    }
  });
  return totals;
}

async function buildSpecialtySignals() {
  const cards: SpecialtySignalCard[] = [];
  const specialtyDefinitions = loadSpecialtyDefinitions();
  const specialties = resolveSpecialtyList(specialtyDefinitions);
  const labelByKey = new Map<string, string>(specialties.map(entry => [entry.key, entry.label]));
  const blsRnCounts = await fetchBlsRnCountsByState();
  const rnProxyCounts = blsRnCounts ?? buildSalaryRnProxyCounts();
  const rnProxySource = blsRnCounts
    ? 'BLS Public API (RN proxy)'
    : 'RN Salary Proxy (BLS/Vivian)';
  const rnProxyTip = blsRnCounts
    ? 'Proxy based on BLS RN employment distribution.'
    : 'Proxy based on RN salary distribution (BLS/Vivian).';
  const usedKeys = new Set<string>();

  if (ENABLE_NPI) {
    const taxonomyEntries = await fetchNuccTaxonomyEntries();
    const useDefinitions = specialtyDefinitions.length > 0;
    const taxonomyMap = useDefinitions && taxonomyEntries.length
      ? buildSpecialtyTaxonomyMap(specialtyDefinitions, taxonomyEntries)
      : new Map(Object.entries(SPECIALTY_TAXONOMY_MAP));

    const fallbackMap = new Map<string, { label: string; taxonomyCodes: string[] }>();
    if (useDefinitions) {
      specialtyDefinitions.forEach(spec => {
        if (!taxonomyMap.has(spec.key)) {
          fallbackMap.set(spec.key, { label: spec.name, taxonomyCodes: RN_FALLBACK_TAXONOMY_CODES });
        }
      });
    }

    const codeSet = new Set<string>();
    taxonomyMap.forEach(entry => entry.taxonomyCodes.forEach(code => codeSet.add(code)));
    fallbackMap.forEach(entry => entry.taxonomyCodes.forEach(code => codeSet.add(code)));

    const codeCounts = new Map<string, Record<string, number>>();
    for (const code of codeSet) {
      const counts = await fetchNpiCountsByState([code]);
      codeCounts.set(code, counts);
    }

    const buildCardsFromMap = (
      map: Map<string, { label: string; taxonomyCodes: string[] }>,
      sourceLabel: string,
      isProxy: boolean
    ) => {
      map.forEach((entry, specialtyKey) => {
        if (usedKeys.has(specialtyKey)) return;
        const totals = initStateCounts();
        entry.taxonomyCodes.forEach(code => {
          const counts = codeCounts.get(code);
          if (counts) mergeCounts(totals, counts);
        });
        const topEntry = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
        const topState = topEntry?.[0] ?? '--';
        const tip = isProxy
          ? `Proxy based on overall RN distribution. ${entry.label} counts are not specialty-specific yet.`
          : `Start with ${topState} where ${entry.label} supply is deepest.`;
        const card = buildSignalCardFromCounts(
          specialtyKey,
          entry.label,
          totals,
          sourceLabel,
          tip
        );
        if (card) {
          cards.push(card);
          usedKeys.add(specialtyKey);
        }
      });
    };

    buildCardsFromMap(taxonomyMap, 'NPI Registry API + NUCC', false);
    fallbackMap.forEach((entry, specialtyKey) => {
      if (usedKeys.has(specialtyKey)) return;
      const tip = `${rnProxyTip} ${entry.label} counts are not specialty-specific yet.`;
      const card = buildSignalCardFromCounts(
        specialtyKey,
        entry.label,
        rnProxyCounts,
        rnProxySource,
        tip
      );
      if (card) {
        cards.push(card);
        usedKeys.add(specialtyKey);
      }
    });
  }

  let blsProxyUsed = false;
  if (rnProxyCounts) {
    specialties.forEach(entry => {
      if (usedKeys.has(entry.key)) return;
      const tip = `${rnProxyTip} ${entry.label} counts are not specialty-specific yet.`;
      const card = buildSignalCardFromCounts(
        entry.key,
        entry.label,
        rnProxyCounts,
        rnProxySource,
        tip
      );
      if (card) {
        cards.push(card);
        usedKeys.add(entry.key);
        blsProxyUsed = true;
      }
    });
  }

  const totalSpecialties = specialties.length;
  const covered = new Set(cards.map(card => card.specialtyKey)).size;
  const status = covered === 0 ? 'pending' : (covered < totalSpecialties ? 'partial' : 'ready');

  const sources = SPECIALTY_SIGNAL_SOURCES.map(source => ({
    ...source,
    enabled: (source.name === 'BLS Public API' && blsProxyUsed && Boolean(blsRnCounts))
      || (source.name === 'RN Salary Proxy (BLS/Vivian)' && blsProxyUsed && !blsRnCounts)
  }));

  return {
    lastUpdated: new Date().toISOString(),
    status,
    sources,
    cards
  };
}

// National workforce projections (HRSA/BLS data)
const WORKFORCE_PROJECTIONS = {
  currentYear: 2026,
  nationalSupply: 3150000,
  nationalDemand: 3450000,
  projectedGap2030: -350000,
  projectedGap2035: -500000,
  growthRate: 6, // percent through 2032
  retirementRate: 4.5, // percent annually
  avgAge: 52,
  medianTenure: 8.5,
  projections: [
    { year: 2026, supply: 3150000, demand: 3450000, gap: -300000 },
    { year: 2030, supply: 3300000, demand: 3650000, gap: -350000 },
    { year: 2035, supply: 3400000, demand: 3900000, gap: -500000 }
  ]
};

// Calculate summary statistics
function calculateSummary() {
  const shortageStates = Object.entries(NURSING_SALARY_DATA)
    .filter(([_, d]) => d.shortage === 'shortage')
    .map(([s]) => s)
    .sort();

  const surplusStates = Object.entries(NURSING_SALARY_DATA)
    .filter(([_, d]) => d.shortage === 'surplus')
    .map(([s]) => s)
    .sort();

  const balancedStates = Object.entries(NURSING_SALARY_DATA)
    .filter(([_, d]) => d.shortage === 'balanced')
    .map(([s]) => s)
    .sort();

  const totalProjectedGap = Object.values(NURSING_SALARY_DATA)
    .reduce((sum, d) => sum + d.projectedGap, 0);

  const avgStaffSalary = Math.round(
    Object.values(NURSING_SALARY_DATA).reduce((sum, d) => sum + d.staffRN, 0) /
    Object.keys(NURSING_SALARY_DATA).length
  );

  const avgTravelSalary = Math.round(
    Object.values(NURSING_SALARY_DATA).reduce((sum, d) => sum + d.travelAnnual, 0) /
    Object.keys(NURSING_SALARY_DATA).length
  );

  return {
    shortageStates,
    surplusStates,
    balancedStates,
    totalProjectedGap,
    avgStaffSalary,
    avgTravelSalary,
    avgTravelPremium: avgTravelSalary - avgStaffSalary
  };
}

async function main() {
  console.log('Exporting strategic market data...');

  ensureDir(OUTPUT_DIR);

  const summary = calculateSummary();

  const specialtySignals = await buildSpecialtySignals();

  const strategicData = {
    lastUpdated: new Date().toISOString(),
    version: '2026-Q1',
    sources: [
      { name: 'BLS', url: 'https://www.bls.gov/oes/current/oes291141.htm' },
      { name: 'HRSA', url: 'https://bhw.hrsa.gov/data-research/projecting-health-workforce-supply-demand' },
      { name: 'Nurse.org', url: 'https://nurse.org/articles/highest-paying-states-for-nurses/' },
      { name: 'Vivian Health', url: 'https://www.vivian.com/' }
    ],
    summary,
    salaryData: NURSING_SALARY_DATA,
    specialtyPay: SPECIALTY_PAY,
    specialtySignals,
    workforceProjections: WORKFORCE_PROJECTIONS
  };

  const outputPath = path.join(OUTPUT_DIR, 'strategic.json');
  fs.writeFileSync(outputPath, JSON.stringify(strategicData, null, 2));

  console.log(`Strategic data exported to ${outputPath}`);
  console.log(`- ${summary.shortageStates.length} shortage states`);
  console.log(`- ${summary.surplusStates.length} surplus states`);
  console.log(`- ${summary.balancedStates.length} balanced states`);
  console.log(`- Total projected gap: ${summary.totalProjectedGap.toLocaleString()}`);
}

main().catch(err => {
  console.error('Failed to export strategic data:', err);
  process.exit(1);
});
