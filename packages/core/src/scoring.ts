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
  'clinical staff',
  'patient care',
  'bed closure',
  'unit closure'
];

function normalizeText(t?: string): string {
  return (t ?? '').toLowerCase();
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
  if (employerHints.some(h => text.includes(h))) {
    signals.push('employer_text_healthcare');
  }

  return { ok: signals.length > 0, signals };
}

function keywordHits(text: string): string[] {
  const found: string[] = [];
  for (const k of KEYWORDS) {
    if (text.includes(k)) found.push(k);
  }
  return [...new Set(found)];
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
  if (found.length > 0) {
    score += Math.min(40, found.length * 10);
    signals.push('nursing_keywords');
  }

  // Higher affected count can matter for recruiters, but don’t over-weight it.
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
      keywordsFound: found
    }
  };
}
