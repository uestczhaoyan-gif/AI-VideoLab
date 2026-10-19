"""Local OCR of authorized browser screenshots; raw evidence is not a publishable transcript."""
from pathlib import Path
import argparse
import json
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

parser = argparse.ArgumentParser()
parser.add_argument('frames', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--full-every', type=int, default=0, help='Also OCR full frames at this interval; 0 reads captions only.')
parser.add_argument('--crop-top', type=float, default=.69)
parser.add_argument('--crop-bottom', type=float, default=.94)
parser.add_argument('--from-time', type=float, default=0)
parser.add_argument('--to-time', type=float, default=float('inf'))
args = parser.parse_args()
args.output.parent.mkdir(parents=True, exist_ok=True)
seen = set()
if args.output.exists():
    seen = {json.loads(line)['file'] for line in args.output.read_text(encoding='utf-8').splitlines() if line}
engine = RapidOCR(intra_op_num_threads=2, inter_op_num_threads=2)
count = 0
with args.output.open('a', encoding='utf-8') as dest:
    for file in sorted(p for p in args.frames.glob('t*.*') if p.suffix.lower() in ('.png','.jpg','.jpeg')):
        if file.name in seen:
            continue
        if not args.from_time <= float(file.stem[1:]) <= args.to_time:
            continue
        try:
            im = Image.open(file).convert('RGB')
            seconds = float(file.stem[1:])
            crop = im.crop((0, int(im.height * args.crop_top), im.width, int(im.height * args.crop_bottom)))
            result, _ = engine(np.array(crop))
            row = {'file': file.name, 'seconds': seconds,
                   'caption': [{'text': r[1], 'confidence': float(r[2])} for r in (result or [])]}
            if args.full_every and int(seconds) % args.full_every == 0:
                full, _ = engine(np.array(im))
                row['frame_text'] = [{'text': r[1], 'confidence': float(r[2])} for r in (full or [])]
            dest.write(json.dumps(row, ensure_ascii=False) + '\n')
            dest.flush()
            count += 1
        except Exception as exc:
            print(f'Unread frame {file.name}: {exc}', flush=True)
print(f'Added {count} frames; earlier records retained.', flush=True)
