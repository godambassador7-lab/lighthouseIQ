import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.paworkstats.state.pa.us/LayoffData/';

export const PAAdapter: StateAdapter = {
  state: 'PA',
  sourceName: 'Pennsylvania WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // TODO: Implement official PA parsing; WARNTracker used as fallback data source.
    let notices = await fetchWarntrackerNotices({
      state: 'PA',
      retrievedAt,
      sourceName: 'WARNTracker (PA)',
      sourceUrl: 'https://www.warntracker.com/?state=PA'
    });
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'PA', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'PA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

