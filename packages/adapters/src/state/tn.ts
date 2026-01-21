import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.tn.gov/workforce/employers/layoffs-and-warnings-act.html';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'TN',
    sourceName: 'Tennessee WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const TNAdapter: StateAdapter = {
  state: 'TN',
  sourceName: 'Tennessee WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'TN', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'TN',
          retrievedAt,
          sourceName: 'WARNTracker (TN)',
          sourceUrl: 'https://www.warntracker.com/?state=TN'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'TN', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'TN',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
