"""Shared pieces for the Yard Dog site generator: data loading, links, images, page shell, schema."""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, '_data')
BASE = 'https://www.yarddoglandscapes.com'
BIZ_ID = BASE + '/#business'
PHONE_TEL = '+19038446877'
PHONE = '(903) 844-6877'
EMAIL = 'info@yarddoglandscapes.com'
GA_ID = 'G-3WN8YFJRKC'
GBP = 'https://www.google.com/maps?cid=3450977957239277557'
TODAY = '2026-10-05'
# Google review count, as shown on the Business Profile. Update here only: data files use {{REVIEWS}},
# templates use {REVIEW_COUNT}, and both are filled in at build time.
REVIEW_COUNT = '143'
e = html.escape

# ---------------------------------------------------------------- data
def _read(path):
    return json.loads(open(path).read().replace('{{REVIEWS}}', REVIEW_COUNT))

def load(name):
    return _read(os.path.join(DATA, name))

def load_dir(sub):
    d = os.path.join(DATA, sub)
    return {f[:-5]: _read(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.endswith('.json')}

PHOTOS = load('photos.json')
BYKEY = {p['key']: p for p in PHOTOS}
SERVICES = load_dir('services')
TOWNS = load_dir('towns')

# Display order
SERVICE_ORDER = ['lawn-maintenance', 'leaf-removal', 'fertilization', 'hedge-trimming', 'tree-shrub-care', 'tree-planting',
                 'landscaping', 'flower-bed-installation', 'mulch-installation', 'sod-installation',
                 'irrigation', 'hardscaping', 'retaining-walls', 'drainage', 'christmas-lights']
GROUPS = [('Maintenance', ['lawn-maintenance', 'leaf-removal', 'fertilization', 'hedge-trimming', 'tree-shrub-care']),
          ('Installation', ['landscaping', 'flower-bed-installation', 'mulch-installation', 'sod-installation', 'tree-planting', 'irrigation']),
          ('Hardscape & specialty', ['hardscaping', 'retaining-walls', 'drainage', 'christmas-lights'])]
TOWN_ORDER = ['longview-tx', 'white-oak-tx', 'kilgore-tx', 'lake-cherokee-tx', 'gladewater-tx', 'hallsville-tx', 'marshall-tx',
              'tyler-tx', 'henderson-tx', 'gilmer-tx', 'big-sandy-tx', 'carthage-tx', 'nacogdoches-tx']
# Town centers (public reference coordinates, rounded)
GEO = {'longview-tx': (32.5007, -94.7405), 'white-oak-tx': (32.5385, -94.8616), 'kilgore-tx': (32.3863, -94.8758),
       'lake-cherokee-tx': (32.3700, -94.6300), 'gladewater-tx': (32.5365, -94.9427), 'hallsville-tx': (32.5043, -94.5741),
       'marshall-tx': (32.5449, -94.3674), 'tyler-tx': (32.3513, -95.3011), 'henderson-tx': (32.1532, -94.7994),
       'gilmer-tx': (32.7287, -94.9424), 'big-sandy-tx': (32.5835, -95.1086), 'carthage-tx': (32.1574, -94.3374),
       'nacogdoches-tx': (31.6035, -94.6555)}

SHORT = {  # short service names for chips and nav
    'lawn-maintenance': 'Lawn maintenance', 'leaf-removal': 'Leaf removal', 'fertilization': 'Fertilization',
    'hedge-trimming': 'Hedge trimming', 'tree-shrub-care': 'Tree & shrub care', 'tree-planting': 'Tree planting',
    'landscaping': 'Landscaping', 'flower-bed-installation': 'Flower beds', 'mulch-installation': 'Mulch',
    'sod-installation': 'Sod installation', 'hardscaping': 'Patios & hardscaping', 'retaining-walls': 'Retaining walls',
    'drainage': 'Drainage & grading', 'irrigation': 'Irrigation & sprinklers', 'christmas-lights': 'Christmas lights'}

# Hero photo per service (None = honest typographic hero; there is no real photo of that work yet)
SERVICE_HERO = {
    'lawn-maintenance': 'd:crew-dsc04063', 'leaf-removal': 'd:crew-dsc04179', 'fertilization': 'X:healthy-striped-bermuda-lawn-east-texas.webp',
    'hedge-trimming': 'front-roses-after', 'tree-shrub-care': 'side-hydrangeas-after', 'tree-planting': None,
    'landscaping': 'img-3738', 'flower-bed-installation': '1', 'mulch-installation': 'back-fence-after',
    'sod-installation': None, 'hardscaping': 'd:walk-dsc03930', 'retaining-walls': 'driveway-retaining-wall-after',
    'drainage': 'img-3736', 'irrigation': None, 'christmas-lights': 'X:christmas-lights-roofline-aerial-east-texas.webp'}
EXTRAS = {  # photos outside the work gallery
    'X:healthy-striped-bermuda-lawn-east-texas.webp': dict(file='/img/extra/healthy-striped-bermuda-lawn-east-texas.webp', w=640, h=1011,
        caption='A thick, evenly fed bermuda lawn on one of our routes', alt='Thick striped bermuda lawn in East Texas', services=['fertilization']),
    'X:christmas-lights-roofline-aerial-east-texas.webp': dict(file='/img/extra/christmas-lights-roofline-aerial-east-texas.webp', w=1520, h=1011,
        caption='Warm white C9 lights custom-cut to every ridge and peak', alt='Aerial view at night of an East Texas home with warm white Christmas lights outlining the roofline', services=['christmas-lights']),
}

# ---------------------------------------------------------------- links
def href(slug):
    return '/' if slug in ('', 'index') else '/' + slug

def a(slug, text, cls=''):
    c = f' class="{cls}"' if cls else ''
    return f'<a href="{href(slug)}"{c}>{text}</a>'

# ---------------------------------------------------------------- images
def photo(key):
    if key in EXTRAS:
        x = EXTRAS[key]
        return dict(key=key, src=x['file'], full=x['file'], w=x['w'], h=x['h'], alt=x['alt'], caption=x['caption'], place='', job='', town=None, kind='finished')
    p = BYKEY[key]
    return dict(key=key, src='/img/work/grid/' + p['file'], full='/img/work/full/' + p['file'], w=p['gw'], h=p['gh'],
                alt=p['alt'], caption=p['caption'], place=p['place'], job=p['job'], town=p['town'], kind=p['kind'])

def img(key, cls='', lazy=True, full=False, sizes=None):
    p = photo(key)
    src = p['full'] if full else p['src']
    attrs = f' loading="lazy"' if lazy else ' fetchpriority="high"'
    c = f' class="{cls}"' if cls else ''
    return f'<img src="{src}" width="{p["w"]}" height="{p["h"]}" alt="{e(p["alt"])}"{attrs} decoding="async"{c}>'

def hero_ok(key):
    """Only photos with enough pixels to stay sharp in the hero frame (video stills are too small)."""
    return key in EXTRAS or (key in BYKEY and min(BYKEY[key]['w'], BYKEY[key]['h']) >= 900)

def hero_fig(key=None, src=None, w=None, h=None, alt='', cap=''):
    """The hero photo, shown crisp in its own frame beside the headline (never stretched across the screen)."""
    srcset = ''
    if key:
        p = photo(key)
        src, w, h, alt = p['full'], p['w'], p['h'], p['alt']
        cap = cap or (p['caption'] + (', ' + p['place'] if p['place'] and p['place'] != 'East Texas' else ''))
        if key in BYKEY and BYKEY[key]['gw'] < w:
            srcset = (f' srcset="{p["src"]} {BYKEY[key]["gw"]}w, {src} {w}w"'
                      f' sizes="(max-width: 900px) calc(100vw - 40px), {560 if w > h else 440}px"')
    land = ' land' if w > h else ''
    return (f'<figure class="hfig{land}"><img src="{src}"{srcset} width="{w}" height="{h}" alt="{e(alt)}" fetchpriority="high" decoding="async">'
            f'<figcaption>Pictured: {e(cap)}</figcaption></figure>')

def hero_cls(key=None, w=None, h=None):
    if key:
        p = photo(key); w, h = p['w'], p['h']
    return 'hero plain shot' + (' wide' if w > h else '')

def combo_href(service, town):
    """Longview is home base: the main service page IS the Longview page, so /{service}-longview-tx
    301s to /{service} (vercel.json) instead of competing with it."""
    return f'/{service}' if town == 'longview-tx' else f'/{service}-{town}'

def pool(service, town=None):
    """Photos that genuinely show this service. Local ones (same town) first, then finished before in-progress."""
    ps = [p for p in PHOTOS if service in p['services']]
    ps += [dict(key=k, town=None, kind='finished') for k, x in EXTRAS.items() if service in x['services'] and k != SERVICE_HERO.get(service)]
    def rank(p):
        return (0 if town and p.get('town') == town else 1, 0 if p.get('kind') == 'finished' else 1)
    return [p['key'] for p in sorted(ps, key=rank)]

# ---------------------------------------------------------------- schema
def business_node(path='business.json'):
    d = _read(os.path.join(ROOT, '_data', path))
    d['areaServed'] = [f"{TOWNS[t]['name']}, TX" for t in TOWN_ORDER]
    d['hasMap'] = GBP
    d['slogan'] = 'Sit. Stay. Perfect Landscape.'
    d['telephone'] = '+1-903-844-6877'
    return d

def crumbs_ld(pairs):
    items = [('Home', '')] + list(pairs)
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': BASE + href(u).rstrip('/') if u else BASE + '/'}
        for i, (n, u) in enumerate(items)]}

