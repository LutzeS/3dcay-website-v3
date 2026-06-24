// KI-Marketing-Playbook: Lead speichern + erzeugtes PDF per Mailjet zusenden.
// Body: { first_name, last_name, company, email, score, industry, pain, goal, pdfBase64 }
import { putItem, uid } from './lib/store.mjs';
import { json, preflight } from './lib/auth.mjs';
import { sendMail, mailjetConfigured } from './lib/mailjet.mjs';
import { clientIp, rateLimit, honeypotTripped } from './lib/guard.mjs';

const MAX_PDF_B64 = 7_000_000; // ~5 MB Datei – Schutz gegen Überlast

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let b = {};
  try { b = await req.json(); } catch {}
  const email = String(b.email || '').trim();
  if (!email) return json({ error: 'email' }, 400);

  // Missbrauchsschutz (Versand-Relay/Spam vermeiden)
  if (honeypotTripped(b)) return json({ ok: true, delivered: false, skipped: true });
  if (!(await rateLimit({ name: 'playbook', ip: clientIp(req), max: 3, windowSec: 300 })))
    return json({ error: 'rate_limited' }, 429);

  const first = String(b.first_name || '').slice(0, 80).trim();
  const last = String(b.last_name || '').slice(0, 80).trim();
  const name = (first + ' ' + last).trim();
  const company = String(b.company || '').slice(0, 160).trim();
  const pdf = typeof b.pdfBase64 === 'string' ? b.pdfBase64 : '';
  const hasPdf = pdf.length > 100 && pdf.length < MAX_PDF_B64;

  // 1) Lead in der Inbox ablegen
  const id = uid('lead');
  const lead = {
    id,
    type: 'playbook',
    name,
    email: email.slice(0, 160),
    company,
    interest: 'KI-Marketing-Playbook',
    message: `Score ${b.score ?? '–'} · Branche ${b.industry ?? '–'} · Pain ${b.pain ?? '–'} · Ziel ${b.goal ?? '–'}`,
    source: 'ki-playbook',
    status: 'neu',
    pdfDelivered: false,
    created: Date.now(),
  };

  let mailWarning = null;

  // 2) PDF an den Kunden zusenden (nur wenn Mailjet konfiguriert + PDF vorhanden)
  if (mailjetConfigured() && hasPdf) {
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#171717;font-size:15px;line-height:1.6">
        <p>Hallo ${name || 'und herzlich willkommen'},</p>
        <p>vielen Dank f&uuml;r Ihr Interesse. Im Anhang finden Sie Ihr <strong>individuelles
        KI-Marketing-Playbook</strong> &mdash; mit Ihren 3 Quick Wins, dem 30-Tage-Plan,
        Prompt-Vorlagen, einer Tool-Stack-Empfehlung und einer Governance-Checkliste.</p>
        <p>Wenn Sie die Quick Wins gemeinsam aufsetzen m&ouml;chten, melden Sie sich gern &mdash;
        wir begleiten Aufbau, Prompt-Library und Governance pragmatisch und messbar.</p>
        <p style="margin-top:20px">Beste Gr&uuml;&szlig;e<br><strong>Ihr 3DCAY KI-Lab</strong><br>
        3DCAY Marketing IT Solutions by drei-d</p>
      </div>`;
    try {
      await sendMail({
        to: { Email: email, Name: name },
        subject: 'Ihr KI-Marketing-Playbook',
        html,
        attachments: [{ filename: 'KI-Marketing-Playbook.pdf', contentType: 'application/pdf', base64: pdf }],
      });
      lead.pdfDelivered = true;
    } catch (e) {
      mailWarning = 'mail_failed';
    }
  } else if (!mailjetConfigured()) {
    mailWarning = 'mailjet_unconfigured';
  } else if (!hasPdf) {
    mailWarning = 'pdf_missing';
  }

  await putItem('leads', id, lead);

  // 3) Interne Benachrichtigung
  const notify = process.env.INTERNAL_NOTIFY_EMAIL;
  if (notify && mailjetConfigured()) {
    try {
      await sendMail({
        to: notify,
        subject: `Playbook-Lead: ${name || email}`,
        html: `<pre style="font-family:monospace">${JSON.stringify({ ...lead }, null, 2)}</pre>`,
      });
    } catch {}
  }

  return json({ ok: true, id, delivered: lead.pdfDelivered, warning: mailWarning });
};
