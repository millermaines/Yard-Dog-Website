"""Blog: parse every existing post (content stays the owner's words), rebuild in the new design.

New posts from the weekly publisher: keep using the structure of an existing blog-*.html (title, meta,
<time datetime>, tag, lead, hero <figure>, the article body, the dark CTA section and the related cards).
This module reads that structure, so a new post written that way is picked up on the next build.
"""
import glob, html as H, json, os, re
from datetime import date
from PIL import Image
from common import *  # noqa

SRC = os.path.join(ROOT, '_data', 'blog-src')   # original post HTML, kept as the source of truth

# Lines in older posts that read as offering services we don't provide (pesticide / irrigation work).
FIXES = {
    'blog-east-texas-spring-fertilization': [('spring slow-release with pre-emergent for crabgrass', 'spring slow-release feeding')],
    'blog-mulch-depth-east-texas': [("""            <li><strong>Pre-emergent (optional).</strong> If you're fighting heavy weed pressure, a granular pre-emergent under the mulch buys you another two months of clean beds.</li>\n""", '')],
    'blog-irrigation-mistakes-east-texas': [('and when a yard needs a system repaired, rerouted, or installed from scratch, we handle that too.',
                                             'and when a system needs repair or a reroute, we tell you exactly what we found so your irrigation tech can fix it fast.')],
}

def txt(s):
    return H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s))).strip()

def parse(path):
    s = open(path).read()
    slug = os.path.basename(path)[:-5]
    title = txt(re.search(r'(?s)<h1[^>]*>(.*?)</h1>', s).group(1))
    meta = H.unescape(re.search(r'name="description" content="([^"]*)"', s).group(1))
    ttag = H.unescape(re.search(r'<title>([^<]*)', s).group(1)).strip()
    dt = re.search(r'<time datetime="([\d-]+)"', s).group(1)
    tag = txt(re.search(r'(?s)class="blog-post-tag">(.*?)</span>', s).group(1))
    rt = re.search(r'(\d+) min read', s)
    lead = re.search(r'(?s)<p class="lead">(.*?)</p>', s)
    fig = re.search(r'(?s)<figure class="blog-post-figure">\s*<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>\s*<figcaption>(.*?)</figcaption>', s)
    body = re.search(r'(?s)<div class="blog-post-body">\s*<div class="container container--narrow">(.*?)<hr class="blog-post-divider">', s)
    if not body:
        body = re.search(r'(?s)<div class="blog-post-body">\s*<div class="container container--narrow">(.*?)<div class="blog-post-author">', s)
    ctah = re.search(r'(?s)<div class="container cta-banner">\s*<h2>(.*?)</h2>\s*<p>(.*?)</p>', s)
    rel = re.findall(r'(?s)<a class="related-card" href="([^"]+)">\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>', s)
    crumbname = re.findall(r'(?s)<p class="breadcrumb">.*?</span>([^<]*)</p>', s)
    b = body.group(1).strip()
    for a, z in FIXES.get(slug, []):
        b = b.replace(a, z)
    return dict(slug=slug, title=title, title_tag=ttag, meta=meta, date=dt, tag=tag, read=int(rt.group(1)) if rt else 5,
                lead=txt(lead.group(1)) if lead else '', img_src=fig.group(1) if fig else '', img_alt=H.unescape(fig.group(2)) if fig else '',
                caption=txt(fig.group(3)) if fig else '', body=b,
                cta_h=txt(ctah.group(1)) if ctah else 'Want us to take a look?', cta_p=txt(ctah.group(2)) if ctah else '',
                related=[(r[0].strip('/'), txt(r[1]), txt(r[2])) for r in rel],
                crumb=crumbname[0].strip() if crumbname else title,
                date_h=date.fromisoformat(dt).strftime('%B %-d, %Y'))

