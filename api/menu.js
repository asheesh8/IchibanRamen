// Vercel function: live HonorPOS menu, cached at the edge for 5 minutes.
// The storefront API has no CORS headers, so the browser can't call it directly.
const STORE = 'https://order.ichibanvt.com/';
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default async function handler(req, res) {
  try {
    const r = await fetch(new URL('order/menu/categoryGroup', STORE), { method: 'POST', body: '' });
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
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
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.status(200).json({ source: STORE, syncedAt: new Date().toISOString(), categories });
  } catch (err) {
    res.status(502).json({ error: 'menu unavailable' });
  }
}
