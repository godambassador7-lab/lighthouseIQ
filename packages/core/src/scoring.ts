import type { NormalizedWarnNotice } from './types.js';

const KEYWORDS: string[] = [
  'rn',
  'registered nurse',
  'lpn',
  'licensed practical nurse',
  'cna',
  'certified nursing assistant',
  'nurse',
  'nurses',
  'occupational health',
  'employee health',
  'industrial nurse',
  'occupational nurse',
  'workplace health',
  'onsite clinic',
  'on-site clinic',
  'plant nurse',
  'first aid',
  'occupational medicine',
  'clinical staff',
  'patient care',
  'bed closure',
  'unit closure',
  'bed reduction',
  'service line',
  'ward closure'
];

const ROLE_KEYWORDS: Record<'rn' | 'lpn' | 'cna', string[]> = {
  rn: ['rn', 'registered nurse'],
  lpn: ['lpn', 'licensed practical nurse'],
  cna: ['cna', 'certified nursing assistant']
};

const OCCUPATIONAL_KEYWORDS = [
  'occupational health',
  'employee health',
  'industrial nurse',
  'occupational nurse',
  'workplace health',
  'onsite clinic',
  'on-site clinic',
  'plant nurse',
  'first aid',
  'occupational medicine'
];

const SETTING_KEYWORDS: Record<'acute' | 'snf' | 'outpatient' | 'home' | 'behavioral' | 'occupational', string[]> = {
  acute: ['hospital', 'medical center', 'acute care', 'inpatient'],
  snf: ['skilled nursing', 'nursing home', 'long term care', 'ltc', 'assisted living', 'snf'],
  outpatient: ['clinic', 'ambulatory', 'outpatient', 'surgery center', 'urgent care'],
  home: ['home health', 'homecare', 'hospice'],
  behavioral: ['behavioral health', 'psychiatric', 'psych', 'mental health'],
  occupational: OCCUPATIONAL_KEYWORDS
};

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  ICU: ['icu', 'intensive care'],
  ED: ['ed', 'emergency department', 'emergency room'],
  OR: ['operating room', 'surgery', 'surgical'],
  MedSurg: ['med surg', 'medical-surgical', 'medical surgical'],
  OB: ['ob', 'obgyn', 'labor and delivery', 'maternity'],
  Oncology: ['oncology', 'cancer center'],
  Cardiac: ['cardiac', 'cardiology', 'cath lab']
};

