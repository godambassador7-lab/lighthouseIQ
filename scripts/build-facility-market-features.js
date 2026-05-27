#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const SCRIPT_DATA_DIR = path.join(process.cwd(), 'scripts', 'data');

const readJson = (fullPath) => {
  try { return JSON.parse(fs.readFileSync(fullPath, 'utf8')); } catch { return null; }
};
const writeJson = (fullPath, obj) => fs.writeFileSync(fullPath, JSON.stringify(obj, null, 2));
const readDataJson = (name) => readJson(path.join(DATA_DIR, name));
const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeName = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\b(hospital|medical|center|health|system|inc|llc|corp|the|of)\b/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeLoose = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s/@()&.-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const toTokens = (value) => new Set(normalizeText(value).split(' ').filter((t) => t.length > 1));

const jaccard = (aSet, bSet) => {
  if (!aSet.size || !bSet.size) return 0;
  let inter = 0;
  aSet.forEach((v) => { if (bSet.has(v)) inter += 1; });
  const union = aSet.size + bSet.size - inter;
  return union > 0 ? inter / union : 0;
};

const stableHash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
};

const HEALTHCARE_HINTS = [
  'hospital', 'medical', 'health', 'clinic', 'nursing', 'rehab', 'care', 'pharmacy', 'surgery', 'physician', 'vibra',
  'ascension', 'kaiser', 'mayo', 'cleveland clinic', 'providence', 'adventhealth', 'trinity', 'commonspirit', 'banner', 'sutter'
];
const NON_HEALTHCARE_HINTS = ['airlines', 'tesla', 'amazon', 'warehouse', 'distribution', 'manufacturing', 'retail', 'automotive', 'logistics'];
const VENDOR_HINTS = [
  'aramark', 'crothall', 'morrison', 'compass group', 'sodexo', 'siemens', 'baxter',
  'davita', 'fresenius', 'hologic', 'medtronic', 'thermo fisher', 'stericycle', 'service corp', 'food service'
];
const PROVIDER_HINTS = [
  'hospital', 'medical center', 'health system', 'clinic', 'behavioral health', 'rehab',
  'urgent care', 'children s', 'st ', 'saint ', 'memorial', 'community hospital'
];

const isLikelyHealthcareNotice = (notice) => {
  const text = `${notice?.employer_name || ''} ${notice?.facility_name || ''} ${notice?.parent_system || ''}`.toLowerCase();
  if (!text.trim()) return false;
  if (NON_HEALTHCARE_HINTS.some((h) => text.includes(h))) return false;
  if (HEALTHCARE_HINTS.some((h) => text.includes(h))) return true;
  const naics = String(notice?.naics || '').trim();
  if (naics.startsWith('62')) return true;
  const signals = Array.isArray(notice?.nursing_signals) ? notice.nursing_signals.map((s) => String(s).toLowerCase()) : [];
  if (signals.some((s) => s.includes('healthcare') || s.includes('setting:acute') || s.includes('setting:snf'))) return true;
  return false;
};

const aliasConfig = readJson(path.join(SCRIPT_DATA_DIR, 'facility-aliases.json')) || { aliases: {} };
const overrideConfig = readJson(path.join(SCRIPT_DATA_DIR, 'facility-match-overrides.json')) || { overrides: [] };
const aliasMap = (() => {
  const out = new Map();
  const aliases = aliasConfig?.aliases && typeof aliasConfig.aliases === 'object' ? aliasConfig.aliases : {};
  Object.entries(aliases).forEach(([canonical, vals]) => {
    const canon = normalizeName(canonical);
    const all = [canonical, ...(Array.isArray(vals) ? vals : [])].map(normalizeName).filter(Boolean);
    all.forEach((a) => out.set(a, canon));
  });
  return out;
})();
const aliasEntries = Array.from(aliasMap.entries()).sort((a, b) => b[0].length - a[0].length);

const manualOverrides = (() => {
  const out = new Map();
  const rows = Array.isArray(overrideConfig?.overrides) ? overrideConfig.overrides : [];
  rows.forEach((row) => {
    const state = String(row?.state || '').trim().toUpperCase();
    const facility = normalizeName(row?.noticeFacility || '');
    const target = normalizeName(row?.matchedHospitalName || '');
    if (state && facility && target) out.set(`${state}::${facility}`, { target, reason: row?.reason || 'manual', confidence: row?.confidence || 'exact' });
  });
  return out;
})();

