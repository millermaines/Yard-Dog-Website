"""Home, About, Our Work, Services, Service areas, Pricing, Contact, Careers, Design preview, cost guide, legal, 404."""
import json, os, re, html as H
from common import *  # noqa
from pages_local import JOB_TEXT, job_keys, first_sentence, facts_list, STD_FACTS, city_place
import pages_blog

SRC = os.path.join(ROOT, '_data', 'page-src')

def svc_price(s):
    p = SERVICES[s]['price']
    return (p['range'].replace('–', ' to ') + ' ' + (p.get('unit') or '')).strip() if p.get('range') else 'Quoted after a walkthrough'

# ======================================================================= home
def home():
    hero = (f'<section class="hero photo" style="--bg:url(/img/bg-home.jpg);--bp:center 68%;--bpm:62% 70%"><div class="w">'
            f'<div><p class="kick">Longview, Texas. Family-owned since 2017.</p><h1>Sit. Stay.<br>Perfect<br>Landscape.</h1>'
            f'<p class="lede">Lawn care, landscaping, patios, retaining walls and drainage across Longview and East Texas. One local crew that shows up when it says it will, builds it right, and cleans up before it leaves.</p>'
            f'<div class="acts"><a class="btn lg" href="/our-work" style="background:#fff;color:#111">See our work</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div>'
            f'<p class="stars">{STARS}<span><b>5.0</b> from 111 Google reviews</span></p>'
            f'<p class="tag">Pictured: a flagstone walkway with path lights we built in Kilgore</p></div>'
            f'{quote_form("q", heading="Get a free quote", sub="Two quick steps. It goes straight to our office, and we call you within a day.")}'
            f'</div>{GRAIN}{swoosh()}</section>')
    trust = ('<section class="trust" aria-label="Why homeowners pick Yard Dog"><div class="w">'
             '<div><b>5.0 <span>&#9733;</span></b><small>111 Google reviews</small></div>'
             '<div><b>Since 2017</b><small>Family-owned, based in Longview</small></div>'
             '<div><b>Same crew</b><small>Every visit. We never subcontract.</small></div>'
             '<div><b>Within a day</b><small>Free, written, itemized estimate</small></div></div></section>')
    cards_def = [('lawn-maintenance', 'Lawn care', 'd:crew-dsc04063'), ('hardscaping', 'Patios & walkways', 'white-oak-flagstone-patio-after'),
                 ('retaining-walls', 'Retaining walls', 'driveway-retaining-wall-after'), ('flower-bed-installation', 'Flower beds', 'front-roses-after'),
                 ('drainage', 'Drainage', 'img-3736'), ('landscaping', 'Landscaping', 'img-3738')]
    cards = ''.join(f'<a class="card" href="/{s}">{img(k)}<div class="ct"><h3>{e(t)}</h3><p>{e(first_sentence(SERVICES[s]["lede"]))}</p><span class="go">{e(svc_price(s))}</span></div></a>' for s, t, k in cards_def)
    services = (f'<section class="sec stone"><div class="w"><div class="head"><div><h2 class="h2">The full pack of<br>outdoor services</h2></div>'
                f'<a class="more" href="/services">All 14 services and prices</a></div><div class="cards">{cards}</div></div></section>')
    recent = [('walkway', 'd:walk-dsc03953', 'Kilgore'), ('rvpad', 'd:rvpad-dsc03563', 'White Oak'), ('whiteoak', 'st:pat_025', 'White Oak'), ('driveway', 'driveway-retaining-wall-after', 'Lake Cherokee')]
    rc = ''.join(f'<a class="card" href="/our-work#job={j}">{img(k)}<div class="ct"><p class="pm">{e(town)}, TX</p><h3>{e(JOB_TEXT[j][0])}</h3></div></a>' for j, k, town in recent)
    work = (f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">Built this season</h2><p class="sub">Every photo is our crew on our jobs. No stock photos.</p></div>'
            f'<a class="more" href="/our-work">See all {len(PHOTOS)} photos</a></div><div class="cards c4">{rc}</div></div></section>')
    how = ('<section class="sec dark" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><h2 class="h2">Four steps. No guesswork.</h2>'
           '<ol class="steps" style="margin-top:40px"><li><h3>Reach out</h3><p>Send the quote form or a text. It takes about a minute.</p></li><li><h3>We walk it with you</h3><p>We meet at the property, listen, measure and map out the work.</p></li><li><h3>Written estimate</h3><p>Itemized and in writing within a day. No pressure, no upsells.</p></li><li><h3>The crew shows up</h3><p>On time, in uniform, and we leave the place cleaner than we found it.</p></li></ol>'
           '<p style="margin-top:44px"><a class="btn lg" href="#q">Start with step one</a></p></div></section>')
    about = (f'<section class="sec"><div class="w split"><figure class="portrait" style="margin:0"><img src="/img/miller-maines-yard-dog-f350.webp" width="1000" height="1333" alt="Miller Maines, owner of Yard Dog Landscapes, in front of a Yard Dog truck" loading="lazy"><figcaption>Miller Maines<span>Owner, Yard Dog Landscapes</span></figcaption></figure>'
             f'<div><h2 class="h2">Loyal as a hound.<br>Sharp as a spade.</h2><p>Yard Dog started in 2017 with one truck, one trailer and a stubborn belief that lawn care should feel personal. Almost a decade later we still answer every message ourselves, still walk every property before we price it, and still treat your yard like our own front lawn.</p>'
             f'<div class="acts"><a class="btn ghost" href="/about">Our story</a><a class="more" href="/careers">Join the pack</a></div></div></div></section>')
    reviews = f'<section class="sec stone"><div class="w"><div class="head"><div><h2 class="h2">What our neighbors say</h2></div>{GBADGE}</div>{revs(["anna", "staci", "ashley", "travis", "david", "john"])}</div></section>'
    qas = [('How do I pick the best landscaping company in Longview, TX?', 'Look for a local crew with a track record you can check. Yard Dog Landscapes is family-owned, has worked East Texas yards since 2017 and holds a 5.0 rating across 111 Google reviews. We walk every property in person before we quote it, send a written, itemized estimate, and our own crew does the work. We never subcontract.'),
           ('What services does Yard Dog Landscapes offer?', 'Weekly and bi-weekly lawn maintenance, leaf removal, fertilization, hedge trimming, tree and shrub care, tree planting, landscaping, flower beds, mulch, sod, patios and walkways, retaining walls, drainage and grading, and Christmas light installation.'),
           ('What areas do you serve?', 'We are based in Longview and work across East Texas: White Oak, Kilgore, Lake Cherokee, Gladewater, Hallsville, Marshall, Tyler, Henderson, Gilmer, Big Sandy, Carthage, Nacogdoches and the communities around them.'),
           ('Do you offer free estimates?', f'Yes. Send the quote form or text {PHONE} and we will get back to you within a day to set up a free on-site walkthrough. You get a written estimate with no pressure and no upsells.'),
           ('How much does landscaping cost in Longview, TX?', 'Weekly mowing for a typical Longview yard runs about $50 to $65 a visit. Most landscaping and planting projects run $900 to $3,600, patios and hardscaping $3,100 to $9,100, and retaining walls $3,000 to $19,000. Your free, written quote gives you the exact number.'),
           ('Is Yard Dog Landscapes insured?', 'Yes. We are a family-owned, fully insured company based in Longview, TX, and the same crew does every job.')]
    faq = (f'<section class="sec"><div class="w faqw"><div><h2 class="h2">Straight answers</h2><p class="sub">The questions East Texans ask us most. Something else on your mind? Text <a href="sms:{PHONE_TEL}" style="font-weight:700;color:var(--ink)">{PHONE}</a>.</p></div><div class="faq">{faq_html(qas)}</div></div></section>')
    tg = ''.join(f'<a href="/{t}">{e(TOWNS[t]["name"])}<small>{e(TOWNS[t]["county"])}</small></a>' for t in TOWN_ORDER)
    area = f'<section class="sec stone"><div class="w"><h2 class="h2">Where we work</h2><p class="sub">From our home base in Longview across East Texas. Pick your town for local details, prices and answers.</p><div class="tgrid" style="margin-top:28px">{tg}</div></div></section>'
    posts = pages_blog.ORDERED[:3]
    blog = ''.join(f'<a class="bc" href="/{p["slug"]}"><img src="{pages_blog.hero_img(p)[0]}" width="{pages_blog.hero_img(p)[1]}" height="{pages_blog.hero_img(p)[2]}" alt="{e(p["img_alt"])}" loading="lazy" decoding="async"><span class="bmeta"><b>{e(p["tag"])}</b> &middot; {e(p["date_h"])}</span><h3>{e(p["title"])}</h3></a>' for p in posts)
    blogsec = f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">From the blog</h2><p class="sub">Yard advice for East Texas, written by the owner. New post every Saturday.</p></div><a class="more" href="/blog">All posts</a></div><div class="bgrid">{blog}</div></div></section>'
    body = hero + trust + services + work + how + about + reviews + area + faq + blogsec + cta('Get your yard on the schedule.', "We'll walk the property with you and send a written estimate within a day.")
    biz = business_node('business-home.json')
    ws = {'@context': 'https://schema.org', '@type': 'WebSite', '@id': BASE + '/#website', 'name': 'Yard Dog Landscapes', 'alternateName': ['Yard Dog', 'Yard Dog Lawn & Lights'],
          'url': BASE + '/', 'inLanguage': 'en-US', 'publisher': {'@id': BIZ_ID}}
    wp = webpage_ld('index', 'Yard Dog Landscapes | Landscaping, Lawn Care & Patios in Longview, TX', 'x', BASE + '/img/bg-home.jpg')
    wp['speakable'] = {'@type': 'SpeakableSpecification', 'cssSelector': ['h1', '.hero .lede', '.faq']}
    desc = 'Family-owned landscaping, lawn care, patios, walls and drainage in Longview and East Texas since 2017. Rated 5.0 from 111 Google reviews. Free written quotes.'
    wp['description'] = desc
    page('index', 'Yard Dog Landscapes | Landscaping, Lawn Care & Patios in Longview, TX', desc, body, [biz, ws, wp, faq_ld(qas)],
         og_img='/img/bg-home.jpg', extra_js='<script src="/quote.js?v=1" defer></script>')

