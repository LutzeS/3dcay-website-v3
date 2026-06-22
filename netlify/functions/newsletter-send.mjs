// Newsletter-Versand an bestätigte Abonnenten via Mailjet (inkl. Abmelde-Link).
import { listItems, putItem, uid } from './lib/store.mjs';
import { json, preflight, requireAuth, signEmailToken } from './lib/auth.mjs';
import { sendMail, mailjetConfigured } from './lib/mailjet.mjs';

function wrap(html, origin, email) {
  const token = signEmailToken(email, 'unsub');
  const unsub = `${origin}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}`;
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111">
    ${html}
    <hr style="margin-top:32px;border:none;border-top:1px solid #eee">
    <p style="font-size:12px;color:#888">3DCAY Marketing IT Solutions by drei-d · <a href="${unsub}" style="color:#888">Newsletter abbestellen</a></p>
  </div>`;
}

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (!requireAuth(req)) return json({ error: 'auth' }, 401);
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!mailjetConfigured()) return json({ error: 'mailjet_not_configured' }, 500);

  let b = {};
  try { b = await req.json(); } catch {}
  const subject = String(b.subject || '').trim();
  const html = String(b.html || '').trim();
  if (!subject || !html) return json({ error: 'subject_or_html' }, 400);
  const origin = new URL(req.url).origin;

  // Testversand an eine Adresse
  if (b.test && b.testEmail) {
    await sendMail({ to: b.testEmail, subject: '[TEST] ' + subject, html: wrap(html, origin, b.testEmail) });
    return json({ ok: true, test: true, sent: 1 });
  }

  const subs = (await listItems('subscribers')).filter((s) => s.status === 'confirmed');
  let sent = 0, failed = 0;
  for (const s of subs) {
    try { await sendMail({ to: s.email, subject, html: wrap(html, origin, s.email) }); sent++; }
    catch { failed++; }
  }

  const id = uid('camp');
  await putItem('campaigns', id, { id, subject, recipients: subs.length, sent, failed, ts: Date.now() });
  return json({ ok: true, recipients: subs.length, sent, failed });
};
