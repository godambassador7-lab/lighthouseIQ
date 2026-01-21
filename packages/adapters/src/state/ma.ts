import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.mass.gov/orgs/executive-office-of-labor-and-workforce-development#workforce-development-division-notices-';

export const MAAdapter: StateAdapter = {
  state: 'MA',
  sourceName: 'Massachusetts WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // TODO: Implement official MA parsing; fallback to layoffdata or WARNTracker.
    let notices: NormalizedWarnNotice[] = [];
    try {
      notices = await fetchLayoffdataNotices({ state: 'MA', retrievedAt });
    } catch {
      notices = [];
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'MA',
          retrievedAt,
          sourceName: 'WARNTracker (MA)',
          sourceUrl: 'https://www.warntracker.com/?state=MA'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'MA', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'MA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

