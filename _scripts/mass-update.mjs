import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const BASE = 'https://www.yarddoglandscapes.com';

const NEW_DROPDOWN = `<div class="dropdown dropdown--mega" id="servicesDropdown">
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Maintenance</span>
                  <a href="lawn-maintenance">Lawn Maintenance</a>
                  <a href="leaf-removal">Leaf Removal</a>
                  <a href="fertilization">Fertilization</a>
                  <a href="hedge-trimming">Hedge Trimming</a>
                  <a href="tree-shrub-care">Tree &amp; Shrub Care</a>
                </div>
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Installation</span>
                  <a href="landscaping">Landscaping</a>
                  <a href="flower-bed-installation">Flower Bed Installation</a>
                  <a href="mulch-installation">Mulch Installation</a>
                  <a href="sod-installation">Sod Installation</a>
                  <a href="tree-planting">Tree Planting</a>
                </div>
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Hardscape &amp; Specialty</span>
                  <a href="hardscaping">Hardscaping &amp; Patios</a>
                  <a href="drainage">Drainage</a>
                  <a href="christmas-lights">Christmas Lights</a>
                </div>
              </div>`;

const NEW_FOOTER_SERVICES = `<div class="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="lawn-maintenance">Lawn Care</a></li>
            <li><a href="landscaping">Landscaping</a></li>
            <li><a href="hardscaping">Hardscaping</a></li>
            <li><a href="tree-shrub-care">Tree &amp; Shrub Care</a></li>
            <li><a href="leaf-removal">Leaf Removal</a></li>
            <li><a href="fertilization">Fertilization</a></li>
            <li><a href="christmas-lights">Christmas Lights</a></li>
            <li><a href="drainage">Drainage</a></li>
          </ul>
        </div>`;

function slugFor(file) {
  if (file === 'index.html') return '/';
  return '/' + file.replace(/\.html$/, '');
}

function updateStandardPage(html, file) {
  const slug = slugFor(file);
  const canonicalHref = slug === '/' ? BASE + '/' : BASE + slug;

  let out = html;
  let changes = [];

  // 1. Replace dropdown
  const dropdownRe = /<div class="dropdown"[^>]*id="servicesDropdown"[^>]*>[\s\S]*?<\/div>\s*<\/li>/;
  if (dropdownRe.test(out)) {
    out = out.replace(dropdownRe, `${NEW_DROPDOWN}\n            </li>`);
    changes.push('nav dropdown');
  } else {
    // Try without trailing </li>
    const dropdownRe2 = /<div class="dropdown"[^>]*id="servicesDropdown"[^>]*>[\s\S]*?<\/div>/;
    if (dropdownRe2.test(out)) {
      out = out.replace(dropdownRe2, NEW_DROPDOWN);
      changes.push('nav dropdown');
    }
  }

  // 2. Replace footer Services column
  const footerRe = /<div class="footer-col">\s*<h4>Services<\/h4>\s*<ul>[\s\S]*?<\/ul>\s*<\/div>/;
  if (footerRe.test(out)) {
    out = out.replace(footerRe, NEW_FOOTER_SERVICES);
    changes.push('footer Services column');
  }

  // 3. Update / insert canonical
  const canonicalRe = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const newCanonical = `<link rel="canonical" href="${canonicalHref}">`;
  if (canonicalRe.test(out)) {
    const before = out;
    out = out.replace(canonicalRe, newCanonical);
    if (before !== out) changes.push('canonical tag');
  } else {
    // insert before </head>
    out = out.replace(/<\/head>/i, `  ${newCanonical}\n</head>`);
    changes.push('inserted canonical tag');
  }

  // 4. Update og:url
  const ogUrlRe = /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i;
  const newOgUrl = `<meta property="og:url" content="${canonicalHref}">`;
  if (ogUrlRe.test(out)) {
    const before = out;
    out = out.replace(ogUrlRe, newOgUrl);
    if (before !== out) changes.push('og:url');
  }

  // 5. Update any remaining bare-domain references in head meta to www version
  // (handles JSON-LD url field too, optional polish)
  const beforeBare = out;
  out = out.replace(/https:\/\/yarddoglandscapes\.com/g, BASE);
  if (beforeBare !== out) changes.push('bare-domain → www');

  return { out, changes };
}

