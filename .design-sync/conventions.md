# Yard Dog Landscapes — brand design system

Yard Dog Landscapes is a landscaping and hardscaping company in Longview, East Texas:
mowing, drainage, retaining walls, sod, mulch, flower beds, Christmas lights. The voice
is working-crew direct — heavy condensed display type, a hot red against deep navy, warm
earth neutrals underneath. Not corporate, not cute.

**This is a CSS design system, not a React component library.** The generated notes below
describe the standard package shape; for this DS, read them with these corrections:

- `window.YardDog` is **empty**. There are zero JS components and no `_ds_bundle.js` API
  to call. Loading the script is harmless but pointless.
- Everything ships as **CSS custom properties plus real class names** in `styles.css`
  (which `@import`s `fonts/fonts.css` and `_ds_bundle.css`). Link that one file and write
  plain semantic HTML against the classes below.
- `components/` and `tokens/` are empty directories for the same reason.

---

## The one naming trap — read this first

The company rebranded from green to red and **never renamed its CSS variables**. In this
system:

```
--color-green-primary   is  #E63946   RED
--color-green-light     is  #F26D77   LIGHT RED
.cta-mark--green        strokes       #F26D77 — also red
```

There is **no green anywhere in the brand.** The site's own source says so — the shared
glow pattern is commented `/* hue: Yard Dog Red */`.

Use the honest `--yd-*` names when you author new work. They are aliases onto the same
values, so the two can never disagree:

```css
color: var(--yd-red);        /* not --color-green-primary */
```

---

## Palette

**Red — the primary.** Used for CTAs, links, tags, emphasis, and every accent glow.

| Token | Value | Role |
|---|---|---|
| `--yd-red` | `#E63946` | the brand red; primary buttons, links, accents |
| `--yd-red-light` | `#F26D77` | hover state, gradient top, focus ring |
| `--yd-red-dark` | `#B22934` | gradient terminus, tag text, `<em>` emphasis in prose |
| `--yd-red-deep` | `#7A1D26` | deepest gradient terminus only |
| `--yd-red-accent` | `#C8362C` | homepage-only secondary red |

**Navy — the dark ground.** Heroes, footers, and dark bands sit on these.

| Token | Value | Role |
|---|---|---|
| `--yd-navy` | `#0F1B2A` | the dark ground; hero and footer |
| `--yd-night` | `#070D17` | deepest ground, homepage hero gradient base |

**Warm neutrals — the earth range.** What keeps the red from reading as an alarm.

| Token | Value | Role |
|---|---|---|
| `--yd-bone` | `#f7f4ef` | alternating section ground |
| `--yd-cream` | `#F4EFE2` | homepage page ground |
| `--yd-sage` | `#E5DCB3` | homepage focus outline, soft accent |
| `--yd-khaki` | `#D9C79A` | homepage warm accent |
| `--yd-tan` | `#c8b89a` | the signature tan; dividers, kickers, muted marks |
| `--yd-tan-dark` | `#8a7d65` | tan gradient terminus |
| `--yd-mocha` | `#5A3A22` | deep earth accent |
| `--yd-earth-dark` | `#4a3f2e` | deepest earth terminus |
| `--yd-border` | `#e0d9cf` | the standard hairline |

**Text.** `--yd-ink` `#1a1a1a` for headings and body on light; `--yd-ink-mid` `#555555`
for paragraphs (`p` gets this by default); `--yd-white` `#ffffff` on dark grounds.

**UI state**, not brand: `--yd-state-error` `#b22222` (required-field marks),
`--yd-state-warn` `#c8a24a`.

## Typography

Two families, both self-hosted in `fonts/` — **do not add a third.**

- **Anton** (`--yd-font-display`) — all display type. `h1`, `h2`, `h3` already use it, at
  weight 400, **uppercase**, line-height `1.05`. Anton has one weight; asking for 700
  gets you a synthetic smear. Never set `font-weight` on a heading.