const canonicalizeByAlias = (value) => {
  const normalized = normalizeName(value);
  if (!normalized) return normalized;
  const spaced = ` ${normalizeText(value)} `;
  for (const [alias, canonical] of aliasEntries) {
    const aliasText = normalizeText(alias);
    if (!aliasText) continue;
    if (spaced.includes(` ${aliasText} `)) return canonical;
  }
  return normalized;
};

const isLikelyVendorHealthcareEntity = (text) => {
  const t = normalizeText(text || '');
  if (!t) return false;
  return VENDOR_HINTS.some((h) => t.includes(h));
};

const isLikelyProviderEntity = (text) => {
  const t = normalizeText(text || '');
  if (!t) return false;
  if (PROVIDER_HINTS.some((h) => t.includes(h))) return true;
  return !isLikelyVendorHealthcareEntity(t) && HEALTHCARE_HINTS.some((h) => t.includes(h));
};

const extractNoticeMatchCandidates = (notice) => {
  const parts = [
    notice?.facility_name,
    notice?.employer_name,
    notice?.parent_system
  ].filter(Boolean).map((v) => String(v).trim()).filter(Boolean);

  const candidates = [];
  const push = (value) => {
    const clean = String(value || '').trim();
    if (clean.length < 3) return;
    candidates.push(clean);
  };

  parts.forEach((raw) => {
    push(raw);
    const loose = normalizeLoose(raw);

    const atMatch = loose.match(/\b(?:operation at|services at|support services at|at|@)\s+([a-z0-9][a-z0-9\s()&.\-]{4,})$/i);
    if (atMatch?.[1]) push(atMatch[1]);

    const dbaMatch = loose.match(/\bd\/?b\/?a[:\s]+([a-z0-9][a-z0-9\s()&.\-]{3,})$/i);
    if (dbaMatch?.[1]) push(dbaMatch[1]);

    const parenMatches = raw.match(/\(([^)]+)\)/g) || [];
    parenMatches.forEach((m) => {
      const inner = m.replace(/[()]/g, '').trim();
      if (inner.length >= 4) push(inner);
    });

    raw.split(/[-/|,;]/).forEach((fragment) => push(fragment));
  });

  return Array.from(new Set(candidates.map((c) => c.trim()).filter(Boolean)));
};

const notices = readDataJson('notices.json');
const rankings = readDataJson('hospital-rankings.json');
const providerMaster = readDataJson('provider-master.json');
const allNoticeRows = Array.isArray(notices?.notices) ? notices.notices : [];
const states = rankings?.states && typeof rankings.states === 'object' ? rankings.states : {};
const LIVE_WINDOW_DAYS = Number(process.env.LIVE_WINDOW_DAYS || 730);
const MAX_FUTURE_DAYS = Number(process.env.MAX_FUTURE_NOTICE_DAYS || 45);
const nowTs = Date.now();
const liveCutTs = nowTs - (LIVE_WINDOW_DAYS * DAY_MS);
const maxFutureTs = nowTs + (MAX_FUTURE_DAYS * DAY_MS);

const noticeDateToTs = (notice) => {
  const raw = notice?.effective_date || notice?.notice_date || null;
  if (!raw) return null;
  const ts = Date.parse(raw);
  return Number.isFinite(ts) ? ts : null;
};

const isNoticeInLiveWindow = (notice) => {
  const ts = noticeDateToTs(notice);
  if (ts === null) return false;
  return ts >= liveCutTs && ts <= maxFutureTs;
};

const noticeRows = allNoticeRows.filter(isNoticeInLiveWindow);

const rankingIndex = new Map();
const rankingByState = new Map();
const providerRows = Array.isArray(providerMaster?.providers) && providerMaster.providers.length
  ? providerMaster.providers.map((p) => ({
      name: p?.name,
      system: p?.system,
      metro: p?.metro,
      state: p?.state,
      beds: p?.beds,
      compositeScore: p?.score,
      npi: p?.npi || null,
      warnWeight: 1
    }))
  : Object.entries(states).flatMap(([state, payload]) => (Array.isArray(payload?.hospitalRankings) ? payload.hospitalRankings.map((h) => ({ ...h, state })) : []));

