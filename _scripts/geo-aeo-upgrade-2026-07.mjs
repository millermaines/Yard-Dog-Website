// geo-aeo-upgrade-2026-07.mjs
// Idempotent site-wide AIO / SEO / AEO / GEO upgrade. Safe to re-run.
//
// This is the canonical FINAL step after any page (re)generation — run it after
// gen-niche-*.mjs / build-locations.mjs so every built page carries the enriched
// entity graph. It never fabricates data: every value below is sourced from the
// live site (footer socials, about.html "since 2017", GBP 24hr hours) or is a
// public fact (Longview, TX centroid). No Google Business Profile URL exists in
// the repo, so sameAs intentionally omits it — add it here when Miller supplies it.
//
// What it does:
//   1. Enriches the LocalBusiness "#business" node on EVERY page (wherever it
//      sits — standalone or nested as a Service's provider) with the frontier
//      entity-graph signals AI answer engines use: geo, sameAs (incl. YouTube),
//      foundingDate, founder (Person), knowsAbout, contactPoint, hasOfferCatalog,
//      priceRange, openingHoursSpecification, areaServed. Parse -> modify ->
//      reserialize (never fragile string replace); skips any block whose JSON
//      does not parse (reports it, writes nothing for that block).
//   2. Injects a WebSite + WebPage(@graph, with speakable) knowledge-graph anchor
//      into index.html (no SearchAction — the site has no search endpoint).
//   3. Generates /llms.txt and /llms-full.txt (GEO — the map AI crawlers read).
//   4. Rewrites /robots.txt to explicitly welcome AI answer-engine crawlers.
//
// Usage:  node _scripts/geo-aeo-upgrade-2026-07.mjs [--dry]
//   --dry  report every change but write nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const BASE = 'https://www.yarddoglandscapes.com';
const BIZ_ID = `${BASE}/#business`;
const PERSON_ID = `${BASE}/#miller`;
const WEBSITE_ID = `${BASE}/#website`;
const LOGO = `${BASE}/brand_assets/Yard%20Dog%20Logo.png`;
const PHONE = '+1-903-844-6877';
const EMAIL = 'info@yarddoglandscapes.com';

// --- canonical enrichment values (all real / public-fact, none fabricated) ---
const GEO = { '@type': 'GeoCoordinates', latitude: 32.4385084, longitude: -94.8481025 }; // authoritative Google Business Profile map pin
const SAMEAS = [
  'https://www.google.com/maps?cid=3450977957239277557', // canonical Google Business Profile (from Miller's Maps link, CID)
  'https://www.facebook.com/yarddoglandscapes',
  'https://www.instagram.com/yarddoglawnlights',
  'https://www.youtube.com/millermaines',
];
const FOUNDER = { '@type': 'Person', '@id': PERSON_ID, name: 'Miller Maines', jobTitle: 'Owner' };
const KNOWS_ABOUT = [
  'Landscaping', 'Lawn care', 'Lawn maintenance', 'Retaining walls', 'Hardscaping',
  'Drainage and grading', 'Sod installation', 'Mulch installation', 'Fertilization',
  'Flower bed installation', 'Hedge trimming', 'Tree planting', 'Tree and shrub care',
  'Leaf removal', 'Christmas light installation', 'Bermuda grass', 'St. Augustine grass',
  'East Texas landscaping', 'Gregg County lawn care',
];
const OPENING_SPEC = [{
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '00:00', closes: '23:59',
}];
const OPENING = ['Mo-Su 00:00-23:59'];
const AREA_SERVED = [
  'Longview, TX', 'White Oak, TX', 'Kilgore, TX', 'Gladewater, TX', 'Hallsville, TX',
  'Marshall, TX', 'Tyler, TX', 'Henderson, TX', 'Carthage, TX', 'Nacogdoches, TX',
];
const CONTACT_POINT = {
  '@type': 'ContactPoint', telephone: PHONE, contactType: 'customer service',
  areaServed: 'US', availableLanguage: 'English',
};

