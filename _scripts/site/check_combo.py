"""Check hand-written town-service copy (_data/combo/<town>.json, or any file/dir passed as arguments).

Usage: python3 _scripts/site/check_combo.py [file-or-dir ...]     (default: _data/combo)
Exits 1 on any error. Checks: required keys and shapes, banned words, dashes, exclamation marks, unresolved
placeholders, legal-limit terms, title/meta length, and near-duplicate text between towns for the same service."""
import json, os, re, sys, glob, itertools
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SERV = sorted(os.path.basename(f)[:-5] for f in glob.glob(ROOT + '/_data/services/*.json'))
TOWNS = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(ROOT + '/_data/towns/*.json')}
BANNED = ['nestled', 'vibrant', 'tapestry', 'boasts', 'oasis', 'elevate', 'transform your', 'dream yard', 'pops', 'look no further',
          "whether you're", 'whether you are', "in today's", 'unlock', 'seamless', 'hassle-free', 'top-notch', 'second to none',
          'pride ourselves', 'one-stop', 'delve', 'testament', "it's not just", 'rich history', 'hidden gem', 'charming', 'bustling', 'lush']
LEGAL = ['pre-emergent', 'preemergent', 'post-emergent', 'herbicide', 'weed control', 'weed killer', 'pesticide', 'insecticide',
         'fungicide', 'fire ant treatment', 'grub treatment', 'spraying', 'licensed arborist', 'certified arborist', 'stump grinding',
         'guarantee', 'warranty', 'award']
STR = lambda c: ' '.join([c['title'], c['meta'], c['h1'], c['lede'], c['answer'], c['local_h']] + c['local'] + [x for q in c['faq'] for x in (q['q'], q['a'])])

def tokens(txt, town):
    tw = set(re.findall(r'[a-z]+', town.replace('-tx', '').replace('-', ' ')))
    return ['TOWN' if w in tw else w for w in re.findall(r"[a-z0-9$']+", txt.lower())]

def shingles(w, n=6):
    return {tuple(w[i:i + n]) for i in range(len(w) - n + 1)}

def check(files):
    errs, warns, data = [], [], {}
    for f in files:
        town = os.path.basename(f)[:-5]
        if town not in TOWNS:
            errs.append(f'{f}: unknown town'); continue
        d = json.load(open(f))
        for svc, c in d.items():
            where = f'{town}/{svc}'
            if svc not in SERV:
                errs.append(f'{where}: unknown service'); continue
            need = ['title', 'meta', 'h1', 'lede', 'answer', 'local_h', 'local', 'faq']
            miss = [k for k in need if k not in c]
            if miss:
                errs.append(f'{where}: missing {miss}'); continue
            if not (3 <= len(c['local']) <= 5): errs.append(f'{where}: local needs 3-5 paragraphs, has {len(c["local"])}')
            if not (4 <= len(c['faq']) <= 6): errs.append(f'{where}: faq needs 4-6 items, has {len(c["faq"])}')
            for q in c['faq']:
                if set(q) != {'q', 'a'} or not q['q'].strip().endswith('?'): errs.append(f'{where}: bad faq item {q.get("q", "")[:40]!r}')
            txt = STR(c)
            low = txt.lower()
            if len(c['title']) > 66: errs.append(f'{where}: title {len(c["title"])} chars (max 66)')
            if not 110 <= len(c['meta']) <= 165: errs.append(f'{where}: meta {len(c["meta"])} chars (want 110-165)')
            if TOWNS[town]['name'].lower() not in (c['title'] + c['h1'] + c['lede']).lower(): errs.append(f'{where}: town name missing from title/h1/lede')
            for b in BANNED:
                if re.search(r'\b' + re.escape(b), low): errs.append(f'{where}: banned word "{b}"')
            for b in LEGAL:
                if b in low: warns.append(f'{where}: legal-limit term "{b}" (allowed only as a plain "we do not")')
            if '—' in txt or '–' in txt: errs.append(f'{where}: em/en dash in text')
            if '!' in txt: errs.append(f'{where}: exclamation mark')
            if re.search(r'\{town\}|\{county\}|TODO|XXX', txt): errs.append(f'{where}: unresolved placeholder')
            if '{{REVIEWS}}' in txt.replace('{{REVIEWS}}', '', 1): errs.append(f'{where}: {{REVIEWS}} used more than once')
            words = len(re.findall(r'\w+', ' '.join(c['local'] + [x['a'] for x in c['faq']] + [c['answer']])))
            if words < 560: errs.append(f'{where}: only {words} body words (want 560+)')
            if 'price' in c and not set(c['price']) <= {'range', 'unit', 'note'}: errs.append(f'{where}: price override keys')
            data[(town, svc)] = tokens(txt, town)
    # no two towns may reuse the same wording for one service, and a town's own pages must not repeat each other
    sh = {k: shingles(v) for k, v in data.items()}
    for (a, b) in itertools.combinations(sh, 2):
        if a[1] == b[1] and a[0] != b[0] or a[0] == b[0] and a[1] != b[1]:
            if not sh[a] or not sh[b]: continue
            ov = len(sh[a] & sh[b]) / min(len(sh[a]), len(sh[b]))
            lim = 0.30 if a[1] == b[1] else 0.22
            if ov > lim: errs.append(f'{a[0]}/{a[1]} vs {b[0]}/{b[1]}: {ov:.0%} of wording shared (max {lim:.0%})')
    titles = {}
    for (t, s) in data:
        c = json.load(open(next(f for f in files if os.path.basename(f)[:-5] == t)))[s]
        for key in ('title', 'h1'):
            titles.setdefault((key, c[key].lower()), []).append(f'{t}/{s}')
    for (key, v), where in titles.items():
        if len(where) > 1: errs.append(f'duplicate {key}: {where}')
    return errs, warns, len(data)

if __name__ == '__main__':
    args = sys.argv[1:] or [ROOT + '/_data/combo']
    files = []
    for a in args:
        files += sorted(glob.glob(a + '/*.json')) if os.path.isdir(a) else [a]
    errs, warns, n = check(files)
    for w in warns: print('WARN ', w)
    for x in errs: print('ERROR', x)
    print(f'{n} pages checked, {len(errs)} errors, {len(warns)} warnings')
    sys.exit(1 if errs else 0)
