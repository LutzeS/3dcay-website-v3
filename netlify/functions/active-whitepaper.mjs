// Öffentlich: liefert das aktuell aktive Whitepaper (optional nach Slot gefiltert).
import { listItems } from './lib/store.mjs';
import { json, preflight } from './lib/auth.mjs';

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  const slot = new URL(req.url).searchParams.get('slot') || '';
  let list = (await listItems('whitepapers')).filter((w) => w.active !== false && w.fileUrl);
  if (slot) list = list.filter((w) => (w.slot || 'whitepaper') === slot);
  list.sort((a, b) => (b.created || 0) - (a.created || 0));
  const w = list[0];
  if (!w) return json({ ok: true, whitepaper: null });
  return json({
    ok: true,
    whitepaper: {
      id: w.id,
      title: w.title || '',
      description: w.description || '',
      downloadUrl: '/.netlify/functions/download?id=' + w.id,
    },
  });
};
