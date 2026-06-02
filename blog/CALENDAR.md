# Yard Dog Blog — Content Calendar

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

---

## Queue (next up — top of list ships first)

| Plan Date | Slug | Working Title | Service Tag | Angle / Hook |
|---|---|---|---|---|
| 2026-06-06 | blog-irrigation-mistakes-east-texas | The Three Irrigation Mistakes That Cook East Texas Lawns | Lawn Maintenance | Wrong times, too-frequent cycles, broken heads nobody notices — and how to audit your own system |
| 2026-06-13 | blog-summer-pruning-rules | What You Should and Shouldn't Prune in June | Hedge Trimming | Crepe myrtles, hollies, hydrangeas — when summer cuts help and when they kill the bloom |
| 2026-06-20 | blog-brown-patch-vs-heat-stress | Brown Patch vs. Heat Stress: How to Tell the Difference (Before You Make It Worse) | Lawn Maintenance | Fungus rings vs. crisp edges, why watering more makes one worse, fungicide vs. patience |
| 2026-06-27 | blog-flower-beds-that-survive-july | The Five Plants That Actually Survive a Longview July | Flower Bed Installation | Lantana, vinca, salvia, plumbago, knockout roses — what we plant when clients want low-maintenance summer color |
| 2026-07-04 | blog-drainage-french-drain-east-texas | When Your East Texas Yard Needs a French Drain (And When It Doesn't) | Drainage | Standing-water diagnostics, cheaper grading alternatives, what a real drain install costs |

---

## Published

| Ship Date | Filename | Title | Tag |
|---|---|---|---|
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

## Anchor topics by month (rough — adjust to weather and what's coming up)

- **May:** spring transition — fertilization, mulch, bed prep, mowing height.
- **June–August:** survival mode — drought, irrigation, brown patch, summer pruning, plant selection.
- **September–October:** fall reset — overseeding, leaf prep, last-feeding, mulch top-dress.
- **November–December:** off-season — Christmas lights (high-search months), tree pruning windows, contract planning.
- **January–February:** planning + design — what to install in spring, landscape design, hardscape projects.
- **March–April:** kickoff — first mow, pre-emergent, bed cleanup, sod install.
