import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://does.dc.gov/service/warn-notices';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'DC',
    sourceName: 'District of Columbia WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const DCAdapter: StateAdapter = {
  state: 'DC',
  sourceName: 'District of Columbia WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'DC', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'DC',
          retrievedAt,
          sourceName: 'WARNTracker (DC)',
          sourceUrl: 'https://www.warntracker.com/?state=DC'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'DC', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'DC',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
