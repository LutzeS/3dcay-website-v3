// Anonymes Funnel-Tracking (v. a. Fit-Check): start / step / complete / signup.
import { putItem, uid, bump } from './lib/store.mjs';
import { json, preflight } from './lib/auth.mjs';

const ALLOWED = new Set([
  'fitcheck_start', 'fitcheck_step', 'fitcheck_complete', 'fitcheck_signup',
  'whitepaper_view', 'playbook_view', 'demo_open',
]);

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let body = {};
  try { body = await req.json(); } catch {}
  const event = String(body.event || '');
  if (!ALLOWED.has(event)) return json({ error: 'event' }, 400);

  const id = uid('ev');
  await putItem('events', id, {
    id,
    event,
    sessionId: String(body.sessionId || '').slice(0, 64),
    step: body.step ?? null,
    meta: body.meta && typeof body.meta === 'object' ? body.meta : {},
    ts: Date.now(),
  });
  await bump('evt:' + event, 1);
  return json({ ok: true });
};
