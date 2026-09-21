# ICHIBAN Restaurant website

Site for ICHIBAN, 156 N Winooski Ave, Burlington VT. Plain HTML/CSS/JS, deployed on Vercel with no build step.

## How it fits together

- `index.html`, `about.html`, `visit.html` are generated. Edit the page bodies in `pages/`, then run `python3 scripts/build-pages.py`. The shared `<head>`, nav and footer live in that script.
- `main.js` holds the site config at the top: ordering link, hours, Google rating, review quotes, menu grouping and broth cards.
- Menu and prices come from the restaurant's HonorPOS storefront. On Vercel, `api/menu.js` fetches it live (cached 5 minutes). `data/menu.json` is the fallback snapshot; refresh it with `npm run sync-menu`.
- Background art in `assets/plates/` is cut from public-domain botanical plates (Köhler, Blanco, Ypey, Turpin via Wikimedia Commons).

## Local preview

```
python3 -m http.server 5178
```

`/api/menu` only exists on Vercel, so locally the menu loads from `data/menu.json`.

## Before launch

Search the code for `TODO(owner)`. Open items: confirm hours, primary ordering domain, delivery apps, broth heat levels, family restaurant list, permission for review quotes and customer photos, and the gluten-free labels (rice noodles reportedly contain wheat flour).
