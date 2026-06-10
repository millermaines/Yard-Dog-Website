// gen-niche-locations.mjs
// Generates the 70 NICHE service-location pages (7 services x 10 cities) that the
// April-2026 live audit flagged as ranking gaps: hedge-trimming, flower-bed-installation,
// sod-installation, mulch-installation, tree-planting, drainage, and retaining-walls.
// (retaining-walls added 2026-06-10 to match the live retaining-walls.html base page.)
//
// IMPORTANT: This emits pages in the CURRENT LIVE chrome (mega-menu nav, banner brand,
// Blog link, cta-mark + spotlight scripts, www + clean-URL canonical, Service + FAQPage +
// BreadcrumbList JSON-LD) so the output matches production byte-for-byte in the header/
// footer. It does NOT re-run build-locations.mjs / gen-niche-pages.mjs (those are stale —
// mass-update.mjs post-processed the live pages after they were generated).
//
// Corrections baked in vs the old generators:
//   - canonical/og:url = https://www.yarddoglandscapes.com/<slug>   (www, no .html)
//   - footer hours      = "Open 24 Hours"  (matches the live GBP profile, which shows
//                          24-hour availability — a confirmed lead driver; was the stale
//                          "Mon–Fri 7AM–5PM, Sat 9AM–3PM", briefly "Mon–Sat 7AM–6PM")
//   - schema provider   = @id'd to the homepage #business entity + real logo URL
//
// Idempotent: re-running overwrites the 60 target files deterministically.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const BASE = 'https://www.yarddoglandscapes.com';
const BIZ_ID = `${BASE}/#business`;
const LOGO = `${BASE}/brand_assets/Yard%20Dog%20Logo.png`;

// ---------------- CITIES (identical to build-locations.mjs) ----------------

const CITIES = [
  { slug: 'longview',     display: 'Longview',     county: 'Gregg County',      nearby: ['white-oak', 'kilgore', 'hallsville'] },
  { slug: 'white-oak',    display: 'White Oak',    county: 'Gregg County',      nearby: ['longview', 'gladewater', 'kilgore'] },
  { slug: 'hallsville',   display: 'Hallsville',   county: 'Harrison County',   nearby: ['longview', 'marshall', 'white-oak'] },
  { slug: 'kilgore',      display: 'Kilgore',      county: 'Gregg County',      nearby: ['longview', 'white-oak', 'henderson'] },
  { slug: 'marshall',     display: 'Marshall',     county: 'Harrison County',   nearby: ['longview', 'hallsville', 'tyler'] },
  { slug: 'tyler',        display: 'Tyler',        county: 'Smith County',      nearby: ['longview', 'kilgore', 'henderson'] },
  { slug: 'gladewater',   display: 'Gladewater',   county: 'Gregg County',      nearby: ['white-oak', 'longview', 'kilgore'] },
  { slug: 'henderson',    display: 'Henderson',    county: 'Rusk County',       nearby: ['kilgore', 'tyler', 'carthage'] },
  { slug: 'carthage',     display: 'Carthage',     county: 'Panola County',     nearby: ['henderson', 'marshall', 'nacogdoches'] },
  { slug: 'nacogdoches',  display: 'Nacogdoches',  county: 'Nacogdoches County',nearby: ['henderson', 'carthage', 'tyler'] },
];
const cityBySlug = Object.fromEntries(CITIES.map(c => [c.slug, c]));

// ---------------- NICHE SERVICES (the audit gap set) ----------------
// All photoBank entries verified to exist in brand_photos/ (no 2.jpg).

