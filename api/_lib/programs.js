import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const FALLBACK_FILE = path.join(DATA_DIR, 'programs.json');

const ACEN_BASE_URL = 'https://www.acenursing.org/search-programs';
const ACEN_PAGE_PARAM = '64ccb808_page';
const CCNE_ALL_URL = 'https://directory.ccnecommunity.org/reports/rptAccreditedPrograms_New.asp?sort=institution';
const CNEA_URL = 'https://cnea.nln.org/accredited-programs';

const LIVE_TIMEOUT_MS = 18000;
const SOURCES = [
  { name: 'ACEN', url: 'https://www.acenursing.org/search-programs' },
  { name: 'CCNE', url: 'https://directory.ccnecommunity.org/reports/rptAccreditedPrograms_New.asp?sort=institution' },
  { name: 'CNEA', url: 'https://cnea.nln.org/accredited-programs' }
];

const STATE_NAME_TO_ABBR = {
  ALABAMA: 'AL',
  ALASKA: 'AK',
  ARIZONA: 'AZ',
  ARKANSAS: 'AR',
  CALIFORNIA: 'CA',
  COLORADO: 'CO',
  CONNECTICUT: 'CT',
  DELAWARE: 'DE',
  DISTRICT_OF_COLUMBIA: 'DC',
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
  NEW_HAMPSHIRE: 'NH',
  NEW_JERSEY: 'NJ',
  NEW_MEXICO: 'NM',
  NEW_YORK: 'NY',
  NORTH_CAROLINA: 'NC',
  NORTH_DAKOTA: 'ND',
  OHIO: 'OH',
  OKLAHOMA: 'OK',
  OREGON: 'OR',
  PENNSYLVANIA: 'PA',
  RHODE_ISLAND: 'RI',
  SOUTH_CAROLINA: 'SC',
  SOUTH_DAKOTA: 'SD',
  TENNESSEE: 'TN',
  TEXAS: 'TX',
  UTAH: 'UT',
  VERMONT: 'VT',
  VIRGINIA: 'VA',
  WASHINGTON: 'WA',
  WEST_VIRGINIA: 'WV',
  WISCONSIN: 'WI',
  WYOMING: 'WY',
  PUERTO_RICO: 'PR'
};

const LEVEL_PATTERNS = [
  [/practical|vocational|lpn/i, 'LPN'],
  [/associate|adn|asn/i, 'ASN'],
  [/baccalaureate|bachelor/i, 'BSN'],
  [/master/i, 'MSN'],
  [/doctor of nursing practice|clinical doctorate|\bdnp\b/i, 'DNP'],
  [/diploma/i, 'DIPLOMA'],
  [/certificate/i, 'CERT']
];

const BAD_INSTITUTION_PATTERNS = [
  /get support/i,
  /search programs/i,
  /^support$/i,
  /^program$/i
];

const NOISY_TEXT_PATTERN = /(initial accreditation granted|continuing accreditation granted|next on-site program evaluation|<li class=|accordion-item)/i;

let memoryCache = {
  payload: null,
  builtAtMs: 0
};

const CACHE_TTL_MS = 20 * 60 * 1000;

const decodeHtml = (value) => {
  if (value == null) return '';
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const cp = Number.parseInt(hex, 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : _;
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const cp = Number.parseInt(dec, 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : _;
    })
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
};

const stripTags = (value) => decodeHtml(value).replace(/<[^>]*>/g, ' ');

