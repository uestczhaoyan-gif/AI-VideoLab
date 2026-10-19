"""成片技术检查：解码、时长、响度、静帧、海报、故事板、预览片。

用法：
  ..\\demo\\mg-styles-15\\.venv\\Scripts\\python.exe tools\\check.py            # 默认检查 film/
  ..\\demo\\mg-styles-15\\.venv\\Scripts\\python.exe tools\\check.py --film films/two-points
产物：<out>/check.json、poster.jpg、storyboard.jpg、preview.mp4、audio-check.log、shots/
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()


def decode(path, samples):
    """逐帧解码到底，同时取回抽样帧。帧数必须与实际可播放帧一致，不能提前退出。"""
    reader = imageio_ffmpeg.read_frames(str(path), pix_fmt='rgb24')
    meta = next(reader)
    w, h = meta['size']
    fps = meta['fps']
    want = {int(round(t * fps)): t for t in samples}
    frames = {}
    count = 0
    for i, frame in enumerate(reader):
        count += 1
        if i in want:
            frames[want[i]] = Image.frombytes('RGB', (w, h), frame)
    return {'width': w, 'height': h, 'fps': fps, 'decoded_frames': count,
            'seconds': round(count / fps, 3), 'bytes': path.stat().st_size}, frames


def loudness(path, log):
    r = subprocess.run([FF, '-hide_banner', '-i', str(path), '-af', 'ebur128=peak=true',
                        '-f', 'null', '-'], capture_output=True, encoding='utf-8', errors='replace')
    log.write_text(r.stderr, encoding='utf-8')
    out = {}
    tail = r.stderr[r.stderr.find('Summary:'):] if 'Summary:' in r.stderr else r.stderr
    for key, pattern, unit in (('integrated_lufs', r'I:\s+(-?\d+(?:\.\d+)?)\s+LUFS', 'LUFS'),
                               ('lra_lu', r'LRA:\s+(-?\d+(?:\.\d+)?)\s+LU', 'LU'),
                               ('true_peak_dbfs', r'Peak:\s+(-?\d+(?:\.\d+)?)\s+dBFS', 'dBFS')):
        m = re.search(pattern, tail)
        if m:
            out[key] = float(m.group(1))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--film', default='film', help='场景目录（含 index.html / cues.json）')
    ap.add_argument('--out', default='', help='输出目录，默认与 render.ps1 一致')
    args = ap.parse_args()

    film_dir = HERE / args.film
    out_dir = HERE / (args.out or ('out' if args.film == 'film' else f'{args.film}/out'))
    cues = json.loads((film_dir / 'cues.json').read_text(encoding='utf-8'))
    video = out_dir / 'video.mp4'
    if not video.exists():
        raise SystemExit(f'缺少 {video}')

    duration = cues['duration']
    samples = [round(duration * (i + 0.5) / 10, 2) for i in range(10)]
    meta, frames = decode(video, samples)
    expect_frames = round(duration * cues['fps'])
    report = {
        'film': args.film,
        'video': meta,
        'expected': {'duration': duration, 'fps': cues['fps'], 'width': 1920, 'height': 1080, 'frames': expect_frames},
        'audio': loudness(video, out_dir / 'audio-check.log'),
    }

    problems = []
    if meta['decoded_frames'] != expect_frames:
        problems.append(f"帧数 {meta['decoded_frames']} != {expect_frames}")
    if abs(meta['fps'] - cues['fps']) > 1e-6:
        problems.append(f"帧率 {meta['fps']} != {cues['fps']}")
    if (meta['width'], meta['height']) != (1920, 1080):
        problems.append('分辨率不是 1920×1080')
    if report['audio'].get('true_peak_dbfs', -99) > -1:
        problems.append('真峰值高于 -1 dBTP')
    if len(frames) != len(samples):
        problems.append(f'只取到 {len(frames)} 张抽样帧')

    shot_dir = out_dir / 'shots'
    shot_dir.mkdir(exist_ok=True)
    for t, img in frames.items():
        img.save(shot_dir / f't{t:06.2f}.png')

    tile_w, tile_h = 640, 360
    sheet = Image.new('RGB', (tile_w * 2, (tile_h + 20) * 5), '#141414')
    draw = ImageDraw.Draw(sheet)
    for i, t in enumerate(sorted(frames)):
        img = frames[t].resize((tile_w, tile_h), Image.LANCZOS)
        x, y = (i % 2) * tile_w, (i // 2) * (tile_h + 20)
        sheet.paste(img, (x, y + 20))
        draw.text((x + 8, y + 5), f'{t:.2f}s', fill='#ffd98a')
    sheet.save(out_dir / 'storyboard.jpg', quality=92)

    poster = frames.get(samples[-1]) or list(frames.values())[-1]
    poster.save(out_dir / 'poster.jpg', quality=95)

    preview = out_dir / 'preview.mp4'
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(video),
                    '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium',
                    '-crf', '26', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart',
                    str(preview)], check=True)
    report['preview'] = {'bytes': preview.stat().st_size}
    report['storyboard'] = {'bytes': (out_dir / 'storyboard.jpg').stat().st_size}
    report['poster'] = {'bytes': (out_dir / 'poster.jpg').stat().st_size}
    report['issues'] = problems
    (out_dir / 'check.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if problems:
        raise SystemExit('检查未通过：' + '；'.join(problems))


if __name__ == '__main__':
    main()