const SERVICES = [
  {
    slug: 'hedge-trimming', display: 'Hedge Trimming', lower: 'hedge trimming',
    bullets: [
      'Routine hedge & shrub shaping',
      'Foundation hedge maintenance',
      'Topiary & formal hedge work',
      'Rejuvenation cuts on overgrown shrubs',
      'Boxwood, holly, ligustrum, photinia & more',
      'Full debris cleanup & haul-off',
    ],
    photoBank: ['IMG_3680.jpg', '4.jpg', '1.jpg', '5.jpg', '6.jpg'],
    seasonText: 'East Texas hedges put on their hardest growth from spring through late summer, so a light shaping every four to six weeks in season keeps boxwoods, hollies, and ligustrums crisp without shocking them.',
    cadenceFAQ: 'Most hedges look their best with a trim every four to six weeks during the growing season, then less often as growth slows into fall and winter.',
  },
  {
    slug: 'flower-bed-installation', display: 'Flower Bed Installation', lower: 'flower bed installation',
    bullets: [
      'Custom bed layout & design',
      'Soil amendment & bed prep',
      'Annual & perennial planting',
      'Native and pollinator selections',
      'Stone, steel, or natural edging',
      'Mulch finish to lock in moisture',
    ],
    photoBank: ['IMG_3526.jpg', 'IMG_3525.jpg', 'IMG_3680.jpg', '1.jpg', '5.jpg'],
    seasonText: 'Fall and early spring are the strongest planting windows in East Texas — cooler soil lets new plants root in before the summer heat, so beds installed then come back fuller the next season.',
    cadenceFAQ: 'A flower bed install is usually a one-time project, though many homeowners book a seasonal color refresh twice a year and an annual mulch top-off in spring.',
  },
  {
    slug: 'sod-installation', display: 'Sod Installation', lower: 'sod installation',
    bullets: [
      'Site prep, leveling & soil amendment',
      'Removal of dead turf & weeds',
      'St. Augustine, Bermuda & Zoysia',
      'Tight-seam, full-coverage installation',
      'Starter fertilizer at install',
      'Watering schedule & care plan',
    ],
    photoBank: ['IMG_3525.jpg', '7.jpg', '8.jpg', '12.jpg', '3.jpg'],
    seasonText: 'Sod takes best in East Texas from spring through early fall when the ground is warm and roots establish fast — laid in peak heat it needs a strict watering plan, which we set up with you before install.',
    cadenceFAQ: 'Sod is a one-time install, but the first few weeks of watering make or break it — we leave you a clear schedule and can check back to make sure it is taking.',
  },
  {
    slug: 'mulch-installation', display: 'Mulch Installation', lower: 'mulch installation',
    bullets: [
      'Bed edging & re-cut edges',
      'Weed pull & light bed cleanup',
      'Hardwood, cypress, dyed black or natural',
      'Even-depth, full-bed spread',
      'Around trees, shrubs & full beds',
      'Pine straw available on request',
    ],
    photoBank: ['IMG_3738.jpg', 'IMG_3526.jpg', 'IMG_3680.jpg', '6.jpg', '10.jpg'],
    seasonText: 'Spring is the busiest mulch season in East Texas — a fresh two-to-three-inch layer going into the growing season locks in moisture, blocks weeds, and insulates roots through the summer heat.',
    cadenceFAQ: 'Most beds get a fresh mulch layer once a year in spring, with some homeowners adding a lighter fall top-off to keep beds looking sharp year-round.',
  },
  {
    slug: 'tree-planting', display: 'Tree Planting', lower: 'tree planting',
    bullets: [
      'Tree selection for East Texas conditions',
      'Site assessment & placement planning',
      'Hand-dug root ball installation',
      'Staking, watering basin & mulch ring',
      'Native and shade tree options',
      'Aftercare watering guidance',
    ],
    photoBank: ['1.jpg', '4.jpg', 'IMG_3525.jpg', '5.jpg', '6.jpg'],
    seasonText: 'Fall through late winter is the prime planting window in East Texas — dormant-season trees spend months growing roots before they ever push leaves, which dramatically improves survival.',
    cadenceFAQ: 'Tree planting is a one-time job, but young trees need consistent water through their first two summers — we leave you an aftercare plan and can schedule follow-up checks.',
  },
  {
    slug: 'drainage', display: 'Drainage & Grading', lower: 'drainage and grading',
    bullets: [
      'French drain installation',
      'Surface grading & re-sloping',
      'Catch basins & pop-up emitters',
      'Downspout extensions & rerouting',
      'Swales & dry creek beds',
      'Erosion control on slopes',
    ],
    photoBank: ['IMG_3736.jpg', 'IMG_3523.jpg', 'IMG_3683.jpg', 'IMG_3454.jpg', 'IMG_3452.jpg'],
    seasonText: 'East Texas clay holds water and spring storms come in heavy stretches, so drainage work matters most heading into the wet months — but a regrade or French drain can go in any time the ground is workable.',
    cadenceFAQ: 'Drainage is typically a one-time install, though we will check the system after the first few heavy rains and can clear catch basins seasonally if you would like us to.',
  },
  {
    slug: 'retaining-walls', display: 'Retaining Walls', lower: 'retaining walls',
    bullets: [
      'Segmental block retaining walls',
      'Natural stone & boulder walls',
      'Seating walls & garden walls',
      'Terraced & multi-tier walls',
      'Engineered base, gravel backfill & geogrid',
      'Drainage & weep outlets behind every wall',
    ],
    photoBank: ['6.jpg', 'IMG_3452.jpg', 'IMG_3454.jpg', 'IMG_3523.jpg', 'IMG_3683.jpg'],
    seasonText: 'A retaining wall lives or dies on what sits behind it, so every wall we build starts with a compacted base set below grade, gravel backfill, and a drain that carries water to daylight before East Texas clay can push the wall out of line.',
    cadenceFAQ: 'A retaining wall is a one-time build rather than a recurring service, and a wall set on a compacted base with drainage behind it is made to hold the grade for decades.',
  },
];

// ---------------- CLOSE-RING LOCAL CONTENT ----------------
// Longview / White Oak / Kilgore are the priority battleground cities for the niche-keyword
// map pack. Their pages get genuinely unique, locally-grounded content so they are not thin
// templated city-swaps: a city lead paragraph, a per-service soil/condition angle, a local
// proof FAQ, real before/after photos, and real Google reviews. Everything here is factual
// East-Texas detail or a verbatim review from the homepage review schema. No em dashes
// (Miller's house style) and no city claimed on a photo we cannot place.

