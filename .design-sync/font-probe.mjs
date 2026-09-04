// Differential font probe for the Yard Dog ds-bundle.
//
// Answers three questions with a real browser instead of by reading the spec:
//   1. Does loading ds-bundle/styles.css hit the network for fonts?
//   2. Do 'Anton' and 'Inter' actually load from the bundle's own fonts/?
//   3. Do they RENDER differently from their fallbacks (Impact / system sans)?
//
// (3) is the differential half: document.fonts.check() can report true for a
// face that never painted, so text width is measured against a control that is
// forced to the fallback stack.

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.argv[2] ?? './ds-bundle';
const TYPES = {
  '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2',
  '.html': 'text/html', '.json': 'application/json',
};

const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/probe.html') {
    res.writeHead(200, { 'content-type': 'text/html' });
    return res.end(`<!doctype html><meta charset="utf-8">
      <link rel="stylesheet" href="/styles.css">
      <style>
        .probe { font-size: 64px; white-space: nowrap; display: inline-block; }
        #anton   { font-family: 'Anton'; }
        #anton-c { font-family: 'Arial Narrow', Impact, sans-serif; }
        #inter   { font-family: 'Inter'; }
        #inter-c { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
      </style>
      <div><span class="probe" id="anton">Yard Dog Landscapes</span></div>
      <div><span class="probe" id="anton-c">Yard Dog Landscapes</span></div>
      <div><span class="probe" id="inter">Yard Dog Landscapes</span></div>
      <div><span class="probe" id="inter-c">Yard Dog Landscapes</span></div>`);
  }
  const p = join(ROOT, url);
  if (!existsSync(p)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' });
  res.end(readFileSync(p));
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage();

const requests = [];
page.on('request', (r) => requests.push(r.url()));

await page.goto(`http://127.0.0.1:${port}/probe.html`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const out = await page.evaluate(() => {
  const w = (id) => document.getElementById(id).getBoundingClientRect().width;
  return {
    antonCheck: document.fonts.check("64px 'Anton'"),
    interCheck: document.fonts.check("64px 'Inter'"),
    loaded: [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`),
    antonWidth: w('anton'), antonControl: w('anton-c'),
    interWidth: w('inter'), interControl: w('inter-c'),
  };
});

const remote = requests.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u));
const localFonts = requests.filter((u) => /\.woff2$/.test(u));

console.log(JSON.stringify({
  remoteFontRequests: remote,
  localFontRequests: localFonts.map((u) => u.replace(`http://127.0.0.1:${port}`, '')),
  ...out,
  antonDiffersFromFallback: Math.abs(out.antonWidth - out.antonControl) > 1,
  interDiffersFromFallback: Math.abs(out.interWidth - out.interControl) > 1,
}, null, 2));

await browser.close();
server.close();
