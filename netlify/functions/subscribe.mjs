// Newsletter-Anmeldung mit Double-Opt-In (DSGVO).
import crypto from 'node:crypto';
import { putItem, getItem } from './lib/store.mjs';
import { json, preflight, signEmailToken } from './lib/auth.mjs';
import { sendMail, mailjetConfigured } from './lib/mailjet.mjs';
import { clientIp, rateLimit, honeypotTripped } from './lib/guard.mjs';

export const emailKey = (email) => crypto.createHash('sha256').update(String(email).toLowerCase().trim()).digest('hex');
const valid = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let body = {};
  try { body = await req.json(); } catch {}
  const email = String(body.email || '').toLowerCase().trim();
  if (!valid(email)) return json({ error: 'email' }, 400);

  // Missbrauchsschutz (E-Mail-Bombing vermeiden)
  if (honeypotTripped(body)) return json({ ok: true });
  if (!(await rateLimit({ name: 'subscribe', ip: clientIp(req), max: 3, windowSec: 60 })))
    return json({ error: 'rate_limited' }, 429);

  const key = emailKey(email);
  const existing = await getItem('subscribers', key);
  if (existing && existing.status === 'confirmed') return json({ ok: true, already: true });

  const rec = existing || { id: key, email, created: Date.now() };
  rec.status = 'pending';
  rec.source = String(body.source || 'website').slice(0, 60);
  rec.updated = Date.now();
  await putItem('subscribers', key, rec);

  // Bestätigungslink
  const origin = new URL(req.url).origin;
  const token = signEmailToken(email, 'confirm');
  const confirmUrl = `${origin}/.netlify/functions/confirm?token=${encodeURIComponent(token)}`;

  let mailed = false;
  if (mailjetConfigured()) {
    try {
      await sendMail({
        to: email,
        subject: 'Bitte bestätigen: KI-Lab Newsletter',
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#e3101a">Fast geschafft!</h2>
          <p>Bitte bestätigen Sie Ihre Anmeldung zum <strong>3DCAY KI-Lab Newsletter</strong>.</p>
          <p><a href="${confirmUrl}" style="display:inline-block;background:#e3101a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:100px;font-weight:600">Anmeldung bestätigen</a></p>
          <p style="color:#777;font-size:13px">Wenn Sie das nicht waren, ignorieren Sie diese E-Mail einfach.</p>
        </div>`,
      });
      mailed = true;
    } catch (e) {
      // Anmeldung bleibt gespeichert; Versand kann später erneut angestoßen werden.
      return json({ ok: true, mailed: false, warn: 'mail_failed' });
    }
  }
  return json({ ok: true, mailed });
};