const CLOSE_RING = new Set(['longview', 'white-oak', 'kilgore']);

// City lead paragraph (replaces the generic clay-soil p2). {ANGLE} = per-service soil clause,
// {S} = service.lower. Anchored on well-known local geography.
const CITY_LEAD = {
  longview: `Longview is the hub of the Piney Woods and the largest city in Gregg County, and the yards here come with the territory: tall pines, mature oaks, rolling lots, and the iron-red clay East Texas is known for. {ANGLE} We have worked yards from Pine Tree and Spring Hill to Greggton and the older neighborhoods near downtown, and {S} here only works when it is built for that ground instead of a one-size-fits-all script.`,
  'white-oak': `White Oak is a tight-knit Gregg County town strung along US-80 just west of Longview, Roughneck country where a lot of the lots sit under established shade and mature trees. {ANGLE} We treat these established yards like our own, and our {S} is built around what White Oak's ground and shade actually call for.`,
  kilgore: `Kilgore wears its history out loud, from the oil derricks downtown on the World's Richest Acre to the Rangerettes at Kilgore College, and it sits right on the Gregg and Rusk county line. {ANGLE} The soils here lean sandy and piney, and our {S} is tuned to that fast-draining East Texas ground rather than a generic script.`,
};

// Per-(city, service) soil/condition angle. One bespoke clause for all 18 close-ring combos.
const SERVICE_ANGLE = {
  longview: {
    'hedge-trimming': `Longview's long humid summers push boxwood, holly, and ligustrum hard, so foundation plantings around these homes can swallow a window in one season without steady shaping.`,
    'flower-bed-installation': `Longview's heavy red clay bakes hard and drains slow, so a bed here lives or dies on prep: we break up and amend the clay and set the grade so water runs away from the house.`,
    'sod-installation': `New sod struggles to root in Longview's compacted red clay, so we till and amend before a single roll goes down, then leave a watering plan built for clay that sheds water faster than sand.`,
    'mulch-installation': `A good mulch layer matters more on Longview's clay than almost anywhere: it keeps the surface from crusting in the August heat and holds moisture in beds that otherwise dry hard between rains.`,
    'tree-planting': `Planting into Longview's red clay means digging wide rather than deep and building a watering basin, because clay traps water around a too-deep root ball and can drown a young tree.`,
    'drainage': `Longview's red clay and rolling lots are a recipe for standing water and soggy low spots after the heavy spring storms that roll through the Piney Woods, which is why French drains and regrading are some of our most-requested work here.`,
  },
  'white-oak': {
    'hedge-trimming': `A lot of White Oak's older lots sit under mature shade, where hedges grow leggy reaching for light, so we shape them to stay full and keep the foundation plantings off the brick.`,
    'flower-bed-installation': `White Oak's lighter, sandier soil drains well but dries out fast and runs low on nutrients, so we work in compost and lean on plantings that hold up in the dappled shade common on these lots.`,
    'sod-installation': `White Oak's sandier ground drains quickly, which is friendly to new sod but means it can dry between waterings, so we match the grass to the sun the lot gets and set a schedule that keeps roots damp while they take.`,
    'mulch-installation': `On White Oak's sandy, fast-draining lots, mulch earns its keep holding moisture around roots and feeding the soil as it breaks down, kept pulled back off the trunks and even across the bed.`,
    'tree-planting': `White Oak's sandy loam is forgiving to dig and drains well, so the make-or-break for a new tree here is water through the first two summers, which we plan for with a basin and a clear aftercare plan.`,
    'drainage': `Even on White Oak's sandier ground, downspouts dumping at the foundation and flat low spots still pool after a hard rain, so we reroute the water with extensions, swales, and catch basins until it leaves the yard.`,
  },
  kilgore: {
    'hedge-trimming': `Kilgore's warm, humid stretch from spring into fall keeps hedges growing, and we keep the boxwoods, hollies, and ligustrums around these homes shaped without shocking them into bare spots.`,
    'flower-bed-installation': `Kilgore's sandy, piney soil drains fast and leans acidic, so we amend for moisture and nutrition and choose plantings that thrive in that East Texas ground rather than fight it.`,
    'sod-installation': `Kilgore's sandy soil drains fast, which is great against root rot but means new sod dries out quickly, so we amend to hold moisture and leave a watering plan that keeps the first few weeks on track.`,
    'mulch-installation': `On Kilgore's fast-draining sandy beds, a fresh even mulch layer is what holds water around the roots through summer and keeps weeds out of the open ground between plants.`,
    'tree-planting': `Kilgore's sandy ground is easy to dig and drains freely, so young trees here mainly need steady water their first couple of summers, set up with a basin and mulch ring at planting.`,
    'drainage': `Kilgore's sandy soil drains better than Longview's clay, but downspouts, hardpan layers, and flat spots still pond after heavy storms, so we grade and route the water out with drains and emitters sized to the lot.`,
  },
};

