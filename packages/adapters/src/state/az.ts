import { fetchHtmlTableNotices } from '../html-table.js';
import { fetchLayoffdataNotices } from '../layoffdata.js';
import { fetchWarntrackerNotices } from '../warntracker.js';
import { fetchUsaTodayNotices } from '../usatoday.js';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://des.az.gov/services/employment-and-workforce/development-services/employers/warn-layoff-notices';

async function fetchOfficialNotices(retrievedAt: string): Promise<NormalizedWarnNotice[]> {
  return fetchHtmlTableNotices(SOURCE_URL, {
    state: 'AZ',
    sourceName: 'Arizona WARN',
    sourceUrl: SOURCE_URL,
    retrievedAt
  });
}

export const AZAdapter: StateAdapter = {
  state: 'AZ',
  sourceName: 'Arizona WARN',
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
        notices = await fetchLayoffdataNotices({ state: 'AZ', retrievedAt });
      } catch {
        notices = [];
      }
    }
    if (!notices.length) {
      try {
        notices = await fetchWarntrackerNotices({
          state: 'AZ',
          retrievedAt,
          sourceName: 'WARNTracker (AZ)',
          sourceUrl: 'https://www.warntracker.com/?state=AZ'
        });
      } catch {
        notices = [];
      }
    }

    if (!notices.length) {
      try {
        notices = await fetchUsaTodayNotices({ state: 'AZ', retrievedAt });
      } catch {
        notices = [];
      }
    }

    return {
      state: 'AZ',
      fetchedAt: retrievedAt,
      notices
    };
  }
};

