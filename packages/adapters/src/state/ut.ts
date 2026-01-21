import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://jobs.utah.gov/employer/layoffs/warn.html';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'UT',
    sourceName: 'Utah WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const UTAdapter: StateAdapter = {
  state: 'UT',
  sourceName: 'Utah WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'UT', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'UT',
          retrievedAt,
          sourceName: 'WARNTracker (UT)',
          sourceUrl: 'https://www.warntracker.com/?state=UT'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'UT', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'UT',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