def parse_new(path):
    """A post already in the new design (e.g. written by the weekly publisher): read it back from its markers."""
    s = open(path).read()
    slug = os.path.basename(path)[:-5]
    g = lambda pat, d='': (re.search(pat, s, re.S).group(1) if re.search(pat, s, re.S) else d)
    dt = g(r'<time datetime="([\d-]+)"')
    rel = re.findall(r'(?s)<a class="stile" href="/([^"]+)"><h3>(.*?)</h3><p>(.*?)</p></a>', g(r'<!-- RELATED:START -->(.*?)<!-- RELATED:END -->'))
    fig = re.search(r'(?s)<figure class="afig"><img src="([^"]+)"[^>]*alt="([^"]*)"[^>]*><figcaption>(.*?)</figcaption>', s)
    return dict(slug=slug, title=txt(g(r'<h1>(.*?)</h1>')), title_tag=H.unescape(g(r'<title>([^<]*)')).strip(),
                meta=H.unescape(g(r'name="description" content="([^"]*)"')), date=dt, tag=txt(g(r'<p class="bmeta"[^>]*><b>(.*?)</b>')),
                read=int(g(r'(\d+) min read', '5')), lead=txt(g(r'<p class="lead">(.*?)</p>')),
                img_src=fig.group(1) if fig else '', img_alt=H.unescape(fig.group(2)) if fig else '', caption=txt(fig.group(3)) if fig else '',
                body=g(r'<!-- POST_BODY:START -->(.*?)<!-- POST_BODY:END -->').strip(),
                cta_h=txt(g(r'<aside class="acta"><div><h2>(.*?)</h2>')), cta_p=txt(g(r'<aside class="acta"><div><h2>.*?</h2><p>(.*?)</p>')),
                related=[(r[0], txt(r[1]), txt(r[2])) for r in rel], crumb=txt(g(r'<span aria-current="page">(.*?)</span>')),
                date_h=date.fromisoformat(dt).strftime('%B %-d, %Y'))

POSTS = {}
for f in sorted(glob.glob(os.path.join(SRC, 'blog-*.html'))):
    p = parse(f)
    POSTS[p['slug']] = p
for f in sorted(glob.glob(os.path.join(ROOT, 'blog-*.html'))):
    slug = os.path.basename(f)[:-5]
    if slug not in POSTS and '<!-- POST_BODY:START -->' in open(f).read():
        POSTS[slug] = parse_new(f)
ORDERED = sorted(POSTS.values(), key=lambda p: p['date'], reverse=True)

def hero_img(p):
    """web-size copy of the post's hero photo"""
    out = f'/img/blog/{p["slug"]}.webp'
    dst = os.path.join(ROOT, out.lstrip('/'))
    src = os.path.join(ROOT, p['img_src'].lstrip('/'))
    if not os.path.exists(dst) and os.path.exists(src):
        im = Image.open(src).convert('RGB'); im.thumbnail((1100, 1100)); im.save(dst, 'WEBP', quality=72, method=6)
    if not os.path.exists(dst):  # a new-format post that already points at its own web image
        out = p['img_src']; dst = os.path.join(ROOT, out.lstrip('/'))
    w, h = Image.open(dst).size
    return out, w, h

def clean_body(b):
    # internal links: keep clean URLs, make them root-relative
    b = re.sub(r'href="(?!https?:|tel:|mailto:|#|/)([a-z0-9-]+)"', r'href="/\1"', b)
    b = re.sub(r'\s*class="[^"]*"', '', b) if False else b
    return b

def post_page(p):
    url = BASE + '/' + p['slug']
    src, w, h = hero_img(p)
    rel = ''.join(f'<a class="stile" href="/{r[0]}"><h3>{e(r[1])}</h3><p>{e(r[2])}</p></a>' for r in p['related'])
    more = [q for q in ORDERED if q['slug'] != p['slug']][:3]
    morehtml = ''.join(
        f'<a class="bc" href="/{q["slug"]}"><img src="{hero_img(q)[0]}" width="{hero_img(q)[1]}" height="{hero_img(q)[2]}" alt="{e(q["img_alt"])}" loading="lazy" decoding="async">'
        f'<span class="bmeta"><b>{e(q["tag"])}</b> &middot; {e(q["date_h"])}</span><h3>{e(q["title"])}</h3></a>' for q in more)
    body = (crumb([('Blog', 'blog'), (p['crumb'], p['slug'])]) +
            f'<article><header class="w"><div class="art ah"><p class="bmeta" style="margin:0"><b>{e(p["tag"])}</b> &middot; <time datetime="{p["date"]}">{e(p["date_h"])}</time> &middot; {p["read"]} min read</p>'
            f'<h1>{e(p["title"])}</h1>' + (f'<p class="lead">{e(p["lead"])}</p>' if p['lead'] else '') +
            f'<div class="by"><img src="/img/miller-maines-owner-yard-dog-truck.webp" width="1000" height="1333" alt="" aria-hidden="true"><div><b>Miller Maines</b><span>Owner, Yard Dog Landscapes</span></div></div></div></header>'
            f'<figure class="afig"><img src="{src}" width="{w}" height="{h}" alt="{e(p["img_alt"])}" fetchpriority="high"><figcaption>{e(p["caption"])}</figcaption></figure>'
            f'<div class="w"><div class="art prose" style="padding-top:28px"><!-- POST_BODY:START -->\n{clean_body(p["body"])}\n<!-- POST_BODY:END -->'
            f'<div class="author"><img src="/img/miller-maines-owner-yard-dog-truck.webp" width="1000" height="1333" alt="Miller Maines" loading="lazy"><p><b>Miller Maines</b> owns Yard Dog Landscapes in Longview, TX. He has worked East Texas yards since 2017 and still walks every property himself. {PHONE}.</p></div>'
            f'<aside class="acta"><div><h2>{e(p["cta_h"])}</h2><p>{e(p["cta_p"])}</p></div><a class="btn" href="/contact">Get a free quote</a></aside></div></div></article>')
    if rel:
        body += f'<section class="sec stone" style="margin-top:72px"><div class="w"><h2 class="h2">Services we mentioned in this post</h2><div class="stiles" style="margin-top:28px"><!-- RELATED:START -->{rel}<!-- RELATED:END --></div></div></section>'
    body += f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">More from the blog</h2></div><a class="more" href="/blog">All posts</a></div><div class="bgrid">{morehtml}</div></div></section>'
    ld = [{'@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article', 'mainEntityOfPage': url, 'headline': p['title'],
           'description': p['meta'], 'image': abs_url(src), 'datePublished': p['date'], 'dateModified': p['date'], 'inLanguage': 'en-US',
           'articleSection': p['tag'], 'author': {'@type': 'Person', '@id': BASE + '/#miller', 'name': 'Miller Maines', 'jobTitle': 'Owner, Yard Dog Landscapes', 'url': BASE + '/about'},
           'publisher': {'@id': BIZ_ID}, 'about': {'@id': BIZ_ID}},
          crumbs_ld([('Blog', 'blog'), (p['crumb'], p['slug'])]), business_node()]
    page(p['slug'], p['title_tag'], p['meta'], body, ld, og_img=src, og_type='article')

