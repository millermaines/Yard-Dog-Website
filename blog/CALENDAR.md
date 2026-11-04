# Yard Dog Blog: Content Calendar

**Cadence:** one post per week, published Saturdays.

This file is the source of truth for the blog schedule. Any Claude session
(desktop, VPS, or remote) working in this repo should:

1. Check the next unpublished row below.
2. Draft the post matching the structure of existing `blog-*.html` files.
3. Add a card to `blog.html` (newest first).
4. Add the URL to `sitemap.xml`.
5. Move the row to **Published** below with the actual ship date + filename.
6. Append the next topic in **Queue** so the calendar never empties.

A Thursday-afternoon cron pings Miller on Telegram if the upcoming Saturday's
slot hasn't been drafted yet (see `scripts/tools/yd-blog-due-reminder.ts`
in `/root/alienkind`).

## Publishing a post in the 2026 site design (read this first)

The site was rebuilt in October 2026. Posts now use the new design, and the live site deploys from
the `main` branch only. (Posts pushed to `feat/design-sync` in September never went live; they were
folded into the rebuild.) To publish:

1. Copy the newest `blog-*.html` in the repo root to `blog-<slug>.html`.
2. Replace the `<title>`, meta description, canonical/og URLs, the `<h1>`, the `<p class="lead">`,
   the `<time datetime>` + tag line, the hero `<figure class="afig">` (image in `img/blog/`, 1100px webp,
   real alt text and caption), the article body between `<!-- POST_BODY:START -->` and
   `<!-- POST_BODY:END -->`, the dark CTA (`<aside class="acta">`), the related service cards between
   `<!-- RELATED:START -->` and `<!-- RELATED:END -->`, and the BlogPosting JSON-LD.
3. Add a card at the top of the list between `<!-- BLOG_CARDS:START -->` and `<!-- BLOG_CARDS:END -->`
   in `blog.html` (or run `python3 _scripts/site/build.py`, which rebuilds blog.html and every page).
4. Run `node _scripts/gen-feeds.mjs`, add the URL to `sitemap.xml` (the build script does this too).
5. Commit and push to `main`.

Legal limit for every post: Yard Dog does not hold a TDA pesticide applicator license and does not
install irrigation. Explaining a pest or weed is fine; never say or imply we apply weed control,
pre-emergent, insecticide or fungicide, or install or repair irrigation.

---

## Queue (next up, top of list ships first)

**Status note (2026-11-04):** the blog fell 5 weeks behind after Sep 26. Five catch-up posts went out Nov 4 (the Oct 3, Oct 10 and Oct 24 queue rows were rewritten for November and published: winter color, ryegrass, last feeding). The rows below are the fresh November queue. Keep the Saturday cadence; see _scripts/site/BLOG_WEEKLY.md for the weekly steps.

| Plan Date | Slug | Working Title | Service Tag | Angle / Hook |
|---|---|---|---|---|
| 2026-11-07 | blog-christmas-lights-east-texas | When to Book Christmas Lights in East Texas (It Is Earlier Than You Think) | Christmas Lights | Why installs fill up by early December, what goes into a professional install (measure, custom-cut, clip to the roofline, take-down and storage), and what to decide before the first call |
| 2026-11-14 | blog-tree-pruning-windows-east-texas | The Best Months to Prune Trees in East Texas | Tree & Shrub Care | Why late winter before bud break is the window for most trees, what to prune now and what to wait on (crepe myrtles, oaks, spring bloomers), and why topping is never the answer |
| 2026-11-21 | blog-winter-lawn-care-east-texas | What a Dormant Lawn Still Needs in December | Lawn Maintenance | Mowing as it slows, keeping leaves off, deep watering in dry spells, and what to leave alone until spring |
| 2026-11-28 | blog-plan-spring-projects-east-texas | Book Spring Projects Now: Patios, Walkways, and Sod | Hardscape | Why winter is the planning season, how a site visit and quote work, and which projects are best built before spring |

---

## Published

