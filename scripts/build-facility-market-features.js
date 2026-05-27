#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const SCRIPT_DATA_DIR = path.join(process.cwd(), 'scripts', 'data');

const readJson = (fullPath) => {
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    return null;
  }
};

const readDataJson = (name) => readJson(path.join(DATA_DIR, name));

const normalizeName = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\b(hospital|medical|center|health|system|inc|llc|corp|the|of)\b/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const toTokens = (value) => new Set(
  normalizeName(value)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
);

const jaccard = (aSet, bSet) => {
  if (!aSet.size || !bSet.size) return 0;
  let inter = 0;
  aSet.forEach((v) => { if (bSet.has(v)) inter += 1; });
  const union = aSet.size + bSet.size - inter;
  return union > 0 ? inter / union : 0;
};

const aliasConfig = readJson(path.join(SCRIPT_DATA_DIR, 'facility-aliases.json')) || { aliases: {} };
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

const canonicalizeByAlias = (value) => {
  const normalized = normalizeName(value);
  if (!normalized) return normalized;
  for (const [alias, canonical] of aliasMap.entries()) {
    if (normalized.includes(alias)) return canonical;
  }
  return normalized;
};

const notices = readDataJson('notices.json');
const rankings = readDataJson('hospital-rankings.json');

const noticeRows = Array.isArray(notices?.notices) ? notices.notices : [];
const states = rankings?.states && typeof rankings.states === 'object' ? rankings.states : {};

const rankingIndex = new Map();
const rankingByState = new Map();
Object.entries(states).forEach(([state, payload]) => {
  const rows = Array.isArray(payload?.hospitalRankings) ? payload.hospitalRankings : [];
  const enriched = rows.map((row) => {
    const normalized = canonicalizeByAlias(row?.name || row?.match || '');
    return {
      ...row,
      _normalized: normalized,
      _tokens: toTokens(normalized)
    };
  });
  rankingByState.set(state, enriched);
  enriched.forEach((row) => {
    const key = `${state}::${row._normalized}`;
    if (!key.endsWith('::')) rankingIndex.set(key, row);
  });
});

const findBestHospitalMatch = (state, facilityName) => {
  const normalized = canonicalizeByAlias(facilityName);
  const exactKey = `${state}::${normalized}`;
  if (rankingIndex.has(exactKey)) {
    return { row: rankingIndex.get(exactKey), score: 1, method: 'exact' };
  }

  const candidates = rankingByState.get(state) || [];
  if (!candidates.length || !normalized) return null;

  const sourceTokens = toTokens(normalized);
  let best = null;
  candidates.forEach((row) => {
    const targetNorm = row._normalized;
    const targetTokens = row._tokens;
    const jac = jaccard(sourceTokens, targetTokens);
    const prefix = targetNorm.startsWith(normalized) || normalized.startsWith(targetNorm) ? 0.18 : 0;
    const contains = targetNorm.includes(normalized) || normalized.includes(targetNorm) ? 0.12 : 0;
    const score = jac + prefix + contains;
    if (!best || score > best.score) best = { row, score, method: 'fuzzy' };
  });
  return best && best.score >= 0.5 ? best : null;
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
      avgCompositeScore: 0,
      distressWeight: 1
    });
  }
  return byState.get(state);
};

noticeRows.forEach((n) => {
  const state = String(n?.state || '').trim().toUpperCase();
  if (!state) return;

  const facilityRaw = n?.facility_name || n?.employer_name || '';
  const facilityCanonical = canonicalizeByAlias(facilityRaw);
  const facilityKey = `${state}::${facilityCanonical}`;
  const affected = Number(n?.employees_affected || n?.affected_workers || n?.affected || 0);

  const s = ensureState(state);
  s.notices += 1;
  s.affected += Number.isFinite(affected) ? affected : 0;

  const matchedCandidate = findBestHospitalMatch(state, facilityRaw);
  const matched = matchedCandidate?.row || null;
  if (matched) s.matchedFacilities += 1;
  else s.unmatchedFacilities += 1;

  if (!byFacility.has(facilityKey)) {
    byFacility.set(facilityKey, {
      state,
      facility: facilityRaw,
      normalized: normalizeName(facilityRaw),
      canonical: facilityCanonical,
      notices: 0,
      affected: 0,
      matched: Boolean(matched),
      matchMethod: matchedCandidate?.method || null,
      matchScore: matchedCandidate ? Number(matchedCandidate.score.toFixed(3)) : null,
      hospitalCompositeScore: matched ? Number(matched?.compositeScore || 0) : null,
      hospitalWarnWeight: matched ? Number(matched?.warnWeight || 1) : null
    });
  }

  const f = byFacility.get(facilityKey);
  f.notices += 1;
  f.affected += Number.isFinite(affected) ? affected : 0;
  if (!f.matched && matched) {
    f.matched = true;
    f.matchMethod = matchedCandidate?.method || f.matchMethod;
    f.matchScore = matchedCandidate ? Number(matchedCandidate.score.toFixed(3)) : f.matchScore;
    f.hospitalCompositeScore = Number(matched?.compositeScore || 0);
    f.hospitalWarnWeight = Number(matched?.warnWeight || 1);
  }
});

for (const stateRow of byState.values()) {
  const facilities = Array.from(byFacility.values())
    .filter((f) => f.state === stateRow.state && f.matched && Number.isFinite(f.hospitalCompositeScore));
  const avgScore = facilities.length
    ? facilities.reduce((sum, f) => sum + Number(f.hospitalCompositeScore || 0), 0) / facilities.length
    : 0;

  stateRow.avgCompositeScore = Number(avgScore.toFixed(2));
  const matchRate = stateRow.notices > 0 ? (stateRow.matchedFacilities / stateRow.notices) : 0;
  const affectedPerNotice = stateRow.notices > 0 ? stateRow.affected / stateRow.notices : 0;

  const scoreComponent = Math.min(1.1, Math.max(0.9, 1 + ((avgScore - 85) / 500)));
  const volumeComponent = Math.min(1.12, Math.max(0.9, 1 + ((affectedPerNotice - 120) / 2000)));
  const matchComponent = Math.min(1.12, Math.max(0.9, 1 + ((matchRate - 0.35) / 4)));
  stateRow.distressWeight = Number((scoreComponent * volumeComponent * matchComponent).toFixed(4));
  stateRow.matchRate = Number((matchRate * 100).toFixed(1));
}

const facilityRows = Array.from(byFacility.values());
const matchedCount = facilityRows.filter((f) => f.matched).length;
const exactMatches = facilityRows.filter((f) => f.matchMethod === 'exact').length;
const fuzzyMatches = facilityRows.filter((f) => f.matchMethod === 'fuzzy').length;

const out = {
  lastUpdated: new Date().toISOString(),
  summary: {
    totalNotices: noticeRows.length,
    totalFacilities: byFacility.size,
    matchedFacilities: matchedCount,
    exactMatches,
    fuzzyMatches,
    matchRatePct: byFacility.size ? Number(((matchedCount / byFacility.size) * 100).toFixed(2)) : 0
  },
  stateFeatures: Object.fromEntries(Array.from(byState.entries()).sort(([a], [b]) => a.localeCompare(b))),
  facilityFeatures: facilityRows
    .sort((a, b) => b.affected - a.affected || b.notices - a.notices)
    .slice(0, 3000)
};

fs.writeFileSync(path.join(DATA_DIR, 'facility-market-features.json'), JSON.stringify(out, null, 2));
console.log('Wrote public/data/facility-market-features.json');
