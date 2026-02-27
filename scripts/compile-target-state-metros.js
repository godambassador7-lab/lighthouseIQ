const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const OVERRIDES_PATH = path.join(ROOT, 'scripts', 'data', 'hospital-rankings-overrides.json');
const LEGACY_OVERRIDES_PATH = path.join(DATA_DIR, 'hospital-rankings-overrides.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');

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
    statesWithMissingBeds: 0
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
    const hospitals = hospitalsRaw
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
          beds: beds ?? '--',
          bedSource: beds !== null
            ? (parseBeds(h.beds) !== null ? 'rankings' : 'override')
            : 'missing',
          reviews: h.sourceCount || '--'
        };
      });

    hospitals.forEach((h) => {
      if (h.beds !== '--') return;
      missingBedsReport.hospitals.push({
        state,
        metro: metroName,
        name: h.name,
        system: h.system,
        score: h.score
      });
      missingBedsReport.byState[state] = (missingBedsReport.byState[state] || 0) + 1;
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

    return {
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
    };
  })
  .sort((a, b) => (b.hospitals.length - a.hospitals.length) || a.name.localeCompare(b.name))
  .slice(0, 12);

  const schools = topInstitutionsByState.get(state) || [];
  const candidateMetroTable = metros.slice(0, 6).map((m) => ({
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

  output.states[state] = {
    generatedAt: output.lastUpdated,
    metros,
    candidateMetroTable,
    pipeline: {
      majorPrograms: schools.slice(0, 10)
    },
    summary: {
      metroCount: metros.length,
      hospitalCount: metros.reduce((sum, m) => sum + m.hospitals.length, 0)
    }
  };
}

const outPath = path.join(DATA_DIR, 'target-state-metros.json');
writeJson(outPath, output);
missingBedsReport.summary.unresolvedHospitals = missingBedsReport.hospitals.length;
missingBedsReport.summary.statesWithMissingBeds = Object.keys(missingBedsReport.byState).length;
const missingBedsPath = path.join(DATA_DIR, 'missing-beds.json');
writeJson(missingBedsPath, missingBedsReport);
console.log(`Wrote ${outPath} with ${Object.keys(output.states).length} states.`);
console.log(`Wrote ${missingBedsPath} with ${missingBedsReport.summary.unresolvedHospitals} unresolved hospitals.`);
