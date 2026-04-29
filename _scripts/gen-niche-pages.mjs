import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

const PAGES = [
  {
    slug: 'drainage',
    title: 'Drainage & Grading Longview TX | Yard Dog Landscapes',
    metaDesc: 'French drains, surface grading, and yard drainage in Longview TX. Family-owned drainage fixes for soggy spots and erosion. Yard Dog Landscapes.',
    ogDesc: 'Family-owned drainage and grading in Longview TX. French drains, regrades, and erosion fixes from Yard Dog Landscapes.',
    h1: 'Drainage & Grading in Longview, TX',
    breadcrumbLeaf: 'Drainage & Grading',
    lead: 'French drains, surface grading, and yard drainage fixes for soggy spots, eroding slopes, and water that ends up against the foundation.',
    heroPhoto: 'brand_photos/IMG_3736.jpg',
    overviewHeading: 'Drainage that actually moves water in East Texas.',
    intro1: 'Drainage Longview TX yards need is rarely glamorous, but it\'s the difference between a healthy lawn and a swampy mess every spring. Our crew assesses the slope, finds where the water is actually going, and builds a system that pulls it away from your house — French drains, surface regrades, swales, downspout extensions, and pop-up emitters.',
    intro2: 'East Texas drainage is its own beast. Clay-heavy soil holds water, rains come in heavy stretches, and a poorly graded yard can dump runoff straight at your foundation. Yard Dog Landscapes has been fixing yard drainage Longview Texas homeowners have lived with for years — without ripping out half the landscape to do it. Every drainage job starts with us walking the property during or right after rain whenever possible, so we can see where the water actually moves.',
    intro3: 'We serve Gregg, Harrison, Smith, and Upshur Counties — Longview, Kilgore, Hallsville, Marshall, Tyler, and the surrounding East Texas communities. Written, itemized estimate before any shovel hits the ground.',
    bullets: [
      'French drain installation',
      'Surface grading &amp; re-sloping',
      'Catch basins &amp; pop-up emitters',
      'Downspout extensions &amp; rerouting',
      'Swales &amp; dry creek beds',
      'Erosion control on slopes',
      'Site prep for new builds &amp; additions'
    ],
    whyBlocks: [
      { icon: '💧', title: 'We Find the Real Source', body: 'No guess-and-trench work. We map the slope, watch the water, and build the fix where it actually solves the problem.' },
      { icon: '📋', title: 'Transparent Pricing', body: 'Written, itemized estimates. You\'ll know exactly what we\'re installing and why before we start.' },
      { icon: '🛡', title: 'Licensed &amp; Insured', body: 'Family-owned since 2017. Same crew on every dig, same standards on every backfill.' }
    ],
    ctaHeading: 'Tired of a soggy yard? Let\'s fix it.',
    ctaSub: 'Walk the property with us — we\'ll point out where the water is actually going and what it takes to send it somewhere else.'
  },
  {
    slug: 'tree-shrub-care',
    title: 'Tree & Shrub Care Longview TX | Yard Dog Landscapes',
    metaDesc: 'Tree pruning, shrub trimming, removal, and feeding in Longview TX. Family-owned tree and shrub care across East Texas. Yard Dog Landscapes.',
    ogDesc: 'Family-owned tree and shrub care in Longview TX. Pruning, trimming, removal, and seasonal feeding from Yard Dog Landscapes.',
    h1: 'Tree & Shrub Care in Longview, TX',
    breadcrumbLeaf: 'Tree & Shrub Care',
    lead: 'Pruning, trimming, removal, and seasonal feeding to keep your trees and shrubs healthy through East Texas summers and winters.',
    heroPhoto: 'brand_photos/4.jpg',
    overviewHeading: 'Healthy trees, sharp shrubs, year-round.',
    intro1: 'Tree and shrub care Longview TX yards count on starts with knowing what you\'re looking at. Live oaks, post oaks, crepe myrtles, hollies, ligustrums, boxwoods — every one of them needs different timing, different cuts, and different aftercare. Our crew prunes for the plant\'s health first, then for the look you want.',
    intro2: 'Tree care East Texas only works when the contractor respects the species and the season. We\'re not the company that tops crepe myrtles into stumps. We\'re the company that thins them, shapes them, and lets them bloom the way they\'re supposed to. Yard Dog Landscapes has been pruning, trimming, and feeding trees and shrubs across Longview Texas since 2017 — and we haul off every cut limb when we leave.',
    intro3: 'We serve homeowners across Gregg, Harrison, Smith, and Upshur Counties — Longview, Kilgore, Hallsville, Marshall, and Tyler. One-time projects or seasonal maintenance — your call.',
    bullets: [
      'Tree pruning &amp; structural shaping',
      'Hedge &amp; shrub trimming',
      'Tree &amp; stump removal',
      'Seasonal deep-root feeding',
      'Mulch refresh around tree bases',
      'Storm cleanup &amp; limb removal',
      'Crepe myrtle pruning — the right way'
    ],
    whyBlocks: [
      { icon: '🌳', title: 'Cuts That Heal', body: 'Proper cuts at the branch collar, right angle, right time of year. Your trees come back stronger, not stressed.' },
      { icon: '📋', title: 'Full Cleanup, Every Time', body: 'Limbs, trimmings, sawdust — all hauled off when we leave. Your yard looks better than when we showed up.' },
      { icon: '🛡', title: 'Licensed &amp; Insured', body: 'Family-owned since 2017. Trained crew, the right gear, and full insurance on every climb.'}
    ],
    ctaHeading: 'Trees and shrubs need a tune-up?',
    ctaSub: 'We\'ll walk the yard, flag what needs work, and send a written estimate — usually same day.'
  },
  {
    slug: 'flower-bed-installation',
    title: 'Flower Bed Installation Longview TX | Yard Dog Landscapes',
    metaDesc: 'Flower bed installation in Longview TX. Custom bed design, plant selection, soil prep, and edging from Yard Dog Landscapes. Family-owned since 2017.',
    ogDesc: 'Custom flower bed installation in Longview TX. Soil prep, plant selection, edging, and mulch from Yard Dog Landscapes.',
    h1: 'Flower Bed Installation in Longview, TX',
    breadcrumbLeaf: 'Flower Bed Installation',
    lead: 'Custom flower beds designed and installed by a local crew — color combinations, soil prep, plants, and edging all dialed in for East Texas.',
    heroPhoto: 'brand_photos/IMG_3526.jpg',
    overviewHeading: 'Beds that bloom — and stay alive past June.',
    intro1: 'Flower bed installation Longview TX homeowners actually keep is built on what\'s under the mulch. We till in compost, amend the clay, set the grade so water moves, and then choose plants that thrive in our heat. Annuals for color rotation, perennials for backbone, native pollinators where they fit — laid out so the bed reads from the curb and from the porch.',
    intro2: 'Flower bed installation East Texas is a craft, not a checklist. The wrong plant in the wrong spot will limp along for one season and die in the next. Yard Dog Landscapes has been designing and installing flower beds Longview Texas yards across Gregg County since 2017 — beds that earn the bone, summer after summer.',
    intro3: 'We serve Longview, Kilgore, Hallsville, Marshall, Tyler, and the surrounding East Texas communities. Each install starts with an in-person walk and a written estimate.',
    bullets: [
      'Custom bed layout &amp; design',
      'Soil amendment &amp; bed prep',
      'Annual &amp; perennial planting',
      'Native and pollinator selections',
      'Stone, steel, or natural edging',
      'Mulch finish to lock in moisture',
      'Drip line layout (optional)'
    ],
    whyBlocks: [
      { icon: '🌷', title: 'Plants That Belong Here', body: 'We pick plants that handle East Texas heat, clay, and humidity — not whatever\'s on the big-box rack this week.' },
      { icon: '📋', title: 'Transparent Pricing', body: 'Written, itemized estimates with plant counts, sizes, and edging spec — no surprise add-ons.' },
      { icon: '🛡', title: 'Licensed &amp; Insured', body: 'Family-owned since 2017. Same crew, same standards on every install.' }
    ],
    ctaHeading: 'Ready for a bed that actually blooms?',
    ctaSub: 'We\'ll walk the property, sketch a plan, and send a written quote — typically within 24 hours.'
  },
  {
    slug: 'hedge-trimming',
    title: 'Hedge Trimming Longview TX | Yard Dog Landscapes',
    metaDesc: 'Hedge trimming in Longview TX. Hand-shaped boxwoods, hollies, ligustrums, and formal hedges by Yard Dog Landscapes. Family-owned, fully insured.',
    ogDesc: 'Family-owned hedge trimming in Longview TX. Boxwood, holly, ligustrum, and formal hedges shaped right by Yard Dog Landscapes.',
    h1: 'Hedge Trimming in Longview, TX',
    breadcrumbLeaf: 'Hedge Trimming',
    lead: 'Clean lines on hollies, boxwoods, ligustrums, and every other East Texas hedge — trimmed by hand, hauled off, and left looking sharp.',
    heroPhoto: 'brand_photos/IMG_3680.jpg',
    overviewHeading: 'Sharper hedges, hauled-off trimmings, no shortcuts.',
    intro1: 'Hedge trimming Longview TX yards need isn\'t just running a power trimmer over the top. We shape from the bottom up so light hits the lower branches, we maintain the natural form of the species, and we cut at the right time of year so the hedge actually fills back in. Boxwood, holly, ligustrum, photinia, Japanese yew — different plants, different schedules.',
    intro2: 'Hedge trimming East Texas summers will punish overgrown shrubs and a bad cut will brown out a whole row. Yard Dog Landscapes trims hedges across Longview Texas neighborhoods every week — same crew, same standards, full cleanup before we leave. We\'ll set you up on a recurring schedule or come once and get the place back in shape.',
    intro3: 'We serve Gregg, Harrison, Smith, and Upshur Counties — Longview, Kilgore, Hallsville, Marshall, Tyler, and surrounding communities.',
    bullets: [
      'Routine hedge &amp; shrub shaping',
      'Foundation hedge maintenance',
      'Topiary &amp; formal hedge work',
      'Hard rejuvenation cuts on overgrown shrubs',
      'Boxwood, holly, ligustrum, photinia &amp; more',
      'Full debris cleanup &amp; haul-off',
      'Recurring trim schedules available'
    ],
    whyBlocks: [
      { icon: '✂️', title: 'Hand-Shaped, Not Hacked', body: 'We shape with the plant\'s natural form in mind — clean tapers, even tops, and light to the lower limbs.' },
      { icon: '🧹', title: 'Spotless Cleanup', body: 'Tarps down, blowers out, every clipping bagged or hauled. The yard looks better than when we got there.' },
      { icon: '🛡', title: 'Licensed &amp; Insured', body: 'Family-owned since 2017. Same crew, same standards, every visit.' }
    ],
    ctaHeading: 'Hedges getting out of hand?',
    ctaSub: 'We\'ll walk the property, quote the trim, and have it back in shape on the next visit.'
  },
  {
    slug: 'sod-installation',
    title: 'Sod Installation Longview TX | Yard Dog Landscapes',
    metaDesc: 'Sod installation in Longview TX. St. Augustine, Bermuda, and Zoysia laid by Yard Dog Landscapes. Soil prep, full coverage, family-owned.',
    ogDesc: 'Family-owned sod installation in Longview TX. St. Augustine, Bermuda, and Zoysia laid right by Yard Dog Landscapes.',
    h1: 'Sod Installation in Longview, TX',
    breadcrumbLeaf: 'Sod Installation',
    lead: 'Fresh St. Augustine, Bermuda, or Zoysia laid by a crew that preps the soil first — so the lawn actually takes.',
    heroPhoto: 'brand_photos/IMG_3525.jpg',
    overviewHeading: 'Sod that takes — because the soil was ready.',
    intro1: 'Sod installation Longview TX lawns reward you for what happens before the rolls show up. We strip dead turf, kill weeds, regrade where we have to, till in topsoil, and only then start laying. Tight seams, full coverage, starter fertilizer in the soil, and a watering plan you can actually follow.',
    intro2: 'Sod installation East Texas is timing-sensitive. Lay it in the wrong heat without a watering plan and a $4,000 install can brown out in two weeks. Yard Dog Landscapes installs sod Longview Texas yards across Gregg County — St. Augustine for shade tolerance, Bermuda for full sun and traffic, Zoysia for the in-between. We\'ll tell you which one fits your yard before we tell you the price.',
    intro3: 'We serve Longview, Kilgore, Hallsville, Marshall, Tyler, and the rest of East Texas. Patch jobs, partial yards, or full property installs — all with the same prep and the same crew.',
    bullets: [
      'Site prep, leveling &amp; soil amendment',
      'Removal of dead turf &amp; weeds',
      'St. Augustine, Bermuda &amp; Zoysia available',
      'Tight seam, full-coverage installation',
      'Starter fertilizer at install',
      'Watering schedule &amp; care plan',
      'Repair patches &amp; full-yard installs'
    ],
    whyBlocks: [
      { icon: '🌱', title: 'Prep Comes First', body: 'Old turf out, soil amended, grade set. The sod takes because the dirt under it was ready.' },
      { icon: '📋', title: 'Right Sod for the Yard', body: 'Shade vs. sun, traffic, soil — we recommend the variety before we quote the job. No upsells.' },
      { icon: '🛡', title: 'Licensed &amp; Insured', body: 'Family-owned since 2017. Fully insured, full pack on every install.' }
    ],
    ctaHeading: 'Ready for a real lawn?',
    ctaSub: 'We\'ll walk the yard, recommend the right sod variety, and send a written quote.'
  },
  {
    slug: 'mulch-installation',
    title: 'Mulch Installation Longview TX | Yard Dog Landscapes',
    metaDesc: 'Mulch installation in Longview TX. Hardwood, cypress, and dyed mulch from Yard Dog Landscapes. Bed cleanup, edging, full installs across East Texas.',
    ogDesc: 'Family-owned mulch installation in Longview TX. Bed cleanup, fresh edging, and even-spread mulch from Yard Dog Landscapes.',
    h1: 'Mulch Installation in Longview, TX',
    breadcrumbLeaf: 'Mulch Installation',
    lead: 'Clean edges, deep beds, and the right mulch for the right plants — installed by a local crew, hauled in by the yard.',
    heroPhoto: 'brand_photos/IMG_3738.jpg',
    overviewHeading: 'Beds that look fresh and stay weed-free.',
    intro1: 'Mulch installation Longview TX yards depend on more than dumping bags. We re-cut the bed edges, pull weeds, top off thin spots with fresh soil where needed, and then lay 2–3 inches of mulch even across the whole bed. Hardwood for natural color, cypress for slow breakdown, dyed black or brown if you want the contrast — your call.',
    intro2: 'Mulch installation East Texas yards need every spring is also weed control, moisture retention, and root insulation in one job. Yard Dog Landscapes mulches beds across Longview Texas every season — bulk delivery for big projects, bagged for tight access, always installed even and crisp at the edge. Pine straw is on the menu too if that\'s your look.',
    intro3: 'We serve Gregg, Harrison, Smith, and Upshur Counties — Longview, Kilgore, Hallsville, Marshall, Tyler, and surrounding East Texas communities.',
    bullets: [
      'Bed edging &amp; re-cut edges',
      'Weed pull &amp; light bed cleanup',
      'Hardwood, cypress, dyed black or natural',
      '2–3 inch depth, even spread',
      'Around trees, shrubs, and full beds',
      'Pine straw available on request',
      'Annual or seasonal refresh schedules'
    ],
    whyBlocks: [
      { icon: '🪵', title: 'Sharp Edges, Even Depth', body: 'Beds cut clean, mulch raked even, no thin spots — the kind of finish you can see from the street.' },
      { icon: '📋', title: 'By the Yard, Not by the Bag', body: 'We deliver bulk for bigger jobs so you pay for mulch, not packaging. Bagged is available for tight-access yards.' },
      { icon: '🛡', title: 'Licensed &amp; Insured', body: 'Family-owned since 2017. Same crew, same standards on every install.' }
    ],
    ctaHeading: 'Beds need a fresh coat?',
    ctaSub: 'Tell us how many yards or let us measure it. Written quote, scheduled in days, not weeks.'
  },
  {
    slug: 'tree-planting',
    title: 'Tree Planting Longview TX | Yard Dog Landscapes',
    metaDesc: 'Tree planting in Longview TX. Native species, proper hole prep, staking, and aftercare from Yard Dog Landscapes. Family-owned across East Texas.',
    ogDesc: 'Family-owned tree planting in Longview TX. Native species, proper installation, and aftercare from Yard Dog Landscapes.',
    h1: 'Tree Planting in Longview, TX',
    breadcrumbLeaf: 'Tree Planting',
    lead: 'We pick trees that thrive in East Texas — and plant them the right way: dug deep, root flare set, staked clean, and ready to take.',
    heroPhoto: 'brand_photos/1.jpg',
    overviewHeading: 'The right tree, in the right spot, planted to last.',
    intro1: 'Tree planting Longview TX homeowners get wrong most often by planting the wrong species, planting too deep, or skipping the watering basin. Our crew picks trees that fit the soil, the sun, and the eventual mature size of the spot — then plants them so the root flare sits at grade, the basin holds water, and the mulch ring is wide enough to actually do its job.',
    intro2: 'Tree planting East Texas takes patience and the right species. Live oaks, post oaks, southern magnolias, crepe myrtles, hollies, redbuds — all viable, but each one wants a different spot. Yard Dog Landscapes has been planting trees Longview Texas yards across Gregg County since 2017, including replacements for storm-damaged or diseased trees. We\'ll source healthy stock from regional growers, deliver, plant, mulch, and stake when needed.',
    intro3: 'We serve Longview, Kilgore, Hallsville, Marshall, Tyler, and surrounding East Texas communities. One tree or a full grove — same care either way.',
    bullets: [
      'Tree selection for East Texas conditions',
      'Site assessment &amp; placement planning',
      'Hand-dug root ball installation',
      'Staking, watering basin &amp; mulch ring',
      'Native and shade tree options',
      'Crepe myrtles, oaks, magnolias, hollies, more',
      'Aftercare watering guidance'
    ],
    whyBlocks: [
      { icon: '🌲', title: 'Right Tree, Right Spot', body: 'We match species to your soil, your sun, and the mature size of the spot — so the tree thrives instead of just surviving.' },
      { icon: '📋', title: 'Sourced from Regional Growers', body: 'Healthy stock from East Texas nurseries — not whatever\'s left at the box store. Better roots, better odds.' },
      { icon: '🛡', title: 'Licensed &amp; Insured', body: 'Family-owned since 2017. Trained crew, fully insured, full pack on every plant.' }
    ],
    ctaHeading: 'Need a tree planted right?',
    ctaSub: 'We\'ll walk the property, recommend a species, and send a written quote — including aftercare.'
  }
];