# ======================================================================= about
CREW = [('d:walk-dsc03710', 'Setting stone borders, Kilgore', 't2'), ('d:rvpad-dsc03105', 'Standing timbers for an RV pad, White Oak', ''),
        ('d:crew-dsc04038', 'Trimming on a weekly route', ''), ('d:walk-dsc03627', 'Mixing mortar for stone borders', ''),
        ('d:rvpad-dsc03046', 'Leveling the first course', ''), ('d:rvpad-dsc03158', 'Track loader and shovel work', 'w2')]

def about():
    hero = (crumb([('About', 'about')]) +
            f'<section class="hero blur" style="--bg:url(/img/bg-about.jpg)"><div class="w"><div><p class="kick">About Yard Dog</p><h1>Same crew.<br>Same standards.<br>Since 2017.</h1>'
            f'<p class="lede">Yard Dog Landscapes is a family-owned lawn care and landscaping company in Longview, Texas. Miller Maines started it with one truck and one trailer. The trucks are nicer now and the crew is bigger. How we work hasn\'t changed.</p>'
            f'<div class="acts"><a class="btn lg" href="/contact">Get a free quote</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div></div>'
            f'<figure class="portrait" style="margin:0;justify-self:center"><img src="/img/miller-maines-owner-yard-dog-truck.webp" width="1000" height="1333" alt="Miller Maines, owner of Yard Dog Landscapes, leaning on the Yard Dog Ford F-350" fetchpriority="high"><figcaption>Miller Maines<span>Owner &amp; founder</span></figcaption></figure></div>{GRAIN}{swoosh()}</section>')
    story = ('<section class="sec"><div class="w split" style="align-items:start"><div><h2 class="h2">One truck, one trailer, and a stubborn idea</h2>'
             '<p>In 2017 Yard Dog was one truck, one trailer and the belief that lawn care should feel personal. The first yards were neighbors and friends. We mowed, we edged, we showed up when we said we would, and word got around Longview.</p>'
             '<p>Almost a decade later we still answer every message ourselves, still walk every property before we price it, and still treat your yard like our own front lawn. We don\'t subcontract, so the people you meet at the walkthrough are the people who do the job.</p>'
             '<p>Today our crews run weekly lawn routes and build patios, flagstone walkways, retaining walls, boat and RV pads, flower beds and drainage across Longview, White Oak, Kilgore, Lake Cherokee, Hallsville, Marshall, Tyler and the rest of East Texas. In the fall and winter, Yard Dog Lights hangs Christmas lights on homes across the area.</p></div>'
             '<div class="stats" style="margin-top:8px"><div><b>2017</b><small>Founded in Longview, TX</small></div><div><b>5.0 &#9733;</b><small>From 111 Google reviews</small></div><div><b>13</b><small>East Texas towns served</small></div><div><b>0</b><small>Subcontractors. Our crew does the work.</small></div></div></div></section>')
    mos = ''.join(f'<figure class="{c}">{img(k)}<figcaption>{e(cap)}</figcaption></figure>' for k, cap, c in CREW)
    crew = (f'<section class="sec stone"><div class="w"><div class="head"><div><h2 class="h2">Four guys in red.<br>You\'ll get to know them.</h2><p class="sub">The same crew runs the trucks, the install, the cleanup and the follow-up call. Here they are on a few recent jobs.</p></div>'
            f'<a class="more" href="/our-work">See more of their work</a></div><div class="mos">{mos}</div></div></section>')
    trucks = (f'<section class="sec dark"><div class="w split"><div><h2 class="h2">White truck.<br>Red dog.<br>That\'s us.</h2><p style="color:#cfcfca">If a white F-350 with the Yard Dog wrap is parked on your street, one of our crews is working close by. Same red you see on the trucks, the shirts and this site. Wave. We\'ll wave back.</p><div class="acts"><a class="btn" href="/contact">Get a free quote</a></div></div>'
              f'<figure style="margin:0"><img src="/img/yard-dog-truck-and-track-loader.webp" width="1400" height="931" alt="Yard Dog Landscapes Ford F-350 and Bobcat track loader parked on a residential street" loading="lazy" style="width:100%;height:auto;border-radius:10px;box-shadow:0 30px 60px -20px rgba(0,0,0,.8)"></figure></div></section>')
    prom = ('<section class="sec"><div class="w"><h2 class="h2" style="margin-bottom:44px">What you can count on</h2><div class="prom">'
            '<div><h3>Same crew every visit</h3><p>The same trained team learns your property and how you like it. No rotating faces.</p></div>'
            '<div><h3>Written, itemized quotes</h3><p>Every line in writing before we start. If the ground turns up a surprise, we show you and ask first.</p></div>'
            '<div><h3>On time, every time</h3><p>We schedule tight and talk fast. If rain moves your day, you hear from us the same day.</p></div>'
            '<div><h3>Local and fully insured</h3><p>Based in Longview, fully insured, and we stand behind the work.</p></div></div></div></section>')
    tg = ''.join(f'<a href="/{t}">{e(TOWNS[t]["name"])}<small>{e(TOWNS[t]["county"])}</small></a>' for t in TOWN_ORDER)
    where = f'<section class="sec stone"><div class="w"><h2 class="h2">Where we work</h2><p class="sub">From our home base in Longview, our crews cover seven East Texas counties. If you\'re close by and don\'t see your town, text us and ask.</p><div class="tgrid" style="margin-top:28px">{tg}</div></div></section>'
    rv = f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">They say it better</h2></div>{GBADGE}</div>{revs(["ashley", "melissa", "anna"])}</div></section>'
    body = hero + story + crew + trucks + prom + where + rv + cta('Ready to throw us the bone?', "Tell us about your property. We'll come look at it, listen to what you want, and send a clear written estimate within a day.")
    desc = 'Meet Yard Dog Landscapes, the family-owned lawn care and landscaping crew Miller Maines started in Longview, TX in 2017. Same crew every visit, 5.0 on Google.'
    ap = webpage_ld('about', 'About Yard Dog Landscapes', desc, BASE + '/img/miller-maines-owner-yard-dog-truck.webp', kind='AboutPage')
    ap['mainEntity'] = {'@id': BIZ_ID}
    person = {'@context': 'https://schema.org', '@type': 'Person', '@id': BASE + '/#miller', 'name': 'Miller Maines', 'jobTitle': 'Owner',
              'worksFor': {'@id': BIZ_ID}, 'image': BASE + '/img/miller-maines-owner-yard-dog-truck.webp', 'url': BASE + '/about'}
    page('about', 'About Yard Dog Landscapes | Family-Owned Since 2017, Longview TX', desc, body,
         [business_node(), ap, person, crumbs_ld([('About', 'about')])], og_img='/img/miller-maines-owner-yard-dog-truck.webp')

