import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.warntracker.com/?state=GA';

export const GAAdapter: StateAdapter = {
  state: 'GA',
  sourceName: 'WARNTracker (Georgia)',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    let notices: NormalizedWarnNotice[] = [];

    try {
      notices = await fetchWarntrackerNotices({
        state: 'GA',
        retrievedAt,
        sourceName: 'WARNTracker (GA)',
        sourceUrl: SOURCE_URL
      });
    } catch {
      notices = [];
    }

    const MIN_RESULTS = 10;
    if (notices.length < MIN_RESULTS) {
      let fallback: NormalizedWarnNotice[] = [];
      try {
        fallback = await fetchLayoffdataNotices({ state: 'GA', retrievedAt });
      } catch {
        fallback = [];
      }
      if (!fallback.length) {
        try {
          fallback = await fetchUsaTodayNotices({ state: 'GA', retrievedAt });
        } catch {
          fallback = [];
        }
      }
      if (fallback.length > notices.length) {
        notices = fallback;
      }
    }

    return {
      state: 'GA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
