import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const inputPath = path.join(projectRoot, 'brand_photos', 'bwafter.jpg');
const logoPath = path.join(projectRoot, 'brand_assets', 'Yard Dog Logo.png');
const backupDir = path.join(projectRoot, 'brand_photos_original');
const backupPath = path.join(backupDir, 'bwafter.jpg');

if (!fs.existsSync(inputPath)) {
  console.error(`Missing: ${inputPath}`);
  process.exit(1);
}
if (!fs.existsSync(logoPath)) {
  console.error(`Missing: ${logoPath}`);
  process.exit(1);
}
fs.mkdirSync(backupDir, { recursive: true });

// Always work from the canonical original; if no canonical original exists yet,
// the current file becomes the canonical and we save a copy.
let workingBuf;
if (fs.existsSync(backupPath)) {
  console.log(`Reading canonical original from ${backupPath}`);
  workingBuf = fs.readFileSync(backupPath);
} else {
  console.log(`No prior backup; saving current file as canonical, then editing a copy`);
  workingBuf = fs.readFileSync(inputPath);
  fs.writeFileSync(backupPath, workingBuf);
}

const beforeSize = workingBuf.length;

const photoB64 = workingBuf.toString('base64');
const logoB64 = fs.readFileSync(logoPath).toString('base64');

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setDefaultTimeout(60000);

await page.setContent(
  `<!doctype html><html><body style="margin:0">
     <img id="photo" src="data:image/jpeg;base64,${photoB64}">
     <img id="logo"  src="data:image/png;base64,${logoB64}">
     <canvas id="cv"></canvas>
   </body></html>`,
  { waitUntil: 'load' }
);

