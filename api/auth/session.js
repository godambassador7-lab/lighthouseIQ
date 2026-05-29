import { getSessionUser, hasSession } from './_lib.js';

export default function handler(req, res) {
  if (!hasSession(req)) {
    return res.status(401).json({ success: false, error: 'No active session' });
  }

  return res.status(200).json({
    success: true,
    user: getSessionUser(req)
  });
}