def faq_ld(qas):
    return {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': ans}} for q, ans in qas]}

def webpage_ld(slug, title, desc, img_url=None, kind='WebPage'):
    url = BASE + href(slug)
    d = {'@context': 'https://schema.org', '@type': kind, '@id': url + '#webpage', 'url': url, 'name': title,
         'description': desc, 'inLanguage': 'en-US', 'dateModified': TODAY,
         'isPartOf': {'@type': 'WebSite', '@id': BASE + '/#website', 'name': 'Yard Dog Landscapes', 'url': BASE + '/'},
         'about': {'@id': BIZ_ID}, 'publisher': {'@id': BIZ_ID}}
    if img_url:
        d['primaryImageOfPage'] = {'@type': 'ImageObject', 'url': img_url}
    return d

def abs_url(path):
    return BASE + path if path.startswith('/') else path

# ---------------------------------------------------------------- html bits
def crumb(pairs):
    parts = ['<a href="/">Home</a>']
    for n, u in pairs[:-1]:
        parts.append(f'<a href="{href(u)}">{e(n)}</a>')
    parts.append(f'<span aria-current="page">{e(pairs[-1][0])}</span>')
    return '<nav class="crumb w" aria-label="Breadcrumb">' + '<span class="sep">/</span>'.join(parts) + '</nav>'

def swoosh(fill='#ffffff'):
    return (f'<svg class="swoosh" viewBox="0 0 1200 64" preserveAspectRatio="none" aria-hidden="true">'
            f'<path d="M0 6C300 54 900 54 1200 6V64H0Z" fill="#D12A37"/><path d="M0 20C300 68 900 68 1200 20V64H0Z" style="fill:{fill}"/></svg>')

GRAIN = '<span class="grain" aria-hidden="true"></span>'
STARS = '<i aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</i>'

def faq_html(qas):
    return ''.join(f'<details{" open" if i == 0 else ""}><summary>{e(q)}</summary><p>{e(ans)}</p></details>' for i, (q, ans) in enumerate(qas))

def cta(h="Ready when you are.", p="Tell us about your property. We'll walk it with you and send a written estimate within a day."):
    return (f'<section class="cta"><div class="w"><div><h2>{e(h)}</h2><p>{e(p)}</p></div><div class="act">'
            f'<a class="btn lg" href="/contact">Get a free quote</a><a class="tel" href="/pricing">See pricing</a></div></div></section>')

REVIEWS = {
    'ashley': ('Miller and the 2 young gentleman that did work at my home today were great! Each of them had great manners, respect and worked extremely hard to get the job done. I look forward to using them again in the near future.', 'Ashley Riley', 'Lawn maintenance'),
    'staci': ('I recently hired Miller to clear out my ditch area, and I couldn’t be more impressed with the results. From start to finish, the service was professional and efficient. They cleared the area quickly, removing overgrowth, debris, and ensuring proper drainage. Highly recommend Miller for any type of lawn care!', 'Staci Barham', 'Drainage'),
    'travis': ('Fantastic service, team has taken great care of our lawn. Always on time and respectful of the land. These guys go the extra mile.', 'Travis Martin', 'Lawn maintenance'),
    'anna': ('These guys did a great job. They were even sweet and brought my trash can up to the house. Glad we switched to Yard Dog. We’d recommend them to anyone in the White Oak area!', 'Anna Dear', 'White Oak, lawn maintenance'),
    'david': ('Yard Dog did a great job cleaning up my backyard full of leaves and pine needles. Saved my back an entire day of raking. And for a reasonable price, too!', 'David Dusek', 'Leaf removal'),
    'john': ('Professional and courteous. The price for the job was reasonable and was better than others I had checked with.', 'John Frazier', 'Lawn maintenance'),
    'melissa': ('Miller did a wonderful job! He was quick and thorough, I would recommend Yard Dog highly!', 'Melissa Adams', 'Lawn maintenance'),
    'penny': ('Does a great job. Shows up on time. Prices are good. Very friendly. I highly recommend this service.', 'Penny Behan', 'Lawn maintenance'),
    'christi': ('Love Yard Dog Lawn and Lights! They always do a fabulous job and keep my yard looking great!', 'Christi Rankin', 'Lawn maintenance'),
    'teri': ('Great job done. Am going to continue using them bi-weekly. I recommend them if you’re looking for great service!', 'Teri Hanes', 'Lawn maintenance'),
}
# which reviews fit which service pages (only real reviews, matched by what the reviewer hired us for)
SERVICE_REVIEWS = {'leaf-removal': ['david', 'travis', 'penny'], 'drainage': ['staci', 'john', 'travis'],
                   'christmas-lights': ['christi', 'melissa', 'penny']}
DEFAULT_REVIEWS = ['anna', 'staci', 'ashley']

def revs(keys):
    return '<div class="revs">' + ''.join(
        f'<figure class="rev">{STARS}<blockquote>&ldquo;{e(REVIEWS[k][0])}&rdquo;</blockquote>'
        f'<figcaption>{e(REVIEWS[k][1])}<span>{e(REVIEWS[k][2])} &middot; Google review</span></figcaption></figure>' for k in keys) + '</div>'

GBADGE = (f'<a class="gbadge" href="{GBP}" target="_blank" rel="noopener"><b>5.0</b><span>{STARS}<br>{REVIEW_COUNT} Google reviews</span></a>')

# ---------------------------------------------------------------- shell
def header(cur):
    svc_cols = ''.join(
        f'<div><p class="mh">{e(g)}</p>' + ''.join(f'<a href="/{s}"{" aria-current=page" if s == cur else ""}>{e(SHORT[s])}</a>' for s in ss) + '</div>'
        for g, ss in GROUPS)
    towns = ''.join(f'<a href="/{t}">{e(TOWNS[t]["name"])}</a>' for t in TOWN_ORDER)
    def top(slug, name):
        return f'<a href="/{slug}"{" aria-current=page" if slug == cur else ""}>{name}</a>'
    m_svcs = ''.join(f'<a href="/{s}">{e(SHORT[s])}</a>' for s in SERVICE_ORDER)
    m_towns = ''.join(f'<a href="/{t}">{e(TOWNS[t]["name"])}</a>' for t in TOWN_ORDER)
    return f'''<header class="top"><div class="w">
<a class="lk" href="/" aria-label="Yard Dog Landscapes home"><img src="/img/lockup.webp" width="405" height="120" alt="Yard Dog Landscapes"></a>
<nav class="mainnav" aria-label="Main">
<div class="dd"><a href="/services" class="ddt"{" aria-current=page" if cur == "services" else ""}>Services</a><div class="ddp ddp-svc">{svc_cols}<a class="ddall" href="/services">All services and prices</a></div></div>
<div class="dd"><a href="/longview-tx" class="ddt">Service areas</a><div class="ddp ddp-town">{towns}</div></div>
{top("our-work", "Our Work")}{top("pricing", "Pricing")}{top("about", "About")}{top("blog", "Blog")}
</nav>
<a class="btn hb" href="/contact">Get a free quote</a>
<button class="mb" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><span></span></button></div>
<nav class="mnav" id="mnav" hidden aria-label="Mobile">
<details><summary>Services</summary><div class="msub">{m_svcs}<a href="/services">All services</a></div></details>
<details><summary>Service areas</summary><div class="msub">{m_towns}</div></details>
<a href="/our-work">Our Work</a><a href="/pricing">Pricing</a><a href="/about">About</a><a href="/blog">Blog</a><a href="/careers">Careers</a><a href="/contact">Contact</a>
<a class="btn" href="/contact">Get a free quote</a></nav></header>'''

def footer():
    svc = ''.join(f'<li><a href="/{s}">{e(SHORT[s])}</a></li>' for s in SERVICE_ORDER)
    towns = ''.join(f'<li><a href="/{t}">{e(TOWNS[t]["name"])}, TX</a></li>' for t in TOWN_ORDER)
    return f'''<footer class="ft"><div class="w"><div class="fg">
<div><a class="lk2" href="/" aria-label="Yard Dog Landscapes home"><img src="/img/lockup.webp" width="405" height="120" alt="Yard Dog Landscapes" loading="lazy"></a>
<p>Sit. Stay. Perfect Landscape.<br>Family-owned lawn care, landscaping and hardscaping from Longview, Texas, since 2017.</p>
<p class="nap">Yard Dog Landscapes<br>Longview, TX<br><a href="tel:{PHONE_TEL}">{PHONE}</a><br><a href="mailto:{EMAIL}">{EMAIL}</a></p>
<p class="soc"><a href="{GBP}" target="_blank" rel="noopener">Google reviews</a><a href="https://www.facebook.com/yarddoglandscapes" target="_blank" rel="noopener">Facebook</a><a href="https://www.instagram.com/yarddoglandscape" target="_blank" rel="noopener">Instagram</a><a href="https://www.youtube.com/millermaines" target="_blank" rel="noopener">YouTube</a></p></div>
<div><h3>Services</h3><ul>{svc}</ul></div>
<div><h3>Service areas</h3><ul>{towns}</ul></div>
<div><h3>Company</h3><ul><li><a href="/about">About us</a></li><li><a href="/our-work">Our work</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/design-preview">Design preview</a></li><li><a href="/blog">Blog</a></li><li><a href="/careers">Careers</a></li><li><a href="/contact">Free quote</a></li></ul></div>
</div><p class="lic">Irrigation work is performed under Texas Licensed Irrigator Matthew Maines, LI0006657 (TCEQ).</p><div class="bot"><span>&copy; 2026 Yard Dog Landscapes. Family-owned and fully insured.</span><span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></span></div></div></footer>
<div class="mcta"><a class="q" href="/contact">Get a free quote</a></div>'''

def page(slug, title, desc, body, ld=(), og_img=None, extra_head='', extra_js='', robots='index, follow, max-image-preview:large',
         og_type='website', canonical=None):
    canon = canonical or (BASE + href(slug))
    og = abs_url(og_img or '/img/bg-home.jpg')
    lds = '\n'.join(f'<script type="application/ld+json">{json.dumps(d, ensure_ascii=False)}</script>' for d in ld)
    m = re.search(r'--bg:url\((/img/[^)]+)\)', body)
    pre = f'<link rel="preload" as="image" href="{m.group(1)}" fetchpriority="high">' if m else ''
    ver = '<meta name="google-site-verification" content="TTw9_h3UV4aprn_LWuW5P7EQQpNVcJBNbF9Zvy002os">' if slug == 'index' else ''
    doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA_ID}');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="{og_type}"><meta property="og:site_name" content="Yard Dog Landscapes"><meta property="og:locale" content="en_US">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{canon}"><meta property="og:image" content="{og}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{og}">
