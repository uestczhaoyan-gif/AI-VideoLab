"""Contact sheet of a video at fixed times (dev helper)."""
import sys
import numpy as np
import imageio_ffmpeg
from PIL import Image, ImageDraw

src, times_arg, out, cols_arg, tile_arg = sys.argv[1:6]
times = [float(v) for v in times_arg.split(',')]
cols = int(cols_arg)
tile = int(tile_arg)
rows = (len(times) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tile, rows * (tile * 9 // 16 + 20)), '#1b1b1b')
draw = ImageDraw.Draw(sheet)
reader = imageio_ffmpeg.read_frames(src, pix_fmt='rgb24')
meta = next(reader)
W, H = meta['size']
fps = meta['fps']
want = {int(round(t * fps)): t for t in times}
for i, frame in enumerate(reader):
    if i not in want:
        continue
    img = Image.frombytes('RGB', (W, H), frame)
    img.thumbnail((tile, tile * 9 // 16), Image.LANCZOS)
    r = list(want).index(i)
    cx, cy = (r % cols) * tile, (r // cols) * (tile * 9 // 16 + 20)
    sheet.paste(img, (cx, cy + 18))
    draw.text((cx + 6, cy + 4), f'{want[i]:.2f}s', fill='#ffde9b')
sheet.save(out, quality=95)
print(out, sheet.size)
