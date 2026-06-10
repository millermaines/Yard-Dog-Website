// seo-fixups-2026-06.mjs
// Idempotent site-wide local-SEO consistency sweep. Safe to re-run.
//
//   1. NAP hours: normalize every page to the canonical "Mon–Sat 7AM–6PM"
//      (footer text 106 files) and schema openingHours "Mo-Sa 07:00-18:00" (18 files).
//      Fixes the live inconsistency where the homepage said Mon–Sat 7a–6p but every
//      interior page said Mon–Fri 7AM–5PM / Sat 9AM–3PM.
//   2. Broken logo: schema "image" pointing at /logo.png (404) -> real logo URL (28 files).
//   3. Internal links: inject the 6 niche service cards into all 10 city-hub pages,
//      and add an "also serving" city list to the 6 niche base service pages — so the
//      new niche service+city pages are reachable from the hub/base cluster.
//   3c. Retaining Walls (added 2026-06-10): shipped after the original 6-niche sweep,
//      so it sits OUTSIDE the niche-service-cards / niche-also-serving sentinel blocks.
//      This wires its 10 city pages into the hub grids (the 14th family) and adds the
//      also-serving list to retaining-walls.html, matching what the niche services get.
//   4. Sitemap: regenerate sitemap.xml as a COMPLETE www/clean-URL index of every page
//      (the old one had 37 URLs and omitted the entire 130-page service+city matrix).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://www.yarddoglandscapes.com';
const REAL_LOGO = `${BASE}/brand_assets/Yard%20Dog%20Logo.png`;
const LASTMOD = '2026-06-10';

const CITIES = [
  { slug: 'longview',     display: 'Longview' },
  { slug: 'white-oak',    display: 'White Oak' },
  { slug: 'hallsville',   display: 'Hallsville' },
  { slug: 'kilgore',      display: 'Kilgore' },
  { slug: 'marshall',     display: 'Marshall' },
  { slug: 'tyler',        display: 'Tyler' },
  { slug: 'gladewater',   display: 'Gladewater' },
  { slug: 'henderson',    display: 'Henderson' },
  { slug: 'carthage',     display: 'Carthage' },
  { slug: 'nacogdoches',  display: 'Nacogdoches' },
];
const CITY_SLUGS = CITIES.map(c => c.slug);

// Niche services + a deterministic photo bank (must exist in brand_photos/, no 2.jpg).
const NICHE = [
  { slug: 'hedge-trimming',          display: 'Hedge Trimming',         photos: ['IMG_3680.jpg', '4.jpg', '1.jpg', '5.jpg', '6.jpg'] },
  { slug: 'flower-bed-installation', display: 'Flower Bed Installation', photos: ['IMG_3526.jpg', 'IMG_3525.jpg', 'IMG_3680.jpg', '1.jpg', '5.jpg'] },
  { slug: 'sod-installation',        display: 'Sod Installation',        photos: ['IMG_3525.jpg', '7.jpg', '8.jpg', '12.jpg', '3.jpg'] },
  { slug: 'mulch-installation',      display: 'Mulch Installation',      photos: ['IMG_3738.jpg', 'IMG_3526.jpg', 'IMG_3680.jpg', '6.jpg', '10.jpg'] },
  { slug: 'tree-planting',           display: 'Tree Planting',           photos: ['1.jpg', '4.jpg', 'IMG_3525.jpg', '5.jpg', '6.jpg'] },
  { slug: 'drainage',                display: 'Drainage & Grading',      photos: ['IMG_3736.jpg', 'IMG_3523.jpg', 'IMG_3683.jpg', 'IMG_3454.jpg', 'IMG_3452.jpg'] },
];

const esc = s => String(s).replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
const htmlFiles = () => fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

// ---------------- 1 + 2: hours + logo string sweep ----------------

function stringSweep() {
  let footerFixed = 0, schemaHoursFixed = 0, loneFixed = 0, logoFixed = 0;
  for (const f of htmlFiles()) {
    const p = path.join(ROOT, f);
    let html = fs.readFileSync(p, 'utf8');
    const before = html;

    // Footer full string first, then any lone remainder (order matters).
    if (html.includes('Mon–Fri 7AM–5PM, Sat 9AM–3PM')) {
      html = html.split('Mon–Fri 7AM–5PM, Sat 9AM–3PM').join('Mon–Sat 7AM–6PM');
      footerFixed++;
    }
    if (html.includes('Mon–Fri 7AM–5PM')) {
      html = html.split('Mon–Fri 7AM–5PM').join('Mon–Sat 7AM–6PM');
      loneFixed++;
    }
    // Schema openingHours — single-line form (niche base pages, contact, etc.)
    if (html.includes('"Mo-Fr 07:00-17:00", "Sa 09:00-15:00"')) {
      html = html.split('"Mo-Fr 07:00-17:00", "Sa 09:00-15:00"').join('"Mo-Sa 07:00-18:00"');
      schemaHoursFixed++;
    }
    // Schema openingHours — multiline form (city-hub pages)
    const mlOld = '      "openingHours": [\n        "Mo-Fr 07:00-17:00",\n        "Sa 09:00-15:00"\n      ],';
    const mlNew = '      "openingHours": ["Mo-Sa 07:00-18:00"],';
    if (html.includes(mlOld)) {
      html = html.split(mlOld).join(mlNew);
      schemaHoursFixed++;
    }
    // Broken /logo.png -> real logo (both www and non-www forms)
    if (html.includes('yarddoglandscapes.com/logo.png')) {
      html = html.split('https://www.yarddoglandscapes.com/logo.png').join(REAL_LOGO);
      html = html.split('https://yarddoglandscapes.com/logo.png').join(REAL_LOGO);
      logoFixed++;
    }

    if (html !== before) fs.writeFileSync(p, html, 'utf8');
  }
  console.log(`hours: footer ${footerFixed}, lone ${loneFixed}, schema ${schemaHoursFixed} | logo ${logoFixed}`);
}

