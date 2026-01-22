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

const ALL_STATES: USStateAbbrev[] = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR'
];
const STATE_SET = new Set<string>(ALL_STATES);

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
  return STATE_SET.has(normalized) ? (normalized as USStateAbbrev) : undefined;
}

// Parse multiple comma-separated states
function parseStates(value: string | undefined): USStateAbbrev[] {
  if (!value) return [];
  const sanitized = sanitizeString(value, 200);
  return sanitized.split(',')
    .map(s => s.trim().toUpperCase())
    .filter(s => STATE_SET.has(s)) as USStateAbbrev[];
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
  notice_date: string | null;
  effective_date: string | null;
  lead_time_days: number | null;
  employees_affected: number | null;
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

function normalizeEmployerName(value: string): string {
  const lowered = value.toLowerCase();
  const noPunct = lowered.replace(/[^a-z0-9\\s]/g, ' ');
  const tokens = noPunct.split(' ').filter(Boolean).filter(t => !EMPLOYER_SUFFIXES.includes(t));
  return tokens.join(' ').trim();
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
    city: row.city ?? null,
    notice_date: noticeDate,
    effective_date: effectiveDate,
    lead_time_days: leadTimeDays,
    employees_affected: row.employees_affected ?? row.employeesAffected ?? null,
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
  return {
    id: n.id,
    state: n.state,
    employer_name: employerName,
    parent_system: parentSystem,
    facility_name: employerName,
    employer_id: buildEmployerId(n.state, employerName, parentSystem),
    city: n.city ?? null,
    notice_date: noticeDate,
    effective_date: effectiveDate,
    lead_time_days: calculateLeadTimeDays(noticeDate, effectiveDate),
    employees_affected: n.employeesAffected ?? null,
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
    SELECT id, state, employer_name, parent_system, city, notice_date, effective_date,
           employees_affected, nursing_score, raw_text, reason, retrieved_at
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
    SELECT id, state, employer_name, parent_system, city, notice_date, effective_date,
           employees_affected, nursing_score, raw_text, reason, retrieved_at
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
  const recent = await getRecentInsightNotices(14);
  const allNotices = await getInsightNotices();
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
  const recent = await getRecentInsightNotices(90);
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
  const recent = await getRecentInsightNotices(90);
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
  const notices = await getInsightNotices();
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
  const notices = await getInsightNotices();
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
  console.log(`Lighthouse Nursing Intelligence API listening on http://localhost:${PORT}`);
});
