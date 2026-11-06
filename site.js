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
      document.documentElement.classList.toggle('menu-open', !open);  // hides the sticky quote bar while the menu is open
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mn.hidden) { mn.hidden = true; mb.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('menu-open'); mb.focus(); }
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

  // seasonal booking pop-up: leaf removal + Christmas lights. Opens after 5 seconds or a little scrolling, never
  // over a form someone is typing in, and stays closed for a few days once dismissed (for the season once a quote link is used).
  (function () {
    var END = new Date(2027, 0, 1), KEY = 'yd_promo_2026', DAY = 864e5;
    if (new Date() >= END || /^\/(contact|careers|privacy|terms|404)(\.html)?\/?$/.test(location.pathname)) return;
    var get = function () { try { return +(localStorage.getItem(KEY) || 0); } catch (e) { return 0; } };
    var set = function (t) { try { localStorage.setItem(KEY, String(t)); } catch (e) {} };
    if (get() > Date.now() - 3 * DAY) return;
    var shown = false, timer = 0;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var track = function (name, extra) { try { if (window.gtag) gtag('event', name, extra || {}); } catch (e) {} };
    function busy() {
      var a = document.activeElement, lb = $('#lb');
      return (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || (lb && !lb.hidden) || document.documentElement.classList.contains('menu-open');
    }
    function onScroll() { if ((window.scrollY || 0) > Math.min(420, window.innerHeight * 0.35)) open(); }
    function open() {
      if (shown) return;
      if (busy()) { clearTimeout(timer); timer = setTimeout(open, 4000); return; }
      shown = true; clearTimeout(timer); window.removeEventListener('scroll', onScroll);
      var back = document.activeElement;
      var w = document.createElement('div');
      w.className = 'promo';
      w.innerHTML =
        '<div class="pc" role="dialog" aria-modal="true" aria-labelledby="promoH" tabindex="-1">' +
        '<button type="button" class="px" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="phd"><img src="/img/promo/yard-dog-head.webp" width="96" height="111" alt=""><h2 id="promoH">Booking now for November &amp; December</h2></div>' +
        '<p class="ps">Leaf removal and Christmas lights are both on the schedule. Pick one for a free quote and we\'ll get back to you within a day.</p>' +
        '<div class="pg2">' +
        '<a class="po" href="/leaf-removal#q" data-s="leaf-removal"><div class="im"><img src="/img/promo/leaf-vacuum-trailer-wide.webp" width="800" height="600" alt="Yard Dog crew at the leaf vacuum trailer, loaded with leaves"></div>' +
        '<div class="tx"><h3>Leaf removal</h3><p>Blown off, vacuumed up and hauled away. The only leaf vacuum trailer in the area.</p><span class="btn">Get a leaf quote</span></div></a>' +
        '<a class="po" href="/christmas-lights#q" data-s="christmas-lights"><div class="im"><img src="/img/promo/christmas-lights-roofline.webp" width="640" height="480" alt="Warm white Christmas lights outlining a roofline at night"></div>' +
        '<div class="tx"><h3>Christmas lights</h3><p>Custom-cut C9s on your roofline. We install them, take them down and store them.</p><span class="btn">Get a lights quote</span></div></a>' +
        '</div></div>';
      document.body.appendChild(w);
      var card = $('.pc', w);
      function close() {
        document.removeEventListener('keydown', onKey);
        w.classList.remove('on'); w.classList.add('out');   // slides back down, then the blur fades (CSS)
        setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, reduce ? 0 : 460);
        if (back && back.focus && document.contains(back)) try { back.focus({ preventScroll: true }); } catch (e) {}
      }
      function onKey(e) {
        if (e.key === 'Escape') { set(Date.now()); track('promo_close', { how: 'escape' }); close(); return; }
        if (e.key === 'Tab') {   // keep keyboard focus inside the pop-up while it is open
          var f = $$('button,a', card), first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
      $('.px', w).addEventListener('click', function () { set(Date.now()); track('promo_close', { how: 'x' }); close(); });
      w.addEventListener('click', function (e) { if (e.target === w) { set(Date.now()); track('promo_close', { how: 'backdrop' }); close(); } });
      $$('.po', w).forEach(function (a) {
        a.addEventListener('click', function () { set(Date.now() + 60 * DAY); track('promo_click', { service: a.getAttribute('data-s') }); close(); });
      });
      document.addEventListener('keydown', onKey);
      requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('on'); }); });
      try { card.focus({ preventScroll: true }); } catch (e) {}   // the dialog itself takes focus; Tab reaches the close button and both quote links
      track('promo_view', { page_path: location.pathname });
    }
    timer = setTimeout(open, 5000);
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // track calls and texts as GA4 events
  $$('a[href^="tel:"],a[href^="sms:"],a[href^="mailto:"]').forEach(function (l) {
    l.addEventListener('click', function () {
      try { if (window.gtag) gtag('event', l.href.indexOf('mailto:') === 0 ? 'email_click' : 'phone_click', { link_url: l.href, page_path: location.pathname }); } catch (e) {}
    });
  });
})();
