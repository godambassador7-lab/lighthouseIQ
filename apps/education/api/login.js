"use strict";

const crypto = require("crypto");

const attempts = globalThis.__lqEducationAttempts || new Map();
globalThis.__lqEducationAttempts = attempts;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function json(response, status, body, headers = {}) {
  response.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value));
  response.end(JSON.stringify(body));
}

function safeEqual(left, right) {
  const leftHash = crypto.createHash("sha256").update(String(left)).digest();
  const rightHash = crypto.createHash("sha256").update(String(right)).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function clientKey(request) {
  return String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" }, { Allow: "POST" });
  if (!process.env.EDUCATION_PASSCODE || !process.env.EDUCATION_AUTH_SECRET) return json(response, 503, { error: "Authentication is not configured" });

  const key = clientKey(request);
  const now = Date.now();
  const current = attempts.get(key);
  const record = !current || now - current.startedAt > WINDOW_MS ? { startedAt: now, count: 0 } : current;
  if (record.count >= MAX_ATTEMPTS) return json(response, 429, { error: "Too many attempts. Try again in 15 minutes." }, { "Retry-After": "900" });

  const passcode = typeof request.body === "string" ? JSON.parse(request.body || "{}").passcode : request.body?.passcode;
  if (!safeEqual(passcode || "", process.env.EDUCATION_PASSCODE)) {
    record.count += 1;
    attempts.set(key, record);
    await new Promise(resolve => setTimeout(resolve, 650));
    return json(response, 401, { error: "Incorrect passcode" });
  }

  attempts.delete(key);
  const expires = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const payload = Buffer.from(JSON.stringify({ expires, audience: "lightkeeperiq-education" })).toString("base64url");
  const signature = crypto.createHmac("sha256", process.env.EDUCATION_AUTH_SECRET).update(payload).digest("base64url");
  response.setHeader("Set-Cookie", `lqedu_session=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
  return json(response, 200, { ok: true });
};
