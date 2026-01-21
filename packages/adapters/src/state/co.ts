import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://cdle.colorado.gov/warn/public-warn';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'CO',
    sourceName: 'Colorado WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const COAdapter: StateAdapter = {
  state: 'CO',
  sourceName: 'Colorado WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'CO', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'CO',
          retrievedAt,
          sourceName: 'WARNTracker (CO)',
          sourceUrl: 'https://www.warntracker.com/?state=CO'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'CO', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'CO',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

