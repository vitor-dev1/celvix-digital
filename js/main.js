/* =========================================================
   CELVIX DIGITAL — interactions
   Custom cursor · scroll reveal · counters · marquee · nav
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Custom cursor (blue dot + lagging ring) ---------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.matchMedia('(pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const hoverables = 'a, button, .svc-row, input, select, textarea, .stat, .step, .tcard, .team-card, .method-card';
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  /* ---------- Nav glassmorphism on scroll ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile hamburger menu ---------- */
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    const toggle = (force) => {
      const open = force !== undefined ? force : !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggle(false)));
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = (target * eased).toFixed(decimals);
        el.textContent = prefix + Number(val).toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + Number(target).toLocaleString('en-US') + suffix;
      };
      requestAnimationFrame(tick);
    };
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Marquee: duplicate track for seamless loop ---------- */
  const track = document.querySelector('.marquee-track');
  if (track && !track.dataset.cloned) {
    track.innerHTML += track.innerHTML;
    track.dataset.cloned = 'true';
  }

  /* ---------- Contact form (front-end demo handler) ---------- */
  const form = document.querySelector('#lead-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = form.querySelector('.form-success');
      if (ok) ok.classList.add('show');
      form.querySelectorAll('input,select,textarea').forEach((f) => { if (f.type !== 'submit') f.value = ''; });
      setTimeout(() => ok && ok.classList.remove('show'), 6000);
    });
  }

  /* ---------- FAQ accordion (accessible, single-open) ---------- */
  const faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  if (faqItems.length) {
    const closeItem = (item) => {
      const btn = item.querySelector('.faq-q');
      const panel = item.querySelector('.faq-a');
      item.classList.remove('open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.style.maxHeight = null;
    };
    faqItems.forEach((item) => {
      const btn = item.querySelector('.faq-q');
      const panel = item.querySelector('.faq-a');
      if (!btn || !panel) return;
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('open');
        faqItems.forEach((o) => { if (o !== item) closeItem(o); });
        if (willOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
          closeItem(item);
        }
      });
    });
    /* Keep an open panel correctly sized on resize */
    let raf;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const open = document.querySelector('.faq-item.open .faq-a');
        if (open) open.style.maxHeight = open.scrollHeight + 'px';
      });
    }, { passive: true });
  }

  /* ---------- Footer year ---------- */
  const y = document.querySelector('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
