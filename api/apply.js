// api/apply.js — "Build the Bench" careers application intake.
//
//   POST /api/apply  (from the careers.html form)
//     1. drops obvious bots (honeypot company_website must be empty)
//     2. runs the deterministic KNOCKOUT so the page can tell the applicant
//        instantly whether they meet the basic eligibility/safety bar
//     3. inserts the raw application into yard_dog_applicants with the
//        LOW-PRIVILEGE publishable (anon) key
//     4. returns { ok, eligible } for the thank-you / not-a-fit message
//
// The authoritative scoring + Miller pings happen on the VM
// (scripts/tools/yd-applicant-triage.ts), which RE-DERIVES the knockout from
// raw_answers and never trusts submitted_eligible. This endpoint is the
// untrusted front door: anon can only INSERT new rows (RLS), never read.
//
// Env (Vercel project settings, same as api/go.js):
//   YARDDOG_SUPABASE_URL, YARDDOG_SUPABASE_PUBLISHABLE_KEY.
//
// LEGAL: knockout questions are phrased to stay clear of IRCA (work-auth only,
// never citizenship), ADEA (18-or-older yes/no, never DOB), ADA (essential
// functions with-or-without-accommodation, never medical), Texas HB 2466
// ban-the-box (screening stated POST-offer only), FCRA (post-offer consent),
// and Title VII religious accommodation (Saturday/Sabbath, post-Groff).
// Do not "improve" the wording without re-checking those.
//
// HB 2466 (eff. 9/1/2025) restricts application-stage criminal-history
// questions only for private employers with 15+ employees; Yard Dog is under
// that floor and exempt, so the post-offer posture here is a voluntary best
// practice, not a statutory requirement -- revisit if headcount reaches 15.
// The criminal-history question (ko_criminal_history) asks about CONVICTIONS
// only (never arrests) and is captured-but-not-auto-decided: an auto-reject on
// a conviction is the blanket exclusion the EEOC 2012 guidance condemns and
// forecloses the required individualized assessment.
//
// All eight knockout answers are collected + stored, but only the five
// OBJECTIVE gates auto-decide eligibility. Schedule (Saturday/early start),
// physical ability, and criminal history are captured-but-not-auto-rejected: a
// "No"/disclosure there carries Title VII / ADA / EEOC duties, so the VM triage
// tool flags it for a human conversation instead of a silent rejection.
const KO_FIELDS = ['ko_work_auth', 'ko_age_18', 'ko_license', 'ko_transport', 'ko_physical', 'ko_schedule', 'ko_screen_consent', 'ko_criminal_history'];
const HARD_GATES = [
  { id: 'ko_work_auth', pass: 'Yes' },
  { id: 'ko_age_18', pass: 'Yes' },
  { id: 'ko_license', pass: 'Yes' },
  { id: 'ko_transport', pass: 'Yes, every day' },
  { id: 'ko_screen_consent', pass: 'Yes' },
];

// form field -> human gear label used as the sc_equipment jsonb key. These
// labels are the SCORING KEY and must stay byte-identical to CORE_GEAR /
// LANDSCAPE_GEAR in yd-applicant-triage.ts. Do NOT change them to match
// on-screen helper text (e.g. the form shows "String trimmer (weed eater)"
// but the key here and in the scorer is the bare "String trimmer").
const EQUIP_FIELDS = {
  equip_zero_turn: 'Zero-turn mower',
  equip_push_mower: 'Push mower',
  equip_string_trimmer: 'String trimmer',
  equip_stick_edger: 'Stick edger',
  equip_backpack_blower: 'Backpack blower',
  equip_skid_steer: 'Skid steer',
  equip_mini_excavator: 'Mini-excavator',
  equip_plate_compactor: 'Plate compactor',
  equip_chainsaw: 'Chainsaw',
};

const CONTACT_FIELDS = ['full_name', 'phone', 'email', 'city', 'crew_pref'];
const SCORED_TEXT = ['sc_years_exp', 'sc_last_jobs', 'sc_tenure_reason', 'sc_pride', 'sc_scenario', 'sc_why_yarddog'];

