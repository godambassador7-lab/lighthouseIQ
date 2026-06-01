import { getNotices } from './_lib/data.js';
import { getProgramsPayload } from './_lib/programs.js';

const truthy = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
};

export default async function handler(req, res) {
  const resource = String(req.query?.resource || '').trim().toLowerCase();

  if (req.method === 'GET' && resource === 'programs') {
    const refresh = truthy(req.query?.refresh) || truthy(req.query?.live) || truthy(req.query?.force);
    try {
      const payload = await getProgramsPayload({ refresh });
      if (refresh) {
        res.setHeader('Cache-Control', 'no-store');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate=600');
      }
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: String(error?.message || error || 'Unknown programs failure')
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const notices = getNotices();
  const states = Array.from(
    new Set(
      notices
        .map((n) => String(n.state || '').toUpperCase())
        .filter(Boolean)
    )
  ).sort();

  return res.status(200).json({
    success: true,
    count: notices.length,
    states,
    mode: 'vercel-serverless'
  });
}
