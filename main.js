/* ============================================================
   RIFT — MAIN.JS
   Custom cursor · Nav scroll · Hamburger · Hero canvas
   Hex map · Reveal observer · Counter animation
   Live feed simulation · Waitlist form
   ============================================================ */

'use strict';

/* ===== CUSTOM CURSOR ===== */
(function () {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  if (!cursor || !trail) return;

  let mx = -100, my = -100, tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animTrail() {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  })();
})();

/* ===== NAV SCROLL ===== */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ===== HAMBURGER ===== */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  document.querySelectorAll('.mm-link').forEach(l =>
    l.addEventListener('click', () => menu.classList.remove('open'))
  );
})();

/* ===== HERO CANVAS — Constellation field ===== */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ACCENT = [139, 127, 255];
  const COUNT  = 70;
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function initPts() {
    pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.26,
      r:  Math.random() * 1.6 + 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // move + draw dots
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT.join(',')},0.3)`;
      ctx.fill();
    }

    // connecting lines
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx   = pts[i].x - pts[j].x;
        const dy   = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.09;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${ACCENT.join(',')},${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize(); initPts(); draw();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); initPts(); }, 120);
  });
})();

/* ===== HEX MAP ===== */
(function () {
  const grid = document.getElementById('hexGrid');
  if (!grid) return;

  const pattern = [
    'p','p','t','t','e','c','c',
    'p','p','e','t','c','c','e',
    'e','p','t','t','c','e','a',
    'p','e','t','e','c','c','a',
    'e','p','e','c','c','a','a',
    'p','p','e','e','a','a','e',
    'e','p','t','e','a','a','a',
  ];
  const labels = { p: 'VD', t: 'TC', c: 'AB', a: 'UN', e: '' };
  const cls    = { p: 'hx-p', t: 'hx-t', c: 'hx-c', a: 'hx-a', e: 'hx-e' };
  const tips   = { p: 'Vorn Dominion', t: 'Tide Collective', c: 'Ashborn', a: 'The Unnamed', e: '' };

  pattern.forEach(type => {
    const h = document.createElement('div');
    h.className = `hex ${cls[type]}`;
    h.textContent = labels[type];
    if (tips[type]) h.title = tips[type];
    grid.appendChild(h);
  });
})();

/* ===== REVEAL ON SCROLL ===== */
(function () {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();

/* ===== COUNTER ANIMATION ===== */
(function () {
  const counters = document.querySelectorAll('.stat-n[data-target]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const fmt    = el.dataset.format;
      const suffix = el.dataset.suffix || '';
      const DURATION = 1500;
      const startTime = performance.now();

      function step(now) {
        const t    = Math.min((now - startTime) / DURATION, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val  = Math.round(ease * target);
        if (fmt === 'abbr') {
          el.textContent = val >= 1_000_000
            ? (val / 1_000_000).toFixed(1) + 'M'
            : val.toLocaleString();
        } else {
          el.textContent = val.toLocaleString() + suffix;
        }
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();

/* ===== LIVE FEED SIMULATION ===== */
(function () {
  const feed     = document.getElementById('feedEvents');
  const countEl  = document.getElementById('feedCount');
  if (!feed) return;

  const events = [
    { type: 'fe-combat',   badge: 'Combat',   text: '<strong>Sova</strong> (Ashborn) ambushes a Vorn supply convoy near the Ashfields. Three Vorn agents go offline.' },
    { type: 'fe-trade',    badge: 'Trade',     text: '<strong>Tide node #112</strong> lists 400 memory shards on the open exchange. Cleared in under 3 minutes.' },
    { type: 'fe-alliance', badge: 'Alliance',  text: '<strong>The Unnamed</strong> leaves a sealed offer at Ashborn gate. Contents unknown. Ashborn AI deliberates.' },
    { type: 'fe-combat',   badge: 'Combat',    text: '<strong>Kael</strong> defends a border hex for the 4th consecutive cycle. Vorn losses classified as significant.' },
    { type: 'fe-trade',    badge: 'Trade',     text: '<strong>Human player "Vexx"</strong> sells a recovered relic to Tide Collective for 2,800 knowledge tokens.' },
    { type: 'fe-alliance', badge: 'Alliance',  text: '<strong>Mira</strong> and <strong>Tide node #88</strong> formalize a new knowledge-sharing protocol. Effective immediately.' },
    { type: 'fe-combat',   badge: 'Combat',    text: '<strong>The Unnamed</strong> agent disappears from Sector 4. Last known contact: 6 minutes ago. No trace.' },
  ];

  let count = feed.querySelectorAll('.feed-event').length;

  function addEvent() {
    const ev  = events[Math.floor(Math.random() * events.length)];
    const div = document.createElement('div');
    div.className = 'feed-event';
    Object.assign(div.style, {
      opacity: '0', transform: 'translateY(-10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    });
    div.innerHTML = `
      <span class="fe-badge ${ev.type}">${ev.badge}</span>
      <div class="fe-text">${ev.text}</div>
      <div class="fe-time">just now</div>
    `;
    feed.insertBefore(div, feed.firstChild);
    requestAnimationFrame(() => {
      div.style.opacity   = '1';
      div.style.transform = 'translateY(0)';
    });

    count++;
    if (countEl) countEl.textContent = count + ' events';

    const all = feed.querySelectorAll('.feed-event');
    if (all.length > 5) {
      const last = all[all.length - 1];
      Object.assign(last.style, { opacity: '0', transform: 'translateY(6px)', transition: 'all 0.35s ease' });
      setTimeout(() => last.remove(), 380);
    }
  }

  // stagger the first addition so it feels live right away
  setTimeout(addEvent, 3000);
  setInterval(addEvent, 5500);
})();

/* ===== WAITLIST FORM ===== */
(function () {
  const form    = document.getElementById('ctaForm');
  const success = document.getElementById('ctaSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.opacity    = '0';
    form.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      form.style.display = 'none';
      success.classList.add('visible');
    }, 300);
  });
})();
