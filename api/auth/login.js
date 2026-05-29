import { parseJsonBody, setSessionCookie, validateCredentials } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = parseJsonBody(req);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = validateCredentials(req, email, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  setSessionCookie(res, user);
  return res.status(200).json({ success: true, user });
}
