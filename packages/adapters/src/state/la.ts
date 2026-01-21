import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.laworks.net/Downloads/Misc/WARNNotices.aspx';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'LA',
    sourceName: 'Louisiana WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const LAAdapter: StateAdapter = {
  state: 'LA',
  sourceName: 'Louisiana WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'LA', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'LA',
          retrievedAt,
          sourceName: 'WARNTracker (LA)',
          sourceUrl: 'https://www.warntracker.com/?state=LA'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'LA', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'LA',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
