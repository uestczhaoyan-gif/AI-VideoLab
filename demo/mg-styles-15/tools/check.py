"""Decode both videos, save technical metadata and paired frames for visual review."""
from pathlib import Path
import argparse
import json
import subprocess
import imageio_ffmpeg
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
CASES = {'01-flat-vector': '01-flat-vector', '02-isometric': '03-isometric', '03-line-art': '02-line-art', '04-3d-render': '04-3d-render', '05-shape-morph': '08-morph'}
parser = argparse.ArgumentParser()
parser.add_argument('--case', choices=CASES, default='01-flat-vector')
args = parser.parse_args()
OUT = ROOT / 'demos' / args.case / 'reproduction'
TIMES = [n + 0.5 for n in range(10)]
FILES = {
    'reference': ROOT / 'source/videos' / f'{CASES[args.case]}.mp4',
    'rebuilt': OUT / 'video.mp4',
}
sheet = Image.new('RGB', (1600, 840), '#202020')
draw = ImageDraw.Draw(sheet)
report = {}
for label, video in FILES.items():
    reader = imageio_ffmpeg.read_frames(str(video), pix_fmt='rgb24')
    meta = next(reader)
    width, height = meta['size']
    selected = {round(t * meta['fps']): (i, t) for i, t in enumerate(TIMES)}
    count = 0
    for index, frame in enumerate(reader):
        count += 1
        if index not in selected:
            continue
        sample, time = selected[index]
        img = Image.frombytes('RGB', (width, height), frame)
        row = (sample // 5) * 2 + (label == 'rebuilt')
        col = sample % 5
        img.thumbnail((320, 180))
        sheet.paste(img, (col * 320, row * 210 + 25))
        draw.text((col * 320 + 8, row * 210 + 5), f'{label} | {time:.1f}s', fill='white')
    report[label] = {**meta, 'decoded_frames': count, 'file_bytes': video.stat().st_size}
sheet.save(OUT / 'comparison.jpg', quality=94)
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for label, video in FILES.items():
    result = subprocess.run(
        [ffmpeg, '-hide_banner', '-i', str(video), '-af', 'ebur128=peak=true', '-f', 'null', '-'],
        capture_output=True, encoding='utf-8', errors='replace', check=True,
    )
    (OUT / f'{label}-audio-check.log').write_text(result.stderr, encoding='utf-8')
(OUT / 'check.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
print('Paired frames saved; this is not a complete playback or listening review.')