// Two industry-experience yes/no screens (added 2026-07-13, Miller's ask:
// going forward he only hires "Yes" on both). Stored INSIDE raw_answers only,
// NOT as top-level typed columns — there is no DB migration for them, and a
// top-level key without a matching column makes PostgREST 400 the whole insert
// (PGRST204) and the application is silently lost (see migration 023's note).
// raw_answers is jsonb, so extra keys are safe. yd-applicant-triage.ts reads
// them via answer() (raw_answers-first) and flags a "No"; the dashboard reads
// them out of raw_answers. Promote to typed columns later with a migration if
// analytics need it.
const EXP_FIELDS = ['sc_exp_landscaping', 'sc_exp_mowing_commercial'];

function str(v) {
  return v == null ? '' : String(v).trim();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
  }

  // Body may arrive parsed (application/json) or as a raw string.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  // 1) Honeypot — a real browser leaves this hidden field empty. Bots fill it.
  // Pretend success so the bot does not learn it was caught; insert nothing.
  if (str(body.company_website)) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, eligible: true }));
  }

  // Minimal required fields — without these the application is useless. The
  // form requires name, phone, and all seven knockout answers; a direct POST
  // missing them is junk, so reject it before writing a row.
  if (!str(body.full_name) || !str(body.phone) || KO_FIELDS.some((f) => !str(body[f]))) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: 'missing_required' }));
  }

  // Phone must be a COMPLETE 10-digit US number. Strip any formatting and allow
  // a leading country-code 1; reject anything that doesn't land on 10 digits.
  // An incomplete number (e.g. the 8 digits one applicant submitted) is a dead
  // lead we can't call back, so it gets rejected at the front door. This is the
  // server backstop — the form validates first, but client checks are bypassable.
  let phoneDigits = str(body.phone).replace(/\D/g, '');
  if (phoneDigits.length === 11 && phoneDigits[0] === '1') phoneDigits = phoneDigits.slice(1);
  if (phoneDigits.length !== 10) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: 'invalid_phone' }));
  }

  // 2) Deterministic knockout for the instant applicant-facing reply. Only the
  // five objective gates decide eligibility (see KO_FIELDS/HARD_GATES note).
  const eligible = HARD_GATES.every((r) => str(body[r.id]) === r.pass);

  // Assemble the equipment self-rating map (human gear label -> rating string).
  const sc_equipment = {};
  for (const [field, label] of Object.entries(EQUIP_FIELDS)) {
    const v = str(body[field]);
    if (v) sc_equipment[label] = v;
  }

  const attestation =
    body.attestation === true ||
    ['on', 'true', 'yes', '1'].includes(str(body.attestation).toLowerCase());

  // Build the normalized record. raw_answers is the immutable source of truth
  // the VM re-derives from, so it mirrors the typed columns exactly.
  const record = {};
  for (const f of CONTACT_FIELDS) record[f] = str(body[f]);
  for (const f of KO_FIELDS) record[f] = str(body[f]);
  for (const f of SCORED_TEXT) record[f] = str(body[f]);
  record.sc_equipment = sc_equipment;
  record.attestation = attestation;
  record.phone = phoneDigits; // store the normalized 10-digit number (propagates to raw_answers below)

  // The two industry-experience screens go into raw_answers ONLY, never as
  // top-level columns (they have no DB column — see EXP_FIELDS note above).
  const exp_answers = {};
  for (const f of EXP_FIELDS) exp_answers[f] = str(body[f]);

  const row = {
    ...record,
    raw_answers: { ...record, ...exp_answers },
    submitted_eligible: eligible,
    source: str(body.source) || 'careers_page',
    utm: str(body.utm) || null,
    referrer: str(req.headers['referer']) || str(body.referrer) || null,
    user_agent: str(req.headers['user-agent']).slice(0, 240),
    ip_city: str(req.headers['x-vercel-ip-city']) || null,
    ip_region: str(req.headers['x-vercel-ip-country-region']) || null,
    // status omitted on purpose -> table default 'new', which the anon RLS
    // policy `with check (status = 'new')` requires.
  };

  // 3) Insert with the low-privilege anon key. If the write fails we still
  // return ok:true so a real applicant is never shown an error — but we log
  // server-side so a silent intake outage is visible in Vercel logs.
  try {
    const url = process.env.YARDDOG_SUPABASE_URL;
    const key = process.env.YARDDOG_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('supabase env not configured');
    const resp = await fetch(`${url}/rest/v1/yard_dog_applicants`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`apply insert failed ${resp.status}: ${text.slice(0, 300)}`);
    }
  } catch (e) {
    console.error('apply insert error:', e && e.message ? e.message : e);
  }

  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true, eligible }));
}
