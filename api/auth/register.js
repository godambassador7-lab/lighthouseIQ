import { getAcceptedPasscode, parseJsonBody, registerAccount, setSessionCookie } from './_lib.js';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = parseJsonBody(req);
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const password = String(body.password || '').trim();
  const confirmPassword = String(body.confirmPassword || '').trim();
  const inviteCode = String(body.inviteCode || '').trim();

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Enter a valid work email.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match.' });
  }
  if (inviteCode !== getAcceptedPasscode()) {
    return res.status(401).json({ success: false, error: 'Invalid invite code.' });
  }

  const user = registerAccount(req, res, { email, name, password });
  if (!user) {
    return res.status(400).json({ success: false, error: 'Unable to create account.' });
  }

  setSessionCookie(res, user);
  return res.status(200).json({ success: true, created: true, user });
}
