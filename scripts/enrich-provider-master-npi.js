#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const PROVIDER_MASTER_PATH = path.join(DATA_DIR, 'provider-master.json');
const CACHE_PATH = path.join(DATA_DIR, 'provider-master-npi-cache.json');

const readJson = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
};
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2));

const normalize = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const nameKey = (state, name, city) => `${String(state || '').toUpperCase()}::${normalize(name)}::${normalize(city)}`;

const scoreCandidate = (provider, candidate) => {
  const basic = candidate?.basic || {};
  const name = normalize(basic?.organization_name || '');
  const city = normalize((candidate?.addresses || []).find((a) => String(a?.address_purpose || '').toUpperCase() === 'LOCATION')?.city || '');
  const targetName = normalize(provider?.name || '');
  const targetCity = normalize(provider?.metro || '');
  const nameExact = name === targetName ? 1 : (name.includes(targetName) || targetName.includes(name) ? 0.7 : 0);
  const cityMatch = targetCity && city ? (city === targetCity ? 1 : 0) : 0.4;
  return nameExact * 0.8 + cityMatch * 0.2;
};

const fetchNpi = async (provider) => {
  const params = new URLSearchParams({
    version: '2.1',
    enumeration_type: 'NPI-2',
    organization_name: provider.name || '',
    state: provider.state || '',
    limit: '20'
  });
  const url = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const rows = Array.isArray(json?.results) ? json.results : [];
  if (!rows.length) return null;
  const ranked = rows
    .map((r) => ({ r, s: scoreCandidate(provider, r) }))
    .sort((a, b) => b.s - a.s);
  const best = ranked[0];
  if (!best || best.s < 0.65) return null;
  return {
    npi: String(best.r?.number || ''),
    npiScore: Number(best.s.toFixed(3)),
    npiName: best.r?.basic?.organization_name || null
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const master = readJson(PROVIDER_MASTER_PATH);
  if (!master || !Array.isArray(master.providers)) {
    throw new Error('provider-master.json missing or invalid');
  }
  const cache = readJson(CACHE_PATH) || { lastUpdated: null, rows: {} };
  const rows = cache.rows || {};

  // prioritize high-score entries likely used in matching
  const limit = Math.max(1, Number(process.env.NPI_ENRICH_LIMIT || 250));
  const providers = master.providers.slice(0, limit);
  const sleepMs = Math.max(0, Number(process.env.NPI_ENRICH_SLEEP_MS || 60));
  let touched = 0;
  let processed = 0;
  for (const p of providers) {
    const key = nameKey(p.state, p.name, p.metro);
    if (rows[key]?.npi) continue;
    try {
      const enriched = await fetchNpi(p);
      rows[key] = {
        state: p.state,
        name: p.name,
        metro: p.metro || null,
        ...enriched
      };
      touched += 1;
    } catch {
      rows[key] = { state: p.state, name: p.name, metro: p.metro || null, npi: null, npiScore: 0 };
    }
    processed += 1;
    if (processed % 25 === 0) {
      writeJson(CACHE_PATH, { lastUpdated: new Date().toISOString(), rows });
    }
    await sleep(sleepMs);
  }

  const out = { lastUpdated: new Date().toISOString(), rows };
  writeJson(CACHE_PATH, out);
  console.log(`Wrote ${CACHE_PATH} (${touched} new lookups)`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
