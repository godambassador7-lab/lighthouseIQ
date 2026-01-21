import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.dllr.state.md.us/employment/warn.shtml';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'MD',
    sourceName: 'Maryland WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const MDAdapter: StateAdapter = {
  state: 'MD',
  sourceName: 'Maryland WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'MD', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'MD',
          retrievedAt,
          sourceName: 'WARNTracker (MD)',
          sourceUrl: 'https://www.warntracker.com/?state=MD'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'MD', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'MD',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
