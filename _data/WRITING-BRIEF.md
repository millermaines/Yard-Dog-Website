# Yard Dog Landscapes website rewrite: writer brief

You are writing page content (as JSON) for the rebuilt website of Yard Dog Landscapes,
https://www.yarddoglandscapes.com. The pages are generated from your JSON, so follow the schema exactly.
The goal is to rank #1 in Google (and AI answer engines) for local landscaping searches in East Texas
WITHOUT thin, spun, or doorway-style content. Every page must read like a local crew wrote it.

## Business facts you may use (do not invent others)
- Yard Dog Landscapes, family-owned, based in Longview, TX (Gregg County). Founded 2017. Owner: Miller Maines.
- Crew: Miller plus a crew of four. Same crew every visit. Work is never subcontracted.
- 5.0 stars on Google from 111 reviews. Fully insured. (Do NOT say "licensed".)
- Phone (903) 844-6877, info@yarddoglandscapes.com. Open 24 hours (call or text anytime).
- Free on-site walkthrough and written, itemized estimate, usually within 24 hours / within a day.
- Service area: Longview, White Oak, Kilgore, Gladewater, Hallsville, Marshall, Tyler, Henderson, Carthage,
  Nacogdoches, Gilmer, Big Sandy, Lake Cherokee, and surrounding East Texas (Gregg, Harrison, Smith, Rusk,
  Panola, Nacogdoches, Upshur counties).
- Services (14) and slugs: lawn-maintenance, leaf-removal, fertilization, hedge-trimming, tree-shrub-care,
  tree-planting, sod-installation, landscaping, flower-bed-installation, mulch-installation, hardscaping,
  retaining-walls, drainage, christmas-lights. Plus a paid Landscape Design Preview ($199 flower beds, $449
  hardscape, $999 full property; fee credited toward the install if booked within 90 days).
- Price ranges (from the site's pricing page, use these exact numbers only):
  weekly mowing about $50-$65 per visit; fertilization from about $190 per visit; hedge trimming most jobs
  $150-$800; mulch & bed refresh most beds $600-$2,400; landscaping & planting most projects $900-$3,600
  (refreshes start at a few hundred); sod installation most projects $1,500-$4,700 (priced by the pallet);
  drainage & French drains most projects $2,000-$3,750 (cost guide: small fixes $450-$1,000, standard single
  run $1,900-$3,000, full systems $3,000-$4,500, large $4,500+); patios & hardscaping most projects
  $3,100-$9,100; retaining walls most $3,000-$19,000 by height and length (short garden walls from a few
  thousand, tall structural walls $20,000+); Christmas lights: most homes start at $900; installs more than an
  hour from Longview start at $1,800. Leaf removal, tree planting, tree & shrub care: no published price,
  say it is quoted after a walkthrough.
- Christmas lights specifics: Yard Dog supplies the lights, custom-cuts professional C9 lines to the roofline,
  installs, takes down after the season and stores them; quotes are done remotely from a photo mock-up of
  the house; will travel 1 to 1.5 hours from Longview for installs; residential and commercial; warm white or
  color.
- Real recent projects (only mention in the town they happened in, and only these):
  Kilgore: flagstone walkway with chopped stone borders and path lighting (Sep 2026); checkerboard concrete
  paver patio with gravel joints off a covered porch (Apr 2026).
  White Oak: elevated boat & RV pad with pressure-treated timber wall, fill, drainage fabric and gravel
  (Sep 2026); 475 sq ft Cherokee flagstone patio with chopped stone edging around a chopped stone fire pit,
  one corner raised on a chopped stone wall (Aug 2026).
  Lake Cherokee (Longview): leaning block retaining wall along a driveway, rebuilt course by course on a
  compacted base with drainage fabric and pipe behind it (Jul 2026).

## Legal limits (hard rules)
- Yard Dog does NOT hold a Texas Department of Agriculture pesticide applicator license. Never offer or imply
  weed control, pre-emergent, post-emergent, herbicide, insecticide, fungicide, fire ant treatment, grub
  treatment, or any spraying/chemical pest or disease treatment. Fertilizer, aeration, soil testing, winterizer
  feeding, pruning, trimming and cultural advice are fine. Describing a pest so a homeowner can recognize it is
  fine; selling a treatment is not.
- No irrigation installation or repair offers (requires a licensed irrigator).
- No tree removal of large trees near structures, no stump grinding, no arborist claims, unless the existing
  page already offers it (tree-shrub-care page says pruning, trimming, removal of small trees/shrubs is fine;
  keep to what the existing page says).
- Never invent customer names, reviews, counts of jobs, years in a specific town, awards, certifications,
  warranties or guarantees that are not in the existing page.

## Voice and style (the owner hates "AI slop")
- Plain, direct, confident, local. Short sentences. Talk like a crew lead explaining it on the driveway.
- Use "we" for Yard Dog. Write for homeowners in East Texas.
- Banned words/phrases: nestled, vibrant, tapestry, boasts, oasis, elevate, transform your outdoor space,
  dream yard, curb appeal that pops, look no further, whether you're X or Y, in today's world, unlock,
  seamless, hassle-free, top-notch, second to none, we pride ourselves, one-stop shop, delve, testament,
  "it's not just X, it's Y", rich history, hidden gem, charming.
- Do not use em dashes or en dashes in prose. Use periods and commas. Hyphens in compound words are fine.
  For number ranges write "$600 to $2,400" in prose (the schema price fields may use the en dash format given).
- No exclamation marks. No emoji. No keyword stuffing: the town name and service name should appear
  naturally, not in every sentence.
- NO WEB ACCESS. Do not use WebSearch, WebFetch, curl, a browser, or any other network tool. Work only from
  the repo files and this brief. Facts about towns must be ones you are highly confident of (county, county
  seat status, very well-known landmarks, lakes, colleges, highways, general terrain, trees, soil). If you are
  not sure a fact is true, leave it out. Do not give minute counts for drive times; use direction and rough
  distance only ("a short drive southwest of Longview", "out past Tyler").

## Output
Write valid UTF-8 JSON (no comments, no trailing commas). Use straight quotes in JSON syntax; inside text,
use normal apostrophes. Validate each file by running: python3 -c "import json;json.load(open('FILE'))".
