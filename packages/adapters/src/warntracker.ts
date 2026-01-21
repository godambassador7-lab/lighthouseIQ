import axios from 'axios';
import * as crypto from 'crypto';
import type { NormalizedWarnNotice, USStateAbbrev } from '@lni/core';
import { scoreNursingImpact } from '@lni/core';

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function mergeNotice(existing: NormalizedWarnNotice, incoming: NormalizedWarnNotice): NormalizedWarnNotice {
  return {
    ...existing,
    employerName: existing.employerName || incoming.employerName,
    city: existing.city || incoming.city,
    county: existing.county || incoming.county,
    address: existing.address || incoming.address,
    noticeDate: existing.noticeDate || incoming.noticeDate,
    effectiveDate: existing.effectiveDate || incoming.effectiveDate,
    employeesAffected: existing.employeesAffected ?? incoming.employeesAffected,
    naics: existing.naics || incoming.naics,
    reason: existing.reason || incoming.reason,
    rawText: existing.rawText || incoming.rawText,
    attachments: existing.attachments || incoming.attachments,
    source: existing.source
  };
}

function stripMarkdownLinks(value: string): string {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}

function parseMarkdownTable(text: string): Array<Record<string, string>> {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 2; i += 1) {
    const header = lines[i];
    const separator = lines[i + 1];
    if (!header.includes('|') || !separator.includes('|')) continue;
    if (!separator.replace(/\s/g, '').includes('---')) continue;

    const headers = header.split('|').slice(1, -1).map(col => col.trim().replace(/\s+0$/, ''));
    const rows: Array<Record<string, string>> = [];

    for (let j = i + 2; j < lines.length; j += 1) {
      const line = lines[j];
      if (!line.includes('|')) break;
      const cells = line.split('|').slice(1, -1).map(cell => stripMarkdownLinks(cell));
      if (cells.length !== headers.length) continue;
      const record: Record<string, string> = {};
      headers.forEach((col, idx) => {
        record[col] = cells[idx];
      });
      rows.push(record);
    }

    if (headers.some(col => /company/i.test(col))) {
      return rows;
    }
  }
  return [];
}

function parseEmployees(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9]/g, '');
  if (!cleaned) return undefined;
  const num = Number.parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : undefined;
}

function parseCityFromLocation(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parts = value.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length < 2) return undefined;
  return parts[parts.length - 2];
}

function parseAddressFromLocation(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parts = value.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length < 3) return undefined;
  return parts.slice(0, parts.length - 2).join(', ');
}

export async function fetchWarntrackerNotices(params: {
  state: USStateAbbrev;
  retrievedAt: string;
  sourceUrl: string;
  sourceName: string;
}): Promise<NormalizedWarnNotice[]> {
  const { state, retrievedAt, sourceUrl, sourceName } = params;
  const jinaUrl = `https://r.jina.ai/http://www.warntracker.com/?state=${state}`;
  const res = await axios.get(jinaUrl, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
    }
  });
  const rows = parseMarkdownTable(res.data as string);
  const noticesById = new Map<string, NormalizedWarnNotice>();

  for (const row of rows) {
    const employerName = row['Company Name'] || row['Company'] || '';
    if (!employerName) continue;

    const noticeDate = row['Notice Date']?.trim() || undefined;
    const effectiveDate = row['Layoff date']?.trim() || undefined;
    const employeesAffected = parseEmployees(row['# Laid off']);
    const location = row['City/Jurisdiction'] || row['City'] || row['Location'];
    const city = parseCityFromLocation(location);
    const address = parseAddressFromLocation(location);

    const id = hashId([state, employerName, noticeDate || '', city || '', address || '']);

    const notice: NormalizedWarnNotice = {
      id,
      state,
      employerName,
      city,
      address,
      noticeDate,
      effectiveDate,
      employeesAffected,
      source: {
        state,
        sourceName,
        sourceUrl,
        retrievedAt
      },
      rawText: location?.trim() || undefined
    };

    const scored = scoreNursingImpact(notice);
    const existing = noticesById.get(scored.id);
    noticesById.set(scored.id, existing ? mergeNotice(existing, scored) : scored);
  }

  return Array.from(noticesById.values());
}
