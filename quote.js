/* Yard Dog quote form -> /api/quote -> Platy (Yard Dog's request form, same fields as the Platy embed).
   Two steps: the work, then contact info. The server re-checks everything; messages it returns are shown as-is. */
(function () {
  'use strict';
  var forms = document.querySelectorAll('form[data-quote]');
  if (!forms.length) return;

  var FULL_ADDR = /^#?\s*\d+[A-Za-z]?(?:-\d+)?\s+[A-Za-z0-9].*\b\d{5}(?:-\d{4})?\b/;

  Array.prototype.forEach.call(forms, function (f) {
    var s1 = f.querySelector('[data-step="1"]'), s2 = f.querySelector('[data-step="2"]');
    var steps = f.querySelectorAll('.qsteps li');
    var done = f.querySelector('.qdone');
    function err(step, msg) {
      var box = step.querySelector('.qerr');
      if (!msg) { box.hidden = true; box.textContent = ''; return; }
      box.textContent = msg; box.hidden = false;
    }
    function val(name) { var el = f.elements[name]; return el ? String(el.value || '').trim() : ''; }
    function picks() {
      var svc = [], other = [];
      Array.prototype.forEach.call(f.querySelectorAll('input[name="pick"]:checked'), function (c) {
        if (c.getAttribute('data-kind') === 'svc') svc.push(c.value); else other.push(c.value);
      });
      return { services: svc, other: other };
    }
    function go(n) {
      s1.hidden = n !== 1; s2.hidden = n !== 2;
      if (steps.length) { steps[0].classList.toggle('on', n >= 1); steps[1].classList.toggle('on', n === 2); }
      var first = (n === 1 ? s1 : s2).querySelector('input:not([type=checkbox]):not(.hp),textarea');
      if (first && n === 2) first.focus();
    }
    function check1() {
      var p = picks();
      if (!p.services.length && !p.other.length) return 'Pick at least one thing you need.';
      if (!val('details')) return 'Tell us a little about the work.';
      if (!val('address')) return 'Please add the property address.';
      if (!FULL_ADDR.test(val('address'))) return 'Please add the full address: street, city and ZIP.';
      return '';
    }
    function check2() {
      if (!val('first_name') || !val('last_name')) return 'Please add your first and last name.';
      var d = val('phone').replace(/\D/g, '');
      if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
      if (d.length !== 10) return 'Enter all 10 digits of your phone number, including the area code.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('email'))) return 'Please add an email address we can reach you at.';
      return '';
    }
    f.querySelector('.qnext').addEventListener('click', function () {
      var m = check1(); err(s1, m); if (!m) go(2);
    });
    f.querySelector('.qback').addEventListener('click', function () { err(s2, ''); go(1); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var m1 = check1(); if (m1) { go(1); err(s1, m1); return; }
      var m = check2(); err(s2, m); if (m) return;
      var p = picks();
      var other = p.other.filter(function (x) { return x !== 'Something else'; });
      var consent = f.elements.sms_consent && f.elements.sms_consent.checked;
      var body = {
        first_name: val('first_name'), last_name: val('last_name'), phone: val('phone'), email: val('email'),
        address: val('address'), details: val('details'), services: p.services,
        service_other: other.join(', ') || (p.other.indexOf('Something else') > -1 ? 'Something else (see details)' : ''),
        how_heard: val('how_heard'), sms_consent: !!consent, consent_text: consent ? f.querySelector('.consent span').textContent : '',
        pf_ref: val('pf_ref'), page: location.pathname
      };
      var btn = f.querySelector('.qsend'); var label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending...';
      fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { return { r: r, j: j }; }); })
        .then(function (x) {
          if (x.r.ok && x.j && x.j.ok) {
            s1.hidden = true; s2.hidden = true; done.hidden = false;
            var hd = f.querySelector('.qh'); if (hd) hd.hidden = true;
            done.querySelector('.qn').textContent = val('first_name');
            done.scrollIntoView({ behavior: 'smooth', block: 'center' });
            try {
              if (window.gtag) gtag('event', 'generate_lead', { form_id: f.id, page_path: location.pathname, services: p.services.concat(p.other).join(', ') });
            } catch (e) { /* analytics never blocks a lead */ }
          } else {
            btn.disabled = false; btn.textContent = label;
            err(s2, (x.j && x.j.error) || 'That did not go through. Please try again, or call or text (903) 844-6877.');
          }
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          err(s2, 'Could not reach us just now. Check your connection and try again, or call or text (903) 844-6877.');
        });
    });
  });
})();
