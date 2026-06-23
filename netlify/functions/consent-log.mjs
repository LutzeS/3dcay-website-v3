// Consent-Nachweis (DSGVO Rechenschaftspflicht). Speichert die Einwilligungs-Entscheidung.
// Bewusst OHNE IP/Klarnamen – nur Entscheidung, Zeit, Version, Pfad, gekürzter User-Agent.
import { putItem, uid } from './lib/store.mjs';
import { json, preflight } from './lib/auth.mjs';

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let b = {};
  try { b = await req.json(); } catch {}
  const id = uid('cs');
  await putItem('consents', id, {
    id,
    action: String(b.action || '').slice(0, 30),
    choices: b.choices && typeof b.choices === 'object' ? b.choices : {},
    version: String(b.version || '').slice(0, 10),
    url: String(b.url || '').slice(0, 160),
    ua: String(b.ua || '').slice(0, 200),
    ts: Date.now(),
  });
  return json({ ok: true });
};
