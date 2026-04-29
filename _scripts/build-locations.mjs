// build-locations.mjs
// Generates 80 service-location pages, 10 city hub pages, sitemap.xml, and robots.txt
// Also patches the footer in 9 existing sub-pages (.footer-grid) and index.html (Tailwind footer).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ---------------- DATA ----------------

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

const SERVICES = [
  {
    slug: 'lawn-maintenance', display: 'Lawn Maintenance', lower: 'lawn maintenance',
    parent: 'lawn-maintenance.html',
    bullets: [
      'Weekly & bi-weekly mowing',
      'Edging & trimming',
      'Sidewalk & driveway blowing',
      'Seasonal cleanups',
      'Property upkeep',
      'Reliable scheduling'
    ],
    photoBank: ['7.jpg','8.jpg','12.jpg','3.jpg'],
    seasonText: 'Lawn growing season in East Texas runs March through October, so most homeowners book weekly mowing during peak months and bi-weekly service in early spring and late fall.',
    cadenceFAQ: 'Most properties in this area do best with weekly mowing from late March through October, then bi-weekly visits as growth slows. We tailor the schedule to your turf type and how the season is actually playing out.'
  },
  {
    slug: 'landscaping', display: 'Landscaping', lower: 'landscaping',
    parent: 'landscaping.html',
    bullets: [
      'Custom plant bed design & installation',
      'Native and adaptive plantings',
      'Mulch & rock bed installation',
      'Retaining walls & drainage',
      'Seasonal color planting',
      'Full yard transformations'
    ],
    photoBank: ['IMG_3525.jpg','IMG_3526.jpg','IMG_3680.jpg','IMG_3736.jpg','IMG_3738.jpg','1.jpg','4.jpg','5.jpg','6.jpg','10.jpg'],
    seasonText: 'Fall and early spring are the strongest install windows in East Texas — cooler soil temperatures help new plantings root in before summer heat sets in.',
    cadenceFAQ: 'Most landscape installs are one-time projects, but seasonal color refreshes work well twice a year, and mulch typically gets refreshed annually in spring.'
  },
  {
    slug: 'leaf-removal', display: 'Leaf Removal', lower: 'leaf removal',
    parent: 'leaf-removal.html',
    bullets: [
      'Full-property leaf cleanup',
      'Bagging and hauling',
      'Bed and driveway clearing',
      'Pre-winter cleanup',
      'Post-storm cleanups',
      'Gutter clearing (exterior)'
    ],
    photoBank: ['IMG_3526.jpg','IMG_3736.jpg','3.jpg','6.jpg'],
    seasonText: 'Heavy leaf drop in East Texas typically runs from early November through January, with post-oak, sweetgum, and pecan leaves piling up fast after the first cold snap.',
    cadenceFAQ: 'Most properties need at least two full cleanups during peak leaf drop — usually one mid-season and a second after the last leaves come down. Larger lots with mature trees often book a third visit.'
  },
  {
    slug: 'fertilization', display: 'Lawn Fertilization', lower: 'lawn fertilization',
    parent: 'fertilization.html',
    bullets: [
      'Soil testing & analysis',
      'East Texas grass-specific programs',
      'Weed control treatments',
      'Pre-emergent & post-emergent applications',
      'Aeration services',
      'Seasonal fertilization schedules'
    ],
    photoBank: ['12.jpg','8.jpg','3.jpg','7.jpg'],
    seasonText: 'Bermuda, St. Augustine, and Zoysia all do well in East Texas with a structured feeding schedule — typically four to six rounds across the growing season.',
    cadenceFAQ: 'Our fertilization programs run on a four-to-six step schedule across the year, hitting pre-emergent in late winter, growth-season feedings in spring and summer, and a winterizer in fall.'
  },
  {
    slug: 'christmas-lights', display: 'Christmas Light Installation', lower: 'Christmas light installation',
    parent: 'christmas-lights.html',
    bullets: [
      'Custom-cut professional lights',
      'Colored bulb options',
      'Full roofline & tree wrapping',
      'Post-season takedown & storage',
      'Year-to-year maintenance',
      'Commercial & residential'
    ],
    photoBank: ['9.jpg','11.jpg'],
    seasonText: 'Installs run from early November through mid-December, with takedown service starting the first week of January.',
    cadenceFAQ: 'Most clients book in the same time window each year — we install starting in early November and take everything down in January. Booking early gets you the install date you want.'
  },
  {
    slug: 'hardscaping', display: 'Hardscaping & Patios', lower: 'hardscaping',
    parent: 'services.html',
    bullets: [
      'Paver patios & walkways',
      'Retaining walls',
      'Fire pits & seating walls',
      'Outdoor kitchens & grills',
      'Site grading & drainage prep',
      'Stacked-stone & flagstone work'
    ],
    photoBank: ['IMG_3452.jpg','IMG_3454.jpg','IMG_3737.jpg','IMG_3523.jpg','IMG_3683.jpg'],
    seasonText: 'Hardscape installs run year-round in East Texas, with the biggest scheduling demand in spring and fall.',
    cadenceFAQ: 'Hardscape projects are one-time installs, but periodic sealing and joint-sand top-ups every two to three years help paver patios stay tight and clean.'
  },
  {
    slug: 'tree-shrub-care', display: 'Tree & Shrub Care', lower: 'tree and shrub care',
    parent: 'services.html',
    bullets: [
      'Pruning & trimming',
      'Shaping & shearing',
      'Limb removal',
      'Seasonal feeding',
      'Disease & pest treatment',
      'Tree removal coordination'
    ],
    photoBank: ['IMG_3525.jpg','1.jpg','4.jpg','6.jpg','5.jpg'],
    seasonText: 'Late winter and early spring are the prime windows for major pruning on most East Texas ornamentals before bud break.',
    cadenceFAQ: 'Most ornamental shrubs do well with two shapings per year, and shade trees benefit from a structural prune every two to three years.'
  },
  {
    slug: 'irrigation-drainage', display: 'Irrigation & Drainage', lower: 'irrigation and drainage',
    parent: 'services.html',
    bullets: [
      'Smart sprinkler installations',
      'Drip-line systems',
      'French drains',
      'Surface grading',
      'Sprinkler repair',
      'Backflow inspection'
    ],
    photoBank: ['IMG_3736.jpg','IMG_3526.jpg','11.jpg','10.jpg'],
    seasonText: 'East Texas summers regularly hit drought stretches in July and August, while heavy spring rain creates drainage problems on flat lots and clay-heavy soil.',
    cadenceFAQ: 'Most systems benefit from a spring start-up check and a fall winterization. Drainage projects are typically one-time installs, with periodic inspection every couple of years.'
  },
];

