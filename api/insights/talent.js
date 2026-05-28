import { getNotices, isHealthcareNotice } from '../_lib/data.js';

export default function handler(_req, res) {
  const byLocation = new Map();
  for (const n of getNotices().filter(isHealthcareNotice)) {
    const state = String(n.state || '').toUpperCase();
    if (!state) continue;
    const city = n.city || null;
    const key = `${state}:${city || 'unknown'}`;
    const row = byLocation.get(key) || {
      state,
      city,
      estimated_nurses_available: 0,
      specialties: [],
      notices_count: 0
    };
    const affected = Number(n.employees_affected ?? n.employeesAffected ?? 0);
    const score = Number(n.nursing_score ?? n.nursingImpact?.score ?? 0);
    row.estimated_nurses_available += Math.max(0, Math.round(affected * Math.max(0.1, score / 100) * 0.7));
    row.notices_count += 1;
    byLocation.set(key, row);
  }

  const opportunities = Array.from(byLocation.values()).sort(
    (a, b) => b.estimated_nurses_available - a.estimated_nurses_available
  );

  res.status(200).json({ opportunities, count: opportunities.length });
}

