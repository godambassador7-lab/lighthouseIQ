import { clearSessionCookie, getSessionUser, hasSession } from './_lib.js';

export default function handler(req, res) {
  if (req.method === 'POST') {
    clearSessionCookie(res);
    return res.status(200).json({ success: true, loggedOut: true });
  }

  if (req.method && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!hasSession(req)) {
    return res.status(401).json({ success: false, error: 'No active session' });
  }

  return res.status(200).json({
    success: true,
    user: getSessionUser(req)
  });
}

