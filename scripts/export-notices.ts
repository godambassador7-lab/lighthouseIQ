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
}

// Map notice to API-compatible format
function mapNoticeForExport(n: NormalizedWarnNotice) {
  return {
    id: n.id,
    state: n.state,
    employer_name: n.employerName,
    parent_system: n.parentSystem ?? null,
    city: n.city ?? null,
    county: n.county ?? null,
    address: n.address ?? null,
    notice_date: n.noticeDate ?? null,
    effective_date: n.effectiveDate ?? null,
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

  // Write metadata
  const metadata: ExportMetadata = {
    lastUpdated: new Date().toISOString(),
    totalNotices: exportedNotices.length,
    statesWithData: Object.keys(noticesByState).length,
    statesFailed,
    fetchDuration: duration,
    version: '1.0.0'
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
