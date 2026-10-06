"""Service pages, town pages, and service-in-town pages."""
import json, re
from common import *  # noqa

PRICE_PUBLIC = {s: SERVICES[s]['price'] for s in SERVICES}

def fill(t, town):
    return t.replace('{town}', town['name']).replace('{county}', town['county'])

def first_sentence(t):
    m = re.match(r'(.+?[.?])(\s|$)', t)
    return m.group(1) if m else t

def facts_list(items):
    return '<ul class="facts">' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>'

STD_FACTS = ['5.0 on Google from 111 reviews', 'Free written estimate within a day', 'Same crew every visit, never subcontracted']

def city_place(t):
    d = {'@type': 'City' if t['slug'] != 'lake-cherokee-tx' else 'Place', 'name': f"{t['name']}, TX",
         'containedInPlace': {'@type': 'AdministrativeArea', 'name': f"{t['county']}, Texas"}}
    if t['slug'] != 'lake-cherokee-tx':  # a lake has no single center point worth claiming
        lat, lng = GEO[t['slug']]
        d['geo'] = {'@type': 'GeoCoordinates', 'latitude': lat, 'longitude': lng}
    return d

def service_ld(s, url, town=None, imgs=()):
    d = {'@context': 'https://schema.org', '@type': 'Service', '@id': url + '#service',
         'serviceType': s['name'], 'name': (f"{s['name']} in {town['name']}, TX" if town else f"{s['name']} in Longview, TX"),
         'description': fill(s['town_template']['lede'], town) if town else s['lede'],
         'provider': {'@id': BIZ_ID}, 'url': url,
         'areaServed': city_place(town) if town else [city_place(TOWNS[t]) for t in TOWN_ORDER]}
    p = s['price']
    nums = re.findall(r'\$([\d,]+)', p.get('range') or '')
    if nums:
        spec = {'@type': 'PriceSpecification', 'priceCurrency': 'USD', 'minPrice': int(nums[0].replace(',', ''))}
        if len(nums) > 1:
            spec['maxPrice'] = int(nums[1].replace(',', ''))
        d['offers'] = {'@type': 'Offer', 'priceSpecification': spec, 'description': f"{p['range']} {p.get('unit') or ''}".strip(),
                       'availability': 'https://schema.org/InStock', 'seller': {'@id': BIZ_ID}}
    if imgs:
        d['image'] = [abs_url(photo(k)['full']) for k in imgs[:6]]
    return d

def pricecard(s, town=None, fid='q'):
    p = s['price']
    where = f" in {town['name']}" if town else ''
    if p.get('range'):
        top = f'<p class="pl">What {e(s["short"])} costs{e(where)}</p><b>{e(p["range"].replace("–", "&ndash;"))}</b><span class="pu">{e(p.get("unit") or "")}</span>'
    else:
        top = f'<p class="pl">What {e(s["short"])} costs{e(where)}</p><b>Free quote</b><span class="pu">priced after a walkthrough</span>'
    top = top.replace('&amp;ndash;', '&ndash;')
    fac = ''.join(f'<li>{e(x)}</li>' for x in p.get('factors', [])[:6])
    return (f'<div class="pricecard">{top}<p class="pn">{e(p.get("note") or "")}</p><ul>{fac}</ul>'
            f'<a class="btn" href="#{fid}">Get my exact price</a><a class="tl" href="sms:{PHONE_TEL}">or text {PHONE}</a></div>')

def steps_html(s, light=True):
    pr = s['process']
    cls = 'steps light' + (' s5' if len(pr) == 5 else '')
    return f'<ol class="{cls}">' + ''.join(f'<li><h3>{e(x["title"])}</h3><p>{e(x["text"])}</p></li>' for x in pr) + '</ol>'

def strip(keys, s3=False):
    out = []
    for k in keys:
        p = photo(k)
        where = p['place'] if p['place'] and p['place'] != 'East Texas' else 'East Texas'
        link = f'/our-work#job={p["job"]}' if p.get('job') and p['job'] not in ('more', 'lawn') else '/our-work'
        out.append(f'<figure><a href="{link}">{img(k)}</a><figcaption><b>{e(p["caption"])}</b>{e(where)}</figcaption></figure>')
    return f'<div class="strip{" s3" if s3 else ""}">' + ''.join(out) + '</div>'

def hero_bg(key):
    return photo(key)['full']

