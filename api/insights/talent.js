import { getNotices, isHealthcareNotice, readJson } from '../_lib/data.js';

const SPECIALTY_RULES = [
  { specialty: 'OR', patterns: [/\bOR\b/, /operating room/i, /peri[-\s]?operative/i] },
  { specialty: 'ED', patterns: [/\bED\b/, /\bER\b/, /emergency department/i, /emergency room/i] },
  { specialty: 'ICU', patterns: [/\bICU\b/, /critical care/i, /intensive care/i] },
  { specialty: 'MED SURG', patterns: [/med[\s-]?surg/i, /medical surgical/i] },
  { specialty: 'L&D', patterns: [/\bL&D\b/, /labor and delivery/i, /inpatient obstetric/i] },
  { specialty: 'TELE', patterns: [/\bTELE\b/, /telemetry/i] },
  { specialty: 'PCU', patterns: [/\bPCU\b/, /progressive care/i, /step[\s-]?down/i] }
];

const RN_CONTEXT_PATTERN = /\b(RN|REGISTERED NURSE|NURSE|NURSING|LPN|LVN|CNA|CRNA)\b/i;
const RN_BASELINE_SPECIALTY_SET = new Set(['ED', 'OR', 'ICU', 'MED SURG', 'L&D', 'TELE', 'PCU']);

const normalizeState = (value) => String(value || '').trim().toUpperCase();
const normalizeCity = (value) => String(value || '').trim().toUpperCase();
const locationKey = (state, city) => `${normalizeState(state)}::${normalizeCity(city || 'STATEWIDE')}`;
const normalizeSpecialtyText = (value) => String(value || '').toUpperCase().replace(/[^A-Z&\s-]/g, ' ').replace(/\s+/g, ' ').trim();

const mapSpecialtyToCanonical = (value) => {
  const normalized = normalizeSpecialtyText(value);
  if (!normalized) return '';
  if (/\b(ER|ED)\b/.test(normalized) || normalized.includes('EMERGENCY DEPARTMENT') || normalized.includes('EMERGENCY ROOM')) return 'ED';
  if (/\bOR\b/.test(normalized) || normalized.includes('OPERATING ROOM') || normalized.includes('PERIOPERATIVE')) return 'OR';
  if (/\bICU\b/.test(normalized) || normalized.includes('CRITICAL CARE') || normalized.includes('INTENSIVE CARE')) return 'ICU';
  if (/MED[\s-]?SURG/.test(normalized) || normalized.includes('MEDICAL SURGICAL')) return 'MED SURG';
  if (/\bL&D\b/.test(normalized) || normalized.includes('LABOR AND DELIVERY') || normalized.includes('INPATIENT OBSTETRIC')) return 'L&D';
  if (/\bTELE\b/.test(normalized) || normalized.includes('TELEMETRY')) return 'TELE';
  if (/\bPCU\b/.test(normalized) || normalized.includes('PROGRESSIVE CARE') || normalized.includes('STEP DOWN')) return 'PCU';
  if (/\bPEDS\b/.test(normalized) || normalized.includes('PEDIATRIC')) return 'PEDS';
  if (normalized.includes('BEHAVIORAL HEALTH') || normalized.includes('PSYCHIATR')) return 'BEHAVIORAL';
  return '';
};

const addCount = (map, key, specialty) => {
  if (!key || !specialty) return;
  if (!map.has(key)) map.set(key, new Map());
  const bucket = map.get(key);
  bucket.set(specialty, (bucket.get(specialty) || 0) + 1);
};

const rankSpecialties = (counts, limit = 3) => {
  if (!counts) return [];
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([specialty]) => specialty);
};

const BASELINE_SPECIALTY_KEY_MAP = {
  MED_SURG: 'MED SURG',
  L_AND_D: 'L&D',
  ER: 'ED'
};