# ======================================================================= our work
PROJECTS = [
    ('walkway', 'kilgore-tx', [('Hardscaping in Kilgore', 'hardscaping-kilgore-tx'), ('Landscaping in Kilgore', 'landscaping-kilgore-tx')]),
    ('rvpad', 'white-oak-tx', [('Retaining walls in White Oak', 'retaining-walls-white-oak-tx'), ('Drainage in White Oak', 'drainage-white-oak-tx')]),
    ('whiteoak', 'white-oak-tx', [('Patios in White Oak', 'hardscaping-white-oak-tx'), ('Hardscaping', 'hardscaping')]),
    ('driveway', 'lake-cherokee-tx', [('Retaining walls at Lake Cherokee', 'retaining-walls-lake-cherokee-tx'), ('Retaining walls', 'retaining-walls')]),
    ('checker', 'kilgore-tx', [('Patios in Kilgore', 'hardscaping-kilgore-tx'), ('Hardscaping', 'hardscaping')]),
    ('flagstone', None, [('Hardscaping', 'hardscaping')]),
    ('woodwall', None, [('Retaining walls', 'retaining-walls')]),
    ('beds', None, [('Flower bed installation', 'flower-bed-installation'), ('Mulch installation', 'mulch-installation')]),
    ('lawn', None, [('Lawn maintenance', 'lawn-maintenance'), ('Lawn care in Longview', 'lawn-maintenance-longview-tx')]),
]
EXTRA_JOB_TEXT = {
    'flagstone': ('Flagstone patio with stone border', 'May 2026', 'Bare ground built up with fabric and a crushed stone base into a flagstone patio framed by a clean stone border.'),
    'woodwall': ('Wood-to-block retaining wall', '', 'A failing double timber wall along a privacy fence torn out and rebuilt in segmental block with gravel drainage and capstones.'),
    'beds': ('Foundation beds & sandstone edging', 'May 2026', 'Four beds around one home: new sandstone block edging, black mulch, knockout roses, boxwoods, ferns and salvia, with the hydrangeas kept under the big tree.'),
    'lawn': ('Weekly lawn maintenance', 'Every week', 'Mowing, edging, trimming and blow-off on weekly and bi-weekly routes. Same crew every visit.'),
}

def our_work():
    tiles = []
    for i, p in enumerate(PHOTOS):
        lazy = '' if i < 12 else ' loading="lazy"'
        tiles.append(f'<a class="t" href="/img/work/full/{p["file"]}" data-i="{i}" data-g="{p["group"]}" data-k="{"f" if p["kind"] == "finished" else "w"}" data-j="{p["job"]}">'
                     f'<img src="/img/work/grid/{p["file"]}" width="{p["gw"]}" height="{p["gh"]}" alt="{e(p["alt"])}" decoding="async"{lazy}></a>')
    cats = [('all', 'All'), ('patios', 'Patios & walkways'), ('walls', 'Walls & pads'), ('beds', 'Beds & rock'), ('lawn', 'Lawn care'), ('w', 'Crew at work')]
    chips = ''.join(f'<button type="button" class="f" data-f="{k}" aria-pressed="{str(k == "all").lower()}">{n}</button>' for k, n in cats)
    proj = []
    for job, town, links in PROJECTS:
        t, d, s = JOB_TEXT.get(job) or EXTRA_JOB_TEXT[job]
        place = f"{TOWNS[town]['name']}, TX" if town else ('Longview area routes' if job == 'lawn' else 'East Texas')
        n = sum(1 for p in PHOTOS if p['job'] == job)
        lk = ' '.join(f'<a href="/{u}">{e(x)}</a>' for x, u in links)
        proj.append(f'<article class="pj"><p class="pm">{e(place)}{(" &middot; " + e(d)) if d else ""}</p><h3>{e(t)}</h3><p>{e(s)}</p>'
                    f'<p class="pl"><button type="button" class="see" data-job="{job}">See {n} photo{"s" if n != 1 else ""}</button>{lk}</p></article>')
    hero = (crumb([('Our Work', 'our-work')]) +
            f'<section class="hero"><div class="w"><div><p class="kick">Longview &amp; East Texas landscaping</p><h1>Our Work</h1>'
            f'<p class="lede">Patios, flagstone walkways, retaining walls, boat and RV pads, flower beds and weekly lawn care across Longview, Lake Cherokee, White Oak, Kilgore and the rest of East Texas. Every photo here is our crew on our jobs.</p><a class="btn" href="/contact">Get a free quote</a></div>'
            f'<div class="clips"><video data-auto src="/media/hype-b.mp4" poster="/media/hype-b.jpg" muted loop playsinline preload="metadata" width="432" height="768" title="Boat and RV pad dirt work in White Oak" aria-label="Boat and RV pad dirt work in White Oak"></video>'
            f'<video class="mid" data-auto data-delay="1600" src="/media/hype-a.mp4" poster="/media/hype-a.jpg" muted loop playsinline preload="metadata" width="432" height="768" title="Flagstone walkway build in Kilgore" aria-label="Flagstone walkway build in Kilgore"></video>'
            f'<video data-auto data-delay="3200" src="/media/hype-c.mp4" poster="/media/hype-c.jpg" muted loop playsinline preload="metadata" width="432" height="768" title="Weekly lawn maintenance route" aria-label="Weekly lawn maintenance route"></video></div></div>{GRAIN}{swoosh("#f3f2ee")}</section>')
    towns = ', '.join(f'<a href="/{t}">{e(TOWNS[t]["name"])}</a>' for t in TOWN_ORDER)
    body = hero + (f'<section class="gal" aria-labelledby="galh"><div class="w"><h2 id="galh" class="sr">Project photos</h2><div class="fl" role="group" aria-label="Filter photos">{chips}<button type="button" class="f jobchip" hidden aria-pressed="true"></button></div><div class="grid" id="grid">{"".join(tiles)}</div></div></section>'
                   f'<section class="projects" aria-labelledby="pjh"><div class="w"><h2 id="pjh">Recent projects</h2><p class="pi">What we built, where, and what went into it. Tap a project to see its photos.</p><div class="pg">{"".join(proj)}</div>'
                   f'<p class="area"><strong>Service area:</strong> {towns}.</p></div></section>'
                   + cta('Want this at your place?', "We'll walk the property with you and send a written estimate within a day. 5.0 stars on Google from 111 reviews.") +
                   '<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Photo"><button class="cl" type="button" aria-label="Close">&times;</button><button class="pv" type="button" aria-label="Previous photo">&lsaquo;</button><img id="lbi" alt=""><p><span id="lbc"></span><small id="lbn"></small></p><button class="nx" type="button" aria-label="Next photo">&rsaquo;</button></div>')
    desc = 'Photos and video of real patios, flagstone walkways, retaining walls, RV pads, beds and lawn care by Yard Dog Landscapes in Longview, White Oak and Kilgore, TX.'
    gal = {'@context': 'https://schema.org', '@type': ['CollectionPage', 'ImageGallery'], '@id': BASE + '/our-work#gallery', 'url': BASE + '/our-work',
           'name': 'Our Work: landscaping, hardscape and lawn care projects in Longview and East Texas', 'description': desc,
           'about': {'@id': BIZ_ID}, 'publisher': {'@id': BIZ_ID}, 'primaryImageOfPage': BASE + '/img/work/full/' + PHOTOS[0]['file'],
           'hasPart': [{'@type': 'ImageObject', 'contentUrl': BASE + '/img/work/full/' + p['file'], 'thumbnailUrl': BASE + '/img/work/grid/' + p['file'],
                        'caption': p['alt'], 'width': p['w'], 'height': p['h'], 'creator': {'@id': BIZ_ID}, 'copyrightHolder': {'@id': BIZ_ID},
                        'creditText': 'Yard Dog Landscapes', **({'contentLocation': city_place(TOWNS[p['town']])} if p.get('town') else {})} for p in PHOTOS]}
    vids = [{'@context': 'https://schema.org', '@type': 'VideoObject', 'name': n, 'description': d, 'thumbnailUrl': BASE + f'/media/{v}.jpg',
             'contentUrl': BASE + f'/media/{v}.mp4', 'uploadDate': u, 'duration': 'PT9S', 'publisher': {'@id': BIZ_ID}}
            for v, n, d, u in [('hype-a', 'Flagstone walkway build in Kilgore, TX', 'Crew compacting base, mixing mortar and setting chopped stone borders for a flagstone walkway in Kilgore, TX.', '2026-09-18'),
                               ('hype-b', 'Boat and RV pad dirt work in White Oak, TX', 'Track loader hauling fill, fabric and gravel for a raised boat and RV pad in White Oak, TX.', '2026-09-11'),
                               ('hype-c', 'Weekly lawn maintenance route', 'Mowing, edging, trimming and blow-off on a weekly lawn care route in the Longview area.', '2026-09-28')]]
    page('our-work', 'Our Work: Patios, Walls & Lawn Care Photos | Yard Dog Landscapes, Longview TX', desc, body,
         [business_node(), gal, *vids, crumbs_ld([('Our Work', 'our-work')])], og_img='/img/work/full/' + PHOTOS[0]['file'],
         extra_js='<script>window.YD_GALLERY=true</script><script src="/gallery.js?v=1" defer></script>')

