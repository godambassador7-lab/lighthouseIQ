import { getSessionUser, hasSession, setSessionCookie } from './_lib.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!hasSession(req)) {
    return res.status(401).json({ success: false, error: 'No active session' });
  }
  setSessionCookie(res, getSessionUser(req));
  return res.status(200).json({ success: true });
}

