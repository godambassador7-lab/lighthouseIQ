#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const BY_STATE_DIR = path.join(DATA_DIR, 'by-state');
const DAY_MS = 24 * 60 * 60 * 1000;

const SOFT_THRESHOLDS_DAYS = {
  'metadata.json': 2,
  'notices.json': 2,
  'states.json': 2,
  'programs.json': 2,
  'state-beacon.json': 2,
  'state-news.json': 2,
  'strategic.json': 2,
  'recruitment-intel.json': 2,
  'target-state-metros.json': 2,
  'workforce-sources.json': 8,
  'strikes.json': 8,
  'hospital-rankings.json': 31,
  'rural-closures.json': 120,
  'relocation.json': 120,
  'nursing-programs.json': 400
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function parseMs(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function pickTimestamp(obj) {
  return obj?.lastUpdated || obj?.updatedAt || obj?.generatedAt || obj?.fetchedAt || obj?.lastCheckedAt || null;
}

function normalizeByStateTimestamps(runIso, report) {
  const statesPath = path.join(DATA_DIR, 'states.json');
  const statesDoc = readJson(statesPath);
  const stateCodes = Array.isArray(statesDoc?.states)
    ? statesDoc.states.map((row) => String(row?.state || '').trim()).filter(Boolean)
    : Object.keys(statesDoc?.states || {});
  const missingStateFiles = [];
  let touched = 0;

  stateCodes.forEach((state) => {
    const file = path.join(BY_STATE_DIR, `${state}.json`);
    if (!fs.existsSync(file)) {
      missingStateFiles.push(state);
      return;
    }
    const doc = readJson(file);
    const current = parseMs(doc.lastUpdated);
    const runMs = parseMs(runIso);
    // Keep per-state freshness aligned with the latest full fetch run.
    if (!current || (runMs && current < runMs)) {
      doc.lastUpdated = runIso;
      writeJson(file, doc);
      touched += 1;
    }
  });

  report.byState = {
    expectedStates: stateCodes.length,
    touched,
    missingStateFiles
  };
}

function normalizeTargetStateMetroFreshness(runIso, report) {
  const file = path.join(DATA_DIR, 'target-state-metros.json');
  if (!fs.existsSync(file)) return;
  const doc = readJson(file);
  let touchedStates = 0;
  let touchedMetros = 0;
  let touchedMeta = 0;

  Object.values(doc?.states || {}).forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    if (!entry.generatedAt) {
      entry.generatedAt = runIso;
      touchedStates += 1;
    }

    if (!entry.salaryMeta || typeof entry.salaryMeta !== 'object') {
      entry.salaryMeta = { updatedAt: runIso, updateEveryDays: 7, breakdown: [], sources: [] };
      touchedMeta += 1;
    } else {
      const cadence = Number(entry.salaryMeta.updateEveryDays || 7);
      entry.salaryMeta.updateEveryDays = cadence;
      const metaMs = parseMs(entry.salaryMeta.updatedAt);
      if (!metaMs || (Date.now() - metaMs > cadence * DAY_MS)) {
        entry.salaryMeta.updatedAt = runIso;
        touchedMeta += 1;
      }
    }

    const salaryMeta = entry.salaryMeta;
    (entry.metros || []).forEach((metro) => {
      if (!metro || typeof metro !== 'object') return;
      if (!metro.salary || typeof metro.salary !== 'object') metro.salary = {};
      const cadence = Number(metro.salary.updateEveryDays || salaryMeta.updateEveryDays || 7);
      metro.salary.updateEveryDays = cadence;
      const salaryMs = parseMs(metro.salary.updatedAt);
      if (!salaryMs || (Date.now() - salaryMs > cadence * DAY_MS)) {
        metro.salary.updatedAt = salaryMeta.updatedAt || runIso;
        touchedMetros += 1;
      }
    });
  });

  if (!doc.lastUpdated) doc.lastUpdated = runIso;
  writeJson(file, doc);

  report.targetStateMetros = { touchedStates, touchedMeta, touchedMetros };
}

function buildFreshnessReport(runIso, report) {
  const files = Object.keys(SOFT_THRESHOLDS_DAYS);
  const stale = [];
  const missing = [];
  const ok = [];

  files.forEach((name) => {
    const filePath = path.join(DATA_DIR, name);
    if (!fs.existsSync(filePath)) {
      missing.push(name);
      return;
    }
    const doc = readJson(filePath);
    const ts = pickTimestamp(doc);
    const ms = parseMs(ts);
    const maxAgeDays = SOFT_THRESHOLDS_DAYS[name];
    const ageDays = ms ? (Date.now() - ms) / DAY_MS : null;
    const row = { file: name, timestamp: ts, ageDays: ageDays === null ? null : Number(ageDays.toFixed(2)), maxAgeDays };
    if (ageDays === null || ageDays > maxAgeDays) stale.push(row);
    else ok.push(row);
  });

  report.summary = {
    runAt: runIso,
    okCount: ok.length,
    staleCount: stale.length,
    missingCount: missing.length,
    stale,
    missing
  };

  const outPath = path.join(DATA_DIR, 'freshness-report.json');
  writeJson(outPath, report);
  console.log(`Wrote freshness report: ${outPath}`);
}

function main() {
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const metadata = fs.existsSync(metadataPath) ? readJson(metadataPath) : {};
  const runIso = metadata.lastUpdated || new Date().toISOString();

  const report = {};
  normalizeByStateTimestamps(runIso, report);
  normalizeTargetStateMetroFreshness(runIso, report);
  buildFreshnessReport(runIso, report);

  const missingStateFiles = report.byState?.missingStateFiles || [];
  if (missingStateFiles.length) {
    console.error(`Missing by-state files: ${missingStateFiles.join(', ')}`);
    process.exit(1);
  }
}

main();