# ======================================================================= services hub
def services_hub():
    hero = (crumb([('Services', 'services')]) +
            f'<section class="hero photo solo" style="--bg:url(/img/bg-services.jpg);--bp:center 40%"><div class="w"><div><p class="kick">Longview &amp; East Texas</p><h1>Services</h1>'
            f'<p class="lede">Weekly lawn care, new landscaping, patios, walls and drainage. One local crew, a written quote, and nothing subcontracted.</p>'
            f'<div class="acts"><a class="btn lg" href="/contact">Get a free quote</a><a class="tel2" href="/pricing">See price ranges</a></div>{facts_list(STD_FACTS)}</div></div>{GRAIN}{swoosh()}</section>')
    heroes = {'Maintenance': 'd:crew-dsc04063', 'Installation': 'front-roses-after', 'Hardscape & specialty': 'd:walk-dsc03930'}
    gs = ''
    for g, ss in GROUPS:
        rows = ''.join(f'<a href="/{s}"><h3>{e(SERVICES[s]["name"])}</h3><p>{e(first_sentence(SERVICES[s]["lede"]))}</p><span class="pr">{e(svc_price(s))}</span></a>' for s in ss)
        gs += f'<div class="sg"><div class="sgp">{img(heroes[g])}<h2 class="h2">{e(g)}</h2></div><div class="sl">{rows}</div></div>'
    body = hero + f'<section class="sec" style="padding-top:40px"><div class="w">{gs}</div></section>'
    body += ('<section class="sec dark" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><h2 class="h2">See your yard<br>before we dig</h2><p class="sub">Not sure what you want yet? Our Landscape Design Preview sends you one or two custom renderings of your property for a flat fee, credited toward a qualifying install booked within 90 days.</p>'
             '<div class="tiers"><div class="tier"><b>$199</b><h3>Flower beds</h3><p>New bed layout, plants and edging drawn onto your house.</p></div><div class="tier"><b>$449</b><h3>Hardscape</h3><p>Patio, walkway, fire pit or wall, placed in your actual yard.</p></div><div class="tier"><b>$999</b><h3>Full property</h3><p>Front and back, planned as one renovation.</p></div></div>'
             '<p style="margin-top:34px"><a class="btn" href="/design-preview">See the design preview</a></p></div></section>')
    body += ('<section class="sec stone"><div class="w etx"><h2>What works in Dallas doesn\'t work here</h2><div>'
             '<p>The piney woods mean sandy, acidic topsoil over clay, a long hot growing season and spring rains that come in hard. A maintenance plan or patio base that works in Dallas or Houston usually needs tuning before it holds up out here.</p>'
             '<p>So every job starts with us walking the property and sending a written, itemized estimate. If something you want is going to struggle in this climate, we\'ll tell you before we install it, not after.</p></div></div></section>')
    body += cta("Not sure what you need?", "Tell us what's bugging you about the yard. We'll walk it, tell you straight, and put a price in writing.")
    desc = 'Lawn care, landscaping, flower beds, sod, mulch, patios, retaining walls, drainage and Christmas lights in Longview and East Texas, with prices and free quotes.'
    cat = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': 'Yard Dog Landscapes services', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'url': BASE + '/' + s, 'name': SERVICES[s]['name']} for i, s in enumerate(SERVICE_ORDER)]}
    page('services', 'Landscaping & Lawn Care Services in Longview, TX | Yard Dog Landscapes', desc, body,
         [business_node(), cat, crumbs_ld([('Services', 'services')]), webpage_ld('services', 'Services', desc)], og_img='/img/bg-services.jpg')

# ======================================================================= service areas hub
def service_areas():
    tiles = ''.join(f'<a class="stile{" pop" if t == "longview-tx" else ""}" href="/{t}"><h3>{e(TOWNS[t]["name"])}</h3><p>{e(TOWNS[t]["county"])}. {e(TOWNS[t]["drive"][0].upper() + TOWNS[t]["drive"][1:])}.</p><span class="pr">Landscaping, lawn care and more</span></a>' for t in TOWN_ORDER)
    hero = (crumb([('Service areas', 'service-areas')]) +
            f'<section class="hero blur solo" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><div><h1>Where we work</h1>'
            f'<p class="lede">Yard Dog works out of Longview across seven East Texas counties: Gregg, Harrison, Smith, Rusk, Upshur, Panola and Nacogdoches. Pick your town for local details, recent jobs, prices and answers.</p></div></div>{GRAIN}{swoosh()}</section>')
    body = hero + f'<section class="sec"><div class="w"><div class="stiles">{tiles}</div><p class="sub" style="margin-top:28px">Close by but don\'t see your town? Text <a href="sms:{PHONE_TEL}" style="font-weight:700;color:var(--ink)">{PHONE}</a> and ask. We cover most of East Texas.</p></div></section>' + cta()
    desc = 'Towns Yard Dog Landscapes serves: Longview, White Oak, Kilgore, Lake Cherokee, Gladewater, Hallsville, Marshall, Tyler, Henderson, Gilmer and more in East Texas.'
    lst = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': 'Yard Dog Landscapes service areas', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'url': BASE + '/' + t, 'name': f"{TOWNS[t]['name']}, TX"} for i, t in enumerate(TOWN_ORDER)]}
    page('service-areas', 'Service Areas: Longview & East Texas Towns | Yard Dog Landscapes', desc, body,
         [business_node(), lst, crumbs_ld([('Service areas', 'service-areas')]), webpage_ld('service-areas', 'Service areas', desc)])

