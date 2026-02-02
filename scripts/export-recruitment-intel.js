#!/usr/bin/env node
/**
 * CRITICAL: This script contains proprietary algorithms.
 * Move this file to the private lighthouse-core repository.
 *
 * Exports pre-computed recruitment intelligence data:
 * - State workforce profiles
 * - Out-of-state recruitment scores
 * - Hospital risk rankings
 * - Salary benchmarks
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.env.LNI_OUTPUT_DIR || path.join(__dirname, '..', 'public', 'data');

// =============================================================================
// PROPRIETARY: Nursing Salary & Market Data
// =============================================================================
const NURSING_SALARY_DATA = {
  AL: { staffRN: 58000, staffHourly: 27.88, travelWeekly: 1850, travelAnnual: 96200, shortage: 'shortage', projectedGap: -8500 },
  AK: { staffRN: 88000, staffHourly: 42.31, travelWeekly: 2800, travelAnnual: 145600, shortage: 'balanced', projectedGap: -1200 },
  AZ: { staffRN: 75000, staffHourly: 36.06, travelWeekly: 2400, travelAnnual: 124800, shortage: 'shortage', projectedGap: -15000 },
  AR: { staffRN: 56000, staffHourly: 26.92, travelWeekly: 1750, travelAnnual: 91000, shortage: 'shortage', projectedGap: -4200 },
  CA: { staffRN: 120000, staffHourly: 57.69, travelWeekly: 3500, travelAnnual: 182000, shortage: 'shortage', projectedGap: -40000 },
  CO: { staffRN: 76000, staffHourly: 36.54, travelWeekly: 2450, travelAnnual: 127400, shortage: 'balanced', projectedGap: -3500 },
  CT: { staffRN: 82000, staffHourly: 39.42, travelWeekly: 2600, travelAnnual: 135200, shortage: 'balanced', projectedGap: -2800 },
  DE: { staffRN: 72000, staffHourly: 34.62, travelWeekly: 2300, travelAnnual: 119600, shortage: 'balanced', projectedGap: -800 },
  FL: { staffRN: 68000, staffHourly: 32.69, travelWeekly: 2200, travelAnnual: 114400, shortage: 'shortage', projectedGap: -25000 },
  GA: { staffRN: 70000, staffHourly: 33.65, travelWeekly: 2250, travelAnnual: 117000, shortage: 'shortage', projectedGap: -12000 },
  HI: { staffRN: 98000, staffHourly: 47.12, travelWeekly: 3000, travelAnnual: 156000, shortage: 'shortage', projectedGap: -3500 },
  ID: { staffRN: 68000, staffHourly: 32.69, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -2800 },
  IL: { staffRN: 72000, staffHourly: 34.62, travelWeekly: 2350, travelAnnual: 122200, shortage: 'balanced', projectedGap: -8000 },
  IN: { staffRN: 64000, staffHourly: 30.77, travelWeekly: 2100, travelAnnual: 109200, shortage: 'balanced', projectedGap: -4500 },
  IA: { staffRN: 60000, staffHourly: 28.85, travelWeekly: 1900, travelAnnual: 98800, shortage: 'balanced', projectedGap: -2000 },
  KS: { staffRN: 62000, staffHourly: 29.81, travelWeekly: 1950, travelAnnual: 101400, shortage: 'balanced', projectedGap: -2500 },
  KY: { staffRN: 62000, staffHourly: 29.81, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -5500 },
  LA: { staffRN: 62000, staffHourly: 29.81, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -6000 },
  ME: { staffRN: 68000, staffHourly: 32.69, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -1800 },
  MD: { staffRN: 80000, staffHourly: 38.46, travelWeekly: 2550, travelAnnual: 132600, shortage: 'balanced', projectedGap: -4000 },
  MA: { staffRN: 92000, staffHourly: 44.23, travelWeekly: 2900, travelAnnual: 150800, shortage: 'balanced', projectedGap: -5500 },
  MI: { staffRN: 72000, staffHourly: 34.62, travelWeekly: 2300, travelAnnual: 119600, shortage: 'balanced', projectedGap: -6000 },
  MN: { staffRN: 78000, staffHourly: 37.50, travelWeekly: 2450, travelAnnual: 127400, shortage: 'balanced', projectedGap: -4000 },
  MS: { staffRN: 58000, staffHourly: 27.88, travelWeekly: 1800, travelAnnual: 93600, shortage: 'shortage', projectedGap: -4500 },
  MO: { staffRN: 64000, staffHourly: 30.77, travelWeekly: 2050, travelAnnual: 106600, shortage: 'balanced', projectedGap: -5000 },
  MT: { staffRN: 68000, staffHourly: 32.69, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -1500 },
  NE: { staffRN: 64000, staffHourly: 30.77, travelWeekly: 2000, travelAnnual: 104000, shortage: 'balanced', projectedGap: -1800 },
  NV: { staffRN: 82000, staffHourly: 39.42, travelWeekly: 2650, travelAnnual: 137800, shortage: 'shortage', projectedGap: -5500 },
  NH: { staffRN: 74000, staffHourly: 35.58, travelWeekly: 2350, travelAnnual: 122200, shortage: 'balanced', projectedGap: -1200 },
  NJ: { staffRN: 86000, staffHourly: 41.35, travelWeekly: 2750, travelAnnual: 143000, shortage: 'balanced', projectedGap: -6500 },
  NM: { staffRN: 72000, staffHourly: 34.62, travelWeekly: 2250, travelAnnual: 117000, shortage: 'shortage', projectedGap: -3000 },
  NY: { staffRN: 90000, staffHourly: 43.27, travelWeekly: 2850, travelAnnual: 148200, shortage: 'balanced', projectedGap: -12000 },
  NC: { staffRN: 66000, staffHourly: 31.73, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -10000 },
  ND: { staffRN: 62000, staffHourly: 29.81, travelWeekly: 1950, travelAnnual: 101400, shortage: 'balanced', projectedGap: -800 },
  OH: { staffRN: 68000, staffHourly: 32.69, travelWeekly: 2200, travelAnnual: 114400, shortage: 'balanced', projectedGap: -8000 },
  OK: { staffRN: 62000, staffHourly: 29.81, travelWeekly: 1950, travelAnnual: 101400, shortage: 'shortage', projectedGap: -4000 },
  OR: { staffRN: 88000, staffHourly: 42.31, travelWeekly: 2750, travelAnnual: 143000, shortage: 'balanced', projectedGap: -4500 },
  PA: { staffRN: 72000, staffHourly: 34.62, travelWeekly: 2300, travelAnnual: 119600, shortage: 'balanced', projectedGap: -9000 },
  RI: { staffRN: 78000, staffHourly: 37.50, travelWeekly: 2500, travelAnnual: 130000, shortage: 'balanced', projectedGap: -1000 },
  SC: { staffRN: 64000, staffHourly: 30.77, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -6500 },
  SD: { staffRN: 58000, staffHourly: 27.88, travelWeekly: 1850, travelAnnual: 96200, shortage: 'balanced', projectedGap: -900 },
  TN: { staffRN: 64000, staffHourly: 30.77, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -8500 },
  TX: { staffRN: 74000, staffHourly: 35.58, travelWeekly: 2400, travelAnnual: 124800, shortage: 'shortage', projectedGap: -30000 },
  UT: { staffRN: 68000, staffHourly: 32.69, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -3500 },
  VT: { staffRN: 70000, staffHourly: 33.65, travelWeekly: 2200, travelAnnual: 114400, shortage: 'shortage', projectedGap: -800 },
  VA: { staffRN: 72000, staffHourly: 34.62, travelWeekly: 2300, travelAnnual: 119600, shortage: 'balanced', projectedGap: -7000 },
  WA: { staffRN: 90000, staffHourly: 43.27, travelWeekly: 2850, travelAnnual: 148200, shortage: 'balanced', projectedGap: -8000 },
  WV: { staffRN: 62000, staffHourly: 29.81, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -2500 },
  WI: { staffRN: 72000, staffHourly: 34.62, travelWeekly: 2300, travelAnnual: 119600, shortage: 'balanced', projectedGap: -4500 },
  WY: { staffRN: 68000, staffHourly: 32.69, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -600 }
};

// =============================================================================
// PROPRIETARY: Regional Classification
// =============================================================================
const STATE_REGIONS = {
  northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  southeast: ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
  midwest: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
  southwest: ['AZ', 'NM', 'OK', 'TX'],
  west: ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  midatlantic: ['DE', 'MD', 'DC'],
  newengland: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT'],
  greatlakes: ['IL', 'IN', 'MI', 'OH', 'WI'],
  plains: ['IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD']
};

const RELOCATION_FRICTION = {
  AL: 45, AK: 25, AZ: 62, AR: 40, CA: 58, CO: 65, CT: 48, DE: 52, FL: 70, GA: 58,
  HI: 35, ID: 55, IL: 52, IN: 50, IA: 42, KS: 44, KY: 48, LA: 46, ME: 38, MD: 55,
  MA: 50, MI: 48, MN: 52, MS: 38, MO: 50, MT: 45, NE: 44, NV: 60, NH: 46, NJ: 52,
  NM: 48, NY: 55, NC: 62, ND: 35, OH: 50, OK: 48, OR: 58, PA: 52, RI: 45, SC: 58,
  SD: 38, TN: 60, TX: 68, UT: 55, VT: 40, VA: 58, WA: 60, WV: 42, WI: 48, WY: 38
};

// =============================================================================
// PROPRIETARY: Core Scoring Algorithms
// =============================================================================

function getStateRegion(state) {
  for (const [region, states] of Object.entries(STATE_REGIONS)) {
    if (states.includes(state)) return region;
  }
  return 'unknown';
}

function clampScore(value) {
  return Math.max(0, Math.min(10, value));
}

/**
 * PROPRIETARY: Min-max score normalization
 */