providerRows.forEach((row) => {
  const state = String(row?.state || '').trim().toUpperCase();
  if (!state) return;
  const normalized = canonicalizeByAlias(row?.name || row?.match || '');
  const metroNorm = normalizeText(row?.metro || '');
  const enriched = { ...row, _normalized: normalized, _tokens: toTokens(normalized), _metroNorm: metroNorm, _metroTokens: toTokens(metroNorm) };
  if (!rankingByState.has(state)) rankingByState.set(state, []);
  rankingByState.get(state).push(enriched);
  rankingIndex.set(`${state}::${enriched._normalized}`, enriched);
});

const scoreTier = (score) => {
  if (score >= 0.8) return 'high';
  if (score >= 0.67) return 'medium';
  if (score >= 0.55) return 'low';
  return null;
};
const tierWeight = (tier) => (tier === 'high' ? 1 : tier === 'medium' ? 0.6 : tier === 'low' ? 0.25 : 0);

const findBestHospitalMatch = (state, facilityNames, noticeCity) => {
  const candidatesIn = Array.isArray(facilityNames) ? facilityNames : [facilityNames];
  const candidates = candidatesIn.filter(Boolean).map((v) => String(v)).filter(Boolean);
  if (!candidates.length) return null;

  let bestAcross = null;
  const cityNorm = normalizeText(noticeCity || '');
  const cityTokens = toTokens(cityNorm);

  candidates.forEach((facilityName) => {
    const normalized = canonicalizeByAlias(facilityName);
    const overrideKey = `${state}::${normalizeName(facilityName)}`;
  const override = manualOverrides.get(overrideKey);
    if (override) {
      const row = rankingIndex.get(`${state}::${override.target}`);
      if (row) {
        const hit = { row, score: 1, method: 'manual_override', tier: 'high', sourceCandidate: facilityName };
        if (!bestAcross || hit.score > bestAcross.score) bestAcross = hit;
        return;
      }
    }

    const exactKey = `${state}::${normalized}`;
    if (rankingIndex.has(exactKey)) {
      const hit = { row: rankingIndex.get(exactKey), score: 1, method: 'exact', tier: 'high', sourceCandidate: facilityName };
      if (!bestAcross || hit.score > bestAcross.score) bestAcross = hit;
      return;
    }

    const providerCandidates = rankingByState.get(state) || [];
    if (!providerCandidates.length || !normalized) return;

    const sourceTokens = toTokens(normalized);
    let best = null;

    providerCandidates.forEach((row) => {
      const jac = jaccard(sourceTokens, row._tokens);
      const prefix = row._normalized.startsWith(normalized) || normalized.startsWith(row._normalized) ? 0.16 : 0;
      const contains = row._normalized.includes(normalized) || normalized.includes(row._normalized) ? 0.1 : 0;
      const cityBoost = cityNorm && row._metroNorm ? (row._metroNorm === cityNorm ? 0.25 : jaccard(cityTokens, row._metroTokens) * 0.1) : 0;

      if (jac < 0.28 && prefix === 0 && contains === 0) return;
      if (cityNorm && row._metroNorm && cityBoost < 0.03 && jac < 0.75) return;

      const score = jac + prefix + contains + cityBoost;
      if (!best || score > best.score) best = { row, score, method: 'fuzzy' };
    });

    if (!best) return;
    const tier = scoreTier(best.score);
    if (!tier) return;
    const hit = { ...best, tier, sourceCandidate: facilityName };
    if (!bestAcross || hit.score > bestAcross.score) bestAcross = hit;
  });

  return bestAcross;
};

const byState = new Map();
const byFacility = new Map();

const ensureState = (state) => {
  if (!byState.has(state)) {
    byState.set(state, {
      state,
      notices: 0,
      affected: 0,
      matchedFacilities: 0,
      unmatchedFacilities: 0,
      weightedMatchedFacilities: 0,
      avgCompositeScore: 0,
      distressWeight: 1,
      highTierMatches: 0,
      mediumTierMatches: 0,
      lowTierMatches: 0
    });
  }
  return byState.get(state);
};