# ======================================================================= pricing
def pricing():
    order = ['lawn-maintenance', 'fertilization', 'hedge-trimming', 'mulch-installation', 'landscaping', 'christmas-lights', 'sod-installation',
             'drainage', 'hardscaping', 'retaining-walls', 'leaf-removal', 'tree-planting', 'tree-shrub-care']
    rows = ''
    for s in order:
        p = SERVICES[s]['price']
        amt = e(p['range'].replace('–', ' to ')) if p.get('range') else 'Free quote'
        unit = e(p.get('unit') or 'after a walkthrough')
        rows += f'<a class="prow" href="/{s}"><div><h3>{e(SERVICES[s]["name"])}</h3><p>{e(first_sentence(SERVICES[s]["lede"]))}</p></div><span class="amt">{amt}<small>{unit}</small></span><span class="ar" aria-hidden="true">&rarr;</span></a>'
    hero = (crumb([('Pricing', 'pricing')]) +
            f'<section class="hero blur solo" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><div><p class="kick">Pricing for Longview &amp; East Texas</p><h1>What it costs</h1>'
            f'<p class="lede">Weekly mowing runs about $50 to $65 a visit. One-time projects run from a few hundred dollars up into five figures. Below are honest ranges from our own Longview-area quotes, so you have a number before you reach out.</p>'
            f'<div class="acts"><a class="btn lg" href="/contact">Get my exact price</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div></div></div>{GRAIN}{swoosh()}</section>')
    body = hero + (f'<section class="sec"><div class="w"><h2 class="h2">The ballpark</h2><p class="sub">Totals homeowners pay, pulled from our own quotes around Longview, White Oak, Kilgore and Hallsville. Your free quote is the exact number.</p><div class="plist" style="margin-top:32px">{rows}</div>'
                   f'<p class="sub" style="margin-top:20px">Christmas lights more than an hour from Longview start at $1,800. Drainage details are in our <a href="/french-drain-cost-east-texas" style="color:var(--ink);font-weight:700">French drain cost guide</a>.</p></div></section>')
    body += ('<section class="sec stone"><div class="w split" style="align-items:start"><div><h2 class="h2">Why two yards get two numbers</h2><p>A range moves with a handful of real things. We measure them when we walk your property and put every line in writing. If the ground turns up a surprise, we show you and get your okay before we keep going.</p></div>'
             '<ul class="chk one" style="margin-top:8px"><li>Yard and area size, the biggest driver on most jobs</li><li>Materials: sod type, mulch, pavers, plants or stone</li><li>Site access: tight back gate or open drive-up lot</li><li>Plant size: mature plants cost more than starters</li><li>Wall height and length</li><li>Ground prep: leveling, grading or drainage first</li></ul></div></section>')
    body += ('<section class="sec dark" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><h2 class="h2">Design preview</h2><p class="sub">See your yard before we break ground. Flat-rate renderings, credited toward a qualifying install booked within 90 days.</p><div class="tiers"><div class="tier"><b>$199</b><h3>Flower beds</h3><p>Credited on installs of $1,500 or more.</p></div><div class="tier"><b>$449</b><h3>Hardscape</h3><p>Credited on installs of $3,000 or more.</p></div><div class="tier"><b>$999</b><h3>Full property</h3><p>Credited on installs of $5,000 or more.</p></div></div><p style="margin-top:30px"><a class="btn" href="/design-preview">How the design preview works</a></p></div></section>')
    qas = [('How much does landscaping cost in Longview, TX?', 'Routine lawn maintenance in Longview typically runs about $50 to $65 per visit for a standard yard. Most landscaping and planting projects run $900 to $3,600, and bigger builds like patios ($3,100 to $9,100) and retaining walls ($3,000 to $19,000) run more. We walk your property and send an exact, itemized quote before any work starts.'),
           ('How much does weekly mowing cost in Longview?', 'About $50 to $65 per visit for a typical residential yard, billed on a recurring schedule. Larger lots, heavy tree cover or extra trimming can move that. You get a flat per-visit price up front.'),
           ('How much does a paver patio or retaining wall cost in East Texas?', 'Most patios and hardscaping projects run $3,100 to $9,100. Retaining walls run from a few thousand dollars for a short garden wall to $20,000 or more for a tall structural wall, with most between $3,000 and $19,000.'),
           ('How much do Christmas lights cost?', 'Most homes start at $900 for professional lights we supply, install, take down and store. Installs more than an hour from Longview start at $1,800. We quote from a photo mock-up of your house.'),
           ('Why do you give ranges instead of a flat rate?', 'No two yards are the same. Size, materials, access, wall height and ground prep all change what a job takes. A flat rate would overcharge simple jobs or shortchange complex ones.'),
           ('Are quotes free?', 'Yes. We walk the property in person, usually within a day, and send a free written, itemized estimate with no pressure.')]
    body += f'<section class="sec"><div class="w faqw"><div><h2 class="h2">Cost questions</h2></div><div class="faq">{faq_html(qas)}</div></div></section>'
    body += f'<section class="sec stone"><div class="w"><div class="head"><div><h2 class="h2">Fair prices, say our customers</h2></div>{GBADGE}</div>{revs(["john", "penny", "david"])}</div></section>'
    body += cta('Want the exact number?', "We'll walk your yard and send a written, itemized quote within a day. Free.")
    t = 'How Much Does Landscaping Cost in Longview & East Texas? | Yard Dog Landscapes'
    desc = 'What landscaping costs in Longview, TX: honest price ranges for mowing, sod, mulch, patios, retaining walls, drainage and Christmas lights. Free exact quotes.'
    page('pricing', t, desc, body, [business_node(), faq_ld(qas), crumbs_ld([('Pricing', 'pricing')]), webpage_ld('pricing', t, desc)])

# ======================================================================= contact (official Platy embed, with photo upload)
def contact():
    embed = ('<div class="embedcard"><div class="platy-form-mount" data-platy-form="k10wty88jnyk6dfl2jsmve"></div>'
             '<script src="https://app.getplaty.com/platy-form.js" data-platy-form="k10wty88jnyk6dfl2jsmve" data-platy-src="https://app.getplaty.com/f/k10wty88jnyk6dfl2jsmve/embed"></script>'
             '<p class="fb">Trouble seeing the form? <a href="https://app.getplaty.com/f/k10wty88jnyk6dfl2jsmve" target="_blank" rel="noopener">Open it in a new tab</a> or text <a href="sms:+19035225291">(903) 522-5291</a>.</p></div>')
    info = (f'<div class="cinfo"><div><small>Text us (text only)</small><a href="sms:{PHONE_TEL}">{PHONE}</a></div><div><small>Email</small><a href="mailto:{EMAIL}">{EMAIL}</a></div>'
            f'<div><small>Hours</small><span>Text anytime. We reply fast.</span></div><div><small>Service area</small><span>Longview, Kilgore, White Oak, Hallsville, Marshall, Tyler and the rest of East Texas</span></div></div>')
    hero = (crumb([('Contact', 'contact')]) +
            f'<section class="hero blur contact" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><div><p class="kick">Free quote</p><h1>Get a free quote</h1>'
            f'<p class="lede">Tell us about your yard and add photos if you have them. We call within a day, walk the property with you, and send a written estimate. No pressure and no upsells.</p>'
            f'<p class="stars" style="margin-top:0">{STARS}<span><b>5.0</b> from 111 Google reviews</span></p>{info}</div>{embed}</div>{GRAIN}{swoosh()}</section>')
    nxt = ('<section class="sec"><div class="w"><h2 class="h2" style="margin-bottom:40px">What happens next</h2><div class="prom p3">'
           '<div><h3>We call you</h3><p>Within a day, from a real person in Longview. The same family that runs the company answers every text.</p></div>'
           '<div><h3>We walk it together</h3><p>We meet at the property, listen to what you want and measure what matters.</p></div>'
           '<div><h3>You get it in writing</h3><p>An itemized estimate, usually within a day. Take your time deciding.</p></div></div></div></section>')
    body = hero + nxt + f'<section class="sec stone"><div class="w"><div class="head"><div><h2 class="h2">Neighbors who called</h2></div>{GBADGE}</div>{revs(["travis", "anna", "staci"])}</div></section>'
    desc = 'Request a free lawn care, landscaping or patio quote in Longview and East Texas. We call within a day, walk the property and send a written estimate. (903) 522-5291.'
    cp = webpage_ld('contact', 'Get a free quote', desc, kind='ContactPage')
    page('contact', 'Contact Us: Free Landscaping Quote in Longview, TX | Yard Dog Landscapes', desc, body, [business_node(), cp, crumbs_ld([('Contact', 'contact')])])