function scoreFromCount(count, minCount, maxCount, invert = false) {
  if (maxCount === minCount) return 5;
  const ratio = (count - minCount) / (maxCount - minCount);
  const raw = ratio * 10;
  return clampScore(invert ? 10 - raw : raw);
}

/**
 * PROPRIETARY: 7-factor state workforce profile
 */
function buildStateProfile(state, noticeCount, minCount, maxCount) {
  const base = scoreFromCount(noticeCount, minCount, maxCount, true);
  return {
    staffing: clampScore(base),
    leadership: clampScore(base * 0.85 + 1.2),
    scheduling: clampScore(base * 0.8 + 1),
    pay: 5,
    safety: clampScore(base * 0.7 + 2),
    resources: scoreFromCount(noticeCount, minCount, maxCount, false),
    growth: scoreFromCount(noticeCount, minCount, maxCount, false),
    respect: 5
  };
}

/**
 * PROPRIETARY: Out-of-state recruitment scoring algorithm
 * This is the CORE competitive algorithm
 */
function scoreOutOfStateTarget(homeState, targetState, noticeCount = 0) {
  const homeData = NURSING_SALARY_DATA[homeState];
  const targetData = NURSING_SALARY_DATA[targetState];

  if (!homeData || !targetData) {
    return { score: 0, factors: {} };
  }

  const homeRegion = getStateRegion(homeState);
  const targetRegion = getStateRegion(targetState);

  // Factor 1: Regional proximity
  const regionFactor = homeRegion === targetRegion ? 1 : -0.75;

  // Factor 2: Shortage status
  let shortageFactor = 0;
  if (targetData.shortage === 'surplus') shortageFactor = 2;
  else if (targetData.shortage === 'balanced') shortageFactor = 0.75;
  else if (targetData.shortage === 'shortage') shortageFactor = -1.75;

  // Factor 3: Projected gap intensity
  const projectedGap = targetData.projectedGap || 0;
  const gapFactor = projectedGap < 0 ? Math.min(Math.abs(projectedGap) / 12000, 1.5) : 0;

  // Factor 4: Pay advantage
  const salaryDelta = targetData.staffRN - homeData.staffRN;
  const payAdvantageScore = Math.max(Math.min(salaryDelta / 6000, 2.5), -3);

  // Factor 5: Layoff activity (talent availability)
  const layoffFactor = Math.min(noticeCount / 4, 2);

  // Factor 6: Travel assignment incentive
  const travelWeekly = targetData.travelWeekly || 0;
  const travelFactor = Math.min(travelWeekly / 2000, 1.25);

  // Factor 7: Relocation friction
  const relocationScale = RELOCATION_FRICTION[targetState] || 50;
  const relocationFactor = Math.max(Math.min((relocationScale - 50) / 25, 2), -2);

  // Final score
  const score = regionFactor + shortageFactor + gapFactor + payAdvantageScore + layoffFactor + travelFactor + relocationFactor;

  return {
    score: Math.round(score * 100) / 100,
    factors: {
      region: Math.round(regionFactor * 100) / 100,
      shortage: Math.round(shortageFactor * 100) / 100,
      gap: Math.round(gapFactor * 100) / 100,
      payAdvantage: Math.round(payAdvantageScore * 100) / 100,
      layoff: Math.round(layoffFactor * 100) / 100,
      travel: Math.round(travelFactor * 100) / 100,
      relocation: Math.round(relocationFactor * 100) / 100
    }
  };
}