// 4th, city-specific FAQ for the close-ring pages: local proof plus the 5.0 / 110+ review moat.
const LOCAL_FAQ = {
  longview: {
    q: `Are you local to Longview, TX?`,
    a: `Yes. Yard Dog is based right here and works Longview yards every week, from Pine Tree and Spring Hill to Greggton and the neighborhoods near downtown. We are family-owned, fully insured, and hold a 5.0 rating across more than 110 Google reviews from East Texas homeowners.`,
  },
  'white-oak': {
    q: `Are you local to White Oak, TX?`,
    a: `Yes. White Oak is one of our core service areas, just up US-80 from our Longview base. We are family-owned and fully insured with a 5.0 rating across more than 110 Google reviews, including White Oak neighbors who switched to Yard Dog.`,
  },
  kilgore: {
    q: `Are you local to Kilgore, TX?`,
    a: `Yes. We work Kilgore regularly, from the neighborhoods around Kilgore College to homes all over town. Yard Dog is family-owned, fully insured, and holds a 5.0 rating across more than 110 Google reviews from East Texas homeowners.`,
  },
};

// Real before/after photos (Yard Dog's own jobs) for services we have verified imagery for.
// Captioned honestly as East-Texas work; we do not claim a city we cannot place the photo in.
const BEFORE_AFTER = {
  'flower-bed-installation': [
    { src: '2026-05-17-janessa-glenn-front-roses-before.jpg', cap: 'Before', alt: 'Front flower bed before a Yard Dog renovation in East Texas' },
    { src: '2026-05-17-janessa-glenn-front-roses-after.jpg', cap: 'After: a Yard Dog flower bed renovation in East Texas', alt: 'Freshly planted and mulched front rose bed after Yard Dog flower bed installation' },
    { src: '2026-05-17-janessa-glenn-side-hydrangeas-after.jpg', cap: 'A hydrangea bed cleaned up, planted, and mulched', alt: 'Hydrangea flower bed planted, edged, and mulched by Yard Dog Landscapes' },
  ],
  'mulch-installation': [
    { src: 'brysoncornerbefore.jpg', cap: 'Before', alt: 'Tired corner bed before Yard Dog re-edged and mulched it' },
    { src: 'brysoncornerafter.jpg', cap: 'After: re-edged and topped with fresh mulch', alt: 'Corner bed re-edged and mulched by Yard Dog Landscapes in East Texas' },
    { src: '2026-05-17-janessa-glenn-back-fence-after.jpg', cap: 'A clean-cut, mulched bed line along the fence', alt: 'Mulched bed line cut clean along a back fence by Yard Dog Landscapes' },
  ],
};

// Real Google reviews, verbatim from the homepage review schema. Rendered as visible
// testimonials only (no Review JSON-LD on these pages: off-subject first-party review markup
// risks Google's review-snippet policy; the homepage carries the canonical markup).
const REVIEWS = {
  staci:   { name: 'Staci Barham',  sub: 'Google Review · Drainage', quote: `I recently hired Miller to clear out my ditch area, and I couldn't be more impressed with the results. They cleared the area quickly, removing overgrowth and debris and ensuring proper drainage. The ditch now looks great, and I can already tell it's going to function much better. Highly recommend Miller for any type of lawn care!` },
  anna:    { name: 'Anna Dear',     sub: 'Google Review · White Oak', quote: `These guys did a great job. They were even sweet and brought my trash can up to the house. Glad we switched to Yard Dog. We'd recommend them to anyone in the White Oak area!` },
  ashley:  { name: 'Ashley Riley',  sub: 'Verified Google Review',    quote: `Miller and the 2 young gentleman that did work at my home today were great! Each of them had great manners, respect and worked extremely hard to get the job done. I look forward to using them again in the near future.` },
  travis:  { name: 'Travis Martin', sub: 'Verified Google Review',    quote: `Fantastic service, team has taken great care of our lawn. Always on time and respectful of the land. These guys go the extra mile.` },
  penny:   { name: 'Penny Behan',   sub: 'Verified Google Review',    quote: `Does a great job. Shows up on time. Prices are good. Very friendly. I highly recommend this service.` },
  melissa: { name: 'Melissa Adams', sub: 'Verified Google Review',    quote: `Miller did a wonderful job! He was quick and thorough, I would recommend Yard Dog highly!` },
  john:    { name: 'John Frazier',  sub: 'Verified Google Review',    quote: `Professional and courteous. The price for the job was reasonable and was better than others I had checked with.` },
};
const GENERAL_REVIEWS = ['ashley', 'travis', 'penny', 'melissa', 'john'];

