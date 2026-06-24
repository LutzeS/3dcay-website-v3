// Missbrauchsschutz für öffentliche Endpunkte: Rate-Limit (Fixed-Window via Blobs) + Honeypot.
import { getItem, putItem } from './store.mjs';

// Client-IP aus Netlify-/Proxy-Headern.
export function clientIp(req) {
  const h = req.headers;
  return (
    h.get('x-nf-client-connection-ip') ||
    (h.get('x-forwarded-for') || '').split(',')[0].trim() ||
    h.get('client-ip') ||
    'unknown'
  );
}

// Honeypot: legitime Clients lassen das Feld leer; Bots füllen es oft aus.
export function honeypotTripped(body) {
  if (!body || typeof body !== 'object') return false;
  const v = body['bot-field'] ?? body.honeypot ?? body._gotcha ?? '';
  return typeof v === 'string' && v.trim() !== '';
}

// Fixed-Window-Rate-Limit. Gibt true zurück, wenn die Anfrage erlaubt ist.
// Fail-open: Bei Storage-Fehlern wird die Anfrage NICHT blockiert (Verfügbarkeit > Härte).
export async function rateLimit({ name, ip, max = 5, windowSec = 60 }) {
  try {
    const bucket = Math.floor(Date.now() / 1000 / windowSec);
    const key = `${name}:${ip}:${bucket}`;
    const rec = await getItem('ratelimit', key);
    const count = (rec && rec.c) || 0;
    if (count >= max) return false;
    await putItem('ratelimit', key, { c: count + 1, exp: (bucket + 1) * windowSec });
    return true;
  } catch {
    return true;
  }
}