<meta name="theme-color" content="#0d0d0d">
<meta name="geo.region" content="US-TX"><meta name="geo.placename" content="Longview"><meta name="geo.position" content="32.4385084;-94.8481025"><meta name="ICBM" content="32.4385084, -94.8481025">
{ver}
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32"><link rel="icon" type="image/png" href="/favicon-192.png" sizes="192x192"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Yard Dog Landscapes Blog" href="{BASE}/feed.xml">
<link rel="preload" href="/fonts/anton-latin-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
{pre}
<link rel="stylesheet" href="/site.css?v=1">
{extra_head}
{lds}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{header(slug)}
<main id="main">
{body}
</main>
{footer()}
<script src="/yd-ads.js" defer></script>
{extra_js}<script src="/site.js?v=1" defer></script>
</body>
</html>
'''
    out = os.path.join(ROOT, f'{slug}.html')
    doc = doc.replace('{REVIEW_COUNT}', REVIEW_COUNT)
    doc = re.sub(r'href="/(' + '|'.join(map(re.escape, SERVICE_ORDER)) + r')-longview-tx"', r'href="/\1"', doc)
    open(out, 'w').write(doc)
    return doc

# ---------------------------------------------------------------- quote form (posts to /api/quote -> Platy)
QUOTE_CHOICES = [  # (label, how it is sent to Platy)
    ('Mowing & maintenance', 'svc'), ('Flower beds & mulch', 'svc'), ('Sod installation', 'svc'),
    ('Patios & hardscape', 'svc'), ('Retaining walls', 'svc'), ('Drainage', 'svc'),
    ('Irrigation', 'other'), ('Christmas lights', 'other'), ('Leaf cleanup', 'other'), ('Something else', 'other')]
PRESELECT = {'lawn-maintenance': 'Mowing & maintenance', 'fertilization': 'Mowing & maintenance', 'hedge-trimming': 'Mowing & maintenance',
             'tree-shrub-care': 'Mowing & maintenance', 'leaf-removal': 'Leaf cleanup', 'tree-planting': 'Flower beds & mulch',
             'landscaping': 'Flower beds & mulch', 'flower-bed-installation': 'Flower beds & mulch', 'mulch-installation': 'Flower beds & mulch',
             'sod-installation': 'Sod installation', 'hardscaping': 'Patios & hardscape', 'retaining-walls': 'Retaining walls',
             'drainage': 'Drainage', 'irrigation': 'Irrigation', 'christmas-lights': 'Christmas lights'}
HOW_HEARD = ['Google', 'Instagram', 'Facebook', 'YouTube', 'Vehicle wrap', 'Yard sign', 'Mailer', 'Other']
SMS_CONSENT = ('I agree to receive service-related text messages from Yard Dog Landscapes about my quote, appointments and '
               'scheduled work at the mobile number I provide. Consent is not a condition of purchase. Message frequency varies. '
               'Msg & data rates may apply. Reply STOP to opt out, HELP for help.')

def quote_form(fid='q', preselect=None, town=None, heading='Get a free quote', sub="Takes a minute. We call within a day to set up a free walkthrough."):
    chips = ''.join(
        f'<label class="chip"><input type="checkbox" name="pick" value="{e(lbl)}" data-kind="{k}"{" checked" if lbl == preselect else ""}><span>{e(lbl)}</span></label>'
        for lbl, k in QUOTE_CHOICES)
    heard = ''.join(f'<option>{h}</option>' for h in HOW_HEARD)
    addr_ph = f'Street, {town}, ZIP' if town else 'Street, city, ZIP'
    return f'''<form class="qf" id="{fid}" novalidate data-quote>
