import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://labor.alabama.gov/layoff-services/warn-notices';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'AL',
    sourceName: 'Alabama WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const ALAdapter: StateAdapter = {
  state: 'AL',
  sourceName: 'Alabama WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'AL', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'AL',
          retrievedAt,
          sourceName: 'WARNTracker (AL)',
          sourceUrl: 'https://www.warntracker.com/?state=AL'
        });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'AL', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'AL',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
