// Schreib-Operationen für Admin: News & Whitepapers (save/delete), Leads (status/delete).
import { putItem, delItem, getItem, uid } from './lib/store.mjs';
import { json, preflight, requireAuth } from './lib/auth.mjs';

const WRITABLE = new Set(['news', 'whitepapers']);

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (!requireAuth(req)) return json({ error: 'auth' }, 401);
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let b = {};
  try { b = await req.json(); } catch {}
  const { collection, action, item, id, status } = b;

  if (collection === 'leads') {
    if (action === 'status') {
      const l = await getItem('leads', id);
      if (!l) return json({ error: 'notfound' }, 404);
      l.status = String(status || 'neu').slice(0, 40);
      await putItem('leads', id, l);
      return json({ ok: true, item: l });
    }
    if (action === 'delete') { await delItem('leads', id); return json({ ok: true }); }
    return json({ error: 'action' }, 400);
  }

  if (!WRITABLE.has(collection)) return json({ error: 'collection' }, 400);

  if (action === 'save') {
    const it = { ...(item || {}) };
    if (!it.id) it.id = uid(collection.slice(0, 2));
    if (!it.created) it.created = Date.now();
    it.updated = Date.now();
    await putItem(collection, it.id, it);
    return json({ ok: true, item: it });
  }
  if (action === 'delete') {
    await delItem(collection, id || (item && item.id));
    return json({ ok: true });
  }
  return json({ error: 'action' }, 400);
};