# ======================================================================= careers (form markup and script kept exactly)
def careers():
    s = open(os.path.join(SRC, 'careers.html')).read()
    s = textify(s)
    form = re.search(r'(?s)<form id="careersForm".*?</form>', s).group(0)
    status = re.search(r'(?s)<div[^>]*id="applyStatus".*?</div>\s*</div>', s)
    status = status.group(0) if status else '<div id="applyStatus" class="apply-status" hidden><div class="apply-status-inner"></div></div>'
    scripts = re.findall(r'(?s)<script>(.*?)</script>', s)
    js = scripts[-1]
    js = js[js.find('// ---- Careers application submit ----'):]
    hero = (crumb([('Careers', 'careers')]) +
            f'<section class="hero photo solo" style="--bg:url(/img/bg-careers.jpg);--bp:center 35%"><div class="w"><div><p class="kick">Careers in Longview, TX</p><h1>Join the pack</h1>'
            f'<p class="lede">Good pay, a paid day to prove it, and a crew that takes care of each other. Get on the short list and you get the call first.</p><div class="acts"><a class="btn lg" href="#careersForm">Apply in 2 minutes</a></div></div></div>{GRAIN}{swoosh()}</section>')
    perks = ('<section class="sec"><div class="w"><h2 class="h2" style="margin-bottom:44px">Good hands get called first</h2><div class="prom">'
             '<div><h3>Top-of-market pay</h3><p>We pay above the going rate for good hands in East Texas, with room to earn more as you raise your game.</p></div>'
             '<div><h3>A paid trial day</h3><p>Your first day running the gear is paid. No free tryouts.</p></div>'
             '<div><h3>A real crew</h3><p>Steady work, good equipment, and teammates who carry their weight and look out for each other.</p></div>'
             '<div><h3>Room to climb</h3><p>Show us what you can do and the ceiling comes off.</p></div></div></div></section>')
    mos = ''.join(f'<figure class="{c}">{img(k)}</figure>' for k, c in [('d:walk-dsc03861', 't2'), ('d:rvpad-dsc03204', ''), ('d:crew-dsc03988', ''), ('d:walk-dsc03617', ''), ('d:crew-dsc04179', ''), ('d:walk-dsc03688', 'w2')])
    crewsec = f'<section class="sec stone tight"><div class="w"><div class="mos" style="grid-auto-rows:200px">{mos}</div></div></section>'
    app = (f'<section class="sec" id="apply"><div class="w">'
           f'{form}{status}</div></section>')
    body = hero + perks + crewsec + app + cta('Know someone who fits?', 'Send them this page. Good hands get called first.')
    t = 'Landscaping Jobs in Longview, TX | Join the Pack at Yard Dog Landscapes'
    desc = 'Yard Dog Landscapes is hiring good hands in Longview and East Texas. A two-minute application, a paid trial day, and pay above the going rate.'
    def job(title, d):
        return {'@context': 'https://schema.org', '@type': 'JobPosting', 'title': title, 'description': d, 'datePosted': TODAY, 'validThrough': '2027-04-01T00:00',
                'employmentType': 'FULL_TIME', 'directApply': True,
                'hiringOrganization': {'@type': 'Organization', '@id': BIZ_ID, 'name': 'Yard Dog Landscapes', 'sameAs': BASE + '/', 'logo': BASE + '/brand_assets/Yard%20Dog%20Logo.png'},
                'jobLocation': {'@type': 'Place', 'address': {'@type': 'PostalAddress', 'addressLocality': 'Longview', 'addressRegion': 'TX', 'addressCountry': 'US'}},
                'industry': 'Landscaping', 'occupationalCategory': '37-3011.00 Landscaping and Groundskeeping Workers',
                'workHours': 'Monday to Friday, early starts around 6 AM; Saturday overtime as needed',
                'jobBenefits': 'Pay above the going rate, a paid trial day, steady work, good equipment, room to advance', 'url': BASE + '/careers'}
    jobs = [job('Lawn Maintenance Crew Member', '<p>Yard Dog Landscapes in Longview, TX is hiring for the mowing and maintenance crew: weekly residential routes with zero-turn and stand-on mowers, string trimmers, edgers and blowers across Longview, White Oak, Kilgore and East Texas.</p><p>Pay above the going rate, a paid trial day, steady work, good equipment and room to climb. Monday through Friday with early starts around 6 AM; Saturday overtime as needed. Must be 18 or older with a valid driver\'s license and reliable transportation, and able to work outdoors in Texas heat lifting up to 50 lbs.</p>'),
            job('Landscape Install Crew Member', '<p>Yard Dog Landscapes in Longview, TX is hiring for the landscape and hardscape install crew: flagstone and paver patios, walkways, retaining walls, flower beds and drainage, working with a track loader, plate compactor and hand tools.</p><p>Pay above the going rate, a paid trial day, steady work, good equipment and room to climb. Monday through Friday with early starts around 6 AM; Saturday overtime as needed. Must be 18 or older with a valid driver\'s license and reliable transportation, and able to work outdoors in Texas heat lifting up to 50 lbs.</p>')]
    page('careers', t, desc, body, [business_node(), crumbs_ld([('Careers', 'careers')]), webpage_ld('careers', t, desc), *jobs],
         og_img='/img/bg-careers.jpg', extra_js=f'<script>\n{js}\n</script>')

# ======================================================================= design preview
def design_preview():
    def ba(before, after, wb, hb, alt_b, alt_a):
        return (f'<div class="ba" style="aspect-ratio:{wb}/{hb}"><img src="/img/design/{after}" alt="{e(alt_a)}" loading="lazy">'
                f'<img class="ba-top" src="/img/design/{before}" alt="{e(alt_b)}" loading="lazy"><span class="bl l">Before</span><span class="bl r">Design rendering</span>'
                f'<span class="ba-h" aria-hidden="true"></span><input type="range" min="0" max="100" value="50" aria-label="Slide to compare before and the design rendering"></div>')
    rows = [('front-yard-before.webp', 'front-yard-design-rendering.webp', 978, 697, 'Front yard design', 'A bare front yard, planned out',
             'A real rendering we sent a Longview homeowner before any work started: curved foundation beds and plantings drawn onto their own house.',
             'Front yard before landscape design in Longview TX', 'Design rendering of new front yard beds for a Longview TX home'),
            ('backyard-before.webp', 'backyard-patio-fire-pit-design-rendering.webp', 1110, 679, 'Hardscape design', 'Backyard flagstone patio and fire pit',
             'A bare backyard laid out as a flagstone patio with a built-in fire pit and seating area, so the homeowner could see it before any stone was ordered.',
             'Backyard before a patio design', 'Design rendering of a flagstone patio and fire pit in an East Texas backyard'),
            ('front-bed-before.webp', 'front-bed-lighting-design-rendering.webp', 1114, 659, 'Beds and lighting', 'Front bed, lit up after dark',
             'Layered plantings with pathway lights and uplighting on the foundation and trees, so you can see how the yard reads at night too.',
             'Front yard before a bed and lighting design', 'Design rendering of a front flower bed with landscape lighting at night')]
    bas = ''.join(f'<div class="barow">{ba(b, a, w, h, ab, aa)}<div><span class="pill">{e(k)}</span><h3>{e(t)}</h3><p>{e(d)}</p></div></div>' for b, a, w, h, k, t, d, ab, aa in rows)
    hero = (crumb([('Services', 'services'), ('Design preview', 'design-preview')]) +
            f'<section class="hero blur solo" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><div><p class="kick">Landscape design preview</p><h1>See your yard before we dig</h1>'
            f'<p class="lede">Not sure what you want yet? Send us your property and we send back one or two custom design renderings, so you can see the finished yard before anything is built. Flat rate, credited toward a qualifying install.</p>'
            f'<div class="acts"><a class="btn lg" href="/contact">Start a design preview</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div></div></div>{GRAIN}{swoosh()}</section>')
    body = hero + f'<section class="sec"><div class="w"><h2 class="h2">Drag the slider</h2><p class="sub">These are real renderings we sent homeowners before work started. They are design previews, not finished builds.</p><div class="bagrid" style="margin-top:40px">{bas}</div></div></section>'
    body += ('<section class="sec stone"><div class="w split" style="align-items:start"><div><h2 class="h2">Built for the homeowner who knows something needs to change</h2>'
             '<p>Most homeowners we meet start in the same place: "I know I want this yard to look better, but I don\'t know what I actually want." That\'s what the design preview is for. Point at the area you want covered, a front yard, a back yard, a single bed or the whole property, and we turn it into a plan you can react to.</p>'
             '<p>Each preview includes one or two design directions fitted to your property, your sun and your East Texas soil: plant placements, bed shapes, hardscape ideas, and how it all reads from the curb and from inside the house.</p></div>'
             '<ul class="chk one" style="margin-top:8px"><li>One or two digital design renderings of your space</li><li>Plant and material list picked for East Texas</li><li>Bed layout, dimensions and edging spec</li><li>Patios, walls and paths sketched in</li><li>Suggested phasing if the budget is tight</li><li>One round of revisions</li><li>A direct path to a written build estimate</li></ul></div></section>')
    body += ('<section class="sec"><div class="w"><h2 class="h2">How it works</h2><ol class="steps light" style="margin-top:36px">'
             '<li><h3>Tell us about the space</h3><p>Send photos and rough dimensions, or have us walk it in person. Point at what you want covered.</p></li>'
             '<li><h3>We sketch the concept</h3><p>Within a few business days you get one or two design directions with layouts, plant lists and hardscape elements.</p></li>'
             '<li><h3>Review and revise</h3><p>Keep what you love, swap what you don\'t. One round of revisions is included.</p></li>'
             '<li><h3>Quote and build</h3><p>The final design becomes the build plan, and the design fee is credited toward a qualifying install.</p></li></ol></div></section>')
    body += ('<section class="sec dark" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><h2 class="h2">Three flat-rate packages</h2><p class="sub">Each fee is credited toward your install if you book within 90 days and the install meets the package minimum.</p><div class="tiers">'
             '<div class="tier"><b>$199</b><h3>Flower bed preview</h3><p>For bare front beds, foundation plantings or single-bed refreshes. One bed rendering, plant list with sizes, bed shape and edging spec, one revision. Credited on installs of $1,500 or more.</p></div>'
             '<div class="tier"><b>$449</b><h3>Hardscape preview</h3><p>Flagstone or paver patios, walls, fire pits and walkways. One or two layout renderings, material spec, dimensions, base-prep and drainage notes, one revision. Credited on installs of $3,000 or more.</p></div>'
             '<div class="tier"><b>$999</b><h3>Full property</h3><p>The whole property in one design: two directions, plant list, hardscape spec, drainage and grading notes, a phasing plan and a walkthrough review call. Credited on installs of $5,000 or more.</p></div></div>'
             '<p class="sub" style="margin-top:22px">Larger or multi-zone properties are quoted separately.</p><p style="margin-top:26px"><a class="btn" href="/contact">Request a design preview</a></p></div></section>')
    qas = [('Do I have to commit to a build after the preview?', 'No. The preview is a standalone product. If you love the design and book the install within 90 days, the fee is credited toward the build when the install meets the package minimum. If you want to live with the design for a season first, that is fine too.'),
           ('What if I don\'t like the designs?', 'One round of revisions is included so we can rework the direction with your feedback. Most people land on something they love after the revision pass.'),
           ('How long does it take?', 'Typical turnaround is 5 to 10 business days from the time we have your photos and dimensions. Larger or multi-zone properties can take a bit longer, and we tell you up front.'),
           ('What if I only want a small area, like a single flower bed?', 'Smaller jobs are usually a better fit for a free on-site walkthrough and a written estimate, with no preview needed. The preview shines on bigger projects: full front yards, back yards, pool surrounds or a whole property.'),
           ('Do you serve outside Longview?', 'Yes. We work across East Texas, including White Oak, Kilgore, Lake Cherokee, Gladewater, Hallsville, Marshall, Tyler, Henderson, Gilmer, Big Sandy, Carthage and Nacogdoches.')]
    body += f'<section class="sec"><div class="w faqw"><div><h2 class="h2">Design preview questions</h2></div><div class="faq">{faq_html(qas)}</div></div></section>'
    body += cta('Ready to see your yard first?', "Tell us about the space and we'll send you one or two design directions you can react to.")
    t = 'Landscape Design Preview Longview TX | Yard Dog Landscapes'
    desc = 'See your yard before we build it. Flat-rate landscape design renderings in Longview, TX: $199 beds, $449 hardscape, $999 full property, credited toward your install.'
    svc = {'@context': 'https://schema.org', '@type': 'Service', 'serviceType': 'Landscape design', 'name': 'Landscape Design Preview', 'provider': {'@id': BIZ_ID},
           'areaServed': [city_place(TOWNS[x]) for x in TOWN_ORDER], 'url': BASE + '/design-preview',
           'offers': [{'@type': 'Offer', 'name': n, 'price': p, 'priceCurrency': 'USD'} for n, p in [('Flower bed preview', 199), ('Hardscape preview', 449), ('Full property preview', 999)]]}
    page('design-preview', t, desc, body, [business_node(), svc, faq_ld(qas), crumbs_ld([('Services', 'services'), ('Design preview', 'design-preview')]), webpage_ld('design-preview', t, desc)])

