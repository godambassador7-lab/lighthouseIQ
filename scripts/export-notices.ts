/**
 * Export Notices Script
 *
 * Fetches WARN notices from all state adapters and writes them to static JSON files.
 * Used by GitHub Actions to generate data for GitHub Pages.
 *
 * Output files:
 * - public/data/notices.json - All notices combined
 * - public/data/states.json - State summary with counts
 * - public/data/by-state/{STATE}.json - Per-state notice files
 * - public/data/metadata.json - Fetch metadata (timestamp, counts)
 */

import { getAllAdapters } from '@lni/adapters';
import type { NormalizedWarnNotice } from '@lni/core';
import * as fs from 'fs';
import * as path from 'path';

// Use process.cwd() since this runs from the project root
const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');
const BY_STATE_DIR = path.join(OUTPUT_DIR, 'by-state');

// Configuration
const CONCURRENCY = 4; // Number of parallel fetches
const TIMEOUT_MS = 60000; // 60 second timeout per adapter
const RETRY_ATTEMPTS = 2;

interface FetchResult {
  state: string;
  notices: NormalizedWarnNotice[];
  error?: string;
  duration: number;
}

interface ExportMetadata {
  lastUpdated: string;
  totalNotices: number;
  statesWithData: number;
  statesFailed: string[];
  fetchDuration: number;
  version: string;
  features: string[];
}

type ExportedNotice = ReturnType<typeof mapNoticeForExport>;

interface EmployerProfile {
  employer_id: string;
  employer_name: string;
  parent_system: string | null;
  state: string;
  total_notices: number;
  total_affected: number;
  avg_affected: number;
  avg_lead_time_days: number | null;
  first_notice_date: string | null;
  last_notice_date: string | null;
  quarter_counts: Record<string, number>;
}

interface SystemProfile {
  system_name: string;
  total_notices: number;
  total_affected: number;
  states: string[];
  last_notice_date: string | null;
}

interface GeoSummaryEntry {
  state: string;
  city: string | null;
  total_notices: number;
  notices_last_90_days: number;
  risk_level: 'green' | 'yellow' | 'red';
}

interface AlertEntry {
  notice_id: string;
  state: string;
  employer_name: string;
  parent_system: string | null;
  facility_name: string | null;
  notice_date: string | null;
  effective_date: string | null;
  lead_time_days: number | null;
  expected_lead_days: number | null;
  early_warning: boolean;
  nursing_score: number;
  silent_signal_flag: boolean;
}

interface TalentEntry {
  state: string;
  city: string | null;
  estimated_nurses_available: number;
  specialties: string[];
  notices_count: number;
}

const EMPLOYER_SUFFIXES = [
  'inc', 'llc', 'l.l.c', 'co', 'corp', 'corporation', 'company',
  'ltd', 'plc', 'lp', 'llp', 'pllc', 'pc', 'limited'
];

