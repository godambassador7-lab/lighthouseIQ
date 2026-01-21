import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://labor.idaho.gov/dnn/idl/IdahoWARN.aspx';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'ID',
    sourceName: 'Idaho WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const IDAdapter: StateAdapter = {
  state: 'ID',
  sourceName: 'Idaho WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'ID', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'ID',
          retrievedAt,
          sourceName: 'WARNTracker (ID)',
          sourceUrl: 'https://www.warntracker.com/?state=ID'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'ID', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'ID',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

