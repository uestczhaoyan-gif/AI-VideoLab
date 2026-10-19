"""ONE LIFE · 一生，一笔 — 配乐与笔触声

结构：和声垫（D 大调偏柔，中段转 Bm）+ 键盘动机 + 笔触声 + 四处事件音。
情绪跟着画面走：童年明亮 → 台阶渐强 → 山巅一个高音 → 坠落时低频下沉 →
心结段留白（只留笔触声）→ 花开时和声重新暖起来 → 太阳填金时一次性收束。
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

pieces = {p['name']: p for p in CUES['pieces']}
knot_start = pieces['knot-in']['start']
flower_start = pieces['stem']['start']
sun_end = pieces['sun']['end']
fill = CUES['logo']['fillStart']

m = Mix(DUR, bpm=68)
pad = m.track('pad', level=-27, sends={'hall': -10})
keys = m.track('keys', level=-24, sends={'plate': -14})
sub = m.track('sub', level=-31)
pen = m.track('pen', level=-28, group='sfx')
glint = m.track('glint', level=-34, sends={'room': -11})

chords = CUES['music']['chords']
for i, (t, name) in enumerate(chords):
    end = chords[i + 1][0] if i + 1 < len(chords) else DUR
    dur = end - t + 1.4
    pad.add(synth.pad(VOICING[name], dur, 0.5, 'glass'), t)
    sub.add(fm.epiano(BASS[name], min(3.4, dur), 0.32, bright=0.07, release=1.2), t)

# 明暗：童年亮 → 台阶亮 → 坠落前收暗 → 心结最暗 → 花开回暖 → 填金最亮
pad.automate('lpf', [(0, 1400), (12, 3200), (22, 4200), (pieces['fall']['start'], 1600),
                     (knot_start, 900), (knot_start + 8, 1100), (flower_start, 3400),
                     (fill, 5600), (DUR, 4200)])

for t, note in CUES['music']['notes']:
    keys.add(fm.epiano(note, 2.2, 0.44, bright=0.11, tremolo=0.05, release=1.0), t)

for t in CUES['music']['glints']:
    glint.add(fm.bell('D6', 1.7, 0.13, 'glock'), t, pan=float(np.clip((t - 40) / 40, -0.5, 0.5)))

# 笔触声：心结段速度慢，包络也压低一点，让“打结”听起来是屏住呼吸
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
    if knot_start <= a < flower_start:
        weight *= 0.7
    env += inside * weight * (0.25 + 0.75 * np.sin(np.pi * np.clip(q, 0, 1)) ** 0.7)
rng = np.random.default_rng(20260601)
noise = rng.normal(0, 0.05, n).astype(np.float32)
paper = np.asarray(filters.bpf(Sound(noise), 1500, q=0.7), dtype=np.float32).reshape(-1)[:n]
draw = (paper + rng.normal(0, 0.016, n).astype(np.float32)) * env
draw *= np.minimum(1, tt / 0.05)
draw *= np.minimum(1, np.maximum(0, (fill + 0.2 - tt) / 0.3))
pen.add(Sound(draw.astype(np.float32)), 0)

# 四处事件：山顶、坠落、心结、填金
m.sfx(sfx.ding('A5'), at=pieces['flag']['end'], gain=-30)
m.sfx(sfx.sub_drop(), at=pieces['fall']['start'] + 0.3, gain=-20)
m.sfx(sfx.whoosh(1.6, 'air', direction=-1, peak=0.3), at=knot_start, gain=-24)
m.sfx(sfx.riser(1.8, 'tonal', note='A4'), at=fill, gain=-25)
m.sfx(sfx.shimmer_hit('D6'), at=fill + 0.1, gain=-13)
m.sfx(sfx.reverse_cymbal(1.4), at=CUES['type']['wordmark']['start'], gain=-26)

res = m.export(OUT, lufs=-14, tp=-1.2)
print(json.dumps({k: res[k] for k in res if k in ('duration', 'lufs', 'true_peak', 'warnings')},
                 ensure_ascii=False, indent=1))
