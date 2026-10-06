(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // mobile menu
  var mb = $('.mb'), mn = $('#mnav');
  if (mb && mn) {
    mb.addEventListener('click', function () {
      var open = mb.getAttribute('aria-expanded') === 'true';
      mb.setAttribute('aria-expanded', String(!open)); mn.hidden = open;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mn.hidden) { mn.hidden = true; mb.setAttribute('aria-expanded', 'false'); mb.focus(); }
    });
  }

  // muted crew clips: play when loaded, staggered; respect reduced motion
  if (!window.YD_GALLERY) {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    $$('video[data-auto]').forEach(function (v) {
      if (reduce) { v.controls = true; return; }
      var d = +(v.getAttribute('data-delay') || 0);
      var go = function () { setTimeout(function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); }, d); };
      if (v.readyState >= 2) go(); else v.addEventListener('loadeddata', go, { once: true });
      v.load();
    });
  }

  // hide the sticky phone bar while a form or the closing call-to-action is on screen
  var mc = $('.mcta');
  if (mc && 'IntersectionObserver' in window) {
    var seen = new Set();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      mc.classList.toggle('off', seen.size > 0);
    }, { threshold: 0.15 });
    $$('form,.cta,.embedcard,footer.ft').forEach(function (el) { io.observe(el); });
  }

  // before / after sliders on the design preview page
  $$('.ba input[type=range]').forEach(function (r) {
    var box = r.closest('.ba');
    var set = function () { box.style.setProperty('--x', r.value + '%'); };
    r.addEventListener('input', set); set();
  });

  // track calls and texts as GA4 events
  $$('a[href^="tel:"],a[href^="sms:"],a[href^="mailto:"]').forEach(function (l) {
    l.addEventListener('click', function () {
      try { if (window.gtag) gtag('event', l.href.indexOf('mailto:') === 0 ? 'email_click' : 'phone_click', { link_url: l.href, page_path: location.pathname }); } catch (e) {}
    });
  });
})();