- **Inter** (`--yd-font-sans`) — everything else. Variable, 100–900, so any weight is real.
  Body is `16px`/`1.6`; paragraphs run `1.7`.

Scale, already applied to bare tags — write `<h1>`, don't reach for a class:

```
--yd-h1-size   clamp(2.5rem, 6vw, 4.25rem)
--yd-h2-size   clamp(2rem, 4vw, 3rem)
--yd-h3-size   1.35rem
```

## Layout and spacing

`.container` is `max-width: 1200px` with `24px` inline padding. `.section` is
`padding-block: 48px`. `.section-head` centers a heading block with `48px` below it.

Spacing scale `--space-1` … `--space-10` = 4, 8, 12, 16, 24, 32, 48, 64, 80, 96 px.
Radii `--radius-sm|md|lg|xl` = 8, 12, 18, 24 px, plus `--radius-pill` (`999px`), which is
what every button and chip uses. Shadows `--shadow-sm|md|lg|xl` are navy-and-red tinted,
never neutral grey. Motion uses `--ease-spring` for transforms and `--ease-smooth` for
color and shadow.

## The class vocabulary

All of these ship in the stylesheet and are ready to use:

- **Buttons** — `.btn` (pill, `14px 28px`, weight 600) plus one of `.btn-primary` (red
  fill, white text), `.btn-outline` (for dark grounds, white text), `.btn-outline-dark`
  (for light grounds).
- **Nav** — `.navbar`, `.nav-wrap`, `.nav-item`, `.nav-link`, `.nav-cta`,
  `.nav-cta--ghost`, `.nav-brand`, `.dropdown`, `.hamburger`.
- **Hero** — `.hero`, `.hero-ctas` for the homepage; `.page-hero` for interior pages;
  `.breadcrumb` above it.
- **Cards** — `.service-card`, `.service-card-link`, `.project-card`, `.figure-card`,
  `.photo-figure`, `.side-card`, `.related-card`, `.why-card`, `.included-card`,
  `.design-feature-card`.
- **Glow cards** — `.glow-card` and friends carry a cursor-tracking red border glow driven
  by `--glow-*` custom properties (`--glow-base: 354`, a tight `--glow-spread: 8` so it
  stays in the red family). It needs the site's JS to set `--glow-x`/`--glow-y`; without
  that it degrades to a static card, which is fine.
- **Content** — `.testimonial`, `.faq-item`, `.process-step`, `.trust-point`,
  `.blog-post-body`, `.intro-prose`, `.section-head`.
- **Pricing** — `.pricing-grid`, `.pricing-card`, `.pricing-card--featured`,
  `.pricing-card-cta`, `.pricing-card-list`.
- **CTA** — `.cta-banner`; `.cta-mark` draws an animated underline stroke, tinted by
  `.cta-mark--cream` / `.cta-mark--green` (red) / `.cta-mark--ink`.
- **Before/after** — `.ba-stage`, `.before-after-head`, `.work-photo` for the job-showcase
  sliders.
- **Forms** — `.form-row`, `.opt`, `.apply-status` (`--no`, `--err`).
- **Footer** — `.footer-brand`, `.footer-col`, `.social-row`.

## House rules

- Red is an **accent on navy or on a warm neutral**, never a large flat field. The site
  uses gradients (`--yd-red-light` → `--yd-red` → `--yd-red-dark`) where it wants mass.
- Headings are uppercase Anton. Body is sentence case Inter. Don't uppercase paragraphs.
- Alternate light bands: white and `--yd-bone`. Dark bands are `--yd-navy`.
- Photography carries the brand as much as the palette — real crew, real East Texas yards,
  before/after pairs. Prefer a photo over an illustration or an icon set.
- Corners are soft and buttons are fully pill-shaped; nothing in this brand has a sharp
  90-degree corner except full-bleed section edges.
