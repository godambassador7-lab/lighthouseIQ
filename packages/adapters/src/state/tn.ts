import axios from 'axios';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://stateoftennessee.formstack.com/forms/warn_notice_information';

export const TNAdapter: StateAdapter = {
  state: 'TN',
  sourceName: 'Tennessee WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // Scaffold: replace SOURCE_URL and implement parsing.
    if (SOURCE_URL && !SOURCE_URL.startsWith('TODO')) {
      await axios.get(SOURCE_URL);
    }

    const notices: NormalizedWarnNotice[] = [];

    return {
      state: 'TN',
      fetchedAt: retrievedAt,
      notices: notices.map(scoreNursingImpact)
    };
  }
};