| Ship Date | Filename | Title | Tag |
|---|---|---|---|
| 2026-11-04 | blog-last-fertilization-east-texas.html | Stop Feeding the Lawn Now: Why the Fertilizing Season Is Over | Fertilization |
| 2026-11-04 | blog-ryegrass-overseeding-east-texas.html | Should You Overseed With Ryegrass This Fall? Usually Not | Lawn Maintenance |
| 2026-11-04 | blog-winter-color-east-texas.html | Winter Color Still Goes In This Month: Pansies, Violas, and Dianthus in East Texas | Flower Bed Installation |
| 2026-11-04 | blog-first-freeze-prep-east-texas.html | The Week Before the First Freeze: What Actually Needs Doing | Tree & Shrub Care |
| 2026-11-04 | blog-fall-perennial-cutback-east-texas.html | What to Cut Back in Your Beds This Fall, and What to Leave Standing | Flower Bed Installation |
| 2026-09-26 | blog-fall-leaf-strategy-east-texas.html | Mulch the First Leaves, Rake the Last Ones | Leaf Removal |
| 2026-09-19 | blog-fall-preemergent-east-texas.html | The Fall Window That Decides How Many Winter Weeds You Fight in February | Lawn Maintenance |
| 2026-09-12 | blog-fall-mulch-top-dress-east-texas.html | Beds Need a Fall Top-Dress, Not a Full Mulch Reload | Mulch Installation |
| 2026-09-05 | blog-fall-planting-window-east-texas.html | Fall Beats Spring for Planting Trees and Shrubs in East Texas | Tree Planting |
| 2026-08-29 | blog-fall-webworms-east-texas.html | The Webbed Nests Taking Over East Texas Pecans in Late Summer | Tree & Shrub Care |
| 2026-08-22 | blog-fall-lawn-reset-east-texas.html | Late August Is When You Set Up Your Fall Lawn, Not September | Lawn Maintenance |
| 2026-08-15 | blog-grub-worms-east-texas.html | The Late-Summer Grub Damage That Peels Up Like Carpet | Lawn Maintenance |
| 2026-08-08 | blog-crepe-myrtle-crape-murder.html | Stop Topping Your Crepe Myrtles: The Case Against Crape Murder | Tree & Shrub Care |
| 2026-08-01 | blog-fall-armyworms-east-texas.html | Armyworms Can Strip an East Texas Lawn Overnight in Late Summer | Lawn Maintenance |
| 2026-07-25 | blog-chinch-bugs-st-augustine.html | Why St. Augustine Dies in the Sunniest Part of the Yard in Late Summer | Lawn Maintenance |
| 2026-07-18 | blog-drainage-french-drain-east-texas.html | When Your East Texas Yard Needs a French Drain (And When It Doesn't) | Drainage |
| 2026-07-11 | blog-summer-mowing-height.html | Why Mowing Shorter in Summer Backfires | Lawn Maintenance |
| 2026-07-04 | blog-flower-beds-that-survive-july.html | The Five Plants That Actually Survive a Longview July | Flower Bed Installation |
| 2026-06-27 | blog-brown-patch-vs-heat-stress.html | Brown Patch vs. Heat Stress: How to Tell the Difference (Before You Make It Worse) | Lawn Maintenance |
| 2026-06-20 | blog-summer-pruning-rules.html | What You Should and Shouldn't Prune in June | Hedge Trimming |
| 2026-06-10 | blog-landscape-fabric-under-mulch-east-texas.html | Why We Don't Put Landscape Fabric Under Mulch | Mulch Installation |
| 2026-06-06 | blog-irrigation-mistakes-east-texas.html | The Three Irrigation Mistakes That Cook East Texas Lawns | Lawn Maintenance |
| 2026-05-30 | blog-fire-ants-east-texas.html | Why Fire Ants Explode in May (and What Actually Kills the Mound) | Lawn Maintenance |
| 2026-05-23 | blog-bermuda-vs-st-augustine-east-texas.html | Bermuda vs. St. Augustine in East Texas: Which Fits Your Yard | Lawn Maintenance |
| 2026-05-16 | blog-mulch-depth-east-texas.html | How Much Mulch You Actually Need (It's Less Than You Think) | Mulch Installation |
| 2026-05-09 | blog-east-texas-spring-fertilization.html | The East Texas Fertilization Window Most Homeowners Miss | Fertilization |
| 2026-05-02 | blog-east-texas-summer-lawn.html | Why Your East Texas Lawn Looks Worse in July (And What Actually Helps) | Lawn Maintenance |

---

## Style notes (locked from the first three posts)

- **Voice:** first-person Miller. "I've worked on hundreds of yards out here." Direct, contrarian where there's a real reason, never preachy.
- **Structure:** lead paragraph → H2 sections as plain-language sentences with periods → short paragraphs, often single sentences → bold callout (`<strong>What to do instead:</strong>`) for actionable fixes → closing CTA paragraph that mentions specific service area towns.
- **Length:** 4–6 minute read (~700–1200 words). Long enough to be useful, short enough to finish on a phone.
- **No fluff:** no SEO-keyword stuffing, no generic landscaping advice that could be written from anywhere. Every post should contain something a Longview homeowner can't get from a Lowe's pamphlet.
- **Images:** one hero photo from `brand_photos/`, with a caption that ties it to real work.
- **Schema:** `BlogPosting` + `BreadcrumbList` JSON-LD in every post (copy from any existing post, swap content).
- **CTA section:** dark background, free-quote button + phone button. Match phrasing of the existing posts.

## Anchor topics by month (rough, adjust to weather and what's coming up)

- **May:** spring transition: fertilization, mulch, bed prep, mowing height.
- **June–August:** survival mode: drought, irrigation, brown patch, summer pruning, plant selection.
- **September–October:** fall reset: overseeding, leaf prep, last-feeding, mulch top-dress.
- **November–December:** off-season: Christmas lights (high-search months), tree pruning windows, contract planning.
- **January–February:** planning + design: what to install in spring, landscape design, hardscape projects.
- **March–April:** kickoff: first mow, pre-emergent, bed cleanup, sod install.