let healthcareNoticeCount = 0;
let healthcareMatchedCount = 0;
let healthcareHighConfidenceCount = 0;
let healthcareProviderLikeCount = 0;
let healthcareProviderLikeMatchedCount = 0;
let healthcareProviderLikeHighConfidenceCount = 0;

noticeRows.forEach((n) => {
  const state = String(n?.state || '').trim().toUpperCase();
  if (!state) return;

  const facilityRaw = n?.facility_name || n?.employer_name || '';
  const cityRaw = n?.city || '';
  const matchCandidates = extractNoticeMatchCandidates(n);
  const primaryCandidate = matchCandidates[0] || facilityRaw;
  const facilityCanonical = canonicalizeByAlias(primaryCandidate);
  const facilityKey = `${state}::${facilityCanonical}`;
  const affected = Number(n?.employees_affected || n?.affected_workers || n?.affected || 0);

  const s = ensureState(state);
  s.notices += 1;
  s.affected += Number.isFinite(affected) ? affected : 0;

  const isHealthcare = isLikelyHealthcareNotice(n);
  const providerLike = isLikelyProviderEntity(primaryCandidate) || matchCandidates.some((c) => isLikelyProviderEntity(c));
  const vendorLike = isLikelyVendorHealthcareEntity(facilityRaw) || isLikelyVendorHealthcareEntity(n?.employer_name || '');
  const providerTargetPresent = matchCandidates.some((c) => isLikelyProviderEntity(c) && !isLikelyVendorHealthcareEntity(c));
  const providerLikeNotice = isHealthcare && providerLike && (!vendorLike || providerTargetPresent);
  if (isHealthcare) healthcareNoticeCount += 1;
  if (providerLikeNotice) healthcareProviderLikeCount += 1;

  const matchedCandidate = findBestHospitalMatch(state, matchCandidates, cityRaw);
  const matched = matchedCandidate?.row || null;
  if (matched) {
    s.matchedFacilities += 1;
    s.weightedMatchedFacilities += tierWeight(matchedCandidate?.tier);
    if (matchedCandidate?.tier === 'high') s.highTierMatches += 1;
    else if (matchedCandidate?.tier === 'medium') s.mediumTierMatches += 1;
    else if (matchedCandidate?.tier === 'low') s.lowTierMatches += 1;

    if (isHealthcare) {
      healthcareMatchedCount += 1;
      if (matchedCandidate?.tier === 'high' || matchedCandidate?.method === 'exact' || matchedCandidate?.method === 'manual_override') {
        healthcareHighConfidenceCount += 1;
      }
    }
    if (providerLikeNotice) {
      healthcareProviderLikeMatchedCount += 1;
      if (matchedCandidate?.tier === 'high' || matchedCandidate?.method === 'exact' || matchedCandidate?.method === 'manual_override') {
        healthcareProviderLikeHighConfidenceCount += 1;
      }
    }
  } else {
    s.unmatchedFacilities += 1;
  }

  if (!byFacility.has(facilityKey)) {
    byFacility.set(facilityKey, {
      state,
      city: cityRaw || null,
      facility: facilityRaw,
      primaryMatchCandidate: primaryCandidate,
      allMatchCandidates: matchCandidates.slice(0, 8),
      normalized: normalizeName(facilityRaw),
      canonical: facilityCanonical,
      healthcareLikely: isHealthcare,
      providerLikeHealthcare: Boolean(providerLikeNotice),
      vendorLikeHealthcare: Boolean(isHealthcare && vendorLike),
      notices: 0,
      affected: 0,
      matched: Boolean(matched),
      matchMethod: matchedCandidate?.method || null,
      matchScore: matchedCandidate ? Number(matchedCandidate.score.toFixed(3)) : null,
      matchTier: matchedCandidate?.tier || null,
      hospitalCompositeScore: matched ? Number(matched?.compositeScore || 0) : null,
      hospitalWarnWeight: matched ? Number(matched?.warnWeight || 1) : null,
      hospitalNameMatched: matched ? (matched?.name || null) : null,
      hospitalMetroMatched: matched ? (matched?.metro || null) : null,
      npi: matched ? (matched?.npi || null) : null
    });
  }

  const f = byFacility.get(facilityKey);
  f.notices += 1;
  f.affected += Number.isFinite(affected) ? affected : 0;
  if (!f.matched && matched) {
    f.matched = true;
    f.matchMethod = matchedCandidate?.method || f.matchMethod;
    f.matchScore = matchedCandidate ? Number(matchedCandidate.score.toFixed(3)) : f.matchScore;
    f.matchTier = matchedCandidate?.tier || f.matchTier;
    f.hospitalCompositeScore = Number(matched?.compositeScore || 0);
    f.hospitalWarnWeight = Number(matched?.warnWeight || 1);
    f.hospitalNameMatched = matched?.name || null;
    f.hospitalMetroMatched = matched?.metro || null;
    f.npi = matched?.npi || null;
  }
});

