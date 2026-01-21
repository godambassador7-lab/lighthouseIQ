import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://labor.alaska.gov/lss/warn.htm';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'AK',
    sourceName: 'Alaska WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const AKAdapter: StateAdapter = {
  state: 'AK',
  sourceName: 'Alaska WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'AK', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'AK',
          retrievedAt,
          sourceName: 'WARNTracker (AK)',
          sourceUrl: 'https://www.warntracker.com/?state=AK'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'AK', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'AK',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

