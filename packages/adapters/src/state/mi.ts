import axios from 'axios';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Michigan LEO publishes WARN notices in a dynamic listing. Use Jina to render a text version.
const SOURCE_URL = 'https://www.michigan.gov/leo/bureaus-agencies/wd/data-public-notices/warn-notices';
const JINA_URL = `https://r.jina.ai/http://${SOURCE_URL.replace(/^https?:\/\//, '')}`;

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
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  const longMatch = dateStr.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (longMatch) {
    const months: Record<string, string> = {
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12'
    };
    const [, monthName, day, year] = longMatch;
    const month = months[monthName.toLowerCase()];
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }
  return undefined;
}

function extractFirstDate(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}|[A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
  return dateMatch ? parseDate(dateMatch[1]) : undefined;
}

function parseEmployees(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const match = text.match(/(\d{1,6})/);
  return match ? Number.parseInt(match[1], 10) : undefined;
}

function normalizeCity(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, ' ').trim();
  const cityOnly = clean.split(',')[0]?.trim();
  return cityOnly || undefined;
}

export const MIAdapter: StateAdapter = {
  state: 'MI',
  sourceName: 'Michigan LEO WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    try {
      const response = await axios.get(JINA_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
        }
      });
      const text = response.data as string;

      const entryRegex = /\*\s+\[([^\]]+)\]\(([^)]+)\)([\s\S]*?)(?=\n\*\s+\[|\nFollow us|\nCopyright|$)/g;
      let match: RegExpExecArray | null;
      while ((match = entryRegex.exec(text)) !== null) {
        const employerName = match[1].trim();
        const pdfUrl = match[2].trim();
        const body = match[3];

        const actionType = body.match(/Type of company action:\s*([^\n]+)/i)?.[1]?.trim();
        const cityText = body.match(/City:\s*([^\n]+)/i)?.[1]?.trim();
        const countyText = body.match(/County:\s*([^\n]+)/i)?.[1]?.trim();
        const layoffText = body.match(/(?:Layoff date|Layoff dates|Closure date|Commencing date):\s*([^\n]+)/i)?.[1];
        const jobsText = body.match(/Number of jobs impacted:\s*([^\n]+)/i)?.[1];

        const noticeDate = extractFirstDate(layoffText);
        const employeesAffected = parseEmployees(jobsText);
        const city = normalizeCity(cityText);
        const county = countyText?.replace(/\s+/g, ' ').trim() || undefined;

        const id = hashId(['MI', employerName, noticeDate || '', pdfUrl]);

        const notice: NormalizedWarnNotice = {
          id,
          state: 'MI',
          employerName,
          city,
          county,
          noticeDate,
          employeesAffected,
          reason: actionType || undefined,
          rawText: body.replace(/\s+/g, ' ').trim(),
          source: {
            state: 'MI',
            sourceName: 'Michigan LEO WARN',
            sourceUrl: pdfUrl,
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
      console.warn('MI adapter: Error fetching data:', (err as Error).message);
    }

    const seen = new Set<string>();
    const deduped = notices.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return {
      state: 'MI',
      fetchedAt: retrievedAt,
      notices: deduped
    };
  }
};
