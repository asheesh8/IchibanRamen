// ---------- config ----------
// Owner-selected HonorPOS storefront. Every "Order pickup" button points here.
// TODO(owner): Google lists order.ichibanburlington.com; confirm which domain is primary.
const ORDER_URL = 'https://order.ichibanvt.com/';

// Hours from the Google business listing, checked Sep 21, 2026. TODO(owner): confirm.
// Sunday first. Closing times after midnight belong to the day the shift started.
const HOURS = [
  ['16:30', '02:00'], // Sun
  ['16:30', '02:00'], // Mon
  ['16:30', '02:00'], // Tue
  null,               // Wed
  ['16:30', '02:00'], // Thu
  ['16:30', '02:00'], // Fri
  ['16:30', '02:00'], // Sat
];

// Google rating snapshot, Sep 21, 2026.
const RATING = { score: 4.3, count: 116, url: 'https://www.google.com/maps/place/ICHIBAN+Restaurant/data=!4m2!3m1!1s0x0:0xf9dbc195e20ca05a' };

// Verbatim excerpts from public Google reviews. Do not edit the wording.
const REVIEWS = [
  { q: 'This is the best spot for the perfect late night meal.', who: 'Megan Quigley' },
  { q: 'I work nights, and it’s very hard to find a place that has nutritious food that satisfies, but this place always does.', who: 'Laura Ullman' },
  { q: 'The owner was very kind & the portions are VERY GENEROUS! I loved the chicken hibachi express with noodles.', who: 'Katelyn Malzewski' },
  { q: 'We got rice noodle soup with vegan broth, and shrimp fried rice and both were delicious.', who: 'Mark Stein' },
  { q: 'I really like their boba tea (I love the kitty lids), veggie udon, and crab rangoon.', who: 'Julia Winter' },
  { q: 'Really great menu, tasty dishes (homemade udon!), and a welcoming and generous team.', who: 'Lauren Griswold' },
];

// How POS categories are grouped into menu tabs.
const GROUPS = [
  { id: 'soup', label: 'Rice noodle soup', cats: ['Original Bone Soup', 'Tomato Soup', 'Mala Spicy Soup', 'Golden Spicy Soup', 'Tom Yum Soup', 'Pickled Mustard Greens Soup', 'Fish Maw & Chicken Stock Soup'] },
  { id: 'ramen', label: 'Ramen & udon', cats: ['Ramen', 'Udon', 'Stir Fry Udon'] },
  { id: 'hibachi', label: 'Hibachi', cats: ['Hibachi Express', 'House Special'] },
  { id: 'rice', label: 'Noodles & rice', cats: ['Noodles Dry Tossed Rice', 'Fried Rice', 'Vegan & Vegetarian'] },
  { id: 'sushi', label: 'Sushi', cats: ['Ichiban Sushi'] },
  { id: 'starters', label: 'Starters', cats: ['Appetizer'] },
  { id: 'drinks', label: 'Tea & drinks', cats: ['Bubble & Fruit Tea', 'Slusher', 'Yogurt', 'Soda'] },
  { id: 'sweets', label: 'Dessert', cats: ['Dessert'] },
];

// Broth cards. Heat levels are our description, not POS data. TODO(owner): confirm.
const BROTHS = [
  { cat: 'Original Bone Soup', name: 'Original bone', heat: 0 },
  { cat: 'Tomato Soup', name: 'Tomato', heat: 0 },
  { cat: 'Mala Spicy Soup', name: 'Mala spicy', heat: 3 },
  { cat: 'Golden Spicy Soup', name: 'Golden spicy', heat: 2 },
  { cat: 'Tom Yum Soup', name: 'Tom yum', heat: 2 },
  { cat: 'Pickled Mustard Greens Soup', name: 'Pickled mustard greens', heat: 1 },
  { cat: 'Fish Maw & Chicken Stock Soup', name: 'Fish maw & chicken', heat: 0 },
];

const FEATURED_DRINKS = ['Taro Milk Tea', 'Peach Oolong Tea', 'Pink Lychee Jasmine Green Tea', 'Mango Pomelo Sago', 'Snow Strawberry Slush', 'Black Diamond Milk Tea'];

