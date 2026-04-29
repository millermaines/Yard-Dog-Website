import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

const NEW_DROPDOWN = `<div class="dropdown dropdown--mega dropdown--mega-4" id="servicesDropdown">
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
                <div class="dropdown-group">
                  <span class="dropdown-group-label">Design</span>
                  <a href="design-preview">Design Preview</a>
                </div>
              </div>`;

function updateStandard(html) {
  const re = /<div class="dropdown[^"]*"[^>]*id="servicesDropdown"[^>]*>[\s\S]*?<\/div>\s*<\/li>/;
  if (!re.test(html)) return null;
  return html.replace(re, `${NEW_DROPDOWN}\n            </li>`);
}

function updateIndex(html) {
  let out = html;
  let touched = false;

  const desktopRe = /(<div class="absolute left-1\/2 top-full -translate-x-1\/2 mt-3[^"]*"[^>]*>)([\s\S]*?)(<\/div>\s*<\/li>)/;
  const desktopGroups = `
            <div class="grid grid-cols-4 gap-x-4 min-w-[820px]">
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
              <div>
                <span class="block px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Design</span>
                <a href="design-preview" class="block px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">Design Preview</a>
              </div>
            </div>
          `;
  if (desktopRe.test(out)) {
    out = out.replace(desktopRe, `$1${desktopGroups}$3`);
    touched = true;
  }

  const mobileRe = /(<a href="services" class="block px-6 py-3[^"]*"[^>]*>Services<\/a>)\s*<ul[^>]*>[\s\S]*?<\/ul>/;
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
            <li><span class="block px-6 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-ydg-cream/45">Design</span></li>
            <li><a href="design-preview"  class="block px-6 py-2 text-sm text-ydg-cream/70 hover:bg-white/5 hover:text-white transition-colors">Design Preview</a></li>
          </ul>`;
  if (mobileRe.test(out)) {
    out = out.replace(mobileRe, mobileSub);
    touched = true;
  }

  return touched ? out : null;
}

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let changed = 0;
for (const file of files) {
  const fp = path.join(ROOT, file);
  const html = fs.readFileSync(fp, 'utf8');
  const updated = file === 'index.html' ? updateIndex(html) : updateStandard(html);
  if (updated && updated !== html) {
    fs.writeFileSync(fp, updated, 'utf8');
    changed++;
  }
}
console.log(`Reordered ${changed} files (Design moved to end).`);
