"""TWO POINTS · 两点之间 — 配乐与笔触声

一分钟的片子需要“呼吸”，所以配乐分三层：
1) 和声垫（D 大调，慢、宽、只换五次色彩）
2) 键盘动机（只在画面推进的关键帧落音，不写旋律线）
3) 笔触声（包络来自 cues.json 的每段起收，画面改时间轴时声音跟着走）

“线转面”（填金）处给一次清亮的金属重音，其余保持克制——这片讲的是“看见”，不是“热闹”。
"""
import json
import os
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix, Sound, filters, fm, sfx, synth  # noqa: E402

CUES = json.loads(Path(__file__).with_name('cues.json').read_text(encoding='utf-8'))
DUR = CUES['duration']
OUT = os.environ['VIDEOLAB_AUDIO_OUT']

VOICING = {
    'Dmaj9': ['D3', 'A3', 'C#4', 'E4', 'F#4'],
    'Bm11': ['B2', 'F#3', 'A3', 'D4', 'E4'],
    'Gmaj9': ['G2', 'D3', 'F#3', 'A3', 'B3'],
    'Dmaj9/F#': ['F#2', 'A2', 'D3', 'E3', 'C#4'],
}
BASS = {'Dmaj9': 'D2', 'Bm11': 'B1', 'Gmaj9': 'G1', 'Dmaj9/F#': 'F#2'}

m = Mix(DUR, bpm=72)
pad = m.track('pad', level=-28, sends={'hall': -10})
keys = m.track('keys', level=-24, sends={'plate': -14})
sub = m.track('sub', level=-30)
pen = m.track('pen', level=-29, group='sfx')
glint = m.track('glint', level=-35, sends={'room': -11})

chords = CUES['music']['chords']
for i, (t, name) in enumerate(chords):
    end = chords[i + 1][0] if i + 1 < len(chords) else DUR
    dur = end - t + 1.2
    pad.add(synth.pad(VOICING[name], dur, 0.5, 'glass'), t)
    sub.add(fm.epiano(BASS[name], min(3.0, dur), 0.35, bright=0.08, release=1.1), t)
# 一分钟的垫子要有缓慢的明暗变化，否则会像静止的底噪。
pad.automate('lpf', [(0, 900), (14, 2600), (28, 1600), (41, 3000), (52, 5200), (60, 3600)])

for t, note in CUES['music']['notes']:
    keys.add(fm.epiano(note, 2.0, 0.46, bright=0.11, tremolo=0.05, release=0.9), t)

for t in CUES['music']['glints']:
    pan = float(np.clip((t - 30.0) / 30.0, -0.5, 0.5))
    glint.add(fm.bell('D6', 1.6, 0.14, 'glock'), t, pan=pan)

# 笔触声：跟每段的绘制包络，短段稍强、长段稍弱，收笔后自然消失。
sr = 48000
n = int(sr * DUR)
tt = np.arange(n) / sr
env = np.zeros(n)
for p in CUES['pieces']:
    a, b = p['start'], p['end']
    if b - a < 1e-6:
        continue
    q = (tt - a) / (b - a)
    inside = (q >= 0) & (q < 1)
    weight = min(1.2, 0.55 / max(0.12, b - a) ** 0.35)
    env += inside * weight * (0.25 + 0.75 * np.sin(np.pi * np.clip(q, 0, 1)) ** 0.7)
rng = np.random.default_rng(20260502)
noise = rng.normal(0, 0.05, n).astype(np.float32)
paper = np.asarray(filters.bpf(Sound(noise), 1500, q=0.7), dtype=np.float32).reshape(-1)[:n]
draw = (paper + rng.normal(0, 0.018, n).astype(np.float32)) * env
draw *= np.minimum(1, tt / 0.05)
draw *= np.minimum(1, np.maximum(0, (CUES['logo']['fillStart'] + 0.2 - tt) / 0.3))
pen.add(Sound(draw.astype(np.float32)), 0)

# 事件音：只标四处
m.sfx(sfx.whoosh(1.4, 'air', direction=1, peak=0.35), at=CUES['pieces'][-2]['start'], gain=-22)
m.sfx(sfx.riser(1.6, 'tonal', note='A4'), at=CUES['logo']['fillStart'], gain=-24)
m.sfx(sfx.shimmer_hit('D6'), at=CUES['logo']['fillStart'] + 0.08, gain=-13)
m.sfx(sfx.reverse_cymbal(1.2), at=CUES['type']['wordmark']['start'], gain=-25)

res = m.export(OUT, lufs=-14, tp=-1.2)
print(json.dumps({k: res[k] for k in res if k in ('duration', 'lufs', 'true_peak', 'warnings')},
                 ensure_ascii=False, indent=1))
