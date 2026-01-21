import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://mdes.ms.gov/employers/warn-notices/';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'MS',
    sourceName: 'Mississippi WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const MSAdapter: StateAdapter = {
  state: 'MS',
  sourceName: 'Mississippi WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'MS', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'MS',
          retrievedAt,
          sourceName: 'WARNTracker (MS)',
          sourceUrl: 'https://www.warntracker.com/?state=MS'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'MS', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'MS',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