def quote_section(s=None, town=None, fid='q'):
    pre = PRESELECT.get(s['slug']) if s else None
    where = f" in {town['name']}" if town else ''
    title = f"Get a free {s['short']} quote{where}" if s else f"Get a free quote{where}"
    copy = (f"<h2 class='h2'>{e(title)}</h2><p class='lead2'>Tell us what you need and where. We call within a day, walk the property with you and send a "
            f"written, itemized estimate. No pressure and no surprise add-ons.</p>"
            f"<ul class='chk one' style='margin-top:24px'><li>Free on-site walkthrough</li><li>Written estimate, usually within a day</li>"
            f"<li>Same crew every visit, never subcontracted</li><li>Fully insured, 5.0 on Google from 111 reviews</li></ul>")
    return (f'<section class="sec stone" id="{fid}-s"><div class="w qwrap"><div class="qcopy">{copy}</div>'
            f'{quote_form(fid, preselect=pre, town=town["name"] if town else None)}</div></section>')

# ======================================================================= service pages
def service_page(slug):
    s = SERVICES[slug]
    url = BASE + '/' + slug
    hk = SERVICE_HERO.get(slug)
    ph = pool(slug)
    gallery = [k for k in ph if k != hk][:8]
    if hk:
        hero_open = f'<section class="hero photo" style="--bg:url({hero_bg(hk)});--bp:center 55%">'
        pic = photo(hk)
        tag = f'<p class="tag">Pictured: {e(pic["caption"])}{", " + e(pic["place"]) if pic["place"] and pic["place"] != "East Texas" else ""}</p>'
    else:
        hero_open, tag = '<section class="hero plain">', ''
    hero = (crumb([('Services', 'services'), (s['name'], slug)]) + hero_open +
            f'<div class="w"><div><p class="kick">{e(s["kicker"])}</p><h1>{e(s["h1"])}</h1><p class="lede">{e(s["lede"])}</p>'
            f'<div class="acts"><a class="btn lg" href="#q">Get a free quote</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div>'
            f'{facts_list(STD_FACTS)}{tag}</div></div>{GRAIN}{swoosh()}</section>')
    q = s['faq'][0]['q'] if False else None
    answer_q = {'christmas-lights': 'Who installs Christmas lights in Longview, TX?'}.get(slug) or f"Who does {s['short']} in Longview, TX?"
    if slug in ('hardscaping',):
        answer_q = 'Who builds patios and walkways in Longview, TX?'
    if slug == 'retaining-walls':
        answer_q = 'Who builds retaining walls in Longview, TX?'
    body = hero + (f'<section class="sec"><div class="w"><div class="answer"><h2>{e(answer_q)}</h2><p>{e(s["answer"])}</p></div></div></section>'
            f'<section class="sec mt0" style="padding-top:0"><div class="w body2"><div class="prose2">'
            f'<h2 class="h2">What we do</h2>' + ''.join(f'<p>{e(p)}</p>' for p in s['overview']) +
            '<ul class="chk big">' + ''.join(f'<li>{e(x)}</li>' for x in s['included']) + '</ul></div>'
            f'<aside>{pricecard(s)}</aside></div></section>')
    body += (f'<section class="sec stone"><div class="w"><h2 class="h2">How the job goes</h2>'
             f'<p class="sub">{e(s["timing"])}</p><div style="margin-top:36px">{steps_html(s)}</div></div></section>')
    if gallery:
        body += (f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">Our {e(s["short"])} work</h2>'
                 f'<p class="sub">Real jobs by our crew, with where they were built. Tap any photo to see the whole project.</p></div>'
                 f'<a class="more" href="/our-work">See all {len(PHOTOS)} photos</a></div>{strip(gallery[:4])}</div></section>')
    et = s['east_texas']
    body += (f'<section class="sec{" stone" if not gallery else ""}" style="{"" if not gallery else "padding-top:24px"}"><div class="w etx"><h2>{e(et["title"])}</h2><div>'
             + ''.join(f'<p>{e(p)}</p>' for p in et['text']) + '</div></div></section>')
    qas = [(x['q'], x['a']) for x in s['faq']]
    body += (f'<section class="sec stone"><div class="w faqw"><div><h2 class="h2">{e(s["name"])} questions</h2>'
             f'<p class="sub">Something else on your mind? Text <a href="sms:{PHONE_TEL}" style="font-weight:700;color:var(--ink)">{PHONE}</a>.</p></div>'
             f'<div class="faq">{faq_html(qas)}</div></div></section>')
    tg = ''.join(f'<a href="/{slug}-{t}">{e(TOWNS[t]["name"])}<small>{e(TOWNS[t]["county"])}</small></a>' for t in TOWN_ORDER)
    body += (f'<section class="sec"><div class="w"><h2 class="h2">{e(s["name"])} near you</h2>'
             f'<p class="sub">We work all over East Texas from our home base in Longview. Pick your town for local details and answers.</p>'
             f'<div class="tgrid" style="margin-top:28px">{tg}</div></div></section>')
    rel = ''.join(f'<a class="stile" href="/{r}"><h3>{e(SERVICES[r]["name"])}</h3><p>{e(first_sentence(SERVICES[r]["lede"]))}</p></a>' for r in s['related'] if r in SERVICES)
    blogs = [b for b in s.get('blog', []) if os.path.exists(os.path.join(ROOT, b + '.html'))]
    blog_html = ''
    if blogs:
        import pages_blog
        blog_html = ('<h3 class="h3" style="margin-top:44px">From the blog</h3><div class="stiles">' +
                     ''.join(f'<a class="stile" href="/{b}"><h3 style="font:700 17px/1.35 var(--sans);text-transform:none">{e(pages_blog.POSTS[b]["title"])}</h3><p>{e(pages_blog.POSTS[b]["date_h"])}</p></a>' for b in blogs if b in pages_blog.POSTS) + '</div>')
    body += f'<section class="sec stone"><div class="w"><h2 class="h2">Related services</h2><div class="stiles" style="margin-top:28px">{rel}</div>{blog_html}</div></section>'
    rv = SERVICE_REVIEWS.get(slug, DEFAULT_REVIEWS)
    body += f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">What customers say</h2></div>{GBADGE}</div>{revs(rv)}</div></section>'
    body += quote_section(s)
    ld = [business_node(), service_ld(s, url, imgs=([hk] if hk else []) + gallery), faq_ld(qas),
          crumbs_ld([('Services', 'services'), (s['name'], slug)]), webpage_ld(slug, s['title'], s['meta'], abs_url(hero_bg(hk)) if hk else None)]
    page(slug, s['title'], s['meta'], body, ld, og_img=hero_bg(hk) if hk else None, extra_js='<script src="/quote.js?v=1" defer></script>')

