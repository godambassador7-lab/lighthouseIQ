import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://labor.delaware.gov/divisions/employment-development/warn/';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'DE',
    sourceName: 'Delaware WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const DEAdapter: StateAdapter = {
  state: 'DE',
  sourceName: 'Delaware WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'DE', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'DE',
          retrievedAt,
          sourceName: 'WARNTracker (DE)',
          sourceUrl: 'https://www.warntracker.com/?state=DE'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'DE', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'DE',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
