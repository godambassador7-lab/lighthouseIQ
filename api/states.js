import { getNotices, filterNotices } from './_lib/data.js';

export default function handler(req, res) {
  const notices = filterNotices(getNotices(), req.query || {});
  const counts = new Map();

  for (const n of notices) {
    const state = String(n.state || '').toUpperCase();
    if (!state) continue;
    counts.set(state, (counts.get(state) || 0) + 1);
  }

  const states = Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => a.state.localeCompare(b.state));

  res.status(200).json({
    states,
    cached: true,
    mode: 'vercel-serverless'
  });
}
