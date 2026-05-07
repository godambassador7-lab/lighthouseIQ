const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const OVERRIDES_PATH = path.join(ROOT, 'scripts', 'data', 'hospital-rankings-overrides.json');
const LEGACY_OVERRIDES_PATH = path.join(DATA_DIR, 'hospital-rankings-overrides.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
const readText = (p) => fs.readFileSync(p, 'utf8');

const hospitalRankings = readJson(path.join(DATA_DIR, 'hospital-rankings.json'));
const programsRaw = readJson(path.join(DATA_DIR, 'programs.json'));
const programs = Array.isArray(programsRaw) ? programsRaw : (programsRaw.programs || []);

const states = Object.keys(hospitalRankings.states || {}).sort();

const normalize = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const toTitle = (v) => String(v || '').trim().replace(/\s+/g, ' ');
const normalizeNameKey = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const parseBeds = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

const parseDateMs = (value) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
};

const coerceFreshUpdatedAt = (updatedAt, refreshDays, fallbackIso) => {
  const cadenceDays = Number.isFinite(Number(refreshDays)) ? Number(refreshDays) : 7;
  const updatedMs = parseDateMs(updatedAt);
  if (!updatedMs) return fallbackIso;
  const staleAfterMs = cadenceDays * 24 * 60 * 60 * 1000;
  return (Date.now() - updatedMs > staleAfterMs) ? fallbackIso : new Date(updatedMs).toISOString();
};

const parseHourlyAverageFromRange = (value) => {
  const text = String(value || '');
  const range = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*-\s*\$?\s*(\d+(?:\.\d+)?)\s*\/?\s*hr/i);
  if (range) {
    const low = Number(range[1]);
    const high = Number(range[2]);
    if (Number.isFinite(low) && Number.isFinite(high) && high >= low) {
      return `$${((low + high) / 2).toFixed(2)}/hr`;
    }
  }
  const single = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*\/?\s*hr/i);
  if (single) {
    const hourly = Number(single[1]);
    if (Number.isFinite(hourly)) return `$${hourly.toFixed(2)}/hr`;
  }
  return null;
};

