/**
 * CLAUDE_CODE_PROMPT.js — Yard Dog Landscapes 2026 redesign rollout
 *
 * HOW TO USE
 *   1. Unzip design_handoff_yard_dog_redesign/ into the root of your Yard-Dog-Website checkout.
 *   2. Open a logged-in Claude Code terminal in that repo.
 *   3. Paste everything between the PROMPT START / PROMPT END lines below.
 *
 * Or print it:  node design_handoff_yard_dog_redesign/CLAUDE_CODE_PROMPT.js | pbcopy
 */

const PROMPT = `
/* ===================== PROMPT START ===================== */

I've approved a redesign of yarddoglandscapes.com and have a handoff package ready.
Repo: millermaines/Yard-Dog-Website (static HTML, deployed on Vercel from main).
The package is the folder \`design_handoff_yard_dog_redesign/\` at the repo root.

Do the following, in order, without asking me questions unless something is blocking:

1. READ \`design_handoff_yard_dog_redesign/README.md\` first. It explains the package, the design rules, and what the script does.

2. BRANCH: create \`redesign-2026\` from main.

3. APPLY: run \`node design_handoff_yard_dog_redesign/apply-redesign.mjs --dry\`, review the output, then run it for real (no flag).
   It installs redesign.css, replaces the 8 rebuilt pages (index, about, our-work, services, hardscaping, pricing, blog, contact) while preserving each live page's <title>, meta, canonical, og:*, and JSON-LD, and rolls the new header / footer / CTA / photo hero across every other .html page.

4. CONTRAST CHECK (required): serve the site locally (npx serve .) and, with Playwright, for EVERY .html page in the repo root walk all visible text nodes and flag any where the text color vs. the nearest opaque ancestor background has a relative-luminance difference below 0.3 (skip elements inside a section that contains an absolutely-positioned photo <img>). Print failures per page. Expected: none. Fix any in redesign.css, not in individual pages.

5. SANITY: \`git diff --stat\`. Confirm no page lost its <title>, canonical, or ld+json (\`git diff -- '*.html' | grep '^-.*ld+json'\` should be empty). Open index.html, contact.html, landscaping.html, hardscaping-tyler-tx.html and one blog post; confirm the new header/footer/hero render, the Platy form (id k10wty88jnyk6dfl2jsmve) loads on / and /contact, and the nav dropdown + hamburger work.

6. MOBILE PASS (required): with Playwright device emulation at 390x844 (iPhone) and 768x1024 (iPad), on EVERY .html page — script it, don't sample. Assert per page: document.documentElement.scrollWidth <= window.innerWidth; no element wider than the viewport; headline text doesn't clip; .btn and nav links >= 44px tall; hamburger opens the nav and every top-level link is reachable; Platy iframe visible on / and /contact. Save a screenshot per page to qa/mobile/<page>.png and print failures. Fix in redesign.css (global); touch a page's markup only if the issue is unique to that page. Re-run until clean.

7. HERO PHOTOS: if a sub-page hero picked a bad photo, override with an inline background-image on its .page-hero. Don't touch copy, URLs, or SEO markup anywhere.

8. SHIP: commit as "Redesign 2026: new header/footer/heroes, rebuilt core pages, redesign.css, mobile + contrast QA", push, open a PR against main, and paste me the Vercel preview URL. Do NOT merge — I'll review the preview first.

/* ====================== PROMPT END ====================== */
`;

module.exports = { PROMPT };
if (require.main === module) process.stdout.write(PROMPT.trim() + '\n');