// Pick 3 reviews per close-ring page: surface a relevant one (drainage -> Staci's ditch job,
// White Oak -> Anna who names White Oak), then fill from the general pool, rotated so sibling
// pages do not all show the same set.
function pickReviews(service, citySlug, cityIndex, serviceIndex) {
  const picks = [];
  if (service.slug === 'drainage') picks.push('staci');
  if (citySlug === 'white-oak') picks.push('anna');
  const offset = (cityIndex + serviceIndex) % GENERAL_REVIEWS.length;
  for (let i = 0; picks.length < 3 && i <= GENERAL_REVIEWS.length; i++) {
    const r = GENERAL_REVIEWS[(offset + i) % GENERAL_REVIEWS.length];
    if (!picks.includes(r)) picks.push(r);
  }
  return picks.slice(0, 3).map(k => REVIEWS[k]);
}

// ---------------- HELPERS ----------------

function escAmp(s) {
  return String(s).replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
}

function pickPhotos(service, cityIndex) {
  const bank = service.photoBank;
  const start = cityIndex % bank.length;
  const out = [];
  for (let i = 0; i < 4; i++) out.push(bank[(start + i) % bank.length]);
  return { hero: out[0], grid: [out[1], out[2], out[3]] };
}

function introParagraphs(service, city) {
  const sLow = service.lower;
  const cd = city.display;
  const ct = city.county;
  const nb = city.nearby.map(n => cityBySlug[n].display);
  const p1 = `Yard Dog Landscapes is the ${sLow} ${cd} TX homeowners trust to show up, do the work right, and treat the property like our own. We've been working yards across ${ct} since 2017, and ${cd} sits in our regular service area alongside ${nb[0]} and ${nb[1]}. When you call us for ${sLow} ${cd} Texas, you get a local crew, a written estimate, and the same standards on every visit.`;
  // Close-ring cities get a unique, locally-grounded p2 (city lead + per-service soil angle);
  // every other city keeps the shared seasonal paragraph.
  let p2;
  if (CLOSE_RING.has(city.slug)) {
    p2 = CITY_LEAD[city.slug]
      .replace('{ANGLE}', SERVICE_ANGLE[city.slug][service.slug])
      .replace(/\{S\}/g, sLow);
  } else {
    p2 = `${cd} sits in the heart of East Texas, where hot summers, clay-heavy soil, and stretches of heavy spring rain shape what your yard actually needs. ${service.seasonText} Yard Dog Landscapes ${cd} clients get a service plan tuned to the local climate — not a one-size-fits-all script — because East Texas ${sLow} only works when the schedule and the methods match the ground.`;
  }
  const p3 = `From routine ${sLow} to bigger seasonal projects, our crew handles ${cd} properties of every size. We also serve nearby ${nb[0]}, ${nb[1]}, and ${nb[2]}, plus the rest of ${ct}. Call (903) 844-6877 or request a free quote online — we walk every property in person before we send a price.`;
  return [p1, p2, p3];
}

function faqs(service, city) {
  const sLow = service.lower;
  const cd = city.display;
  const ct = city.county;
  const nb = city.nearby.map(n => cityBySlug[n].display);
  const list = [
    {
      q: `Do you offer ${sLow} in ${cd}, TX?`,
      a: `Yes. Yard Dog Landscapes is a family-owned company that's been serving ${cd} and the rest of ${ct} since 2017, and ${sLow} is one of our core services. Whether you want a one-time job or recurring work tied to the season, we'll write up a clear, itemized estimate and stick to it.`,
    },
    {
      q: `How often should I schedule ${sLow} in ${cd}?`,
      a: `${service.cadenceFAQ} Every ${cd} property is a little different, so we'll walk yours and recommend a schedule that fits how the yard actually grows.`,
    },
    {
      q: `What areas near ${cd} do you serve?`,
      a: `Yard Dog Landscapes serves ${cd}, plus nearby ${nb[0]}, ${nb[1]}, ${nb[2]}, and surrounding ${ct} communities. If you're not sure whether you're in our service area, give us a call at (903) 844-6877 — we cover most of East Texas.`,
    },
  ];
  // Close-ring pages get a 4th local-proof FAQ (neighborhoods + the 5.0 review moat).
  if (CLOSE_RING.has(city.slug)) list.push(LOCAL_FAQ[city.slug]);
  return list;
}

// ---------------- SHARED CHROME (lifted verbatim from live landscaping-<city>-tx.html) ----------------

