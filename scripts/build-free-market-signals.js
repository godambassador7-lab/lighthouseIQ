#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'public', 'data');
const WORKFORCE_SOURCES_PATH = path.join(DATA_DIR, 'workforce-sources.json');
const STRATEGIC_PATH = path.join(DATA_DIR, 'strategic.json');
const OUTPUT_PATH = path.join(DATA_DIR, 'free-market-signals.json');

const NLC_STATES = [
  'AL', 'AR', 'AZ', 'CO', 'DE', 'FL', 'GA', 'IA', 'ID', 'IN', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'OH', 'OK', 'SC', 'SD',
  'TN', 'TX', 'UT', 'VA', 'VT', 'WI', 'WV', 'WY'
];

const HRSA_SPECIALTY_BASELINE = {
  MED_SURG: 13.7,
  OR: 10.3,
  ICU: 10.3,
  ER: 7.7,
  TELE: 6.0,
  L_AND_D: 4.5,
  BEHAVIORAL: 4.3,
  PEDS: 2.9,
  PCU: 2.2
};

const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
};

const workforceSources = readJson(WORKFORCE_SOURCES_PATH) || {};
const strategic = readJson(STRATEGIC_PATH) || {};

const sourceStatus = {
  hrsa: 'unknown',
  bls: 'unknown',
  ncsbn: 'unknown',
  cms: 'unknown'
};

const sourceRows = Array.isArray(workforceSources.sources) ? workforceSources.sources : [];
for (const row of sourceRows) {
  const id = String(row?.id || '').toLowerCase();
  const status = String(row?.status || 'unknown');
  if (id.includes('hrsa')) sourceStatus.hrsa = status;
  if (id.includes('bls')) sourceStatus.bls = status;
  if (id.includes('ncsbn')) sourceStatus.ncsbn = status;
  if (id.includes('cms')) sourceStatus.cms = status;
}

const salaryData = strategic?.salaryData && typeof strategic.salaryData === 'object'
  ? strategic.salaryData
  : {};

const travelPremiums = Object.values(salaryData)
  .map((row) => Number(row?.travelAnnual || 0) - Number(row?.staffRN || 0))
  .filter((v) => Number.isFinite(v));
const avgPremium = travelPremiums.length
  ? travelPremiums.reduce((a, b) => a + b, 0) / travelPremiums.length
  : 0;

const stateFactors = {};
for (const [state, row] of Object.entries(salaryData)) {
  const shortage = String(row?.shortage || '').toLowerCase();
  const premium = Number(row?.travelAnnual || 0) - Number(row?.staffRN || 0);
  const premiumRatio = avgPremium > 0 ? premium / avgPremium : 1;
  const shortageWeight =
    shortage === 'shortage' ? 1.08 :
    shortage === 'surplus' ? 0.94 : 1.0;
  const compactWeight = NLC_STATES.includes(state) ? 1.03 : 0.97;
  const wagePressureWeight = Math.min(1.12, Math.max(0.88, 1 + (premiumRatio - 1) * 0.08));
  stateFactors[state] = {
    shortage,
    shortageWeight,
    compactWeight,
    wagePressureWeight,
    combinedWeight: Number((shortageWeight * compactWeight * wagePressureWeight).toFixed(4))
  };
}

const out = {
  lastUpdated: new Date().toISOString(),
  sources: {
    hrsa: sourceStatus.hrsa,
    bls: sourceStatus.bls,
    ncsbn: sourceStatus.ncsbn,
    cms: sourceStatus.cms
  },
  nlcCompactStates: NLC_STATES,
  hrsaSpecialtyBaseline: HRSA_SPECIALTY_BASELINE,
  stateFactors
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2));
console.log(`Wrote ${OUTPUT_PATH}`);
