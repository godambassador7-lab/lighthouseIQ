import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://workforcewv.org/lmi/warn/';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'WV',
    sourceName: 'West Virginia WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const WVAdapter: StateAdapter = {
  state: 'WV',
  sourceName: 'West Virginia WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'WV', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'WV',
          retrievedAt,
          sourceName: 'WARNTracker (WV)',
          sourceUrl: 'https://www.warntracker.com/?state=WV'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'WV', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'WV',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