// ---------------- HELPERS ----------------

function esc(s) {
  return String(s).replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
}

function pickPhotos(service, cityIndex) {
  const bank = service.photoBank;
  const start = cityIndex % bank.length;
  const out = [];
  for (let i = 0; i < 4; i++) {
    out.push(bank[(start + i) % bank.length]);
  }
  return { hero: out[0], grid: [out[1], out[2], out[3]] };
}

function navbar(activePath) {
  const isServices = ['landscaping.html','lawn-maintenance.html','leaf-removal.html','fertilization.html','christmas-lights.html','services.html'].includes(activePath);
  return `  <header class="navbar">
    <div class="container">
      <div class="nav-wrap" id="navWrap">
        <div class="nav-inner">
          <a class="nav-brand" href="index.html" aria-label="Yard Dog Landscapes home">
            <img src="brand_assets/Yard Dog Logo.png" alt="Yard Dog Landscapes logo">
            <span class="nav-brand-text">YARD DOG <span class="brand-accent">LANDSCAPES</span></span>
          </a>
          <button class="hamburger" id="hamburgerBtn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="navLinks">
            <span class="hamburger-bars" aria-hidden="true"><span></span><span></span><span></span></span>
          </button>
          <ul class="nav-links" id="navLinks">
            <li><a class="nav-link" href="index.html">Home</a></li>
            <li><a class="nav-link" href="about.html">About Us</a></li>
            <li><a class="nav-link" href="our-work.html">Our Work</a></li>
            <li class="nav-item has-dropdown" id="servicesItem">
              <a class="nav-link${isServices ? ' active' : ''}" href="services.html">Services <span class="nav-caret" aria-hidden="true">▾</span></a>
              <div class="dropdown" id="servicesDropdown">
                <a href="landscaping.html">Landscaping</a>
                <a href="lawn-maintenance.html">Lawn Maintenance</a>
                <a href="leaf-removal.html">Leaf Removal</a>
                <a href="fertilization.html">Fertilization</a>
                <a href="christmas-lights.html">Christmas Lights</a>
              </div>
            </li>
            <li><a class="nav-link" href="contact.html">Contact Us</a></li>
            <li><a class="nav-mobile-cta" href="contact.html">Get a Free Quote</a></li>
          </ul>
          <a class="btn btn-primary nav-cta" href="contact.html">Get a Free Quote</a>
        </div>
      </div>
    </div>
  </header>`;
}

