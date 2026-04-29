import puppeteer from 'puppeteer';
import fs from 'node:fs';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
const buf = fs.readFileSync('brand_photos/bwafter.jpg');
await page.setContent(`<img id="i" src="data:image/jpeg;base64,${buf.toString('base64')}">`, { waitUntil: 'load' });
const dims = await page.evaluate(async () => {
  const i = document.getElementById('i');
  await i.decode();
  return { w: i.naturalWidth, h: i.naturalHeight };
});
console.log(JSON.stringify(dims));
await browser.close();