const SERVICES = [
  { slug: 'landscaping', name: 'Landscaping' },
  { slug: 'lawn-maintenance', name: 'Lawn Maintenance' },
  { slug: 'mulch-installation', name: 'Mulch Installation' },
  { slug: 'sod-installation', name: 'Sod Installation' },
  { slug: 'hardscaping', name: 'Hardscaping' },
  { slug: 'retaining-walls', name: 'Retaining Walls' },
  { slug: 'drainage', name: 'Drainage & Grading' },
  { slug: 'fertilization', name: 'Fertilization' },
  { slug: 'flower-bed-installation', name: 'Flower Bed Installation' },
  { slug: 'hedge-trimming', name: 'Hedge Trimming' },
  { slug: 'tree-planting', name: 'Tree Planting' },
  { slug: 'tree-shrub-care', name: 'Tree & Shrub Care' },
  { slug: 'leaf-removal', name: 'Leaf Removal' },
  { slug: 'christmas-lights', name: 'Christmas Light Installation' },
];
const CITIES = [
  { slug: 'longview-tx', name: 'Longview', county: 'Gregg County' },
  { slug: 'white-oak-tx', name: 'White Oak', county: 'Gregg County' },
  { slug: 'hallsville-tx', name: 'Hallsville', county: 'Harrison County' },
  { slug: 'kilgore-tx', name: 'Kilgore', county: 'Gregg County' },
  { slug: 'marshall-tx', name: 'Marshall', county: 'Harrison County' },
  { slug: 'tyler-tx', name: 'Tyler', county: 'Smith County' },
  { slug: 'gladewater-tx', name: 'Gladewater', county: 'Gregg County' },
  { slug: 'henderson-tx', name: 'Henderson', county: 'Rusk County' },
  { slug: 'carthage-tx', name: 'Carthage', county: 'Panola County' },
  { slug: 'nacogdoches-tx', name: 'Nacogdoches', county: 'Nacogdoches County' },
];

function offerCatalog() {
  return {
    '@type': 'OfferCatalog',
    name: 'Landscaping & Lawn Care Services',
    itemListElement: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, url: `${BASE}/${s.slug}` },
    })),
  };
}

// --- schema graph walking ---
function walk(node, fn) {
  if (Array.isArray(node)) { node.forEach((n) => walk(n, fn)); return; }
  if (node && typeof node === 'object') {
    fn(node);
    for (const k of Object.keys(node)) walk(node[k], fn);
  }
}
function isBusiness(n) {
  if (!n || typeof n !== 'object') return false;
  const t = n['@type'];
  const isLB = t === 'LocalBusiness' || (Array.isArray(t) && t.includes('LocalBusiness'));
  if (!isLB) return false;
  // Identify the Yard Dog entity by @id OR its unambiguous identity fields, so
  // we ALSO catch the 110 older-generator pages whose LocalBusiness carries no
  // @id — then unify them all under BIZ_ID (fixes a fragmented entity graph).
  return n['@id'] === BIZ_ID
    || n.name === 'Yard Dog Landscapes'
    || n.url === BASE
    || n.telephone === PHONE;
}
function canonUrl(u) {
  return String(u).replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();
}
function enrichBusiness(node) {
  let changed = false;
  const set = (k, v) => { if (!(k in node)) { node[k] = v; changed = true; } };
  if (node['@id'] !== BIZ_ID) { node['@id'] = BIZ_ID; changed = true; } // unify the entity graph
  // most-specific subtype for entity disambiguation (landscaping ⊂ HomeAndConstructionBusiness)
  const ty = node['@type'];
  if (ty === 'LocalBusiness') { node['@type'] = ['LocalBusiness', 'HomeAndConstructionBusiness']; changed = true; }
  else if (Array.isArray(ty) && !ty.includes('HomeAndConstructionBusiness')) { node['@type'] = ['LocalBusiness', 'HomeAndConstructionBusiness']; changed = true; }
  set('foundingDate', '2017');
  set('founder', FOUNDER);
  if (JSON.stringify(node.geo) !== JSON.stringify(GEO)) { node.geo = GEO; changed = true; } // force to authoritative GBP pin
  set('priceRange', '$$');
  set('knowsAbout', KNOWS_ABOUT);
  set('contactPoint', CONTACT_POINT);
  set('hasOfferCatalog', offerCatalog());
  set('openingHoursSpecification', OPENING_SPEC);
  set('openingHours', OPENING);
  set('areaServed', AREA_SERVED);
  set('image', LOGO);
  set('logo', LOGO);
  // sameAs: union with existing (dedup by canonical host+path)
  const existing = Array.isArray(node.sameAs) ? node.sameAs.slice() : [];
  const have = new Set(existing.map(canonUrl));
  let sameChanged = false;
  for (const u of SAMEAS) { if (!have.has(canonUrl(u))) { existing.push(u); have.add(canonUrl(u)); sameChanged = true; } }
  if (sameChanged || !('sameAs' in node)) { node.sameAs = existing; changed = true; }
  return changed;
}

const BLOCK_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