const TEMPLATE = (p) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title}</title>
  <meta name="description" content="${p.metaDesc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://yarddoglandscapes.com/${p.slug}">
  <meta property="og:title" content="${p.title}">
  <meta property="og:description" content="${p.ogDesc}">
  <meta property="og:url" content="https://yarddoglandscapes.com/${p.slug}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">
  {
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
    "url": "https://yarddoglandscapes.com",
    "openingHours": ["Mo-Fr 07:00-17:00", "Sa 09:00-15:00"],
    "areaServed": ["Longview TX", "Gregg County TX", "Harrison County TX", "Smith County TX", "Upshur County TX", "Kilgore TX", "Hallsville TX", "Marshall TX", "Tyler TX"],
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "200"
    }
  }
  </script>
</head>
<body>

  <header class="navbar">
    <div class="container">
      <div class="nav-wrap" id="navWrap">
        <div class="nav-inner">
          <a class="nav-brand" href="/" aria-label="Yard Dog Landscapes home">
            <img src="brand_assets/Yard Dog Logo.png" alt="Yard Dog Landscapes logo">
            <span class="nav-brand-text">YARD DOG <span class="brand-accent">LANDSCAPES</span></span>
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
              <div class="dropdown" id="servicesDropdown">
                <a href="landscaping">Landscaping</a>
                <a href="lawn-maintenance">Lawn Maintenance</a>
                <a href="leaf-removal">Leaf Removal</a>
                <a href="fertilization">Fertilization</a>
                <a href="christmas-lights">Christmas Lights</a>
              </div>
            </li>
            <li><a class="nav-link" href="contact">Contact Us</a></li>
            <li><a class="nav-mobile-cta" href="contact">Get a Free Quote</a></li>
          </ul>
          <a class="btn btn-primary nav-cta" href="contact">Get a Free Quote</a>
        </div>
      </div>
    </div>
  </header>

  <main id="main">

    <section class="page-hero page-hero--photo" style="background-image: url('${p.heroPhoto}');">
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a><span class="sep">›</span><a href="services">Services</a><span class="sep">›</span>${p.breadcrumbLeaf}</p>
        <h1>${p.h1}</h1>
        <p class="lead">${p.lead}</p>
        <span class="cta-mark cta-mark--cream"><svg class="cta-mark-svg" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M 950 90 C 1250 300, 1050 480, 600 520 C 250 520, 150 480, 150 300 C 150 120, 350 80, 600 80 C 850 80, 950 180, 950 180" /></svg><a class="btn btn-primary" href="contact">Get a Free Quote</a></span>
      </div>
    </section>

    <section class="section bg-section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Overview</span>
          <h2>${p.overviewHeading}</h2>
        </div>
        <div class="intro-prose">
          <p>${p.intro1}</p>
          <p>${p.intro2}</p>
          <p>${p.intro3}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">What's Included</span>
          <h2>Everything we cover.</h2>
        </div>
        <div class="included-grid">