// ---------- helpers ----------
document.documentElement.classList.add('js');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => (n == null ? '' : '$' + (Number.isInteger(n) ? n : n.toFixed(2)));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

$$('[data-order]').forEach((a) => (a.href = ORDER_URL));

// Turn "Chicken (GF) Tomato Soup" under "Tomato Soup" into "Chicken" + GF tag.
function tidy(item, catName) {
  let name = item.name;
  let gf = item.glutenFree;
  if (/\bGF\b/.test(name)) {
    gf = true;
    name = name.replace(/\s*\(GF\)\s*/g, ' ').replace(/[.,]?\s*GF\b/g, '');
  }
  const cat = catName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // strip the category name whether it trails ("Chicken Tomato Soup") or leads ("Fish Maw Soup (With Chicken)")
  let short = name.replace(new RegExp('\\s*' + cat + '$', 'i'), '').trim();
  if (short === name.trim()) short = name.replace(new RegExp('^' + cat + '\\s*', 'i'), '').replace(/^\((.*)\)$/, '$1').trim();
  if (/^with(out)? /i.test(short)) short = short[0].toUpperCase() + short.slice(1).toLowerCase();
  if (short && short !== name.trim()) name = short;
  name = name.replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
  return { ...item, name, glutenFree: gf };
}

