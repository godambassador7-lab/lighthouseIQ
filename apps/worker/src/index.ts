import 'dotenv/config';
import { Pool } from 'pg';
import { getAdapter, getAllAdapters } from '@lni/adapters';
import type { NormalizedWarnNotice, StateAdapter, USStateAbbrev } from '@lni/core';

const DATABASE_URL = process.env.DATABASE_URL;
const STATES = (process.env.STATES ?? '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean) as USStateAbbrev[];

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required for the worker to store results.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

function isAdapter(adapter: StateAdapter | undefined): adapter is StateAdapter {
  return Boolean(adapter);
}

async function upsert(notice: NormalizedWarnNotice): Promise<void> {
  const n = notice;
  const nursing = n.nursingImpact;

  const sql = `
    INSERT INTO warn_notices (
      id, state, employer_name, parent_system, city, county, address,
      notice_date, effective_date, employees_affected, naics, reason, raw_text,
      source_name, source_url, source_id, attachments,
      nursing_score, nursing_label, nursing_signals, nursing_keywords,
      retrieved_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,$12,$13,
      $14,$15,$16,$17,
      $18,$19,$20,$21,
      $22
    )
    ON CONFLICT (id) DO UPDATE SET
      state = EXCLUDED.state,
      employer_name = EXCLUDED.employer_name,
      parent_system = EXCLUDED.parent_system,
      city = EXCLUDED.city,
      county = EXCLUDED.county,
      address = EXCLUDED.address,
      notice_date = EXCLUDED.notice_date,
      effective_date = EXCLUDED.effective_date,
      employees_affected = EXCLUDED.employees_affected,
      naics = EXCLUDED.naics,
      reason = EXCLUDED.reason,
      raw_text = EXCLUDED.raw_text,
      source_name = EXCLUDED.source_name,
      source_url = EXCLUDED.source_url,
      source_id = EXCLUDED.source_id,
      attachments = EXCLUDED.attachments,
      nursing_score = EXCLUDED.nursing_score,
      nursing_label = EXCLUDED.nursing_label,
      nursing_signals = EXCLUDED.nursing_signals,
      nursing_keywords = EXCLUDED.nursing_keywords,
      retrieved_at = EXCLUDED.retrieved_at;
  `;

  const params = [
    n.id,
    n.state,
    n.employerName,
    n.parentSystem ?? null,
    n.city ?? null,
    n.county ?? null,
    n.address ?? null,
    n.noticeDate ? new Date(n.noticeDate) : null,
    n.effectiveDate ? new Date(n.effectiveDate) : null,
    n.employeesAffected ?? null,
    n.naics ?? null,
    n.reason ?? null,
    n.rawText ?? null,
    n.source.sourceName,
    n.source.sourceUrl,
    n.source.sourceId ?? null,
    n.attachments ? JSON.stringify(n.attachments) : null,
    nursing ? nursing.score : 0,
    nursing ? nursing.label : 'Unclear',
    nursing ? JSON.stringify(nursing.signals) : JSON.stringify([]),
    nursing ? JSON.stringify(nursing.keywordsFound) : JSON.stringify([]),
    new Date(n.source.retrievedAt)
  ];

  await pool.query(sql, params);
}

async function main(): Promise<void> {
  const adapters = STATES.length
    ? STATES.map(s => getAdapter(s)).filter(isAdapter)
    : getAllAdapters();

  console.log(`Worker starting. Adapters: ${adapters.map(a => a.state).join(', ') || '(none)'}`);

  for (const adapter of adapters) {
    try {
      const res = await adapter.fetchLatest();
      console.log(`${adapter.state}: fetched ${res.notices.length}`);
      for (const n of res.notices) {
        await upsert(n);
      }
    } catch (e: any) {
      console.error(`Adapter ${adapter.state} failed:`, e?.message ?? e);
    }
  }

  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  try { await pool.end(); } catch {}
  process.exit(1);
});
