import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://www.warntracker.com/?state=PR';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'PR',
    sourceName: 'Puerto Rico WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const PRAdapter: StateAdapter = {
  state: 'PR',
  sourceName: 'Puerto Rico WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();
    let notices: NormalizedWarnNotice[] = [];

    // TODO: Replace SOURCE_URL with the official PR WARN listing when available.
    try {
      notices = await fetchOfficialNotices(retrievedAt);
    } catch {
      notices = [];
    }
    if (!notices.length) {
      try {
        notices = await fetchLayoffdataNotices({ state: 'PR', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'PR',
          retrievedAt,
          sourceName: 'WARNTracker (PR)',
          sourceUrl: 'https://www.warntracker.com/?state=PR'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'PR', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'PR',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

