import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { getAllAdapters, getAdapter } from '@lni/adapters';
import type { NormalizedWarnNotice, USStateAbbrev } from '@lni/core';

const PORT = Number(process.env.PORT ?? 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const ACCESS_PASSCODE = process.env.ACCESS_PASSCODE;
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// In-memory cache for live-fetched notices (when no DB)
let cachedNotices: NormalizedWarnNotice[] = [];
let lastFetchTime: Date | null = null;

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
if (CORS_ORIGINS.length > 0) {
  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    }
  }));
}

// Rate limiting for auth endpoint (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { success: false, error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '1mb' })); // Limit request body size

const REGION_STATES: Record<string, string[]> = {
  Northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  Midwest: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
  South: [
    'DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV',
    'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'
  ],
  West: ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA'],
  Territories: ['PR']
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, '../../web');

app.use(express.static(webDir));
app.get('/', (_req, res) => {
  res.sendFile(path.join(webDir, 'index.html'));
});

const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!pool) return [];
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

type NursingProgram = {
  id: string;
  institution_name: string;
  campus_name: string | null;
  city: string | null;
  state: string;
  program_level: 'ASN' | 'BSN' | 'MSN';
  credential_notes: string | null;
  accreditor: 'CCNE' | 'ACEN' | 'CNEA';
  accreditation_status: string | null;
  source_url: string;
  school_website_url: string | null;
  nces_unitid: string | null;
  last_verified_date: string;
};

type ProgramSourceMeta = {
  name: string;
  url: string;
  updatedAt: string;
  programCount: number;
};

const ALL_STATES: USStateAbbrev[] = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR'
];
const STATE_SET = new Set<string>(ALL_STATES);
const STATE_NAME_MAP: Record<string, USStateAbbrev> = {
  ALABAMA: 'AL',
  ALASKA: 'AK',
  ARIZONA: 'AZ',
  ARKANSAS: 'AR',
  CALIFORNIA: 'CA',
  COLORADO: 'CO',
  CONNECTICUT: 'CT',
  DELAWARE: 'DE',
  FLORIDA: 'FL',
  GEORGIA: 'GA',
  HAWAII: 'HI',
  IDAHO: 'ID',
  ILLINOIS: 'IL',
  INDIANA: 'IN',
  IOWA: 'IA',
  KANSAS: 'KS',
  KENTUCKY: 'KY',
  LOUISIANA: 'LA',
  MAINE: 'ME',
  MARYLAND: 'MD',
  MASSACHUSETTS: 'MA',
  MICHIGAN: 'MI',
  MINNESOTA: 'MN',
  MISSISSIPPI: 'MS',
  MISSOURI: 'MO',
  MONTANA: 'MT',
  NEBRASKA: 'NE',
  NEVADA: 'NV',
  'NEW HAMPSHIRE': 'NH',
  'NEW JERSEY': 'NJ',
  'NEW MEXICO': 'NM',
  'NEW YORK': 'NY',
  'NORTH CAROLINA': 'NC',
  'NORTH DAKOTA': 'ND',
  OHIO: 'OH',
  OKLAHOMA: 'OK',
  OREGON: 'OR',
  PENNSYLVANIA: 'PA',
  'RHODE ISLAND': 'RI',
  'SOUTH CAROLINA': 'SC',
  'SOUTH DAKOTA': 'SD',
  TENNESSEE: 'TN',
  TEXAS: 'TX',
  UTAH: 'UT',
  VERMONT: 'VT',
  VIRGINIA: 'VA',
  WASHINGTON: 'WA',
  'WEST VIRGINIA': 'WV',
  WISCONSIN: 'WI',
  WYOMING: 'WY',
  'DISTRICT OF COLUMBIA': 'DC',
  'WASHINGTON DC': 'DC',
  'WASHINGTON D.C.': 'DC',
  'PUERTO RICO': 'PR'
};

const CCNE_STATE_URL_TEMPLATE = process.env.CCNE_STATE_URL_TEMPLATE
  ?? 'https://directory.ccnecommunity.org/reports/rptAccreditedPrograms_New.asp?state={STATE}';
const ACEN_DIRECTORY_URL = process.env.ACEN_DIRECTORY_URL ?? '';
const ACEN_SEARCH_URL = process.env.ACEN_SEARCH_URL
  ?? 'https://www.acenursing.org/search-programs';
const CNEA_DIRECTORY_URL = process.env.CNEA_DIRECTORY_URL
  ?? 'https://cnea.nln.org/accredited-programs';
const PROGRAMS_REFRESH_MS = 6 * 60 * 60 * 1000;

let cachedPrograms: NursingProgram[] = [];
let programsLastUpdated: Date | null = null;
let programsSources: ProgramSourceMeta[] = [];

function requirePasscode(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!ACCESS_PASSCODE) {
    return res.status(500).json({ success: false, error: 'Access passcode is not configured' });
  }
  const header = String(req.headers['authorization'] ?? '');
  const headerPasscode = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const passcode = headerPasscode || String(req.headers['x-passcode'] ?? '');
  if (!passcode || typeof passcode !== 'string') {
    return res.status(401).json({ success: false, error: 'Passcode required' });
  }
  const isValid = passcode.length === ACCESS_PASSCODE.length &&
    crypto.timingSafeEqual(Buffer.from(passcode), Buffer.from(ACCESS_PASSCODE));
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Invalid passcode' });
  }
  return next();
}

