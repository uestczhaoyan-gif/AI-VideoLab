"""Track the pen-tip glow in the reference film to recover beat timing (dev helper)."""
import json
import sys
import numpy as np
import imageio_ffmpeg

src = sys.argv[1]
out = sys.argv[2]
reader = imageio_ffmpeg.read_frames(src, pix_fmt='rgb24')
meta = next(reader)
W, H = meta['size']
fps = meta['fps']
rows = []
for i, frame in enumerate(reader):
    a = np.frombuffer(frame, dtype=np.uint8).reshape(H, W, 3).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    core = (r >= 246) & (g >= 238) & (b >= 205)          # near-white gold core of the tip glow
    n = int(core.sum())
    if n:
        ys, xs = np.nonzero(core)
        # weight by brightness so the core centre wins over stray hot pixels
        w = (r[core] + g[core]).astype(np.float64)
        rows.append({'f': i, 't': round(i / fps, 3), 'n': n,
                     'x': round(float((xs * w).sum() / w.sum()), 1),
                     'y': round(float((ys * w).sum() / w.sum()), 1)})
    else:
        rows.append({'f': i, 't': round(i / fps, 3), 'n': 0, 'x': None, 'y': None})
json.dump({'fps': fps, 'size': [W, H], 'frames': rows}, open(out, 'w'), indent=0)
print(f'{len(rows)} frames covered, {sum(1 for r in rows if r["n"])} with a tip')
for r in rows[::15]:
    print(r)