function footer() {
  // 5-column footer with Service Areas
  return `  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="fb-logo">
            <img src="brand_assets/Yard Dog Logo.png" alt="Yard Dog Landscapes logo">
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
            <li><a href="lawn-maintenance.html">Lawn Care</a></li>
            <li><a href="landscaping.html">Landscape Design</a></li>
            <li><a href="services.html">Hardscaping</a></li>
            <li><a href="services.html">Tree &amp; Shrub Care</a></li>
            <li><a href="leaf-removal.html">Leaf Removal</a></li>
            <li><a href="fertilization.html">Fertilization</a></li>
            <li><a href="christmas-lights.html">Christmas Lights</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="our-work.html">Our Work</a></li>
            <li><a href="contact.html">Contact Us</a></li>
            <li><a href="contact.html">Get a Free Quote</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Service Areas</h4>
          <ul>
            <li><a href="longview-tx.html">Longview, TX</a></li>
            <li><a href="white-oak-tx.html">White Oak, TX</a></li>
            <li><a href="hallsville-tx.html">Hallsville, TX</a></li>
            <li><a href="kilgore-tx.html">Kilgore, TX</a></li>
            <li><a href="marshall-tx.html">Marshall, TX</a></li>
            <li><a href="tyler-tx.html">Tyler, TX</a></li>
            <li><a href="gladewater-tx.html">Gladewater, TX</a></li>
            <li><a href="henderson-tx.html">Henderson, TX</a></li>
            <li><a href="carthage-tx.html">Carthage, TX</a></li>
            <li><a href="nacogdoches-tx.html">Nacogdoches, TX</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <div class="footer-contact">
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92V21a1 1 0 0 1-1.1 1A19 19 0 0 1 2 4.1 1 1 0 0 1 3 3h4.09a1 1 0 0 1 1 .75l1 4a1 1 0 0 1-.27 1L7.21 10.21a16 16 0 0 0 6.58 6.58l1.45-1.61a1 1 0 0 1 1-.27l4 1a1 1 0 0 1 .76 1z"/></svg><a href="tel:+19038446877">(903) 844-6877</a></div>
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><a href="mailto:info@yarddoglandscapes.com">info@yarddoglandscapes.com</a></div>
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg><span>Longview, TX</span></div>
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Mon–Fri 7AM–5PM, Sat 9AM–3PM</span></div>
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
    })();
  </script>`;
}

// ---------------- INTRO PARAGRAPH GENERATORS ----------------