// ---------- hours ----------
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const mins = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''}${suffix}`;
};
const span = (h) => (h ? `${fmtTime(h[0])} to ${fmtTime(h[1])}` : 'Closed');

function status(now = new Date()) {
  const d = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();
  const y = HOURS[(d + 6) % 7];
  // still inside last night's shift?
  if (y && mins(y[1]) < mins(y[0]) && t < mins(y[1])) return { open: true, text: `Open now until ${fmtTime(y[1])}` };
  const h = HOURS[d];
  if (h) {
    const close = mins(h[1]) < mins(h[0]) ? mins(h[1]) + 1440 : mins(h[1]);
    if (t >= mins(h[0]) && t < close) return { open: true, text: `Open now until ${fmtTime(h[1])}` };
    if (t < mins(h[0])) return { open: false, text: `Opens today at ${fmtTime(h[0])}` };
  }
  for (let i = 1; i <= 7; i++) {
    const n = HOURS[(d + i) % 7];
    if (n) return { open: false, text: `Closed now. Opens ${i === 1 ? 'tomorrow' : DAYS[(d + i) % 7]} at ${fmtTime(n[0])}` };
  }
  return { open: false, text: 'Call for hours' };
}

function renderHours() {
  const s = status();
  $$('[data-status]').forEach((el) => {
    el.textContent = s.text;
    el.closest('[data-status-wrap]')?.classList.toggle('is-open', s.open);
  });
  const today = new Date().getDay();
  $$('[data-hours]').forEach((dl) => {
    dl.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) =>
      `<dt class="${d === today ? 'is-today' : ''}">${DAYS[d].slice(0, 3)}</dt><dd class="${d === today ? 'is-today' : ''}">${span(HOURS[d])}</dd>`
    ).join('');
  });
}

// ---------- data ----------
async function loadMenu() {
  // /api/menu is a live HonorPOS proxy on Vercel; the static snapshot is the fallback.
  for (const url of ['/api/menu', 'data/menu.json']) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (res.ok) return await res.json();
    } catch {}
  }
  throw new Error('menu unavailable');
}

// ---------- broth carousel ----------
function renderBroths(byCat) {
  const track = $('[data-broths]');
  if (!track) return;
  track.innerHTML = BROTHS.filter((b) => byCat[b.cat]).map((b) => {
    const cat = byCat[b.cat];
    const items = cat.items.map((i) => tidy(i, b.cat));
    const from = Math.min(...items.map((i) => i.price).filter(Boolean));
    const heat = Array.from({ length: 3 }, (_, n) => `<i class="ph-fill ph-pepper ${n < b.heat ? '' : 'off'}"></i>`).join('');
    return `<li class="loop__item"><a class="broth" href="#menu" draggable="false" data-jump="soup" data-cat="${esc(b.cat)}">
      <span class="broth__zh" lang="zh">${esc(cat.nameZh)}</span>
      <span class="broth__name">${esc(b.name)}</span>
      <span class="broth__heat" aria-label="${b.heat ? `Heat ${b.heat} of 3` : 'Not spicy'}">${b.heat ? heat : ''}</span>
      <span class="broth__meta"><span class="broth__opts">${items.length} proteins</span><span class="broth__price">from ${money(from)}</span></span>
    </a></li>`;
  }).join('');
  carousel($('[data-loop]'));
}

// Endless loop that drifts left. Pauses while hovered, focused, held or off screen;
// can be dragged or flicked; honours reduced motion and has a visible pause toggle.
function carousel(root) {
  if (!root) return;
  const view = $('[data-loop-view]', root);
  const track = $('[data-loop-track]', root);
  const toggle = $('[data-loop-toggle]', root);
  const originals = [...track.children];
  if (!originals.length) return;

  originals.forEach((li) => {
    const c = li.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.setAttribute('inert', '');
    track.appendChild(c);
  });

  const SPEED = 42; // px per second
  let period = 0;
  const measure = () => (period = track.children[originals.length].offsetLeft - track.children[0].offsetLeft);
  measure();
  new ResizeObserver(measure).observe(track);

  let x = 0;
  let v = 0; // fling velocity after a drag
  let hover = false, focus = false, held = false, userPaused = reduceMotion.matches, visible = true;
  let dragging = false, down = false, moved = false;
  let startX = 0, startPos = 0, lastX = 0, lastT = 0, resumeTimer;

  const wrap = () => {
    if (!period) return;
    x = (((x % period) + period) % period) - period; // keep within (-period, 0]
    if (x <= -period) x += period;
  };
  const paint = () => (track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`);
  const moving = () => !hover && !focus && !held && !userPaused && visible;

  const setUserPaused = (p) => {
    userPaused = p;
    toggle.setAttribute('aria-pressed', String(p));
    toggle.setAttribute('aria-label', p ? 'Play broth carousel' : 'Pause broth carousel');
    toggle.innerHTML = `<i class="ph-fill ${p ? 'ph-play' : 'ph-pause'}" aria-hidden="true"></i>`;
  };
  setUserPaused(userPaused);
  toggle.addEventListener('click', () => setUserPaused(!userPaused));

  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging) {
      if (Math.abs(v) > 5) {
        x += v * dt;
        v *= Math.pow(0.04, dt); // ease the fling out
      } else if (moving()) {
        x -= SPEED * dt;
      }
      wrap();
      paint();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // pause on hover / keyboard focus so cards can be clicked
  view.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && (hover = true));
  view.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && (hover = false));
  view.addEventListener('focusin', (e) => {
    focus = true;
    // bring a keyboard-focused card fully into view
    const card = e.target.closest('.loop__item');
    if (!card) return;
    const left = card.offsetLeft + x;
    const right = left + card.offsetWidth;
    if (left < 0) x -= left - 16;
    else if (right > view.clientWidth) x -= right - view.clientWidth + 16;
    wrap();
    paint();
  });
  view.addEventListener('focusout', (e) => !view.contains(e.relatedTarget) && (focus = false));

  // hold / drag / fling
  view.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    down = true; moved = false; held = true; v = 0;
    clearTimeout(resumeTimer);
    startX = lastX = e.clientX; startPos = x; lastT = e.timeStamp;
  });
  view.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!dragging && Math.abs(dx) > 6) {
      dragging = moved = true;
      view.setPointerCapture(e.pointerId);
      view.classList.add('is-dragging');
    }
    if (dragging) {
      const dt = Math.max(1, e.timeStamp - lastT);
      v = ((e.clientX - lastX) / dt) * 1000;
      lastX = e.clientX; lastT = e.timeStamp;
      x = startPos + dx;
      wrap();
      paint();
    }
  });
  const release = (e) => {
    if (!down) return;
    down = false;
    if (dragging) {
      dragging = false;
      view.classList.remove('is-dragging');
      if (e.timeStamp - lastT > 80) v = 0;
    }
    // touch users get a beat to tap before it moves again
    resumeTimer = setTimeout(() => (held = false), e.pointerType === 'mouse' ? 0 : 1800);
  };
  view.addEventListener('pointerup', release);
  view.addEventListener('pointercancel', release);
  view.addEventListener('click', (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
  view.addEventListener('dragstart', (e) => e.preventDefault());

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(view);
}

// ---------- menu ----------
function dishRow(item) {
  const tags = [
    item.isNew && '<span class="tag tag--new">New</span>',
    item.spicy && '<span class="tag tag--hot"><i class="ph-fill ph-pepper"></i>Spicy</span>',
    item.glutenFree && '<span class="tag tag--gf">GF</span>',
  ].filter(Boolean).join('');
  const sub = [item.nameZh && `<span class="dish__zh" lang="zh">${esc(item.nameZh)}</span>`, item.note && `<span>${esc(item.note)}</span>`, tags]
    .filter(Boolean).join('');
  return `<a class="dish" href="${ORDER_URL}" data-name="${esc((item.name + ' ' + item.nameZh + ' ' + item.cat).toLowerCase())}">
    <span class="dish__name">${esc(item.name)}</span>
    <span class="dish__price">${money(item.price)}</span>
    <span class="dish__sub">${sub}</span>
    <span class="dish__add" aria-hidden="true"><i class="ph ph-plus"></i></span>
  </a>`;
}

function renderMenu(byCat) {
  const tabs = $('[data-tabs]');
  const body = $('[data-menu]');
  if (!tabs || !body) return;
  const groups = GROUPS.map((g) => ({ ...g, cats: g.cats.filter((c) => byCat[c]) })).filter((g) => g.cats.length);

  tabs.innerHTML = groups.map((g, i) =>
    `<button class="tab" role="tab" id="tab-${g.id}" aria-controls="panel-${g.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${g.id}">${esc(g.label)}</button>`
  ).join('');

  body.innerHTML = groups.map((g, i) => `
    <div class="menu__group" role="tabpanel" id="panel-${g.id}" aria-labelledby="tab-${g.id}" ${i ? 'hidden' : ''} data-group="${g.id}">
      ${g.cats.map((c) => {
        const cat = byCat[c];
        const items = cat.items.map((it) => ({ ...tidy(it, c), cat: c }));
        const label = g.id === 'soup' ? c.replace(/ Soup$/, ' broth').replace('Fish Maw & Chicken Stock', 'Fish maw & chicken stock') : c;
        return `<section class="menu__cat" data-cat-block="${esc(c)}">
          <header class="menu__cat-head"><h3 class="menu__cat-name">${esc(label)}</h3>${cat.nameZh ? `<span class="menu__cat-zh" lang="zh">${esc(cat.nameZh)}</span>` : ''}</header>
          <div class="menu__items">${items.map(dishRow).join('')}</div>
        </section>`;
      }).join('')}
    </div>`).join('') + `<div class="menu__empty" hidden data-empty><strong>Nothing matches that.</strong>Try a broth, a protein, or a drink flavor like taro.</div>`;

  const select = (id, focus) => {
    $$('.tab', tabs).forEach((t) => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      if (on) {
        tabs.scrollTo({ left: t.offsetLeft - tabs.clientWidth / 2 + t.offsetWidth / 2, behavior: 'smooth' });
        if (focus) t.focus();
      }
    });
    $$('.menu__group', body).forEach((p) => (p.hidden = p.dataset.group !== id));
  };

  tabs.addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (!t) return;
    clearSearch();
    select(t.dataset.tab);
  });
  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const all = $$('.tab', tabs);
    const i = all.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const next = all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
    select(next.dataset.tab, true);
  });

  const input = $('[data-search]');
  const empty = $('[data-empty]');
  let lastTab = groups[0].id;
  const clearSearch = () => {
    if (!input.value) return;
    input.value = '';
    runSearch();
  };
  const runSearch = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      $$('.dish, .menu__cat', body).forEach((el) => (el.hidden = false));
      empty.hidden = true;
      select(lastTab);
      return;
    }
    const current = $('.tab[aria-selected="true"]', tabs);
    if (current) lastTab = current.dataset.tab;
    $$('.tab', tabs).forEach((t) => t.setAttribute('aria-selected', 'false'));
    let hits = 0;
    $$('.menu__group', body).forEach((p) => {
      let groupHits = 0;
      $$('.menu__cat', p).forEach((c) => {
        let n = 0;
        $$('.dish', c).forEach((d) => {
          const on = q.split(/\s+/).every((w) => d.dataset.name.includes(w));
          d.hidden = !on;
          n += on;
        });
        c.hidden = !n;
        groupHits += n;
      });
      p.hidden = !groupHits;
      hits += groupHits;
    });
    empty.hidden = hits > 0;
  };
  input.addEventListener('input', runSearch);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    clearSearch();
    select(a.dataset.jump);
    const block = a.dataset.cat && $(`[data-cat-block="${CSS.escape(a.dataset.cat)}"]`);
    if (block) {
      e.preventDefault();
      block.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
  });
}

