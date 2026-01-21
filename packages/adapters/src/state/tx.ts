import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.twc.texas.gov/businesses/warn-notices';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'TX',
    sourceName: 'Texas WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const TXAdapter: StateAdapter = {
  state: 'TX',
  sourceName: 'Texas WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'TX', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'TX',
          retrievedAt,
          sourceName: 'WARNTracker (TX)',
          sourceUrl: 'https://www.warntracker.com/?state=TX'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'TX', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'TX',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