function introParagraphs(service, city) {
  const sLow = service.lower;
  const sDisp = service.display;
  const cd = city.display;
  const ct = city.county;
  const nb = city.nearby.map(n => cityBySlug[n].display);

  const p1 = `Yard Dog Landscapes is the ${sLow} ${cd} TX homeowners trust to show up, do the work right, and treat the property like our own. We've been working yards across ${ct} since 2017, and ${cd} sits in our regular service area alongside ${nb[0]} and ${nb[1]}. When you call us for ${sLow} ${cd} Texas, you get a local crew, a written estimate, and the same standards on every visit.`;

  const p2 = `${cd} sits in the heart of East Texas, where hot summers, clay-heavy soil, and stretches of heavy spring rain shape what your yard actually needs. ${service.seasonText} Yard Dog Landscapes ${cd} clients get a service plan tuned to the local climate — not a one-size-fits-all script — because East Texas ${sLow} only works when the schedule and the methods match the ground.`;

  const p3 = `From routine ${sLow} to bigger seasonal projects, our crew handles ${cd} properties of every size. We also serve nearby ${nb[0]}, ${nb[1]}, and ${nb[2]}, plus the rest of ${ct}. Call (903) 844-6877 or request a free quote online — we walk every property in person before we send a price.`;

  return [p1, p2, p3];
}

// ---------------- FAQ GENERATORS ----------------

function faqs(service, city) {
  const sLow = service.lower;
  const cd = city.display;
  const ct = city.county;
  const nb = city.nearby.map(n => cityBySlug[n].display);

  return [
    {
      q: `Do you offer ${sLow} contracts in ${cd}, TX?`,
      a: `Yes. Yard Dog Landscapes is a family-owned company that's been serving ${cd} and the rest of ${ct} since 2017, and we offer flexible service agreements for ${sLow}. Whether you want a one-time service or recurring work tied to the season, we'll write up a clear, itemized estimate and stick to it.`
    },
    {
      q: `How often should I schedule ${sLow} in ${cd}?`,
      a: `${service.cadenceFAQ} Every ${cd} property is a little different, so we'll walk yours and recommend a schedule that fits how the yard actually grows.`
    },
    {
      q: `What areas near ${cd} do you serve?`,
      a: `Yard Dog Landscapes serves ${cd}, plus nearby ${nb[0]}, ${nb[1]}, ${nb[2]}, and surrounding ${ct} communities. If you're not sure whether you're in our service area, give us a call at (903) 844-6877 — we cover most of East Texas.`
    }
  ];
}

// ---------------- HEAD BUILDER ----------------

