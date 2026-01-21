import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://oklahoma.gov/okcommerce/employment-services/workforce-information/warn-notices.html';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'OK',
    sourceName: 'Oklahoma WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const OKAdapter: StateAdapter = {
  state: 'OK',
  sourceName: 'Oklahoma WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'OK', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'OK',
          retrievedAt,
          sourceName: 'WARNTracker (OK)',
          sourceUrl: 'https://www.warntracker.com/?state=OK'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'OK', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'OK',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