/**
 * PROPRIETARY: Signal confidence scoring
 */
function computeSignalConfidence(noticeCount, newsCount, majorSystemsCount) {
  let points = 0;
  if (noticeCount >= 5) points += 2;
  else if (noticeCount >= 1) points += 1;
  if (newsCount >= 4) points += 2;
  else if (newsCount >= 1) points += 1;
  if (majorSystemsCount >= 4) points += 1;

  if (points >= 4) return 'High';
  if (points >= 2) return 'Medium';
  return 'Low';
}

// =============================================================================
// Export Generation
// =============================================================================

function generateRecruitmentIntel(noticesByState = {}) {
  const states = Object.keys(NURSING_SALARY_DATA);
  const noticeCounts = states.map(s => noticesByState[s] || 0);
  const minCount = Math.min(...noticeCounts);
  const maxCount = Math.max(...noticeCounts);

  const output = {
    lastUpdated: new Date().toISOString(),
    version: '2.0.0',

    // Pre-computed salary benchmarks (sanitized - no algorithms)
    salaryBenchmarks: {},

    // Pre-computed state profiles
    stateProfiles: {},

    // Pre-computed recruitment scores (homeState -> targetState -> score)
    recruitmentScores: {},

    // Pre-computed top targets for each state
    topTargets: {},

    // Relocation attractiveness index
    relocationIndex: {}
  };

  // Generate salary benchmarks (expose data, not algorithm)
  for (const state of states) {
    const data = NURSING_SALARY_DATA[state];
    output.salaryBenchmarks[state] = {
      staffRN: data.staffRN,
      staffHourly: data.staffHourly,
      travelWeekly: data.travelWeekly,
      shortage: data.shortage,
      projectedGap: data.projectedGap,
      region: getStateRegion(state)
    };
  }

  // Generate state profiles
  for (const state of states) {
    const noticeCount = noticesByState[state] || 0;
    output.stateProfiles[state] = buildStateProfile(state, noticeCount, minCount, maxCount);
  }

  // Generate recruitment scores for all state pairs
  for (const homeState of states) {
    output.recruitmentScores[homeState] = {};
    const targetScores = [];

    for (const targetState of states) {
      if (homeState === targetState) continue;

      const noticeCount = noticesByState[targetState] || 0;
      const result = scoreOutOfStateTarget(homeState, targetState, noticeCount);

      output.recruitmentScores[homeState][targetState] = result.score;
      targetScores.push({ state: targetState, score: result.score });
    }

    // Sort and get top 5 targets
    targetScores.sort((a, b) => b.score - a.score);
    output.topTargets[homeState] = targetScores.slice(0, 5).map(t => t.state);
  }

  // Generate relocation index
  for (const state of states) {
    output.relocationIndex[state] = RELOCATION_FRICTION[state];
  }

  return output;
}

