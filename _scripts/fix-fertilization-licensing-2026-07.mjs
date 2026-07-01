// fix-fertilization-licensing-2026-07.mjs
// Idempotent. Removes herbicide / weed-control ADVERTISING claims from the
// fertilization pages. Yard Dog offers fertilization only and does NOT hold a
// TDA Commercial Ag-3A / SPCS applicator license, so advertising "weed control",
// "pre-emergent", or "post-emergent applications" promises a service it cannot
// legally deliver. Fertilizer, aeration, soil testing, and winterizer are fine —
// only the herbicide language is stripped. Reword targets the real deliverables.
//
// Usage: node _scripts/fix-fertilization-licensing-2026-07.mjs [--dry]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

// [find, replace] — order matters (longer/more-specific first).
const REPLACEMENTS = [
  ['We handle pre-emergent and post-emergent weed control, fall winterizer, and spring green-up',
   'We handle soil-tested seasonal feedings, fall winterizer, and spring green-up'],
  ['hitting pre-emergent in late winter, growth-season feedings in spring and summer, and a winterizer in fall',
   'starting with an early-season feeding in late winter, growth-season feedings in spring and summer, and a winterizer in fall'],
  ['Weed control, pre-emergent, aeration, and seasonal programs across East Texas.',
   'Custom nutrient plans, aeration, and seasonal feeding programs across East Texas.'],
  ['Multi-step seasonal fertilization, weed control, and turf programs for East Texas lawns.',
   'Multi-step seasonal fertilization and turf-feeding programs for East Texas lawns.'],
  ['Soil-tested fertilization, weed control, and aeration programs tuned for East Texas grasses',
   'Soil-tested fertilization and aeration programs tuned for East Texas grasses'],
  ['Lawn fertilization and weed control in Longview TX.',
   'Lawn fertilization and soil health in Longview TX.'],
  ['Pre-emergent &amp; post-emergent applications', 'Seasonal feeding &amp; winterizer program'],
  ['Weed control treatments', 'Soil-tested nutrient plan'],
];

const files = fs.readdirSync(ROOT).filter((f) => /^fertilization.*\.html$/.test(f));
let totalHits = 0;
let changedFiles = 0;
for (const f of files) {
  const p = path.join(ROOT, f);
  let html = fs.readFileSync(p, 'utf8');
  let hits = 0;
  for (const [find, repl] of REPLACEMENTS) {
    const parts = html.split(find);
    if (parts.length > 1) { hits += parts.length - 1; html = parts.join(repl); }
  }
  if (hits > 0) {
    totalHits += hits; changedFiles++;
    console.log(`  ${DRY ? '[dry] ' : ''}${f}: ${hits} replacement(s)`);
    if (!DRY) fs.writeFileSync(p, html);
  }
}
// residual check
let residual = 0;
for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const m = html.match(/pre-?emergent|post-?emergent|weed control/gi);
  if (m) { residual += m.length; if (!DRY) console.log(`  ⚠ RESIDUAL in ${f}: ${m.join(', ')}`); }
}
console.log(`\n${DRY ? '[DRY] ' : ''}files changed: ${changedFiles}  replacements: ${totalHits}  residual herbicide terms: ${residual}`);
