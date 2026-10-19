"""Create timestamped research frames from authorized local video caches."""
from pathlib import Path
import json
import re
import subprocess
import imageio_ffmpeg

root = Path(__file__).resolve().parent.parent / '_evidence'
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for video in sorted((root / 'media').glob('*.mp4')):
    output = root / 'frames' / video.stem
    output.mkdir(parents=True, exist_ok=True)
    manifest = output / 'manifest.json'
    if manifest.exists():
        print(video.stem, 'already extracted', flush=True)
        continue
    result = subprocess.run([
        ffmpeg,'-hide_banner','-y','-i',str(video),'-an',
        '-vf',"select='isnan(prev_selected_t)+gte(t,prev_selected_t+2)',showinfo",
        '-fps_mode','vfr','-q:v','2',str(output/'f%05d.jpg'),
    ],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
    pts = [float(v) for v in re.findall(r'\bn:\s*\d+.*?\bpts_time:([\d.]+)',result.stderr)]
    frames = sorted(output.glob('f*.jpg'))
    if len(pts) != len(frames):
        raise RuntimeError(f'PTS/frame mismatch: {video.stem}, {len(pts)}, {len(frames)}')
    records=[]
    for frame, seconds in zip(frames,pts):
        target=output/f't{seconds:08.3f}.jpg'
        frame.replace(target)
        records.append({'file':target.name,'seconds':seconds})
    manifest.write_text(json.dumps({'source':video.name,'interval_seconds':2,'frames':records},indent=2),encoding='utf-8')
    (output/'decode.log').write_text(result.stderr,encoding='utf-8')
    print(video.stem, len(records), 'frames', flush=True)
