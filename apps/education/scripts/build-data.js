"use strict";

const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const sourceFile = path.join(repoRoot, "public", "data", "notices.json");
const outputRoot = path.join(appRoot, "data");

const childcarePattern = /\b(child\s?care|childcare|day\s?care|daycare|early learning|early childhood|preschool|pre-school|prekindergarten|pre-kindergarten|pre-k|nursery school|head start|montessori|learning center|learning centre|children(?:'s)? center|children(?:'s)? centre|youth development)\b/i;
const rolePattern = /\b(teacher|educator|teaching assistant|teacher assistant|classroom aide|childcare worker|caregiver|center director|site director|preschool director)\b/i;

const clean = value => value == null || value === "" ? null : value;
const normalizeText = notice => [notice.employer_name, notice.facility_name, notice.parent_system, notice.reason, notice.notes, notice.industry].filter(Boolean).join(" ");

function classify(text) {
  if (/head start/i.test(text)) return "Head Start";
  if (/montessori/i.test(text)) return "Montessori";
  if (/preschool|pre-school|pre-k|prekindergarten/i.test(text)) return "Preschool";
  if (/early learning|early childhood/i.test(text)) return "Early learning center";
  if (/child\s?care|day\s?care|daycare/i.test(text)) return "Childcare provider";
  return "Early-childhood services";
}

function score(text) {
  let value = 0;
  if (childcarePattern.test(text)) value += 70;
  if (rolePattern.test(text)) value += 20;
  if (/\b(center|centre|school|academy|program)\b/i.test(text)) value += 10;
  return Math.min(value, 100);
}

function selectNotice(notice) {
  const text = normalizeText(notice);
  return {
    id: String(notice.id),
    state: clean(notice.state),
    employer_name: clean(notice.employer_name),
    organization_name: clean(notice.parent_system),
    site_name: clean(notice.facility_name),
    city: clean(notice.city),
    county: clean(notice.county),
    notice_date: clean(notice.notice_date),
    effective_date: clean(notice.effective_date),
    employees_affected: Number(notice.employees_affected || 0) || null,
    source_name: clean(notice.source_name),
    source_url: clean(notice.source_url),
    relevance_score: score(text),
    provider_type: classify(text)
  };
}

function writeJson(filename, value) {
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, filename), JSON.stringify(value));
}

if (!fs.existsSync(sourceFile)) {
  throw new Error(`Missing source data: ${sourceFile}`);
}

const source = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
const notices = (source.notices || [])
  .filter(notice => childcarePattern.test(normalizeText(notice)) || rolePattern.test(normalizeText(notice)))
  .map(selectNotice)
  .sort((a, b) => String(b.notice_date || b.effective_date || "").localeCompare(String(a.notice_date || a.effective_date || "")));

const marketsByState = new Map();
for (const notice of notices) {
  if (!notice.state) continue;
  const market = marketsByState.get(notice.state) || { state: notice.state, events: 0, workers_affected: 0, providers: new Set(), latest_signal: null };
  market.events += 1;
  market.workers_affected += Number(notice.employees_affected || 0);
  market.providers.add(notice.employer_name || notice.site_name || "Unknown provider");
  const signalDate = notice.effective_date || notice.notice_date;
  if (signalDate && (!market.latest_signal || signalDate > market.latest_signal)) market.latest_signal = signalDate;
  marketsByState.set(notice.state, market);
}

const markets = [...marketsByState.values()].map(item => ({
  state: item.state,
  events: item.events,
  workers_affected: item.workers_affected,
  providers: item.providers.size,
  latest_signal: item.latest_signal,
  activity_index: Math.min(100, Math.round(item.events * 12 + Math.log1p(item.workers_affected) * 8))
})).sort((a, b) => b.activity_index - a.activity_index || a.state.localeCompare(b.state));

const providersByName = new Map();
for (const notice of notices) {
  const name = notice.organization_name || notice.employer_name || notice.site_name || "Unknown provider";
  const provider = providersByName.get(name) || { name, events: 0, workers_affected: 0, states: new Set(), provider_types: new Set(), latest_signal: null };
  provider.events += 1;
  provider.workers_affected += Number(notice.employees_affected || 0);
  if (notice.state) provider.states.add(notice.state);
  if (notice.provider_type) provider.provider_types.add(notice.provider_type);
  const signalDate = notice.effective_date || notice.notice_date;
  if (signalDate && (!provider.latest_signal || signalDate > provider.latest_signal)) provider.latest_signal = signalDate;
  providersByName.set(name, provider);
}
const providers = [...providersByName.values()].map(item => ({
  name: item.name,
  events: item.events,
  workers_affected: item.workers_affected,
  states: [...item.states].sort(),
  provider_types: [...item.provider_types].sort(),
  latest_signal: item.latest_signal,
  impact_index: Math.min(100, Math.round(item.events * 14 + Math.log1p(item.workers_affected) * 9 + item.states.size * 4))
})).sort((a, b) => b.impact_index - a.impact_index || b.workers_affected - a.workers_affected);

const trendsByMonth = new Map();
for (const notice of notices) {
  const signalDate = notice.notice_date || notice.effective_date;
  if (!/^\d{4}-\d{2}/.test(String(signalDate || ""))) continue;
  const month = signalDate.slice(0, 7);
  const trend = trendsByMonth.get(month) || { month, events: 0, workers_affected: 0, providers: new Set() };
  trend.events += 1;
  trend.workers_affected += Number(notice.employees_affected || 0);
  trend.providers.add(notice.employer_name || notice.site_name || "Unknown provider");
  trendsByMonth.set(month, trend);
}
const trends = [...trendsByMonth.values()].map(item => ({ month: item.month, events: item.events, workers_affected: item.workers_affected, providers: item.providers.size })).sort((a, b) => a.month.localeCompare(b.month));

writeJson("education-intel.json", {
  metadata: {
    edition: "LightkeeperIQ Education",
    lastUpdated: source.lastUpdated || null,
    generatedAt: new Date().toISOString(),
    count: notices.length,
    stateCounts: markets.map(item => [item.state, item.events]),
    scope: "Public WARN records screened for early-childhood care and education relevance"
  },
  notices,
  markets,
  providers,
  trends
});

console.log(`Built LightkeeperIQ Education data: ${notices.length} signals across ${markets.length} markets.`);
