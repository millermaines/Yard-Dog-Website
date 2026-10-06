"""Build the photo library: every real Yard Dog photo, resized to web sizes, with SEO file names,
captions, the job and town it came from, and which service pages it belongs on.

Run once when photos change:  python3 _scripts/site/photos.py
Writes img/work/thumb/*.webp (480px wide), img/work/grid/*.webp (820px), img/work/full/*.webp (up to 1600px) and _data/photos.json.

Placement rule: a photo only appears on a service page if the service is in its `services` list, so a
mower never lands on a retaining wall page. Design renderings are NOT real work and are excluded here
(they live only on the Design Preview page, labelled as renderings).
"""
import glob, json, os, re, shutil, sys
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
from photo_sources import NEW, OLD  # noqa: E402

DRV = '/mnt/user-data/uploads/Desktop/Platy OS/Yard Dog Collab/Web Photos (1600px)'
REPO_WEBP = '/tmp/yd_site/photos'          # repo photos already converted to webp (see build notes)
STILLS = '/tmp/yd_stills/out'              # frames pulled from the crew videos
OUT = os.path.join(ROOT, 'img', 'work')
ORIG = os.path.join(ROOT, 'brand_photos')     # full-resolution originals (phone photos up to 2560px)


def original(key):
    """Highest-resolution source for a repo photo key. The /tmp webp copies are only 900px tall, which made
    heroes blurry, so always prefer the original in brand_photos when it exists."""
    cands = []
    if key.startswith('img-'):
        cands.append(os.path.join(ORIG, f'IMG_{key[4:]}.jpg'))
    cands += sorted(glob.glob(os.path.join(ORIG, f'*-{key}.jpg'))) + [os.path.join(ORIG, f'{key}.jpg')]
    for c in cands:
        if os.path.exists(c):
            return c
    return None

RENDERINGS = {'lighting-after', 'backyard-firepit-after', 'design-preview'}

JOBS = {
    'walkway':   dict(title='Flagstone walkway & chopped stone borders', place='Kilgore, TX', town='kilgore-tx', date='2026-09',
                      services=['hardscaping']),
    'rvpad':     dict(title='Raised boat & RV pad', place='White Oak, TX', town='white-oak-tx', date='2026-09',
                      services=['retaining-walls']),
    'whiteoak':  dict(title='Flagstone patio & fire pit', place='White Oak, TX', town='white-oak-tx', date='2026-08',
                      services=['hardscaping']),
    'driveway':  dict(title='Driveway retaining wall rebuild', place='Lake Cherokee, Longview, TX', town='lake-cherokee-tx', date='2026-07',
                      services=['retaining-walls']),
    'checker':   dict(title='Checkerboard paver patio', place='Kilgore, TX', town='kilgore-tx', date='2026-04',
                      services=['hardscaping']),
    'flagstone': dict(title='Flagstone patio with stone border', place='East Texas', town=None, date='2026-05',
                      services=['hardscaping']),
    'beds':      dict(title='Foundation beds & sandstone edging', place='East Texas', town=None, date='2026-05',
                      services=['flower-bed-installation', 'mulch-installation', 'landscaping']),
    'woodwall':  dict(title='Wood-to-block retaining wall', place='East Texas', town=None, date='',
                      services=['retaining-walls']),
    'lawn':      dict(title='Weekly lawn maintenance', place='East Texas', town=None, date='',
                      services=['lawn-maintenance']),
    'more':      dict(title='', place='East Texas', town=None, date='', services=[]),
}

# Extra services a specific photo also fits (on top of its job's services).
EXTRA = {
    # walkway: the finished shots with path lights also show landscaping work
    'd:walk-dsc03930': ['landscaping'], 'd:walk-dsc03950': ['landscaping'], 'd:walk-dsc03953': ['landscaping'],
    # boat & RV pad: fabric, fill, gravel and grading shots are drainage/grading work too
    'd:rvpad-dsc03174': ['drainage'], 'd:rvpad-dsc03124': ['drainage'], 'd:rvpad-dsc03273': ['drainage'],
    'd:rvpad-dsc03290': ['drainage'], 'd:rvpad-dsc03562': ['drainage'], 'd:rvpad-dsc03563': ['drainage'],
    # White Oak patio: the raised corner sits on a chopped stone wall
    'white-oak-flagstone-patio-elevated-corner': ['retaining-walls'], 'st:pat_025': ['retaining-walls'],
    'st:pat_034': ['retaining-walls'], 'st:pat_004': ['retaining-walls'],
    'white-oak-flagstone-patio-backfill-grade': ['drainage'],
    # driveway wall: drainage fabric and pipe, gravel drain strip
    'driveway-retaining-wall-base-drainage': ['drainage'], 'driveway-retaining-wall-finished': ['drainage'],
    'retaining-wall-wood-to-block-east-texas-excavation-base': ['drainage'],
    'retaining-wall-wood-to-block-east-texas-block-install': ['drainage'],
    # beds: boxwoods and shrubs = hedge and shrub care; hydrangeas under trees = shrub care
    'front-roses-after': ['hedge-trimming', 'tree-shrub-care'],
    'side-hydrangeas-after': ['tree-shrub-care'],
    'back-fence-after': [], 'deck-after': [],
    # lawn crew blowing = leaf/debris cleanup
    'd:crew-dsc04179': ['leaf-removal'], 'd:crew-dsc04197': ['leaf-removal'], 'st:mow_022': ['leaf-removal'],
}
# Services for the loose "more" photos.
MORE = {
    'img-3738': ['landscaping', 'drainage'], 'img-3736': ['drainage', 'landscaping'],
    'img-3525': ['hardscaping', 'retaining-walls'], 'img-3737': ['hardscaping'], 'img-3523': ['hardscaping'],
    'img-3526': ['landscaping', 'flower-bed-installation', 'hedge-trimming'], '6': ['retaining-walls', 'hardscaping'],
    '4': ['hardscaping'], '3': ['landscaping'], '5': ['flower-bed-installation'], '11': ['christmas-lights'],
    'img-3454': ['hardscaping'], 'img-3680': ['hardscaping'], 'img-3683': ['hardscaping'], 'img-3452': ['drainage'],
    '1': ['flower-bed-installation', 'landscaping'],
}
# Gallery filter group for Our Work.
GROUP = {'walkway': 'patios', 'whiteoak': 'patios', 'checker': 'patios', 'flagstone': 'patios', 'rvpad': 'walls',
         'driveway': 'walls', 'woodwall': 'walls', 'beds': 'beds', 'lawn': 'lawn'}