def index_page():
    f = ORDERED[0]
    fs, fw, fh = hero_img(f)
    feat = (f'<a class="feat" href="/{f["slug"]}"><img src="{fs}" width="{fw}" height="{fh}" alt="{e(f["img_alt"])}" fetchpriority="high">'
            f'<div><span class="bmeta" style="margin:0"><b>{e(f["tag"])}</b> &middot; {e(f["date_h"])}</span><h2>{e(f["title"])}</h2><p>{e(f["meta"])}</p>'
            f'<p style="margin-top:20px"><span class="more">Read the post</span></p></div></a>')
    cards = ''.join(
        f'<a class="bc" href="/{q["slug"]}"><img src="{hero_img(q)[0]}" width="{hero_img(q)[1]}" height="{hero_img(q)[2]}" alt="{e(q["img_alt"])}" loading="lazy" decoding="async">'
        f'<span class="bmeta"><b>{e(q["tag"])}</b> &middot; {e(q["date_h"])}</span><h3>{e(q["title"])}</h3><p>{e(q["meta"])}</p></a>'
        for q in ORDERED[1:])
    body = (crumb([('Blog', 'blog')]) +
            f'<section class="hero blur solo" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><div><h1>Notes from the yard</h1>'
            f'<p class="lede">Lawn, landscape and yard advice from the East Texas crew that works the dirt every day. A new post every Saturday, written for Longview yards.</p></div></div>{GRAIN}{swoosh()}</section>'
            f'<section class="sec" style="padding-top:40px"><div class="w">{feat}<!-- BLOG_CARDS:START --><div class="bgrid">{cards}</div><!-- BLOG_CARDS:END --></div></section>'
            + cta('Rather we just handle it?', 'Weekly lawn care, fertilization, beds and cleanups across Longview and East Texas. Free written quote within a day.'))
    ld = [{'@context': 'https://schema.org', '@type': 'Blog', '@id': BASE + '/blog#blog', 'url': BASE + '/blog', 'name': 'Yard Dog Landscapes Blog',
           'description': 'Lawn care and landscaping advice for East Texas homeowners from the crew at Yard Dog Landscapes.', 'publisher': {'@id': BIZ_ID},
           'inLanguage': 'en-US', 'blogPost': [{'@type': 'BlogPosting', 'headline': q['title'], 'url': BASE + '/' + q['slug'], 'datePublished': q['date']} for q in ORDERED]},
          crumbs_ld([('Blog', 'blog')]), business_node()]
    page('blog', 'Lawn Care & Landscaping Blog for East Texas | Yard Dog Landscapes',
         'Practical lawn care, landscaping and yard advice for Longview and East Texas homeowners, from the crew at Yard Dog Landscapes. New posts every Saturday.', body, ld, og_img=fs)

def build():
    for p in ORDERED:
        post_page(p)
    index_page()