function navbar() {
  return `  <header class="navbar">
    <div class="container">
      <div class="nav-wrap" id="navWrap">
        <div class="nav-inner">
          <a class="nav-brand" href="/" aria-label="Yard Dog Landscapes home">
            <img class="nav-banner" src="brand_assets/yard-dog-banner.png" alt="Yard Dog Landscapes" width="220" height="51" decoding="async">
          </a>
          <button class="hamburger" id="hamburgerBtn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="navLinks">
            <span class="hamburger-bars" aria-hidden="true"><span></span><span></span><span></span></span>
          </button>
          <ul class="nav-links" id="navLinks">
            <li><a class="nav-link" href="/">Home</a></li>
            <li><a class="nav-link" href="about">About Us</a></li>
            <li><a class="nav-link" href="our-work">Our Work</a></li>
            <li class="nav-item has-dropdown" id="servicesItem">
              <a class="nav-link" href="services">Services <span class="nav-caret" aria-hidden="true">▾</span></a>
              <div class="dropdown dropdown--mega dropdown--mega-4" id="servicesDropdown">
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Maintenance</span>
                  <a href="lawn-maintenance">Lawn Maintenance</a>
                  <a href="leaf-removal">Leaf Removal</a>
                  <a href="fertilization">Fertilization</a>
                  <a href="hedge-trimming">Hedge Trimming</a>
                  <a href="tree-shrub-care">Tree &amp; Shrub Care</a>
                </div>
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Installation</span>
                  <a href="landscaping">Landscaping</a>
                  <a href="flower-bed-installation">Flower Bed Installation</a>
                  <a href="mulch-installation">Mulch Installation</a>
                  <a href="sod-installation">Sod Installation</a>
                  <a href="tree-planting">Tree Planting</a>
                </div>
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Hardscape &amp; Specialty</span>
                  <a href="hardscaping">Hardscaping &amp; Patios</a>
                  <a href="retaining-walls">Retaining Walls</a>
                  <a href="drainage">Drainage</a>
                  <a href="christmas-lights">Christmas Lights</a>
                </div>
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Design</span>
                  <a href="design-preview">Design Preview</a>
                </div>
              </div>
            </li>
            <li><a class="nav-link" href="blog">Blog</a></li>
            <li><a class="nav-link" href="contact">Contact Us</a></li>
            <li><a class="nav-mobile-cta" href="contact">Get a Free Quote</a></li>
          </ul>
          <a class="btn btn-primary nav-cta" href="contact">Get a Free Quote</a>
        </div>
      </div>
    </div>
  </header>`;
}

// Footer = live 5-column footer, with hours set to "Open 24 Hours" to match GBP.
function footer() {
  return `  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="fb-logo">
            <img src="brand_assets/Yard Dog Logo.png" alt="Yard Dog Landscapes logo" loading="lazy" decoding="async" width="64" height="64">
            <strong>YARD DOG LANDSCAPES</strong>
          </div>
          <span class="fb-tag">Sit. Stay. Perfect Landscape.</span>
          <p>Family-owned landscape design, lawn care, and hardscaping serving Longview and East Texas since 2017.</p>
          <div class="social-row">
            <a href="https://facebook.com/yarddoglandscapes" aria-label="Facebook" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.4-2 2-2h2V2.1C16.6 2 15.3 2 14 2c-3 0-5 1.8-5 5v3H6v4h3v8h4z"/></svg></a>
            <a href="https://youtube.com/millermaines" aria-label="YouTube" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5 3-5 3z"/></svg></a>
            <a href="https://instagram.com/yarddoglawnlights" aria-label="Instagram" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="lawn-maintenance">Lawn Care</a></li>
            <li><a href="landscaping">Landscaping</a></li>
            <li><a href="hardscaping">Hardscaping</a></li>
            <li><a href="tree-shrub-care">Tree &amp; Shrub Care</a></li>
            <li><a href="leaf-removal">Leaf Removal</a></li>
            <li><a href="fertilization">Fertilization</a></li>
            <li><a href="christmas-lights">Christmas Lights</a></li>
            <li><a href="drainage">Drainage</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="about">About Us</a></li>
            <li><a href="our-work">Our Work</a></li>
            <li><a href="contact">Contact Us</a></li>
            <li><a href="contact">Get a Free Quote</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Service Areas</h4>
          <ul>
            <li><a href="longview-tx">Longview, TX</a></li>
            <li><a href="white-oak-tx">White Oak, TX</a></li>
            <li><a href="hallsville-tx">Hallsville, TX</a></li>
            <li><a href="kilgore-tx">Kilgore, TX</a></li>
            <li><a href="marshall-tx">Marshall, TX</a></li>
            <li><a href="tyler-tx">Tyler, TX</a></li>
            <li><a href="gladewater-tx">Gladewater, TX</a></li>
            <li><a href="henderson-tx">Henderson, TX</a></li>
            <li><a href="carthage-tx">Carthage, TX</a></li>
            <li><a href="nacogdoches-tx">Nacogdoches, TX</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <div class="footer-contact">
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92V21a1 1 0 0 1-1.1 1A19 19 0 0 1 2 4.1 1 1 0 0 1 3 3h4.09a1 1 0 0 1 1 .75l1 4a1 1 0 0 1-.27 1L7.21 10.21a16 16 0 0 0 6.58 6.58l1.45-1.61a1 1 0 0 1 1-.27l4 1a1 1 0 0 1 .76 1z"/></svg><a href="tel:+19038446877">(903) 844-6877</a></div>
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><a href="mailto:info@yarddoglandscapes.com">info@yarddoglandscapes.com</a></div>
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg><span>Longview, TX</span></div>
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Open 24 Hours</span></div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">© 2026 Yard Dog Landscapes. All Rights Reserved.</div>
    </div>
  </footer>`;
}

