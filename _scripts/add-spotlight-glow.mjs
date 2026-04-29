// Adds a Kokonut-UI-style spotlight glow border to every photo/card on the site,
// brand-tuned to stay inside the green hue range. Idempotent: re-runs are no-ops.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Class lists by destination ---------------------------------------------------
// styles.css drives the sub-pages and the landing page's sub-page-style cards.
// The landing page's <style> block separately needs .service-card and .img-treat
// because those are defined inline in index.html, not in styles.css.

const SUBPAGE_CLASSES = [
  '.glow-card',
  '.project-card',
  '.work-photo',
  '.photo-figure',
  '.figure-card',
  '.service-card-link',
  '.sc-photo',
];

const INDEX_INLINE_CLASSES = [
  '.glow-card',
  '.service-card',  // landing services grid
  '.img-treat',     // landing work gallery
];

// CSS factories ----------------------------------------------------------------
function buildGlowCss(classList) {
  // Returns one big CSS chunk that wires up base vars, ::before/::after,
  // hover activation and reduced-motion fallback for every selector in classList.
  const base = classList.join(',\n');
  const before = classList.map((c) => `${c}::before`).join(',\n');
  const after = classList.map((c) => `${c}::after`).join(',\n');
  const hover = classList.flatMap((c) => [`${c}:hover::before`, `${c}:hover::after`]).join(',\n');

  return `
/* ============ Spotlight glow on photo/card hover (Kokonut UI port, brand-tuned) ============ */
:root {
  --glow-x: 0;
  --glow-y: 0;
  --glow-xp: 0.5;
}
${base} {
  position: relative;
  isolation: isolate;
  --glow-base: 100;       /* hue: green */
  --glow-spread: 25;      /* tight range — stays in green family */
  --glow-radius: 16;
  --glow-border: 2;
  --glow-size: 220;
  --glow-saturation: 55%;
  --glow-lightness: 52%;
  --glow-hue: calc(var(--glow-base) + (var(--glow-xp, 0.5) * var(--glow-spread, 0)));
}
${before},
${after} {
  content: '';
  position: absolute;
  inset: calc(var(--glow-border) * -1px);
  border: calc(var(--glow-border) * 1px) solid transparent;
  border-radius: calc(var(--glow-radius) * 1px + var(--glow-border) * 1px);
  background-attachment: fixed;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(#fff, #fff);
  -webkit-mask-clip: padding-box, border-box;
  -webkit-mask-composite: source-in;
  mask: linear-gradient(transparent, transparent), linear-gradient(#fff, #fff);
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 1;
}
${before} {
  background-image: radial-gradient(
    calc(var(--glow-size) * 0.75 * 1px) calc(var(--glow-size) * 0.75 * 1px) at
    calc(var(--glow-x) * 1px) calc(var(--glow-y) * 1px),
    hsl(var(--glow-hue) var(--glow-saturation) var(--glow-lightness)),
    transparent 100%
  );
  filter: brightness(1.4) saturate(1.2);
}
${after} {
  background-image: radial-gradient(
    calc(var(--glow-size) * 0.5 * 1px) calc(var(--glow-size) * 0.5 * 1px) at
    calc(var(--glow-x) * 1px) calc(var(--glow-y) * 1px),
    rgba(255, 255, 255, 0.85),
    transparent 100%
  );
}
${hover} {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
${before},
${after} {
    transition: none;
  }
}
/* ============ end spotlight glow ============ */
`.trim() + '\n';
}

// Sentinel to keep idempotent
const SENTINEL = 'Spotlight glow on photo/card hover';

// 1) Append to styles.css ------------------------------------------------------
const stylesPath = path.join(projectRoot, 'styles.css');
const stylesNow = fs.readFileSync(stylesPath, 'utf8');
if (stylesNow.includes(SENTINEL)) {
  console.log('styles.css already has glow CSS — skipping');
} else {
  const css = buildGlowCss(SUBPAGE_CLASSES);
  fs.writeFileSync(stylesPath, stylesNow.replace(/\s*$/, '') + '\n\n' + css);
  console.log('Appended glow CSS to styles.css (' + SUBPAGE_CLASSES.length + ' selectors)');
}

// 2) Insert glow CSS into index.html <style> block -----------------------------
const indexPath = path.join(projectRoot, 'index.html');
const indexNow = fs.readFileSync(indexPath, 'utf8');
if (indexNow.includes(SENTINEL)) {
  console.log('index.html already has glow CSS — skipping');
} else {
  // Insert before the closing </style> of the FIRST <style> block in <head>
  const closeIdx = indexNow.indexOf('</style>');
  if (closeIdx < 0) {
    console.warn('Could not find </style> in index.html — skipping');
  } else {
    const css = '\n' + buildGlowCss(INDEX_INLINE_CLASSES) + '\n';
    const updated = indexNow.slice(0, closeIdx) + css + indexNow.slice(closeIdx);
    fs.writeFileSync(indexPath, updated);
    console.log('Inserted glow CSS into index.html <style> (' + INDEX_INLINE_CLASSES.length + ' selectors)');
  }
}

// 3) Inject cursor tracker JS into every HTML file's inline <script> -----------
const cursorJs = `
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
      })();`;

const allHtml = fs.readdirSync(projectRoot).filter((f) => f.endsWith('.html'));
let jsInjected = 0;
for (const f of allHtml) {
  const fp = path.join(projectRoot, f);
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('Spotlight cursor tracker')) continue;

  // Inject before the LAST `</script>` (which closes the inline IIFE block on each page)
  const matches = [...html.matchAll(/<\/script>/g)];
  if (!matches.length) continue;
  const last = matches[matches.length - 1];

  // Insert the IIFE just before `</script>`. The existing script ends with `})();`
  // but we'll leave that alone and put our IIFE adjacent inside the same <script> block.
  // To do that, find the LAST `})();` directly preceding the last </script>.
  const beforeClosing = html.slice(0, last.index);
  const lastIifeClose = beforeClosing.lastIndexOf('})();');
  if (lastIifeClose < 0) {
    // No matching IIFE close — just put before </script>
    html = beforeClosing + cursorJs + '\n  ' + html.slice(last.index);
  } else {
    // Insert AFTER the last `})();` so we add another sibling IIFE
    const insertAt = lastIifeClose + '})();'.length;
    html = html.slice(0, insertAt) + '\n' + cursorJs + html.slice(insertAt);
  }
  fs.writeFileSync(fp, html);
  jsInjected++;
}
console.log('Cursor tracker JS injected into ' + jsInjected + ' HTML files');

console.log('\nDone.');