// ---------------- 3a: inject niche cards into city hubs ----------------

function hubCard(service, city, idx) {
  const photo = service.photos[idx % service.photos.length];
  const d = esc(service.display);
  return `          <a class="service-card-link" href="${service.slug}-${city.slug}-tx">
            <div class="service-card has-photo">
              <div class="sc-photo"><img src="brand_photos/${photo}" alt="${d} in ${city.display}, TX" loading="lazy" width="800" height="600"></div>
              <div class="sc-body">
                <h3>${d}</h3>
                <p>${d} in ${city.display}, TX — local crew, written estimates, same-week scheduling.</p>
                <span class="sc-link">View ${d} in ${city.display} →</span>
              </div>
            </div>
          </a>`;
}

function injectHubCards() {
  const SENTINEL = '<!-- niche-service-cards -->';
  let done = 0, skipped = 0;
  for (let ci = 0; ci < CITIES.length; ci++) {
    const city = CITIES[ci];
    const p = path.join(ROOT, `${city.slug}-tx.html`);
    if (!fs.existsSync(p)) { console.warn(`  hub missing: ${city.slug}-tx.html`); continue; }
    let html = fs.readFileSync(p, 'utf8');
    if (html.includes(SENTINEL)) { skipped++; continue; }
    const gi = html.indexOf('<div class="services-grid">');
    if (gi < 0) { console.warn(`  no services-grid in ${city.slug}-tx.html`); continue; }
    const close = html.indexOf('\n        </div>', gi);
    if (close < 0) { console.warn(`  no grid close in ${city.slug}-tx.html`); continue; }
    const cards = NICHE.map((s, i) => hubCard(s, city, ci + i)).join('\n');
    const insert = `\n          ${SENTINEL}\n${cards}`;
    html = html.slice(0, close) + insert + html.slice(close);
    fs.writeFileSync(p, html, 'utf8');
    done++;
  }
  console.log(`hub cards: injected ${done}, skipped(already) ${skipped}`);
}

// ---------------- 3b: also-serving city list on niche base pages ----------------

function injectBaseAlsoServing() {
  const SENTINEL = '<!-- niche-also-serving -->';
  const anchor = '    <section class="section bg-dark">';
  let done = 0, skipped = 0;
  for (const service of NICHE) {
    const p = path.join(ROOT, `${service.slug}.html`);
    if (!fs.existsSync(p)) { console.warn(`  base missing: ${service.slug}.html`); continue; }
    let html = fs.readFileSync(p, 'utf8');
    if (html.includes(SENTINEL)) { skipped++; continue; }
    const ai = html.indexOf(anchor);
    if (ai < 0) { console.warn(`  no CTA anchor in ${service.slug}.html`); continue; }
    const d = esc(service.display);
    const chips = CITIES.map(c =>
      `          <a class="also-chip" href="${service.slug}-${c.slug}-tx">${d} in ${c.display}, TX</a>`
    ).join('\n');
    const section = `    ${SENTINEL}
    <section class="section">
      <div class="container also-serving">
        <h3>Also serving these East Texas towns:</h3>
        <div class="also-chips">
${chips}
        </div>
      </div>
    </section>

`;
    html = html.slice(0, ai) + section + html.slice(ai);
    fs.writeFileSync(p, html, 'utf8');
    done++;
  }
  console.log(`base also-serving: injected ${done}, skipped(already) ${skipped}`);
}

// ---------------- 3c: retaining-walls wiring (added 2026-06-10) ----------------
// Retaining Walls is the 14th service family. It shipped after the niche sweep, so it
// is not covered by the niche-service-cards / niche-also-serving sentinels above.
// Hub card photo bank matches gen-niche-locations.mjs so the look is identical.
// Idempotent: hub injection is guarded by href presence, base block by the sentinel.
const RETAINING = {
  slug: 'retaining-walls', display: 'Retaining Walls',
  photos: ['6.jpg', 'IMG_3452.jpg', 'IMG_3454.jpg', 'IMG_3523.jpg', 'IMG_3683.jpg'],
};

