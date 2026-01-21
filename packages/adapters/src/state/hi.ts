import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://labor.hawaii.gov/warn/';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'HI',
    sourceName: 'Hawaii WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const HIAdapter: StateAdapter = {
  state: 'HI',
  sourceName: 'Hawaii WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'HI', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'HI',
          retrievedAt,
          sourceName: 'WARNTracker (HI)',
          sourceUrl: 'https://www.warntracker.com/?state=HI'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'HI', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'HI',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

