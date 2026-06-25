// gen-feeds.mjs — generate RSS (feed.xml) + JSON Feed (feed.json) for the blog.
//
// Why: LLMs / AI-search crawlers (Google AI, Copilot, GPT) can ingest a single
// feed instead of crawling every blog-*.html page. Keeps Yard Dog maximally
// findable for AEO/GEO. Run after publishing a post (wired into
// yd-blog-autopublish.ts) or by hand: `node _scripts/gen-feeds.mjs`.
//
// Static, dependency-free. Scans blog-*.html in the repo root, reads each
// post's <title>, description, canonical URL, and published date, and writes
// feed.xml + feed.json to the repo root (served at /feed.xml and /feed.json).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.yarddoglandscapes.com';
const FEED_TITLE = 'Yard Dog Landscapes Blog';
const FEED_DESC =
  'Practical lawn care, landscaping, and yard advice from the crew at Yard Dog Landscapes, written for East Texas homeowners.';

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : '';
};

function xmlEscape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const posts = readdirSync(ROOT)
  .filter((f) => /^blog-.*\.html$/.test(f))
  .map((f) => {
    const html = readFileSync(path.join(ROOT, f), 'utf8');
    const rawTitle = pick(html, /<title>([\s\S]*?)<\/title>/);
    const title = rawTitle.replace(/\s*\|\s*Yard Dog Landscapes.*$/i, '').trim();
    const description = pick(html, /<meta\s+name="description"\s+content="([\s\S]*?)">/i);
    const url =
      pick(html, /<link\s+rel="canonical"\s+href="([\s\S]*?)"/i) ||
      `${SITE}/${f.replace(/\.html$/, '')}`;
    const published =
      pick(html, /<meta\s+property="article:published_time"\s+content="([\s\S]*?)">/i) ||
      pick(html, /"datePublished":\s*"([\s\S]*?)"/i);
    return { file: f, title, description, url, published };
  })
  .filter((p) => p.title && p.url)
  .sort((a, b) => new Date(b.published) - new Date(a.published));

const now = new Date();

// ---- RSS 2.0 ----
const rssItems = posts
  .map((p) => {
    const pub = p.published ? new Date(p.published).toUTCString() : now.toUTCString();
    return [
      '    <item>',
      `      <title>${xmlEscape(p.title)}</title>`,
      `      <link>${xmlEscape(p.url)}</link>`,
      `      <guid isPermaLink="true">${xmlEscape(p.url)}</guid>`,
      `      <pubDate>${pub}</pubDate>`,
      `      <description>${xmlEscape(p.description)}</description>`,
      '    </item>',
    ].join('\n');
  })
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(FEED_TITLE)}</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${xmlEscape(FEED_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;

// ---- JSON Feed 1.1 ----
const jsonFeed = {
  version: 'https://jsonfeed.org/version/1.1',
  title: FEED_TITLE,
  home_page_url: `${SITE}/blog`,
  feed_url: `${SITE}/feed.json`,
  description: FEED_DESC,
  language: 'en-US',
  items: posts.map((p) => ({
    id: p.url,
    url: p.url,
    title: p.title,
    summary: p.description,
    ...(p.published ? { date_published: new Date(p.published).toISOString() } : {}),
  })),
};

writeFileSync(path.join(ROOT, 'feed.xml'), rss);
writeFileSync(path.join(ROOT, 'feed.json'), JSON.stringify(jsonFeed, null, 2) + '\n');
console.log(`gen-feeds: wrote feed.xml + feed.json (${posts.length} posts)`);
