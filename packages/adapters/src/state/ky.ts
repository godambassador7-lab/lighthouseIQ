import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://kcc.ky.gov/labor/Pages/WARN-Notices.aspx';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'KY',
    sourceName: 'Kentucky WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const KYAdapter: StateAdapter = {
  state: 'KY',
  sourceName: 'Kentucky WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'KY', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'KY',
          retrievedAt,
          sourceName: 'WARNTracker (KY)',
          sourceUrl: 'https://www.warntracker.com/?state=KY'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'KY', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'KY',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