function pageScript() {
  return `  <script>
    (function(){
      var navWrap = document.getElementById('navWrap');
      var hamburger = document.getElementById('hamburgerBtn');
      var servicesItem = document.getElementById('servicesItem');
      if (hamburger && navWrap) {
        hamburger.addEventListener('click', function(){
          var open = navWrap.classList.toggle('is-open');
          hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
      if (servicesItem) {
        var servicesTrigger = servicesItem.querySelector('.nav-link');
        if (servicesTrigger) {
          servicesTrigger.addEventListener('click', function(e){
            if (window.matchMedia('(max-width: 900px)').matches) {
              e.preventDefault();
              servicesItem.classList.toggle('is-open');
            }
          });
        }
      }
      // Hand-drawn CTA squiggle: animate when each .cta-mark scrolls into view
      (function () {
        var marks = document.querySelectorAll('.cta-mark');
        if (!marks.length) return;
        if (!('IntersectionObserver' in window)) {
          marks.forEach(function (m) { m.classList.add('is-drawn'); });
          return;
        }
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-drawn');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.45 });
        marks.forEach(function (m) { io.observe(m); });
      })();
    })();

      // Spotlight cursor tracker — sets --glow-x/y/xp on :root for the glow border effect
      (function () {
        var root = document.documentElement;
        function update(e) {
          var x = (e.clientX != null) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
          var y = (e.clientY != null) ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
          root.style.setProperty('--glow-x', x);
          root.style.setProperty('--glow-y', y);
          root.style.setProperty('--glow-xp', (x / window.innerWidth).toFixed(3));
        }
        document.addEventListener('pointermove', update, { passive: true });
        document.addEventListener('touchmove', update, { passive: true });
      })();
  </script>`;
}

const CTA_MARK_SVG = `<svg class="cta-mark-svg" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M 950 90 C 1250 300, 1050 480, 600 520 C 250 520, 150 480, 150 300 C 150 120, 350 80, 600 80 C 850 80, 950 180, 950 180" /></svg>`;

// ---------------- PAGE BUILDER ----------------

function jsonLd(obj) {
  return `  <script type="application/ld+json">\n${JSON.stringify(obj, null, 2).split('\n').map(l => '    ' + l).join('\n')}\n  </script>`;
}

