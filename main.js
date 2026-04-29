/**
 * RIFT — main.js
 * Custom cursor · Nav scroll · Mobile menu · Hero canvas
 * Hex map · Scroll reveal · Counter animation
 * Live feed · Waitlist form
 */

'use strict';

/* ── CUSTOM CURSOR ─────────────────────────────────────────────────────── */
(function () {
  const dot   = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  if (!dot || !trail) return;

  let mx = -200, my = -200, tx = -200, ty = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function loop() {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ── NAV SCROLL STATE ──────────────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
})();

/* ── MOBILE HAMBURGER ──────────────────────────────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  document.querySelectorAll('.mm-link').forEach(link =>
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    })
  );
})();

/* ── HERO CANVAS — Drifting constellation ──────────────────────────────── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx   = canvas.getContext('2d');
  const RGB   = [139, 127, 255];   /* accent violet */
  const COUNT = 72;
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function populate() {
    pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r:  Math.random() * 1.5 + 0.4,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RGB},0.28)`;
      ctx.fill();
    }

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx   = pts[i].x - pts[j].x;
        const dy   = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${RGB},${(1 - dist / 130) * 0.09})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  resize(); populate(); frame();

  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { resize(); populate(); }, 150);
  });
})();

/* ── HEX MAP ────────────────────────────────────────────────────────────── */
(function () {
  const grid = document.getElementById('hexGrid');
  if (!grid) return;

  /* 7×7 grid of faction tiles */
  const map = [
    'p','p','t','t','e','c','c',
    'p','p','e','t','c','c','e',
    'e','p','t','t','c','e','a',
    'p','e','t','e','c','c','a',
    'e','p','e','c','c','a','a',
    'p','p','e','e','a','a','e',
    'e','p','t','e','a','a','a',
  ];

  const LABEL = { p: 'VD', t: 'TC', c: 'AB', a: 'UN', e: '' };
  const CLS   = { p: 'hx-p', t: 'hx-t', c: 'hx-c', a: 'hx-a', e: 'hx-e' };
  const TITLE = { p: 'Vorn Dominion', t: 'Tide Collective', c: 'Ashborn', a: 'The Unnamed', e: '' };

  map.forEach(type => {
    const cell = document.createElement('div');
    cell.className = `hex ${CLS[type]}`;
    cell.textContent = LABEL[type];
    if (TITLE[type]) cell.title = TITLE[type];
    grid.appendChild(cell);
  });
})();

/* ── SCROLL REVEAL ──────────────────────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => io.observe(el));
})();

/* ── COUNTER ANIMATION ──────────────────────────────────────────────────── */
(function () {
  const nodes = document.querySelectorAll('.stat-number[data-target]');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const format = el.dataset.format || '';
      const suffix = el.dataset.suffix || '';
      const DURATION = 1500;
      const t0 = performance.now();

      function tick(now) {
        const progress = Math.min((now - t0) / DURATION, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = Math.round(eased * target);

        if (format === 'abbr') {
          el.textContent = value >= 1_000_000
            ? (value / 1_000_000).toFixed(1) + 'M'
            : value.toLocaleString();
        } else {
          el.textContent = value.toLocaleString() + suffix;
        }

        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nodes.forEach(n => io.observe(n));
})();

/* ── LIVE FEED SIMULATION ───────────────────────────────────────────────── */
(function () {
  const list    = document.getElementById('feedList');
  const counter = document.getElementById('feedCount');
  if (!list) return;

  const EVENTS = [
    {
      type: 'badge-combat', label: 'Combat',
      text: '<strong>Sova</strong> (Ashborn) ambushes a Vorn supply convoy near the Ashfields. Three Vorn agents go offline.',
    },
    {
      type: 'badge-trade', label: 'Trade',
      text: '<strong>Tide node #112</strong> lists 400 memory shards on the open exchange. Cleared in under 3 minutes.',
    },
    {
      type: 'badge-alliance', label: 'Alliance',
      text: '<strong>The Unnamed</strong> leaves a sealed offer at Ashborn gate. Contents unknown. Ashborn AI council deliberates.',
    },
    {
      type: 'badge-combat', label: 'Combat',
      text: '<strong>Kael</strong> defends a border hex for the 4th consecutive cycle. Vorn losses are classified as significant.',
    },
    {
      type: 'badge-trade', label: 'Trade',
      text: '<strong>Human player "Vexx"</strong> sells a recovered relic to Tide Collective for 2,800 knowledge tokens.',
    },
    {
      type: 'badge-alliance', label: 'Alliance',
      text: '<strong>Mira</strong> and <strong>Tide node #88</strong> formalize a new knowledge-sharing protocol. Effective immediately.',
    },
    {
      type: 'badge-combat', label: 'Combat',
      text: '<strong>The Unnamed</strong> agent vanishes from Sector 4. Last known contact: 6 minutes ago. No trace left behind.',
    },
  ];

  let total = list.querySelectorAll('.feed-event').length;

  function addEvent() {
    const ev  = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const row = document.createElement('div');
    row.className = 'feed-event';
    Object.assign(row.style, { opacity: '0', transform: 'translateY(-10px)', transition: 'opacity .4s ease, transform .4s ease' });
    row.innerHTML = `
      <span class="event-badge ${ev.type}">${ev.label}</span>
      <p class="event-text">${ev.text}</p>
      <span class="event-time">just now</span>
    `;

    list.insertBefore(row, list.firstChild);
    requestAnimationFrame(() => {
      row.style.opacity   = '1';
      row.style.transform = 'translateY(0)';
    });

    total++;
    if (counter) counter.textContent = total + ' events';

    /* trim to max 5 rows */
    const rows = list.querySelectorAll('.feed-event');
    if (rows.length > 5) {
      const last = rows[rows.length - 1];
      Object.assign(last.style, { opacity: '0', transform: 'translateY(6px)', transition: 'all .35s ease' });
      setTimeout(() => last.remove(), 380);
    }
  }

  setTimeout(addEvent, 3000);
  setInterval(addEvent, 5500);
})();

/* ── WAITLIST FORM ──────────────────────────────────────────────────────── */
(function () {
  const form    = document.getElementById('ctaForm');
  const success = document.getElementById('ctaSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.transition = 'opacity .3s';
    form.style.opacity    = '0';
    setTimeout(() => {
      form.style.display = 'none';
      success.classList.add('visible');
    }, 320);
  });
})();
