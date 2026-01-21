import axios from 'axios';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://labor.delaware.gov/divisions/employment-training/employer-services/';

export const DEAdapter: StateAdapter = {
  state: 'DE',
  sourceName: 'Delaware WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // Scaffold: replace SOURCE_URL and implement parsing.
    if (SOURCE_URL && !SOURCE_URL.startsWith('TODO')) {
      await axios.get(SOURCE_URL);
    }

    const notices: NormalizedWarnNotice[] = [];

    return {
      state: 'DE',
      fetchedAt: retrievedAt,
      notices: notices.map(scoreNursingImpact)
    };
  }
};
