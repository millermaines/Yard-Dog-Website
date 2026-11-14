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

---

## Queue (next up, top of list ships first)

| Plan Date | Slug | Working Title | Service Tag | Angle / Hook |
|---|---|---|---|---|
| 2026-10-03 | blog-fall-winter-color-east-texas | October Is the Planting Window for Winter Color in East Texas | Flower Bed Installation | Why pansies, violas, and snapdragons go in while the soil is still warm in October instead of after the first freeze, which cool-season annuals actually hold through a Longview winter and which ones melt in a hard one, why bed drainage matters more than plant choice in our clay, and the light feeding schedule that keeps them blooming into February instead of stalling out in December |
| 2026-10-10 | blog-ryegrass-overseeding-east-texas | Should You Overseed With Ryegrass This Fall? Usually Not | Lawn Maintenance | Why mid-October is the only window that works for ryegrass here (soil temperature falling through 70 degrees), the winter mowing and watering commitment nobody accounts for, why overseeding a dormant bermuda lawn delays and weakens its spring green-up, why St. Augustine should never be overseeded at all, and the two situations where winter color is genuinely worth it |
| 2026-10-17 | blog-fall-perennial-cutback-east-texas | What to Cut Back in Your Beds This Fall, and What to Leave Standing | Flower Bed Installation | Which perennials and ornamental grasses to cut back after the first frost in East Texas and which to leave standing until late February, why leaving seed heads and hollow stems helps overwinter beneficial insects, how cutting salvias and lantana too early invites freeze damage to the crown, and a simple fall bed cleanup order that pairs with a top-dress of mulch. |
| 2026-11-21 | blog-winter-maintenance-planning-east-texas | Late November Is When You Should Lock In Next Year's Maintenance Schedule | Lawn Maintenance | Why the winter lull is the right time to set next season's schedule instead of calling in April when every crew in Gregg County is already booked, which calendar items have hard East Texas deadlines that get missed when work is booked ad hoc (February pre-emergent, the April green-up feeding, the pre-summer mowing height change), how a planned year costs less than the same work bought reactively one emergency at a time, and what a walkthrough in December tells us about a property that a July visit never will. |
| 2026-11-28 | blog-late-leaf-drop-east-texas | Your Leaves Are Still Falling in December, and That Is Normal Here | Leaf Removal | Why East Texas leaf drop runs into December and January instead of ending with October, which of our trees hold their leaves longest (water oak, post oak, and the young hardwoods that keep brown leaves on the branch all winter), why a single November cleanup always gets followed by another blanket two weeks later, what matted wet leaves do to dormant turf and to beds over a wet winter, and how to time the last cleanup of the year so it actually stays clean until spring. |

---

## Published

| Ship Date | Filename | Title | Tag |
|---|---|---|---|
| 2026-11-14 | blog-dormant-pruning-window-east-texas.html | Winter Is When Tree Work Should Actually Happen Here | Tree & Shrub Care |
| 2026-11-07 | blog-christmas-lights-booking-east-texas.html | Why Christmas Light Installs Book Out Before Thanksgiving | Christmas Lights |
| 2026-10-31 | blog-first-freeze-prep-east-texas.html | The Week Before the First Freeze: What Actually Needs Doing | Tree & Shrub Care |
| 2026-10-24 | blog-last-fertilization-east-texas.html | The Last Feeding of the Year, and Why It Is Not Nitrogen | Fertilization |
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
