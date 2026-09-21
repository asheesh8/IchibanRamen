"""Builds index.html, about.html and visit.html from shared header/footer partials.

Run from the site folder:  python3 scripts/build-pages.py
Edit page bodies in pages/*.html; the header, footer and <head> live here.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V = "12"  # bump to bust caches after CSS/JS edits
ORDER = "https://order.ichibanvt.com/"

HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="assets/photos/hero-hibachi-spread.webp">
  <meta name="theme-color" content="#F2EAD8" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#1C1916" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+SC:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css">
  {preload}<link rel="stylesheet" href="styles.css?v={v}">
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"Restaurant","name":"ICHIBAN Restaurant","telephone":"+1-802-540-1318",
   "servesCuisine":["Rice noodle soup","Ramen","Hibachi","Sushi","Bubble tea"],
   "address":{{"@type":"PostalAddress","streetAddress":"156 N Winooski Ave","addressLocality":"Burlington","addressRegion":"VT","postalCode":"05401","addressCountry":"US"}},
   "openingHours":"Mo,Tu,Th,Fr,Sa,Su 16:30-02:00","hasMenu":"{order}","acceptsReservations":false}}
  </script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <span class="sentinel" data-top-sentinel aria-hidden="true"></span>
"""

def header(active):
    def link(href, label, key):
        cur = ' aria-current="page"' if key == active else ""
        return f'<a href="{href}"{cur}>{label}</a>'
    links = "\n        ".join([
        link("./#menu", "Menu", "menu"),
        link("about.html", "About", "about"),
        link("visit.html", "Visit", "visit"),
    ])
    return f"""
  <header class="nav" data-nav>
    <div class="nav__inner wrap">
      <a href="./" class="mark" aria-label="ICHIBAN, home">
        <span class="mark__seal" aria-hidden="true">一番</span>
        <span class="mark__word">ICHIBAN</span>
      </a>
      <nav class="nav__links" aria-label="Primary">
        {links}
      </nav>
      <div class="nav__actions">
        <span class="status" data-status-wrap><span data-status>Open late</span></span>
        <a class="btn btn--primary" data-order href="{ORDER}">Order pickup</a>
        <button class="burger" type="button" data-burger aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><i class="ph ph-list" aria-hidden="true"></i></button>
      </div>
    </div>
  </header>
  <div class="sheet" id="sheet" data-sheet hidden>
    <img class="plate plate--sway" src="assets/plates/chili.webp" alt="" aria-hidden="true" style="--o:.18; width:260px; right:-60px; bottom:-40px; rotate:-12deg">
    <a href="./#menu">Menu</a>
    <a href="about.html">About</a>
    <a href="visit.html">Visit</a>
    <a class="btn btn--primary btn--lg" data-order href="{ORDER}"><i class="ph ph-bag" aria-hidden="true"></i>Order pickup</a>
    <div class="sheet__meta">
      <span class="status" data-status-wrap><span data-status>Open late</span></span>
      <a class="link" href="tel:+18025401318">(802) 540-1318</a>
      <span>156 N Winooski Ave, Burlington</span>
    </div>
  </div>
"""

FOOTER = f"""
  <footer class="foot" data-hide-dock>
    <img class="plate plate--desk" src="assets/plates/rice.webp" alt="" aria-hidden="true" loading="lazy" style="--o:.14; width:420px; right:-60px; bottom:-160px; rotate:-6deg">
    <div class="wrap foot__inner">
      <div class="foot__col">
        <a href="./" class="mark mark--foot" aria-label="ICHIBAN, home">
          <span class="mark__seal" aria-hidden="true">一番</span>
          <span class="mark__word">ICHIBAN</span>
        </a>
        <p style="opacity:.8; margin-top:12px">Rice noodle soup, ramen, hibachi, sushi and bubble tea in Burlington's Old North End.</p>
      </div>
      <div class="foot__col">
        <h2>Find us</h2>
        <span>156 N Winooski Ave<br>Burlington, VT 05401</span>
        <a href="tel:+18025401318">(802) 540-1318</a>
        <a href="https://www.google.com/maps/dir/?api=1&amp;destination=156+N+Winooski+Ave+Burlington+VT+05401" target="_blank" rel="noopener">Directions</a>
      </div>
      <div class="foot__col">
        <h2>Hours</h2>
        <span class="foot__hours">Mon, Tue, Thu to Sun<br>4:30pm to 2am</span>
        <span class="foot__hours">Closed Wednesday</span>
      </div>
      <div class="foot__col">
        <h2>Explore</h2>
        <a href="./#menu">Menu</a>
        <a href="about.html">About</a>
        <a href="visit.html">Visit</a>
        <a data-order href="{ORDER}">Order pickup</a>
      </div>
      <p class="foot__credit">Botanical plates from Köhler's <i>Medizinal-Pflanzen</i> (1887), Blanco's <i>Flora de Filipinas</i> (1880s), Ypey and Turpin. All in the public domain.</p>
    </div>
  </footer>

  <div class="dock" data-dock>
    <a class="dock__call" href="tel:+18025401318" aria-label="Call Ichiban"><i class="ph ph-phone" aria-hidden="true"></i></a>
    <a class="btn btn--primary dock__order" data-order href="{ORDER}"><i class="ph ph-bag" aria-hidden="true"></i>Order pickup</a>
  </div>

  <script src="main.js?v={V}" type="module"></script>
</body>
</html>
"""

PAGES = [
    ("index.html", "home", "ICHIBAN | Rice Noodle Soup, Ramen & Hibachi in Burlington, VT",
     "Rice noodle soup in seven broths, ramen, hibachi, sushi and bubble tea at 156 N Winooski Ave, Burlington. Open until 2am. Order pickup online.",
     '<link rel="preload" as="image" href="assets/photos/hero-hibachi-spread.webp">\n  '),
    ("about.html", "about", "About | ICHIBAN, Burlington VT",
     "A family-run noodle shop in Burlington's Old North End, with rice noodles made in-house and broths built from scratch.", ""),
    ("visit.html", "visit", "Hours & Directions | ICHIBAN, Burlington VT",
     "Open 4:30pm to 2am, closed Wednesdays. 156 N Winooski Ave, Burlington, VT. Dine in, pickup or delivery.", ""),
]

for out, key, title, desc, preload in PAGES:
    body = (ROOT / "pages" / out).read_text()
    html = HEAD.format(title=title, desc=desc, preload=preload, v=V, order=ORDER) + header(key) + body + FOOTER
    (ROOT / out).write_text(html)
    print("wrote", out)