const dataUrl = await page.evaluate(async () => {
  const photo = document.getElementById('photo');
  const logo = document.getElementById('logo');
  await Promise.all([photo.decode(), logo.decode()]);

  const W = photo.naturalWidth;
  const H = photo.naturalHeight;
  const cv = document.getElementById('cv');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.drawImage(photo, 0, 0);

  // ---- 1) Cover the existing watermark ----
  // Tight bounding box around just the watermark in the lower-left grass.
  // The driveway ends at roughly y=H*0.72, so we start the box BELOW that
  // line. The "Landscapes" subtitle on the watermark is wider than "YARD DOG",
  // so the box has to reach to ~x=W*0.43 to cover it.
  const wX = Math.round(W * 0.005);         // ~5px - hug the left edge
  const wY = Math.round(H * 0.755);         // ~526px - safely below the driveway
  const wW = Math.round(W * 0.43);          // ~421px - extends past 'LANDSCAPES'
  const wH = Math.round(H * 0.165);         // ~115px, ending at y~641

  // Sample colors from grass strips that are GUARANTEED to be pure grass —
  // only from below and to the right of the watermark. The area above is
  // driveway, so we skip it entirely.
  function sampleStripColor(x0, y0, sw, sh) {
    const x = Math.max(0, Math.min(W - sw, x0));
    const y = Math.max(0, Math.min(H - sh, y0));
    const id = ctx.getImageData(x, y, sw, sh).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < id.length; i += 4) {
      r += id[i]; g += id[i + 1]; b += id[i + 2]; n++;
    }
    return { r: r / n, g: g / n, b: b / n };
  }
  // Strip directly below the watermark (full width of bbox)
  const belowStrip = sampleStripColor(wX, wY + wH + 4, wW, 14);
  // Strip directly to the right of the watermark (full height of bbox)
  const rightStrip = sampleStripColor(wX + wW + 4, wY, 14, wH);
  // Weight toward 'below' since it's directly under the watermark
  const avgR = (belowStrip.r * 0.65 + rightStrip.r * 0.35);
  const avgG = (belowStrip.g * 0.65 + rightStrip.g * 0.35);
  const avgB = (belowStrip.b * 0.65 + rightStrip.b * 0.35);

  // Fill, then write per-pixel noise on top to break up the flat look
  const fill = ctx.getImageData(wX, wY, wW, wH);
  const fd = fill.data;
  for (let i = 0; i < fd.length; i += 4) {
    const jitter = (Math.random() - 0.5) * 24; // ±12 RGB
    fd[i]     = Math.max(0, Math.min(255, avgR + jitter));
    fd[i + 1] = Math.max(0, Math.min(255, avgG + jitter));
    fd[i + 2] = Math.max(0, Math.min(255, avgB + jitter));
    fd[i + 3] = 255;
  }
  ctx.putImageData(fill, wX, wY);

  // Feather the right and bottom edges only (top is driveway — leave alone)
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = `rgb(${Math.round(avgR)},${Math.round(avgG)},${Math.round(avgB)})`;
  ctx.fillRect(wX + wW - 1, wY, 6, wH);     // right edge feather
  ctx.fillRect(wX, wY + wH - 1, wW, 6);     // bottom edge feather
  ctx.restore();

  // ---- 2) Add new, more discrete brand watermark in the bottom-right ----
  // Layout: small circular logo + Anton-style text, low opacity, on a subtle
  // dark pill so it remains legible over varying photo content.

  const margin = Math.round(W * 0.024);
  const logoSize = Math.round(H * 0.075);  // ~52px
  const padX = Math.round(W * 0.014);
  const padY = Math.round(H * 0.013);
  const gap  = Math.round(W * 0.011);

  // Measure text width with the desired font BEFORE drawing the pill,
  // so the pill can size itself correctly.
  const fontSize = Math.round(H * 0.032); // ~22px main
  const subFontSize = Math.round(H * 0.020); // ~14px sub
  ctx.font = `700 ${fontSize}px "Inter", "Helvetica", Arial, sans-serif`;
  const mainText = 'YARD DOG';
  const subText  = 'LANDSCAPES';
  const mainWidth = ctx.measureText(mainText).width;
  ctx.font = `600 ${subFontSize}px "Inter", "Helvetica", Arial, sans-serif`;
  const subWidth = ctx.measureText(subText).width;
  const textWidth = Math.max(mainWidth, subWidth);

  const pillW = padX + logoSize + gap + textWidth + padX;
  const pillH = padY + logoSize + padY;
  const pillX = W - margin - pillW;
  const pillY = H - margin - pillH;

  // Drop shadow underneath for legibility
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  // Pill background — dark glass
  const r = pillH / 2;
  ctx.fillStyle = 'rgba(15, 26, 14, 0.55)';
  ctx.beginPath();
  ctx.moveTo(pillX + r, pillY);
  ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, r);
  ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, r);
  ctx.arcTo(pillX, pillY + pillH, pillX, pillY, r);
  ctx.arcTo(pillX, pillY, pillX + pillW, pillY, r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Subtle white border on pill
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(pillX + r, pillY);
  ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, r);
  ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, r);
  ctx.arcTo(pillX, pillY + pillH, pillX, pillY, r);
  ctx.arcTo(pillX, pillY, pillX + pillW, pillY, r);
  ctx.closePath();
  ctx.stroke();

  // Draw circular logo on cream background
  const lcx = pillX + padX + logoSize / 2;
  const lcy = pillY + pillH / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(lcx, lcy, logoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  // Cream fill background under the logo
  ctx.fillStyle = '#f4efe2';
  ctx.fillRect(pillX + padX, pillY + padY, logoSize, logoSize);
  // Then the logo itself
  ctx.drawImage(logo, pillX + padX, pillY + padY, logoSize, logoSize);
  ctx.restore();

  // Logo ring
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.arc(lcx, lcy, logoSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  // Text
  const textX = pillX + padX + logoSize + gap;
  const textTop = pillY + (pillH - logoSize) / 2;

  ctx.fillStyle = '#f4efe2';
  ctx.textBaseline = 'top';
  ctx.font = `700 ${fontSize}px "Inter", "Helvetica", Arial, sans-serif`;
  ctx.fillText(mainText, textX, textTop + Math.round(logoSize * 0.10));

  ctx.fillStyle = 'rgba(106, 170, 58, 0.95)'; // brand green-light
  ctx.font = `600 ${subFontSize}px "Inter", "Helvetica", Arial, sans-serif`;
  ctx.fillText(subText, textX, textTop + Math.round(logoSize * 0.55));

  return cv.toDataURL('image/jpeg', 0.86);
});

const outBuf = Buffer.from(dataUrl.split(',')[1], 'base64');
fs.writeFileSync(inputPath, outBuf);

await browser.close();

console.log(`Wrote ${inputPath}`);
console.log(`Size: ${(beforeSize / 1024).toFixed(1)} KB -> ${(outBuf.length / 1024).toFixed(1)} KB`);
console.log(`Canonical original preserved at: ${backupPath}`);