for (const stateRow of byState.values()) {
  const facilities = Array.from(byFacility.values()).filter((f) => f.state === stateRow.state && f.matched && Number.isFinite(f.hospitalCompositeScore));
  const avgScore = facilities.length
    ? facilities.reduce((sum, f) => sum + Number(f.hospitalCompositeScore || 0), 0) / facilities.length
    : 0;
  stateRow.avgCompositeScore = Number(avgScore.toFixed(2));

  const matchRate = stateRow.notices > 0 ? (stateRow.matchedFacilities / stateRow.notices) : 0;
  const weightedMatchRate = stateRow.notices > 0 ? (stateRow.weightedMatchedFacilities / stateRow.notices) : 0;
  const affectedPerNotice = stateRow.notices > 0 ? stateRow.affected / stateRow.notices : 0;

  const scoreComponent = Math.min(1.1, Math.max(0.9, 1 + ((avgScore - 85) / 500)));
  const volumeComponent = Math.min(1.12, Math.max(0.9, 1 + ((affectedPerNotice - 120) / 2000)));
  const matchComponent = Math.min(1.14, Math.max(0.88, 1 + ((weightedMatchRate - 0.2) / 2.8)));

  stateRow.distressWeight = Number((scoreComponent * volumeComponent * matchComponent).toFixed(4));
  stateRow.matchRate = Number((matchRate * 100).toFixed(2));
  stateRow.weightedMatchRate = Number((weightedMatchRate * 100).toFixed(2));
}

const facilityRows = Array.from(byFacility.values());
const matchedRows = facilityRows.filter((f) => f.matched);
const matchedCount = matchedRows.length;
const exactMatches = matchedRows.filter((f) => f.matchMethod === 'exact').length;
const fuzzyMatches = matchedRows.filter((f) => f.matchMethod === 'fuzzy').length;
const overrideMatches = matchedRows.filter((f) => f.matchMethod === 'manual_override').length;
const highTier = matchedRows.filter((f) => f.matchTier === 'high').length;
const mediumTier = matchedRows.filter((f) => f.matchTier === 'medium').length;
const lowTier = matchedRows.filter((f) => f.matchTier === 'low').length;

const healthcareCoverage = healthcareNoticeCount > 0 ? (healthcareMatchedCount / healthcareNoticeCount) : 0;
const highConfidenceCoverage = healthcareNoticeCount > 0 ? (healthcareHighConfidenceCount / healthcareNoticeCount) : 0;
const providerLikeCoverage = healthcareProviderLikeCount > 0 ? (healthcareProviderLikeMatchedCount / healthcareProviderLikeCount) : 0;
const providerLikeHighConfidenceCoverage = healthcareProviderLikeCount > 0 ? (healthcareProviderLikeHighConfidenceCount / healthcareProviderLikeCount) : 0;

