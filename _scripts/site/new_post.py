#!/usr/bin/env python3
"""Create a blog post in the 2026 design from a JSON spec, then run build.py + seo:upgrade + gen-feeds separately.

  python3 _scripts/site/new_post.py spec.json

spec.json keys: slug (blog-...), title, title_tag ("... | Yard Dog Landscapes"), meta (<=160 chars), date (YYYY-MM-DD),
tag (service name), read (minutes), lead, img_src (e.g. /img/work/full/<real-photo>.webp, a real Yard Dog photo),
img_alt, caption, body (HTML: <p>, <h2> sentences with periods, <strong>What to do:</strong> callouts, internal links as
href="/blog-..."), cta_h, cta_p, related [[service-slug, "Service name", "one-line blurb"], ...], crumb (short breadcrumb name).
The page is written to the repo root; the next `python3 _scripts/site/build.py` keeps it (read back from its markers).
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pages_blog as B
from datetime import date

spec = json.load(open(sys.argv[1]))
spec['related'] = [tuple(r) for r in spec['related']]
spec['date_h'] = date.fromisoformat(spec['date']).strftime('%B %-d, %Y')
B.POSTS[spec['slug']] = spec
B.ORDERED[:] = sorted(B.POSTS.values(), key=lambda p: (p['date'], p['slug']), reverse=True)
B.post_page(spec)
print('wrote', spec['slug'])