// =============================================================================
// Main Execution
// =============================================================================

async function main() {
  console.log('Generating recruitment intelligence data...');

  // Load notice counts by state if available
  let noticesByState = {};
  const noticesPath = path.join(OUTPUT_DIR, 'notices.json');

  if (fs.existsSync(noticesPath)) {
    try {
      const noticesData = JSON.parse(fs.readFileSync(noticesPath, 'utf-8'));
      const notices = noticesData.notices || noticesData;

      // Count healthcare notices by state
      for (const notice of notices) {
        const state = notice.state;
        if (state) {
          noticesByState[state] = (noticesByState[state] || 0) + 1;
        }
      }
      console.log(`Loaded ${Object.keys(noticesByState).length} states with notices`);
    } catch (err) {
      console.warn('Could not load notices, using defaults:', err.message);
    }
  }

  const data = generateRecruitmentIntel(noticesByState);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write output
  const outputPath = path.join(OUTPUT_DIR, 'recruitment-intel.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Written recruitment intelligence to ${outputPath}`);

  // Also write a minimal version for faster loading
  const minimalData = {
    lastUpdated: data.lastUpdated,
    salaryBenchmarks: data.salaryBenchmarks,
    topTargets: data.topTargets
  };
  const minimalPath = path.join(OUTPUT_DIR, 'recruitment-intel.min.json');
  fs.writeFileSync(minimalPath, JSON.stringify(minimalData));
  console.log(`Written minimal version to ${minimalPath}`);
}

main().catch(err => {
  console.error('Error generating recruitment intel:', err);
  process.exit(1);
});
