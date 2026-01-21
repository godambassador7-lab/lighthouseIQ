import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.dws.state.nm.us/en/Employers/Business-Services/WARN';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'NM',
    sourceName: 'New Mexico WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const NMAdapter: StateAdapter = {
  state: 'NM',
  sourceName: 'New Mexico WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'NM', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'NM',
          retrievedAt,
          sourceName: 'WARNTracker (NM)',
          sourceUrl: 'https://www.warntracker.com/?state=NM'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'NM', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'NM',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