<div class="qh"><h2>{e(heading)}</h2><p>{e(sub)}</p><ol class="qsteps" aria-hidden="true"><li class="on">The work</li><li>Your info</li></ol></div>
<fieldset class="qs" data-step="1"><legend class="lb2">What do you need? <small>Pick any</small></legend><div class="chips">{chips}</div>
<label class="lb2" for="{fid}-details">Tell us about the work <em>*</em></label>
<textarea class="in" id="{fid}-details" name="details" rows="3" placeholder="E.g. the back corner holds water after a rain and we want a patio out there"></textarea>
<label class="lb2" for="{fid}-address">Property address <em>*</em></label>
<input class="in" id="{fid}-address" name="address" autocomplete="street-address" placeholder="{e(addr_ph)}">
<p class="qerr" role="alert" hidden></p>
<button class="btn qnext" type="button">Next: your info</button></fieldset>
<fieldset class="qs" data-step="2" hidden><legend class="sr">Your contact information</legend>
<div class="two"><div><label class="lb2" for="{fid}-first">First name <em>*</em></label><input class="in" id="{fid}-first" name="first_name" autocomplete="given-name"></div>
<div><label class="lb2" for="{fid}-last">Last name <em>*</em></label><input class="in" id="{fid}-last" name="last_name" autocomplete="family-name"></div></div>
<div class="two"><div><label class="lb2" for="{fid}-phone">Mobile phone <em>*</em></label><input class="in" id="{fid}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></div>
<div><label class="lb2" for="{fid}-email">Email <em>*</em></label><input class="in" id="{fid}-email" name="email" type="email" autocomplete="email" inputmode="email"></div></div>
<label class="lb2" for="{fid}-heard">How did you hear about us? <small>Optional</small></label>
<select class="in" id="{fid}-heard" name="how_heard"><option value="">Select one</option>{heard}</select>
<label class="consent"><input type="checkbox" name="sms_consent"><span>{e(SMS_CONSENT)}</span></label>
<input class="hp" name="pf_ref" tabindex="-1" autocomplete="off" aria-hidden="true">
<p class="qerr" role="alert" hidden></p>
<div class="qrow"><button class="qback" type="button">Back</button><button class="btn qsend" type="submit">Send my request</button></div>
<p class="fine">No spam and no pushy follow-ups.</p></fieldset>
<div class="qdone" hidden><div class="ok" aria-hidden="true"><svg width="28" height="22" viewBox="0 0 28 22"><path d="M2 11l8 8L26 3" fill="none" stroke="#fff" stroke-width="4"/></svg></div>
<h2>Request sent</h2><p>Thanks, <span class="qn"></span>. We'll call you within a day to set up your free walkthrough.</p></div>
</form>'''