const stableHash = (value) => {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const rotateList = (values, offset) => {
  const list = Array.isArray(values) ? values : [];
  if (!list.length) return [];
  const start = Math.abs(Number(offset) || 0) % list.length;
  if (start === 0) return [...list];
  return [...list.slice(start), ...list.slice(0, start)];
};

const getBaselineSpecialties = () => {
  const signals = readJson('free-market-signals.json', null);
  const baseline = signals?.hrsaSpecialtyBaseline;
  if (!baseline || typeof baseline !== 'object') return [];
  return Object.entries(baseline)
    .map(([key, value]) => ({
      specialty: BASELINE_SPECIALTY_KEY_MAP[key] || key,
      value: Number(value)
    }))
    .filter((entry) => Number.isFinite(entry.value) && entry.value > 0)
    .filter((entry) => RN_BASELINE_SPECIALTY_SET.has(entry.specialty))
    .sort((a, b) => b.value - a.value)
    .map((entry) => entry.specialty);
};

const extractSpecialtiesFromNotice = (notice) => {
  const explicitRaw = [
    ...(Array.isArray(notice?.nursing_specialties) ? notice.nursing_specialties : []),
    ...(Array.isArray(notice?.nursingSpecialties) ? notice.nursingSpecialties : []),
    ...(Array.isArray(notice?.nursingImpact?.specialties) ? notice.nursingImpact.specialties : []),
    ...(Array.isArray(notice?.specialties) ? notice.specialties : [])
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  const explicit = explicitRaw
    .map(mapSpecialtyToCanonical)
    .filter(Boolean);
  const detected = new Set(explicit);
  const text = [
    notice?.reason,
    notice?.raw_text,
    notice?.rawText,
    notice?.employer_name,
    notice?.employerName
  ]
    .filter(Boolean)
    .join(' ');
  const score = Number(notice?.nursing_score ?? notice?.nursingImpact?.score ?? 0);
  const hasRnContext = explicit.length > 0 || RN_CONTEXT_PATTERN.test(text) || score >= 60;

  if (!hasRnContext) return Array.from(detected);

  for (const rule of SPECIALTY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      detected.add(rule.specialty);
    }
  }

  return Array.from(detected);
};

const buildSpecialtyIndices = (notices) => {
  const byCity = new Map();
  const byState = new Map();

  for (const notice of notices) {
    const state = normalizeState(notice?.state);
    if (!state) continue;
    const city = normalizeCity(notice?.city);
    const specialties = extractSpecialtiesFromNotice(notice);
    if (!specialties.length) continue;

    const cityKey = locationKey(state, city || 'STATEWIDE');
    const stateKey = locationKey(state, 'STATEWIDE');

    for (const specialty of specialties) {
      addCount(byCity, cityKey, specialty);
      addCount(byState, stateKey, specialty);
    }
  }

  return { byCity, byState };
};

const enrichSnapshotOpportunities = (opportunities, notices, baselineSpecialties) => {
  const { byCity, byState } = buildSpecialtyIndices(notices);

  return opportunities.map((row) => {
    const state = normalizeState(row?.state);
    const city = normalizeCity(row?.city);
    const existing = Array.isArray(row?.specialties)
      ? row.specialties.map((value) => String(value || '').trim()).filter(Boolean)
      : [];

    const cityKey = locationKey(state, city || 'STATEWIDE');
    const stateKey = locationKey(state, 'STATEWIDE');
    const inferred = rankSpecialties(byCity.get(cityKey), 3);
    const fallback = rankSpecialties(byState.get(stateKey), 3);
    const seed = `${state}|${city}|${Number(row?.estimated_nurses_available || 0)}|${Number(row?.notices_count || 0)}`;
    const baselineOffset = baselineSpecialties.length ? stableHash(seed) % baselineSpecialties.length : 0;
    const baselineFallback = rotateList(baselineSpecialties, baselineOffset);
    const merged = [...existing];

    const addUnique = (values) => {
      for (const value of values) {
        if (!merged.includes(value)) merged.push(value);
        if (merged.length >= 3) break;
      }
    };

    if (merged.length === 0) {
      addUnique(inferred);
      addUnique(baselineFallback);
      addUnique(fallback);
    } else if (merged.length < 3) {
      addUnique(inferred);
      addUnique(baselineFallback);
      addUnique(fallback);
    }

    return {
      ...row,
      specialties: merged
    };
  });
};

export default function handler(_req, res) {
  const notices = getNotices().filter(isHealthcareNotice);
  const baselineSpecialties = getBaselineSpecialties();
  const snapshot = readJson('talent.json', null);
  if (snapshot && Array.isArray(snapshot.opportunities)) {
    const enriched = enrichSnapshotOpportunities(snapshot.opportunities, notices, baselineSpecialties);
    return res.status(200).json({
      opportunities: enriched,
      count: Number(snapshot.count || enriched.length || 0),
      lastUpdated: snapshot.lastUpdated || null
    });
  }

  const byLocation = new Map();
  for (const n of notices) {
    const state = String(n.state || '').toUpperCase();
    if (!state) continue;
    const city = n.city || null;
    const key = `${state}:${city || 'unknown'}`;
    const row = byLocation.get(key) || {
      state,
      city,
      estimated_nurses_available: 0,
      specialties: new Set(),
      notices_count: 0
    };
    const affected = Number(n.employees_affected ?? n.employeesAffected ?? 0);
    const score = Number(n.nursing_score ?? n.nursingImpact?.score ?? 0);
    row.estimated_nurses_available += Math.max(0, Math.round(affected * Math.max(0.1, score / 100) * 0.7));
    const noticeSpecialties = extractSpecialtiesFromNotice(n);
    noticeSpecialties.forEach((specialty) => row.specialties.add(specialty));
    row.notices_count += 1;
    byLocation.set(key, row);
  }

  const opportunities = Array.from(byLocation.values())
    .map((row) => ({ ...row, specialties: Array.from(row.specialties) }))
    .sort((a, b) => b.estimated_nurses_available - a.estimated_nurses_available);

  res.status(200).json({ opportunities, count: opportunities.length });
}

