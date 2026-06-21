/* =========================================================
   CELVIX PARTNERS — Members hub interactions
   Instagram field · onboarding step tracker · completion modal · confetti
   (members.html only)
   ========================================================= */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Storage keys */
  var ONB_KEY = 'celvix_onboarding';
  var ONB_STEP_KEY = 'celvix_onboarding_step';
  var ONB_DONE_KEY = 'celvix_onboarding_complete';
  var IG_KEY = 'celvix_instagram';

  /* ---------- helpers ---------- */
  function normHandle(v) {
    return String(v || '')
      .trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^@+/, '')
      .replace(/\s+/g, '')
      .replace(/\/+$/, '');
  }

  /* =========================================================
     UPGRADE 2 — Instagram field (welcome chip)
     ========================================================= */
  var igInput = $('ig-input');
  var igOpen = $('ig-open');

  function renderIGChip(handle) {
    if (igInput) igInput.value = handle ? '@' + handle : '';
    if (igOpen) {
      if (handle) { igOpen.href = 'https://instagram.com/' + handle; igOpen.style.display = ''; }
      else { igOpen.style.display = 'none'; }
    }
  }

  /* Single source of truth — updates storage, the chip, and the onboarding step */
  function setInstagram(raw) {
    var handle = normHandle(raw);
    if (handle) localStorage.setItem(IG_KEY, handle);
    else localStorage.removeItem(IG_KEY);

    /* keep onboarding answers in sync */
    var data = loadOnb();
    data.instagram = handle;
    saveOnb(data);

    renderIGChip(handle);
    var obIg = $('onb-field-input');
    if (obIg && obIg.getAttribute('data-key') === 'instagram') {
      obIg.value = handle ? '@' + handle : '';
    }
    return handle;
  }

  if (igInput) {
    renderIGChip(localStorage.getItem(IG_KEY) || '');
    igInput.addEventListener('blur', function () { setInstagram(igInput.value); });
    igInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); igInput.blur(); }
    });
  }

  /* =========================================================
     UPGRADE 3 — Onboarding step tracker
     ========================================================= */
  var STEPS = [
    { key: 'name', label: 'What should we call you?', help: 'This is how our team will address you on your strategy call.', type: 'text', placeholder: 'Your full name', required: true },
    { key: 'business', label: 'Your business or brokerage', help: 'The name you operate under in your market.', type: 'text', placeholder: 'e.g. Celvix Realty Group', required: true },
    { key: 'market', label: 'Your primary market', help: 'The city or area where you list and sell.', type: 'text', placeholder: 'e.g. Miami, FL', required: true },
    { key: 'ticket', label: 'Average property ticket', help: 'The average sale price of the properties you sell.', type: 'select', required: true, options: ['Under $250k', '$250k – $500k', '$500k – $1M', '$1M – $3M', '$3M and above'] },
    { key: 'challenge', label: 'Your biggest challenge right now', help: 'So we can tailor your 1-on-1 strategy session.', type: 'select', required: true, options: ['Lead generation', 'Content & branding', 'Closing & objections', 'Pricing & listings', 'Scaling the business', 'Other'] },
    { key: 'instagram', label: 'Your Instagram handle', help: 'Your main sales channel — this syncs with your dashboard.', type: 'text', placeholder: '@youragency' },
    { key: 'socials', label: 'Your other channels', help: 'Optional — add any platforms you actively use.', type: 'socials' },
    { key: 'volume', label: 'Your monthly sales volume', help: 'Roughly how many properties you close each month.', type: 'select', required: true, options: ['0 – 2 sales / month', '3 – 5 sales / month', '6 – 10 sales / month', '10+ sales / month'] }
  ];
  var SOCIALS = [
    { key: 'tiktok', label: 'TikTok', ph: '@youragency' },
    { key: 'youtube', label: 'YouTube', ph: 'Channel URL or @handle' },
    { key: 'facebook', label: 'Facebook', ph: 'Page name or URL' },
    { key: 'linkedin', label: 'LinkedIn', ph: 'Profile URL' },
    { key: 'website', label: 'Website', ph: 'https://yoursite.com' }
  ];
  var SUMMARY_FIELDS = [
    { key: 'name', label: 'Name' },
    { key: 'business', label: 'Business' },
    { key: 'market', label: 'Market' },
    { key: 'ticket', label: 'Avg. ticket' },
    { key: 'challenge', label: 'Focus' },
    { key: 'instagram', label: 'Instagram', fmt: function (v) { return v ? '@' + v : '—'; } },
    { key: 'volume', label: 'Volume' }
  ];

  function loadOnb() { try { return JSON.parse(localStorage.getItem(ONB_KEY)) || {}; } catch (e) { return {}; } }
  function saveOnb(d) { localStorage.setItem(ONB_KEY, JSON.stringify(d)); }

  var onboarding = $('onboarding');
  if (onboarding) {
    var shellHTML = onboarding.innerHTML;     /* stepper skeleton, kept for re-entry */
    var data = loadOnb();
    var current = 0;

    /* prefill name from session if not yet answered */
    if (!data.name && window.CelvixAuth && CelvixAuth.isAuthed && CelvixAuth.isAuthed()) {
      var n = CelvixAuth.name();
      if (n && n !== 'Partner') data.name = n;
    }

    if (localStorage.getItem(ONB_DONE_KEY) === 'true') {
      renderComplete();
    } else {
      current = Math.min(parseInt(localStorage.getItem(ONB_STEP_KEY) || '0', 10) || 0, STEPS.length - 1);
      initStepper();
    }
  }

  function initStepper() {
    onboarding.innerHTML = shellHTML;
    buildDots();
    bindNav();
    renderStep();
  }

  function buildDots() {
    var dots = $('onb-dots');
    if (!dots) return;
    dots.innerHTML = STEPS.map(function (s, i) {
      return '<div class="onb-dot" data-i="' + i + '"><div class="num">' + (i + 1) + '</div><div class="bar"></div></div>';
    }).join('');
  }

  function updateChrome() {
    var pct = Math.round((current / (STEPS.length - 1)) * 100);
    var bar = $('onb-bar'); if (bar) bar.style.width = pct + '%';
    var count = $('onb-count'); if (count) count.textContent = 'Step ' + (current + 1) + ' of ' + STEPS.length;
    var dots = document.querySelectorAll('.onb-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === current);
      d.classList.toggle('done', i < current);
    });
    var back = $('onb-back'); if (back) back.classList.toggle('show', current > 0);
    var next = $('onb-next');
    if (next) next.querySelector('.label').textContent = (current === STEPS.length - 1) ? 'Complete Profile' : 'Next';
  }

  function renderStep() {
    var step = STEPS[current];
    var stage = $('onb-stage');
    if (!stage) return;
    var html = '<div class="onb-step"><div class="onb-field">';
    html += '<div class="onb-label">' + step.label + '</div>';
    if (step.help) html += '<div class="onb-help">' + step.help + '</div>';

    if (step.type === 'select') {
      html += '<select class="onb-select" id="onb-field-input" data-key="' + step.key + '">';
      html += '<option value="">Select an option…</option>';
      step.options.forEach(function (o) {
        var sel = (data[step.key] === o) ? ' selected' : '';
        html += '<option value="' + o + '"' + sel + '>' + o + '</option>';
      });
      html += '</select>';
    } else if (step.type === 'socials') {
      html += '<div class="onb-socials">';
      SOCIALS.forEach(function (f) {
        var val = (data[f.key] || '').replace(/"/g, '&quot;');
        html += '<div><label class="onb-field-label" for="onb-' + f.key + '">' + f.label + '</label>' +
          '<input class="onb-input" id="onb-' + f.key + '" type="text" placeholder="' + f.ph + '" value="' + val + '" /></div>';
      });
      html += '</div>';
    } else {
      var v = step.key === 'instagram'
        ? ((data.instagram || localStorage.getItem(IG_KEY) || '') ? '@' + normHandle(data.instagram || localStorage.getItem(IG_KEY)) : '')
        : (data[step.key] || '');
      v = String(v).replace(/"/g, '&quot;');
      html += '<input class="onb-input" id="onb-field-input" data-key="' + step.key + '" type="text" placeholder="' +
        step.placeholder + '" value="' + v + '" />';
    }
    html += '<div class="onb-err" id="onb-err">Please complete this field to continue.</div>';
    html += '</div></div>';
    stage.innerHTML = html;
    updateChrome();

    var first = stage.querySelector('input, select');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    stage.querySelectorAll('input, select').forEach(function (el) {
      el.addEventListener('input', clearErr);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && el.tagName !== 'SELECT') { e.preventDefault(); goNext(); }
      });
    });
  }

  function storeCurrent() {
    var step = STEPS[current];
    if (step.type === 'socials') {
      SOCIALS.forEach(function (f) { var el = $('onb-' + f.key); if (el) data[f.key] = el.value.trim(); });
    } else {
      var el = $('onb-field-input');
      if (el) {
        var val = el.value.trim();
        if (step.key === 'instagram') { data.instagram = setInstagram(val); }
        else { data[step.key] = val; }
      }
    }
    saveOnb(data);
    localStorage.setItem(ONB_STEP_KEY, String(current));
  }

  function validateCurrent() {
    var step = STEPS[current];
    if (!step.required) return true;
    return !!(data[step.key] && String(data[step.key]).trim());
  }

  function clearErr() {
    var err = $('onb-err'); if (err) err.classList.remove('show');
  }
  function showErr() {
    var err = $('onb-err'); if (err) err.classList.add('show');
    var field = document.querySelector('.onb-field');
    if (field && !prefersReduced) { field.classList.remove('shake'); void field.offsetWidth; field.classList.add('shake'); }
  }

  function goNext() {
    storeCurrent();
    if (!validateCurrent()) { showErr(); return; }
    if (current === STEPS.length - 1) { complete(); return; }
    current++;
    localStorage.setItem(ONB_STEP_KEY, String(current));
    renderStep();
  }
  function goBack() {
    storeCurrent();
    if (current > 0) current--;
    localStorage.setItem(ONB_STEP_KEY, String(current));
    renderStep();
  }

  function bindNav() {
    var next = $('onb-next'); if (next) next.addEventListener('click', goNext);
    var back = $('onb-back'); if (back) back.addEventListener('click', goBack);
  }

  function complete() {
    localStorage.setItem(ONB_DONE_KEY, 'true');
    saveOnb(data);
    renderComplete();
    openModal();
  }

  function renderComplete() {
    data = loadOnb();
    var items = SUMMARY_FIELDS.map(function (f) {
      var raw = data[f.key];
      var val = f.fmt ? f.fmt(raw) : (raw || '—');
      return '<div class="it"><div class="k">' + f.label + '</div><div class="v">' + (val || '—') + '</div></div>';
    }).join('');

    onboarding.innerHTML =
      '<div class="onb-complete">' +
        '<div class="onb-check">&#10003;</div>' +
        '<h2>Your partner profile is complete</h2>' +
        '<p>Thank you. Our team now has what we need to prepare your 1-on-1 strategy session — we\'ll reach out shortly to schedule it.</p>' +
        '<div class="onb-summary">' + items + '</div>' +
        '<button class="btn btn-ghost" id="onb-edit"><span class="label">Edit profile</span></button>' +
      '</div>';

    var edit = $('onb-edit');
    if (edit) edit.addEventListener('click', function () {
      localStorage.removeItem(ONB_DONE_KEY);
      current = 0;
      localStorage.setItem(ONB_STEP_KEY, '0');
      initStepper();
      onboarding.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* =========================================================
     UPGRADE 3 — Completion modal + confetti
     ========================================================= */
  var overlay = $('onb-modal');

  function openModal() {
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    burstConfetti();
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.hasAttribute('data-modal-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  function burstConfetti() {
    if (prefersReduced) return;
    var holder = $('onb-confetti');
    if (!holder) return;
    holder.innerHTML = '';
    var colors = ['#C9A96E', '#E8D5A3', '#D4BA88', '#F5F0E8', '#B8955A'];
    for (var i = 0; i < 80; i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (0.9 + Math.random() * 1.6).toFixed(2) + 's';
      p.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
      p.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
      p.style.height = (10 + Math.random() * 8).toFixed(0) + 'px';
      holder.appendChild(p);
    }
    setTimeout(function () { holder.innerHTML = ''; }, 3200);
  }
})();