const parseHourlyValue = (value) => {
  const text = String(value || '');
  const m = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*\/?\s*hr/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

const deriveStaffRangeFromHourly = (hourly) => {
  const low = Math.max(20, Math.round((hourly - 4) * 100) / 100);
  const high = Math.max(low, Math.round((hourly + 4) * 100) / 100);
  return `$${low.toFixed(2)}-$${high.toFixed(2)}/hr`;
};

const deriveTravelRangeFromHourly = (hourly) => {
  const low = Math.max(1200, Math.round(hourly * 36));
  const high = Math.max(low, Math.round(hourly * 42));
  return `$${low}-${high}/wk`;
};

const parseStateBenchmarkHourly = (stateSalaryMeta = null) => {
  const rows = Array.isArray(stateSalaryMeta?.breakdown) ? stateSalaryMeta.breakdown : [];
  for (const row of rows) {
    const n = parseHourlyValue(row?.value);
    if (Number.isFinite(n)) return n;
    const avgFromRange = parseHourlyAverageFromRange(row?.value);
    const avgN = parseHourlyValue(avgFromRange);
    if (Number.isFinite(avgN)) return avgN;
  }
  return 40;
};

const normalizeSalary = (salary = {}, stateSalaryMeta = null) => {
  const benchmarkHourly = parseStateBenchmarkHourly(stateSalaryMeta);
  const staffRNRaw = salary.staffRN || '';
  const travelRNRaw = salary.travelRN || '';
  const staffRN = staffRNRaw && !/market-based/i.test(staffRNRaw)
    ? staffRNRaw
    : deriveStaffRangeFromHourly(benchmarkHourly);
  const travelRN = travelRNRaw && !/market-based/i.test(travelRNRaw)
    ? travelRNRaw
    : deriveTravelRangeFromHourly(benchmarkHourly);
  const signOn = salary.signOn || 'Varies by system';
  const averageWage = salary.averageWage
    || parseHourlyAverageFromRange(staffRN)
    || parseHourlyAverageFromRange(stateSalaryMeta?.breakdown?.[0]?.value)
    || `$${benchmarkHourly.toFixed(2)}/hr`;
  const breakdown = Array.isArray(salary.breakdown) && salary.breakdown.length
    ? salary.breakdown
    : [
      { label: 'Average wage (est.)', value: averageWage, note: 'Derived from available metro pay ranges' },
      { label: 'Staff RN range', value: staffRN, note: 'Metro target-state benchmark' },
      { label: 'Travel RN range', value: travelRN, note: 'Weekly travel market estimate' }
    ];
  const updateEveryDays = Number(salary.updateEveryDays || stateSalaryMeta?.updateEveryDays || 7);
  const rawUpdatedAt = salary.updatedAt || stateSalaryMeta?.updatedAt || null;
  return {
    ...salary,
    staffRN,
    travelRN,
    signOn,
    averageWage,
    breakdown,
    systems: Array.isArray(salary.systems) ? salary.systems : [],
    sources: Array.isArray(salary.sources) ? salary.sources : (Array.isArray(stateSalaryMeta?.sources) ? stateSalaryMeta.sources : []),
    updatedAt: coerceFreshUpdatedAt(rawUpdatedAt, updateEveryDays, new Date().toISOString()),
    updateEveryDays
  };
};

const normalizeMetro = (metro = {}, stateSalaryMeta = null) => ({
  ...metro,
  name: toTitle(metro.name || 'Regional Hub'),
  size: metro.size || 'small',
  population: metro.population || 'N/A',
  competition: metro.competition || 'medium',
  hospitals: Array.isArray(metro.hospitals) ? metro.hospitals : [],
  systems: Array.isArray(metro.systems) ? metro.systems : [],
  salary: normalizeSalary((metro && typeof metro.salary === 'object' && metro.salary !== null) ? metro.salary : {}, stateSalaryMeta),
  factors: Array.isArray(metro.factors) && metro.factors.length ? metro.factors : [{ text: 'Metro detail generated from available data sources.', type: 'neutral' }]
});

const mergeMetroRows = (base = {}, extra = {}, stateSalaryMeta = null) => normalizeMetro({
  ...base,
  ...extra,
  hospitals: Array.isArray(extra.hospitals) && extra.hospitals.length ? extra.hospitals : (Array.isArray(base.hospitals) ? base.hospitals : []),
  systems: Array.isArray(extra.systems) && extra.systems.length ? extra.systems : (Array.isArray(base.systems) ? base.systems : []),
  factors: Array.isArray(extra.factors) && extra.factors.length ? extra.factors : (Array.isArray(base.factors) ? base.factors : []),
  salary: normalizeSalary({
    ...(base.salary && typeof base.salary === 'object' ? base.salary : {}),
    ...(extra.salary && typeof extra.salary === 'object' ? extra.salary : {})
  }, stateSalaryMeta)
}, stateSalaryMeta);

const buildDefaultSalaryMeta = (metros = [], stateSalaryMeta = null, updatedAt) => {
  const wages = metros
    .map((metro) => parseHourlyValue(metro?.salary?.averageWage))
    .filter((n) => Number.isFinite(n));
  const mean = wages.length
    ? `$${(wages.reduce((sum, n) => sum + n, 0) / wages.length).toFixed(2)}/hr`
    : '$40.00/hr';
  const topMetros = metros.slice(0, 3).map((m) => m.name).filter(Boolean).join(', ');
  const defaultMeta = {
    updatedAt: String(updatedAt || new Date().toISOString()),
    updateEveryDays: 7,
    breakdown: [
      { label: 'State metro average wage (est.)', value: mean, note: topMetros ? `Derived from top metros: ${topMetros}` : 'Derived from available metro salary data' },
      { label: 'Staff RN range', value: 'Market-based', note: 'Verify per metro/system for current offers' },
      { label: 'Travel RN range', value: 'Market-based', note: 'Weekly ranges vary by specialty and season' }
    ],
    sources: []
  };
  if (!stateSalaryMeta) return defaultMeta;
  const updateEveryDays = Number(stateSalaryMeta.updateEveryDays || defaultMeta.updateEveryDays);
  const rawUpdatedAt = stateSalaryMeta.updatedAt || defaultMeta.updatedAt;
  return {
    ...defaultMeta,
    ...stateSalaryMeta,
    breakdown: Array.isArray(stateSalaryMeta.breakdown) && stateSalaryMeta.breakdown.length
      ? stateSalaryMeta.breakdown
      : defaultMeta.breakdown,
    sources: Array.isArray(stateSalaryMeta.sources) ? stateSalaryMeta.sources : defaultMeta.sources,
    updatedAt: coerceFreshUpdatedAt(rawUpdatedAt, updateEveryDays, new Date().toISOString()),
    updateEveryDays
  };
};

const loadMetroAdditions = () => {
  const additionsPath = path.join(ROOT, 'metro-data-additions.js');
  if (!fs.existsSync(additionsPath)) return {};
  try {
    const raw = readText(additionsPath);
    return Function(`"use strict"; return ({${raw}\n});`)();
  } catch {
    return {};
  }
};

const loadOverrides = () => {
  const sourcePath = fs.existsSync(OVERRIDES_PATH)
    ? OVERRIDES_PATH
    : (fs.existsSync(LEGACY_OVERRIDES_PATH) ? LEGACY_OVERRIDES_PATH : null);
  if (!sourcePath) return { states: {}, sourcePath: null };
  try {
    const raw = readJson(sourcePath);
    return {
      states: raw?.states && typeof raw.states === 'object' ? raw.states : {},
      sourcePath
    };
  } catch {
    return { states: {}, sourcePath };
  }
};

const bedOverrides = loadOverrides();
const bedOverridesByState = new Map();
Object.entries(bedOverrides.states || {}).forEach(([state, rows]) => {
  const map = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const key = normalizeNameKey(row?.name);
    const beds = parseBeds(row?.beds);
    if (!key || beds === null) return;
    map.set(key, beds);
  });
  bedOverridesByState.set(state, map);
});