${p.bullets.map(b => `          <div class="included-card"><span class="ic-check" aria-hidden="true">✓</span><span class="ic-text">${b}</span></div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="section-eyebrow">Why Yard Dog</span>
          <h2>Built for East Texas yards.</h2>
        </div>
        <div class="why-grid">
${p.whyBlocks.map(w => `          <div class="why-card">
            <div class="why-icon" aria-hidden="true">${w.icon}</div>
            <h3>${w.title}</h3>
            <p>${w.body}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="area-callout">
          <p>Proudly serving Longview, Kilgore, Hallsville, Marshall, Tyler, and surrounding East Texas communities.</p>
        </div>
      </div>
    </section>

    <section class="section bg-dark">
      <div class="container cta-banner">
        <h2>${p.ctaHeading}</h2>
        <p>${p.ctaSub}</p>
        <div class="btns">
          <span class="cta-mark cta-mark--cream"><svg class="cta-mark-svg" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M 950 90 C 1250 300, 1050 480, 600 520 C 250 520, 150 480, 150 300 C 150 120, 350 80, 600 80 C 850 80, 950 180, 950 180" /></svg><a class="btn btn-primary" href="contact">Request a Free Quote</a></span>
          <span class="cta-mark cta-mark--cream"><svg class="cta-mark-svg" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M 950 90 C 1250 300, 1050 480, 600 520 C 250 520, 150 480, 150 300 C 150 120, 350 80, 600 80 C 850 80, 950 180, 950 180" /></svg><a class="btn btn-outline" href="tel:+19038446877">Call (903) 844-6877</a></span>
        </div>
      </div>
    </section>

  </main>

  <footer class="footer">
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
            <li><a href="lawn-maintenance">Lawn Care</a></li>
            <li><a href="landscaping">Landscape Design</a></li>
            <li><a href="hardscaping">Hardscaping</a></li>
            <li><a href="tree-shrub-care">Tree &amp; Shrub Care</a></li>
            <li><a href="leaf-removal">Leaf Removal</a></li>
            <li><a href="fertilization">Fertilization</a></li>
            <li><a href="christmas-lights">Christmas Lights</a></li>
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
            <div class="ftc-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Mon–Fri 7AM–5PM, Sat 9AM–3PM</span></div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">© 2026 Yard Dog Landscapes. All Rights Reserved.</div>
    </div>
  </footer>

  <script>
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
  </script>

</body>
</html>
`;

for (const p of PAGES) {
  const out = path.join(ROOT, `${p.slug}.html`);
  fs.writeFileSync(out, TEMPLATE(p), 'utf8');
  console.log(`Wrote ${p.slug}.html`);
}
