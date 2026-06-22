// Leichtgewichtige Auth + HTTP-Helfer (keine externen Pakete).
import crypto from 'node:crypto';

const SECRET = () => process.env.ADMIN_SECRET || 'dev-insecure-secret-change-me';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...CORS, ...extra },
  });
}

export function preflight(req) {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  return null;
}

export function signToken(payload, ttlSec = 60 * 60 * 8) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec };
  const b64 = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET()).update(b64).digest('base64url');
  return b64 + '.' + sig;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [b64, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET()).update(b64).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(b64, 'base64url').toString());
    if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch { return null; }
}

export function requireAuth(req) {
  const h = req.headers.get('authorization') || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  return verifyToken(t);
}

// Signierte E-Mail-Aktions-Tokens (Double-Opt-In / Abmeldung) – ohne Login nutzbar.
export function signEmailToken(email, action, ttlSec = 60 * 60 * 24 * 14) {
  return signToken({ email: String(email).toLowerCase(), action }, ttlSec);
}
export function verifyEmailToken(token, action) {
  const p = verifyToken(token);
  if (!p || p.action !== action || !p.email) return null;
  return p.email;
}