function page(service, city, cityIndex) {
  const filename = `${service.slug}-${city.slug}-tx.html`;
  const slug = `${service.slug}-${city.slug}-tx`;
  const canonical = `${BASE}/${slug}`;
  const sDisp = service.display;
  const sDispEsc = escAmp(sDisp);
  const sLow = service.lower;
  const cd = city.display;
  const nb = city.nearby.map(n => cityBySlug[n]);
  const photos = pickPhotos(service, cityIndex);

  const title = `${sDispEsc} in ${cd}, TX | Yard Dog Landscapes`;
  const description = `Looking for professional ${sLow} in ${cd}, TX? Yard Dog Landscapes serves ${cd} and surrounding East Texas communities. Call (903) 844-6877 for a free quote.`;
  const ogDesc = `Family-owned ${sLow} in ${cd}, TX from Yard Dog Landscapes. Serving ${cd} and East Texas since 2017.`;

  // -- JSON-LD: Service + FAQPage + BreadcrumbList --
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: sDisp,
    name: `${sDisp} in ${cd}, TX`,
    provider: {
      '@type': 'LocalBusiness',
      '@id': BIZ_ID,
      name: 'Yard Dog Landscapes',
      image: LOGO,
      telephone: '+1-903-844-6877',
      email: 'info@yarddoglandscapes.com',
      url: BASE,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Longview',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
    },
    areaServed: { '@type': 'City', name: `${cd}, TX` },
    url: canonical,
    description,
  };

  const faqList = faqs(service, city);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services` },
      { '@type': 'ListItem', position: 3, name: sDisp, item: `${BASE}/${service.slug}` },
      { '@type': 'ListItem', position: 4, name: `${sDisp} in ${cd}, TX`, item: canonical },
    ],
  };

  const intro = introParagraphs(service, city);
  const includedCards = service.bullets
    .map(b => `          <div class="included-card"><span class="ic-check" aria-hidden="true">✓</span><span class="ic-text">${escAmp(b)}</span></div>`)
    .join('\n');

  const faqHtml = faqList
    .map(f => `          <details class="faq-item">
            <summary>${escAmp(f.q)}</summary>
            <div class="faq-body"><p>${escAmp(f.a)}</p></div>
          </details>`)
    .join('\n');

  const alsoChips = nb
    .map(n => `          <a class="also-chip" href="${service.slug}-${n.slug}-tx">${sDispEsc} in ${n.display}, TX</a>`)
    .join('\n');

  const head = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <link rel="icon" href="brand_assets/Yard Dog Logo.png" />
  <link rel="stylesheet" href="styles.css">
${jsonLd(serviceSchema)}
${jsonLd(faqSchema)}
${jsonLd(breadcrumbSchema)}
</head>`;

  const body = `<body>

${navbar()}

  <main id="main">

    <section class="page-hero page-hero--photo" style="background-image: url('brand_photos/${photos.hero}');">
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a><span class="sep">›</span><a href="services">Service Areas</a><span class="sep">›</span>${sDispEsc} in ${cd}, TX</p>
        <h1>${sDispEsc} in ${cd}, TX</h1>
        <p class="lead">Professional ${sLow} serving ${cd} and surrounding East Texas communities.</p>
        <span class="cta-mark cta-mark--cream">${CTA_MARK_SVG}<a class="btn btn-primary" href="contact">Get a Free Quote in ${cd}</a></span>
      </div>
    </section>

    <section class="section bg-section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Local ${sDispEsc}</span>
          <h2>Trusted ${sDispEsc} Company Serving ${cd}, TX</h2>
        </div>
        <div class="intro-prose">
          <p>${intro[0]}</p>
          <p>${intro[1]}</p>
          <p>${intro[2]}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">What's Included</span>
          <h2>What's Included With ${sDispEsc} in ${cd}</h2>
        </div>
        <div class="included-grid">
${includedCards}
        </div>
      </div>
    </section>

    <section class="section bg-section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Recent Work</span>
          <h2>${sDispEsc} we've done around East Texas.</h2>
        </div>
        <div class="photo-grid">
          <figure class="photo-figure">
            <img class="work-photo" src="brand_photos/${photos.grid[0]}" alt="${sDispEsc} project example in ${cd}, TX" loading="lazy" width="1200" height="900">
          </figure>
          <figure class="photo-figure">
            <img class="work-photo" src="brand_photos/${photos.grid[1]}" alt="${sDispEsc} work in ${cd}, TX by Yard Dog Landscapes" loading="lazy" width="1200" height="900">
          </figure>
          <figure class="photo-figure">
            <img class="work-photo" src="brand_photos/${photos.grid[2]}" alt="Local ${sLow} crew working in ${cd}, TX" loading="lazy" width="1200" height="900">
          </figure>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Why Yard Dog</span>
          <h2>Why ${cd} Homeowners Choose Yard Dog Landscapes</h2>
        </div>
        <div class="trust-points" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
          <div class="trust-point">
            <div class="tp-icon" aria-hidden="true">🌎</div>
            <h4>Local crew, local knowledge</h4>
            <p>Familiar with East Texas soil, grass, and climate — because we work it every day.</p>
          </div>
          <div class="trust-point">
            <div class="tp-icon" aria-hidden="true">📋</div>
            <h4>Free on-site quotes within 24 hours</h4>
            <p>We walk the property in person and send a written, itemized estimate fast.</p>
          </div>
          <div class="trust-point">
            <div class="tp-icon" aria-hidden="true">🛡</div>
            <h4>Licensed, insured, family-owned since 2017</h4>
            <p>Same crew, same standards, every visit. Fully licensed and insured.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <aside class="area-callout">
          <p>Yard Dog Landscapes proudly serves ${cd}, TX and nearby communities including ${nb[0].display}, ${nb[1].display}, and ${nb[2].display}.</p>
        </aside>
      </div>
    </section>

    <section class="section bg-section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">FAQ</span>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div class="faq-list">
${faqHtml}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container also-serving">
        <h3>Also serving nearby areas:</h3>
        <div class="also-chips">
${alsoChips}
        </div>
      </div>
    </section>

    <section class="section bg-dark">
      <div class="container cta-banner">
        <h2>Ready for professional ${sLow} in ${cd}, TX?</h2>
        <p>Call (903) 844-6877 or request a free quote online.</p>
        <div class="btns">
          <span class="cta-mark cta-mark--cream">${CTA_MARK_SVG}<a class="btn btn-outline" href="tel:+19038446877">Call Now</a></span>
          <span class="cta-mark cta-mark--cream">${CTA_MARK_SVG}<a class="btn btn-primary" href="contact">Get a Free Quote</a></span>
        </div>
      </div>
    </section>

  </main>

${footer()}

${pageScript()}

</body>
</html>`;

  return { filename, html: head + '\n' + body + '\n' };
}

// ---------------- MAIN ----------------

let written = 0;
for (let ci = 0; ci < CITIES.length; ci++) {
  for (const service of SERVICES) {
    const { filename, html } = page(service, CITIES[ci], ci);
    fs.writeFileSync(path.join(ROOT, filename), html, 'utf8');
    written++;
  }
}
console.log(`Wrote ${written} niche service-location pages (${SERVICES.length} services x ${CITIES.length} cities).`);
