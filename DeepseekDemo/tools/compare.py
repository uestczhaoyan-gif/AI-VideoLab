"""对照图：上游参考成片 vs 本目录成片，十个抽样时刻。

沿用项目既有对照图格式（1600×840，参考两行在上、重建两行在下）。

用法：..\demo\mg-styles-15\.venv\Scripts\python.exe tools\compare.py [参考成片路径] [输出路径]
"""
import sys
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent.parent
DEFAULT_REF = HERE.parent / 'demo' / 'mg-styles-15' / 'source' / 'videos' / '02-line-art.mp4'
TIMES = [i + 0.5 for i in range(10)]
TILE_W, TILE_H = 320, 180


def sample(path, times):
    reader = imageio_ffmpeg.read_frames(str(path), pix_fmt='rgb24')
    meta = next(reader)
    w, h = meta['size']
    fps = meta['fps']
    want = {int(round(t * fps)): t for t in times}
    out = {}
    for i, frame in enumerate(reader):
        if i in want:
            out[want[i]] = Image.frombytes('RGB', (w, h), frame).resize((TILE_W, TILE_H), Image.LANCZOS)
        if len(out) == len(want) and i > max(want):
            break
    return out


def main():
    ref = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_REF
    if not ref.exists():
        ref = HERE.parent / 'demo' / 'mg-styles-15' / 'demos' / '03-line-art' / 'reproduction' / 'video.mp4'
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / 'out' / 'comparison.jpg'
    mine = sample(HERE / 'out' / 'video.mp4', TIMES)
    theirs = sample(ref, TIMES)

    sheet = Image.new('RGB', (TILE_W * 5, (TILE_H + 22) * 4), '#202020')
    draw = ImageDraw.Draw(sheet)
    for row, (label, frames) in enumerate((('reference', theirs), ('DeepseekDemo', mine))):
        for i, t in enumerate(TIMES):
            col, band = i % 5, row * 2 + i // 5
            x, y = col * TILE_W, band * (TILE_H + 22)
            if t in frames:
                sheet.paste(frames[t], (x, y + 20))
            if i < 5:
                draw.text((x + 6, y + 4), f'{label} {t:.1f}s', fill='#ffd98a' if row == 0 else '#9ecbff')
            else:
                draw.text((x + 6, y + 4), f'{t:.1f}s', fill='#ffd98a' if row == 0 else '#9ecbff')
    sheet.save(out, quality=94)
    print(out, sheet.size)


if __name__ == '__main__':
    main()
