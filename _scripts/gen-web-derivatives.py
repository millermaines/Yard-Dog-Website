#!/usr/bin/env python3
"""
Generate display-size WebP derivatives for photos used on the site.

Sources in brand_photos/ are left untouched — this only writes into
brand_photos/web/<stem>-<width>.webp. Re-runnable; skips work that is
already up to date.

Why this exists: _scripts/optimize-photos.mjs caps the *originals* at
1920px / q92, which is right for an archive but leaves 0.5–1.1 MB files.
Pages need images at the size they actually render. The homepage went
from 9.25 MB to well under 1 MB with these.

Usage:  python3 _scripts/gen-web-derivatives.py [--force]
"""
import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "brand_photos")
OUT_DIR = os.path.join(SRC_DIR, "web")

QUALITY = 74
FORCE = "--force" in sys.argv

# stem -> widths needed, driven by how each photo is actually rendered
PLAN = {
    # hero: full-bleed
    "8":                                                        [640, 1024, 1600],
    # service card thumbnails (~280px CSS, 2x = 560)
    "IMG_3736":                                                 [640, 1024],
    "IMG_3523":                                                 [640],
    "6":                                                        [640],
    "1":                                                        [640],
    "3":                                                        [640],
    "5":                                                        [640],
    "9":                                                        [640],
    # before/after compare panes (~560px CSS at 2x, plus mobile)
    "2026-07-08-robert-jackson-driveway-retaining-wall-before":  [640, 1100],
    "2026-07-08-robert-jackson-driveway-retaining-wall-after":   [640, 1100],
    "2026-05-17-kerrie-medlin-flagstone-patio-before":           [640, 1100],
    "2026-05-17-kerrie-medlin-flagstone-patio-after":            [640, 1100],
    "2026-04-22-logan-king-checkerboard-paver-patio-before":     [640, 1100],
    "2026-04-22-logan-king-checkerboard-paver-patio-after":      [640, 1100],
    # process thumbnails (~170px CSS)
    "IMG_3407":                                                 [420],
    "IMG_3452":                                                 [420],
    "IMG_3454":                                                 [420],
}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    before_total = after_total = 0
    made = skipped = 0

    for stem, widths in sorted(PLAN.items()):
        src = os.path.join(SRC_DIR, stem + ".jpg")
        if not os.path.exists(src):
            print(f"  MISSING  {stem}.jpg")
            continue
        src_bytes = os.path.getsize(src)
        before_total += src_bytes
        src_mtime = os.path.getmtime(src)

        with Image.open(src) as im:
            im = im.convert("RGB")
            ow, oh = im.size
            for w in widths:
                out = os.path.join(OUT_DIR, f"{stem}-{w}.webp")
                if (not FORCE and os.path.exists(out)
                        and os.path.getmtime(out) >= src_mtime):
                    after_total += os.path.getsize(out)
                    skipped += 1
                    continue
                if w >= ow:
                    resized = im.copy()
                else:
                    resized = im.resize((w, round(oh * w / ow)), Image.LANCZOS)
                resized.save(out, "WEBP", quality=QUALITY, method=6)
                after_total += os.path.getsize(out)
                made += 1
        print(f"  {stem}.jpg  {src_bytes/1024:7.0f} KB  ->  "
              + ", ".join(
                  f"{w}px {os.path.getsize(os.path.join(OUT_DIR, f'{stem}-{w}.webp'))/1024:.0f} KB"
                  for w in widths))

    print(f"\n  wrote {made} derivative(s), {skipped} already current")
    print(f"  sources {before_total/1024/1024:.2f} MB  ->  "
          f"derivatives {after_total/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
