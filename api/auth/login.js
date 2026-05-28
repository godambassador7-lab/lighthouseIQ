import { buildUser, getAcceptedPasscode, setSessionCookie } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  let body = req.body || {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body || '{}');
    } catch {
      body = {};
    }
  }
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  if (password !== getAcceptedPasscode()) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  setSessionCookie(res);
  return res.status(200).json({ success: true, user: buildUser(email) });
}
