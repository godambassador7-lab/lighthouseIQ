import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://labor.vermont.gov/warn';

export const VTAdapter: StateAdapter = {
  state: 'VT',
  sourceName: 'Vermont WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // TODO: Implement official VT parsing; WARNTracker used as fallback data source.
    let notices = await fetchWarntrackerNotices({
      state: 'VT',
      retrievedAt,
      sourceName: 'WARNTracker (VT)',
      sourceUrl: 'https://www.warntracker.com/?state=VT'
    });
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'VT', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'VT',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

