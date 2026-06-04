// api/go.js — QR / short-link redirect with scan logging.
//
//   https://www.yarddoglandscapes.com/go/c1  (via the /go/:tag rewrite in vercel.json)
//     1. logs a qr_scan event to the Yard Dog Data Core (yard_dog_campaign_events)
//     2. 302s the visitor to the quote form with UTMs appended
//
// FAIL-OPEN: a prospect must NEVER see an error or a slow page because logging
// failed — the Supabase write races a 1.5s timeout and all errors are swallowed.
//
// Env (Vercel project settings): YARDDOG_SUPABASE_URL, YARDDOG_SUPABASE_SERVICE_ROLE_KEY
// (server-side only — never exposed to the client). Remember this project on the
// key-rotation consumer list.

const DESTS = {
  c1: '/contact?utm_source=eddm&utm_medium=mailer&utm_campaign=c1',
  c2: '/contact?utm_source=eddm&utm_medium=mailer&utm_campaign=c2',
};

export default async function handler(req, res) {
  const tag = String((req.query && req.query.c) || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32);
  const dest = DESTS[tag] || `/contact?utm_source=qr&utm_campaign=${tag || 'unknown'}`;

  try {
    const url = process.env.YARDDOG_SUPABASE_URL;
    const key = process.env.YARDDOG_SUPABASE_SERVICE_ROLE_KEY;
    if (url && key && tag) {
      await Promise.race([
        fetch(`${url}/rest/v1/yard_dog_campaign_events`, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            event_type: 'qr_scan',
            event_date: new Date().toISOString().slice(0, 10),
            qty: 1,
            zone_name: tag,
            notes: JSON.stringify({
              ts: new Date().toISOString(),
              city: req.headers['x-vercel-ip-city'] || null,
              region: req.headers['x-vercel-ip-country-region'] || null,
              ua: String(req.headers['user-agent'] || '').slice(0, 120),
            }),
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    }
  } catch {
    // fail-open — logging never blocks the redirect
  }

  res.statusCode = 302;
  res.setHeader('Location', dest);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}
