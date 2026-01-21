import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://dol.ny.gov/layoff-services/warn-notices';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'NY',
    sourceName: 'New York WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const NYAdapter: StateAdapter = {
  state: 'NY',
  sourceName: 'NY DOL WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'NY', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'NY',
          retrievedAt,
          sourceName: 'WARNTracker (NY)',
          sourceUrl: 'https://www.warntracker.com/?state=NY'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'NY', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'NY',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
