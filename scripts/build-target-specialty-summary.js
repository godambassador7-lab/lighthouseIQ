#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.LNI_OUTPUT_DIR || path.join(ROOT, 'public', 'data');
const HOME_STATE = process.env.TARGET_SPECIALTY_HOME_STATE || 'IN';

const SPECIALTY_LABELS = {
  ER: 'Emergency Department',
  ED: 'Emergency Department',
  OR: 'Operating Room',
  ICU: 'Intensive Care',
  MED_SURG: 'Med Surg',
  'MED SURG': 'Med Surg',
  L_AND_D: 'Labor and Delivery',
  'L&D': 'Labor and Delivery',
  TELE: 'Telemetry',
  PCU: 'Progressive Care',
  PEDS: 'Pediatrics',
  BEHAVIORAL: 'Behavioral Health'
};

const SPECIALTY_ORDER = ['OR', 'ED', 'ICU', 'MED SURG', 'L&D', 'TELE', 'PCU', 'PEDS', 'BEHAVIORAL'];

const readJson = (name, fallback = null) => {
  const filePath = path.join(DATA_DIR, name);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJson = (name, value) => {
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(value, null, 2) + '\n', 'utf8');
};

const normalizeSpecialty = (value) => {
  const text = String(value || '').toUpperCase().replace(/[^A-Z&\s_]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text === 'ER' || text === 'ED' || text.includes('EMERGENCY')) return 'ED';
  if (text === 'OR' || text.includes('OPERATING ROOM') || text.includes('PERIOPERATIVE')) return 'OR';
  if (text === 'ICU' || text.includes('INTENSIVE') || text.includes('CRITICAL')) return 'ICU';
  if (text === 'MED_SURG' || text === 'MED SURG' || /MED\s*SURG/.test(text) || text.includes('MEDICAL SURGICAL')) return 'MED SURG';
  if (text === 'L AND D' || text === 'L_AND_D' || text === 'L&D' || text.includes('LABOR')) return 'L&D';
  if (text === 'TELE' || text.includes('TELEMETRY')) return 'TELE';
  if (text === 'PCU' || text.includes('PROGRESSIVE') || text.includes('STEP DOWN')) return 'PCU';
  if (text === 'PEDS' || text.includes('PEDIATRIC')) return 'PEDS';
  if (text.includes('BEHAVIORAL') || text.includes('PSYCH')) return 'BEHAVIORAL';
  return text;
};

const labelForSpecialty = (specialty) => SPECIALTY_LABELS[specialty] || specialty;

const stateName = (state) => state;

const sumByState = (rows, specialty, homeState) => {
  const grouped = new Map();
  rows
    .filter((row) => row.state && row.state !== homeState)
    .filter((row) => (row.specialties || []).map(normalizeSpecialty).includes(specialty))
    .forEach((row) => {
      const state = String(row.state || '').toUpperCase();
      const existing = grouped.get(state) || {
        state,
        estimatedNursesAvailable: 0,
        noticesCount: 0,
        cities: []
      };
      existing.estimatedNursesAvailable += Number(row.estimated_nurses_available || 0);
      existing.noticesCount += Number(row.notices_count || 0);
      existing.cities.push({
        city: row.city || 'Statewide',
        estimatedNursesAvailable: Number(row.estimated_nurses_available || 0),
        noticesCount: Number(row.notices_count || 0)
      });
      grouped.set(state, existing);
    });

  return Array.from(grouped.values()).map((row) => ({
    ...row,
    cities: row.cities
      .sort((a, b) => b.estimatedNursesAvailable - a.estimatedNursesAvailable || b.noticesCount - a.noticesCount)
      .slice(0, 5)
  }));
};