function normalizeText(t?: string): string {
  return (t ?? '').toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordRegex(keyword: string): RegExp {
  const escaped = escapeRegExp(keyword.trim().toLowerCase());
  const spaced = escaped.replace(/\s+/g, '[-\\s]+');
  return new RegExp(`\\b${spaced}\\b`, 'i');
}

function hasKeyword(text: string, keyword: string): boolean {
  return keywordRegex(keyword).test(text);
}

function looksLikeHealthcare(notice: NormalizedWarnNotice): { ok: boolean; signals: string[] } {
  const signals: string[] = [];
  const naics = (notice.naics ?? '').trim();

  // NAICS 62 = Health Care and Social Assistance
  if (naics.startsWith('62')) {
    signals.push(`naics:${naics}`);
  }

  const text = normalizeText(`${notice.employerName} ${notice.reason ?? ''} ${notice.rawText ?? ''}`);
  const employerHints = ['hospital', 'medical center', 'health system', 'clinic', 'nursing', 'rehab', 'behavioral health', 'hospice'];
  if (employerHints.some(h => hasKeyword(text, h))) {
    signals.push('employer_text_healthcare');
  }

  return { ok: signals.length > 0, signals };
}

function keywordHits(text: string): string[] {
  const found: string[] = [];
  for (const k of KEYWORDS) {
    if (hasKeyword(text, k)) found.push(k);
  }
  return [...new Set(found)];
}

function inferCareSetting(
  text: string,
  naics?: string
): { setting: 'acute' | 'snf' | 'outpatient' | 'home' | 'behavioral' | 'occupational' | 'unknown'; signals: string[] } {
  const signals: string[] = [];
  const normalized = text.toLowerCase();

  if (naics?.startsWith('622')) {
    signals.push('naics:hospital');
    return { setting: 'acute', signals };
  }
  if (naics?.startsWith('623')) {
    signals.push('naics:nursing-care');
    return { setting: 'snf', signals };
  }
  if (naics?.startsWith('621')) {
    signals.push('naics:outpatient');
    return { setting: 'outpatient', signals };
  }

  for (const [setting, keywords] of Object.entries(SETTING_KEYWORDS)) {
    if (keywords.some(k => hasKeyword(normalized, k))) {
      signals.push(`setting:${setting}`);
      return { setting: setting as 'acute' | 'snf' | 'outpatient' | 'home' | 'behavioral' | 'occupational', signals };
    }
  }

  return { setting: 'unknown', signals };
}

function inferRoleMix(
  text: string,
  setting: 'acute' | 'snf' | 'outpatient' | 'home' | 'behavioral' | 'occupational' | 'unknown',
  relevant: boolean
) {
  if (!relevant) return null;
  if (setting === 'occupational') {
    return { rn: 100, lpn: 0, cna: 0 };
  }

  let rn = 30;
  let lpn = 30;
  let cna = 30;

  for (const k of ROLE_KEYWORDS.rn) {
    if (hasKeyword(text, k)) rn += 40;
  }
  for (const k of ROLE_KEYWORDS.lpn) {
    if (hasKeyword(text, k)) lpn += 30;
  }
  for (const k of ROLE_KEYWORDS.cna) {
    if (hasKeyword(text, k)) cna += 30;
  }

  if (setting === 'acute') rn += 20;
  if (setting === 'snf') {
    cna += 20;
    lpn += 10;
  }
  if (setting === 'outpatient') rn += 10;
  if (setting === 'home') rn += 10;
  if (setting === 'behavioral') rn += 10;

  const total = rn + lpn + cna;
  if (total <= 0) return { rn: 34, lpn: 33, cna: 33 };

  return {
    rn: Math.round((rn / total) * 100),
    lpn: Math.round((lpn / total) * 100),
    cna: Math.round((cna / total) * 100)
  };
}

function inferSpecialties(text: string): string[] {
  const normalized = text.toLowerCase();
  const matches: string[] = [];
  for (const [label, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (keywords.some(k => hasKeyword(normalized, k))) {
      matches.push(label);
    }
  }
  return matches;
}

export function scoreNursingImpact(notice: NormalizedWarnNotice): NormalizedWarnNotice {
  let score = 0;
  const signals: string[] = [];

  const { ok: healthcareOk, signals: healthcareSignals } = looksLikeHealthcare(notice);
  if (healthcareOk) {
    score += 30;
    signals.push(...healthcareSignals);
  }

  const text = normalizeText(`${notice.employerName} ${notice.reason ?? ''} ${notice.rawText ?? ''}`);
  const found = keywordHits(text);
  const occupationalHits = OCCUPATIONAL_KEYWORDS.filter(k => hasKeyword(text, k));
  if (found.length > 0) {
    score += Math.min(40, found.length * 10);
    signals.push('nursing_keywords');
  }

  const { setting, signals: settingSignals } = inferCareSetting(text, notice.naics);
  signals.push(...settingSignals);

  const relevant = healthcareOk || found.length > 0 || occupationalHits.length > 0;
  const roleMix = inferRoleMix(text, setting, relevant);
  const specialties = relevant ? inferSpecialties(text) : [];
  if (occupationalHits.length) {
    signals.push('occupational_health');
  }
  if (specialties.length) {
    signals.push('specialties_detected');
  }

  // Higher affected count can matter for recruiters, but don't over-weight it.
  if (typeof notice.employeesAffected === 'number') {
    if (notice.employeesAffected >= 200) {
      score += 10;
      signals.push('large_event_200plus');
    } else if (notice.employeesAffected >= 50) {
      score += 5;
      signals.push('medium_event_50plus');
    }
  }

  score = Math.max(0, Math.min(100, score));

  const label: 'Likely' | 'Possible' | 'Unclear' =
    score >= 80 ? 'Likely' : score >= 50 ? 'Possible' : 'Unclear';

  return {
    ...notice,
    nursingImpact: {
      score,
      label,
      signals: [...new Set(signals)],
      keywordsFound: found,
      roleMix,
      careSetting: setting,
      specialties,
      explanations: [...new Set(signals)]
    }
  };
}
