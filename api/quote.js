// api/quote.js — the website's own quote form, delivered into Platy.
//
//   POST /api/quote  (from quote.js on the homepage and the service / town pages)
//
// Platy's public request-form API (POST https://app.getplaty.com/api/f/<slug>) does the real work:
// it resolves Yard Dog's company from the form slug, validates every field against the form's own
// settings, files the request, creates or matches the client, and notifies Miller. It sends nothing
// to the visitor. The browser cannot call it directly (no CORS on that route), so this same-origin
// function forwards the fields server-side and hands Platy's answer straight back, error messages
// included, so the visitor sees Platy's exact wording.
//
// Same slug as the official Platy embed on /contact, so both land in the same Requests queue.
// The honeypot (pf_ref) is passed through untouched: Platy saves a tripped submission flagged as
// suspected spam and skips the owner notification. It is never silently dropped here.

const PLATY_FORM_URL = 'https://app.getplaty.com/api/f/k10wty88jnyk6dfl2jsmve';

const str = (v, n) => String(v == null ? '' : v).slice(0, n);
const list = (v, n, each) => (Array.isArray(v) ? v : []).filter((x) => typeof x === 'string').slice(0, n).map((x) => x.slice(0, each));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'Bad request' });

  const page = str(b.page, 120);
  const details = str(b.details, 4800);
  const payload = {
    first_name: str(b.first_name, 60),
    last_name: str(b.last_name, 60),
    email: str(b.email, 200),
    phone: str(b.phone, 40),
    address: str(b.address, 300),
    // Which page the lead came from is useful to Miller and costs the customer nothing to read.
    details: page ? `${details}\n\n(Sent from yarddoglandscapes.com${page})` : details,
    services: list(b.services, 20, 80),
    service_other: str(b.service_other, 160),
    how_heard: str(b.how_heard, 200),
    sms_consent: b.sms_consent === true,
    consent_text: b.sms_consent === true ? str(b.consent_text, 2000) : '',
    photo_count: 0,
    pf_ref: str(b.pf_ref, 200),
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(PLATY_FORM_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'yarddoglandscapes.com quote form' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j && j.ok) return res.status(200).json({ ok: true });
    console.error('[quote] platy refused', r.status, j && j.error);
    return res.status(r.status >= 400 && r.status < 500 ? r.status : 502)
      .json({ ok: false, error: (j && j.error) || 'That did not go through. Please try again, or text (903) 522-5291.' });
  } catch (e) {
    console.error('[quote] platy unreachable', e && e.message);
    return res.status(502).json({ ok: false, error: 'Could not send that just now. Please try again, or text (903) 522-5291.' });
  } finally {
    clearTimeout(timer);
  }
}
