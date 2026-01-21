import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.maine.gov/labor/legal/warn/';

export const MEAdapter: StateAdapter = {
  state: 'ME',
  sourceName: 'Maine WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // TODO: Implement official ME parsing; fallback to layoffdata or WARNTracker.
    let notices: NormalizedWarnNotice[] = [];
    try {
      notices = await fetchLayoffdataNotices({ state: 'ME', retrievedAt });
    } catch {
      notices = [];
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'ME',
          retrievedAt,
          sourceName: 'WARNTracker (ME)',
          sourceUrl: 'https://www.warntracker.com/?state=ME'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'ME', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'ME',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

