// PDF-/Datei-Upload (Admin) -> Netlify Blobs. Gibt eine fileUrl zurück.
import { coll, uid } from './lib/store.mjs';
import { json, preflight, requireAuth } from './lib/auth.mjs';

export default async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (!requireAuth(req)) return json({ error: 'auth' }, 401);
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let b = {};
  try { b = await req.json(); } catch {}
  const dataBase64 = b.dataBase64 || '';
  if (!dataBase64) return json({ error: 'no_file' }, 400);

  const ct = (b.contentType || 'application/pdf');
  const filename = String(b.filename || 'datei.pdf').slice(0, 160);
  const buf = Buffer.from(dataBase64, 'base64');
  if (buf.length > 7 * 1024 * 1024) return json({ error: 'too_large', hint: 'max ~5 MB' }, 413);

  const key = uid('file');
  const blob = new Blob([buf], { type: ct });
  await coll('files').set(key, blob, { metadata: { contentType: ct, filename, size: buf.length } });

  return json({ ok: true, id: key, fileUrl: '/.netlify/functions/file?id=' + key });
};