function head({ title, description, canonical, ogTitle, ogDesc, jsonLdBlocks }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="styles.css">
${jsonLdBlocks.map(b => `  <script type="application/ld+json">\n${JSON.stringify(b, null, 2).split('\n').map(l => '    ' + l).join('\n')}\n  </script>`).join('\n')}
</head>`;
}

// ---------------- SERVICE-LOCATION PAGE ----------------

function serviceLocationPage(service, city, cityIndex) {
  const filename = `${service.slug}-${city.slug}-tx.html`;
  const photos = pickPhotos(service, cityIndex);
  const sDisp = service.display;
  const sLow = service.lower;
  const cd = city.display;
  const ct = city.county;
  const nb = city.nearby.map(n => cityBySlug[n]);

  const sDispEsc = esc(sDisp);
  const title = `${sDispEsc} in ${cd}, TX | Yard Dog Landscapes`;
  const description = `Looking for professional ${sLow} in ${cd}, TX? Yard Dog Landscapes serves ${cd} and surrounding East Texas communities. Call (903) 844-6877 for a free quote.`;
  const canonical = `https://yarddoglandscapes.com/${filename}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": sDisp,
    "name": `${sDisp} in ${cd}, TX`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Yard Dog Landscapes",
      "telephone": "+1-903-844-6877",
      "email": "info@yarddoglandscapes.com",
      "url": "https://yarddoglandscapes.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Longview",
        "addressRegion": "TX",
        "addressCountry": "US"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": `${cd}, TX`
    },
    "url": canonical,
    "description": description
  };

  const faqList = faqs(service, city);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  const headBlock = head({
    title,
    description,
    canonical,
    ogTitle: title,
    ogDesc: `Family-owned ${sLow} in ${cd}, TX from Yard Dog Landscapes. Serving ${cd} and East Texas since 2017.`,
    jsonLdBlocks: [serviceSchema, faqSchema]
  });

  const intro = introParagraphs(service, city);
  const includedCards = service.bullets.map(b => `          <div class="included-card"><span class="ic-check" aria-hidden="true">✓</span><span class="ic-text">${b.replace(/&/g, '&amp;')}</span></div>`).join('\n');

  const photoGrid = `        <div class="photo-grid">
          <figure class="photo-figure">
            <img class="work-photo" src="brand_photos/${photos.grid[0]}" alt="${sDispEsc} project example in ${cd}, TX" loading="lazy" width="1200" height="900">
          </figure>
          <figure class="photo-figure">
            <img class="work-photo" src="brand_photos/${photos.grid[1]}" alt="${sDispEsc} work in ${cd}, TX by Yard Dog Landscapes" loading="lazy" width="1200" height="900">
          </figure>
          <figure class="photo-figure">
            <img class="work-photo" src="brand_photos/${photos.grid[2]}" alt="Local ${sLow} crew working in ${cd}, TX" loading="lazy" width="1200" height="900">
          </figure>
        </div>`;

  const faqHtml = faqList.map(f => `          <details class="faq-item">
            <summary>${f.q}</summary>
            <div class="faq-body"><p>${f.a}</p></div>
          </details>`).join('\n');

  const alsoServingChips = nb.map(n => `<a class="also-chip" href="${service.slug}-${n.slug}-tx.html">${sDispEsc} in ${n.display}, TX</a>`).join('\n          ');

  const body = `<body>

${navbar('service-location.html')}

  <main id="main">

    <section class="page-hero page-hero--photo" style="background-image: url('brand_photos/${photos.hero}');">
      <div class="container">
        <p class="breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><a href="services.html">Service Areas</a><span class="sep">›</span>${sDispEsc} in ${cd}, TX</p>
        <h1>${sDispEsc} in ${cd}, TX</h1>
        <p class="lead">Professional ${sLow} serving ${cd} and surrounding East Texas communities.</p>
        <a class="btn btn-primary" href="contact.html">Get a Free Quote in ${cd}</a>
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
${photoGrid}
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
          ${alsoServingChips}
        </div>
      </div>
    </section>

    <section class="section bg-dark">
      <div class="container cta-banner">
        <h2>Ready for professional ${sLow} in ${cd}, TX?</h2>
        <p>Call (903) 844-6877 or request a free quote online.</p>
        <div class="btns">
          <a class="btn btn-outline" href="tel:+19038446877">Call Now</a>
          <a class="btn btn-primary" href="contact.html">Get a Free Quote</a>
        </div>
      </div>
    </section>

  </main>

${footer()}

${pageScript()}

</body>
</html>`;

  return { filename, html: headBlock + '\n' + body };
}

// ---------------- CITY HUB PAGE ----------------

