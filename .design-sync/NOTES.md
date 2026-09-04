# Yard Dog Landscapes — design-sync notes

First sync: 2026-09-04. Shape: **tokens-only** (no JS components).
Build and validate both exit 0. **Not uploaded** — the bundle was built and validated
only; creating the Claude Design project and pushing is a main-session job.

---

## What this repo is

A 196-page static marketing site (plain HTML + one stylesheet + a small puppeteer
toolchain). No framework, no `src/`, no `dist/`, no build step, no Tailwind config file,
no React. The "design system" is CSS custom properties plus ~233 class selectors in
`styles.css`. That is a legitimate tokens-only DS, not a failed component sync.

## The brand source — read this before trusting any prior recon

The task that commissioned this sync was handed a palette naming
`--yd-red: #E63946`, `--yd-red-d: #C22633`, `--yd-red-l: #F26D77`.

**`--yd-red*` does not exist in the live site.** Those tokens are defined only in
`redesign-roadmap.html`, a preview-only proposal document (commit `0fad134`, "Add
pre-build redesign roadmap (preview only)"). Its Phase 1 build was **reverted** in
`e4421e1` ("Revert homepage to pre-redesign version"). `#C22633` appears **nowhere else
in the repository** — it never shipped.

The dark red that actually ships is **`#B22934`**: 10 uses in `styles.css` and declared
as `ydg.green-d` in the homepage's Tailwind config. Verified by grep in both files.

If a future run is handed a palette, re-derive it from the two sources below rather than
accepting it. `redesign-roadmap.html` is a decoy — it looks authoritative and is not.

## There are TWO live style sources, not one

1. **`styles.css`** — linked by **195** of the 196 HTML pages. Carries the `:root` token
   block (colors, `--space-1..10`, `--radius-*`, `--shadow-*`, `--ease-*`) and every
   component class. This is `cfg.cssEntry` and the bulk of the DS.
2. **`index.html`** — the homepage does **not** link `styles.css`. It is a standalone
   page using the Tailwind **play CDN** plus an ~11.8 KB inline `<style>` block, and its
   `tailwind.config` declares the `ydg` palette. Colors that live only there
   (`night #070D17`, `cream #F4EFE2`, `sage #E5DCB3`, `khaki #D9C79A`, `mocha #5A3A22`,
   `red #C8362C`) are copied into `brand-tokens.css` and marked `[homepage]`.

The homepage's *utility classes* were deliberately **not** shipped: they only work with
Tailwind loaded, so a design authored against `bg-ydg-cream` would render unstyled. Only
its palette was lifted. Its bespoke classes (`.btn-primary`, `.hero-bg`, `.grain`,
`.topo`) are near-duplicates of the `styles.css` equivalents, which ship.

## The green/red naming legacy

`--color-green-primary` holds `#E63946`, which is **red**. The company rebranded from
green to red and never renamed the variables; `.cta-mark--green` strokes `#F26D77`, also
red. There is no green in the brand — `styles.css` itself comments the shared glow
pattern `/* hue: Yard Dog Red */`.

`brand-tokens.css` adds honest `--yd-*` names. Colour aliases are declared as
**`var()` references** onto the legacy names, not copied hexes, so they cannot drift.

---

## How the build is wired (and why)

- **`cfg.entry` → `.design-sync/ds-entry.mjs`.** Required. Without an entry the converter
  hits `[NO_DIST] … no src/ to synthesize from` and `exit 1` *before* it ever reaches the
  tokens-only branch. The entry walks up to the repo's `package.json`, which is what makes
  `PKG_DIR` resolve to the repo root. It exports nothing, so `window.YardDog` is `{}`.
- **`ds-entry.mjs` imports `brand-tokens.css` only.** That makes esbuild emit
  `_ds_bundle.css`, which in turn makes the converter take its *append* branch for
  `cfg.cssEntry`. Order in the shipped CSS: brand tokens first, then `styles.css` verbatim.
- **`styles.css` must stay on the verbatim `cssEntry` path — never import it from the JS
  entry.** It contains 25 `url('brand_photos/*.jpg')` references and a remote
  `@import url(fonts.googleapis.com…)`; esbuild would try to resolve all of them.
- **`guidelinesGlob: []`** is deliberate. The default globs `docs/*.md`; leaving it
  default risks sweeping unrelated markdown into `guidelines/`. The directory ships empty.
- **`react` is required even for a tokens-only DS** (`vendorReact` runs unconditionally).
  This repo has no React, so `react`, `react-dom` and `@types/react` were installed into
  the isolated `.ds-sync/node_modules` and **symlinked** into `./node_modules/`. The
  site's `package.json` and `package-lock.json` are untouched — verified with `git diff`.
  `./node_modules` is gitignored, so these links vanish on a fresh clone and must be
  recreated before a re-sync.
- **`playwright@1.62.0`** is the correct pin — it maps to the cached
  `~/.cache/ms-playwright/chromium-1234`. Any other version fails with "Executable
  doesn't exist". Do not install browsers.

## Fonts — self-hosted, and proven

The site pulls **Anton** (display) and **Inter** (body) from Google Fonts at runtime. A DS
bundle has no network, so the latin subsets are vendored in `.design-sync/fonts/` and
wired through `cfg.extraFonts`.

Verified with `fontTools` before shipping:
`inter-latin-var.woff2` is **variable**, `wght` 100–900 (so every weight the site asks
for is real); `anton-latin-400.woff2` is **static** weight 400 — never set a weight on a
heading, it would synthesize.

`validate` prints one warn, which is **expected and benign**:

```
[FONT_REMOTE] "Arial Narrow", "Impact" — a remote font-host @import is present
```

Those two are *system fallbacks* in the stacks, not brand fonts. The "remote @import" it
refers to is the Google line carried in verbatim from `styles.css`. It is **inert**: it
lands at line ~50 of `_ds_bundle.css`, after rules, where CSS forbids `@import`, so
browsers drop it. This was not assumed — `.design-sync/font-probe.mjs` loads the bundle in
real chromium and reports **zero** requests to `fonts.googleapis.com`/`gstatic.com`, both
local `.woff2` fetched, both faces `loaded`, and both rendering measurably wider/narrower
than their fallbacks (Anton 545 vs 628.6 px; Inter 662 vs 682.2 px). Presence is proven
differentially, not by `document.fonts.check()` alone.

## "Platy" in the bundle — checked, and it is not contamination

`grep -ri platy ds-bundle/` returns **5** hits, all in `_ds_bundle.css`: the
`.platy-form-mount` class and two comments. That is Yard Dog's own request-form embed
(commit `7930e6c`), an iframe wrapper carrying `position`/`padding` and nothing else.
**Zero** Platy OS tokens, colours, or components; `--pt-*`/`.cpt-root` return 0. It was
left verbatim rather than edited out, because editing the `cssEntry` append would
falsify the source. Flag it if a reviewer greps for the bare string.

---

## Tools kept here (durable, re-runnable)

- **`verify-conventions.mjs`** — extracts every class, token and hex named in
  `conventions.md` and proves each exists in `ds-bundle/_ds_bundle.css`. Exit 1 on any
  miss. Run it after any edit to `conventions.md`. It has a negative control on record:
  planting a fake class, token and hex made all three fail.
- **`font-probe.mjs <bundle>`** — the browser font check described above.

Both resolve `playwright` through the `.design-sync/node_modules` symlink into
`.ds-sync/node_modules`; recreate it after a clone.

## Re-sync risks

- **Recon decay.** `redesign-roadmap.html` still sits in the repo advertising a palette
  that never shipped. Anyone grepping for brand tokens finds it first. See above.
- **Literal hexes can drift.** The `var()` aliases in `brand-tokens.css` are rot-proof,
  but ten values are literals: the `[homepage]` six (they live in `index.html`'s Tailwind
  config, which this sync does not read at build time) and `#B22934`, `#7A1D26`,
  `#8a7d65`, `#4a3f2e`, `#b22222`, `#c8a24a` (used in `styles.css` but never tokenized
  there). If the site restyles, re-grep both files and re-check these.
- **The inert `@import` is inert by position, not by intent.** If the converter ever
  changes so `cssEntry` lands *first* in `_ds_bundle.css` — e.g. if `ds-entry.mjs` stops
  importing `brand-tokens.css`, so esbuild emits no CSS and the *copy* branch runs instead
  of the *append* branch — that Google `@import` becomes valid and the bundle silently
  gains a network dependency whose remote faces could shadow the local ones. **Re-run
  `font-probe.mjs` after every build** and confirm `remoteFontRequests` is `[]`.
- **The homepage is a second source that no config key points at.** If someone rebuilds
  `index.html` (a redesign has been attempted once and reverted), its palette changes and
  `brand-tokens.css` will not notice. Re-read its `tailwind.config` on any re-sync.
- **`node_modules` links are ephemeral.** `react`, `react-dom`, `@types/react` are
  symlinks into `.ds-sync/node_modules`; a fresh clone has neither. Re-stage `.ds-sync/`,
  `npm i esbuild ts-morph @types/react playwright@1.62.0 react react-dom`, then relink.
- **Font pins.** Anton `v27`, Inter `v20`, fetched 2026-09-04 from the Google Fonts CSS
  API. Both SIL OFL 1.1. Google can reissue these under new version paths; the vendored
  files are the source of truth now and nothing re-fetches them.
- **Not verified:** no visual comparison was made between a design rendered from this
  bundle and a real Yard Dog page. The CSS ships verbatim, so the classes behave as the
  site does, but a rendered-design-vs-live-site diff has never been run.
