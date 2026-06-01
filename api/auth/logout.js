import { clearSessionCookie } from './_lib.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  clearSessionCookie(res);
  return res.status(200).json({ success: true, loggedOut: true });
}