# ======================================================================= town hubs
GENERIC_HEROES = ['front-roses-after', 'img-3738', 'img-3523', 'deck-after', '4', 'img-3526', '6', 'side-hydrangeas-after',
                  'img-3737', 'd:crew-dsc04076', 'img-3525', '3']
LOCAL_HERO = {'kilgore-tx': 'd:walk-dsc03930', 'white-oak-tx': 'white-oak-flagstone-patio-after', 'lake-cherokee-tx': 'driveway-retaining-wall-after'}
LOCAL_JOBS = {'kilgore-tx': ['walkway', 'checker'], 'white-oak-tx': ['whiteoak', 'rvpad'], 'lake-cherokee-tx': ['driveway']}
JOB_TEXT = {
    'walkway': ('Flagstone walkway & chopped stone borders', 'September 2026', 'A flagstone walkway framed in chopped stone, run from the drive to the back porch with path lights along both sides. Base compacted, every border stone shaped and set by hand.'),
    'checker': ('Checkerboard paver patio', 'April 2026', 'A worn-out backyard off a covered brick porch turned into a checkerboard concrete paver patio with gravel joints, laid out on a compacted base.'),
    'whiteoak': ('Flagstone patio & fire pit', 'August 2026', '475 square feet of Cherokee flagstone with chopped stone edging around a chopped stone fire pit. One corner sits up on a chopped stone wall where the yard falls away.'),
    'rvpad': ('Raised boat & RV pad', 'September 2026', 'A level pad for a boat and RV: a pressure-treated timber wall set and lined up, fill hauled in and compacted with a track loader, drainage fabric down and gravel spread on top.'),
    'driveway': ('Driveway retaining wall rebuild', 'July 2026', 'A leaning block wall along a driveway pulled out and rebuilt course by course on a compacted base, with drainage fabric and pipe behind it.'),
}

