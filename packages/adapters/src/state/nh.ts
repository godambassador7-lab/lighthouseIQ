import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.nh.gov/nhes/terms/employers/index.htm#WARN';

export const NHAdapter: StateAdapter = {
  state: 'NH',
  sourceName: 'New Hampshire WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // TODO: Implement official NH parsing; fallback to layoffdata or WARNTracker.
    let notices: NormalizedWarnNotice[] = [];
    try {
      notices = await fetchLayoffdataNotices({ state: 'NH', retrievedAt });
    } catch {
      notices = [];
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'NH',
          retrievedAt,
          sourceName: 'WARNTracker (NH)',
          sourceUrl: 'https://www.warntracker.com/?state=NH'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'NH', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'NH',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