const cleanText = (value) =>
  stripTags(value)
    .replace(/[\u00A0\u2007\u202F]/g, ' ')
    .replace(/[•·]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toStateAbbr = (value) => {
  const raw = cleanText(value).toUpperCase();
  if (!raw) return '';
  if (/^[A-Z]{2}$/.test(raw)) return raw;
  const key = raw.replace(/[^A-Z]+/g, '_').replace(/^_+|_+$/g, '');
  return STATE_NAME_TO_ABBR[key] || '';
};

const normalizeProgramLevel = (value) => {
  const raw = cleanText(value);
  if (!raw) return '';
  for (const [pattern, normalized] of LEVEL_PATTERNS) {
    if (pattern.test(raw)) return normalized;
  }
  return raw.toUpperCase().slice(0, 48);
};

const isLikelyValidInstitution = (institution) => {
  const name = cleanText(institution);
  if (!name || name.length < 3) return false;
  if (BAD_INSTITUTION_PATTERNS.some((pattern) => pattern.test(name))) return false;
  return true;
};

const programId = (program) =>
  crypto
    .createHash('sha1')
    .update(
      [
        program.institution_name,
        program.state,
        program.program_level,
        program.accreditor,
        program.city || ''
      ]
        .map((v) => String(v || '').toLowerCase())
        .join('|')
    )
    .digest('hex');

const parseCityState = (text) => {
  const cleaned = cleanText(text);
  const match = cleaned.match(/([A-Za-z .'-]+),\s*([A-Z]{2})\s+\d{5}(?:-\d{4})?/);
  if (!match) return { city: '', state: '' };
  return { city: cleanText(match[1]), state: match[2].toUpperCase() };
};

const fetchText = async (url, timeoutMs = LIVE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'lighthouse-iq-accredited-programs/1.0' },
      signal: controller.signal
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return res.text();
  } finally {
    clearTimeout(timeout);
  }
};

const parseAcenRows = async () => {
  const rows = [];
  for (let page = 1; page <= 80; page += 1) {
    const url = page === 1 ? ACEN_BASE_URL : `${ACEN_BASE_URL}?${ACEN_PAGE_PARAM}=${page}`;
    const html = await fetchText(url);
    const rowChunks = html.split('<div role="listitem" class="w-dyn-item">').slice(1);
    for (const chunk of rowChunks) {
      const institution = cleanText((chunk.match(/fs-cmsfilter-field="governing-org"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]);
      const levelRaw = cleanText((chunk.match(/fs-cmsfilter-field="program-type"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]);
      const status = cleanText((chunk.match(/fs-cmsfilter-field="status"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]);
      const cityStateParts = [...chunk.matchAll(/fs-cmsfilter-field="State"[^>]*>([\s\S]*?)<\/div>/gi)]
        .map((m) => cleanText(m[1]))
        .filter(Boolean);
      const country = cleanText((chunk.match(/fs-cmsfilter-field="Country"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]);
      const href = (chunk.match(/<a href="([^"]+)" class="gv-org-link/i) || [])[1] || '';

      if (!isLikelyValidInstitution(institution)) continue;
      if (country && country.toLowerCase() !== 'united states') continue;

      const maybeCity = cityStateParts[0] || '';
      let state = toStateAbbr(cityStateParts[1] || '');
      let city = maybeCity;
      if (!state && cityStateParts[0]) {
        const fallbackState = toStateAbbr(cityStateParts[0]);
        if (fallbackState) {
          state = fallbackState;
          city = '';
        }
      }
      if (!state) continue;

      rows.push({
        institution_name: institution,
        campus_name: null,
        city: cleanText(city),
        state,
        program_level: normalizeProgramLevel(levelRaw),
        credential_notes: cleanText(levelRaw),
        accreditor: 'ACEN',
        accreditation_status: status || 'Accredited',
        source_url: href ? `https://www.acenursing.org${href}` : ACEN_BASE_URL,
        school_website_url: null
      });
    }

    if (!/w-pagination-next/.test(html)) break;
  }
  return rows;
};

const parseCcneRows = async () => {
  const html = await fetchText(CCNE_ALL_URL);
  const blocks = html.split('<table width="95%" align="center" class="center" id="instfinder" >').slice(1);
  const rows = [];

  for (const block of blocks) {
    const headings = [...block.matchAll(/<h3>\s*([^<]*?)\s*<\/h3>/gi)]
      .map((m) => cleanText(m[1]))
      .filter(Boolean);
    const institution = headings.find((h) => !/^program$/i.test(h)) || '';
    if (!isLikelyValidInstitution(institution)) continue;

    const preProgramSection = block.split('Chief Nurse Administrator:')[0] || block;
    const location = parseCityState(preProgramSection);
    if (!location.state) continue;

    const levels = [...block.matchAll(/<h3><b>([^<]+)<\/b><\/h3>/gi)]
      .map((m) => cleanText(m[1]))
      .filter(Boolean);
    for (const levelRaw of levels) {
      rows.push({
        institution_name: institution,
        campus_name: null,
        city: location.city,
        state: location.state,
        program_level: normalizeProgramLevel(levelRaw),
        credential_notes: cleanText(levelRaw),
        accreditor: 'CCNE',
        accreditation_status: 'Accredited',
        source_url: CCNE_ALL_URL,
        school_website_url: null
      });
    }
  }

  return rows;
};

const parseCneaRows = async () => {
  const html = await fetchText(CNEA_URL);
  const rows = [];
  const itemRegex = /<li class="accordion-item">([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = itemRegex.exec(html))) {
    const block = match[1];
    const institution = cleanText(
      (block.match(/<div class="title-text">[\s\S]*?<h4>([\s\S]*?)<\/h4>/i) || [])[1]
    );
    if (!isLikelyValidInstitution(institution)) continue;

    const descriptionHtml = (block.match(/<div class="section-inner">([\s\S]*?)<\/div>/i) || [])[1] || '';
    const descriptionText = cleanText(descriptionHtml);
    const location = parseCityState(descriptionText);
    if (!location.state) continue;

    const levels = [...descriptionHtml.matchAll(/<strong>([\s\S]*?)<\/strong>/gi)]
      .map((m) => cleanText(m[1]))
      .filter(Boolean);
    if (!levels.length) continue;

    for (const levelRaw of levels) {
      rows.push({
        institution_name: institution,
        campus_name: null,
        city: location.city,
        state: location.state,
        program_level: normalizeProgramLevel(levelRaw),
        credential_notes: cleanText(levelRaw),
        accreditor: 'CNEA',
        accreditation_status: 'Accredited',
        source_url: CNEA_URL,
        school_website_url: null
      });
    }
  }
  return rows;
};

const sanitizeProgram = (program, lastVerifiedDate) => {
  const institution = cleanText(program.institution_name || program.institution || program.school || '');
  const state = toStateAbbr(program.state);
  const level = normalizeProgramLevel(program.program_level || program.level || '');
  if (!isLikelyValidInstitution(institution) || !state || !level) return null;

  let city = cleanText(program.city || '');
  if (NOISY_TEXT_PATTERN.test(city)) {
    city = '';
  }
  const accreditor = cleanText(program.accreditor || '').toUpperCase();
  if (!accreditor) return null;

  const credentialNotes = cleanText(program.credential_notes || program.credentialNotes || '');
  let accreditationStatus = cleanText(program.accreditation_status || program.status || 'Accredited');
  if (!accreditationStatus || accreditationStatus.length > 80 || NOISY_TEXT_PATTERN.test(accreditationStatus)) {
    accreditationStatus = 'Accredited';
  }
  const normalized = {
    id: '',
    institution_name: institution,
    campus_name: cleanText(program.campus_name || program.campus || '') || null,
    city,
    state,
    program_level: level,
    credential_notes: credentialNotes,
    accreditor,
    accreditation_status: accreditationStatus,
    source_url: cleanText(program.source_url || ''),
    school_website_url: cleanText(program.school_website_url || '') || null,
    nces_unitid: cleanText(program.nces_unitid || '') || null,
    last_verified_date: cleanText(program.last_verified_date || '') || lastVerifiedDate
  };
  normalized.id = program.id || programId(normalized);
  return normalized;
};

const dedupePrograms = (programs) => {
  const map = new Map();
  for (const program of programs) {
    const key = [
      program.institution_name.toLowerCase(),
      program.state,
      program.program_level,
      program.accreditor,
      (program.city || '').toLowerCase()
    ].join('|');
    const existing = map.get(key);
    if (!existing) {
      map.set(key, program);
      continue;
    }
    if (!existing.city && program.city) {
      map.set(key, program);
    }
  }
  return Array.from(map.values());
};

const readFallbackPayload = () => {
  const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed) ? parsed : parsed.programs || [];
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const cleaned = dedupePrograms(list.map((p) => sanitizeProgram(p, verifiedDate)).filter(Boolean));
  return {
    programs: cleaned,
    count: cleaned.length,
    sources: parsed.sources || SOURCES,
    lastUpdated: parsed.lastUpdated || null,
    mode: 'fallback'
  };
};

const buildLivePayload = async () => {
  const [acen, ccne, cnea] = await Promise.all([parseAcenRows(), parseCcneRows(), parseCneaRows()]);
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const combined = dedupePrograms(
    [...acen, ...ccne, ...cnea].map((p) => sanitizeProgram(p, verifiedDate)).filter(Boolean)
  ).sort((a, b) => {
    const stateCmp = a.state.localeCompare(b.state);
    if (stateCmp !== 0) return stateCmp;
    const instCmp = a.institution_name.localeCompare(b.institution_name);
    if (instCmp !== 0) return instCmp;
    return a.program_level.localeCompare(b.program_level);
  });

  return {
    programs: combined,
    count: combined.length,
    sources: SOURCES,
    lastUpdated: new Date().toISOString(),
    mode: 'live',
    diagnostics: {
      acen: acen.length,
      ccne: ccne.length,
      cnea: cnea.length
    }
  };
};

export const getProgramsPayload = async ({ refresh = false } = {}) => {
  const now = Date.now();
  if (!refresh && memoryCache.payload && now - memoryCache.builtAtMs < CACHE_TTL_MS) {
    return memoryCache.payload;
  }

  if (!refresh) {
    try {
      const fallback = readFallbackPayload();
      memoryCache = { payload: fallback, builtAtMs: now };
      return fallback;
    } catch (error) {
      // If disk payload fails, try live rebuild below.
    }
  }

  try {
    const live = await buildLivePayload();
    memoryCache = { payload: live, builtAtMs: now };
    return live;
  } catch (error) {
    const fallback = readFallbackPayload();
    return {
      ...fallback,
      mode: refresh ? 'fallback-after-live-failure' : fallback.mode,
      liveError: String(error?.message || error)
    };
  }
};
