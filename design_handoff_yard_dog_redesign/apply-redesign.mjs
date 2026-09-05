#!/usr/bin/env node
// apply-redesign.mjs — rolls the 2026 redesign across the whole Yard Dog site.
// Run from the repo root:  node design_handoff_yard_dog_redesign/apply-redesign.mjs [--dry]
// Idempotent. Steps:
//  1. Copy redesign.css to the repo root.
//  2. For the 8 rebuilt pages: take the NEW page from pages/, splice in the EXISTING page's SEO block
//     (title, description, robots, canonical, og:*, twitter:*, every application/ld+json script) so no
//     rankings are lost, then overwrite the repo page.
//  3. For EVERY other .html page in the repo root:
//     - add <link rel="stylesheet" href="redesign.css"> after styles.css
//     - replace the <header class="navbar">…</header> with the redesign header (from pages/about.html)
//     - replace the <footer class="footer">…</footer> with the redesign footer
//     - replace the .cta-banner section with the redesign one
//     - hero: if the page has a hero photo (.page-hero with background-image, or a .work-photo/first
//       brand_photos img on the page), set it as the .page-hero background so redesign.css renders it
//       full-bleed; otherwise leave the hero as-is (redesign.css gives it the dark ground)
//  4. Prints a summary. Nothing is deleted.
import { readFileSync, writeFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');
const REBUILT = ['index.html','about.html','our-work.html','services.html','hardscaping.html','pricing.html','blog.html','contact.html'];

const read = f => readFileSync(f, 'utf8');
const write = (f, s) => { if (DRY) return console.log('  would write', f); writeFileSync(f, s); };
const block = (html, open, close) => { const a = html.indexOf(open); if (a < 0) return null; const b = html.indexOf(close, a); return b < 0 ? null : html.slice(a, b + close.length); };

// ---- SEO extraction from the current live page ----
function seoBlock(html) {
  const head = block(html, '<head>', '</head>') || '';
  const keep = [];
  const grab = re => { for (const m of head.matchAll(re)) keep.push(m[0]); };
  grab(/<title>[\s\S]*?<\/title>/g);
  grab(/<meta\s+name="(description|robots|keywords|author|geo\.[\w.]+|ICBM|twitter:[\w:]+)"[^>]*>/g);
  grab(/<meta\s+property="(og:[\w:]+|article:[\w:]+)"[^>]*>/g);
  grab(/<link\s+rel="(canonical|alternate)"[^>]*>/g);
  grab(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/g);
  return keep.join('\n');
}
function spliceSeo(newHtml, oldHtml) {
  const seo = seoBlock(oldHtml);
  if (!seo) return newHtml;
  return newHtml.replace(/<!-- @@HEAD_SEO_START@@[\s\S]*?<!-- @@HEAD_SEO_END@@ -->/, `<!-- @@HEAD_SEO_START@@ -->\n${seo}\n<!-- @@HEAD_SEO_END@@ -->`);
}

// ---- Shared chrome, taken from the rebuilt About page ----
const donor = read(join(HERE, 'pages/about.html'));
const strip = h => h.replace(/https:\/\/www\.yarddoglandscapes\.com\/(brand_photos|brand_assets)\//g, '$1/');
const HEADER = block(donor, '<header class="navbar">', '</header>');
const FOOTER = block(donor, '<footer class="footer"', '</footer>');
const CTA = block(donor, '<section class="section bg-dark cta-banner">', '</section>');
const NAVJS = block(donor, '<script>\n(function(){\n  var navWrap', '</script>');
if (!HEADER || !FOOTER || !CTA || !NAVJS) throw new Error('donor blocks missing in pages/about.html');

// Legacy CTA on sub-pages: <section class="section bg-dark"><div class="container cta-banner">…</div></section>
// Keep the page's own headline (it's page/city-specific SEO copy); swap the chrome around it.
function ctaLegacy(html) {
  const m = html.match(/<section class="section bg-dark">\s*<div class="container cta-banner">[\s\S]*?<\/div>\s*<\/section>/);
  return m ? m[0] : null;
}
function ctaWithHeadline(oldBlock) {
  const h2 = (oldBlock.match(/<h2[^>]*>[\s\S]*?<\/h2>/) || [])[0];
  return h2 ? CTA.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, h2.replace(/<h2[^>]*>/, '<h2 style="font-size:clamp(2.25rem,4.5vw,4rem)">')) : CTA;
}
// ---- 1. CSS ----
if (!DRY) copyFileSync(join(HERE, 'redesign.css'), join(ROOT, 'redesign.css'));
console.log('✔ redesign.css');

// ---- 2. Rebuilt pages ----
for (const f of REBUILT) {
  const fresh = read(join(HERE, 'pages', f)).replace(/https:\/\/www\.yarddoglandscapes\.com\/(brand_photos|brand_assets)\//g, '$1/');
  const target = join(ROOT, f);
  const out = existsSync(target) ? spliceSeo(fresh, read(target)) : fresh;
  write(target, out);
  console.log('✔ rebuilt', f);
}

// ---- 3. Every other page ----
let n = 0, heroed = 0;
for (const f of readdirSync(ROOT).filter(x => x.endsWith('.html') && !REBUILT.includes(x))) {
  const p = join(ROOT, f);
  let html = read(p); const orig = html;
  if (!html.includes('redesign.css')) html = html.replace(/(<link[^>]+href="styles\.css"[^>]*>)/, '$1\n<link rel="stylesheet" href="redesign.css">');
  const oh = block(html, '<header class="navbar">', '</header>'); if (oh) html = html.replace(oh, strip(HEADER));
  const of = block(html, '<footer class="footer"', '</footer>'); if (of) html = html.replace(of, strip(FOOTER));
  const oc = block(html, '<section class="section bg-dark cta-banner">', '</section>') || ctaLegacy(html); if (oc) html = html.replace(oc, strip(ctaWithHeadline(oc)));
  // hero photo
  const heroOpen = html.match(/<section class="page-hero[^"]*"([^>]*)>/);
  if (heroOpen && !/background-image/.test(heroOpen[0])) {
    const img = (html.match(/brand_photos\/[\w\-.%]+\.(?:jpg|jpeg|png|webp)/i) || [])[0];
    if (img) { html = html.replace(heroOpen[0], heroOpen[0].replace(/>$/, ` style="background-image:url('${img}')">`)); heroed++; }
  }
  // nav JS: replace the old inline nav script if present, else append before </body>
  const oldJs = html.match(/<script>\s*\(function\(\)\s*\{\s*var navWrap[\s\S]*?<\/script>/);
  if (oldJs) html = html.replace(oldJs[0], NAVJS); else if (!html.includes('hamburgerBtn\')')) html = html.replace('</body>', NAVJS + '\n</body>');
  if (html !== orig) { write(p, html); n++; }
}
console.log(`✔ ${n} sub-pages updated (${heroed} got a full-bleed hero photo)`);
console.log(DRY ? '(dry run — nothing written)' : 'Done. Review with `git diff --stat`, then commit.');
