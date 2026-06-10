// One-shot verifier: internal link integrity + image existence + JSON-LD validity.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const exists = new Set(files);
const photos = new Set(fs.existsSync(path.join(ROOT, 'brand_photos')) ? fs.readdirSync(path.join(ROOT, 'brand_photos')) : []);

let brokenLinks = [], brokenImgs = [], badJson = [];
const skip = h => /^(https?:|tel:|mailto:|#|\/$)/.test(h) || h === '/';

for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');

  // internal page links
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    let h = m[1];
    if (skip(h)) continue;
    if (h.startsWith('/')) h = h.slice(1);           // root-relative
    h = h.split('#')[0].split('?')[0];
    if (!h) continue;
    if (h.endsWith('.html')) { if (!exists.has(h)) brokenLinks.push(`${f} -> ${m[1]}`); continue; }
    if (h.endsWith('.xml') || h.endsWith('.css') || h.endsWith('.png') || h.endsWith('.jpg') || h.endsWith('.ico') || h.endsWith('.webmanifest')) continue;
    if (h.startsWith('brand_') || h.startsWith('api/') || h.startsWith('go/')) continue;
    // cleanUrl page: expect <h>.html
    if (!exists.has(h + '.html')) brokenLinks.push(`${f} -> ${m[1]} (no ${h}.html)`);
  }

  // images
  for (const m of html.matchAll(/src="brand_photos\/([^"]+)"/g)) {
    if (!photos.has(m[1])) brokenImgs.push(`${f} -> ${m[1]}`);
  }

  // JSON-LD validity
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1].trim()); } catch (e) { badJson.push(`${f}: ${e.message}`); }
  }
}

console.log(`files scanned: ${files.length}`);
console.log(`broken internal links: ${brokenLinks.length}`);
brokenLinks.slice(0, 30).forEach(x => console.log('  ✗ ' + x));
console.log(`broken brand_photos imgs: ${brokenImgs.length}`);
[...new Set(brokenImgs)].slice(0, 20).forEach(x => console.log('  ✗ ' + x));
console.log(`invalid JSON-LD blocks: ${badJson.length}`);
badJson.slice(0, 20).forEach(x => console.log('  ✗ ' + x));
console.log(brokenLinks.length || brokenImgs.length || badJson.length ? 'RESULT: FAIL' : 'RESULT: PASS ✓');