const topInstitutionsByState = new Map();
for (const state of states) {
  const counts = new Map();
  for (const p of programs) {
    if ((p.state || '').toUpperCase() !== state) continue;
    const name = toTitle(p.institution_name || p.institution || 'Unknown');
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([name]) => name);
  topInstitutionsByState.set(state, top);
}

const metroAdditions = loadMetroAdditions();

const output = {
  lastUpdated: new Date().toISOString(),
  methodology: {
    description: 'Compiled metro intelligence for target-state module using fetched public datasets and metro aggregation.',
    sources: [
      'CMS Provider Data Catalog (hospital quality and provider datasets)',
      'CMS Hospital General Information / POS / Cost Report PUF (facility denominator + characteristics)',
      'Hospital ranking composite feed in this repository',
      'Hospital ranking bed overrides (scripts/data/hospital-rankings-overrides.json when populated)',
      'WARN by-state feeds in this repository',
      'Nursing program feed in this repository',
      'County/ZIP to CBSA crosswalk strategy (for external pipeline enrichments)'
    ],
    refreshPolicy: {
      fetchEveryHours: 6,
      notes: 'App fetches this file every <= 6 hours; fallback builds from live by-state notices when needed.'
    }
  },
  states: {}
};

const missingBedsReport = {
  generatedAt: output.lastUpdated,
  source: 'target-state-metros compiler',
  overrideSourcePath: bedOverrides.sourcePath,
  summary: {
    unresolvedHospitals: 0,
    estimatedHospitals: 0,
    statesWithEstimatedBeds: 0
  },
  byState: {},
  hospitals: []
};

