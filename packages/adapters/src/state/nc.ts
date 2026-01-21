import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.nccommerce.com/data-tools-reports/labor-market-information/warn-notices';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'NC',
    sourceName: 'North Carolina WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const NCAdapter: StateAdapter = {
  state: 'NC',
  sourceName: 'North Carolina WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    let notices: NormalizedWarnNotice[] = [];

    try {
      notices = await fetchOfficialNotices(retrievedAt);
    } catch {
      notices = [];
    }
    if (!notices.length) {
      try {
        notices = await fetchLayoffdataNotices({ state: 'NC', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'NC',
          retrievedAt,
          sourceName: 'WARNTracker (NC)',
          sourceUrl: 'https://www.warntracker.com/?state=NC'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'NC', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'NC',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
