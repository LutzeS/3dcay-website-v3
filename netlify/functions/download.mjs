// Whitepaper-/PDF-Download: zählt Downloads und leitet auf die Datei weiter.
import { getItem, bump } from './lib/store.mjs';

export default async (req) => {
  const id = new URL(req.url).searchParams.get('id') || '';
  const wp = await getItem('whitepapers', id);
  if (!wp || !wp.fileUrl || wp.active === false) {
    return new Response('Nicht verfügbar', { status: 404 });
  }
  await bump('dl:' + id, 1);
  return new Response('', { status: 302, headers: { location: wp.fileUrl } });
};