function processHtml(file, html) {
  let fileChanged = false;
  const errors = [];
  let out = html.replace(BLOCK_RE, (full, inner, offset) => {
    let obj;
    try { obj = JSON.parse(inner); } catch (e) { errors.push(e.message.slice(0, 80)); return full; }
    let blockChanged = false;
    walk(obj, (n) => { if (isBusiness(n)) { if (enrichBusiness(n)) blockChanged = true; } });
    if (!blockChanged) return full;
    fileChanged = true;
    const lineStart = html.lastIndexOf('\n', offset) + 1;
    const pad = (html.slice(lineStart, offset).match(/^\s*/) || [''])[0];
    const pretty = JSON.stringify(obj, null, 2).split('\n').map((l) => pad + l).join('\n');
    return `<script type="application/ld+json">\n${pretty}\n${pad}</script>`;
  });

  // Homepage-only: inject WebSite + WebPage(speakable) knowledge-graph anchor.
  if (path.basename(file) === 'index.html' && !html.includes(WEBSITE_ID)) {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': WEBSITE_ID, url: BASE, name: 'Yard Dog Landscapes', publisher: { '@id': BIZ_ID }, inLanguage: 'en-US' },
        {
          '@type': 'WebPage', '@id': `${BASE}/#webpage-home`, url: `${BASE}/`,
          name: 'Yard Dog Landscapes — Landscaping & Lawn Care in Longview, TX',
          isPartOf: { '@id': WEBSITE_ID }, about: { '@id': BIZ_ID },
          speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1'] },
          inLanguage: 'en-US',
        },
      ],
    };
    const blockStr = `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`;
    // insert right after the first ld+json block's closing tag
    const firstClose = out.indexOf('</script>');
    if (firstClose !== -1) {
      const at = firstClose + '</script>'.length;
      out = out.slice(0, at) + '\n' + blockStr + out.slice(at);
      fileChanged = true;
    }
  }
  return { out, fileChanged, errors };
}

// --- generated resource files ---
function metaDescOf(slug) {
  try {
    const h = fs.readFileSync(path.join(ROOT, `${slug}.html`), 'utf8');
    const m = h.match(/<meta name="description" content="([^"]*)"/i);
    return m ? m[1] : '';
  } catch { return ''; }
}

function buildLlmsTxt() {
  const services = SERVICES.map((s) => `- [${s.name}](${BASE}/${s.slug})`).join('\n');
  const cities = CITIES.map((c) => `- [${c.name}, TX](${BASE}/${c.slug}) (${c.county})`).join('\n');
  return `# Yard Dog Landscapes

> Family-owned landscaping and lawn care company serving Longview and East Texas since 2017. Rated 5.0 stars across 110+ Google reviews, fully insured, free quotes, and 24-hour availability. Call (903) 844-6877.

Yard Dog Landscapes is a residential and commercial landscaping company based in Longview, Texas. We provide lawn maintenance, landscape design and installation, hardscaping, retaining walls, drainage, sod, mulch, fertilization, seasonal cleanups, and Christmas light installation across Gregg, Harrison, Smith, Rusk, Panola, and Nacogdoches counties in East Texas.

## Services
${services}

## Service Areas
${cities}

## Company
- [About Yard Dog Landscapes](${BASE}/about): Family-owned in Longview since 2017, owned by Miller Maines. Built on showing up, doing the work right, and giving customers more than they pay for.
- [Our Work](${BASE}/our-work): Photos of completed East Texas landscaping and hardscaping projects.
- [Contact / Free Quote](${BASE}/contact): Call or text (903) 844-6877, or email ${EMAIL}.
- [Careers](${BASE}/careers)

## Resources
- [Blog](${BASE}/blog): Practical East Texas lawn and landscape guides (grass types, fertilization timing, mulch depth, drainage, pruning).
- [Sitemap](${BASE}/sitemap.xml)

## Key Facts
- Business name: Yard Dog Landscapes
- Founded: 2017 (family-owned)
- Owner: Miller Maines
- Location: Longview, Texas (serving East Texas / Gregg County and surrounding counties)
- Rating: 5.0 stars, 110+ Google reviews
- Phone: (903) 844-6877
- Email: ${EMAIL}
- Hours: Open 24 hours (call or text anytime)
- Insured: Yes, fully insured
- Free estimates: Yes
- Website: ${BASE}
- Google Business Profile: https://www.google.com/maps?cid=3450977957239277557
`;
}