# ======================================================================= article-style pages rebuilt from their own content
def strip_classes(h):
    h = re.sub(r'(?s)<(script|style|svg)[^>]*>.*?</\1>', '', h)
    h = re.sub(r'\s(class|style|id|role|aria-[a-z]+)="[^"]*"', '', h)
    h = re.sub(r'href="(?!https?:|tel:|mailto:|#|/)([a-z0-9-]+)"', r'href="/\1"', h)
    return h

def cost_guide():
    s = textify(open(os.path.join(SRC, 'french-drain-cost-east-texas.html')).read())
    lds = [json.loads(b) for b in re.findall(r'(?s)<script type="application/ld\+json">(.*?)</script>', s)]
    faq = next((d for d in lds if d.get('@type') == 'FAQPage'), None)
    qas = [(q['name'], q['acceptedAnswer']['text']) for q in faq['mainEntity']] if faq else []
    rows = [('Small drainage fix or downspout reroute', '$450 to $1,000', 'A short run, redirecting one or two downspouts, or draining a single low spot away from the house.'),
            ('Standard French drain (single run)', '$1,900 to $3,000', 'Roughly 40 to 80 feet of sock-wrapped perforated pipe over #57 stone, tied to a daylighted outlet or pop-up emitter, with sod restored on top.'),
            ('Full drainage system', '$3,000 to $4,500', 'Multiple drain runs, catch basins, surface regrading, and a river rock or dry-creek finish across a larger area of the yard.'),
            ('Large or combined project', '$4,500 and up', 'Extensive footage, whole-property regrading, or drainage bundled with a bed rebuild, retaining wall, or full landscape install.')]
    table = '<div class="tablewrap"><table><thead><tr><th>Project</th><th>Typical installed cost</th><th>What it usually includes</th></tr></thead><tbody>' + ''.join(f'<tr><td><b>{e(a)}</b></td><td>{e(b)}</td><td>{e(c)}</td></tr>' for a, b, c in rows) + '</tbody></table></div>'
    drivers = [('Linear footage of pipe', 'The biggest single factor. A 40-foot run costs far less than a 120-foot perimeter drain around the whole foundation.'),
               ('Digging depth and access', 'Deeper trenches and tight backyards a skid steer can\'t reach mean more hand labor, and our clay subsoil is slow to dig.'),
               ('Where the water goes', 'A drain that daylights to a ditch is cheaper than one needing a long outlet run, a pop-up emitter, or a pump.'),
               ('Surface restoration', 'Putting the yard back with fresh sod, river rock or a dry-creek finish adds material and labor on top of the drain itself.'),
               ('Catch basins and grading', 'Surface catch basins, channel drains and regrading low spots often get bundled in when one drain alone won\'t solve it.'),
               ('Combined work', 'Drainage behind a new retaining wall or under a bed rebuild shares labor, but adds scope to the overall number.')]
    drv = '<div class="notes" style="margin-top:28px">' + ''.join(f'<div><h3>{e(a)}</h3><p>{e(b)}</p></div>' for a, b in drivers) + '</div>'
    hero = (crumb([('Drainage', 'drainage'), ('Cost guide', 'french-drain-cost-east-texas')]) +
            f'<section class="hero photo solo" style="--bg:url({photo("img-3452")["full"]});--bp:center 50%"><div class="w"><div><p class="kick">2026 cost guide</p><h1>French drain &amp; yard drainage cost in East Texas</h1>'
            f'<p class="lede">Real price ranges for French drains, surface drainage and regrading in Longview and across East Texas: what they cost, what drives the number, and why the cheapest drain is rarely the cheapest in the long run.</p>'
            f'<div class="acts"><a class="btn lg" href="/contact">Get a free drainage quote</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div><p class="tag">Pictured: drain tubing going in on one of our jobs</p></div></div>{GRAIN}{swoosh()}</section>')
    body = hero + ('<section class="sec"><div class="w"><div class="answer"><h2>How much does a French drain cost in East Texas?</h2><p>Most French drain systems in the Longview and East Texas area run $2,000 to $4,500 installed. Small, single-problem fixes like rerouting a downspout or draining one low spot start around $450 to $1,000, while larger whole-property systems, or drainage bundled with regrading and landscape work, run $4,500 and up. The price depends on how many feet of pipe the yard needs, how deep the crew has to dig, where the water can be sent, and how much sod or stone goes back on top. Text (903) 522-5291 for a free assessment.</p></div>'
                   f'<div class="doc" style="margin-top:44px;max-width:980px"><h2>What drainage costs in East Texas</h2>{table}<p>Ranges reflect real Yard Dog drainage jobs across Gregg, Harrison, Smith and Upshur counties. Your yard drains its own way, so the only accurate number is a free on-site quote.</p></div></div></section>')
    body += f'<section class="sec stone"><div class="w"><h2 class="h2">What moves the price</h2>{drv}</div></section>'
    body += ('<section class="sec"><div class="w doc">'
             '<h2>Is there a per-foot price for a French drain?</h2><p>Roughly, most East Texas French drains land between $40 and $70 per linear foot installed, once you include sock-wrapped pipe, #57 drainage stone, a real outlet and sod restoration. But a per-foot number is misleading on its own. Short runs cost more per foot because the crew still has to mobilize, haul stone and set an outlet for a small job, while long straight runs come down per foot. Depth, soil and what goes back on top move the number more than length alone, which is why we price the whole system, not a flat rate per foot.</p>'
             '<h2>The drainage we install, and when each makes sense</h2>'
             '<p><b>French drains</b> are the workhorse for subsurface water and soggy ground: a gravel and perforated-pipe trench that collects water underground and carries it off. Best when water pools and lingers, or a foundation is weeping moisture.</p>'
             '<p><b>Surface and channel drains</b> catch water on top, at the base of a slope, across a driveway, or where a patio sheds runoff. They are usually the cheaper fix when the water is visible on the surface.</p>'
             '<p><b>Catch basins and pop-up emitters</b> collect water at a low point and discharge it somewhere safe. Often paired with a French drain rather than used alone.</p>'
             '<p><b>Downspout extensions and rerouting</b> are the cheapest, highest-value fix on a lot of properties: get the gutter water away from the foundation before it ever pools.</p>'
             '<p><b>Swales and dry creek beds</b> move surface water along a graded, rock-lined path, a fix that looks like a landscape feature instead of a construction scar.</p>'
             '<p><b>Regrading</b> re-slopes the ground so water runs away from the house on its own, sometimes removing the need for pipe entirely.</p>'
             '<h2>The cheapest French drain is the one you pay for twice</h2><p>When we install a French drain, we use sock-wrapped 4-inch perforated pipe over 4 inches of #57 stone, backfilled with the same stone to within a few inches of grade, then capped with soil and sod. That spec costs more than the corrugated-pipe-in-a-rock-bag version a lot of outfits install, but it doesn\'t silt up and clog in the third year. We also tie every drain to a daylighted outlet or a pop-up emitter, never a buried catch-all that backs up the first time the soil saturates.</p>'
             '<h2>Why East Texas yards hold water</h2><p>Most standing-water problems here come down to the soil profile: sandy topsoil over dense red-clay subsoil that water can\'t soak through. Once the upper foot saturates, water has nowhere to go but sideways, pooling in low spots and running toward the foundation. Add heavy rains that come in stretches and new-construction pads that settle over time, and you get the soggy backyards we fix every spring. Because the clay traps the water, redirecting it is usually the only real fix, not just adding topsoil or planting over the wet spot.</p>'
             '<p>See our full <a href="/drainage">drainage and grading service</a>, or drainage in <a href="/drainage-longview-tx">Longview</a>, <a href="/drainage-kilgore-tx">Kilgore</a>, <a href="/drainage-hallsville-tx">Hallsville</a>, <a href="/drainage-marshall-tx">Marshall</a> and <a href="/drainage-tyler-tx">Tyler</a>.</p></div></section>')
    if qas:
        body += f'<section class="sec stone"><div class="w faqw"><div><h2 class="h2">French drain cost questions</h2></div><div class="faq">{faq_html(qas)}</div></div></section>'
    body += cta('Want a real number for your yard?', "We'll walk the property, find where the water is actually going, and hand you a written, itemized price. Free.")
    t = re.search(r'<title>([^<]*)', s).group(1)
    desc = H.unescape(re.search(r'name="description" content="([^"]*)"', s).group(1))
    art = {'@context': 'https://schema.org', '@type': 'Article', 'headline': 'French Drain & Yard Drainage Cost in East Texas (2026)', 'description': desc,
           'author': {'@type': 'Person', '@id': BASE + '/#miller', 'name': 'Miller Maines'}, 'publisher': {'@id': BIZ_ID}, 'dateModified': TODAY,
           'mainEntityOfPage': BASE + '/french-drain-cost-east-texas', 'image': abs_url(photo('img-3452')['full'])}
    page('french-drain-cost-east-texas', H.unescape(t), desc, body, [business_node(), art, faq_ld(qas), crumbs_ld([('Drainage', 'drainage'), ('Cost guide', 'french-drain-cost-east-texas')])])

