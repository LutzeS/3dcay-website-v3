// Newsletter-Abmeldung (Link in jeder Ausgabe).
import crypto from 'node:crypto';
import { getItem, putItem } from './lib/store.mjs';
import { verifyEmailToken } from './lib/auth.mjs';

const key = (e) => crypto.createHash('sha256').update(String(e).toLowerCase().trim()).digest('hex');

function page(title, msg) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title}</title>
     <div style="font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A0A0A;color:#fff;text-align:center;padding:24px">
       <div><h1 style="color:#e3101a;margin-bottom:8px">${title}</h1><p style="opacity:.8">${msg}</p>
       <p style="margin-top:24px"><a href="/v5/" style="color:#fff">→ Zur 3DCAY Website</a></p></div>
     </div>`,
    { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}

export default async (req) => {
  const token = new URL(req.url).searchParams.get('token') || '';
  const email = verifyEmailToken(token, 'unsub');
  if (!email) return page('Link ungültig', 'Dieser Abmeldelink ist ungültig oder abgelaufen.');
  const k = key(email);
  const rec = await getItem('subscribers', k);
  if (rec) { rec.status = 'unsubscribed'; rec.unsubscribedAt = Date.now(); await putItem('subscribers', k, rec); }
  return page('Abgemeldet', 'Sie wurden aus dem Verteiler entfernt. Schade, dass Sie gehen!');
};
