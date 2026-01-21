import axios from 'axios';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Ohio WARN notices are published in HTML tables; use Jina to render to text with a JSON data block.
const SOURCE_URL = 'https://jfs.ohio.gov/job-services-and-unemployment/job-services/job-programs-and-services/submit-a-warn-notice/current-public-notices-of-layoffs-and-closures-sa';
const YEAR_URLS = [
  SOURCE_URL,
  'https://jfs.ohio.gov/job-services-and-unemployment/job-services/job-programs-and-services/submit-a-warn-notice/2025-Public-Notice-of-Layoffs-and-Closures',
  'https://jfs.ohio.gov/job-services-and-unemployment/job-services/job-programs-and-services/submit-a-warn-notice/2024-public-notices-of-layoffs-and-closures/2024-public-notices-of-layoffs-and-closures'
];

function toJinaUrl(url: string): string {
  return `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
}

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return undefined;
}

function extractFirstDate(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  return dateMatch ? parseDate(dateMatch[1]) : undefined;
}

function parseEmployees(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const match = text.match(/(\d{1,6})/);
  return match ? Number.parseInt(match[1], 10) : undefined;
}

function extractJsonTable(text: string): string | null {
  const jsonMatch = text.match(/\{"data":\[[\s\S]*?\],"errors":\[\],"meta":\{[\s\S]*?\}\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

function parseTableData(text: string): Array<Record<string, string>> {
  const json = extractJsonTable(text);
  if (!json) return [];

  try {
    const parsed = JSON.parse(json) as { data: string[][] };
    const rows = parsed.data || [];
    const headerIndex = rows.findIndex(row =>
      row.some(cell => String(cell).trim().toLowerCase() === 'company') &&
      row.some(cell => String(cell).trim().toLowerCase().includes('date received'))
    );
    if (headerIndex === -1) return [];

    const header = rows[headerIndex].map(cell => String(cell).trim());
    const normalized: Array<Record<string, string>> = [];

    for (let i = headerIndex + 1; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const employerName = String(row[0] ?? '').trim();
      if (!employerName) continue;

      const record: Record<string, string> = {};
      for (let j = 0; j < header.length; j += 1) {
        record[header[j]] = String(row[j] ?? '').trim();
      }
      normalized.push(record);
    }

    return normalized;
  } catch (err) {
    console.warn('OH adapter: Failed to parse JSON table:', (err as Error).message);
    return [];
  }
}

export const OHAdapter: StateAdapter = {
  state: 'OH',
  sourceName: 'Ohio JFS WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    for (const url of YEAR_URLS) {
      try {
        const response = await axios.get(toJinaUrl(url), {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
          }
        });
        const text = response.data as string;
        const rows = parseTableData(text);

        for (const row of rows) {
          const employerName = row.Company || row['Company '] || '';
          if (!employerName) continue;

          const noticeDate = parseDate(row['Date Received'] || row['Date Received '] || '');
          const layoffDate = extractFirstDate(row['Layoff Date(s)'] || row['Layoff Date(s) '] || '');
          const employeesAffected = parseEmployees(row['Potential Number Affected'] || row['Potential Number Affected '] || '');

          const cityCounty = row['City/County'] || row['City/County '] || '';
          const [cityRaw, countyRaw] = cityCounty.split('/');
          const city = cityRaw ? cityRaw.trim() : undefined;
          const county = countyRaw ? countyRaw.trim() : undefined;

          const pdfUrl = row.URL || row.Url || '';
          const id = hashId(['OH', employerName, noticeDate || '', pdfUrl || '']);

          const notice: NormalizedWarnNotice = {
            id,
            state: 'OH',
            employerName,
            city,
            county,
            noticeDate,
            effectiveDate: layoffDate,
            employeesAffected,
            source: {
              state: 'OH',
              sourceName: 'Ohio JFS WARN',
              sourceUrl: pdfUrl || url,
              retrievedAt
            },
            attachments: pdfUrl ? [{
              url: pdfUrl,
              label: 'WARN Notice PDF',
              contentType: 'application/pdf'
            }] : undefined
          };

          notices.push(scoreNursingImpact(notice));
        }
      } catch (err) {
        console.warn(`OH adapter: Error fetching ${url}:`, (err as Error).message);
      }
    }

    const seen = new Set<string>();
    const deduped = notices.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return {
      state: 'OH',
      fetchedAt: retrievedAt,
      notices: deduped
    };
  }
};
