// Admin-Login: Passwort (ENV ADMIN_PASSWORD) -> signiertes Token.
import crypto from 'node:crypto';
import { json, preflight, signToken } from './lib/auth.mjs';

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let b = {};
  try { b = await req.json(); } catch {}
  const pw = String(b.password || '');
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) return json({ error: 'not_configured', hint: 'ENV ADMIN_PASSWORD setzen' }, 500);

  const a = Buffer.from(pw), e = Buffer.from(expected);
  const ok = a.length === e.length && crypto.timingSafeEqual(a, e);
  if (!ok) return json({ error: 'invalid' }, 401);

  return json({ token: signToken({ role: 'admin' }) });
};
