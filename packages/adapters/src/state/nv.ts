import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.nevadaworkforce.com/warn';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'NV',
    sourceName: 'Nevada WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const NVAdapter: StateAdapter = {
  state: 'NV',
  sourceName: 'Nevada WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'NV', retrievedAt });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'NV',
          retrievedAt,
          sourceName: 'WARNTracker (NV)',
          sourceUrl: 'https://www.warntracker.com/?state=NV'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'NV', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'NV',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

