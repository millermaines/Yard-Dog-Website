"""Project pages: one page per job at /our-work/<slug>, built from _data/projects.json.

Each page carries the job's crew videos (walkthrough up top, the build beside the steps), every photo from the job,
what went into it, a transcript of what the crew says on camera, an FAQ, and links to the matching service, town and
service-in-town pages. Photos come from the shared library (photos.json + project_photos.json) by job key.
"""
from common import *  # noqa
from pages_local import city_place, first_sentence, facts_list, quote_section


def iso_dur(sec):
    s = int(round(sec))
    return f'PT{s // 60}M{s % 60}S' if s >= 60 else f'PT{s}S'


def mmss(sec):
    s = int(round(sec))
    return f'{s // 60}:{s % 60:02d}'


def vsrc(v):
    return f"/media/projects/{v['file']}.mp4"


def vposter(v):
    return f"/media/projects/{v['file']}.jpg"


def project_url(P):
    return f"/our-work/{P['slug']}"


def job_photos(job):
    ps = [p for p in PHOTOS if p['job'] == job]
    return [p for p in ps if p['kind'] == 'finished'] + [p for p in ps if p['kind'] != 'finished']


def cover_key(P):
    ps = job_photos(P['job'])
    return ps[0]['key'] if ps else None


def town_name(P):
    return TOWNS[P['town']]['name']


def video_cap(v):
    if v.get('cap'):
        return v['cap']
    if v['kind'] == 'walkthrough' and v.get('narrator'):
        return f"{v['narrator']} from our crew walks through the finished job"
    return 'How the crew built it'


def video_fig(v, cls='pvid'):
    return (f'<figure class="{cls}"><video controls playsinline preload="none" poster="{vposter(v)}" width="{v.get("w", 720)}" height="{v.get("h", 1280)}" '
            f'title="{e(v["title"])}" aria-label="{e(v["title"])}"><source src="{vsrc(v)}" type="video/mp4"></video>'
            f'<figcaption>{e(video_cap(v))}<span>{mmss(v["duration"])}</span></figcaption></figure>')


def tile_sizes(p):
    ar = p['gw'] / p['gh']
    return f"(max-width: 480px) {round(180 * ar)}px, (max-width: 900px) {round(220 * ar)}px, {round(300 * ar)}px"


def link_blurb(slug):
    if slug in SERVICES:
        return first_sentence(SERVICES[slug]['lede'])
    if slug in TOWNS:
        return first_sentence(TOWNS[slug]['lede'])
    for s in SERVICES:
        if slug.startswith(s + '-') and slug[len(s) + 1:] in TOWNS:
            return first_sentence(TOWNS[slug[len(s) + 1:]]['service_angles'][s])
    return ''


def video_ld(v, P, url):
    d = {'@context': 'https://schema.org', '@type': 'VideoObject', '@id': f"{url}#video-{v['kind']}",
         'name': v['title'], 'description': v['desc'], 'thumbnailUrl': [BASE + vposter(v)],
         'contentUrl': BASE + vsrc(v), 'uploadDate': f"{v['date']}T12:00:00-05:00", 'duration': iso_dur(v['duration']),
         'width': v.get('w', 720), 'height': v.get('h', 1280), 'inLanguage': 'en-US', 'isFamilyFriendly': True,
         'publisher': {'@id': BIZ_ID}, 'creator': {'@id': BIZ_ID}, 'contentLocation': city_place(TOWNS[P['town']]),
         'mainEntityOfPage': url}
    if v.get('transcript'):
        d['transcript'] = v['transcript']
    return d


def more_projects(P, n=3):
    same = [q for q in PROJECTS if q is not P and set(q['services']) & set(P['services'])]
    rest = [q for q in PROJECTS if q is not P and q not in same]
    out = []
    for q in (same + rest)[:n]:
        k = cover_key(q)
        nv = len(q.get('videos', []))
        tag = f"{len(job_photos(q['job']))} photos" + (f", {nv} video{'s' if nv != 1 else ''}" if nv else '')
        out.append(f'<a class="card" href="{project_url(q)}">{img(k) if k else ""}<div class="ct"><p class="pm">{e(town_name(q))}, TX</p>'
                   f'<h3>{e(q["title"])}</h3><p>{e(tag)}</p></div></a>')
    return ''.join(out)


