import { getNotices } from './_lib/data.js';

export default function handler(req, res) {
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
