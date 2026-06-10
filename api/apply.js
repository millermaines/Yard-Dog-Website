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
// ban-the-box (screening stated POST-offer only), FCRA (post-offer consent).
// Do not "improve" the wording without re-checking those.

const KNOCKOUT = [
  { id: 'ko_work_auth', pass: 'Yes' },
  { id: 'ko_age_18', pass: 'Yes' },
  { id: 'ko_license', pass: 'Yes' },
  { id: 'ko_transport', pass: 'Yes, every day' },
  { id: 'ko_physical', pass: 'Yes' },
  { id: 'ko_schedule', pass: 'Yes' },
  { id: 'ko_screen_consent', pass: 'Yes' },
];

// form field -> human gear label used as the sc_equipment jsonb key
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

  // Minimal required contact fields — without these the application is useless.
  if (!str(body.full_name) || !str(body.phone)) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: 'missing_required' }));
  }

  // 2) Deterministic knockout for the instant applicant-facing reply.
  const eligible = KNOCKOUT.every((r) => str(body[r.id]) === r.pass);

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
  for (const r of KNOCKOUT) record[r.id] = str(body[r.id]);
  for (const f of SCORED_TEXT) record[f] = str(body[f]);
  record.sc_equipment = sc_equipment;
  record.attestation = attestation;

  const row = {
    ...record,
    raw_answers: { ...record },
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