function cityHubPage(city, cityIndex) {
  const filename = `${city.slug}-tx.html`;
  const cd = city.display;
  const ct = city.county;
  const nb = city.nearby.map(n => cityBySlug[n]);

  const title = `Lawn Care & Landscaping in ${cd}, TX | Yard Dog Landscapes`;
  const description = `Yard Dog Landscapes offers professional lawn care, landscaping, and outdoor services in ${cd}, TX. Family-owned. Call (903) 844-6877.`;
  const canonical = `https://yarddoglandscapes.com/${filename}`;

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Yard Dog Landscapes",
    "image": "https://yarddoglandscapes.com/logo.png",
    "telephone": "+1-903-844-6877",
    "email": "info@yarddoglandscapes.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Longview",
      "addressRegion": "TX",
      "addressCountry": "US"
    },
    "url": canonical,
    "openingHours": ["Mo-Fr 07:00-17:00", "Sa 09:00-15:00"],
    "areaServed": [`${cd}, TX`, `${ct}, TX`],
    "priceRange": "$$"
  };

  const headBlock = head({
    title,
    description,
    canonical,
    ogTitle: title,
    ogDesc: `Family-owned lawn care and landscaping in ${cd}, TX. Serving ${ct} since 2017. Yard Dog Landscapes.`,
    jsonLdBlocks: [localBusiness]
  });

  // Hero photo: pick a generic landscaping photo deterministically
  const heroBank = ['IMG_3525.jpg','IMG_3526.jpg','IMG_3680.jpg','IMG_3736.jpg','IMG_3738.jpg','IMG_3737.jpg','1.jpg','4.jpg','5.jpg','6.jpg'];
  const heroPhoto = heroBank[cityIndex % heroBank.length];

  // Service cards
  const serviceCards = SERVICES.map((s, i) => {
    const cardPhoto = s.photoBank[(cityIndex + i) % s.photoBank.length];
    return `          <a class="service-card-link" href="${s.slug}-${city.slug}-tx.html">
            <div class="service-card has-photo">
              <div class="sc-photo"><img src="brand_photos/${cardPhoto}" alt="${s.display} in ${cd}, TX" loading="lazy" width="800" height="600"></div>
              <div class="sc-body">
                <h3>${s.display.replace(/&/g, '&amp;')}</h3>
                <p>${s.display.replace(/&/g, '&amp;')} in ${cd}, TX — local crew, written estimates, same-week scheduling.</p>
                <span class="sc-link">View ${s.display.replace(/&/g, '&amp;')} in ${cd} →</span>
              </div>
            </div>
          </a>`;
  }).join('\n');

  const alsoChips = nb.map(n => `<a class="also-chip" href="${n.slug}-tx.html">${n.display}, TX</a>`).join('\n          ');

  const body = `<body>

${navbar('city-hub.html')}

  <main id="main">

    <section class="page-hero page-hero--photo" style="background-image: url('brand_photos/${heroPhoto}');">
      <div class="container">
        <p class="breadcrumb"><a href="index.html">Home</a><span class="sep">›</span>${cd}, TX</p>
        <h1>Lawn Care &amp; Landscaping Services in ${cd}, TX</h1>
        <p class="lead">Family-owned lawn care, landscaping, and outdoor services serving ${cd} and ${ct} since 2017.</p>
        <a class="btn btn-primary" href="contact.html">Get a Free Quote in ${cd}</a>
      </div>
    </section>

    <section class="section bg-section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Yard Dog Landscapes ${cd}</span>
          <h2>Local lawn &amp; landscape pros for ${cd}, TX.</h2>
        </div>
        <div class="intro-prose">
          <p>Yard Dog Landscapes serves ${cd}, TX and the surrounding ${ct} area with a full lineup of outdoor services — weekly mowing, custom landscaping, leaf removal, fertilization programs, hardscape installs, irrigation work, and seasonal Christmas lights. We're a family-owned company that's been working East Texas yards since 2017, and ${cd} is one of our regular service routes.</p>
          <p>Whether you're looking for routine lawn care in ${cd}, a full backyard transformation, or a quick one-time cleanup, you get the same crew, the same standards, and the same straight answers every time. We walk every property in person before we send an estimate, and we don't sub the work out.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Services</span>
          <h2>Our services in ${cd}, TX</h2>
        </div>
        <div class="services-grid">
${serviceCards}
        </div>
      </div>
    </section>

    <section class="section bg-section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Why Yard Dog</span>
          <h2>Why ${cd} homeowners choose us.</h2>
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
            <p>We walk every property and send a written, itemized estimate fast.</p>
          </div>
          <div class="trust-point">
            <div class="tp-icon" aria-hidden="true">🛡</div>
            <h4>Licensed, insured, family-owned</h4>
            <p>Same crew, same standards, every visit. Fully licensed and insured since 2017.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <aside class="area-callout">
          <p>Proudly serving ${cd}, TX and surrounding ${ct} communities.</p>
        </aside>
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
        <h2>Ready to get your ${cd} property dialed in?</h2>
        <p>Call (903) 844-6877 or request a free quote online — we walk every property before we send a price.</p>
        <div class="btns">
          <a class="btn btn-outline" href="tel:+19038446877">Call Now</a>
          <a class="btn btn-primary" href="contact.html">Get a Free Quote</a>
        </div>
      </div>
    </section>

  </main>

${footer()}

${pageScript()}

</body>
</html>`;

  return { filename, html: headBlock + '\n' + body };
}

