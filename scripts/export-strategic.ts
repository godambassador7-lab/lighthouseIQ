/**
 * Export Strategic Market Data Script
 *
 * Generates strategic nursing market intelligence data including:
 * - State-by-state salary comparisons (staff RN vs travel)
 * - Specialty pay rates
 * - Workforce projections
 * - Shortage/surplus analysis
 *
 * Data sources: BLS, Nurse.org, Vivian, HRSA projections
 *
 * Output: public/data/strategic.json
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');

// Ensure output directory exists
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Comprehensive salary data by state (from BLS, Nurse.org, Vivian 2024-2026)
const NURSING_SALARY_DATA: Record<string, {
  staffRN: number;
  staffHourly: number;
  travelWeekly: number;
  travelAnnual: number;
  shortage: 'surplus' | 'shortage' | 'balanced';
  projectedGap: number;
}> = {
  AL: { staffRN: 74970, staffHourly: 36, travelWeekly: 1850, travelAnnual: 96200, shortage: 'shortage', projectedGap: -5200 },
  AK: { staffRN: 112040, staffHourly: 54, travelWeekly: 2564, travelAnnual: 133328, shortage: 'shortage', projectedGap: -1800 },
  AZ: { staffRN: 89850, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -8500 },
  AR: { staffRN: 76890, staffHourly: 37, travelWeekly: 1920, travelAnnual: 99840, shortage: 'shortage', projectedGap: -3200 },
  CA: { staffRN: 148330, staffHourly: 71, travelWeekly: 2643, travelAnnual: 137436, shortage: 'shortage', projectedGap: -44500 },
  CO: { staffRN: 106342, staffHourly: 51, travelWeekly: 2280, travelAnnual: 118560, shortage: 'balanced', projectedGap: -2100 },
  CT: { staffRN: 98760, staffHourly: 47, travelWeekly: 2320, travelAnnual: 120640, shortage: 'balanced', projectedGap: 1200 },
  DE: { staffRN: 87450, staffHourly: 42, travelWeekly: 2180, travelAnnual: 113360, shortage: 'balanced', projectedGap: -800 },
  DC: { staffRN: 114282, staffHourly: 55, travelWeekly: 2450, travelAnnual: 127400, shortage: 'balanced', projectedGap: 500 },
  FL: { staffRN: 84850, staffHourly: 41, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -18900 },
  GA: { staffRN: 86240, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -9800 },
  HI: { staffRN: 123720, staffHourly: 59, travelWeekly: 2380, travelAnnual: 123760, shortage: 'shortage', projectedGap: -2400 },
  ID: { staffRN: 82670, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -1900 },
  IL: { staffRN: 88760, staffHourly: 43, travelWeekly: 2200, travelAnnual: 114400, shortage: 'shortage', projectedGap: -12300 },
  IN: { staffRN: 80250, staffHourly: 39, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -6400 },
  IA: { staffRN: 77780, staffHourly: 37, travelWeekly: 1950, travelAnnual: 101400, shortage: 'surplus', projectedGap: 2800 },
  KS: { staffRN: 79180, staffHourly: 38, travelWeekly: 1980, travelAnnual: 102960, shortage: 'balanced', projectedGap: -1100 },
  KY: { staffRN: 78650, staffHourly: 38, travelWeekly: 1970, travelAnnual: 102440, shortage: 'shortage', projectedGap: -4500 },
  LA: { staffRN: 79450, staffHourly: 38, travelWeekly: 2020, travelAnnual: 105040, shortage: 'shortage', projectedGap: -5600 },
  ME: { staffRN: 86780, staffHourly: 42, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -1400 },
  MD: { staffRN: 95280, staffHourly: 46, travelWeekly: 2350, travelAnnual: 122200, shortage: 'balanced', projectedGap: -800 },
  MA: { staffRN: 110449, staffHourly: 53, travelWeekly: 2420, travelAnnual: 125840, shortage: 'balanced', projectedGap: 1500 },
  MI: { staffRN: 85760, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -7200 },
  MN: { staffRN: 96580, staffHourly: 46, travelWeekly: 2280, travelAnnual: 118560, shortage: 'surplus', projectedGap: 3200 },
  MS: { staffRN: 79470, staffHourly: 38, travelWeekly: 1900, travelAnnual: 98800, shortage: 'shortage', projectedGap: -3800 },
  MO: { staffRN: 79890, staffHourly: 38, travelWeekly: 2000, travelAnnual: 104000, shortage: 'shortage', projectedGap: -5100 },
  MT: { staffRN: 83450, staffHourly: 40, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -1200 },
  NE: { staffRN: 80120, staffHourly: 39, travelWeekly: 2000, travelAnnual: 104000, shortage: 'balanced', projectedGap: -600 },
  NV: { staffRN: 102580, staffHourly: 49, travelWeekly: 2350, travelAnnual: 122200, shortage: 'shortage', projectedGap: -4200 },
  NH: { staffRN: 89760, staffHourly: 43, travelWeekly: 2200, travelAnnual: 114400, shortage: 'balanced', projectedGap: 400 },
  NJ: { staffRN: 102340, staffHourly: 49, travelWeekly: 2464, travelAnnual: 128128, shortage: 'shortage', projectedGap: -6800 },
  NM: { staffRN: 88450, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -2100 },
  NY: { staffRN: 110642, staffHourly: 53, travelWeekly: 2380, travelAnnual: 123760, shortage: 'shortage', projectedGap: -18200 },
  NC: { staffRN: 84670, staffHourly: 41, travelWeekly: 2080, travelAnnual: 108160, shortage: 'shortage', projectedGap: -12500 },
  ND: { staffRN: 107006, staffHourly: 51, travelWeekly: 2200, travelAnnual: 114400, shortage: 'surplus', projectedGap: 1100 },
  OH: { staffRN: 82340, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -9400 },
  OK: { staffRN: 78920, staffHourly: 38, travelWeekly: 1980, travelAnnual: 102960, shortage: 'shortage', projectedGap: -3600 },
  OR: { staffRN: 120470, staffHourly: 58, travelWeekly: 2380, travelAnnual: 123760, shortage: 'balanced', projectedGap: -1800 },
  PA: { staffRN: 88450, staffHourly: 43, travelWeekly: 2180, travelAnnual: 113360, shortage: 'shortage', projectedGap: -11200 },
  PR: { staffRN: 41470, staffHourly: 20, travelWeekly: 1600, travelAnnual: 83200, shortage: 'shortage', projectedGap: -2800 },
  RI: { staffRN: 95680, staffHourly: 46, travelWeekly: 2490, travelAnnual: 129480, shortage: 'balanced', projectedGap: 200 },
  SC: { staffRN: 82450, staffHourly: 40, travelWeekly: 2050, travelAnnual: 106600, shortage: 'shortage', projectedGap: -5400 },
  SD: { staffRN: 72210, staffHourly: 35, travelWeekly: 2481, travelAnnual: 129012, shortage: 'surplus', projectedGap: 800 },
  TN: { staffRN: 79680, staffHourly: 38, travelWeekly: 2020, travelAnnual: 105040, shortage: 'shortage', projectedGap: -7800 },
  TX: { staffRN: 91450, staffHourly: 44, travelWeekly: 2180, travelAnnual: 113360, shortage: 'shortage', projectedGap: -28500 },
  UT: { staffRN: 85670, staffHourly: 41, travelWeekly: 2100, travelAnnual: 109200, shortage: 'shortage', projectedGap: -3400 },
  VT: { staffRN: 107529, staffHourly: 52, travelWeekly: 2200, travelAnnual: 114400, shortage: 'balanced', projectedGap: -300 },
  VA: { staffRN: 89450, staffHourly: 43, travelWeekly: 2150, travelAnnual: 111800, shortage: 'shortage', projectedGap: -7600 },
  WA: { staffRN: 115740, staffHourly: 56, travelWeekly: 2420, travelAnnual: 125840, shortage: 'balanced', projectedGap: -2400 },
  WV: { staffRN: 78340, staffHourly: 38, travelWeekly: 1950, travelAnnual: 101400, shortage: 'shortage', projectedGap: -2200 },
  WI: { staffRN: 87650, staffHourly: 42, travelWeekly: 2100, travelAnnual: 109200, shortage: 'balanced', projectedGap: 600 },
  WY: { staffRN: 84760, staffHourly: 41, travelWeekly: 2080, travelAnnual: 108160, shortage: 'shortage', projectedGap: -700 }
};

// Travel nurse specialty pay (weekly rates)
const SPECIALTY_PAY: Record<string, {
  weekly: number;
  annual: number;
  demand: 'very high' | 'high' | 'moderate';
}> = {
  'CRNA': { weekly: 4996, annual: 259707, demand: 'very high' },
  'Cath Lab': { weekly: 4341, annual: 225732, demand: 'very high' },
  'NICU': { weekly: 2449, annual: 127391, demand: 'high' },
  'NP': { weekly: 2506, annual: 130295, demand: 'high' },
  'ICU': { weekly: 2426, annual: 126164, demand: 'very high' },
  'Telemetry': { weekly: 2321, annual: 120690, demand: 'high' },
  'L&D': { weekly: 2400, annual: 124800, demand: 'high' },
  'Oncology': { weekly: 2300, annual: 119600, demand: 'high' },
  'Med-Surg': { weekly: 2118, annual: 110165, demand: 'moderate' },
  'OR': { weekly: 1818, annual: 94573, demand: 'high' },
  'ER': { weekly: 1668, annual: 86737, demand: 'very high' },
  'Psych': { weekly: 1950, annual: 101400, demand: 'high' },
  'Home Health': { weekly: 1700, annual: 88400, demand: 'moderate' },
  'Rehab': { weekly: 1800, annual: 93600, demand: 'moderate' }
};

// National workforce projections (HRSA/BLS data)
const WORKFORCE_PROJECTIONS = {
  currentYear: 2026,
  nationalSupply: 3150000,
  nationalDemand: 3450000,
  projectedGap2030: -350000,
  projectedGap2035: -500000,
  growthRate: 6, // percent through 2032
  retirementRate: 4.5, // percent annually
  avgAge: 52,
  medianTenure: 8.5,
  projections: [
    { year: 2026, supply: 3150000, demand: 3450000, gap: -300000 },
    { year: 2030, supply: 3300000, demand: 3650000, gap: -350000 },
    { year: 2035, supply: 3400000, demand: 3900000, gap: -500000 }
  ]
};

// Calculate summary statistics
function calculateSummary() {
  const shortageStates = Object.entries(NURSING_SALARY_DATA)
    .filter(([_, d]) => d.shortage === 'shortage')
    .map(([s]) => s)
    .sort();

  const surplusStates = Object.entries(NURSING_SALARY_DATA)
    .filter(([_, d]) => d.shortage === 'surplus')
    .map(([s]) => s)
    .sort();

  const balancedStates = Object.entries(NURSING_SALARY_DATA)
    .filter(([_, d]) => d.shortage === 'balanced')
    .map(([s]) => s)
    .sort();

  const totalProjectedGap = Object.values(NURSING_SALARY_DATA)
    .reduce((sum, d) => sum + d.projectedGap, 0);

  const avgStaffSalary = Math.round(
    Object.values(NURSING_SALARY_DATA).reduce((sum, d) => sum + d.staffRN, 0) /
    Object.keys(NURSING_SALARY_DATA).length
  );

  const avgTravelSalary = Math.round(
    Object.values(NURSING_SALARY_DATA).reduce((sum, d) => sum + d.travelAnnual, 0) /
    Object.keys(NURSING_SALARY_DATA).length
  );

  return {
    shortageStates,
    surplusStates,
    balancedStates,
    totalProjectedGap,
    avgStaffSalary,
    avgTravelSalary,
    avgTravelPremium: avgTravelSalary - avgStaffSalary
  };
}

async function main() {
  console.log('Exporting strategic market data...');

  ensureDir(OUTPUT_DIR);

  const summary = calculateSummary();

  const strategicData = {
    lastUpdated: new Date().toISOString(),
    version: '2026-Q1',
    sources: [
      { name: 'BLS', url: 'https://www.bls.gov/oes/current/oes291141.htm' },
      { name: 'HRSA', url: 'https://bhw.hrsa.gov/data-research/projecting-health-workforce-supply-demand' },
      { name: 'Nurse.org', url: 'https://nurse.org/articles/highest-paying-states-for-nurses/' },
      { name: 'Vivian Health', url: 'https://www.vivian.com/' }
    ],
    summary,
    salaryData: NURSING_SALARY_DATA,
    specialtyPay: SPECIALTY_PAY,
    workforceProjections: WORKFORCE_PROJECTIONS
  };

  const outputPath = path.join(OUTPUT_DIR, 'strategic.json');
  fs.writeFileSync(outputPath, JSON.stringify(strategicData, null, 2));

  console.log(`Strategic data exported to ${outputPath}`);
  console.log(`- ${summary.shortageStates.length} shortage states`);
  console.log(`- ${summary.surplusStates.length} surplus states`);
  console.log(`- ${summary.balancedStates.length} balanced states`);
  console.log(`- Total projected gap: ${summary.totalProjectedGap.toLocaleString()}`);
}

main().catch(err => {
  console.error('Failed to export strategic data:', err);
  process.exit(1);
});
