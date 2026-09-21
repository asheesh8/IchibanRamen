// Pulls the public HonorPOS menu into data/menu.json so the site always matches the POS.
// Run: node scripts/sync-menu.mjs
import { writeFile } from 'node:fs/promises';

const STORE = 'https://order.ichibanvt.com/';
const post = async (endpoint) => {
  const res = await fetch(new URL('order/' + endpoint, STORE), { method: 'POST', body: '' });
  if (!res.ok) throw new Error(`${endpoint}: ${res.status}`);
  return res.json();
};

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const data = await post('menu/categoryGroup');

const categories = data.list
  .flatMap((g) => g.categoryList)
  .map((c) => ({
    name: clean(c.L1).replace(/^Vagan/, 'Vegan'),
    nameZh: clean(c.L2),
    items: c.menuList.map((m) => ({
      name: clean(m.L1),
      nameZh: clean(m.L2),
      note: clean(m.Remark).replace(/^\((.*)\)$/, '$1'),
      price: m.Price1 ? m.Price1 / 100 : null,
      spicy: m.HotFlag ? m.HotLevel || 1 : 0,
      glutenFree: !!m.GultenFreeFlag,
      isNew: !!m.NewFlag,
    })),
  }))
  .filter((c) => c.items.length);

await writeFile(
  new URL('../data/menu.json', import.meta.url),
  JSON.stringify({ source: STORE, syncedAt: new Date().toISOString(), categories }, null, 1) + '\n'
);
console.log(categories.map((c) => `${c.name} (${c.items.length})`).join('\n'));
