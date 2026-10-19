"""Measure the gold stroke in a reference frame (dev helper, not part of the film)."""
import sys
from PIL import Image

src, mode = sys.argv[1], sys.argv[2]
img = Image.open(src).convert('RGB')
W, H = img.size
px = img.load()


def is_gold(p):
    r, g, b = p
    return r > 90 and r > b + 25 and g > b


def runs(vals):
    out, start = [], None
    for i, v in vals:
        if v and start is None:
            start = i
        elif not v and start is not None:
            out.append((start, i - 1))
            start = None
    if start is not None:
        out.append((start, len(vals) + start - 1))
    return out


def col(x):
    ys = [(y, is_gold(px[x, y])) for y in range(H)]
    return [(a, b) for a, b in runs(ys) if b - a <= 12]


def row(y):
    xs = [(x, is_gold(px[x, y])) for x in range(W)]
    return [(a, b) for a, b in runs(xs) if b - a <= 12]


if mode == 'cols':
    for x in [int(v) for v in sys.argv[3].split(',')]:
        print(f'x={x}: {col(x)}')
elif mode == 'rows':
    for y in [int(v) for v in sys.argv[3].split(',')]:
        print(f'y={y}: {row(y)}')
elif mode == 'crop':
    x0, y0, x1, y1, scale, out = sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], float(sys.argv[7]), sys.argv[8]
    c = img.crop((int(x0), int(y0), int(x1), int(y1)))
    c = c.resize((int(c.width * scale), int(c.height * scale)), Image.LANCZOS)
    c.save(out)
    print(out, c.size)