def legal(slug, h1):
    s = textify(open(os.path.join(SRC, f'{slug}.html')).read())
    i = s.find('<div class="legal">')
    j = s.find('</section>', i)
    inner = s[i + len('<div class="legal">'):j]
    inner = inner[:inner.rfind('</div>')]
    inner = inner[:inner.rfind('</div>')]
    t = H.unescape(re.search(r'<title>([^<]*)', s).group(1))
    desc = H.unescape(re.search(r'name="description" content="([^"]*)"', s).group(1))
    hero = crumb([(h1, slug)]) + f'<section class="hero plain solo" style="padding-block:48px 92px"><div class="w"><div><h1>{e(h1)}</h1></div></div>{swoosh()}</section>'
    body = hero + f'<section class="sec" style="padding-top:24px"><div class="w doc">{strip_classes(inner)}</div></section>'
    page(slug, t, desc, body, [crumbs_ld([(h1, slug)])])

def field_notes():
    s = open(os.path.join(ROOT, 'field-notes.html')).read()
    m = re.search(r'(?s)<!-- FIELD_NOTES:START -->(.*?)<!-- FIELD_NOTES:END -->', s)
    notes = m.group(1).strip() if m else '<p class="field-notes-empty">No field notes yet. Check back soon.</p>'
    hero = crumb([('Field notes', 'field-notes')]) + f'<section class="hero blur solo" style="--bg:url(/img/bg-blur.jpg)"><div class="w"><div><h1>Field notes</h1><p class="lede">Quick notes and photos straight from the crew, posted from the yard. Real jobs across Longview and East Texas.</p></div></div>{GRAIN}{swoosh()}</section>'
    body = hero + f'<section class="sec"><div class="w doc"><!-- FIELD_NOTES:START -->\n{notes}\n<!-- FIELD_NOTES:END --></div></section>' + cta('Want your yard to make the notes?', "We'll come walk the property and tell you what's actually going on. Free quote, no pressure.")
    empty = 'field-notes-empty' in notes
    page('field-notes', 'Field Notes | Yard Dog Landscapes: From the East Texas Crew', 'Quick notes and photos from the Yard Dog crew, posted from real jobs across Longview and East Texas.', body,
         [crumbs_ld([('Field notes', 'field-notes')])], robots='noindex, follow' if empty else 'index, follow',
         extra_head=f'<link rel="alternate" type="application/rss+xml" title="Yard Dog Landscapes Field Notes" href="{BASE}/field-notes.xml">')

def not_found():
    body = (f'<section class="sec nf"><div class="w"><h1>That page wandered off</h1><p class="lead2">The link may be old or mistyped. Here is where most people are headed:</p>'
            f'<div class="stiles" style="margin-top:28px"><a class="stile" href="/"><h3>Home</h3><p>Start over from the top.</p></a><a class="stile" href="/services"><h3>Services</h3><p>Everything we do, with prices.</p></a>'
            f'<a class="stile" href="/our-work"><h3>Our work</h3><p>{len(PHOTOS)} photos from real jobs.</p></a><a class="stile" href="/contact"><h3>Free quote</h3><p>Tell us what you need.</p></a></div>'
            f'<p class="sub" style="margin-top:28px">Or text <a href="sms:{PHONE_TEL}" style="font-weight:700;color:var(--ink)">{PHONE}</a>.</p></div></section>')
    page('404', 'Page not found | Yard Dog Landscapes', 'This page could not be found.', body, [], robots='noindex, follow', canonical=BASE + '/404')

def build():
    home(); about(); our_work(); services_hub(); service_areas(); pricing(); contact(); careers(); design_preview(); cost_guide()
    legal('privacy', 'Privacy Policy'); legal('terms', 'Terms & Conditions'); field_notes(); not_found()
