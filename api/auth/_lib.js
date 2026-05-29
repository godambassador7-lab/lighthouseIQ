import { createHash } from 'node:crypto';

export const SESSION_COOKIE = 'lni_session';
const USER_COOKIE = 'lni_user';
const ACCOUNTS_COOKIE = 'lni_accounts';
const DEFAULT_PASSCODE = 'IUH126';
const SESSION_MAX_AGE_SECONDS = 28800;
const ACCOUNTS_MAX_AGE_SECONDS = 31536000;
const MAX_ACCOUNTS_PER_BROWSER = 12;

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizeName = (value) => String(value || '').trim().slice(0, 80);

const makeCookie = (name, value, maxAgeSeconds) => (
  `${name}=${encodeURIComponent(String(value || ''))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0, Number(maxAgeSeconds) || 0)}`
);

function appendSetCookie(res, cookie) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', [cookie]);
    return;
  }
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookie]);
    return;
  }
  res.setHeader('Set-Cookie', [existing, cookie]);
}

const encodePayload = (value) => {
  try {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
  } catch {
    return '';
  }
};

const decodePayload = (value, fallback) => {
  try {
    const parsed = JSON.parse(Buffer.from(String(value || ''), 'base64url').toString('utf8'));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const hashPassword = (password) => (
  createHash('sha256')
    .update(`${getAcceptedPasscode()}::${String(password || '')}`, 'utf8')
    .digest('hex')
);

const isValidAccountRecord = (record) => {
  const email = normalizeEmail(record?.email);
  const passwordHash = String(record?.passwordHash || '');
  return Boolean(email) && /@/.test(email) && passwordHash.length >= 40;
};

const readRegisteredAccounts = (req) => {
  const cookies = parseCookies(req);
  const payload = decodePayload(cookies[ACCOUNTS_COOKIE], { accounts: [] });
  const rows = Array.isArray(payload?.accounts) ? payload.accounts : [];
  return rows
    .filter(isValidAccountRecord)
    .slice(0, MAX_ACCOUNTS_PER_BROWSER)
    .map((row) => ({
      email: normalizeEmail(row.email),
      name: normalizeName(row.name),
      passwordHash: String(row.passwordHash),
      updatedAt: String(row.updatedAt || '')
    }));
};

function writeRegisteredAccounts(res, accounts) {
  const normalized = Array.isArray(accounts) ? accounts.filter(isValidAccountRecord).slice(0, MAX_ACCOUNTS_PER_BROWSER) : [];
  const encoded = encodePayload({ accounts: normalized });
  appendSetCookie(res, makeCookie(ACCOUNTS_COOKIE, encoded, ACCOUNTS_MAX_AGE_SECONDS));
}

const readSessionUser = (req) => {
  const cookies = parseCookies(req);
  const decoded = decodePayload(cookies[USER_COOKIE], null);
  const email = normalizeEmail(decoded?.email);
  if (!email) return null;
  return buildUser(email, {
    name: normalizeName(decoded?.name),
    role: String(decoded?.role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'member'
  });
};

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

export function parseJsonBody(req) {
  if (req?.body && typeof req.body === 'object') return req.body;
  if (typeof req?.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return {};
}

export function hasSession(req) {
  const cookies = parseCookies(req);
  return Boolean(cookies[SESSION_COOKIE]);
}

export function setSessionCookie(res, user = buildUser('admin@example.com', { role: 'admin' })) {
  appendSetCookie(res, makeCookie(SESSION_COOKIE, '1', SESSION_MAX_AGE_SECONDS));
  const encodedUser = encodePayload({
    email: normalizeEmail(user?.email),
    name: normalizeName(user?.name),
    role: String(user?.role || 'member').toLowerCase() === 'admin' ? 'admin' : 'member'
  });
  appendSetCookie(res, makeCookie(USER_COOKIE, encodedUser, SESSION_MAX_AGE_SECONDS));
}

export function clearSessionCookie(res) {
  appendSetCookie(res, makeCookie(SESSION_COOKIE, '', 0));
  appendSetCookie(res, makeCookie(USER_COOKIE, '', 0));
}

export function getAcceptedPasscode() {
  return String(process.env.ACCESS_PASSCODE || DEFAULT_PASSCODE).trim();
}

export function buildUser(email, options = {}) {
  const normalized = normalizeEmail(email) || 'admin@example.com';
  const role = String(options?.role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'member';
  const idSeed = createHash('sha1').update(normalized).digest('hex').slice(0, 12);
  return {
    id: `lni-${idSeed}`,
    email: normalized,
    name: normalizeName(options?.name),
    role
  };
}

export function getSessionUser(req) {
  const fromCookie = readSessionUser(req);
  if (fromCookie) return fromCookie;
  return buildUser('admin@example.com', { role: 'admin' });
}

export function validateCredentials(req, email, password) {
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || '');
  if (!normalizedEmail || !rawPassword) return null;

  if (rawPassword === getAcceptedPasscode()) {
    return buildUser(normalizedEmail, { role: 'admin' });
  }

  const accounts = readRegisteredAccounts(req);
  const account = accounts.find((row) => row.email === normalizedEmail);
  if (!account) return null;
  if (account.passwordHash !== hashPassword(rawPassword)) return null;
  return buildUser(normalizedEmail, { name: account.name, role: 'member' });
}

export function registerAccount(req, res, { email, name, password }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = normalizeName(name);
  const rawPassword = String(password || '');
  if (!normalizedEmail || !/@/.test(normalizedEmail) || rawPassword.length < 8) {
    return null;
  }

  const nextRecord = {
    email: normalizedEmail,
    name: normalizedName,
    passwordHash: hashPassword(rawPassword),
    updatedAt: new Date().toISOString()
  };

  const accounts = readRegisteredAccounts(req);
  const withoutExisting = accounts.filter((row) => row.email !== normalizedEmail);
  const next = [nextRecord, ...withoutExisting].slice(0, MAX_ACCOUNTS_PER_BROWSER);
  writeRegisteredAccounts(res, next);
  return buildUser(normalizedEmail, { name: normalizedName, role: 'member' });
}

