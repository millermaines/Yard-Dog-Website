import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const inputPath = path.join(projectRoot, 'brand_photos', 'GREGG COUNTY (1).png');
const outputPath = path.join(projectRoot, 'brand_photos', 'service-area-map.png');

if (!fs.existsSync(inputPath)) {
  console.error(`Source not found: ${inputPath}`);
  process.exit(1);
}

const inputBytes = fs.statSync(inputPath).size;
console.log(`Source: ${inputPath} (${(inputBytes / 1024).toFixed(1)} KB)`);

const imgBase64 = fs.readFileSync(inputPath).toString('base64');

const browser = await puppeteer.launch({ headless: 'new' });
try {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:#000">
       <img id="src" src="data:image/png;base64,${imgBase64}">
       <canvas id="cv"></canvas>
     </body></html>`,
    { waitUntil: 'load' }
  );

  const result = await page.evaluate(async () => {
    const img = document.getElementById('src');
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cv = document.getElementById('cv');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample BG color from a few corner pixels and average them
    const samples = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
      [10, 10],
      [w - 10, h - 10],
    ];
    let sR = 0, sG = 0, sB = 0;
    for (const [x, y] of samples) {
      const i = (y * w + x) * 4;
      sR += data[i];
      sG += data[i + 1];
      sB += data[i + 2];
    }
    const bgR = sR / samples.length;
    const bgG = sG / samples.length;
    const bgB = sB / samples.length;

    // Tolerance — squared euclidean distance threshold in RGB
    const T = 55 * 55;

    // Brand recolor targets — used after BG is cleared.
    // Dark source pixels (county outlines, arrow, text) -> cream
    // Light source pixels (the 4 highlighted counties) -> brand green-light
    const cream = [244, 239, 226];
    const green = [106, 170, 58];

    let cleared = 0;
    let kept = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < T) {
        data[i + 3] = 0;
        cleared++;
        continue;
      }
      kept++;
      // Recolor based on source luma so output uses brand palette.
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const target = luma < 140 ? cream : green;
      data[i] = target[0];
      data[i + 1] = target[1];
      data[i + 2] = target[2];
      // Soft-edge antialias pixels keep their alpha unchanged.
    }

    ctx.putImageData(imgData, 0, 0);
    const dataUrl = cv.toDataURL('image/png');
    return { dataUrl, w, h, bg: [bgR, bgG, bgB], cleared, kept };
  });

  console.log(
    `Image: ${result.w}x${result.h}, bg=rgb(${result.bg.map((v) => v.toFixed(0)).join(',')}), cleared=${result.cleared}, kept=${result.kept}`
  );

  const b64 = result.dataUrl.replace(/^data:image\/png;base64,/, '');
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(outputPath, buf);
  console.log(`Wrote: ${outputPath} (${(buf.length / 1024).toFixed(1)} KB)`);
  console.log(`Size delta: ${(inputBytes / 1024).toFixed(1)} KB -> ${(buf.length / 1024).toFixed(1)} KB`);
} finally {
  await browser.close();
}
