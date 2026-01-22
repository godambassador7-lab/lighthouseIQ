import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult } from '@lni/core';
import type { StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.paworkstats.state.pa.us/LayoffData/';

export const PAAdapter: StateAdapter = {
  state: 'PA',
  sourceName: 'Pennsylvania WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // TODO: Implement official PA parsing; WARNTracker + layoffdata used as fallback data sources.
    let notices = await fetchWarntrackerNotices({
      state: 'PA',
      retrievedAt,
      sourceName: 'WARNTracker (PA)',
      sourceUrl: 'https://www.warntracker.com/?state=PA'
    });

    const MIN_RESULTS = 10;
    if (notices.length < MIN_RESULTS) {
      let fallback: typeof notices = [];
      try {
        fallback = await fetchLayoffdataNotices({ state: 'PA', retrievedAt });
      } catch {
        fallback = [];
      }
      if (!fallback.length) {
        try {
          fallback = await fetchUsaTodayNotices({ state: 'PA', retrievedAt });
        } catch {
          fallback = [];
        }
      }
      if (fallback.length > notices.length) {
        notices = fallback;
      }
    }

    return {
      state: 'PA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

