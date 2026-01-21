import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://wyomingworkforce.org/labor-market-information/warn/';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'WY',
    sourceName: 'Wyoming WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const WYAdapter: StateAdapter = {
  state: 'WY',
  sourceName: 'Wyoming WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'WY', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'WY',
          retrievedAt,
          sourceName: 'WARNTracker (WY)',
          sourceUrl: 'https://www.warntracker.com/?state=WY'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'WY', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'WY',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

