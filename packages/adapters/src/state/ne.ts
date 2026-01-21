import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

// Nebraska DOL publishes WARN notices at:
// https://dol.nebraska.gov/ReemploymentServices/LayoffServices/LayoffsAndDownsizingWARN
const SOURCE_URL = 'https://dol.nebraska.gov/ReemploymentServices/LayoffServices/LayoffsAndDownsizingWARN';

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
  // Try Month DD, YYYY
  const longMatch = dateStr.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
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

export const NEAdapter: StateAdapter = {
  state: 'NE',
  sourceName: 'Nebraska DOL WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const notices: NormalizedWarnNotice[] = [];

    try {
      const response = await axios.get(SOURCE_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LNI-WARNBot/1.0)'
        }
      });
      const html = response.data as string;
      const $ = cheerio.load(html);

      // Nebraska has a table or list of WARN notices
      // Also has PDF links for individual notices

      // Look for table rows
      $('table tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 2) return;

        const firstCell = $(tds[0]).text().trim();
        if (!firstCell || firstCell.toLowerCase().includes('company') || firstCell.toLowerCase().includes('employer')) {
          return;
        }

        const employerName = firstCell;
        const location = tds.length > 1 ? $(tds[1]).text().trim() : '';
        const empRaw = tds.length > 2 ? $(tds[2]).text().trim() : '';
        const dateRaw = tds.length > 3 ? $(tds[3]).text().trim() : '';

        const cityMatch = location.match(/^([^,]+)/);
        const city = cityMatch ? cityMatch[1].trim() : location || undefined;

        const employeesAffected = empRaw ? Number.parseInt(empRaw.replace(/,/g, ''), 10) : undefined;
        const noticeDate = parseDate(dateRaw);

        const pdfLink = $(tr).find('a[href$=".pdf"]').attr('href');
        const pdfUrl = pdfLink
          ? (pdfLink.startsWith('http') ? pdfLink : `https://dol.nebraska.gov${pdfLink}`)
          : undefined;

        const id = hashId(['NE', employerName, noticeDate || '', city || '']);

        const notice: NormalizedWarnNotice = {
          id,
          state: 'NE',
          employerName,
          city,
          address: location || undefined,
          noticeDate,
          employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
          source: {
            state: 'NE',
            sourceName: 'Nebraska DOL WARN',
            sourceUrl: pdfUrl || SOURCE_URL,
            retrievedAt
          },
          attachments: pdfUrl ? [{
            url: pdfUrl,
            label: 'WARN Notice PDF',
            contentType: 'application/pdf'
          }] : undefined
        };

        notices.push(scoreNursingImpact(notice));
      });

      // Look for PDF links directly (Nebraska often links to PDFs)
      $('a[href*=".pdf"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();

        if (!href.toLowerCase().includes('warn') && !text.toLowerCase().includes('warn')) {
          return;
        }

        // Try to extract company name from link text or filename
        let employerName = text;
        if (!employerName || employerName.toLowerCase() === 'pdf' || employerName.toLowerCase() === 'download') {
          const filenameMatch = href.match(/\/([^/]+)\.pdf$/i);
          if (filenameMatch) {
            employerName = filenameMatch[1]
              .replace(/-/g, ' ')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())
              .trim();
          }
        }

        if (!employerName) return;

        const pdfUrl = href.startsWith('http') ? href : `https://dol.nebraska.gov${href}`;
        const id = hashId(['NE', employerName, pdfUrl]);

        // Skip if this looks like a duplicate
        if (notices.some(n => n.employerName === employerName)) return;

        const notice: NormalizedWarnNotice = {
          id,
          state: 'NE',
          employerName,
          source: {
            state: 'NE',
            sourceName: 'Nebraska DOL WARN',
            sourceUrl: pdfUrl,
            retrievedAt
          },
          attachments: [{
            url: pdfUrl,
            label: 'WARN Notice PDF',
            contentType: 'application/pdf'
          }]
        };

        notices.push(scoreNursingImpact(notice));
      });

      // Look for list items with WARN info
      $('li, .warn-item, .notice-item').each((_, el) => {
        const text = $(el).text().trim();
        if (!text || text.length < 10) return;

        // Try to parse structured text
        // Pattern: "Company Name - City, NE - XX employees - MM/DD/YYYY"
        const structuredMatch = text.match(/^(.+?)\s*[-–]\s*([^-]+?(?:,\s*NE)?)\s*[-–]\s*(\d+)\s*(?:employees?|workers?)/i);
        if (structuredMatch) {
          const [, employerName, location, empStr] = structuredMatch;
          const cityMatch = location.match(/^([^,]+)/);
          const city = cityMatch ? cityMatch[1].trim() : undefined;
          const employeesAffected = Number.parseInt(empStr, 10);

          const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
          const noticeDate = dateMatch ? parseDate(dateMatch[1]) : undefined;

          const id = hashId(['NE', employerName.trim(), noticeDate || '', city || '']);

          // Skip duplicates
          if (notices.some(n => n.id === id)) return;

          const notice: NormalizedWarnNotice = {
            id,
            state: 'NE',
            employerName: employerName.trim(),
            city,
            noticeDate,
            employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
            source: {
              state: 'NE',
              sourceName: 'Nebraska DOL WARN',
              sourceUrl: SOURCE_URL,
              retrievedAt
            }
          };

          notices.push(scoreNursingImpact(notice));
        }
      });
    } catch (err) {
      console.warn('NE adapter: Error fetching data:', (err as Error).message);
    }

    // Deduplicate
    const seen = new Set<string>();
    const deduped = notices.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    return {
      state: 'NE',
      fetchedAt: retrievedAt,
      notices: deduped
    };
  }
};
