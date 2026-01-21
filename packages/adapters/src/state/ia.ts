import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { scoreNursingImpact } from '@lni/core';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.iowaworkforcedevelopment.gov/employers/resources/warn/notices';
const CSV_URL = 'https://public.tableau.com/views/IowaWARNNotifications/WARNNotices.csv?:showVizHome=no';

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

export const IAAdapter: StateAdapter = {
  state: 'IA',
  sourceName: 'Iowa WARN (Tableau)',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    let notices: NormalizedWarnNotice[] = [];

    try {
      const csvText = (await axios.get(CSV_URL)).data as string;
      const rows = parse(csvText, { columns: true, skip_empty_lines: true });
      notices = rows.map((row: any) => {
        const employerName = String(row['Company'] ?? '').trim();
        const city = String(row['City'] ?? '').trim() || undefined;
        const address = String(row['Address'] ?? '').trim() || undefined;
        const employeesAffected = Number.parseInt(String(row['Number of Employees Affected'] ?? ''), 10);
        const effectiveDate = toIsoDate(String(row['Layoff Date'] ?? '').trim());

        const notice: NormalizedWarnNotice = {
          id: `IA:${employerName}:${city ?? 'NA'}:${effectiveDate ?? retrievedAt.slice(0, 10)}`,
          state: 'IA',
          employerName,
          city,
          address,
          employeesAffected: Number.isFinite(employeesAffected) ? employeesAffected : undefined,
          effectiveDate,
          source: {
            state: 'IA',
            sourceName: 'Iowa WARN (Tableau)',
            sourceUrl: SOURCE_URL,
            retrievedAt
          },
          rawText: address ? `Address: ${address}` : undefined
        };

        return scoreNursingImpact(notice);
      });
    } catch {
      notices = [];
    }

    const MIN_RESULTS = 5;
    if (notices.length < MIN_RESULTS) {
      let fallback: NormalizedWarnNotice[] = [];
      try {
        fallback = await fetchLayoffdataNotices({ state: 'IA', retrievedAt });
      } catch {
        fallback = [];
      }
      if (!fallback.length) {
        try {
          fallback = await fetchWarntrackerNotices({
            state: 'IA',
            retrievedAt,
            sourceName: 'WARNTracker (IA)',
            sourceUrl: 'https://www.warntracker.com/?state=IA'
          });
        } catch {
          fallback = [];
        }
      }
      if (!fallback.length) {
        try {
          fallback = await fetchUsaTodayNotices({ state: 'IA', retrievedAt });
        } catch {
          fallback = [];
        }
      }
      if (fallback.length > notices.length) {
        notices = fallback;
      }
    }

    return {
      state: 'IA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