MOREGROUP = {'img-3738': 'beds', 'img-3525': 'patios', 'img-3737': 'patios', 'img-3523': 'patios', 'img-3526': 'beds',
             '6': 'walls', '4': 'patios', 'img-3736': 'beds', '3': 'beds', '5': 'beds', '11': 'other', 'img-3454': 'patios',
             'img-3680': 'patios', 'img-3683': 'patios', 'img-3452': 'beds', '1': 'beds'}


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def main():
    shutil.rmtree(OUT, ignore_errors=True)
    for d in ('thumb', 'grid', 'full'):
        os.makedirs(os.path.join(OUT, d))
    fin = [x for x in NEW + OLD if x[3] and x[0] not in RENDERINGS]
    wrk = [x for x in NEW + OLD if not x[3] and x[0] not in RENDERINGS]

    def mix(lst):
        by = {}
        for x in lst:
            by.setdefault(x[2], []).append(x)
        out = []
        while any(by.values()):
            for k in list(by):
                if by[k]:
                    out.append(by[k].pop(0))
        return out

    order = []
    fin, wrk = mix(fin), mix(wrk)
    fi = wi = 0
    for _ in range(3):
        order.append(fin[fi]); fi += 1
    while fi < len(fin) or wi < len(wrk):
        if fi < len(fin):
            order.append(fin[fi]); fi += 1
        for _ in range(2):
            if wi < len(wrk):
                order.append(wrk[wi]); wi += 1

    counter, items = {}, []
    for key, cap, job, finished in order:
        J = JOBS[job]
        base = slug(J['title'] if job != 'more' else cap)[:48].strip('-')
        place = J['place']
        pslug = 'east-texas' if place == 'East Texas' else slug(place.replace(', TX', ' tx'))
        stem = f'{base}-{pslug}'
        counter[stem] = counter.get(stem, 0) + 1
        name = f'{stem}-{counter[stem]:02d}.webp'
        if key.startswith('d:'):
            im = Image.open(f'{DRV}/{key[2:]}.webp').convert('RGB')
        elif key.startswith('st:'):
            im = Image.open(f'{STILLS}/{key[3:]}.webp').convert('RGB')
        else:
            src = original(key)
            im = (ImageOps.exif_transpose(Image.open(src)) if src else Image.open(f'{REPO_WEBP}/{key}.webp')).convert('RGB')
        full = im.copy(); full.thumbnail((1600, 1600), Image.LANCZOS)
        full.save(os.path.join(OUT, 'full', name), 'WEBP', quality=80, method=5)
        g = im.copy(); g.thumbnail((820, 820), Image.LANCZOS)
        g.save(os.path.join(OUT, 'grid', name), 'WEBP', quality=64, method=6)
        th = im.copy(); th.thumbnail((480, 10000), Image.LANCZOS)   # phone-size gallery tiles
        th.save(os.path.join(OUT, 'thumb', name), 'WEBP', quality=64, method=6)
        services = list(dict.fromkeys(J['services'] + (MORE.get(key, []) if job == 'more' else []) + EXTRA.get(key, [])))
        items.append(dict(
            key=key, file=name, w=full.width, h=full.height, gw=g.width, gh=g.height, tw=th.width, th=th.height,
            caption=cap, place=place, town=J['town'], job=job, title=J['title'] or cap, date=J['date'],
            kind='finished' if finished else 'in-progress', services=services,
            group=GROUP.get(job) or MOREGROUP.get(key, 'other'),
            alt=f'{cap}, {place}' if place != 'East Texas' else f'{cap}, East Texas',
        ))
    os.makedirs(os.path.join(ROOT, '_data'), exist_ok=True)
    json.dump(items, open(os.path.join(ROOT, '_data', 'photos.json'), 'w'), indent=1)
    from collections import Counter
    c = Counter(s for i in items for s in i['services'])
    print(len(items), 'photos'); print(dict(c))


if __name__ == '__main__':
    main()