function buildLlmsFullTxt() {
  const svcBlocks = SERVICES.map((s) => {
    const d = metaDescOf(s.slug);
    return `### ${s.name}\n${d || `${s.name} in Longview and East Texas by Yard Dog Landscapes.`}\nURL: ${BASE}/${s.slug}`;
  }).join('\n\n');
  const cityBlocks = CITIES.map((c) => `- ${c.name}, TX (${c.county}) — ${BASE}/${c.slug}`).join('\n');
  return `# Yard Dog Landscapes — Full Reference for AI Assistants

> Family-owned landscaping and lawn care in Longview, Texas since 2017. 5.0 stars across 110+ Google reviews. Fully insured. Free quotes. Open 24 hours. Phone: (903) 844-6877. Email: ${EMAIL}.

## About
Yard Dog Landscapes is a family-owned East Texas landscaping and lawn care company founded in 2017 and owned by Miller Maines. The company serves Longview and the surrounding communities of Gregg County and neighboring counties. Yard Dog is fully insured, provides free written estimates, and is known for showing up on time, clear itemized quotes, and giving customers more than they pay for — reflected in a perfect 5.0-star rating across more than 110 Google reviews.

## How to reach Yard Dog Landscapes
- Phone / text: (903) 844-6877
- Email: ${EMAIL}
- Free quote: ${BASE}/contact
- Hours: Open 24 hours (call or text anytime)

## Services (with pages)

${svcBlocks}

## Service areas
${cityBlocks}

## Common questions
Q: What areas does Yard Dog Landscapes serve?
A: Longview, White Oak, Kilgore, Gladewater, Hallsville, Marshall, Tyler, Henderson, Carthage, and Nacogdoches, Texas — across Gregg, Harrison, Smith, Rusk, Panola, and Nacogdoches counties in East Texas.

Q: Is Yard Dog Landscapes insured?
A: Yes. Yard Dog Landscapes is fully insured.

Q: How do I get a quote?
A: Call or text (903) 844-6877, email ${EMAIL}, or request a free quote at ${BASE}/contact. Estimates are free and written up itemized.

Q: How long has Yard Dog Landscapes been in business?
A: Since 2017. It is family-owned and operated in Longview, Texas by Miller Maines.

Q: What is Yard Dog Landscapes' rating?
A: 5.0 stars across more than 110 Google reviews.
`;
}

function buildRobotsTxt() {
  const aiBots = [
    'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
    'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended',
    'Amazonbot', 'Bingbot', 'DuckAssistBot', 'Meta-ExternalAgent', 'meta-externalagent',
    'CCBot', 'cohere-ai', 'YouBot', 'Timpibot', 'Bytespider',
  ];
  const aiBlock = aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n');
  return `# Yard Dog Landscapes — ${BASE}
# We welcome search engines and AI answer engines. See /llms.txt for a structured summary.

User-agent: *
Allow: /

# --- AI answer engines & assistants: explicitly welcomed ---
${aiBlock}

Sitemap: ${BASE}/sitemap.xml
`;
}

// --- run ---
function listHtml() {
  const files = [];
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith('.html') && f !== 'design-preview.html') files.push(path.join(ROOT, f));
  }
  const blogDir = path.join(ROOT, 'blog');
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir)) if (f.endsWith('.html')) files.push(path.join(blogDir, f));
  }
  return files;
}

let changedCount = 0;
let errorFiles = 0;
const changedList = [];
for (const file of listHtml()) {
  const html = fs.readFileSync(file, 'utf8');
  const { out, fileChanged, errors } = processHtml(file, html);
  if (errors.length) { errorFiles++; console.log(`  ⚠ JSON-LD parse error in ${path.relative(ROOT, file)}: ${errors.join('; ')}`); }
  if (fileChanged) {
    changedCount++;
    changedList.push(path.relative(ROOT, file));
    if (!DRY) fs.writeFileSync(file, out);
  }
}

// resource files
const resources = [
  ['llms.txt', buildLlmsTxt()],
  ['llms-full.txt', buildLlmsFullTxt()],
  ['robots.txt', buildRobotsTxt()],
];
for (const [name, content] of resources) {
  const p = path.join(ROOT, name);
  const prev = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (prev !== content) {
    console.log(`  ${DRY ? '[dry] would write' : 'wrote'} ${name} (${content.length} bytes)`);
    if (!DRY) fs.writeFileSync(p, content);
  } else {
    console.log(`  ${name} unchanged`);
  }
}

console.log(`\n${DRY ? '[DRY RUN] ' : ''}HTML pages enriched: ${changedCount}  |  parse-error files: ${errorFiles}`);
if (changedCount && changedCount <= 20) console.log('  ' + changedList.join('\n  '));
else if (changedCount) console.log(`  (${changedList.slice(0, 8).join(', ')}, … +${changedCount - 8} more)`);
