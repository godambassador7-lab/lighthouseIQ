import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://dli.mt.gov/labor-market-information/warn';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'MT',
    sourceName: 'Montana WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const MTAdapter: StateAdapter = {
  state: 'MT',
  sourceName: 'Montana WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'MT', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'MT',
          retrievedAt,
          sourceName: 'WARNTracker (MT)',
          sourceUrl: 'https://www.warntracker.com/?state=MT'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'MT', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'MT',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

