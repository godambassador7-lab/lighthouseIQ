import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://dew.sc.gov/classifications-and-wages/warn-act-notices';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'SC',
    sourceName: 'South Carolina WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const SCAdapter: StateAdapter = {
  state: 'SC',
  sourceName: 'South Carolina WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'SC', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'SC',
          retrievedAt,
          sourceName: 'WARNTracker (SC)',
          sourceUrl: 'https://www.warntracker.com/?state=SC'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'SC', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'SC',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