const out = {
  lastUpdated: new Date().toISOString(),
  summary: {
    totalNotices: noticeRows.length,
    totalNoticesInput: allNoticeRows.length,
    liveWindowDays: LIVE_WINDOW_DAYS,
    totalFacilities: byFacility.size,
    matchedFacilities: matchedCount,
    exactMatches,
    fuzzyMatches,
    overrideMatches,
    highTier,
    mediumTier,
    lowTier,
    matchRatePct: byFacility.size ? Number(((matchedCount / byFacility.size) * 100).toFixed(2)) : 0,
    healthcareNoticeCount,
    healthcareMatchedCount,
    healthcareCoveragePct: Number((healthcareCoverage * 100).toFixed(2)),
    highConfidenceHealthcareCoveragePct: Number((highConfidenceCoverage * 100).toFixed(2)),
    healthcareProviderLikeNoticeCount: healthcareProviderLikeCount,
    healthcareProviderLikeMatchedCount: healthcareProviderLikeMatchedCount,
    healthcareProviderLikeCoveragePct: Number((providerLikeCoverage * 100).toFixed(2)),
    healthcareProviderLikeHighConfidenceCoveragePct: Number((providerLikeHighConfidenceCoverage * 100).toFixed(2))
  },
  stateFeatures: Object.fromEntries(Array.from(byState.entries()).sort(([a], [b]) => a.localeCompare(b))),
  facilityFeatures: facilityRows.sort((a, b) => b.affected - a.affected || b.notices - a.notices).slice(0, 3000)
};

const crosswalk = {
  lastUpdated: out.lastUpdated,
  rows: matchedRows.slice(0, 15000).map((f) => ({
    facilityKey: `${f.state}::${f.canonical}`,
    facilityId: `fac_${stableHash(`${f.state}::${f.canonical}::${f.hospitalNameMatched || ''}`)}`,
    state: f.state,
    noticeFacility: f.facility,
    matchedHospital: f.hospitalNameMatched,
    matchedMetro: f.hospitalMetroMatched,
    matchMethod: f.matchMethod,
    matchTier: f.matchTier,
    matchScore: f.matchScore,
    ccn: null,
    npi: null,
    tin: null
  }))
};

// backfill crosswalk NPIs from matched provider rows when available
crosswalk.rows.forEach((row) => {
  const provider = matchedRows.find((m) => `${m.state}::${m.canonical}` === row.facilityKey);
  if (provider && provider.npi) row.npi = provider.npi;
});

const unmatchedTop = facilityRows
  .filter((f) => !f.matched && f.healthcareLikely)
  .sort((a, b) => b.affected - a.affected || b.notices - a.notices)
  .slice(0, 250)
  .map((f) => ({
    state: f.state,
    facility: f.facility,
    canonical: f.canonical,
    notices: f.notices,
    affected: f.affected,
    suggestedAliasToAdd: f.canonical
  }));

const aliasSuggestions = {
  lastUpdated: out.lastUpdated,
  topUnmatchedHealthcare: unmatchedTop
};

const qualityKpis = {
  lastUpdated: out.lastUpdated,
  kpis: {
    coverageHealthcarePct: out.summary.healthcareCoveragePct,
    highConfidenceCoverageHealthcarePct: out.summary.highConfidenceHealthcareCoveragePct,
    coverageProviderLikeHealthcarePct: out.summary.healthcareProviderLikeCoveragePct,
    highConfidenceCoverageProviderLikeHealthcarePct: out.summary.healthcareProviderLikeHighConfidenceCoveragePct,
    precisionProxyHighTierPct: matchedCount > 0 ? Number(((highTier / matchedCount) * 100).toFixed(2)) : 0,
    totalMatched: matchedCount,
    totalHealthcareNotices: healthcareNoticeCount,
    totalProviderLikeHealthcareNotices: healthcareProviderLikeCount
  }
};

writeJson(path.join(DATA_DIR, 'facility-market-features.json'), out);
writeJson(path.join(DATA_DIR, 'facility-crosswalk.json'), crosswalk);
writeJson(path.join(SCRIPT_DATA_DIR, 'facility-alias-suggestions.json'), aliasSuggestions);
writeJson(path.join(DATA_DIR, 'facility-match-kpis.json'), qualityKpis);

console.log('Wrote public/data/facility-market-features.json');
console.log('Wrote public/data/facility-crosswalk.json');
console.log('Wrote scripts/data/facility-alias-suggestions.json');
console.log('Wrote public/data/facility-match-kpis.json');
