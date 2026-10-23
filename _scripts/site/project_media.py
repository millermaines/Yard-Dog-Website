"""Turn a project's raw job media into web files. Additive and idempotent: files already built are kept.

    python3 _scripts/site/project_media.py --src DIR [--only SLUG] [--force]

DIR holds the originals pulled from the shared Drive: videos as DIR/vid/<video src>.mp4 and photos anywhere
under DIR/ph/ (matched by file name). Projects and their media lists live in _data/projects.json.

Writes
  img/work/{full,md,grid,thumb}/<slug>-NN.webp   same sizes and quality as photos.py
  _data/project_photos.json                       one entry per photo, same shape as photos.json
  media/projects/<file>.mp4 + .jpg                720x1280 H.264 with sound, fast start, and a poster frame
and records each video's duration and size back into _data/projects.json.

Photo keys are p:<job>:<src>. A photo src is a file name (DSC04641.jpg) or still:<video src>@<seconds> for a
frame pulled from one of the job's videos. Numbers (NN) are given out once and never reused, so file names stay
stable when photos are added later.
"""
import argparse, glob, json, os, subprocess, sys, tempfile
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, '_data')
OUT = os.path.join(ROOT, 'img', 'work')
MEDIA = os.path.join(ROOT, 'media', 'projects')


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration',
                        '-of', 'json', path], capture_output=True, text=True, check=True)
    j = json.loads(r.stdout)
    return float(j['format']['duration']), j['streams'][0]['width'], j['streams'][0]['height']


def find_photo(src_dir, name):
    hits = glob.glob(os.path.join(src_dir, 'ph', '**', name), recursive=True)
    return hits[0] if hits else None


def still(src_dir, spec, tmp):
    vid, t = spec[len('still:'):].rsplit('@', 1)
    path = os.path.join(src_dir, 'vid', vid + '.mp4')
    if not os.path.exists(path):
        return None
    out = os.path.join(tmp, f'{vid}-{t}.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', t, '-i', path, '-frames:v', '1', out], check=True)
    return out


def save_sizes(im, name):
    full = im.copy(); full.thumbnail((1600, 1600), Image.LANCZOS)
    full.save(os.path.join(OUT, 'full', name), 'WEBP', quality=76, method=5)
    md = im.copy(); md.thumbnail((800, 1600), Image.LANCZOS)
    md.save(os.path.join(OUT, 'md', name), 'WEBP', quality=72, method=6)
    g = im.copy(); g.thumbnail((820, 820), Image.LANCZOS)
    g.save(os.path.join(OUT, 'grid', name), 'WEBP', quality=64, method=6)
    th = im.copy(); th.thumbnail((480, 10000), Image.LANCZOS)
    th.save(os.path.join(OUT, 'thumb', name), 'WEBP', quality=64, method=6)
    return dict(w=full.width, h=full.height, gw=g.width, gh=g.height, tw=th.width, th=th.height, mw=md.width, mh=md.height)


def encode(src, dst, poster_t):
    tmp = dst + '.part.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', 'scale=720:-2:flags=lanczos,fps=30', '-c:v', 'libx264', '-preset', 'slow',
                    '-crf', '27', '-maxrate', '1300k', '-bufsize', '2600k', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, dst)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(poster_t), '-i', src, '-frames:v', '1', '-vf', 'scale=720:-2:flags=lanczos',
                    '-q:v', '4', dst[:-4] + '.jpg'], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    ap.add_argument('--only')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--skip-video', action='store_true')
    a = ap.parse_args()
    projects = json.load(open(os.path.join(DATA, 'projects.json')))
    pp_path = os.path.join(DATA, 'project_photos.json')
    have = {p['key']: p for p in json.load(open(pp_path))} if os.path.exists(pp_path) else {}
    for d in ('thumb', 'grid', 'md', 'full'):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)
    os.makedirs(MEDIA, exist_ok=True)
    missing = []
    with tempfile.TemporaryDirectory() as tmp:
        for P in projects:
            if a.only and P['slug'] != a.only:
                continue
            # ---- videos
            for v in P.get('videos', []):
                dst = os.path.join(MEDIA, v['file'] + '.mp4')
                src = os.path.join(a.src, 'vid', v['src'] + '.mp4')
                if not a.skip_video and (a.force or not os.path.exists(dst)):
                    if not os.path.exists(src):
                        missing.append(src); continue
                    print('encode', v['file'], flush=True)
                    encode(src, dst, v.get('poster_t', 3))
                if os.path.exists(dst):
                    dur, w, h = probe(dst)
                    v.update(duration=round(dur, 1), w=w, h=h, bytes=os.path.getsize(dst))
            # ---- photos
            used = [int(x['file'].rsplit('-', 1)[1][:2]) for x in have.values() if x['project'] == P['slug']]
            nxt = max(used, default=0) + 1
            for ph in P.get('photos', []):
                key = f"p:{P['job']}:{ph['src']}"
                old = have.get(key)
                if old and not a.force and os.path.exists(os.path.join(OUT, 'full', old['file'])):
                    old.update(caption=ph['cap'], kind=ph['kind'], services=ph.get('services') or P['services'],
                               alt=f"{ph['cap']}, {P['place']}", title=P['title'], group=P['group'])
                    continue
                path = still(a.src, ph['src'], tmp) if ph['src'].startswith('still:') else find_photo(a.src, ph['src'])
                if not path:
                    missing.append(ph['src']); continue
                name = old['file'] if old else f"{P['slug']}-{nxt:02d}.webp"
                if not old:
                    nxt += 1
                im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
                sizes = save_sizes(im, name)
                have[key] = dict(key=key, file=name, **sizes, caption=ph['cap'], place=P['place'], town=P['town'], job=P['job'],
                                 title=P['title'], date=P['date'], kind=ph['kind'], services=ph.get('services') or P['services'],
                                 group=P['group'], alt=f"{ph['cap']}, {P['place']}", project=P['slug'])
                print('photo', name, ph['src'], flush=True)
    # keep the projects.json photo order
    order = {f"p:{P['job']}:{ph['src']}": (i, j) for i, P in enumerate(projects) for j, ph in enumerate(P.get('photos', []))}
    items = sorted(have.values(), key=lambda x: order.get(x['key'], (999, 0)))
    json.dump(items, open(pp_path, 'w'), indent=1)
    json.dump(projects, open(os.path.join(DATA, 'projects.json'), 'w'), indent=1, ensure_ascii=False)
    print(len(items), 'project photos')
    if missing:
        print('MISSING sources:', *missing, sep='\n  ')
        sys.exit(2)


if __name__ == '__main__':
    main()