const buildSourceMarkets = (stateRows, recruitmentScores = {}) => {
  const maxSupply = Math.max(...stateRows.map((row) => row.estimatedNursesAvailable), 1);
  return stateRows
    .map((row) => {
      const recruitmentScore = Number(recruitmentScores[row.state] ?? 0);
      const supplyScore = (row.estimatedNursesAvailable / maxSupply) * 100;
      const fitScore = Math.round((supplyScore * 0.72) + (Math.max(0, recruitmentScore) * 2.8));
      const topCity = row.cities[0] || null;
      return {
        state: row.state,
        topCity: topCity?.city || 'Statewide',
        estimatedNursesAvailable: Math.round(row.estimatedNursesAvailable),
        noticesCount: row.noticesCount,
        recruitmentScore,
        fitScore,
        outreachFocus: topCity
          ? `${topCity.city}, ${stateName(row.state)}`
          : stateName(row.state),
        topCities: row.cities
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore || b.estimatedNursesAvailable - a.estimatedNursesAvailable)
    .slice(0, 8);
};

const buildDestinationMetros = (talentRows, targetState, targetStateMetros, specialty) => {
  const inStateTalent = talentRows
    .filter((row) => row.state === targetState)
    .filter((row) => (row.specialties || []).map(normalizeSpecialty).includes(specialty));
  const talentByCity = new Map();
  inStateTalent.forEach((row) => {
    const city = String(row.city || 'Statewide').trim();
    const current = talentByCity.get(city) || { estimatedNursesAvailable: 0, noticesCount: 0 };
    current.estimatedNursesAvailable += Number(row.estimated_nurses_available || 0);
    current.noticesCount += Number(row.notices_count || 0);
    talentByCity.set(city, current);
  });

  const metros = Array.isArray(targetStateMetros?.metros) ? targetStateMetros.metros : [];
  return metros
    .slice(0, 12)
    .map((metro) => {
      const citySignal = talentByCity.get(metro.name) || { estimatedNursesAvailable: 0, noticesCount: 0 };
      const hospitalCount = Array.isArray(metro.hospitals) ? metro.hospitals.length : 0;
      const score = (hospitalCount * 12) + Math.min(80, citySignal.estimatedNursesAvailable / 5);
      return {
        metro: metro.name,
        hospitalCount,
        competition: metro.competition || 'medium',
        estimatedLocalSpecialtySignal: Math.round(citySignal.estimatedNursesAvailable),
        noticesCount: citySignal.noticesCount,
        score: Math.round(score),
        topHospitals: (metro.hospitals || []).slice(0, 5).map((hospital) => hospital.name)
      };
    })
    .sort((a, b) => b.score - a.score || b.hospitalCount - a.hospitalCount)
    .slice(0, 6);
};

const buildRecommendation = (specialty, sourceMarkets, destinationMetros, backupStates) => {
  const label = labelForSpecialty(specialty);
  const primarySource = sourceMarkets[0];
  const primaryDestination = destinationMetros[0];
  if (primarySource && primaryDestination) {
    return `Primary ${label} outreach should start in ${primarySource.outreachFocus}, then route candidates toward ${primaryDestination.metro}, ${HOME_STATE} roles.`;
  }
  if (primaryDestination && backupStates.length) {
    return `No strong live ${label} source pocket is mapped right now; use broad Indiana relocation targets starting with ${backupStates.slice(0, 3).join(', ')} and route candidates toward ${primaryDestination.metro}.`;
  }
  return `Insufficient live ${label} signal; use broad Indiana relocation targets until specialty-specific source markets refresh.`;
};

const buildTargetSpecialtySummary = () => {
  const talent = readJson('talent.json', { opportunities: [] });
  const recruitmentIntel = readJson('recruitment-intel.json', {});
  const targetStateMetros = readJson('target-state-metros.json', { states: {} });
  const freeSignals = readJson('free-market-signals.json', {});
  const opportunities = Array.isArray(talent.opportunities) ? talent.opportunities : [];
  const recruitmentScores = recruitmentIntel.recruitmentScores?.[HOME_STATE] || {};
  const backupStates = Array.isArray(recruitmentIntel.topTargets?.[HOME_STATE])
    ? recruitmentIntel.topTargets[HOME_STATE]
    : [];
  const targetMetros = targetStateMetros.states?.[HOME_STATE] || {};
  const baseline = freeSignals.hrsaSpecialtyBaseline || {};
  const observedSpecialties = new Set(SPECIALTY_ORDER);

  opportunities.forEach((row) => {
    (row.specialties || []).forEach((specialty) => {
      const normalized = normalizeSpecialty(specialty);
      if (normalized) observedSpecialties.add(normalized);
    });
  });

  const summaries = Array.from(observedSpecialties)
    .sort((a, b) => {
      const ai = SPECIALTY_ORDER.indexOf(a);
      const bi = SPECIALTY_ORDER.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.localeCompare(b);
    })
    .map((specialty) => {
      const sourceStateRows = sumByState(opportunities, specialty, HOME_STATE);
      const sourceMarkets = buildSourceMarkets(sourceStateRows, recruitmentScores);
      const destinationMetros = buildDestinationMetros(opportunities, HOME_STATE, targetMetros, specialty);
      const baselineKey = specialty === 'MED SURG' ? 'MED_SURG' : (specialty === 'L&D' ? 'L_AND_D' : (specialty === 'ED' ? 'ER' : specialty));
      return {
        specialty,
        label: labelForSpecialty(specialty),
        recommendation: buildRecommendation(specialty, sourceMarkets, destinationMetros, backupStates),
        primarySourceMarket: sourceMarkets[0] || null,
        secondarySourceMarkets: sourceMarkets.slice(1, 5),
        primaryIndianaDestination: destinationMetros[0] || null,
        indianaDestinations: destinationMetros,
        fallbackRecruitmentStates: backupStates,
        baselineShare: Number(baseline[baselineKey] || 0),
        evidence: {
          liveSourceMarketCount: sourceMarkets.length,
          liveOutOfStateEstimatedNurses: sourceMarkets.reduce((sum, row) => sum + row.estimatedNursesAvailable, 0),
          liveOutOfStateNoticeCount: sourceMarkets.reduce((sum, row) => sum + row.noticesCount, 0),
          homeState: HOME_STATE
        }
      };
    });

  return {
    lastUpdated: new Date().toISOString(),
    homeState: HOME_STATE,
    methodology: {
      description: 'Specialty-level recruiting summary built from live talent opportunities, target-state metro fit, and Indiana out-of-state recruitment scores.',
      ranking: [
        'Primary source markets prioritize live specialty-labeled nurse availability, with recruitment score as a secondary fit signal.',
        'Indiana destination metros prioritize hospital depth plus any local specialty-labeled signal.',
        'Fallback recruitment states come from the home-state recruitment model when live specialty signal is thin.'
      ],
      sources: [
        'public/data/talent.json',
        'public/data/recruitment-intel.json',
        'public/data/target-state-metros.json',
        'public/data/free-market-signals.json'
      ]
    },
    summaries
  };
};

const output = buildTargetSpecialtySummary();
writeJson('target-specialty-summary.json', output);
console.log(`Wrote ${path.join(DATA_DIR, 'target-specialty-summary.json')} with ${output.summaries.length} specialties.`);
