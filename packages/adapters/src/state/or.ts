import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.qualityinfo.org/labor-market-information/warn';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'OR',
    sourceName: 'Oregon WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const ORAdapter: StateAdapter = {
  state: 'OR',
  sourceName: 'Oregon WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'OR', retrievedAt });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'OR',
          retrievedAt,
          sourceName: 'WARNTracker (OR)',
          sourceUrl: 'https://www.warntracker.com/?state=OR'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'OR', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'OR',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

