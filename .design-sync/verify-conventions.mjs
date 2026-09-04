// Verify every claim in .design-sync/conventions.md against the BUILT bundle.
// A header naming things that do not exist is worse than no header, so this
// extracts each class / token / hex it mentions and proves it in ds-bundle/.

import { readFileSync } from 'node:fs';

const md = readFileSync('.design-sync/conventions.md', 'utf8');
const css = readFileSync('ds-bundle/_ds_bundle.css', 'utf8');
const cssLower = css.toLowerCase();

// Scan the whole document (fenced blocks included); fences themselves are
// stripped so ``` doesn't swallow inline-code pairing.
const text = md.replace(/```[a-z]*\n?/g, '');

const classes = new Set();
const tokens = new Set();
const hexes = new Set();

// A class reference: a dot at a word boundary followed by a lowercase name.
// `(?<![\w])` keeps `window.YardDog` and prose like "e.g." out.
for (const m of text.matchAll(/(?<![\w])\.([a-z][a-z0-9]*(?:-{1,2}[a-z0-9]+)*)/g)) classes.add(m[1]);
// A token: -- followed by a letter (excludes markdown's --- separators).
for (const m of text.matchAll(/--[a-z][a-z0-9-]*/g)) tokens.add(m[0]);
for (const m of text.matchAll(/#[0-9a-fA-F]{6}\b/g)) hexes.add(m[0]);

// Words that read as ".foo" in prose but are not selectors.
const NOT_A_CLASS = new Set(['css', 'mjs', 'json', 'md', 'js', 'html']);

const fail = [];
const esc = (s) => s.replace(/-/g, '\\-');
const classHit = (n) => new RegExp(`\\.${esc(n)}(?![\\w-])`).test(css);
// --glow-* are set inside rule bodies, not :root, so accept a bare mention too.
const tokenHit = (t) => new RegExp(`${esc(t)}\\s*:`).test(css) || css.includes(t);

for (const c of [...classes].sort()) {
  if (NOT_A_CLASS.has(c)) continue;
  if (!classHit(c)) fail.push(`CLASS  .${c}`);
}
for (const t of [...tokens].sort()) if (!tokenHit(t)) fail.push(`TOKEN  ${t}`);
for (const h of [...hexes].sort()) if (!cssLower.includes(h.toLowerCase())) fail.push(`HEX    ${h}`);

const n = [...classes].filter((c) => !NOT_A_CLASS.has(c)).length;
console.log(`checked ${n} classes, ${tokens.size} tokens, ${hexes.size} hexes`);
if (fail.length) {
  console.log('\nNOT FOUND IN BUILT BUNDLE:');
  for (const f of fail) console.log('  ' + f);
  process.exit(1);
}
console.log('OK — every class, token and hex named in conventions.md exists in ds-bundle/_ds_bundle.css');