def town_hero_key(tslug, idx):
    if tslug in LOCAL_HERO:
        return LOCAL_HERO[tslug]
    return GENERIC_HEROES[idx % len(GENERIC_HEROES)]

def job_keys(job, n=3):
    fin = [p['key'] for p in PHOTOS if p['job'] == job and p['kind'] == 'finished']
    wrk = [p['key'] for p in PHOTOS if p['job'] == job and p['kind'] != 'finished']
    return (fin[:2] + wrk[:1] + fin[2:] + wrk[1:])[:n]

def local_block(job, town):
    t, d, txt = JOB_TEXT[job]
    keys = job_keys(job, 3)
    n = sum(1 for p in PHOTOS if p['job'] == job)
    imgs = ''.join(img(k) for k in keys)
    return (f'<div class="local" style="margin-top:36px"><div class="lp">{imgs}</div><div><span class="pill">{e(town["name"])}, {e(d)}</span>'
            f'<h3 class="h2" style="font-size:clamp(28px,3.2vw,40px);margin-top:12px">{e(t)}</h3><p>{e(txt)}</p>'
            f'<p style="margin-top:18px"><a class="more" href="/our-work#job={job}">See all {n} photos</a></p></div></div>')

def town_page(tslug, idx):
    t = TOWNS[tslug]
    url = BASE + '/' + tslug
    hk = 'TRUCK' if tslug == 'longview-tx' else town_hero_key(tslug, idx)
    if hk == 'TRUCK':
        bg, tag = '/img/yard-dog-truck-and-track-loader.webp', '<p class="tag">Pictured: a Yard Dog truck and track loader on a job</p>'
    else:
        p = photo(hk); bg = p['full']
        tag = f'<p class="tag">Pictured: {e(p["caption"])}{", " + e(p["place"]) if p["place"] and p["place"] != "East Texas" else ""}</p>'
    facts = [e(t['county']) + (', Texas' if True else ''), e(t['drive'][0].upper() + t['drive'][1:]), '5.0 on Google from 111 reviews']
    hero = (crumb([('Service areas', 'service-areas'), (f"{t['name']}, TX", tslug)]) +
            f'<section class="hero photo" style="--bg:url({bg});--bp:center 55%"><div class="w"><div><p class="kick">{e(t["name"])}, Texas</p>'
            f'<h1>{e(t["h1"])}</h1><p class="lede">{e(t["lede"])}</p>'
            f'<div class="acts"><a class="btn lg" href="#q">Get a free quote</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div>'
            f'{facts_list(facts)}{tag}</div></div>{GRAIN}{swoosh()}</section>')
    intro = t['intro']
    body = hero + (f'<section class="sec"><div class="w"><div class="answer"><h2>Who does landscaping and lawn care in {e(t["name"])}, TX?</h2><p>{e(intro[0])}</p></div>'
            f'<div class="doc" style="margin-top:32px;max-width:780px">' + ''.join(f'<p>{e(p)}</p>' for p in intro[1:]) + '</div>')
    body += '</div></section>'
    if tslug in LOCAL_JOBS:
        body += (f'<section class="sec stone"><div class="w"><h2 class="h2">Recent work in {e(t["name"])}</h2>'
                 + ''.join(local_block(j, t) for j in LOCAL_JOBS[tslug]) + '</div></section>')
    notes = ''.join(f'<div><h3>{e(n["title"])}</h3><p>{e(n["text"])}</p></div>' for n in t['yard_notes'])
    body += f'<section class="sec"><div class="w"><h2 class="h2">What {e(t["name"])} yards deal with</h2><div class="notes" style="margin-top:32px">{notes}</div></div></section>'
    pop = t.get('popular', [])
    order = [s for s in pop if s in SERVICES] + [s for s in SERVICE_ORDER if s not in pop]
    tiles = ''.join(
        f'<a class="stile{" pop" if s in pop else ""}" href="/{s}-{tslug}"><h3>{e(SERVICES[s]["name"])}</h3>'
        f'<p>{e(first_sentence(t["service_angles"][s]))}</p>'
        f'<span class="pr">{e(SERVICES[s]["price"]["range"].replace("–", " to ") + " " + (SERVICES[s]["price"].get("unit") or "")) if SERVICES[s]["price"].get("range") else "Free quote"}</span></a>'
        for s in order)
    body += (f'<section class="sec stone"><div class="w"><h2 class="h2">Services in {e(t["name"])}</h2>'
             f'<p class="sub">Every service we offer, with what matters for {e(t["name"])} yards. The ones with a red outline are what people here ask us for most.</p>'
             f'<div class="stiles" style="margin-top:28px">{tiles}</div></div></section>')
    if t.get('areas') or t.get('landmarks'):
        areas = ''.join(f'<span class="pill">{e(x)}</span> ' for x in t.get('areas', []))
        lms = ', '.join(e(x) for x in t.get('landmarks', []))
        body += (f'<section class="sec tight"><div class="w"><h2 class="h2" style="font-size:clamp(28px,3.4vw,40px)">Where we work around {e(t["name"])}</h2>'
                 f'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:20px">{areas}</div>'
                 + (f'<p class="sub" style="margin-top:16px">Near {lms}.</p>' if lms else '') + '</div></section>')
    qas = [(x['q'], x['a']) for x in t['faq']]
    body += (f'<section class="sec stone"><div class="w faqw"><div><h2 class="h2">{e(t["name"])} questions</h2></div>'
             f'<div class="faq">{faq_html(qas)}</div></div></section>')
    near = ''.join(f'<a href="/{n}">{e(TOWNS[n]["name"])}<small>{e(TOWNS[n]["county"])}</small></a>' for n in t['nearby'] if n in TOWNS)
    body += (f'<section class="sec"><div class="w"><h2 class="h2">Nearby towns we cover</h2><div class="tgrid" style="margin-top:24px">{near}'
             f'<a href="/service-areas">All service areas<small>13 towns</small></a></div></div></section>')
    rv = ['anna', 'travis', 'staci'] if tslug == 'white-oak-tx' else DEFAULT_REVIEWS
    body += f'<section class="sec stone"><div class="w"><div class="head"><div><h2 class="h2">What customers say</h2></div>{GBADGE}</div>{revs(rv)}</div></section>'
    body += quote_section(None, t)
    wp = webpage_ld(tslug, t['hub_title'], t['hub_meta'], abs_url(bg))
    wp['about'] = [{'@id': BIZ_ID}, city_place(t)]
    wp['spatialCoverage'] = city_place(t)
    ld = [business_node(), wp, faq_ld(qas), crumbs_ld([('Service areas', 'service-areas'), (f"{t['name']}, TX", tslug)])]
    page(tslug, t['hub_title'], t['hub_meta'], body, ld, og_img=bg, extra_js='<script src="/quote.js?v=1" defer></script>')

