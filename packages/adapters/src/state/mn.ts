import axios from 'axios';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Minnesota DEED publishes WARN reports as monthly PDFs. We discover them via mn.gov portal search JSON.
const SOURCE_URL = 'https://mn.gov/deed/programs-services/dislocated-worker-program/reports/';
const SEARCH_URL = 'https://mn.gov/portal/search/json.jsp?query=plant%20closing%20mass%20layoff%20warn%20report';

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  // Try MM/DD/YYYY
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Try YYYY-MM-DD
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  return undefined;
}

function normalizeDateToken(value: string): string {
  return value.replace(/\s*/g, '').replace(/\/{2,}/g, '/');
}

function extractPdfLinks(payload: unknown): string[] {
  const links: string[] = [];
  if (!payload || typeof payload !== 'object') return links;
  const list = (payload as { list?: Array<{ document?: { url?: string } }> }).list || [];
  for (const entry of list) {
    const url = entry.document?.url || '';
    if (!url) continue;
    if (url.includes('/plant-closing-mass-layoff-warn') && url.endsWith('.pdf')) {
      links.push(url);
    }
  }
  return Array.from(new Set(links));
}

function parseEmployees(text: string): number | undefined {
  const matches = Array.from(text.matchAll(/(\d{1,3}(?:,\d{3})*|\d+)/g))
    .map(match => Number.parseInt(match[1].replace(/,/g, ''), 10))
    .filter(value => Number.isFinite(value));
  if (matches.length === 0) return undefined;
  return matches[matches.length - 1];
}

function parseReportLine(line: string): {
  employerName: string;
  noticeDate?: string;
  effectiveDate?: string;
  employeesAffected?: number;
  rawText?: string;
} | null {
  const normalized = line.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  if (/^rr start date|^grand totals|^layoff name/i.test(normalized)) return null;

  const dateMatches = normalized.match(/\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{2,4}/g);
  if (!dateMatches || dateMatches.length === 0) return null;

  const firstDate = parseDate(normalizeDateToken(dateMatches[0]));
  const secondDate = dateMatches[1] ? parseDate(normalizeDateToken(dateMatches[1])) : undefined;

  const before = normalized.split(dateMatches[0])[0].trim();
  if (!before) return null;

  return {
    employerName: before,
    noticeDate: firstDate,
    effectiveDate: secondDate,
    employeesAffected: parseEmployees(normalized),
    rawText: normalized
  };
}

export const MNAdapter: StateAdapter = {
  state: 'MN',
  sourceName: 'Minnesota DEED WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    try {
      const response = await axios.get(SEARCH_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
        }
      });
      const payload = response.data as unknown;
      const pdfLinks = extractPdfLinks(payload).slice(0, 6);

      for (const pdfUrl of pdfLinks) {
        try {
          const jinaUrl = `https://r.jina.ai/http://${pdfUrl.replace(/^https?:\/\//, '')}`;
          const pdfResponse = await axios.get(jinaUrl, {
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
            }
          });
          const text = pdfResponse.data as string;
          const lines = text.split('\n');

          for (const line of lines) {
            const parsed = parseReportLine(line);
            if (!parsed) continue;

            const id = hashId(['MN', parsed.employerName, parsed.noticeDate || '', pdfUrl]);
            const notice: NormalizedWarnNotice = {
              id,
              state: 'MN',
              employerName: parsed.employerName,
              noticeDate: parsed.noticeDate,
              effectiveDate: parsed.effectiveDate,
              employeesAffected: parsed.employeesAffected,
              rawText: parsed.rawText,
              source: {
                state: 'MN',
                sourceName: 'Minnesota DEED WARN',
                sourceUrl: pdfUrl,
                retrievedAt
              },
              attachments: [{
                url: pdfUrl,
                label: 'WARN Report PDF',
                contentType: 'application/pdf'
              }]
            };

            notices.push(scoreNursingImpact(notice));
          }
        } catch (err) {
          console.warn('MN adapter: Failed to parse report:', pdfUrl, (err as Error).message);
        }
      }
    } catch (err) {
      console.warn('MN adapter: Error fetching search data:', (err as Error).message);
    }

    // Deduplicate
    const seen = new Set<string>();
    const deduped = notices.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return {
      state: 'MN',
      fetchedAt: retrievedAt,
      notices: deduped
    };
  }
};