function renderTea(byCat) {
  const list = $('[data-tea]');
  if (!list) return;
  const all = ['Bubble & Fruit Tea', 'Slusher', 'Yogurt'].flatMap((c) => byCat[c]?.items || []);
  const picks = FEATURED_DRINKS.map((n) => all.find((i) => i.name === n)).filter(Boolean);
  list.innerHTML = (picks.length >= 4 ? picks : all).slice(0, 6).map((d, i) => `
    <li class="drink reveal" style="--d:${i % 3}">
      <span class="drink__name">${esc(d.name)}</span>
      ${d.nameZh ? `<span class="drink__zh" lang="zh">${esc(d.nameZh)}</span>` : ''}
      <span class="drink__price">${money(d.price)}</span>
    </li>`).join('');
}

function renderSynced(data) {
  const el = $('[data-synced]');
  if (!el || !data.syncedAt) return;
  const d = new Date(data.syncedAt);
  el.textContent = `Prices come straight from our ordering system, last updated ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`;
}

// ---------- reviews ----------
function renderReviews() {
  $$('[data-rating]').forEach((el) => (el.textContent = RATING.score.toFixed(1)));
  $$('[data-rating-count]').forEach((el) => (el.textContent = `${RATING.count} Google reviews`));
  $$('[data-reviews-link]').forEach((a) => (a.href = RATING.url));
  $$('[data-review]').forEach((slot) => {
    const r = REVIEWS[Number(slot.dataset.review)];
    if (!r) return;
    slot.innerHTML = `<blockquote><p>“${esc(r.q)}”</p></blockquote>
      <figcaption><span class="stars" aria-label="5 out of 5 stars">${'<i class="ph-fill ph-star" aria-hidden="true"></i>'.repeat(5)}</span><span>${esc(r.who)}, Google review</span></figcaption>`;
  });
}