// Input sanitization utilities
function sanitizeString(value: string | undefined, maxLength = 500): string {
  if (!value || typeof value !== 'string') return '';
  // Remove null bytes and control characters, trim, and limit length
  return value
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function sanitizeNumber(value: string | number | undefined, min: number, max: number, defaultValue: number): number {
  const num = Number(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function parseState(value: string | undefined): USStateAbbrev | undefined {
  if (!value) return undefined;
  const sanitized = sanitizeString(value, 5);
  const normalized = sanitized.toUpperCase();
  if (STATE_SET.has(normalized)) return normalized as USStateAbbrev;
  const nameKey = sanitizeString(value, 40).toUpperCase().trim();
  return STATE_NAME_MAP[nameKey];
}

// Parse multiple comma-separated states
function parseStates(value: string | undefined): USStateAbbrev[] {
  if (!value) return [];
  const sanitized = sanitizeString(value, 200);
  return sanitized.split(',')
    .map(s => s.trim().toUpperCase())
    .filter(s => STATE_SET.has(s)) as USStateAbbrev[];
}

function normalizeInstitutionName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractHtmlLines(value: string): string[] {
  const withBreaks = value.replace(/<br\s*\/?>/gi, '\n');
  return stripHtml(withBreaks)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function extractLabelValue(html: string, label: string): string {
  const pattern = new RegExp(
    `<t[dh][^>]*>\\s*${label}\\s*:?\\s*<\\/t[dh]>\\s*<t[dh][^>]*>([\\s\\S]*?)<\\/t[dh]>`,
    'i'
  );
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : '';
}

function parseHtmlTable(html: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const cellText = stripHtml(cellMatch[1]);
      if (cellText) cells.push(cellText);
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

function extractCmsField(html: string, fieldName: string): string {
  const pattern = new RegExp(`fs-cmsfilter-field="${fieldName}"[^>]*>([\\s\\S]*?)<\\/`, 'i');
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : '';
}

function extractProgramLevels(text: string): Array<'ASN' | 'BSN' | 'MSN'> {
  const lowered = text.toLowerCase();
  const levels = new Set<'ASN' | 'BSN' | 'MSN'>();
  if (lowered.includes('associate') || lowered.includes('adn') || lowered.includes('asn')) {
    levels.add('ASN');
  }
  if (lowered.includes('baccalaureate') || lowered.includes('bsn') || lowered.includes('bachelor')) {
    levels.add('BSN');
  }
  if (lowered.includes('master') || lowered.includes('msn')) {
    levels.add('MSN');
  }
  return Array.from(levels);
}

function parseCcneProgramsFromHtml(html: string, fallbackState: string): NursingProgram[] {
  const results: NursingProgram[] = [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const sections = html.split(/<table[^>]+id="finder"[^>]*>/i).slice(1);

  sections.forEach(section => {
    const tableEnd = section.indexOf('</table>');
    const finderBlock = tableEnd >= 0 ? section.slice(0, tableEnd + 8) : section;
    const institutionMatch = finderBlock.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const institutionAltMatch = finderBlock.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const institutionFromLabel = extractLabelValue(finderBlock, 'Institution Name')
      || extractLabelValue(finderBlock, 'Institution')
      || extractLabelValue(finderBlock, 'School');
    const institution = stripHtml(
      institutionMatch?.[1]
      || institutionAltMatch?.[1]
      || institutionFromLabel
      || ''
    );
    if (!institution) return;
    const locationMatch = finderBlock.match(/([A-Za-z .'-]+),\s*([A-Z]{2})/);
    const cityFromLabel = extractLabelValue(finderBlock, 'City')
      || extractLabelValue(finderBlock, 'Location');
    const stateFromLabel = extractLabelValue(finderBlock, 'State')
      || extractLabelValue(finderBlock, 'State/Province');
    const city = cityFromLabel || locationMatch?.[1]?.trim() || null;
    const state = parseState(stateFromLabel || locationMatch?.[2] || fallbackState) ?? fallbackState;
    const websiteMatch = finderBlock.match(/<a[^>]+href=([^\s>]+)[^>]*>Link to Website/i);
    const website = websiteMatch ? websiteMatch[1].replace(/['"]/g, '') : null;

    const programNames = new Set<string>();
    const programMatches = Array.from(section.matchAll(/<h3><b>([^<]+)<\/b><\/h3>/gi));
    programMatches.forEach(match => {
      const programName = stripHtml(match[1]).trim();
      if (programName) programNames.add(programName);
    });

    const labelPatterns = [
      'Program', 'Program Type', 'Program Level', 'Program Track', 'Program Option',
      'Degree', 'Degree Type'
    ];
    labelPatterns.forEach(label => {
      const value = extractLabelValue(finderBlock, label);
      if (value) programNames.add(value);
    });

    if (!programNames.size) {
      const fallbackLevels = extractProgramLevels(stripHtml(finderBlock));
      fallbackLevels.forEach(level => {
        results.push(buildProgramRecord({
          institution_name: institution,
          campus_name: null,
          city,
          state,
          program_level: level,
          credential_notes: null,
          accreditor: 'CCNE',
          accreditation_status: null,
          source_url: CCNE_STATE_URL_TEMPLATE.replace('{STATE}', state),
          school_website_url: website,
          nces_unitid: null,
          last_verified_date: updatedAt
        }));
      });
      return;
    }

    programNames.forEach(programName => {
      const programLevels = extractProgramLevels(programName);
      if (!programLevels.length) return;
      programLevels.forEach(level => {
        results.push(buildProgramRecord({
          institution_name: institution,
          campus_name: null,
          city,
          state,
          program_level: level,
          credential_notes: programName || null,
          accreditor: 'CCNE',
          accreditation_status: null,
          source_url: CCNE_STATE_URL_TEMPLATE.replace('{STATE}', state),
          school_website_url: website,
          nces_unitid: null,
          last_verified_date: updatedAt
        }));
      });
    });
  });

  return results;
}

function parseAcenProgramsFromSearchHtml(html: string): Array<Omit<NursingProgram, 'id'>> {
  const results: Array<Omit<NursingProgram, 'id'>> = [];
  const listItemMarker = '<div role="listitem" class="w-dyn-item">';
  const listItems = html.split(listItemMarker).slice(1);
  listItems.forEach(segment => {
    const block = segment;
    const institution = extractCmsField(block, 'governing-org')
      || extractCmsField(block, 'institution')
      || extractCmsField(block, 'Institution');
    const programType = extractCmsField(block, 'program-type')
      || extractCmsField(block, 'Program Type');
    const stateName = extractCmsField(block, 'State')
      || extractCmsField(block, 'state');
    const status = extractCmsField(block, 'status')
      || extractCmsField(block, 'Status');
    const state = parseState(stateName);
    if (!institution || !state) return;
    const programLevels = extractProgramLevels(programType || block);
    if (!programLevels.length) return;

    programLevels.forEach(level => {
      results.push({
        institution_name: institution,
        campus_name: null,
        city: null,
        state,
        program_level: level,
        credential_notes: programType || null,
        accreditor: 'ACEN',
        accreditation_status: status || null,
        source_url: ACEN_SEARCH_URL,
        school_website_url: null,
        nces_unitid: null,
        last_verified_date: new Date().toISOString().slice(0, 10)
      });
    });
  });

  return results;
}

function parseCneaProgramsFromHtml(html: string): Array<Omit<NursingProgram, 'id'>> {
  const results: Array<Omit<NursingProgram, 'id'>> = [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const accordionMarker = 'accordion-item';
  if (html.includes(accordionMarker)) {
    const segments = html.split(accordionMarker).slice(1);
    segments.forEach(segment => {
      const block = segment;
      const titleMatch = block.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      const institution = titleMatch ? stripHtml(titleMatch[1]) : '';
      if (!institution) return;

      const lines = extractHtmlLines(block);
      const locationLine = lines.find(line => /,\s*[A-Z]{2}\s*\d{5}/.test(line));
      const locationMatch = locationLine?.match(/(.+?),\s*([A-Z]{2})\s*(\d{5})?/);
      const city = locationMatch?.[1]?.trim() ?? null;
      const state = parseState(locationMatch?.[2] ?? '');
      if (!state) return;

      const strongMatches = Array.from(block.matchAll(/<strong>([^<]+)<\/strong>/gi))
        .map(match => stripHtml(match[1]));
      const programLine = strongMatches.find(line =>
        /nurs|degree|diploma|associate|baccalaureate|bachelor|master|doctoral|dnp|phd|dns|practical/i.test(line)
      ) || '';

      const statusLine = lines.find(line =>
        /accreditation|candidate|candidacy/i.test(line)
      ) || null;

      const programLevels = extractProgramLevels(programLine || lines.join(' '));
      if (!programLevels.length) return;

      programLevels.forEach(level => {
        results.push({
          institution_name: institution,
          campus_name: null,
          city,
          state,
          program_level: level,
          credential_notes: programLine || null,
          accreditor: 'CNEA',
          accreditation_status: statusLine,
          source_url: CNEA_DIRECTORY_URL,
          school_website_url: null,
          nces_unitid: null,
          last_verified_date: updatedAt
        });
      });
    });
  }

  if (results.length) return results;

  const itemRegex = /<div[^>]*class="w-dyn-item"[^>]*>([\s\S]*?)(?=<div[^>]*class="w-dyn-item"|<\/div>\s*<\/div>\s*<\/div>)/gi;
  let match: RegExpExecArray | null;
  let sawCms = false;

  while ((match = itemRegex.exec(html)) !== null) {
    sawCms = true;
    const block = match[1];
    const institution = extractCmsField(block, 'institution')
      || extractCmsField(block, 'institution-name')
      || extractCmsField(block, 'school')
      || extractCmsField(block, 'school-name')
      || extractCmsField(block, 'governing-org');
    const program = extractCmsField(block, 'program')
      || extractCmsField(block, 'program-name')
      || extractCmsField(block, 'program-type')
      || extractCmsField(block, 'degree')
      || extractCmsField(block, 'degree-level')
      || extractCmsField(block, 'program-level');
    const city = extractCmsField(block, 'city') || '';
    const stateRaw = extractCmsField(block, 'state') || '';
    const location = extractCmsField(block, 'location')
      || extractCmsField(block, 'city-state');
    const status = extractCmsField(block, 'status')
      || extractCmsField(block, 'accreditation-status')
      || extractCmsField(block, 'accreditation');

    let state = parseState(stateRaw);
    let resolvedCity: string | null = city || null;

    if (!state && location) {
      const locationMatch = location.match(/(.+?),\s*([A-Z]{2})\b/);
      if (locationMatch) {
        resolvedCity = resolvedCity || locationMatch[1].trim();
        state = parseState(locationMatch[2]);
      }
    }

    if (!institution || !state) continue;
    const programLevels = extractProgramLevels(program || '');
    if (!programLevels.length) continue;

    programLevels.forEach(level => {
      results.push({
        institution_name: institution,
        campus_name: null,
        city: resolvedCity,
        state,
        program_level: level,
        credential_notes: program || null,
        accreditor: 'CNEA',
        accreditation_status: status || null,
        source_url: CNEA_DIRECTORY_URL,
        school_website_url: null,
        nces_unitid: null,
        last_verified_date: updatedAt
      });
    });
  }

  if (results.length || sawCms) return results;

  const rows = parseHtmlTable(html);
  if (!rows.length) return results;

  const header = rows[0].map(cell => cell.toLowerCase());
  const hasHeader = header.some(cell =>
    cell.includes('state') || cell.includes('institution') || cell.includes('program')
  );
  const startIndex = hasHeader ? 1 : 0;
  const findHeader = (key: string) => header.findIndex(cell => cell.includes(key));
  const idxInstitution = hasHeader ? findHeader('institution') : -1;
  const idxProgram = hasHeader ? findHeader('program') : -1;
  const idxCity = hasHeader ? findHeader('city') : -1;
  const idxState = hasHeader ? findHeader('state') : -1;
  const idxStatus = hasHeader ? findHeader('status') : -1;
  const idxWebsite = hasHeader ? findHeader('website') : -1;

  for (let i = startIndex; i < rows.length; i += 1) {
    const cells = rows[i];
    if (!cells.length) continue;
    const institution = (idxInstitution >= 0 ? cells[idxInstitution] : cells[0])?.trim();
    if (!institution) continue;
    const program = (idxProgram >= 0 ? cells[idxProgram] : cells[1] ?? '').trim();
    const city = (idxCity >= 0 ? cells[idxCity] : cells[2] ?? '').trim();
    const state = parseState(idxState >= 0 ? cells[idxState] : cells[3]);
    if (!state) continue;
    const status = idxStatus >= 0 ? cells[idxStatus] : '';
    const website = idxWebsite >= 0 ? cells[idxWebsite] : '';
    const programLevels = extractProgramLevels(`${program} ${status}`);
    if (!programLevels.length) continue;

    programLevels.forEach(level => {
      results.push({
        institution_name: institution,
        campus_name: null,
        city: city || null,
        state,
        program_level: level,
        credential_notes: program || null,
        accreditor: 'CNEA',
        accreditation_status: status || null,
        source_url: CNEA_DIRECTORY_URL,
        school_website_url: website || null,
        nces_unitid: null,
        last_verified_date: updatedAt
      });
    });
  }

  return results;
}

function buildProgramId(value: Omit<NursingProgram, 'id'>): string {
  const raw = [
    normalizeInstitutionName(value.institution_name),
    normalizeInstitutionName(value.campus_name ?? ''),
    normalizeInstitutionName(value.city ?? ''),
    value.state.toUpperCase(),
    value.program_level,
    value.accreditor
  ].join('|');
  return crypto.createHash('sha1').update(raw).digest('hex');
}

async function ensureProgramsSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS nursing_programs (
      id TEXT PRIMARY KEY,
      institution_name TEXT NOT NULL,
      campus_name TEXT,
      city TEXT,
      state TEXT NOT NULL,
      program_level TEXT NOT NULL,
      credential_notes TEXT,
      accreditor TEXT NOT NULL,
      accreditation_status TEXT,
      source_url TEXT NOT NULL,
      school_website_url TEXT,
      nces_unitid TEXT,
      last_verified_date DATE NOT NULL
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_nursing_programs_state ON nursing_programs(state)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_nursing_programs_level ON nursing_programs(program_level)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_nursing_programs_accreditor ON nursing_programs(accreditor)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_nursing_programs_unitid ON nursing_programs(nces_unitid)`);
}

async function fetchWithTimeout(url: string, timeoutMs = 60000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function buildProgramRecord(partial: Omit<NursingProgram, 'id'>): NursingProgram {
  return {
    id: buildProgramId(partial),
    ...partial
  };
}

async function fetchCcnePrograms(): Promise<NursingProgram[]> {
  const states = ALL_STATES;
  const results: NursingProgram[] = [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const concurrency = 4;
  let index = 0;

  async function worker() {
    while (index < states.length) {
      const state = states[index++];
      const url = CCNE_STATE_URL_TEMPLATE.replace('{STATE}', state);
      try {
        const html = await fetchWithTimeout(url, 45000);
        results.push(...parseCcneProgramsFromHtml(html, state));
      } catch (err) {
        console.warn(`CCNE scrape failed for ${state}:`, err);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  programsSources.push({
    name: 'CCNE',
    url: CCNE_STATE_URL_TEMPLATE,
    updatedAt,
    programCount: results.length
  });
  return results;
}

async function fetchAcenProgramsFromSearch(): Promise<NursingProgram[]> {
  if (!ACEN_SEARCH_URL) return [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const results: NursingProgram[] = [];

  try {
    let page = 1;
    let pageKey: string | null = null;
    const maxPages = 200;

    while (page <= maxPages) {
      const pageUrl = page === 1
        ? ACEN_SEARCH_URL
        : pageKey
          ? `${ACEN_SEARCH_URL}?${pageKey}_page=${page}`
          : `${ACEN_SEARCH_URL}?page=${page}`;

      let html = '';
      try {
        html = await fetchWithTimeout(pageUrl, 60000);
      } catch (err) {
        console.warn(`ACEN search scrape failed on page ${page}:`, err);
        break;
      }

      if (!pageKey) {
        const keyMatch = html.match(/\?([0-9a-f]+)_page=2/i);
        if (keyMatch) pageKey = keyMatch[1];
      }

      const pagePrograms = parseAcenProgramsFromSearchHtml(html).map(entry => buildProgramRecord(entry));
      if (!pagePrograms.length) break;
      results.push(...pagePrograms);
      page += 1;
    }
  } catch (err) {
    console.warn('ACEN search scrape failed:', err);
  }

  programsSources.push({
    name: 'ACEN (Search)',
    url: ACEN_SEARCH_URL,
    updatedAt,
    programCount: results.length
  });

  return results;
}

async function fetchAcenPrograms(): Promise<NursingProgram[]> {
  if (!ACEN_DIRECTORY_URL) return [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const results: NursingProgram[] = [];
  try {
    const html = await fetchWithTimeout(ACEN_DIRECTORY_URL, 60000);
    const rows = parseHtmlTable(html);
    rows.forEach((cells) => {
      if (cells.length < 3) return;
      const [institutionRaw, city, state, programInfo = '', status = '', website = ''] = cells;
      const institution = institutionRaw?.trim();
      if (!institution) return;
      const normalizedState = parseState(state);
      if (!normalizedState) return;
      const programLevels = extractProgramLevels(`${programInfo} ${status}`);
      if (!programLevels.length) return;
      programLevels.forEach(level => {
        results.push(buildProgramRecord({
          institution_name: institution,
          campus_name: null,
          city: city || null,
          state: normalizedState,
          program_level: level,
          credential_notes: programInfo || null,
          accreditor: 'ACEN',
          accreditation_status: status || null,
          source_url: ACEN_DIRECTORY_URL,
          school_website_url: website || null,
          nces_unitid: null,
          last_verified_date: updatedAt
        }));
      });
    });
  } catch (err) {
    console.warn('ACEN scrape failed:', err);
  }
  programsSources.push({
    name: 'ACEN',
    url: ACEN_DIRECTORY_URL,
    updatedAt,
    programCount: results.length
  });
  return results;
}

async function fetchCneaPrograms(): Promise<NursingProgram[]> {
  if (!CNEA_DIRECTORY_URL) return [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const results: NursingProgram[] = [];
  try {
    const html = await fetchWithTimeout(CNEA_DIRECTORY_URL, 60000);
    const programs = parseCneaProgramsFromHtml(html).map(entry => buildProgramRecord(entry));
    results.push(...programs);
  } catch (err) {
    console.warn('CNEA scrape failed:', err);
  }
  programsSources.push({
    name: 'CNEA',
    url: CNEA_DIRECTORY_URL,
    updatedAt,
    programCount: results.length
  });
  return results;
}

function dedupePrograms(programs: NursingProgram[]): NursingProgram[] {
  const map = new Map<string, NursingProgram>();
  programs.forEach(program => {
    map.set(program.id, program);
  });
  return Array.from(map.values());
}

async function refreshPrograms() {
  programsSources = [];
  const collected: NursingProgram[] = [];
  try {
    const ccne = await fetchCcnePrograms();
    collected.push(...ccne);
  } catch (err) {
    console.warn('CCNE scrape failed:', err);
  }
  try {
    const acenSearch = await fetchAcenProgramsFromSearch();
    collected.push(...acenSearch);
  } catch (err) {
    console.warn('ACEN search scrape failed:', err);
  }
  try {
    const acen = await fetchAcenPrograms();
    collected.push(...acen);
  } catch (err) {
    console.warn('ACEN scrape failed:', err);
  }
  try {
    const cnea = await fetchCneaPrograms();
    collected.push(...cnea);
  } catch (err) {
    console.warn('CNEA scrape failed:', err);
  }
  const deduped = dedupePrograms(collected);
  programsLastUpdated = new Date();

  if (!pool) {
    cachedPrograms = deduped;
    return;
  }

  await ensureProgramsSchema();
  await pool.query('TRUNCATE nursing_programs');
  const chunkSize = 500;
  for (let i = 0; i < deduped.length; i += chunkSize) {
    const chunk = deduped.slice(i, i + chunkSize);
    const values: any[] = [];
    const placeholders = chunk.map((entry, idx) => {
      const offset = idx * 13;
      values.push(
        entry.id,
        entry.institution_name,
        entry.campus_name,
        entry.city,
        entry.state,
        entry.program_level,
        entry.credential_notes,
        entry.accreditor,
        entry.accreditation_status,
        entry.source_url,
        entry.school_website_url,
        entry.nces_unitid,
        entry.last_verified_date
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13})`;
    });
    await pool.query(
      `INSERT INTO nursing_programs (
        id, institution_name, campus_name, city, state, program_level, credential_notes,
        accreditor, accreditation_status, source_url, school_website_url, nces_unitid, last_verified_date
      ) VALUES ${placeholders.join(', ')}
      ON CONFLICT (id) DO UPDATE SET
        institution_name = EXCLUDED.institution_name,
        campus_name = EXCLUDED.campus_name,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        program_level = EXCLUDED.program_level,
        credential_notes = EXCLUDED.credential_notes,
        accreditor = EXCLUDED.accreditor,
        accreditation_status = EXCLUDED.accreditation_status,
        source_url = EXCLUDED.source_url,
        school_website_url = EXCLUDED.school_website_url,
        nces_unitid = EXCLUDED.nces_unitid,
        last_verified_date = EXCLUDED.last_verified_date`,
      values
    );
  }
}

async function getProgramsSnapshot() {
  if (!pool) {
    return {
      programs: cachedPrograms,
      lastUpdated: programsLastUpdated?.toISOString() ?? null
    };
  }
  const programs = await query<NursingProgram>(`
    SELECT id, institution_name, campus_name, city, state, program_level, credential_notes,
           accreditor, accreditation_status, source_url, school_website_url, nces_unitid, last_verified_date
    FROM nursing_programs
    ORDER BY state ASC, institution_name ASC
  `);
  const meta = await query<{ last_verified_date: string | null }>(
    `SELECT MAX(last_verified_date) as last_verified_date FROM nursing_programs`
  );
  const lastUpdated = meta[0]?.last_verified_date ?? null;
  return { programs, lastUpdated };
}

type CursorPayload = {
  date: string;
  id: string;
};

function normalizeCursorDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function mapNoticeForApi(n: NormalizedWarnNotice) {
  const leadTimeDays = calculateLeadTimeDays(n.noticeDate, n.effectiveDate);
  const employerId = buildEmployerId(n.state, n.employerName, n.parentSystem);
  return {
    id: n.id,
    state: n.state,
    employer_name: n.employerName,
    parent_system: n.parentSystem ?? null,
    employer_id: employerId,
    facility_name: n.employerName,
    city: n.city,
    county: n.county,
    address: n.address,
    notice_date: n.noticeDate,
    effective_date: n.effectiveDate,
    lead_time_days: leadTimeDays,
    employees_affected: n.employeesAffected,
    naics: n.naics,
    reason: n.reason,
    raw_text: n.rawText,
    source_name: n.source.sourceName,
    source_url: n.source.sourceUrl,
    source_id: n.source.sourceId,
    attachments: n.attachments ? JSON.stringify(n.attachments) : null,
    nursing_score: n.nursingImpact?.score ?? 0,
    nursing_label: n.nursingImpact?.label ?? 'Unclear',
    nursing_signals: JSON.stringify(n.nursingImpact?.signals ?? []),
    nursing_keywords: JSON.stringify(n.nursingImpact?.keywordsFound ?? []),
    nursing_role_mix: n.nursingImpact?.roleMix ?? null,
    nursing_care_setting: n.nursingImpact?.careSetting ?? null,
    nursing_specialties: JSON.stringify(n.nursingImpact?.specialties ?? []),
    nursing_explanations: JSON.stringify(n.nursingImpact?.explanations ?? []),
    retrieved_at: n.source.retrievedAt
  };
}

type InsightNotice = {
  id: string;
  state: string;
  employer_name: string;
  parent_system: string | null;
  facility_name: string | null;
  employer_id: string;
  city: string | null;
  address: string | null;
  notice_date: string | null;
  effective_date: string | null;
  lead_time_days: number | null;
  employees_affected: number | null;
  naics: string | null;
  nursing_score: number;
  nursing_specialties: string[];
  raw_text: string | null;
  reason: string | null;
  retrieved_at: string;
};

const EMPLOYER_SUFFIXES = [
  'inc', 'llc', 'l.l.c', 'co', 'corp', 'corporation', 'company',
  'ltd', 'plc', 'lp', 'llp', 'pllc', 'pc', 'limited'
];

const COUNTY_SEAT_BY_STATE: Record<string, Record<string, string>> = {
  KY: {
    christian: 'Hopkinsville'
  },
  MO: {
    christian: 'Ozark'
  },
  IL: {
    christian: 'Taylorville'
  }
};

function normalizeEmployerName(value: string): string {
  const lowered = value.toLowerCase();
  const noPunct = lowered.replace(/[^a-z0-9\\s]/g, ' ');
  const tokens = noPunct.split(' ').filter(Boolean).filter(t => !EMPLOYER_SUFFIXES.includes(t));
  return tokens.join(' ').trim();
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeCounty(value?: string | null): string {
  if (!value) return '';
  return value.toLowerCase().replace(/county/g, '').trim();
}

function extractCityFromText(text: string, state: string): string | null {
  if (!text) return null;
  const escapedState = state.replace(/[^A-Z]/g, '');
  if (!escapedState) return null;
  const regex = new RegExp(`\\b([A-Za-z .'-]+),\\s*${escapedState}\\b`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    const city = match[1].trim();
    return city || null;
  }
  return null;
}

function inferCityFromEmployerName(name: string): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  const cityLike = trimmed.match(/^([A-Z][A-Za-z.'-]+(?:\\s[A-Z][A-Za-z.'-]+)?)\\s+(Community|Regional|General|Memorial|County|City|Medical|Health|Healthcare|Clinic|Care|Center|Hospital)/);
  if (cityLike && cityLike[1]) {
    const candidate = cityLike[1].trim();
    const blocked = ['Saint', 'St', 'Saints', 'The', 'New', 'Fort'];
    if (!blocked.includes(candidate)) {
      return candidate;
    }
  }
  return null;
}

function inferCity(
  state: string,
  employerName: string,
  county: string | undefined | null,
  address: string | undefined | null,
  rawText: string | undefined | null
): string | null {
  const fromAddress = extractCityFromText(`${address ?? ''} ${rawText ?? ''}`, state);
  if (fromAddress) return fromAddress;
  const fromEmployer = inferCityFromEmployerName(employerName);
  if (fromEmployer) return fromEmployer;
  const normalizedCounty = normalizeCounty(county);
  const seat = COUNTY_SEAT_BY_STATE[state]?.[normalizedCounty];
  if (seat) return seat;
  return null;
}

function inferParentSystem(name: string): string | null {
  const lowered = name.toLowerCase();
  const matches = ['health system', 'healthcare', 'health care', 'health', 'medical group'];
  for (const marker of matches) {
    const idx = lowered.indexOf(marker);
    if (idx >= 0) {
      return name.slice(0, idx + marker.length).trim();
    }
  }
  const splitters = [' - ', ' – ', ' — ', ' / '];
  for (const splitter of splitters) {
    if (name.includes(splitter)) {
      return name.split(splitter)[0].trim();
    }
  }
  return null;
}

function buildEmployerId(state: string, employerName: string, parentSystem?: string | null): string {
  const base = parentSystem || employerName;
  const normalized = normalizeEmployerName(base || employerName);
  return `${state}:${slugify(normalized || employerName)}`;
}

function calculateLeadTimeDays(noticeDate?: string | null, effectiveDate?: string | null): number | null {
  if (!noticeDate || !effectiveDate) return null;
  const start = new Date(noticeDate);
  const end = new Date(effectiveDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
}

function hasSilentSignals(reason?: string | null, rawText?: string | null): boolean {
  const text = `${reason ?? ''} ${rawText ?? ''}`.toLowerCase();
  const triggers = ['unit closure', 'bed reduction', 'service line', 'ward closure', 'closure'];
  return triggers.some(t => text.includes(t));
}

function rowToInsightNotice(row: any): InsightNotice {
  const employerName = row.employer_name ?? row.employerName ?? '';
  const parentSystem = row.parent_system ?? row.parentSystem ?? null;
  const facilityName = row.facility_name ?? employerName ?? null;
  const employerId = row.employer_id ?? buildEmployerId(row.state, employerName, parentSystem);
  const noticeDate = row.notice_date ?? row.noticeDate ?? null;
  const effectiveDate = row.effective_date ?? row.effectiveDate ?? null;
  const leadTimeDays = row.lead_time_days ?? calculateLeadTimeDays(noticeDate, effectiveDate);
  const naics = row.naics ?? null;
  const address = row.address ?? null;
  const county = row.county ?? null;
  const inferredCity = row.city ?? inferCity(row.state, employerName, county, address, row.raw_text ?? row.rawText ?? '');
  const nursingSpecialties = (() => {
    const raw = row.nursing_specialties ?? row.nursingSpecialties;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  })();
  return {
    id: row.id,
    state: row.state,
    employer_name: employerName,
    parent_system: parentSystem,
    facility_name: facilityName,
    employer_id: employerId,
    city: inferredCity,
    address,
    notice_date: noticeDate,
    effective_date: effectiveDate,
    lead_time_days: leadTimeDays,
    employees_affected: row.employees_affected ?? row.employeesAffected ?? null,
    naics,
    nursing_score: row.nursing_score ?? row.nursingScore ?? 0,
    nursing_specialties: nursingSpecialties,
    raw_text: row.raw_text ?? row.rawText ?? null,
    reason: row.reason ?? null,
    retrieved_at: row.retrieved_at ?? row.retrievedAt ?? new Date().toISOString()
  };
}

function normalizedToInsightNotice(n: NormalizedWarnNotice): InsightNotice {
  const employerName = n.employerName;
  const parentSystem = n.parentSystem ?? inferParentSystem(employerName);
  const noticeDate = n.noticeDate ?? null;
  const effectiveDate = n.effectiveDate ?? null;
  const inferredCity = n.city ?? inferCity(n.state, employerName, n.county, n.address, n.rawText);
  return {
    id: n.id,
    state: n.state,
    employer_name: employerName,
    parent_system: parentSystem,
    facility_name: employerName,
    employer_id: buildEmployerId(n.state, employerName, parentSystem),
    city: inferredCity,
    address: n.address ?? null,
    notice_date: noticeDate,
    effective_date: effectiveDate,
    lead_time_days: calculateLeadTimeDays(noticeDate, effectiveDate),
    employees_affected: n.employeesAffected ?? null,
    naics: n.naics ?? null,
    nursing_score: n.nursingImpact?.score ?? 0,
    nursing_specialties: n.nursingImpact?.specialties ?? [],
    raw_text: n.rawText ?? null,
    reason: n.reason ?? null,
    retrieved_at: n.source.retrievedAt
  };
}

async function getInsightNotices(): Promise<InsightNotice[]> {
  if (!pool) {
    return cachedNotices.map(normalizedToInsightNotice);
  }
  const rows = await query(`
    SELECT id, state, employer_name, parent_system, city, address, county, notice_date, effective_date,
           employees_affected, nursing_score, raw_text, reason, retrieved_at, naics
    FROM warn_notices
  `);
  return rows.map(rowToInsightNotice);
}

async function getRecentInsightNotices(days: number): Promise<InsightNotice[]> {
  const sinceDate = new Date(Date.now() - days * 86400000).toISOString();
  if (!pool) {
    return cachedNotices
      .filter(n => {
        const dateValue = n.noticeDate || n.source.retrievedAt;
        return dateValue >= sinceDate;
      })
      .map(normalizedToInsightNotice);
  }
  const rows = await query(`
    SELECT id, state, employer_name, parent_system, city, address, county, notice_date, effective_date,
           employees_affected, nursing_score, raw_text, reason, retrieved_at, naics
    FROM warn_notices
    WHERE COALESCE(notice_date, retrieved_at) >= $1
  `, [sinceDate]);
  return rows.map(rowToInsightNotice);
}

function riskLevelFromCount(count: number): 'green' | 'yellow' | 'red' {
  if (count >= 20) return 'red';
  if (count >= 5) return 'yellow';
  return 'green';
}

function isHealthcareInsight(notice: InsightNotice): boolean {
  if ((notice.nursing_score ?? 0) >= 20) return true;
  if (notice.naics && String(notice.naics).startsWith('62')) return true;
  const text = `${notice.employer_name} ${notice.parent_system ?? ''} ${notice.reason ?? ''} ${notice.raw_text ?? ''}`.toLowerCase();
  const patterns = [
    'hospital', 'medical center', 'health system', 'healthcare', 'health care',
    'clinic', 'nursing', 'skilled nursing', 'long term care', 'ltc', 'snf',
    'hospice', 'behavioral health', 'rehab', 'home health', 'assisted living',
    'senior care', 'elder care'
  ];
  return patterns.some(pattern => text.includes(pattern));
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeCursor(cursor: string | undefined): CursorPayload | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as CursorPayload;
    if (!parsed?.date || !parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function ensureIndexes(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_warn_notices_state ON warn_notices(state)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_warn_notices_notice_date ON warn_notices(notice_date)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_warn_notices_nursing_score ON warn_notices(nursing_score)`);
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_warn_notices_employer_trgm ON warn_notices USING GIN (employer_name gin_trgm_ops)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_warn_notices_raw_trgm ON warn_notices USING GIN (raw_text gin_trgm_ops)`);
}

app.get('/health', async (_req, res) => {
  try {
    if (pool) await pool.query('SELECT 1');
    res.json({ ok: true, db: Boolean(pool) });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? 'db_error' });
  }
});

app.get('/nursing-programs', requirePasscode, apiLimiter, async (_req, res) => {
  try {
    const snapshot = await getProgramsSnapshot();
    res.json({
      programs: snapshot.programs,
      total: snapshot.programs.length,
      lastUpdated: snapshot.lastUpdated,
      sources: programsSources
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'programs_unavailable' });
  }
});

// Authentication endpoint with rate limiting
app.post('/auth', authLimiter, (req, res) => {
  if (!ACCESS_PASSCODE) {
    return res.status(500).json({ success: false, error: 'Access passcode is not configured' });
  }
  const rawPasscode = req.body?.passcode;

  if (!rawPasscode || typeof rawPasscode !== 'string') {
    return res.status(400).json({ success: false, error: 'Passcode required' });
  }

  // Sanitize and limit passcode length
  const passcode = sanitizeString(rawPasscode, 100);
  if (!passcode) {
    return res.status(400).json({ success: false, error: 'Invalid passcode format' });
  }

  // Constant-time comparison to prevent timing attacks
  const isValid = passcode.length === ACCESS_PASSCODE.length &&
    crypto.timingSafeEqual(
      Buffer.from(passcode),
      Buffer.from(ACCESS_PASSCODE)
    );

  if (isValid) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid passcode' });
  }
});

// Live fetch from adapters (no DB mode)
async function fetchWithRetry<T>(fetcher: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetcher();
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function fetchLiveNotices(stateFilter?: USStateAbbrev): Promise<NormalizedWarnNotice[]> {
  const adapters = stateFilter
    ? [getAdapter(stateFilter as any)].filter(Boolean)
    : getAllAdapters();

  const concurrency = 4;
  const queue = adapters.slice();
  const allNotices: NormalizedWarnNotice[] = [];

  const worker = async () => {
    while (queue.length) {
      const adapter = queue.shift();
      if (!adapter) continue;
      try {
        console.log(`Fetching from ${adapter.state}...`);
        const result = await fetchWithRetry(async () => {
          const fetchPromise = adapter.fetchLatest();
          const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Adapter timeout')), 45000);
          });
          return Promise.race([fetchPromise, timeout]);
        });
        console.log(`${adapter.state}: got ${result.notices.length} notices`);
        allNotices.push(...result.notices);
      } catch (err: any) {
        console.error(`${adapter.state} failed:`, err?.message || err);
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => worker());
  await Promise.all(workers);
  return allNotices;
}

async function upsertNotices(notices: NormalizedWarnNotice[]): Promise<void> {
  if (!pool || notices.length === 0) return;
  const chunkSize = 200;
  for (let i = 0; i < notices.length; i += chunkSize) {
    const chunk = notices.slice(i, i + chunkSize);
    const values: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    for (const notice of chunk) {
      values.push(`(
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}
      )`);
      params.push(
        notice.id,
        notice.state,
        notice.employerName,
        notice.parentSystem ?? null,
        notice.city ?? null,
        notice.county ?? null,
        notice.address ?? null,
        notice.noticeDate ?? null,
        notice.effectiveDate ?? null,
        notice.employeesAffected ?? null,
        notice.naics ?? null,
        notice.reason ?? null,
        notice.rawText ?? null,
        notice.source.sourceName,
        notice.source.sourceUrl,
        notice.source.sourceId ?? null,
        notice.attachments ? JSON.stringify(notice.attachments) : null,
        notice.nursingImpact?.score ?? null,
        notice.nursingImpact?.label ?? null,
        JSON.stringify(notice.nursingImpact?.signals ?? []),
        JSON.stringify(notice.nursingImpact?.keywordsFound ?? []),
        notice.source.retrievedAt
      );
    }
    const sql = `
      INSERT INTO warn_notices (
        id, state, employer_name, parent_system, city, county, address,
        notice_date, effective_date, employees_affected, naics, reason, raw_text,
        source_name, source_url, source_id, attachments, nursing_score, nursing_label,
        nursing_signals, nursing_keywords, retrieved_at
      ) VALUES ${values.join(',')}
      ON CONFLICT (id) DO UPDATE SET
        state = EXCLUDED.state,
        employer_name = EXCLUDED.employer_name,
        parent_system = EXCLUDED.parent_system,
        city = EXCLUDED.city,
        county = EXCLUDED.county,
        address = EXCLUDED.address,
        notice_date = EXCLUDED.notice_date,
        effective_date = EXCLUDED.effective_date,
        employees_affected = EXCLUDED.employees_affected,
        naics = EXCLUDED.naics,
        reason = EXCLUDED.reason,
        raw_text = EXCLUDED.raw_text,
        source_name = EXCLUDED.source_name,
        source_url = EXCLUDED.source_url,
        source_id = EXCLUDED.source_id,
        attachments = EXCLUDED.attachments,
        nursing_score = EXCLUDED.nursing_score,
        nursing_label = EXCLUDED.nursing_label,
        nursing_signals = EXCLUDED.nursing_signals,
        nursing_keywords = EXCLUDED.nursing_keywords,
        retrieved_at = EXCLUDED.retrieved_at
    `;
    await pool.query(sql, params);
  }
}

// POST /fetch - Force fetch from all adapters (live mode)
app.post('/fetch', requirePasscode, async (req, res) => {
  const stateParam = String(req.query.state ?? req.body?.state ?? '').toUpperCase();
  const state = parseState(stateParam);
  if (stateParam && !state) {
    return res.status(400).json({ success: false, error: 'Invalid state code' });
  }
  try {
    console.log('Starting live fetch...');
    const notices = await fetchLiveNotices(state);

    if (pool) {
      await upsertNotices(notices);
    } else {
      if (!state) {
        cachedNotices = notices;
      } else {
        cachedNotices = cachedNotices.filter(n => n.state !== state).concat(notices);
      }
    }
    lastFetchTime = new Date();

    res.json({
      success: true,
      count: notices.length,
      states: [...new Set(notices.map(n => n.state))],
      fetchedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Fetch failed' });
  }
});

app.get('/fetch', (_req, res) => {
  res.status(405).json({ success: false, error: 'Use POST /fetch' });
});

// GET /notices?state=IN,KY,FL&since=2026-01-01&limit=100&minScore=50
app.get('/notices', requirePasscode, apiLimiter, async (req, res) => {
  const stateParam = sanitizeString(String(req.query.state ?? ''), 200);
  // Support multiple comma-separated states
  const states = parseStates(stateParam);
  const region = sanitizeString(String(req.query.region ?? ''), 20);
  const org = sanitizeString(String(req.query.org ?? ''), 200);
  const recruiterFocus = sanitizeString(String(req.query.recruiterFocus ?? ''), 10).toLowerCase();
  const sinceRaw = sanitizeString(String(req.query.since ?? ''), 10);
  const since = isValidDateString(sinceRaw) ? sinceRaw : '1970-01-01';
  const limitRaw = sanitizeString(String(req.query.limit ?? '100'), 10).toLowerCase();
  const noLimit = ['all', '0', 'none'].includes(limitRaw);
  const limit = noLimit ? 0 : sanitizeNumber(limitRaw, 1, 500, 100);
  const minScore = sanitizeNumber(String(req.query.minScore ?? '0'), 0, 100, 0);
  const stream = sanitizeString(String(req.query.stream ?? ''), 5).toLowerCase() === '1';
  const cursor = noLimit ? null : decodeCursor(String(req.query.cursor ?? ''));

  // Validate states - if any state param was provided but none were valid
  if (stateParam && states.length === 0) {
    return res.status(400).json({ error: 'Invalid state code(s)' });
  }
  if (region && !REGION_STATES[region]) {
    return res.status(400).json({ error: 'Unknown region' });
  }

  // Healthcare keywords for recruiter focus filtering
  const healthcarePatterns = [
    'hospital', 'medical center', 'health system', 'healthcare', 'health care',
    'clinic', 'nursing', 'skilled nursing', 'long term care', 'ltc', 'snf',
    'hospice', 'behavioral health', 'rehab', 'home health', 'assisted living',
    'senior care', 'elder care', 'medical', 'patient', 'physician'
  ];

  const isHealthcareRelated = (notice: NormalizedWarnNotice): boolean => {
    // Check NAICS code (62x = Healthcare)
    if (notice.naics && notice.naics.startsWith('62')) return true;

    // Check nursing impact label
    if (notice.nursingImpact?.label === 'Likely' || notice.nursingImpact?.label === 'Possible') return true;

    // Check nursing score
    if ((notice.nursingImpact?.score ?? 0) >= 20) return true;

    // Check employer name and reason for healthcare keywords
    const textToSearch = [
      notice.employerName,
      notice.parentSystem,
      notice.reason,
      notice.rawText
    ].filter(Boolean).join(' ').toLowerCase();

    return healthcarePatterns.some(pattern => textToSearch.includes(pattern));
  };

  // If no DB, use cached notices from live fetch
  if (!pool) {
    let filtered = cachedNotices;

    // Filter for recruiter focus (healthcare/nursing only)
    if (recruiterFocus === '1' || recruiterFocus === 'true') {
      filtered = filtered.filter(isHealthcareRelated);
    }

    // Filter by states (supports multiple)
    if (states.length > 0) {
      filtered = filtered.filter(n => states.includes(n.state as USStateAbbrev));
    } else if (region && REGION_STATES[region]) {
      filtered = filtered.filter(n => REGION_STATES[region].includes(n.state));
    }

    // Filter by minScore
    if (minScore > 0) {
      filtered = filtered.filter(n => (n.nursingImpact?.score ?? 0) >= minScore);
    }

    // Filter by date
    if (since && since !== '1970-01-01') {
      filtered = filtered.filter(n => !n.noticeDate || n.noticeDate >= since);
    }

    // Sort by nursing score (desc), then by date (desc)
    filtered.sort((a, b) => {
      const scoreA = a.nursingImpact?.score ?? 0;
      const scoreB = b.nursingImpact?.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      const dateA = a.noticeDate || a.source.retrievedAt;
      const dateB = b.noticeDate || b.source.retrievedAt;
      return dateB.localeCompare(dateA);
    });

    if (cursor) {
      filtered = filtered.filter(n => {
        const dateValue = n.noticeDate || n.source.retrievedAt;
        if (dateValue < cursor.date) return true;
        if (dateValue > cursor.date) return false;
        return n.id < cursor.id;
      });
    }

    if (stream) {
      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      let emitted = 0;
      for (const notice of filtered) {
        if (!noLimit && emitted >= limit) break;
        res.write(`${JSON.stringify(mapNoticeForApi(notice))}\n`);
        emitted += 1;
      }
      return res.end();
    }

    // Apply limit
    const page = noLimit ? filtered : filtered.slice(0, limit);
    const nextCursor = (!noLimit && page.length === limit)
      ? encodeCursor({
        date: normalizeCursorDate(page[page.length - 1].noticeDate || page[page.length - 1].source.retrievedAt),
        id: page[page.length - 1].id
      })
      : null;

    // Convert to DB-like format for UI compatibility
    const notices = page.map(mapNoticeForApi);

    return res.json({
      notices,
      nextCursor,
      cached: true,
      lastFetch: lastFetchTime?.toISOString(),
      note: cachedNotices.length === 0 ? 'No data yet. Call POST /fetch to load notices from state adapters.' : undefined
    });
  }

  const params: any[] = [since, limit, minScore];
  let sql = `
    SELECT *
    FROM warn_notices
    WHERE (notice_date IS NULL OR notice_date >= $1)
      AND COALESCE(nursing_score, 0) >= $3
  `;
  let paramIndex = 4;
  if (recruiterFocus === '1' || recruiterFocus === 'true') {
    const healthcarePatterns = [
      '%hospital%',
      '%medical center%',
      '%health system%',
      '%healthcare%',
      '%health care%',
      '%clinic%',
      '%nursing%',
      '%skilled nursing%',
      '%long term care%',
      '%ltc%',
      '%snf%',
      '%hospice%',
      '%behavioral health%',
      '%rehab%',
      '%home health%'
    ];
    sql += `
      AND (
        COALESCE(nursing_label, 'Unclear') <> 'Unclear'
        OR (naics IS NOT NULL AND naics LIKE '62%')
        OR employer_name ILIKE ANY($${paramIndex})
        OR parent_system ILIKE ANY($${paramIndex})
        OR reason ILIKE ANY($${paramIndex})
        OR raw_text ILIKE ANY($${paramIndex})
      )
    `;
    params.push(healthcarePatterns);
    paramIndex += 1;
  }
  if (org) {
    sql += `
      AND (
        employer_name ILIKE $${paramIndex}
        OR parent_system ILIKE $${paramIndex}
        OR reason ILIKE $${paramIndex}
        OR raw_text ILIKE $${paramIndex}
      )
    `;
    params.push(`%${org}%`);
    paramIndex += 1;
  }
  if (states.length === 0 && region && REGION_STATES[region]) {
    sql += ` AND state = ANY($${paramIndex})`;
    params.push(REGION_STATES[region]);
    paramIndex += 1;
  }
  if (states.length > 0) {
    sql += ` AND state = ANY($${paramIndex})`;
    params.push(states);
    paramIndex += 1;
  }
  if (cursor) {
    sql += `
      AND (
        COALESCE(notice_date, retrieved_at) < $${paramIndex}
        OR (COALESCE(notice_date, retrieved_at) = $${paramIndex} AND id < $${paramIndex + 1})
      )
    `;
    params.push(cursor.date, cursor.id);
    paramIndex += 2;
  }
  sql += ` ORDER BY COALESCE(notice_date, retrieved_at) DESC NULLS LAST`;
  if (!noLimit) {
    sql += ` LIMIT $2`;
  }

  if (stream) {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    let remaining = noLimit ? null : limit;
    let pageCursor = cursor;
    const pageSize = 200;

    while (true) {
      const pageLimit = remaining === null ? pageSize : Math.min(pageSize, remaining);
      const pageParams: any[] = [since, pageLimit, minScore];
      let pageSql = `
        SELECT *
        FROM warn_notices
        WHERE (notice_date IS NULL OR notice_date >= $1)
          AND COALESCE(nursing_score, 0) >= $3
      `;
      let pageParamIndex = 4;
      if (recruiterFocus === '1' || recruiterFocus === 'true') {
        const healthcarePatterns = [
          '%hospital%',
          '%medical center%',
          '%health system%',
          '%healthcare%',
          '%health care%',
          '%clinic%',
          '%nursing%',
          '%skilled nursing%',
          '%long term care%',
          '%ltc%',
          '%snf%',
          '%hospice%',
          '%behavioral health%',
          '%rehab%',
          '%home health%'
        ];
        pageSql += `
          AND (
            COALESCE(nursing_label, 'Unclear') <> 'Unclear'
            OR (naics IS NOT NULL AND naics LIKE '62%')
            OR employer_name ILIKE ANY($${pageParamIndex})
            OR parent_system ILIKE ANY($${pageParamIndex})
            OR reason ILIKE ANY($${pageParamIndex})
            OR raw_text ILIKE ANY($${pageParamIndex})
          )
        `;
        pageParams.push(healthcarePatterns);
        pageParamIndex += 1;
      }
      if (org) {
        pageSql += `
          AND (
            employer_name ILIKE $${pageParamIndex}
            OR parent_system ILIKE $${pageParamIndex}
            OR reason ILIKE $${pageParamIndex}
            OR raw_text ILIKE $${pageParamIndex}
          )
        `;
        pageParams.push(`%${org}%`);
        pageParamIndex += 1;
      }
      if (states.length === 0 && region && REGION_STATES[region]) {
        pageSql += ` AND state = ANY($${pageParamIndex})`;
        pageParams.push(REGION_STATES[region]);
        pageParamIndex += 1;
      }
      if (states.length > 0) {
        pageSql += ` AND state = ANY($${pageParamIndex})`;
        pageParams.push(states);
        pageParamIndex += 1;
      }
      if (pageCursor) {
        pageSql += `
          AND (
            COALESCE(notice_date, retrieved_at) < $${pageParamIndex}
            OR (COALESCE(notice_date, retrieved_at) = $${pageParamIndex} AND id < $${pageParamIndex + 1})
          )
        `;
        pageParams.push(pageCursor.date, pageCursor.id);
        pageParamIndex += 2;
      }
      pageSql += ` ORDER BY COALESCE(notice_date, retrieved_at) DESC NULLS LAST LIMIT $2`;

      const pageRows = await query(pageSql, pageParams);
      if (pageRows.length === 0) break;
      for (const row of pageRows) {
        res.write(`${JSON.stringify(row)}\n`);
      }
      const lastRow = pageRows[pageRows.length - 1];
      pageCursor = {
        date: normalizeCursorDate(lastRow.notice_date ?? lastRow.retrieved_at),
        id: lastRow.id
      };
      if (remaining !== null) {
        remaining -= pageRows.length;
        if (remaining <= 0) break;
      }
    }
    return res.end();
  }

  const rows = await query(sql, params);
  const lastRow = rows[rows.length - 1];
  const nextCursor = (!noLimit && lastRow)
    ? encodeCursor({ date: normalizeCursorDate(lastRow.notice_date ?? lastRow.retrieved_at), id: lastRow.id })
    : null;
  res.json({ notices: rows, nextCursor });
});

app.get('/states', requirePasscode, apiLimiter, async (_req, res) => {
  if (!pool) {
    // Build from cache
    const counts: Record<string, number> = {};
    for (const n of cachedNotices) {
      counts[n.state] = (counts[n.state] || 0) + 1;
    }
    const states = Object.entries(counts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => a.state.localeCompare(b.state));
    return res.json({ states, cached: true });
  }
  const rows = await query<{ state: string; count: number }>(
    `SELECT state, COUNT(*)::int as count FROM warn_notices GROUP BY state ORDER BY state ASC`
  );
  res.json({ states: rows });
});

app.get('/insights/alerts', requirePasscode, apiLimiter, async (_req, res) => {
  const recent = (await getRecentInsightNotices(14)).filter(isHealthcareInsight);
  const allNotices = (await getInsightNotices()).filter(isHealthcareInsight);
  const leadMap = new Map<string, { sum: number; count: number }>();

  for (const notice of allNotices) {
    if (typeof notice.lead_time_days !== 'number') continue;
    const entry = leadMap.get(notice.employer_id) ?? { sum: 0, count: 0 };
    entry.sum += notice.lead_time_days;
    entry.count += 1;
    leadMap.set(notice.employer_id, entry);
  }

  const alerts = recent.map(notice => {
    const entry = leadMap.get(notice.employer_id);
    const expected = entry ? Math.round(entry.sum / entry.count) : null;
    const leadTime = notice.lead_time_days ?? null;
    const earlyWarning = expected !== null && leadTime !== null && leadTime <= expected - 2;
    return {
      notice_id: notice.id,
      state: notice.state,
      employer_name: notice.employer_name,
      parent_system: notice.parent_system,
      facility_name: notice.facility_name,
      notice_date: notice.notice_date,
      effective_date: notice.effective_date,
      lead_time_days: leadTime,
      expected_lead_days: expected,
      early_warning: Boolean(earlyWarning),
      nursing_score: notice.nursing_score,
      silent_signal_flag: hasSilentSignals(notice.reason, notice.raw_text)
    };
  });

  res.json({ alerts, count: alerts.length });
});

app.get('/insights/geo', requirePasscode, apiLimiter, async (_req, res) => {
  const recent = (await getRecentInsightNotices(90)).filter(isHealthcareInsight);
  const geoMap = new Map<string, { state: string; city: string | null; total: number }>();

  for (const notice of recent) {
    const city = notice.city ?? null;
    const key = `${notice.state}:${city ?? 'unknown'}`;
    const entry = geoMap.get(key) ?? { state: notice.state, city, total: 0 };
    entry.total += 1;
    geoMap.set(key, entry);
  }

  const locations = Array.from(geoMap.values()).map(entry => ({
    state: entry.state,
    city: entry.city,
    total_notices: entry.total,
    notices_last_90_days: entry.total,
    risk_level: riskLevelFromCount(entry.total)
  }));

  res.json({ locations, count: locations.length });
});

app.get('/insights/talent', requirePasscode, apiLimiter, async (_req, res) => {
  const recent = (await getRecentInsightNotices(90)).filter(isHealthcareInsight);
  const talentMap = new Map<string, { state: string; city: string | null; total: number; specialties: Set<string>; notices: number }>();

  for (const notice of recent) {
    const city = notice.city ?? null;
    const key = `${notice.state}:${city ?? 'unknown'}`;
    const entry = talentMap.get(key) ?? {
      state: notice.state,
      city,
      total: 0,
      specialties: new Set<string>(),
      notices: 0
    };
    const estimated = typeof notice.employees_affected === 'number'
      ? Math.round(notice.employees_affected * (notice.nursing_score / 100) * 0.7)
      : 0;
    entry.total += estimated;
    entry.notices += 1;
    notice.nursing_specialties.forEach(spec => entry.specialties.add(spec));
    talentMap.set(key, entry);
  }

  const opportunities = Array.from(talentMap.values())
    .map(entry => ({
      state: entry.state,
      city: entry.city,
      estimated_nurses_available: entry.total,
      specialties: Array.from(entry.specialties),
      notices_count: entry.notices
    }))
    .sort((a, b) => b.estimated_nurses_available - a.estimated_nurses_available);

  res.json({ opportunities, count: opportunities.length });
});

app.get('/insights/employers', requirePasscode, apiLimiter, async (_req, res) => {
  const notices = (await getInsightNotices()).filter(isHealthcareInsight);
  const map = new Map<string, { employer_id: string; employer_name: string; parent_system: string | null; state: string; total: number; affectedSum: number; affectedCount: number; leadSum: number; leadCount: number; first: string | null; last: string | null }>();

  for (const notice of notices) {
    const entry = map.get(notice.employer_id) ?? {
      employer_id: notice.employer_id,
      employer_name: notice.employer_name,
      parent_system: notice.parent_system,
      state: notice.state,
      total: 0,
      affectedSum: 0,
      affectedCount: 0,
      leadSum: 0,
      leadCount: 0,
      first: null,
      last: null
    };
    entry.total += 1;
    if (typeof notice.employees_affected === 'number') {
      entry.affectedSum += notice.employees_affected;
      entry.affectedCount += 1;
    }
    if (typeof notice.lead_time_days === 'number') {
      entry.leadSum += notice.lead_time_days;
      entry.leadCount += 1;
    }
    const dateValue = notice.notice_date || notice.retrieved_at;
    if (dateValue) {
      if (!entry.first || dateValue < entry.first) entry.first = dateValue;
      if (!entry.last || dateValue > entry.last) entry.last = dateValue;
    }
    map.set(notice.employer_id, entry);
  }

  const employers = Array.from(map.values()).map(entry => ({
    employer_id: entry.employer_id,
    employer_name: entry.employer_name,
    parent_system: entry.parent_system,
    state: entry.state,
    total_notices: entry.total,
    total_affected: entry.affectedSum,
    avg_affected: entry.affectedCount ? Math.round(entry.affectedSum / entry.affectedCount) : 0,
    avg_lead_time_days: entry.leadCount ? Math.round(entry.leadSum / entry.leadCount) : null,
    first_notice_date: entry.first,
    last_notice_date: entry.last
  }));

  res.json({ employers, count: employers.length });
});

app.get('/insights/systems', requirePasscode, apiLimiter, async (_req, res) => {
  const notices = (await getInsightNotices()).filter(isHealthcareInsight);
  const map = new Map<string, { system_name: string; total: number; affected: number; states: Set<string>; last: string | null }>();

  for (const notice of notices) {
    if (!notice.parent_system) continue;
    const entry = map.get(notice.parent_system) ?? {
      system_name: notice.parent_system,
      total: 0,
      affected: 0,
      states: new Set<string>(),
      last: null
    };
    entry.total += 1;
    if (typeof notice.employees_affected === 'number') {
      entry.affected += notice.employees_affected;
    }
    entry.states.add(notice.state);
    const dateValue = notice.notice_date || notice.retrieved_at;
    if (dateValue && (!entry.last || dateValue > entry.last)) {
      entry.last = dateValue;
    }
    map.set(notice.parent_system, entry);
  }

  const systems = Array.from(map.values()).map(entry => ({
    system_name: entry.system_name,
    total_notices: entry.total,
    total_affected: entry.affected,
    states: Array.from(entry.states),
    last_notice_date: entry.last
  }));

  res.json({ systems, count: systems.length });
});

app.listen(PORT, () => {
  ensureIndexes().catch(err => {
    console.error('Failed to ensure DB indexes:', err);
  });
  ensureProgramsSchema().catch(err => {
    console.error('Failed to ensure programs schema:', err);
  });
  refreshPrograms().catch(err => {
    console.error('Failed to refresh nursing programs:', err);
  });
  setInterval(() => {
    refreshPrograms().catch(err => {
      console.error('Failed to refresh nursing programs:', err);
    });
  }, PROGRAMS_REFRESH_MS);
  console.log(`Lighthouse Nursing Intelligence API listening on http://localhost:${PORT}`);
});
