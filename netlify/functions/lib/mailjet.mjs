// Mailjet-Versand über die REST-API (Send v3.1) – ohne SDK, nur fetch.
function stripHtml(h) {
  return (h || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function mailjetConfigured() {
  return !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY && process.env.MAILJET_FROM_EMAIL);
}

// to: string | {Email,Name} | Array davon
// attachments: [{ filename, contentType, base64 }] (optional)
export async function sendMail({ to, subject, html, text, attachments }) {
  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_SECRET_KEY;
  const from = process.env.MAILJET_FROM_EMAIL;
  const fromName = process.env.MAILJET_FROM_NAME || '3DCAY KI-Lab';
  if (!key || !secret || !from) {
    throw new Error('Mailjet-Env fehlt: MAILJET_API_KEY, MAILJET_SECRET_KEY, MAILJET_FROM_EMAIL');
  }
  const arr = Array.isArray(to) ? to : [to];
  const recipients = arr.map((r) => (typeof r === 'string' ? { Email: r } : { Email: r.Email || r.email, Name: r.Name || r.name || '' }));

  const att = Array.isArray(attachments) && attachments.length
    ? attachments.map((a) => ({
        ContentType: a.contentType || 'application/octet-stream',
        Filename: a.filename || 'anhang',
        Base64Content: a.base64,
      }))
    : undefined;

  const messages = recipients.map((r) => {
    const m = {
      From: { Email: from, Name: fromName },
      To: [r],
      Subject: subject,
      HTMLPart: html,
      TextPart: text || stripHtml(html),
    };
    if (att) m.Attachments = att;
    return m;
  });

  const res = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Basic ' + Buffer.from(key + ':' + secret).toString('base64'),
    },
    body: JSON.stringify({ Messages: messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Mailjet ' + res.status + ': ' + JSON.stringify(data));
  return data;
}
