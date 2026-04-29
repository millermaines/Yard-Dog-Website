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

// Files to never convert (graphics with transparency, already-optimized derivatives)
const SKIP_FILES = new Set([
  'service-area-map.png',
  'GREGG COUNTY (1).png',
]);

const fmtKB = (b) => (b / 1024).toFixed(1) + ' KB';

fs.mkdirSync(backupDir, { recursive: true });

const allPngs = fs.readdirSync(photosDir).filter((f) => /\.png$/i.test(f));
console.log(`Scanning ${allPngs.length} PNG files\n`);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setDefaultTimeout(60000);

const conversions = []; // { oldName, newName }
let totalBefore = 0;
let totalAfter = 0;

for (const filename of allPngs) {
  const inputPath = path.join(photosDir, filename);
  const backupPath = path.join(backupDir, filename);
  const stat = fs.statSync(inputPath);
  const sizeKB = stat.size / 1024;

  if (SKIP_FILES.has(filename)) {
    console.log(`SKIP   ${filename}  - in skip list`);
    continue;
  }
  if (sizeKB < SKIP_BELOW_KB) {
    console.log(`SKIP   ${filename}  (${fmtKB(stat.size)}) - below threshold`);
    continue;
  }

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
  }

  const sourceB64 = fs.readFileSync(backupPath).toString('base64');
  const dataUrlIn = `data:image/png;base64,${sourceB64}`;

  await page.setContent(
    `<!doctype html><html><body style="margin:0"><img id="src" crossorigin="anonymous"></body></html>`,
    { waitUntil: 'load' }
  );
  await page.evaluate((url) => { document.getElementById('src').src = url; }, dataUrlIn);

  const result = await page.evaluate(async (maxWidth, jpegQuality) => {
    const img = document.getElementById('src');
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;

    // Sample for transparency — if more than 0.05% of pixels are non-opaque, keep as PNG
    let nonOpaque = 0;
    const sampleStride = 4 * 64; // every 64th pixel
    for (let i = 3; i < data.length; i += sampleStride) {
      if (data[i] < 250) nonOpaque++;
    }
    const sampledPixels = Math.ceil(data.length / sampleStride);
    const fracTransparent = nonOpaque / sampledPixels;
    const hasTransparency = fracTransparent > 0.0005;

    // Resize
    const scale = w > maxWidth ? maxWidth / w : 1;
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);
    const cv2 = document.createElement('canvas');
    cv2.width = tw;
    cv2.height = th;
    const ctx2 = cv2.getContext('2d');
    ctx2.imageSmoothingEnabled = true;
    ctx2.imageSmoothingQuality = 'high';

    if (!hasTransparency) {
      // Fill white BG before drawing — JPG can't hold transparency, so any "transparent" pixels would render black
      ctx2.fillStyle = '#ffffff';
      ctx2.fillRect(0, 0, tw, th);
    }
    ctx2.drawImage(img, 0, 0, tw, th);

    const outMime = hasTransparency ? 'image/png' : 'image/jpeg';
    const dataUrl = cv2.toDataURL(outMime, jpegQuality);
    return {
      dataUrl,
      hasTransparency,
      fracTransparent,
      srcW: w, srcH: h, outW: tw, outH: th,
    };
  }, MAX_WIDTH, JPEG_QUALITY);

  const outBuf = Buffer.from(result.dataUrl.split(',')[1], 'base64');
  totalBefore += stat.size;

  if (result.hasTransparency) {
    if (outBuf.length < stat.size) {
      fs.writeFileSync(inputPath, outBuf);
      totalAfter += outBuf.length;
      console.log(
        `PNG    ${filename}  ${fmtKB(stat.size)} -> ${fmtKB(outBuf.length)}  (kept as PNG, has transparency)`
      );
    } else {
      totalAfter += stat.size;
      console.log(
        `KEEP   ${filename}  (${fmtKB(stat.size)}, has transparency, re-encode would be larger)`
      );
    }
  } else {
    // No transparency — convert to JPG
    const newFilename = filename.replace(/\.png$/i, '.jpg');
    const newPath = path.join(photosDir, newFilename);

    fs.writeFileSync(newPath, outBuf);
    fs.unlinkSync(inputPath); // remove the now-redundant PNG (backup preserved)
    totalAfter += outBuf.length;
    conversions.push({ oldName: filename, newName: newFilename });

    const pct = ((1 - outBuf.length / stat.size) * 100).toFixed(0);
    console.log(
      `JPG    ${filename}  ->  ${newFilename}  ${fmtKB(stat.size)} -> ${fmtKB(outBuf.length)}  (-${pct}%)`
    );
  }
}

await browser.close();

// ---- Update HTML/CSS references ----
console.log('\n--- Updating site references ---');

const codeFiles = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name.startsWith('.git') ||
          ent.name === 'brand_photos_original' || ent.name === 'brand_assets') continue;
      walk(full);
    } else if (/\.(html|css|mjs|js)$/i.test(ent.name)) {
      // Don't rewrite the conversion script itself
      if (full.includes('convert-png-photos-to-jpg')) continue;
      codeFiles.push(full);
    }
  }
}
walk(projectRoot);

let totalReplacements = 0;
const filesChanged = new Set();

for (const file of codeFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const { oldName, newName } of conversions) {
    // Match the filename in href/src/url() — escape regex chars in oldName
    const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    const before = content;
    content = content.replace(re, newName);
    if (content !== before) {
      changed = true;
      totalReplacements += (before.match(re) || []).length;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    filesChanged.add(file);
  }
}

console.log(`Updated ${filesChanged.size} files (${totalReplacements} replacements)`);

console.log('\n--- Summary ---');
console.log(`Converted to JPG: ${conversions.length}`);
console.log(`Total before:    ${fmtKB(totalBefore)}`);
console.log(`Total after:     ${fmtKB(totalAfter)}`);
if (totalBefore > 0) {
  const savedPct = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
  console.log(`Saved:           ${fmtKB(totalBefore - totalAfter)}  (${savedPct}%)`);
}
console.log(`Originals preserved in: ${backupDir}`);
