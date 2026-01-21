import axios from 'axios';
import { scoreNursingImpact } from '@lni/core';
import type { AdapterFetchResult, NormalizedWarnNotice, StateAdapter } from '@lni/core';

const SOURCE_URL = 'https://dol.ny.gov/warn-notices';

export const NYAdapter: StateAdapter = {
  state: 'NY',
  sourceName: 'NY DOL WARN',
  sourceUrl: SOURCE_URL,
  fetchLatest: async (): Promise<AdapterFetchResult> => {
    const retrievedAt = new Date().toISOString();

    // Scaffold: fetch the page so you can later parse it or replace with a JSON endpoint.
    // Many state dashboards have a JSON URL you can capture from browser DevTools.
    await axios.get(SOURCE_URL);

    const notices: NormalizedWarnNotice[] = [];
    // TODO: Implement NY parsing.

    return {
      state: 'NY',
      fetchedAt: retrievedAt,
      notices: notices.map(scoreNursingImpact)
    };
  }
};
