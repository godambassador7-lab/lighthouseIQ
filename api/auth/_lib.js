export const SESSION_COOKIE = 'lni_session';
const DEFAULT_PASSCODE = 'IUH126';

export function parseCookies(req) {
  const raw = String(req?.headers?.cookie || '');
  const out = {};
  raw.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx <= 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k) return;
    out[k] = decodeURIComponent(v);
  });
  return out;
}

export function hasSession(req) {
  const cookies = parseCookies(req);
  return Boolean(cookies[SESSION_COOKIE]);
}

export function setSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function getAcceptedPasscode() {
  return String(process.env.ACCESS_PASSCODE || DEFAULT_PASSCODE).trim();
}

export function buildUser(email) {
  const normalized = String(email || '').trim().toLowerCase() || 'admin@example.com';
  return {
    id: 'vercel-user',
    email: normalized,
    role: 'admin'
  };
}

