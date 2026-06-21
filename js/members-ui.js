/* =========================================================
   CELVIX PARTNERS — Members area shared UI
   Sticky bar scroll state · mobile menu · in-page scroll-spy
   Loaded on the hub and every resource page.
   ========================================================= */
(function () {
  'use strict';

  /* Sticky bar glass state on scroll */
  var bar = document.querySelector('.member-bar');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu */
  var burger = document.querySelector('.member-burger');
  var menu = document.querySelector('.member-menu');
  if (burger && menu) {
    var toggle = function (force) {
      var open = force !== undefined ? force : !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { toggle(); });
    menu.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('click', function () { toggle(false); });
    });
  }

  /* Scroll-spy for active nav pills (only for same-page #anchors) */
  var pills = Array.prototype.slice.call(document.querySelectorAll('.member-pills a'));
  var sections = pills
    .map(function (a) {
      var href = a.getAttribute('href') || '';
      return href.charAt(0) === '#' ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          pills.forEach(function (p) { p.classList.toggle('active', p.getAttribute('href') === id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