# ======================================================================= service x town
def combo_page(slug, tslug, tidx):
    s, t = SERVICES[slug], TOWNS[tslug]
    tt = s['town_template']
    name = f'{slug}-{tslug}'
    url = BASE + '/' + name
    ph = pool(slug, tslug)
    local = [k for k in ph if photo(k).get('town') == tslug]
    hk = None
    if local:
        hk = local[0]
    elif ph:
        hk = ph[tidx % len(ph)]  # each town leads with a different real photo of this work
    if slug == 'christmas-lights':
        hk = SERVICE_HERO[slug]
    if hk:
        p = photo(hk)
        hero_open = f'<section class="hero photo" style="--bg:url({p["full"]});--bp:center 55%">'
        tag = f'<p class="tag">Pictured: {e(p["caption"])}{", " + e(p["place"]) if p["place"] and p["place"] != "East Texas" else ""}</p>'
    else:
        hero_open, tag = '<section class="hero plain">', ''
    title, meta = fill(tt['title'], t), fill(tt['meta'], t)
    h1 = fill(tt['h1'], t)
    hero = (crumb([(f"{t['name']}, TX", tslug), (s['name'], name)]) + hero_open +
            f'<div class="w"><div><p class="kick">{e(t["name"])}, Texas</p><h1>{e(h1)}</h1><p class="lede">{e(fill(tt["lede"], t))}</p>'
            f'<div class="acts"><a class="btn lg" href="#q">Get a free quote</a><a class="tel2" href="sms:{PHONE_TEL}">Text {PHONE}</a></div>'
            f'{facts_list([e(t["county"]) + ", Texas", STD_FACTS[1], STD_FACTS[2]])}{tag}</div></div>{GRAIN}{swoosh()}</section>')
    aq = {'hardscaping': f"Who builds patios and walkways in {t['name']}, TX?", 'retaining-walls': f"Who builds retaining walls in {t['name']}, TX?",
          'christmas-lights': f"Who installs Christmas lights in {t['name']}, TX?"}.get(slug, f"Who does {s['short']} in {t['name']}, TX?")
    body = hero + (f'<section class="sec"><div class="w"><div class="answer"><h2>{e(aq)}</h2><p>{e(fill(tt["answer"], t))}</p></div></div></section>'
            f'<section class="sec" style="padding-top:0"><div class="w body2"><div class="prose2">'
            f'<h2 class="h2">{e(s["name"])} for {e(t["name"])} yards</h2><p>{e(t["service_angles"][slug])}</p>'
            f'<p>{e(s["overview"][0])}</p>'
            f'<h3 class="h3" style="margin-top:28px">What\'s included</h3><ul class="chk big">' + ''.join(f'<li>{e(x)}</li>' for x in s['included']) + '</ul></div>'
            f'<aside>{pricecard(s, t)}</aside></div></section>')
    body += (f'<section class="sec stone"><div class="w"><h2 class="h2">How the job goes</h2><p class="sub">{e(s["timing"])}</p>'
             f'<div style="margin-top:36px">{steps_html(s)}</div></div></section>')
    # photos: local first, otherwise real examples of this work from nearby jobs, clearly placed
    shown = [k for k in ph if k != hk][:4]
    if local and slug in ('hardscaping', 'retaining-walls', 'drainage', 'landscaping'):
        jobs = list(dict.fromkeys(photo(k)['job'] for k in local))
        body += (f'<section class="sec"><div class="w"><h2 class="h2">Our {e(s["short"])} work in {e(t["name"])}</h2>'
                 + ''.join(local_block(j, t) for j in jobs if j in JOB_TEXT) + '</div></section>')
    elif shown:
        body += (f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">Examples of our {e(s["short"])} work</h2>'
                 f'<p class="sub">Real jobs by our crew around East Texas. Each photo says where it was taken.</p></div>'
                 f'<a class="more" href="/our-work">See all {len(PHOTOS)} photos</a></div>{strip(shown)}</div></section>')
    lq = t['service_faq'][slug]
    qas = [(lq['q'], lq['a'])] + [(x['q'], x['a']) for x in s['faq'][:3]]
    body += (f'<section class="sec stone"><div class="w faqw"><div><h2 class="h2">{e(s["name"])} questions in {e(t["name"])}</h2></div>'
             f'<div class="faq">{faq_html(qas)}</div></div></section>')
    others = [x for x in ([p for p in t.get('popular', []) if p in SERVICES] + SERVICE_ORDER) if x != slug]
    others = list(dict.fromkeys(others))
    tiles = ''.join(f'<a class="stile" href="/{o}-{tslug}"><h3>{e(SERVICES[o]["name"])}</h3><p>{e(first_sentence(t["service_angles"][o]))}</p></a>' for o in others[:8])
    body += (f'<section class="sec"><div class="w"><div class="head"><div><h2 class="h2">More we do in {e(t["name"])}</h2></div>'
             f'<a class="more" href="/{tslug}">Everything in {e(t["name"])}</a></div><div class="stiles">{tiles}</div></div></section>')
    near = ''.join(f'<a href="/{slug}-{n}">{e(TOWNS[n]["name"])}<small>{e(s["name"])}</small></a>' for n in t['nearby'] if n in TOWNS)
    body += (f'<section class="sec stone"><div class="w"><h2 class="h2">{e(s["name"])} in nearby towns</h2><div class="tgrid" style="margin-top:24px">{near}'
             f'<a href="/{slug}">{e(s["name"])} overview<small>Prices, process, FAQ</small></a></div></div></section>')
    body += quote_section(s, t)
    ld = [business_node(), service_ld(s, url, t, imgs=([hk] if hk else []) + shown), faq_ld(qas),
          crumbs_ld([(f"{t['name']}, TX", tslug), (s['name'], name)]), webpage_ld(name, title, meta, abs_url(photo(hk)['full']) if hk else None)]
    page(name, title, meta, body, ld, og_img=photo(hk)['full'] if hk else None, extra_js='<script src="/quote.js?v=1" defer></script>')

def build():
    for s in SERVICE_ORDER:
        service_page(s)
    for i, t in enumerate(TOWN_ORDER):
        town_page(t, i)
        for s in SERVICE_ORDER:
            combo_page(s, t, i)
