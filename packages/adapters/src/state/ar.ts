import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.dws.arkansas.gov/employers/warn/';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'AR',
    sourceName: 'Arkansas WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const ARAdapter: StateAdapter = {
  state: 'AR',
  sourceName: 'Arkansas WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    let notices: NormalizedWarnNotice[] = [];

    try {
      notices = await fetchWarntrackerNotices({
        state: 'AR',
        retrievedAt,
        sourceName: 'WARNTracker (AR)',
        sourceUrl: 'https://www.warntracker.com/?state=AR'
      });
    } catch {
      notices = [];
    }
    const MIN_RESULTS = 10;
    if (notices.length < MIN_RESULTS) {
      try {
        notices = await fetchOfficialNotices(retrievedAt);
      } catch {
        notices = [];
      }
    }
    if (notices.length < MIN_RESULTS) {
      try {
        notices = await fetchLayoffdataNotices({ state: 'AR', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (notices.length < MIN_RESULTS) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'AR', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'AR',
      fetchedAt: retrievedAt,
      notices
    };
  }
};
