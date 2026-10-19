"""Validate original Blender plates and make a lightweight delivery preview."""
from pathlib import Path
import sys,subprocess,json
from PIL import Image
import imageio_ffmpeg
root=Path(__file__).resolve().parents[1]
out=root/'demos/04-3d-render/reproduction'
if '--plates' in sys.argv:
    folder=root/'source/demos/04-3d-render/out/frames'
    for i in range(240):
        with Image.open(folder/f'{i:04d}.png') as im:
            assert im.size==(1920,1080),(i,im.size)
            im.verify()
    print('All 240 original-size Blender plates verified.')
else:
    report=json.loads((out/'check.json').read_text())
    for key in ('reference','rebuilt'):
        assert report[key]['decoded_frames']==240
        assert report[key]['fps']==24
        assert report[key]['duration']==10
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-v','error','-i',str(out/'video.mp4'),'-c:v','libx264','-preset','fast','-crf','22','-c:a','aac','-b:a','192k','-movflags','+faststart',str(out/'preview.mp4')],check=True)
    print('Preview and technical checks complete. Visual/audio review pending.')
