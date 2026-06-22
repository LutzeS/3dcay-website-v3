// Einfacher Datenspeicher auf Basis von Netlify Blobs.
// Jede "Collection" ist ein eigener Blob-Store; Items werden als JSON unter einer ID abgelegt.
import { getStore } from '@netlify/blobs';

export function coll(name) {
  return getStore(name);
}

export function uid(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function putItem(name, id, data) {
  await coll(name).setJSON(id, data);
  return data;
}

export async function getItem(name, id) {
  try { return await coll(name).get(id, { type: 'json' }); }
  catch { return null; }
}

export async function delItem(name, id) {
  await coll(name).delete(id);
}

export async function listItems(name) {
  const s = coll(name);
  const { blobs } = await s.list();
  const out = [];
  for (const b of blobs) {
    const v = await s.get(b.key, { type: 'json' });
    if (v) out.push(v);
  }
  return out;
}

// Einfacher Zähler (z. B. Whitepaper-Downloads), in einer Collection "counters".
export async function bump(counterKey, by = 1) {
  const cur = (await getItem('counters', counterKey)) || { key: counterKey, value: 0 };
  cur.value = (cur.value || 0) + by;
  await putItem('counters', counterKey, cur);
  return cur.value;
}
