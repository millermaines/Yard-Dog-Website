# Weekly blog post (Saturdays)

Miller asked on 2026-11-04 to keep the blog going (it had stalled after Sep 26). A scheduled task runs this every Saturday
morning. Publishing is automatic, no approval step.

1. Repo: `millermaines/Yard-Dog-Website` at `/home/claude/yard-dog-website` (`add_repo`, access push, if missing). `git checkout main && git pull`.
   Read `CLAUDE.md` and `blog/CALENDAR.md` (style notes, legal limits, anchor topics by month). Never run the obsolete generators.
2. If a post is already dated today in `blog/CALENDAR.md` Published (or a `blog-*.html` has `<time datetime="today">`), stop.
3. Pick the next row in the CALENDAR queue that still fits the season. If the queue is empty or stale, write a new topic from the
   month's anchor list (November-December: tree pruning windows, winter lawn care, Christmas lights, planning projects; January-February:
   design and hardscape planning; etc.) and add it to the calendar. Don't repeat a published topic. Check recent project pages in
   `_data/projects.json` for real jobs a post can mention (town only, never customer names).
4. Write 700 to 1100 words in Miller's first-person voice per the style notes: lead, H2 sections written as sentences with periods,
   short paragraphs, bold "What to do:" callouts, closing CTA naming service-area towns. Only advice you are confident is accurate for
   East Texas. No invented customer stories, numbers, prices or claims. Legal limit: no weed-control, pre-emergent, insecticide or
   fungicide application services (explaining a pest is fine). Irrigation: Yard Dog installs it under a Texas Licensed Irrigator
   (LI0006657), so you may say so, but keep posts to advice. Link 2 to 3 earlier posts and the matching service pages.
5. Hero photo: a real Yard Dog photo from `img/work/full/` that matches the topic (see `_data/photos.json`, tag list). Never an AI image or a
   design rendering. Write real alt text and a caption.
6. Put the post in a JSON spec (fields documented at the top of `_scripts/site/new_post.py`) and run:
   `python3 _scripts/site/new_post.py spec.json && python3 _scripts/site/build.py && npm run seo:upgrade && node _scripts/gen-feeds.mjs`
7. Check: serve the folder (`node serve.mjs`, localhost:3000), screenshot the post and `/blog` at 1440 px and 390 px (Playwright),
   confirm no horizontal scroll, no broken images, JSON-LD parses. Fix and rebuild until clean.
8. Move the row to Published in `blog/CALENDAR.md`, keep the queue 3+ rows deep, commit "Blog: <title>" and push to `main`. Confirm
   `https://www.yarddoglandscapes.com/<slug>` returns 200 after the Vercel deploy.
9. Report in one or two lines with SendUserMessage: title and link.

If a step fails twice, stop and report instead of looping.
