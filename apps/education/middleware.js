import { next } from "@vercel/edge";

const encoder = new TextEncoder();

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function validSession(cookie) {
  if (!cookie || !process.env.EDUCATION_AUTH_SECRET) return false;
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return false;
  try {
    const key = await crypto.subtle.importKey("raw", encoder.encode(process.env.EDUCATION_AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const verified = await crypto.subtle.verify("HMAC", key, decodeBase64Url(signature), encoder.encode(payload));
    if (!verified) return false;
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    return claims.audience === "lightkeeperiq-education" && Number(claims.expires) > Math.floor(Date.now() / 1000);
  } catch { return false; }
}

function securityHeaders(headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  headers.set("Cache-Control", "private, no-store");
  return headers;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const publicPath = ["/login", "/login.html", "/login.js", "/styles.css", "/Lightkeeper.png", "/api/login"].includes(url.pathname) || url.pathname.startsWith("/_vercel/");
  if (publicPath) return next({ headers: securityHeaders(new Headers()) });
  const cookieName = "lqedu_session=";
  const cookie = request.headers.get("cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith(cookieName))?.slice(cookieName.length);
  if (await validSession(cookie)) return next({ headers: securityHeaders(new Headers()) });
  const login = new URL("/login", request.url);
  return Response.redirect(login, 307);
}

export const config = { matcher: ["/((?!favicon.ico).*)"] };