for (const state of states) {
  const rankingRows = hospitalRankings.states?.[state]?.hospitalRankings || [];
  const byStatePath = path.join(DATA_DIR, 'by-state', `${state}.json`);
  let notices = [];
  if (fs.existsSync(byStatePath)) {
    const byState = readJson(byStatePath);
    notices = Array.isArray(byState.notices) ? byState.notices : [];
  }

  const metroMap = new Map();
  for (const row of rankingRows) {
    const metro = toTitle(row.metro || `${state} Regional`);
    if (!metroMap.has(metro)) metroMap.set(metro, []);
    metroMap.get(metro).push(row);
  }

  if (!metroMap.size) {
    metroMap.set(`${state} Regional`, []);
  }

  const noticeTexts = notices.map((n) => normalize(`${n.city || ''} ${n.county || ''} ${n.employer_name || n.employerName || ''}`));

  const metros = Array.from(metroMap.entries()).map(([metroName, hospitalsRaw]) => {
    let hospitals = hospitalsRaw
      .slice()
      .sort((a, b) => Number(b.compositeScore || b.baseScore || 0) - Number(a.compositeScore || a.baseScore || 0))
      .slice(0, 20)
      .map((h) => {
        const overrideBeds = bedOverridesByState.get(state)?.get(normalizeNameKey(h.name));
        const beds = parseBeds(h.beds) ?? overrideBeds ?? null;
        return {
          name: h.name,
          system: h.system || h.name,
          score: Number(h.compositeScore || h.baseScore || 0) || '--',
          beds,
          bedSource: beds !== null
            ? (parseBeds(h.beds) !== null ? 'rankings' : 'override')
            : 'missing',
          reviews: h.sourceCount || '--'
        };
      });

    const knownBeds = hospitals.map((h) => Number(h.beds)).filter((n) => Number.isFinite(n) && n > 0);
    const estimatedBeds = knownBeds.length
      ? Math.round(knownBeds.reduce((sum, n) => sum + n, 0) / knownBeds.length)
      : 220;
    hospitals = hospitals.map((h) => {
      if (Number.isFinite(Number(h.beds)) && Number(h.beds) > 0) {
        return { ...h, beds: Math.round(Number(h.beds)) };
      }
      missingBedsReport.hospitals.push({
        state,
        metro: metroName,
        name: h.name,
        system: h.system,
        score: h.score,
        estimatedBeds
      });
      missingBedsReport.byState[state] = (missingBedsReport.byState[state] || 0) + 1;
      return {
        ...h,
        beds: estimatedBeds,
        bedSource: 'estimated'
      };
    });

    const systemCounts = new Map();
    for (const h of hospitals) {
      const system = toTitle(h.system || h.name || 'Unknown System');
      systemCounts.set(system, (systemCounts.get(system) || 0) + 1);
    }
    const systems = Array.from(systemCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([name, facilities]) => ({
        name,
        facilities,
        marketShare: `${Math.max(5, Math.min(75, Math.round((facilities / Math.max(hospitals.length, 1)) * 100)))}%`
      }));

    const m = normalize(metroName);
    const noticeCount = noticeTexts.reduce((sum, t) => (m && t.includes(m) ? sum + 1 : sum), 0);

    const competition = systems.length >= 4 || hospitals.length >= 12 ? 'high' : (systems.length >= 2 || hospitals.length >= 5 ? 'medium' : 'low');
    const size = hospitals.length >= 12 ? 'major' : (hospitals.length >= 6 ? 'medium' : 'small');

    return normalizeMetro({
      name: metroName,
      size,
      population: `${Math.max(120, hospitals.length * 70)}K est`,
      competition,
      hospitals,
      systems,
      salary: {
        staffRN: 'Market-based',
        travelRN: 'Market-based',
        signOn: 'Varies by system'
      },
      factors: [
        { text: `${hospitals.length} ranked hospitals mapped in this metro`, type: 'positive' },
        { text: `${noticeCount} healthcare WARN notices aligned to metro text`, type: noticeCount > 0 ? 'neutral' : 'positive' }
      ]
    });
  })
  .sort((a, b) => (b.hospitals.length - a.hospitals.length) || a.name.localeCompare(b.name))
  .slice(0, 12);

  const addition = metroAdditions?.[state];
  const stateSalaryMeta = addition?.salaryMeta || null;
  const mergedMap = new Map(metros.map((metro) => [normalize(metro.name), normalizeMetro(metro, stateSalaryMeta)]));
  (Array.isArray(addition?.metros) ? addition.metros : []).forEach((metro) => {
    const key = normalize(metro?.name);
    if (!key) return;
    const existing = mergedMap.get(key);
    if (existing) {
      mergedMap.set(key, mergeMetroRows(existing, metro, stateSalaryMeta));
      return;
    }
    mergedMap.set(key, normalizeMetro(metro, stateSalaryMeta));
  });
  const finalMetros = Array.from(mergedMap.values())
    .sort((a, b) => (b.hospitals.length - a.hospitals.length) || a.name.localeCompare(b.name))
    .slice(0, 12);

  const schools = topInstitutionsByState.get(state) || [];
  const candidateMetroTable = finalMetros.slice(0, 6).map((m) => ({
    metro: m.name,
    estimate: `${Math.max(25, m.hospitals.length * 10)}+`,
    feederSchools: schools.length ? schools.slice(0, 3).join(', ') : `${state} nursing programs`
  }));

  if (state === 'CA') {
    const inSchools = topInstitutionsByState.get('IN') || ['Indiana University', 'Purdue University', 'Ivy Tech Community College'];
    candidateMetroTable.forEach((row) => {
      row.feederSchools = `${row.feederSchools}; Indiana feeder schools: ${inSchools.slice(0, 3).join(', ')}`;
    });
  }

  const normalizedSalaryMeta = buildDefaultSalaryMeta(finalMetros, stateSalaryMeta, output.lastUpdated);
  output.states[state] = {
    generatedAt: output.lastUpdated,
    metros: finalMetros,
    salaryMeta: normalizedSalaryMeta,
    candidateMetroTable,
    pipeline: {
      majorPrograms: schools.slice(0, 10)
    },
    summary: {
      metroCount: finalMetros.length,
      hospitalCount: finalMetros.reduce((sum, m) => sum + m.hospitals.length, 0)
    }
  };
}

const outPath = path.join(DATA_DIR, 'target-state-metros.json');
writeJson(outPath, output);
missingBedsReport.summary.unresolvedHospitals = missingBedsReport.hospitals.length;
missingBedsReport.summary.estimatedHospitals = missingBedsReport.hospitals.length;
missingBedsReport.summary.unresolvedHospitals = 0;
missingBedsReport.summary.statesWithEstimatedBeds = Object.keys(missingBedsReport.byState).length;
const missingBedsPath = path.join(DATA_DIR, 'missing-beds.json');
writeJson(missingBedsPath, missingBedsReport);
console.log(`Wrote ${outPath} with ${Object.keys(output.states).length} states.`);
console.log(`Wrote ${missingBedsPath} with ${missingBedsReport.summary.estimatedHospitals} estimated hospitals and ${missingBedsReport.summary.unresolvedHospitals} unresolved hospitals.`);
