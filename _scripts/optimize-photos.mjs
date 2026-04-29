import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const photosDir = path.join(projectRoot, 'brand_photos');
const backupDir = path.join(projectRoot, 'brand_photos_original');

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.82;
const SKIP_BELOW_KB = 250;

// Files to skip outright (already-optimized derivatives or things we shouldn't touch)
const SKIP_FILES = new Set(['service-area-map.png']);

function fmtKB(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

function isImage(filename) {
  return /\.(jpe?g|png)$/i.test(filename);
}

fs.mkdirSync(backupDir, { recursive: true });

const all = fs.readdirSync(photosDir).filter(isImage);
console.log(`Scanning ${all.length} image files in ${photosDir}\n`);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
// Generous limits so large source images load
await page.setDefaultTimeout(60000);

let totalBefore = 0;
let totalAfter = 0;
let processed = 0;
let skipped = 0;

for (const filename of all) {
  const inputPath = path.join(photosDir, filename);
  const backupPath = path.join(backupDir, filename);
  const stat = fs.statSync(inputPath);
  const sizeKB = stat.size / 1024;

  if (SKIP_FILES.has(filename)) {
    console.log(`SKIP   ${filename}  (${fmtKB(stat.size)}) - on skip list`);
    skipped++;
    continue;
  }
  if (sizeKB < SKIP_BELOW_KB) {
    console.log(`SKIP   ${filename}  (${fmtKB(stat.size)}) - below threshold`);
    skipped++;
    continue;
  }

  // Back up first run only — if backup already exists, leave it (it's the canonical original)
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
  }

  const ext = path.extname(filename).toLowerCase();
  const isJpg = ext === '.jpg' || ext === '.jpeg';
  const mime = isJpg ? 'image/jpeg' : 'image/png';
  const sourceBuf = fs.readFileSync(backupPath); // always read from canonical backup
  const sourceB64 = sourceBuf.toString('base64');
  const dataUrlIn = `data:${mime};base64,${sourceB64}`;

  await page.setContent(
    `<!doctype html><html><body style="margin:0">
       <img id="src" crossorigin="anonymous">
     </body></html>`,
    { waitUntil: 'load' }
  );

  // Set src after the page is loaded so decode works reliably with very large data URLs
  await page.evaluate((url) => { document.getElementById('src').src = url; }, dataUrlIn);

  const out = await page.evaluate(async (maxWidth, mime, quality) => {
    const img = document.getElementById('src');
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const scale = w > maxWidth ? maxWidth / w : 1;
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);

    const cv = document.createElement('canvas');
    cv.width = tw;
    cv.height = th;
    const ctx = cv.getContext('2d');
    // Higher quality scaler
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, tw, th);

    const dataUrl = cv.toDataURL(mime, quality);
    return { dataUrl, srcW: w, srcH: h, outW: tw, outH: th };
  }, MAX_WIDTH, mime, JPEG_QUALITY);

  const outBuf = Buffer.from(out.dataUrl.split(',')[1], 'base64');

  // Only commit the new file if it's actually smaller. Some PNG photos can re-encode larger.
  if (outBuf.length >= stat.size) {
    console.log(
      `KEEP   ${filename}  (${fmtKB(stat.size)} -> would be ${fmtKB(outBuf.length)} - keeping original)`
    );
    skipped++;
    continue;
  }

  fs.writeFileSync(inputPath, outBuf);
  totalBefore += stat.size;
  totalAfter += outBuf.length;
  processed++;

  const pct = ((1 - outBuf.length / stat.size) * 100).toFixed(0);
  console.log(
    `OPT    ${filename}  ${fmtKB(stat.size)} -> ${fmtKB(outBuf.length)}  (-${pct}%)  [${out.srcW}x${out.srcH} -> ${out.outW}x${out.outH}]`
  );
}

await browser.close();

console.log('\n--- Summary ---');
console.log(`Processed: ${processed}`);
console.log(`Skipped:   ${skipped}`);
console.log(`Total before: ${fmtKB(totalBefore)}`);
console.log(`Total after:  ${fmtKB(totalAfter)}`);
if (totalBefore > 0) {
  const savedPct = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
  console.log(`Saved:        ${fmtKB(totalBefore - totalAfter)}  (${savedPct}%)`);
}
console.log(`Originals are preserved in: ${backupDir}`);
