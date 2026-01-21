import axios from 'axios';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Job Service North Dakota publishes a PDF log of WARN notices (2015 - current).
const SOURCE_URL = 'https://www.jobsnd.com/sites/www/files/documents/jsnd-documents/WARN%20Notices%202015%20to%20present.pdf';
const JINA_URL = `https://r.jina.ai/http://${SOURCE_URL.replace(/^https?:\/\//, '')}`;

function hashId(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function parseDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return undefined;
}

function pickLastNumber(text: string): number | undefined {
  const matches = Array.from(text.matchAll(/(\d{1,3}(?:,\d{3})*|\d+)\+?/g))
    .map(match => match[1].replace(/,/g, ''))
    .map(value => Number.parseInt(value, 10))
    .filter(value => Number.isFinite(value));
  if (matches.length === 0) return undefined;
  return matches[matches.length - 1];
}

function extractLocation(leftText: string): { employerName: string; location?: string; notes?: string } {
  const trimmed = leftText.trim();
  const stateMatch = trimmed.match(/^(.*)\s+([A-Za-z0-9&.'()\/-]+(?:\s+[A-Za-z0-9&.'()\/-]+)*,\s*[A-Z]{2})(.*)$/);
  if (stateMatch) {
    const employerName = stateMatch[1].trim();
    const location = stateMatch[2].trim();
    const notes = stateMatch[3].trim() || undefined;
    return { employerName, location, notes };
  }

  const keywordLocations = ['Nationwide', 'Multiple sites', 'Remote'];
  for (const keyword of keywordLocations) {
    const index = trimmed.indexOf(keyword);
    if (index > 0) {
      const employerName = trimmed.slice(0, index).trim();
      const location = trimmed.slice(index).trim();
      return { employerName, location };
    }
  }

  return { employerName: trimmed };
}

function parseLine(line: string): {
  employerName: string;
  location?: string;
  noticeDate?: string;
  effectiveDate?: string;
  employeesAffected?: number;
  notes?: string;
} | null {
  const normalized = line.replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.toLowerCase().startsWith('company name')) return null;

  const dateMatches = normalized.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || [];
  if (dateMatches.length === 0) return null;

  const noticeDate = parseDate(dateMatches[0]);
  const effectiveDate = dateMatches[1] ? parseDate(dateMatches[1]) : undefined;

  const withoutDates = normalized.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '').replace(/\s+/g, ' ').trim();
  const employeesAffected = pickLastNumber(withoutDates);
  const withoutNumbers = employeesAffected !== undefined
    ? withoutDates.replace(/(\d{1,3}(?:,\d{3})*|\d+)\+?(?!.*(\d{1,3}(?:,\d{3})*|\d+)\+?)/, '').trim()
    : withoutDates;

  const locationParts = extractLocation(withoutNumbers);

  return {
    employerName: locationParts.employerName || normalized,
    location: locationParts.location,
    noticeDate,
    effectiveDate,
    employeesAffected,
    notes: locationParts.notes
  };
}

export const NDAdapter: StateAdapter = {
  state: 'ND',
  sourceName: 'Job Service North Dakota WARN',
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
      const lines = text.split('\n');

      for (const line of lines) {
        const parsed = parseLine(line);
        if (!parsed || !parsed.employerName) continue;

        const location = parsed.location?.replace(/\s+/g, ' ').trim();
        const city = location?.includes(',')
          ? location.split(',')[0].trim()
          : location;

        const id = hashId(['ND', parsed.employerName, parsed.noticeDate || '', parsed.effectiveDate || '']);
        const notice: NormalizedWarnNotice = {
          id,
          state: 'ND',
          employerName: parsed.employerName,
          city: city || undefined,
          address: location || undefined,
          noticeDate: parsed.noticeDate,
          effectiveDate: parsed.effectiveDate,
          employeesAffected: parsed.employeesAffected,
          rawText: parsed.notes ? `${parsed.notes}` : undefined,
          source: {
            state: 'ND',
            sourceName: 'Job Service North Dakota WARN',
            sourceUrl: SOURCE_URL,
            retrievedAt
          },
          attachments: [{
            url: SOURCE_URL,
            label: 'WARN Notices PDF',
            contentType: 'application/pdf'
          }]
        };

        notices.push(scoreNursingImpact(notice));
      }
    } catch (err) {
      console.warn('ND adapter: Error fetching data:', (err as Error).message);
    }

    const seen = new Set<string>();
    const deduped = notices.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return {
      state: 'ND',
      fetchedAt: retrievedAt,
      notices: deduped
    };
  }
};