// ---------- chrome ----------
function chrome() {
  const nav = $('[data-nav]');
  const dock = $('[data-dock]');
  const sentinel = $('[data-top-sentinel]');
  if (sentinel) new IntersectionObserver(([e]) => nav.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);

  // keep the dock out of the way while a full-size order button or the footer is on screen
  if (dock) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      dock.classList.toggle('is-hidden', seen.size > 0);
    }, { threshold: 0.2 });
    $$('[data-hide-dock]').forEach((el) => io.observe(el));
  }

  // mobile menu sheet
  const burger = $('[data-burger]');
  const sheet = $('[data-sheet]');
  if (burger && sheet) {
    const set = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      burger.innerHTML = `<i class="ph ${open ? 'ph-x' : 'ph-list'}" aria-hidden="true"></i>`;
      sheet.hidden = !open;
      document.body.classList.toggle('sheet-open', open);
    };
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    sheet.addEventListener('click', (e) => e.target.closest('a') && set(false));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  const watch = () => $$('.reveal:not(.is-in)').forEach((el) => io.observe(el));
  watch();
  return watch;
}

// ---------- boot ----------
const watchReveals = chrome();
renderHours();
renderReviews();
setInterval(renderHours, 60_000);

if ($('[data-menu]') || $('[data-broths]')) {
  loadMenu()
    .then((data) => {
      const byCat = Object.fromEntries(data.categories.map((c) => [c.name, c]));
      renderBroths(byCat);
      renderMenu(byCat);
      renderTea(byCat);
      renderSynced(data);
      watchReveals();
    })
    .catch(() => {
      const menu = $('[data-menu]');
      if (menu) menu.innerHTML = `<div class="menu__empty"><strong>The menu didn't load.</strong>You can still browse and order on <a href="${ORDER_URL}">our ordering page</a>.</div>`;
      const tools = $('[data-menu-tools]');
      if (tools) tools.hidden = true;
    });
}
