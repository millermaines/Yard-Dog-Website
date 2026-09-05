# Yard Dog Landscapes — 2026 Redesign Handoff

Repo: `millermaines/Yard-Dog-Website` (static HTML, Vercel). Source of truth for the look: the approved
preview `Yard Dog Site Revamp.dc.html` (direction "3d": full-bleed photo heroes, oversized Anton headlines,
numbered photo tiles, white/bone content bands, navy footer, Platy request forms).

## What's in this folder
- `pages/` — 8 fully rebuilt pages, drop-in replacements: `index, about, our-work, services, hardscaping, pricing, blog, contact`.
  Each has a `@@HEAD_SEO_START/END@@` block the script swaps for the live page's existing title/meta/canonical/og/JSON-LD.
- `redesign.css` — loads after `styles.css`; restyles the existing class vocabulary (`.page-hero`, `.service-card`,
  `.included-card`, `.faq-item`, `.cta-banner`, `.footer`, …) so the other ~190 pages adopt the new look with no markup rewrite.
- `apply-redesign.mjs` — idempotent Node script that installs everything (see header comment). Supports `--dry`.
- `pages/styles.css` is PREVIEW-ONLY (a copy of the repo stylesheet so pages render outside the repo); the script never copies it. Pages reference photos by absolute URL for preview; the script rewrites them to repo-relative paths on install.
- All colors in the 8 pages are hard-coded hex (no dependency on CSS variables the repo lacks).
- `_helmet_css_extract.css` — reference only: the exact CSS used in the approved preview.

## Design rules (for any page you touch by hand)
- Type: Anton for headlines (uppercase, tight leading .86–.92, letter-spacing −.02/−.03em), Inter for body. Interior H1 = `clamp(56px,8vw,112px)`, ends with a red period.
- Color: red `#E63946` (accents, numbers, period), navy `#0F1B2A` / night `#070D17` (heroes, footer), bone `#f7f4ef`, white bands. No gradients other than photo shades.
- Heroes: full-bleed photo, dark shade `linear-gradient(180deg, rgba(7,13,23,.7), rgba(7,13,23,.25) 45%, #070D17)`, content bottom-aligned, breadcrumb above H1.
- Cards: 24px radius, hairline `#e0d9cf` border, no emoji/icon swatches, numbers `01 02 03` as red pills.
- Photos: use `brand_photos/*` only. Service pages should get a real photo hero (script picks the page's first `brand_photos` image; override by setting `style="background-image:url(...)"` on `.page-hero`).
- Forms: Platy embed, form id `k10wty88jnyk6dfl2jsmve`. All "Get a Free Quote" buttons go to `/contact` (or `#quote` on the homepage).
- Nav: pill navbar, links visible ≥860px, hamburger below. Ghost "Join the Pack" → `/careers`.

## Mobile
`redesign.css` carries the whole responsive layer (≤1024 / ≤900 / ≤600 / ≤400 breakpoints): inline grids collapse, heroes lose their fixed min-height, buttons go full-width, 4-col stat strips stack, nav collapses to the hamburger with the mobile CTAs, inputs stay at 16px so iOS won't zoom. Sub-pages inherit all of it because they load the same file. Run the scripted mobile QA in `CLAUDE_CODE_PROMPT.txt` step 5 across every page before merging.

## What changed in v2 (color fix)
- Root cause of the white-on-white bug: the repo's `styles.css` has no `--yd-*` CSS variables, and the preview pages were loading the live site's CSS. Every color in the 8 pages is now a literal hex; `redesign.css` no longer restyles `.btn` or global `a` (that was turning primary-button text dark).
- Sub-page rollout now matches the repo's real markup (`<section class="section bg-dark"><div class="container cta-banner">` and `<footer class="footer">`), swaps the chrome, and keeps each page's own CTA headline.
- Verified in-browser: all 8 pages at 1280px and 390px, plus `landscaping.html`, `hardscaping-tyler-tx.html`, `careers.html` run through the script — no contrast failures, no horizontal overflow, hamburger + Platy present.

## Verify after running
1. `npx serve .` (or open `index.html`) — check home, a service page (e.g. `landscaping.html`), a city page (e.g. `hardscaping-tyler-tx.html`), a blog post, `contact.html`.
2. Forms load the Platy iframe on `/` and `/contact` and submit into Platy.
3. Nav dropdown works; hamburger works below 860px.
4. `git diff --stat` — only `.html` files plus new `redesign.css` should change. No page should lose its `<title>` or JSON-LD (`git diff -- '*.html' | grep -c 'ld+json'` should be ~0 removals).
