// Wraps every primary/outline CTA button on the sub-pages with a hand-drawn
// squiggle SVG (vanilla port of Kokonut UI's hand-writing-text effect).
// Idempotent: re-running on a page that already has cta-marks does nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// ---- CSS for sub-pages ----
const ctaCss = `
/* ---------- Hand-drawn CTA squiggle (vanilla port of Kokonut UI hand-writing-text) ---------- */
.cta-mark {
  position: relative;
  display: inline-flex;
  isolation: isolate;
}
.cta-mark > .cta-mark-svg {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 132%;
  height: 240%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  overflow: visible;
  z-index: 0;
}
.cta-mark > .cta-mark-svg path {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  vector-effect: non-scaling-stroke;
  opacity: 0;
}
.cta-mark.is-drawn > .cta-mark-svg path {
  animation:
    cta-draw 2.5s cubic-bezier(0.43, 0.13, 0.23, 0.96) forwards,
    cta-fade 0.5s ease-out forwards;
}
@keyframes cta-draw { to { stroke-dashoffset: 0; } }
@keyframes cta-fade { to { opacity: 0.95; } }
.cta-mark > * { position: relative; z-index: 1; }
.cta-mark--cream > .cta-mark-svg path { stroke: #F4EFE2; }
.cta-mark--green > .cta-mark-svg path { stroke: #4A8E45; }
.cta-mark--ink   > .cta-mark-svg path { stroke: #0E1714; }
@media (prefers-reduced-motion: reduce) {
  .cta-mark.is-drawn > .cta-mark-svg path {
    animation: none;
    stroke-dashoffset: 0;
    opacity: 0.9;
  }
}
`;

const stylesPath = path.join(projectRoot, 'styles.css');
const stylesContent = fs.readFileSync(stylesPath, 'utf8');
if (!stylesContent.includes('Hand-drawn CTA squiggle')) {
  fs.writeFileSync(stylesPath, stylesContent.replace(/\s*$/, '') + '\n' + ctaCss);
  console.log('Added .cta-mark CSS to styles.css');
} else {
  console.log('styles.css already has .cta-mark CSS — leaving alone');
}

// ---- The SVG path Kokonut UI uses ----
const SQUIGGLE_PATH = 'M 950 90 C 1250 300, 1050 480, 600 520 C 250 520, 150 480, 150 300 C 150 120, 350 80, 600 80 C 850 80, 950 180, 950 180';

function squiggleSvg(variant) {
  return `<span class="cta-mark cta-mark--${variant}"><svg class="cta-mark-svg" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${SQUIGGLE_PATH}" /></svg>`;
}

// ---- Determine variant by inspecting the section the button sits in ----
function pickVariant(htmlBeforeButton) {
  // Find the nearest preceding <section> opening tag
  const sectionMatches = [...htmlBeforeButton.matchAll(/<section\b[^>]*>/g)];
  if (!sectionMatches.length) return 'green';
  const lastSectionTag = sectionMatches[sectionMatches.length - 1][0];

  // Also check if the button is inside a div with cta-banner class
  const lastBannerOpen = htmlBeforeButton.lastIndexOf('class="container cta-banner"');
  const lastSectionOpen = sectionMatches[sectionMatches.length - 1].index;
  const insideCtaBanner = lastBannerOpen > -1 && lastBannerOpen > lastSectionOpen;

  if (insideCtaBanner) return 'cream';
  if (/page-hero|bg-dark/.test(lastSectionTag)) return 'cream';
  return 'green';
}

// ---- The IntersectionObserver IIFE we inject into each page's existing script ----
const observerJs = `
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
      })();`;

// ---- Wrap CTA buttons ----
function wrapButtons(html) {
  let modified = html;
  const wrapped = { primary: 0, outline: 0 };
  // Skip if already wrapped
  // We pick patterns where class is exactly "btn btn-primary" or "btn btn-outline"
  // (the navbar CTA uses "btn btn-primary nav-cta" — different, won't match)

  function wrapPattern(re, kind) {
    // Walk through matches; recompute index each time since modified is changing
    let cursor = 0;
    while (true) {
      re.lastIndex = cursor;
      const match = re.exec(modified);
      if (!match) break;
      const idx = match.index;
      // If this <a> is already inside a cta-mark, skip it
      const upTo = modified.slice(0, idx);
      const lastCtaOpen = upTo.lastIndexOf('<span class="cta-mark');
      const lastCtaClose = upTo.lastIndexOf('</span>');
      if (lastCtaOpen > lastCtaClose) {
        cursor = idx + match[0].length;
        continue;
      }
      // Pick variant
      const variant = kind === 'outline' ? 'cream' : pickVariant(upTo);
      const svg = squiggleSvg(variant);
      const wrappedFragment = svg + match[0] + '</span>';
      modified = modified.slice(0, idx) + wrappedFragment + modified.slice(idx + match[0].length);
      cursor = idx + wrappedFragment.length;
      wrapped[kind]++;
    }
  }

  // Match exact class="btn btn-primary" (no extra classes — excludes nav-cta etc.)
  wrapPattern(/<a class="btn btn-primary" href="[^"]*"[^>]*>[^<]*<\/a>/g, 'primary');
  // Same for outline
  wrapPattern(/<a class="btn btn-outline" href="[^"]*"[^>]*>[^<]*<\/a>/g, 'outline');

  return { html: modified, wrapped };
}

// ---- Inject observer JS into existing inline script ----
function injectObserver(html) {
  if (html.includes('Hand-drawn CTA squiggle:')) return html; // already injected

  // Find the LAST `})();` followed by closing `</script>` tag
  // (this is the closing of the outer IIFE in each sub-page's inline script)
  const re = /(\n\s*\}\)\(\);\s*\n?\s*<\/script>)/g;
  const matches = [...html.matchAll(re)];
  if (!matches.length) return html;
  const last = matches[matches.length - 1];
  const insertion = observerJs + last[1];
  return html.slice(0, last.index) + insertion + html.slice(last.index + last[1].length);
}

// ---- Process all sub-pages ----
const skipFiles = new Set(['index.html']); // landing page already has cta-marks where intended
const allHtml = fs
  .readdirSync(projectRoot)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !skipFiles.has(f));

console.log(`\nProcessing ${allHtml.length} sub-pages…`);
let totalPrimary = 0;
let totalOutline = 0;
let filesChanged = 0;

for (const filename of allHtml) {
  const filePath = path.join(projectRoot, filename);
  const before = fs.readFileSync(filePath, 'utf8');
  const { html, wrapped } = wrapButtons(before);
  const finalHtml = injectObserver(html);
  if (finalHtml !== before) {
    fs.writeFileSync(filePath, finalHtml);
    filesChanged++;
    totalPrimary += wrapped.primary;
    totalOutline += wrapped.outline;
    if (wrapped.primary || wrapped.outline) {
      console.log(`  ${filename}: +${wrapped.primary} primary, +${wrapped.outline} outline`);
    }
  }
}

console.log(`\nDone. ${filesChanged} files updated.`);
console.log(`  Primary CTAs wrapped: ${totalPrimary}`);
console.log(`  Outline CTAs wrapped: ${totalOutline}`);