def project_page(P):
    slug = 'our-work/' + P['slug']
    url = BASE + project_url(P)
    t = TOWNS[P['town']]
    vids = [v for v in P.get('videos', []) if v.get('duration')]
    lead = next((v for v in vids if v['kind'] == 'walkthrough'), vids[0] if vids else None)
    rest = [v for v in vids if v is not lead]
    photos = job_photos(P['job'])
    ck = cover_key(P)

    # ---- hero: the walkthrough video beside the headline
    facts = ['Built by our own crew, never subcontracted', f'{len(photos)} photos from the job', '5.0 on Google from {REVIEW_COUNT} reviews']
    right = video_fig(lead) if lead else (hero_fig(ck) if ck else '')
    cls = ('hero shot proj' if lead else hero_cls(ck)) + ' pjh'
    hero = (crumb([('Our Work', 'our-work'), (P['title'], slug)]) +
            f'<section class="{cls}"><div class="w"><div><p class="kick">{e(t["name"])}, Texas &middot; {e(P["date_h"])}</p>'
            f'<h1>{e(P["h1"])}</h1><p class="lede">{e(P["summary"])}</p>'
            f'<div class="acts"><a class="btn lg" href="#q">Get a quote for a job like this</a><a class="tel2" href="#photos">See the photos</a></div>'
            f'{facts_list(facts)}{LIC_NOTE_IF(P)}</div>{right}</div>{GRAIN}{swoosh()}</section>')

    # ---- the job, in words (answer first), with the transcript and the facts card
    q = P.get('q') or f"What did Yard Dog build in {t['name']}, TX?"
    tx = ''.join(f'<details class="tx"><summary>Read what {e(v.get("narrator") or "the crew")} says in the video</summary><p>{e(v["transcript"])}</p></details>'
                 for v in vids if v.get('transcript'))
    dl = ''.join(f'<dt>{e(k)}</dt><dd>{e(v)}</dd>' for k, v in P['details'])
    body = hero + (f'<section class="sec"><div class="w body2"><div class="prose2"><div class="answer"><h2>{e(q)}</h2><p>{e(P["intro"][0])}</p></div>'
                   + ''.join(f'<p style="margin-top:22px">{e(x)}</p>' for x in P['intro'][1:]) + tx +
                   f'</div><aside><div class="pfacts"><h2>The job</h2><dl>{dl}</dl><a class="btn" href="#q">Get a free quote</a></div></aside></div></section>')

    # ---- how it was built: the build video beside the steps
    steps_h = P.get('steps_h') or 'How we built it'
    if rest:
        st = '<ol class="steps light col">' + ''.join(f'<li><h3>{e(a)}</h3><p>{e(b)}</p></li>' for a, b in P['steps']) + '</ol>'
        body += (f'<section class="sec stone" id="build"><div class="w"><h2 class="h2">{e(steps_h)}</h2>'
                 f'<div class="pbuild">{video_fig(rest[0])}{st}</div></div></section>')
    else:
        n = len(P['steps'])
        st = f'<ol class="steps light{" s5" if n == 5 else ""}">' + ''.join(f'<li><h3>{e(a)}</h3><p>{e(b)}</p></li>' for a, b in P['steps']) + '</ol>'
        body += f'<section class="sec stone" id="build"><div class="w"><h2 class="h2">{e(steps_h)}</h2><div style="margin-top:36px">{st}</div></div></section>'

    # ---- every photo from the job (same justified grid and lightbox as Our Work)
    if photos:
        tiles = ''.join(
            f'<a class="t" href="/img/work/full/{p["file"]}" data-i="{i}" data-g="{p["group"]}" data-k="{"f" if p["kind"] == "finished" else "w"}" data-j="{p["job"]}">'
            f'<img src="/img/work/grid/{p["file"]}" srcset="/img/work/thumb/{p["file"]} {p["tw"]}w, /img/work/grid/{p["file"]} {p["gw"]}w" '
            f'sizes="{tile_sizes(p)}" width="{p["gw"]}" height="{p["gh"]}" alt="{e(p["alt"])}" decoding="async" loading="lazy"></a>'
            for i, p in enumerate(photos))
        nf = sum(1 for p in photos if p['kind'] == 'finished')
        sub = (f'{len(photos)} photos: the finished work first, then the crew building it. Tap any photo to see it full size.' if nf and nf < len(photos)
               else f'{len(photos)} photos. Tap any photo to see it full size.')
        body += (f'<section class="gal pgal" id="photos" aria-labelledby="galh"><div class="w"><div class="head"><div><h2 id="galh" class="h2">Photos from the job</h2>'
                 f'<p class="sub">{e(sub)}</p></div><a class="more" href="/our-work">All our work</a></div>'
                 f'<div class="fl" hidden><button type="button" class="f jobchip" hidden></button></div>'
                 f'<div class="grid" id="grid">{tiles}</div></div></section>')

    # ---- questions, related pages, more projects
    qas = [tuple(x) for x in P['faq']]
    body += (f'<section class="sec stone"><div class="w faqw"><div><h2 class="h2">Questions about this job</h2>'
             f'<p class="sub">Something else on your mind? <a href="#q" style="font-weight:700;color:var(--ink)">Ask us in the quote form</a>.</p></div>'
             f'<div class="faq">{faq_html(qas)}</div></div></section>')
    rel = ''.join(f'<a class="stile" href="{href(u)}"><h3>{e(n)}</h3><p>{e(link_blurb(u))}</p></a>' for n, u in P['links'])
    body += (f'<section class="sec"><div class="w"><h2 class="h2">More on this kind of work</h2><div class="stiles" style="margin-top:28px">{rel}</div>'
             f'<div class="head" style="margin-top:72px"><div><h2 class="h2">More projects</h2></div><a class="more" href="/our-work">See all our work</a></div>'
             f'<div class="cards">{more_projects(P)}</div></div></section>')
    body += quote_section(SERVICES[P['services'][0]], t)
    body += ('<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Photo"><button class="cl" type="button" aria-label="Close">&times;</button>'
             '<button class="pv" type="button" aria-label="Previous photo">&lsaquo;</button><img id="lbi" alt=""><p><span id="lbc"></span><small id="lbn"></small></p>'
             '<button class="nx" type="button" aria-label="Next photo">&rsaquo;</button></div>')

    # ---- schema: the page, its videos, its photos, breadcrumbs, FAQ
    og = '/img/work/full/' + BYKEY[ck]['file'] if ck else (vposter(lead) if lead else None)
    wp = webpage_ld(slug, P['seo_title'], P['meta'], abs_url(og) if og else None)
    wp['datePublished'] = (lead or {}).get('date') or TODAY
    wp['contentLocation'] = city_place(t)
    wp['about'] = [{'@id': BIZ_ID}] + [{'@type': 'Service', 'name': SERVICES[s]['name'], 'url': BASE + '/' + s} for s in P['services']]
    if vids:
        wp['video'] = [{'@id': f"{url}#video-{v['kind']}"} for v in vids]
    wp['image'] = [{'@type': 'ImageObject', 'contentUrl': BASE + '/img/work/full/' + p['file'], 'thumbnailUrl': BASE + '/img/work/grid/' + p['file'],
                    'caption': p['alt'], 'width': p['w'], 'height': p['h'], 'creditText': 'Yard Dog Landscapes',
                    'creator': {'@id': BIZ_ID}, 'copyrightHolder': {'@id': BIZ_ID}} for p in photos]
    ld = [business_node(), wp, *[video_ld(v, P, url) for v in vids], crumbs_ld([('Our Work', 'our-work'), (P['title'], slug)]), faq_ld(qas)]
    head = ''
    if lead:
        head = (f'<meta property="og:video" content="{BASE}{vsrc(lead)}"><meta property="og:video:type" content="video/mp4">'
                f'<meta property="og:video:width" content="{lead.get("w", 720)}"><meta property="og:video:height" content="{lead.get("h", 1280)}">')
    page(slug, P['seo_title'], P['meta'], body, ld, og_img=og, extra_head=head,
         extra_js=f'<script src="/quote.js?v=1" defer></script><script src="/gallery.js?v={asset_v("gallery.js")}" defer></script>')


def LIC_NOTE_IF(P):
    from pages_local import LIC_NOTE
    return LIC_NOTE if 'irrigation' in P['services'] else ''


def build():
    for P in PROJECTS:
        project_page(P)
