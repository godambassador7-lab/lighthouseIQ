#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const readJson = (name) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8')); } catch { return null; }
};
const readJsonPath = (fullPath) => {
  try { return JSON.parse(fs.readFileSync(fullPath, 'utf8')); } catch { return null; }
};

const normalize = (v) => String(v || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const pushProvider = (map, row) => {
  const state = String(row?.state || '').trim().toUpperCase();
  const name = String(row?.name || '').trim();
  if (!state || !name) return;
  const key = `${state}::${normalize(name)}`;
  if (!map.has(key)) {
    map.set(key, {
      state,
      name,
      normalized: normalize(name),
      system: row?.system || null,
      metro: row?.metro || null,
      beds: Number(row?.beds || 0) || null,
      score: Number(row?.score || row?.compositeScore || row?.baseScore || 0) || null,
      sources: new Set([row?.source || 'unknown'])
    });
  } else {
    const existing = map.get(key);
    if (!existing.system && row?.system) existing.system = row.system;
    if (!existing.metro && row?.metro) existing.metro = row.metro;
    if (!existing.beds && row?.beds) existing.beds = Number(row.beds) || existing.beds;
    if (!existing.score && (row?.score || row?.compositeScore || row?.baseScore)) existing.score = Number(row.score || row.compositeScore || row.baseScore) || existing.score;
    existing.sources.add(row?.source || 'unknown');
  }
};

const providerMap = new Map();
const npiCache = readJsonPath(path.join(DATA_DIR, 'provider-master-npi-cache.json')) || { rows: {} };
const npiRows = npiCache?.rows || {};
const cacheKey = (state, name, metro) => `${String(state || '').toUpperCase()}::${normalize(name)}::${normalize(metro)}`;

const rankings = readJson('hospital-rankings.json');
Object.entries(rankings?.states || {}).forEach(([state, payload]) => {
  (payload?.hospitalRankings || []).forEach((h) => pushProvider(providerMap, {
    state,
    name: h?.name,
    system: h?.system,
    metro: h?.metro,
    beds: h?.beds,
    score: h?.compositeScore || h?.baseScore,
    source: 'hospital-rankings'
  }));
});

const beacon = readJson('state-beacon.json');
Object.entries(beacon?.states || {}).forEach(([state, payload]) => {
  (payload?.hospitalRankings || []).forEach((h) => pushProvider(providerMap, {
    state,
    name: h?.name,
    system: h?.system,
    metro: h?.metro,
    beds: h?.beds,
    score: h?.baseScore,
    source: 'state-beacon-rankings'
  }));
  (payload?.hospitalRegistry || []).forEach((h) => pushProvider(providerMap, {
    state,
    name: h?.name,
    system: h?.system,
    metro: h?.metro || h?.city,
    beds: h?.beds,
    score: h?.score,
    source: 'state-beacon-registry'
  }));
});

const metros = readJson('target-state-metros.json');
Object.entries(metros?.states || {}).forEach(([state, payload]) => {
  (payload?.metros || []).forEach((m) => {
    (m?.hospitals || []).forEach((h) => pushProvider(providerMap, {
      state,
      name: h?.name,
      system: h?.system,
      metro: m?.name || h?.metro,
      beds: h?.beds,
      score: h?.score,
      source: 'target-state-metros'
    }));
  });
});

const providers = Array.from(providerMap.values()).map((p) => {
  const hit = npiRows[cacheKey(p.state, p.name, p.metro)];
  return {
    ...p,
    npi: hit?.npi || null,
    npiScore: Number(hit?.npiScore || 0) || null,
    sources: Array.from(p.sources).sort()
  };
});
const out = {
  lastUpdated: new Date().toISOString(),
  summary: {
    totalProviders: providers.length,
    statesCovered: new Set(providers.map((p) => p.state)).size
  },
  providers
};

fs.writeFileSync(path.join(DATA_DIR, 'provider-master.json'), JSON.stringify(out, null, 2));
console.log('Wrote public/data/provider-master.json');
