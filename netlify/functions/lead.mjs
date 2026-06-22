// Lead-Erfassung (Demo-Anfrage / Kontakt / Whitepaper-Gate) -> Lead-Inbox.
import { putItem, uid } from './lib/store.mjs';
import { json, preflight } from './lib/auth.mjs';
import { sendMail, mailjetConfigured } from './lib/mailjet.mjs';

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let b = {};
  try { b = await req.json(); } catch {}
  const email = String(b.email || '').trim();
  if (!email) return json({ error: 'email' }, 400);

  const id = uid('lead');
  const lead = {
    id,
    type: String(b.type || 'demo').slice(0, 40),       // demo | kontakt | whitepaper | playbook | fitcheck
    name: String(b.name || '').slice(0, 120),
    email: email.slice(0, 160),
    company: String(b.company || '').slice(0, 160),
    phone: String(b.phone || '').slice(0, 60),
    interest: String(b.interest || '').slice(0, 80),
    message: String(b.message || '').slice(0, 2000),
    source: String(b.source || '').slice(0, 120),
    status: 'neu',
    created: Date.now(),
  };
  await putItem('leads', id, lead);

  // optionale interne Benachrichtigung
  const notify = process.env.INTERNAL_NOTIFY_EMAIL;
  if (notify && mailjetConfigured()) {
    try {
      await sendMail({
        to: notify,
        subject: `Neuer Lead (${lead.type}): ${lead.name || lead.email}`,
        html: `<pre style="font-family:monospace">${JSON.stringify(lead, null, 2)}</pre>`,
      });
    } catch {}
  }
  return json({ ok: true, id });
};
