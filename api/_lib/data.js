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

function sortByRecencyDesc(a, b) {
  const aDate = String(a.notice_date || a.noticeDate || a.retrieved_at || a.source?.retrievedAt || '');
  const bDate = String(b.notice_date || b.noticeDate || b.retrieved_at || b.source?.retrievedAt || '');
  return bDate.localeCompare(aDate);
}

export function filterNotices(all, query) {
  let out = all.slice();

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
  if (limitRaw) {
    const limit = Math.max(0, Math.min(5000, Number(limitRaw) || 0));
    if (limit > 0) out = out.slice(0, limit);
  }

  return out;
}
