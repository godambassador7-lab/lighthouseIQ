import axios from 'axios';
import * as cheerio from 'cheerio';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://dlr.sd.gov/workforce_services/businesses/warn_notices.aspx';

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

export const SDAdapter: StateAdapter = {
  state: 'SD',
  sourceName: 'South Dakota WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    const html = (await axios.get(SOURCE_URL)).data as string;
    const $ = cheerio.load(html);

    const notices: NormalizedWarnNotice[] = [];

    $('table tr').each((idx, tr) => {
      const cells = $(tr).find('td');
      if (!cells.length) return;

      const employerName = $(cells[0]).text().trim();
      const location = $(cells[1]).text().trim();
      const noticeDateRaw = $(cells[2]).text().trim();
      const employeesAffectedRaw = $(cells[3]).text().trim();

      const employeesAffected = Number.parseInt(employeesAffectedRaw.replace(/[^\d]/g, ''), 10);
      const noticeDate = toIsoDate(noticeDateRaw);

      if (!employerName) return;

      const notice: NormalizedWarnNotice = {
        id: `SD:${employerName}:${noticeDate ?? retrievedAt.slice(0, 10)}`,
        state: 'SD',
        employerName,
        city: location || undefined,
        noticeDate,
        employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
        source: {
          state: 'SD',
          sourceName: 'South Dakota WARN',
          sourceUrl: SOURCE_URL,
          retrievedAt
        }
      };

      notices.push(scoreNursingImpact(notice));
    });

    return {
      state: 'SD',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