function updateIndexPage(html) {
  let out = html;
  let changes = [];

  // Add canonical if missing (insert after <title>)
  if (!/<link\s+rel="canonical"/i.test(out)) {
    out = out.replace(/<\/title>/i, `</title>\n<link rel="canonical" href="${BASE}/" />`);
    changes.push('inserted canonical tag');
  }

  // Replace desktop dropdown content (5 service links inside the absolute panel)
  const desktopDropdownRe = /(<div class="absolute left-1\/2 top-full -translate-x-1\/2 mt-3[^"]*"[^>]*>)([\s\S]*?)(<\/div>\s*<\/li>)/;
  const desktopGroups = `
            <div class="grid grid-cols-3 gap-x-4 min-w-[640px]">
              <div>
                <span class="block px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Maintenance</span>
                <a href="lawn-maintenance" class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Lawn Maintenance</a>
                <a href="leaf-removal"     class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Leaf Removal</a>
                <a href="fertilization"    class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Fertilization</a>
                <a href="hedge-trimming"   class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Hedge Trimming</a>
                <a href="tree-shrub-care"  class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Tree &amp; Shrub Care</a>
              </div>
              <div>
                <span class="block px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Installation</span>
                <a href="landscaping"             class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Landscaping</a>
                <a href="flower-bed-installation" class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Flower Bed Installation</a>
                <a href="mulch-installation"      class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Mulch Installation</a>
                <a href="sod-installation"        class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Sod Installation</a>
                <a href="tree-planting"           class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Tree Planting</a>
              </div>
              <div>
                <span class="block px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Hardscape &amp; Specialty</span>
                <a href="hardscaping"      class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Hardscaping &amp; Patios</a>
                <a href="drainage"         class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Drainage</a>
                <a href="christmas-lights" class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Christmas Lights</a>
              </div>
            </div>
          `;
  if (desktopDropdownRe.test(out)) {
    out = out.replace(desktopDropdownRe, `$1${desktopGroups}$3`);
    changes.push('desktop nav dropdown');
  }

  // Replace mobile dropdown <ul> nested under the Services link
  const mobileSubRe = /(<a href="services" class="block px-6 py-3[^"]*"[^>]*>Services<\/a>)\s*<ul[^>]*>[\s\S]*?<\/ul>/;
  const mobileSub = `$1
          <ul class="ml-6 my-1 border-l border-white/10">
            <li><span class="block px-6 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Maintenance</span></li>
            <li><a href="lawn-maintenance" class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Lawn Maintenance</a></li>
            <li><a href="leaf-removal"     class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Leaf Removal</a></li>
            <li><a href="fertilization"    class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Fertilization</a></li>
            <li><a href="hedge-trimming"   class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Hedge Trimming</a></li>
            <li><a href="tree-shrub-care"  class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Tree &amp; Shrub Care</a></li>
            <li><span class="block px-6 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Installation</span></li>
            <li><a href="landscaping"             class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Landscaping</a></li>
            <li><a href="flower-bed-installation" class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Flower Bed Installation</a></li>
            <li><a href="mulch-installation"      class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Mulch Installation</a></li>
            <li><a href="sod-installation"        class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Sod Installation</a></li>
            <li><a href="tree-planting"           class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Tree Planting</a></li>
            <li><span class="block px-6 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Hardscape &amp; Specialty</span></li>
            <li><a href="hardscaping"      class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Hardscaping &amp; Patios</a></li>
            <li><a href="drainage"         class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Drainage</a></li>
            <li><a href="christmas-lights" class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Christmas Lights</a></li>
          </ul>`;
  if (mobileSubRe.test(out)) {
    out = out.replace(mobileSubRe, mobileSub);
    changes.push('mobile nav dropdown');
  }

  // Replace landing-page footer Services <ul>
  // Pattern: <h4 ...>Services</h4> ... <ul ...>...</ul>
  const indexFooterRe = /(>Services<\/h4>\s*<ul[^>]*>)([\s\S]*?)(<\/ul>)/;
  const indexFooterUl = `$1
          <li><a class="hover:text-white transition-colors" href="lawn-maintenance">Lawn Care</a></li>
          <li><a class="hover:text-white transition-colors" href="landscaping">Landscaping</a></li>
          <li><a class="hover:text-white transition-colors" href="hardscaping">Hardscaping</a></li>
          <li><a class="hover:text-white transition-colors" href="tree-shrub-care">Tree &amp; Shrub Care</a></li>
          <li><a class="hover:text-white transition-colors" href="leaf-removal">Leaf Removal</a></li>
          <li><a class="hover:text-white transition-colors" href="fertilization">Fertilization</a></li>
          <li><a class="hover:text-white transition-colors" href="christmas-lights">Christmas Lights</a></li>
          <li><a class="hover:text-white transition-colors" href="drainage">Drainage</a></li>
        $3`;
  if (indexFooterRe.test(out)) {
    out = out.replace(indexFooterRe, indexFooterUl);
    changes.push('footer Services column');
  }

  return { out, changes };
}

const summary = [];
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(ROOT, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const updater = file === 'index.html' ? updateIndexPage : updateStandardPage;
  const { out, changes } = updater(html, file);
  if (out !== html) {
    fs.writeFileSync(filePath, out, 'utf8');
    summary.push(`${file}: ${changes.join(', ')}`);
  } else {
    summary.push(`${file}: (unchanged)`);
  }
}

console.log(summary.join('\n'));
console.log(`\nTotal: ${files.length} files processed.`);
