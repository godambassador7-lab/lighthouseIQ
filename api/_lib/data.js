import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

export function readJson(fileName, fallback) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, fileName), 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getNotices() {
  const payload = readJson('notices.json', { notices: [] });
  return Array.isArray(payload?.notices) ? payload.notices : [];
}

export function isHealthcareNotice(notice) {
  const naics = String(notice?.naics || '');
  if (naics.startsWith('62')) return true;

  const score = Number(notice?.nursing_score ?? notice?.nursingImpact?.score ?? 0);
  if (score >= 20) return true;

  const label = String(notice?.nursing_label ?? notice?.nursingImpact?.label ?? '').toLowerCase();
  if (label === 'likely' || label === 'possible') return true;

  const text = [
    notice?.employer_name,
    notice?.employerName,
    notice?.parent_system,
    notice?.parentSystem,
    notice?.reason,
    notice?.raw_text,
    notice?.rawText
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return [
    'hospital', 'medical center', 'health system', 'healthcare', 'health care',
    'clinic', 'nursing', 'skilled nursing', 'long term care', 'ltc', 'snf',
    'hospice', 'behavioral health', 'rehab', 'home health', 'assisted living'
  ].some((kw) => text.includes(kw));
}

function normalizeStateParam(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

const REGION_STATES = {
  Northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  Midwest: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
  South: ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'],
  West: ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA'],
  Territories: ['AS', 'GU', 'MP', 'PR', 'VI']
};

function normalizeRegionStates(value) {
  const region = String(value || '').trim();
  if (!region) return [];
  const canonical = Object.keys(REGION_STATES).find((key) => key.toLowerCase() === region.toLowerCase());
  return canonical ? REGION_STATES[canonical] : [];
}

function sortByRecencyDesc(a, b) {
  const aDate = String(a.notice_date || a.noticeDate || a.retrieved_at || a.source?.retrievedAt || '');
  const bDate = String(b.notice_date || b.noticeDate || b.retrieved_at || b.source?.retrievedAt || '');
  return bDate.localeCompare(aDate);
}

const DEFAULT_NOTICE_LIMIT = 1000;
const MAX_NOTICE_LIMIT = 5000;

export function filterNotices(all, query) {
  let out = all.slice();

  const org = String(query.org || '').trim().toLowerCase();
  if (org) {
    out = out.filter((n) => {
      const text = [
        n.employer_name,
        n.employerName,
        n.parent_system,
        n.parentSystem,
        n.facility_name,
        n.facilityName
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return text.includes(org);
    });
  }

  const regionStates = normalizeRegionStates(query.region);
  if (regionStates.length > 0) {
    out = out.filter((n) => regionStates.includes(String(n.state || '').toUpperCase()));
  }

  const states = normalizeStateParam(query.state);
  if (states.length > 0) {
    out = out.filter((n) => states.includes(String(n.state || '').toUpperCase()));
  }

  const since = String(query.since || '').trim();
  if (since) {
    out = out.filter((n) => {
      const d = String(n.notice_date || n.noticeDate || n.retrieved_at || n.source?.retrievedAt || '');
      return d >= since;
    });
  }

  const minScore = Number(query.minScore || 0);
  if (!Number.isNaN(minScore) && minScore > 0) {
    out = out.filter((n) => Number(n.nursing_score ?? n.nursingImpact?.score ?? 0) >= minScore);
  }

  const recruiterFocus = String(query.recruiterFocus || '') === '1' || String(query.recruiterFocus || '').toLowerCase() === 'true';
  if (recruiterFocus) {
    out = out.filter(isHealthcareNotice);
  }

  out.sort(sortByRecencyDesc);

  const limitRaw = String(query.limit ?? '').trim();
  const parsedLimit = limitRaw && limitRaw.toLowerCase() !== 'all'
    ? Number(limitRaw)
    : DEFAULT_NOTICE_LIMIT;
  const limit = Math.max(1, Math.min(MAX_NOTICE_LIMIT, Number(parsedLimit) || DEFAULT_NOTICE_LIMIT));
  out = out.slice(0, limit);

  return out;
}
