import { getNotices, isHealthcareNotice } from '../_lib/data.js';

export default function handler(_req, res) {
  const geo = new Map();
  for (const n of getNotices().filter(isHealthcareNotice)) {
    const state = String(n.state || '').toUpperCase();
    if (!state) continue;
    const city = n.city || null;
    const key = `${state}:${city || 'unknown'}`;
    const row = geo.get(key) || { state, city, total_notices: 0 };
    row.total_notices += 1;
    geo.set(key, row);
  }

  const locations = Array.from(geo.values()).map((r) => ({
    ...r,
    notices_last_90_days: r.total_notices,
    risk_level: r.total_notices >= 10 ? 'high' : r.total_notices >= 4 ? 'medium' : 'low'
  }));

  res.status(200).json({ locations, count: locations.length });
}

