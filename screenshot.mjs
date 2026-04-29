import fs from 'node:fs';
import path from 'node:path';

const targetUrl = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  console.error('Puppeteer is not installed. Run:  npm install puppeteer');
  process.exit(1);
}

const dir = path.join(process.cwd(), 'temporary screenshots');
fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir);
const nums = existing
  .map(f => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map(m => parseInt(m[1], 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const safeLabel = label.replace(/[^a-z0-9-_]/gi, '-');
const name = safeLabel ? `screenshot-${next}-${safeLabel}.png` : `screenshot-${next}.png`;
const out = path.join(dir, name);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.screenshot({ path: out, fullPage: true });
  console.log(`Saved ${out}`);
} finally {
  await browser.close();
}