// ---------------- SITEMAP ----------------

function buildSitemap(generated) {
  const baseUrl = 'https://yarddoglandscapes.com';
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];

  // priority 1.0
  urls.push({ loc: 'index.html', priority: '1.0' });
  // 0.9
  ['about.html', 'services.html', 'our-work.html', 'contact.html'].forEach(p => urls.push({ loc: p, priority: '0.9' }));
  // 0.8 main service pages
  ['landscaping.html','lawn-maintenance.html','leaf-removal.html','fertilization.html','christmas-lights.html'].forEach(p => urls.push({ loc: p, priority: '0.8' }));
  // 0.75 city hubs
  CITIES.forEach(c => urls.push({ loc: `${c.slug}-tx.html`, priority: '0.75' }));
  // 0.7 service-location
  for (const s of SERVICES) {
    for (const c of CITIES) {
      urls.push({ loc: `${s.slug}-${c.slug}-tx.html`, priority: '0.7' });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseUrl}/${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  return { xml, count: urls.length };
}

// ---------------- FOOTER PATCHING ----------------

const SERVICE_AREAS_FOOTER_COL = `        <div class="footer-col">
          <h4>Service Areas</h4>
          <ul>
            <li><a href="longview-tx.html">Longview, TX</a></li>
            <li><a href="white-oak-tx.html">White Oak, TX</a></li>
            <li><a href="hallsville-tx.html">Hallsville, TX</a></li>
            <li><a href="kilgore-tx.html">Kilgore, TX</a></li>
            <li><a href="marshall-tx.html">Marshall, TX</a></li>
            <li><a href="tyler-tx.html">Tyler, TX</a></li>
            <li><a href="gladewater-tx.html">Gladewater, TX</a></li>
            <li><a href="henderson-tx.html">Henderson, TX</a></li>
            <li><a href="carthage-tx.html">Carthage, TX</a></li>
            <li><a href="nacogdoches-tx.html">Nacogdoches, TX</a></li>
          </ul>
        </div>
`;

function patchSubPageFooter(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  // Idempotency: skip if already patched
  if (html.includes('<h4>Service Areas</h4>')) return false;
  // Insert Service Areas column BEFORE the Contact column. Anchor on the Contact <h4>.
  const anchor = `        <div class="footer-col">\n          <h4>Contact</h4>`;
  if (!html.includes(anchor)) {
    console.warn(`  WARN: anchor not found in ${path.basename(filePath)} — skipping`);
    return false;
  }
  const replaced = html.replace(anchor, SERVICE_AREAS_FOOTER_COL + anchor);
  fs.writeFileSync(filePath, replaced, 'utf8');
  return true;
}

const INDEX_SERVICE_AREAS_HTML = `
      <div class="md:col-span-3">
        <div class="text-xs uppercase tracking-[0.2em] text-ydg-cream/50">Service Areas</div>
        <ul class="mt-4 space-y-2 text-sm">
          <li><a class="hover:text-white transition-colors" href="longview-tx.html">Longview, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="white-oak-tx.html">White Oak, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="hallsville-tx.html">Hallsville, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="kilgore-tx.html">Kilgore, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="marshall-tx.html">Marshall, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="tyler-tx.html">Tyler, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="gladewater-tx.html">Gladewater, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="henderson-tx.html">Henderson, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="carthage-tx.html">Carthage, TX</a></li>
          <li><a class="hover:text-white transition-colors" href="nacogdoches-tx.html">Nacogdoches, TX</a></li>
        </ul>
      </div>
`;

function patchIndexFooter(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('Service Areas')) return false;

  // Detect line endings (file may be CRLF on Windows)
  const NL = html.includes('\r\n') ? '\r\n' : '\n';

  // Restructure: Brand col-5 → col-4 ; Services col-3 → col-2 ; insert Service Areas col-3 ; Contact col-4 → col-3
  let changed = false;
  const r1Old = `<div class="md:col-span-5">${NL}        <div class="flex items-center gap-3">`;
  const r1New = `<div class="md:col-span-4">${NL}        <div class="flex items-center gap-3">`;
  if (html.includes(r1Old)) { html = html.replace(r1Old, r1New); changed = true; }

  const r2Old = `<div class="md:col-span-3">${NL}        <div class="text-xs uppercase tracking-[0.2em] text-ydg-cream/50">Services</div>`;
  const r2New = `<div class="md:col-span-2">${NL}        <div class="text-xs uppercase tracking-[0.2em] text-ydg-cream/50">Services</div>`;
  if (html.includes(r2Old)) { html = html.replace(r2Old, r2New); changed = true; }

  const serviceAreasBlockLF = INDEX_SERVICE_AREAS_HTML.trimStart();
  const serviceAreasBlock = NL === '\r\n' ? serviceAreasBlockLF.replace(/\n/g, '\r\n') : serviceAreasBlockLF;

  const r3Old = `<div class="md:col-span-4">${NL}        <div class="text-xs uppercase tracking-[0.2em] text-ydg-cream/50">Contact</div>`;
  const r3New = serviceAreasBlock + `${NL}      <div class="md:col-span-3">${NL}        <div class="text-xs uppercase tracking-[0.2em] text-ydg-cream/50">Contact</div>`;
  if (html.includes(r3Old)) { html = html.replace(r3Old, r3New); changed = true; }

  if (!changed) {
    console.warn('  WARN: index.html footer anchors not found — no changes made.');
    return false;
  }
  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

// ---------------- ROBOTS.TXT ----------------

const ROBOTS_TXT = `User-agent: *
Allow: /
Sitemap: https://yarddoglandscapes.com/sitemap.xml
`;

// ---------------- MAIN ----------------

function main() {
  const generated = [];
  let totalBytes = 0;

  console.log('Generating service-location pages...');
  for (let ci = 0; ci < CITIES.length; ci++) {
    const city = CITIES[ci];
    for (const service of SERVICES) {
      const { filename, html } = serviceLocationPage(service, city, ci);
      const out = path.join(ROOT, filename);
      fs.writeFileSync(out, html, 'utf8');
      generated.push(filename);
      totalBytes += Buffer.byteLength(html, 'utf8');
    }
  }

  console.log('Generating city hub pages...');
  for (let ci = 0; ci < CITIES.length; ci++) {
    const city = CITIES[ci];
    const { filename, html } = cityHubPage(city, ci);
    const out = path.join(ROOT, filename);
    fs.writeFileSync(out, html, 'utf8');
    generated.push(filename);
    totalBytes += Buffer.byteLength(html, 'utf8');
  }

  console.log('Generating sitemap.xml and robots.txt...');
  const { xml, count } = buildSitemap(generated);
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), ROBOTS_TXT, 'utf8');

  console.log('Patching footers in existing sub-pages...');
  const subPages = ['about.html','services.html','our-work.html','contact.html','landscaping.html','lawn-maintenance.html','leaf-removal.html','fertilization.html','christmas-lights.html'];
  let patched = 0;
  for (const p of subPages) {
    const fp = path.join(ROOT, p);
    if (!fs.existsSync(fp)) { console.warn(`  WARN: ${p} not found`); continue; }
    const did = patchSubPageFooter(fp);
    if (did) { patched++; console.log(`  patched ${p}`); }
    else { console.log(`  skipped ${p} (already patched or anchor missing)`); }
  }

  console.log('Patching footer in index.html...');
  const indexFp = path.join(ROOT, 'index.html');
  const indexPatched = patchIndexFooter(indexFp);
  console.log(indexPatched ? '  patched index.html' : '  skipped index.html (already patched)');

  console.log('\n--- DONE ---');
  console.log(`Generated ${generated.length} HTML pages (${(totalBytes/1024).toFixed(1)} KB total)`);
  console.log(`Sitemap: ${count} URLs`);
  console.log(`Sub-pages patched: ${patched}/${subPages.length}`);
  console.log(`Index patched: ${indexPatched}`);
}

main();