function normalizeEmployerName(value: string): string {
  const lowered = value.toLowerCase();
  const noPunct = lowered.replace(/[^a-z0-9\\s]/g, ' ');
  const tokens = noPunct.split(' ').filter(Boolean).filter(t => !EMPLOYER_SUFFIXES.includes(t));
  return tokens.join(' ').trim();
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function inferParentSystem(name: string): string | null {
  const lowered = name.toLowerCase();
  const matches = [
    'health system',
    'healthcare',
    'health care',
    'health',
    'medical group'
  ];
  for (const marker of matches) {
    const idx = lowered.indexOf(marker);
    if (idx >= 0) {
      return name.slice(0, idx + marker.length).trim();
    }
  }
  const splitters = [' - ', ' – ', ' — ', ' / '];
  for (const splitter of splitters) {
    if (name.includes(splitter)) {
      return name.split(splitter)[0].trim();
    }
  }
  return null;
}

function inferEmployerHierarchy(notice: NormalizedWarnNotice) {
  const baseName = notice.employerName || 'Unknown';
  const inferredSystem = notice.parentSystem ?? inferParentSystem(baseName);
  const facilityName = baseName.trim();
  const parentSystem = inferredSystem?.trim() || null;
  const normalized = normalizeEmployerName(parentSystem || facilityName);
  const employerId = `${notice.state}:${slugify(normalized || facilityName)}`;
  return { facilityName, parentSystem, employerId };
}

function calculateLeadTimeDays(notice: NormalizedWarnNotice): number | null {
  if (!notice.noticeDate || !notice.effectiveDate) return null;
  const start = new Date(notice.noticeDate);
  const end = new Date(notice.effectiveDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
}

function hasSilentSignals(notice: NormalizedWarnNotice): boolean {
  const text = `${notice.reason ?? ''} ${notice.rawText ?? ''}`.toLowerCase();
  const triggers = ['unit closure', 'bed reduction', 'service line', 'ward closure', 'closure'];
  return triggers.some(t => text.includes(t));
}

function isHealthcareNotice(notice: NormalizedWarnNotice): boolean {
  if ((notice.nursingImpact?.score ?? 0) >= 20) return true;
  if (notice.nursingImpact?.label === 'Likely' || notice.nursingImpact?.label === 'Possible') return true;
  if (notice.naics && String(notice.naics).startsWith('62')) return true;
  const text = `${notice.employerName} ${notice.parentSystem ?? ''} ${notice.reason ?? ''} ${notice.rawText ?? ''}`.toLowerCase();
  const patterns = [
    'hospital', 'medical center', 'health system', 'healthcare', 'health care',
    'clinic', 'nursing', 'skilled nursing', 'long term care', 'ltc', 'snf',
    'hospice', 'behavioral health', 'rehab', 'home health', 'assisted living',
    'senior care', 'elder care'
  ];
  return patterns.some(pattern => text.includes(pattern));
}

// Map notice to API-compatible format
function mapNoticeForExport(n: NormalizedWarnNotice) {
  const { facilityName, parentSystem, employerId } = inferEmployerHierarchy(n);
  const leadTimeDays = calculateLeadTimeDays(n);
  return {
    id: n.id,
    state: n.state,
    employer_name: n.employerName,
    parent_system: parentSystem,
    facility_name: facilityName,
    employer_id: employerId,
    city: n.city ?? null,
    county: n.county ?? null,
    address: n.address ?? null,
    notice_date: n.noticeDate ?? null,
    effective_date: n.effectiveDate ?? null,
    lead_time_days: leadTimeDays,
    employees_affected: n.employeesAffected ?? null,
    naics: n.naics ?? null,
    reason: n.reason ?? null,
    raw_text: n.rawText ?? null,
    source_name: n.source.sourceName,
    source_url: n.source.sourceUrl,
    source_id: n.source.sourceId ?? null,
    attachments: n.attachments ?? null,
    nursing_score: n.nursingImpact?.score ?? 0,
    nursing_label: n.nursingImpact?.label ?? 'Unclear',
    nursing_signals: n.nursingImpact?.signals ?? [],
    nursing_keywords: n.nursingImpact?.keywordsFound ?? [],
    nursing_role_mix: n.nursingImpact?.roleMix ?? null,
    nursing_care_setting: n.nursingImpact?.careSetting ?? null,
    nursing_specialties: n.nursingImpact?.specialties ?? [],
    nursing_explanations: n.nursingImpact?.explanations ?? [],
    silent_signal_flag: hasSilentSignals(n),
    retrieved_at: n.source.retrievedAt
  };
}

async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fetcher();
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        console.log(`  Retry ${attempt + 1}/${attempts - 1}...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function fetchFromAdapter(adapter: { state: string; fetchLatest: () => Promise<{ notices: NormalizedWarnNotice[] }> }): Promise<FetchResult> {
  const startTime = Date.now();

  try {
    console.log(`Fetching ${adapter.state}...`);

    const result = await fetchWithRetry(async () => {
      const fetchPromise = adapter.fetchLatest();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS);
      });
      return Promise.race([fetchPromise, timeoutPromise]);
    });

    const duration = Date.now() - startTime;
    console.log(`  ✓ ${adapter.state}: ${result.notices.length} notices (${duration}ms)`);

    return {
      state: adapter.state,
      notices: result.notices,
      duration
    };
  } catch (err: any) {
    const duration = Date.now() - startTime;
    const errorMsg = err?.message || String(err);
    console.error(`  ✗ ${adapter.state}: ${errorMsg} (${duration}ms)`);

    return {
      state: adapter.state,
      notices: [],
      error: errorMsg,
      duration
    };
  }
}

async function fetchAllNotices(): Promise<{ results: FetchResult[]; duration: number }> {
  const startTime = Date.now();
  const adapters = getAllAdapters();
  const results: FetchResult[] = [];

  console.log(`\nFetching from ${adapters.length} state adapters (concurrency: ${CONCURRENCY})...\n`);

  // Process adapters with limited concurrency
  const queue = [...adapters];
  const workers: Promise<void>[] = [];

  const worker = async () => {
    while (queue.length > 0) {
      const adapter = queue.shift();
      if (!adapter) break;
      const result = await fetchFromAdapter(adapter);
      results.push(result);
    }
  };

  // Start workers
  for (let i = 0; i < Math.min(CONCURRENCY, queue.length); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  return {
    results,
    duration: Date.now() - startTime
  };
}

function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(BY_STATE_DIR)) {
    fs.mkdirSync(BY_STATE_DIR, { recursive: true });
  }
}

function writeJsonFile(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Written: ${path.relative(ROOT_DIR, filePath)}`);
}

function quarterFromDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter}`;
}

function riskLevelFromCount(count: number): 'green' | 'yellow' | 'red' {
  if (count >= 20) return 'red';
  if (count >= 5) return 'yellow';
  return 'green';
}

async function main() {
  console.log('='.repeat(60));
  console.log('Nursing Layoff Radar - Data Export');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);

  // Ensure output directories exist
  ensureDirectories();

  // Fetch all notices
  const { results, duration } = await fetchAllNotices();

  // Aggregate results
  const allNotices: NormalizedWarnNotice[] = [];
  const statesFailed: string[] = [];
  const stateCounts: Record<string, number> = {};

  for (const result of results) {
    if (result.error) {
      statesFailed.push(result.state);
    }
    allNotices.push(...result.notices);
    stateCounts[result.state] = result.notices.length;
  }

  // Sort notices by nursing score (desc), then by date (desc)
  allNotices.sort((a, b) => {
    const scoreA = a.nursingImpact?.score ?? 0;
    const scoreB = b.nursingImpact?.score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;

    const dateA = a.noticeDate || a.source.retrievedAt;
    const dateB = b.noticeDate || b.source.retrievedAt;
    return dateB.localeCompare(dateA);
  });

  // Map to export format
  const exportedNotices = allNotices.map(mapNoticeForExport);

  console.log('\n' + '='.repeat(60));
  console.log('Writing output files...\n');

  const healthcareNotices = allNotices.filter(isHealthcareNotice);
  const exportedHealthcareNotices = healthcareNotices.map(mapNoticeForExport);

  // Build employer profiles
  const employerProfiles = new Map<string, EmployerProfile & {
    affectedSum: number;
    affectedCount: number;
    leadSum: number;
    leadCount: number;
  }>();

  for (const notice of exportedHealthcareNotices) {
    const employerId = notice.employer_id as string;
    const key = employerId;
    const existing = employerProfiles.get(key) ?? {
      employer_id: employerId,
      employer_name: notice.employer_name,
      parent_system: notice.parent_system ?? null,
      state: notice.state,
      total_notices: 0,
      total_affected: 0,
      avg_affected: 0,
      avg_lead_time_days: null,
      first_notice_date: null,
      last_notice_date: null,
      quarter_counts: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      affectedSum: 0,
      affectedCount: 0,
      leadSum: 0,
      leadCount: 0
    };

    existing.total_notices += 1;
    if (typeof notice.employees_affected === 'number') {
      existing.total_affected += notice.employees_affected;
      existing.affectedSum += notice.employees_affected;
      existing.affectedCount += 1;
    }
    if (typeof notice.lead_time_days === 'number') {
      existing.leadSum += notice.lead_time_days;
      existing.leadCount += 1;
    }

    const dateToken = notice.notice_date || notice.retrieved_at;
    if (dateToken) {
      if (!existing.first_notice_date || dateToken < existing.first_notice_date) {
        existing.first_notice_date = dateToken;
      }
      if (!existing.last_notice_date || dateToken > existing.last_notice_date) {
        existing.last_notice_date = dateToken;
      }
      const quarter = quarterFromDate(dateToken);
      if (quarter && existing.quarter_counts[quarter] !== undefined) {
        existing.quarter_counts[quarter] += 1;
      }
    }

    employerProfiles.set(key, existing);
  }

  const employerProfileList: EmployerProfile[] = Array.from(employerProfiles.values()).map(profile => ({
    employer_id: profile.employer_id,
    employer_name: profile.employer_name,
    parent_system: profile.parent_system,
    state: profile.state,
    total_notices: profile.total_notices,
    total_affected: profile.total_affected,
    avg_affected: profile.affectedCount ? Math.round(profile.affectedSum / profile.affectedCount) : 0,
    avg_lead_time_days: profile.leadCount ? Math.round(profile.leadSum / profile.leadCount) : null,
    first_notice_date: profile.first_notice_date,
    last_notice_date: profile.last_notice_date,
    quarter_counts: profile.quarter_counts
  }));

  // Build system profiles
  const systemProfiles = new Map<string, SystemProfile & { statesSet: Set<string> }>();
  for (const notice of exportedHealthcareNotices) {
    if (!notice.parent_system) continue;
    const key = notice.parent_system;
    const existing = systemProfiles.get(key) ?? {
      system_name: key,
      total_notices: 0,
      total_affected: 0,
      states: [],
      last_notice_date: null,
      statesSet: new Set<string>()
    };
    existing.total_notices += 1;
    if (typeof notice.employees_affected === 'number') {
      existing.total_affected += notice.employees_affected;
    }
    existing.statesSet.add(notice.state);
    const dateToken = notice.notice_date || notice.retrieved_at;
    if (dateToken && (!existing.last_notice_date || dateToken > existing.last_notice_date)) {
      existing.last_notice_date = dateToken;
    }
    systemProfiles.set(key, existing);
  }

  const systemProfileList: SystemProfile[] = Array.from(systemProfiles.values()).map(profile => ({
    system_name: profile.system_name,
    total_notices: profile.total_notices,
    total_affected: profile.total_affected,
    states: Array.from(profile.statesSet).sort(),
    last_notice_date: profile.last_notice_date
  }));

  // Build geo summary
  const now = new Date();
  const last90 = new Date(now.getTime() - 90 * 86400000);
  const geoMap = new Map<string, GeoSummaryEntry>();

  for (const notice of exportedHealthcareNotices) {
    const city = notice.city ? String(notice.city) : null;
    const key = `${notice.state}:${city ?? 'unknown'}`;
    const dateToken = notice.notice_date || notice.retrieved_at;
    const entry = geoMap.get(key) ?? {
      state: notice.state,
      city,
      total_notices: 0,
      notices_last_90_days: 0,
      risk_level: 'green'
    };
    entry.total_notices += 1;
    if (dateToken) {
      const date = new Date(dateToken);
      if (!Number.isNaN(date.getTime()) && date >= last90) {
        entry.notices_last_90_days += 1;
      }
    }
    entry.risk_level = riskLevelFromCount(entry.notices_last_90_days);
    geoMap.set(key, entry);
  }

  const geoSummary: GeoSummaryEntry[] = Array.from(geoMap.values());

  // Build alerts and talent summaries
  const last14 = new Date(now.getTime() - 14 * 86400000);
  const employerAvgLead = new Map(employerProfileList.map(p => [p.employer_id, p.avg_lead_time_days]));
  const alerts: AlertEntry[] = [];
  const talentMap = new Map<string, { entry: TalentEntry; specialties: Set<string> }>();

  for (const notice of exportedHealthcareNotices) {
    const dateToken = notice.notice_date || notice.retrieved_at;
    const date = dateToken ? new Date(dateToken) : null;
    const isRecent = date && !Number.isNaN(date.getTime()) && date >= last14;
    if (isRecent) {
      const expected = employerAvgLead.get(notice.employer_id) ?? null;
      const leadTime = typeof notice.lead_time_days === 'number' ? notice.lead_time_days : null;
      const earlyWarning = expected !== null && leadTime !== null && leadTime <= expected - 2;
      alerts.push({
        notice_id: notice.id,
        state: notice.state,
        employer_name: notice.employer_name,
        parent_system: notice.parent_system ?? null,
        facility_name: notice.facility_name ?? null,
        notice_date: notice.notice_date ?? null,
        effective_date: notice.effective_date ?? null,
        lead_time_days: leadTime,
        expected_lead_days: expected,
        early_warning: Boolean(earlyWarning),
        nursing_score: notice.nursing_score ?? 0,
        silent_signal_flag: Boolean(notice.silent_signal_flag)
      });
    }

    const city = notice.city ? String(notice.city) : null;
    const key = `${notice.state}:${city ?? 'unknown'}`;
    const estimated = typeof notice.employees_affected === 'number'
      ? Math.round(notice.employees_affected * (notice.nursing_score / 100) * 0.7)
      : 0;
    const entry = talentMap.get(key) ?? {
      entry: {
        state: notice.state,
        city,
        estimated_nurses_available: 0,
        specialties: [],
        notices_count: 0
      },
      specialties: new Set<string>()
    };
    entry.entry.estimated_nurses_available += estimated;
    entry.entry.notices_count += 1;
    for (const specialty of notice.nursing_specialties ?? []) {
      entry.specialties.add(String(specialty));
    }
    talentMap.set(key, entry);
  }

  const talentSummary: TalentEntry[] = Array.from(talentMap.values()).map(({ entry, specialties }) => ({
    ...entry,
    specialties: Array.from(specialties).sort()
  })).sort((a, b) => b.estimated_nurses_available - a.estimated_nurses_available);

  // Write main notices file
  writeJsonFile(path.join(OUTPUT_DIR, 'notices.json'), {
    notices: exportedNotices,
    count: exportedNotices.length,
    lastUpdated: new Date().toISOString()
  });

  // Write states summary
  const statesSummary = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => a.state.localeCompare(b.state));

  writeJsonFile(path.join(OUTPUT_DIR, 'states.json'), {
    states: statesSummary,
    lastUpdated: new Date().toISOString()
  });

  // Write per-state files
  const noticesByState: Record<string, typeof exportedNotices> = {};
  for (const notice of exportedNotices) {
    if (!noticesByState[notice.state]) {
      noticesByState[notice.state] = [];
    }
    noticesByState[notice.state].push(notice);
  }

  for (const [state, notices] of Object.entries(noticesByState)) {
    writeJsonFile(path.join(BY_STATE_DIR, `${state}.json`), {
      state,
      notices,
      count: notices.length,
      lastUpdated: new Date().toISOString()
    });
  }

  // Write employer/system/geo/alerts/talent summaries
  writeJsonFile(path.join(OUTPUT_DIR, 'employers.json'), {
    employers: employerProfileList,
    count: employerProfileList.length,
    lastUpdated: new Date().toISOString()
  });

  writeJsonFile(path.join(OUTPUT_DIR, 'systems.json'), {
    systems: systemProfileList,
    count: systemProfileList.length,
    lastUpdated: new Date().toISOString()
  });

  writeJsonFile(path.join(OUTPUT_DIR, 'geo.json'), {
    locations: geoSummary,
    count: geoSummary.length,
    lastUpdated: new Date().toISOString()
  });

  writeJsonFile(path.join(OUTPUT_DIR, 'alerts.json'), {
    alerts,
    count: alerts.length,
    lastUpdated: new Date().toISOString()
  });

  writeJsonFile(path.join(OUTPUT_DIR, 'talent.json'), {
    opportunities: talentSummary,
    count: talentSummary.length,
    lastUpdated: new Date().toISOString()
  });

  // Write metadata
  const metadata: ExportMetadata = {
    lastUpdated: new Date().toISOString(),
    totalNotices: exportedNotices.length,
    statesWithData: Object.keys(noticesByState).length,
    statesFailed,
    fetchDuration: duration,
    version: '1.1.0',
    features: [
      'nursing-impact-breakdown',
      'facility-system-matching',
      'employer-profiles',
      'geo-heatmap',
      'early-warning-alerts',
      'talent-opportunity'
    ]
  };

  writeJsonFile(path.join(OUTPUT_DIR, 'metadata.json'), metadata);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Export Complete!');
  console.log('='.repeat(60));
  console.log(`Total notices: ${exportedNotices.length}`);
  console.log(`States with data: ${Object.keys(noticesByState).length}`);
  console.log(`States failed: ${statesFailed.length > 0 ? statesFailed.join(', ') : 'None'}`);
  console.log(`Total duration: ${(duration / 1000).toFixed(1)}s`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
