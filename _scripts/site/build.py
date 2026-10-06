"""Build the whole Yard Dog site.

    python3 _scripts/site/build.py          # pages, stylesheet, sitemap
    npm run seo:upgrade                      # then the canonical schema / llms / robots pass

Content lives in _data/ (services, towns, photos, business). Original page and post HTML used as
source for the blog and a few hand-written pages is kept in _data/blog-src and _data/page-src.
"""
import os, re, sys, json
from datetime import date
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *  # noqa
import pages_blog, pages_local, pages_core

def css():
    here = os.path.dirname(os.path.abspath(__file__))
    out = open(os.path.join(here, 'site.base.css')).read() + open(os.path.join(here, 'site.add.css')).read()
    out = re.sub(r'url\(img/', 'url(/img/', out)
    open(os.path.join(ROOT, 'site.css'), 'w').write(out)

def sitemap():
    pages = []
    for f in sorted(os.listdir(ROOT)):
        if not f.endswith('.html') or f in ('404.html', 'redesign-roadmap.html'):
            continue
        s = open(os.path.join(ROOT, f)).read()
        if 'noindex' in (re.search(r'<meta name="robots" content="([^"]*)"', s) or [None, ''])[1]:
            continue
        slug = f[:-5]
        loc = BASE + '/' if slug == 'index' else BASE + '/' + slug
        imgs = re.findall(r'<img src="(/img/[^"]+)"', s)
        bg = re.findall(r'--bg:url\((/img/[^)]+)\)', s)
        imgs = list(dict.fromkeys(bg + imgs))
        if slug == 'our-work':
            imgs = list(dict.fromkeys(bg + ['/img/work/full/' + p['file'] for p in PHOTOS]))
        imgs = [i for i in imgs if not i.startswith('/img/lockup')][:200]
        lastmod = TODAY
        m = re.search(r'"dateModified": "([\d-]+)"', s)
        if slug.startswith('blog-') and m:
            lastmod = max(m.group(1), '2026-10-05') if False else m.group(1)
        prio = '1.0' if slug == 'index' else ('0.9' if slug in SERVICES or slug in ('our-work', 'contact', 'services', 'longview-tx') else
                ('0.8' if slug in TOWNS or slug in ('pricing', 'about', 'design-preview') else ('0.7' if any(slug.startswith(x + '-') for x in SERVICES) else '0.6')))
        pages.append((loc, lastmod, prio, imgs, slug))
    x = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">']
    vids = [('hype-a', 'Flagstone walkway build in Kilgore, TX', 'Crew compacting base, mixing mortar and setting chopped stone borders for a flagstone walkway in Kilgore, TX.'),
            ('hype-b', 'Boat and RV pad dirt work in White Oak, TX', 'Track loader hauling fill, fabric and gravel for a raised boat and RV pad in White Oak, TX.'),
            ('hype-c', 'Weekly lawn maintenance route', 'Mowing, edging, trimming and blow-off on a weekly lawn care route in the Longview area.')]
    for loc, lastmod, prio, imgs, slug in sorted(pages, key=lambda p: (-float(p[2]), p[0])):
        x.append(f'<url><loc>{loc}</loc><lastmod>{lastmod}</lastmod><priority>{prio}</priority>')
        for i in imgs:
            x.append(f'<image:image><image:loc>{BASE}{i}</image:loc></image:image>')
        if slug == 'our-work':
            for v, t, d in vids:
                x.append(f'<video:video><video:thumbnail_loc>{BASE}/media/{v}.jpg</video:thumbnail_loc><video:title>{e(t)}</video:title>'
                         f'<video:description>{e(d)}</video:description><video:content_loc>{BASE}/media/{v}.mp4</video:content_loc>'
                         f'<video:duration>9</video:duration><video:family_friendly>yes</video:family_friendly></video:video>')
        x.append('</url>')
    x.append('</urlset>')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('\n'.join(x) + '\n')
    return len(pages)

if __name__ == '__main__':
    css()
    pages_blog.build()
    pages_local.build()
    pages_core.build()
    n = sitemap()
    print('built; sitemap urls:', n)
