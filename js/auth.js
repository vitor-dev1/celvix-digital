// =========================================================
// PROTOTYPE AUTH ONLY — In production, authentication is handled
// externally. Credentials defined here are client-side and visible
// in source; do not treat this as real security.
// =========================================================
(function () {
  'use strict';

  /* ---------- Prototype member directory (single standard member) ---------- */
  // PROTOTYPE ONLY — visible in source. One standard member, no admin / elevated role.
  var MEMBERS = [
    {
      email: 'vitorrhugo.silvaa@gmail.com',
      password: '1212Seef.',
      name: 'Vitor',
      role: 'member'
    }
  ];

  var KEY_AUTH = 'celvix_member';
  var KEY_NAME = 'celvix_name';

  /* ---------- Public helpers ---------- */
  var Auth = {
    isAuthed: function () {
      return sessionStorage.getItem(KEY_AUTH) === 'true';
    },
    name: function () {
      return sessionStorage.getItem(KEY_NAME) || 'Partner';
    },
    signOut: function () {
      sessionStorage.removeItem(KEY_AUTH);
      sessionStorage.removeItem(KEY_NAME);
      window.location.href = 'login.html';
    },
    /* Returns the matched member object or null */
    validate: function (email, password) {
      var e = String(email || '').trim().toLowerCase();
      var p = String(password || '');
      for (var i = 0; i < MEMBERS.length; i++) {
        if (MEMBERS[i].email.toLowerCase() === e && MEMBERS[i].password === p) {
          return MEMBERS[i];
        }
      }
      return null;
    },
    grant: function (member) {
      sessionStorage.setItem(KEY_AUTH, 'true');
      sessionStorage.setItem(KEY_NAME, member.name);
    }
  };

  /* ---------- Route gate (used by members.html) ---------- */
  // Pages opt in by adding <body data-protected> — runs before paint where possible.
  if (document.body && document.body.hasAttribute('data-protected') && !Auth.isAuthed()) {
    window.location.replace('login.html');
    return;
  }

  /* ---------- Login form wiring (used by login.html) ---------- */
  var form = document.querySelector('#login-form');
  if (form) {
    var card = document.querySelector('.login-card');
    var errorEl = form.querySelector('.login-error');
    var btn = form.querySelector('.login-submit');
    var emailEl = form.querySelector('#login-email');
    var passEl = form.querySelector('#login-password');
    var toggle = form.querySelector('.pw-toggle');

    /* If already signed in, skip straight to the hub */
    if (Auth.isAuthed()) {
      window.location.replace('members.html');
      return;
    }

    /* Show / hide password */
    if (toggle && passEl) {
      toggle.addEventListener('click', function () {
        var show = passEl.type === 'password';
        passEl.type = show ? 'text' : 'password';
        toggle.classList.toggle('is-visible', show);
        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    }

    var hideError = function () {
      if (errorEl) errorEl.classList.remove('show');
    };
    emailEl && emailEl.addEventListener('input', hideError);
    passEl && passEl.addEventListener('input', hideError);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn && btn.classList.contains('is-loading')) return;

      var member = Auth.validate(emailEl.value, passEl.value);

      if (!member) {
        /* Failure → reveal error + shake the card */
        if (errorEl) errorEl.classList.add('show');
        if (card) {
          card.classList.remove('shake');
          // force reflow so the animation can re-trigger
          void card.offsetWidth;
          card.classList.add('shake');
        }
        return;
      }

      /* Success → brief loading state, then grant + redirect */
      if (btn) btn.classList.add('is-loading');
      hideError();
      window.setTimeout(function () {
        Auth.grant(member);
        window.location.href = 'members.html';
      }, 850);
    });
  }

  /* ---------- Sign-out buttons (used by members.html) ---------- */
  document.querySelectorAll('[data-signout]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      Auth.signOut();
    });
  });

  /* ---------- Personalize any [data-member-name] targets ---------- */
  if (Auth.isAuthed()) {
    document.querySelectorAll('[data-member-name]').forEach(function (el) {
      el.textContent = Auth.name();
    });
  }

  /* Expose for any inline needs */
  window.CelvixAuth = Auth;
})();