function injectRetainingWalls() {
  // hub cards — append one Retaining Walls card to each city hub's services-grid
  let hubDone = 0, hubSkip = 0;
  for (let ci = 0; ci < CITIES.length; ci++) {
    const city = CITIES[ci];
    const p = path.join(ROOT, `${city.slug}-tx.html`);
    if (!fs.existsSync(p)) { console.warn(`  hub missing: ${city.slug}-tx.html`); continue; }
    let html = fs.readFileSync(p, 'utf8');
    const href = `${RETAINING.slug}-${city.slug}-tx`;
    if (html.includes(`href="${href}"`)) { hubSkip++; continue; }
    // anchor after the niche cards (or the grid open if no sentinel), insert before the grid close
    const si = html.indexOf('<!-- niche-service-cards -->');
    const anchor = si >= 0 ? si : html.indexOf('<div class="services-grid">');
    if (anchor < 0) { console.warn(`  no grid anchor in ${city.slug}-tx.html`); continue; }
    const close = html.indexOf('\n        </div>', anchor);
    if (close < 0) { console.warn(`  no grid close in ${city.slug}-tx.html`); continue; }
    const card = hubCard(RETAINING, city, ci);
    html = html.slice(0, close) + '\n' + card + html.slice(close);
    fs.writeFileSync(p, html, 'utf8');
    hubDone++;
  }
  console.log(`retaining-walls hub cards: injected ${hubDone}, skipped(already) ${hubSkip}`);

  // base also-serving — add the 10-city list to retaining-walls.html
  const SENTINEL = '<!-- niche-also-serving -->';
  const anchor = '    <section class="section bg-dark">';
  const bp = path.join(ROOT, 'retaining-walls.html');
  if (!fs.existsSync(bp)) { console.warn('  base missing: retaining-walls.html'); return; }
  let html = fs.readFileSync(bp, 'utf8');
  if (html.includes(SENTINEL)) { console.log('retaining-walls base also-serving: skipped(already)'); return; }
  const ai = html.indexOf(anchor);
  if (ai < 0) { console.warn('  no CTA anchor in retaining-walls.html'); return; }
  const d = esc(RETAINING.display);
  const chips = CITIES.map(c =>
    `          <a class="also-chip" href="${RETAINING.slug}-${c.slug}-tx">${d} in ${c.display}, TX</a>`
  ).join('\n');
  const section = `    ${SENTINEL}
    <section class="section">
      <div class="container also-serving">
        <h3>Also serving these East Texas towns:</h3>
        <div class="also-chips">
${chips}
        </div>
      </div>
    </section>

`;
  html = html.slice(0, ai) + section + html.slice(ai);
  fs.writeFileSync(bp, html, 'utf8');
  console.log('retaining-walls base also-serving: injected');
}

// ---------------- 4: complete sitemap regen ----------------

function categorize(file) {
  if (file === 'index.html') return { loc: '/', priority: '1.0' };
  const slug = file.replace(/\.html$/, '');
  const url = `/${slug}`;

  const CORE = { 'about': '0.9', 'services': '0.9', 'our-work': '0.9', 'contact': '0.9' };
  const HUBS = new Set(['landscaping', 'lawn-maintenance', 'leaf-removal', 'fertilization',
    'christmas-lights', 'hardscaping', 'tree-shrub-care', 'drainage', 'retaining-walls', 'hedge-trimming',
    'flower-bed-installation', 'sod-installation', 'mulch-installation', 'tree-planting']);

  if (slug in CORE) return { loc: url, priority: CORE[slug] };
  if (slug === 'design-preview') return { loc: url, priority: '0.7' };
  if (HUBS.has(slug)) return { loc: url, priority: '0.8' };
  if (slug === 'blog') return { loc: url, priority: '0.6' };
  if (slug.startsWith('blog-')) return { loc: url, priority: '0.5' };

  if (slug.endsWith('-tx')) {
    const base = slug.slice(0, -3); // strip "-tx"
    if (CITY_SLUGS.includes(base)) return { loc: url, priority: '0.75' }; // city hub
    if (CITY_SLUGS.some(c => base.endsWith('-' + c))) return { loc: url, priority: '0.7' }; // matrix
  }
  return { loc: url, priority: '0.5' };
}

function buildSitemap() {
  const entries = htmlFiles().map(categorize);
  // sort: priority desc, then loc asc
  entries.sort((a, b) => (Number(b.priority) - Number(a.priority)) || a.loc.localeCompare(b.loc));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${BASE}${e.loc === '/' ? '/' : e.loc}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap: ${entries.length} URLs`);
}

function fixRobots() {
  const p = path.join(ROOT, 'robots.txt');
  if (!fs.existsSync(p)) return;
  let txt = fs.readFileSync(p, 'utf8');
  const fixed = txt.replace('https://yarddoglandscapes.com/sitemap.xml', `${BASE}/sitemap.xml`);
  if (fixed !== txt) { fs.writeFileSync(p, fixed, 'utf8'); console.log('robots.txt: sitemap URL -> www'); }
  else console.log('robots.txt: already correct');
}

// ---------------- run ----------------

console.log('--- SEO fixups 2026-06 ---');
stringSweep();
injectHubCards();
injectBaseAlsoServing();
injectRetainingWalls();
buildSitemap();
fixRobots();
console.log('--- done ---');
