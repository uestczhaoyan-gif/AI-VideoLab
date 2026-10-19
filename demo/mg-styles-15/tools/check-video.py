"""Decode a demo, extract a storyboard, and measure its audio. Not a subjective review."""
import argparse
import json
from pathlib import Path
import subprocess
import imageio_ffmpeg
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('video', type=Path)
args = parser.parse_args()
video = args.video.resolve()
checks = video.parent / 'checks'
checks.mkdir(exist_ok=True)
reader = imageio_ffmpeg.read_frames(str(video), pix_fmt='rgb24')
meta = next(reader)
fps = meta['fps']
width, height = meta['size']
times = [n + .5 for n in range(int(meta['duration']))]
selected = {round(t * fps): (i, t) for i, t in enumerate(times)}
sheet = Image.new('RGB', (1600, 210 * ((len(times) + 4) // 5)), '#183E35')
draw = ImageDraw.Draw(sheet)
count = 0
for frame_idx, raw in enumerate(reader):
    count += 1
    if frame_idx in selected:
        i, time = selected[frame_idx]
        im = Image.frombytes('RGB', (width, height), raw)
        if i == len(times) - 1:
            im.save(video.parent / 'poster.jpg', quality=95)
        im.thumbnail((320, 180))
        x, y = i % 5 * 320, i // 5 * 210
        sheet.paste(im, (x, y + 25))
        draw.text((x + 8, y + 5), f'{time:.1f}s', fill='white')
sheet.save(video.parent / 'storyboard.jpg', quality=95)
report = {**meta, 'decoded_frames': count, 'video_duration_from_frames': count / fps,
          'bytes': video.stat().st_size, 'subjective_playback_review': 'pending',
          'subjective_audio_review': 'pending'}
assert count > 0 and abs(meta['duration'] - count / fps) <= 1 / fps, 'Container/frame duration mismatch'
assert meta.get('audio_codec'), 'Audio track missing'
result = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-i', str(video),
                         '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                        check=True, capture_output=True, encoding='utf-8', errors='replace')
(checks / 'audio-check.log').write_text(result.stderr, encoding='utf-8')
(video.parent / 'check-result.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
print(result.stderr[result.stderr.rfind('Summary:'):].split('[out#')[0])
