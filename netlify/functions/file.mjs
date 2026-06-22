// Liefert eine hochgeladene Datei (PDF) aus dem Blob-Store aus.
import { coll } from './lib/store.mjs';

export default async (req) => {
  const id = new URL(req.url).searchParams.get('id') || '';
  if (!id) return new Response('Bad request', { status: 400 });
  let r;
  try { r = await coll('files').getWithMetadata(id, { type: 'arrayBuffer' }); } catch { r = null; }
  if (!r || !r.data) return new Response('Nicht gefunden', { status: 404 });
  const ct = (r.metadata && r.metadata.contentType) || 'application/octet-stream';
  const fn = (r.metadata && r.metadata.filename) || 'download';
  return new Response(r.data, {
    status: 200,
    headers: {
      'content-type': ct,
      'content-disposition': 'inline; filename="' + fn.replace(/"/g, '') + '"',
      'cache-control': 'public, max-age=300',
    },
  });
};
