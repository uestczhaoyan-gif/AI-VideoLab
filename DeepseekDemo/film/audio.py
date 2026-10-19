"""ATELIER LINEA · 一笔画 — 配乐与笔触声（DeepseekDemo 复原版）

配乐写作原则（见 ../docs/METHOD.md）：
- 音乐只做两件事：托住留白、标记笔触事件。不堆叠、不抢画面。
- 和弦与旋律的时间点全部来自 cues.json，画面改时间轴时声音跟着走，不写死秒数。
- 只在“线转面”处给一个清晰的金属重音，其余保持克制。
"""
import json
import os
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix, Sound, fm, sfx, synth, filters  # noqa: E402

CUES = json.loads(Path(__file__).with_name('cues.json').read_text(encoding='utf-8'))
DUR = CUES['duration']
OUT = os.environ['VIDEOLAB_AUDIO_OUT']

# 和声：D 大调，全片只用五个色彩和弦，避免“换和弦像换歌”。
VOICING = {
    'Dmaj9': ['D3', 'A3', 'C#4', 'E4', 'F#4'],
    'Bm11': ['B2', 'F#3', 'A3', 'D4', 'E4'],
    'Gmaj9': ['G2', 'D3', 'F#3', 'A3', 'B3'],
    'Dmaj9/F#': ['F#2', 'A2', 'D3', 'E3', 'C#4'],
}
BASS = {'Dmaj9': 'D2', 'Bm11': 'B1', 'Gmaj9': 'G1', 'Dmaj9/F#': 'F#2'}

m = Mix(DUR, bpm=80)

pad = m.track('pad', level=-27, sends={'hall': -11})
keys = m.track('keys', level=-24, sends={'plate': -15})
pen = m.track('pen', level=-25, group='sfx')
glint = m.track('glint', level=-31, sends={'room': -12})

# ---- 和声垫：每段一个和弦，段尾留出交叠，像笔触之间的呼吸。
chords = CUES['music']['chords']
for i, (t, name) in enumerate(chords):
    end = chords[i + 1][0] if i + 1 < len(chords) else DUR
    dur = end - t + 0.9
    pad.add(synth.pad(VOICING[name], dur, 0.55, 'glass'), t)
    keys.add(fm.epiano(BASS[name], min(2.4, dur), 0.42, bright=0.1, release=0.9), t)

# ---- 旋律：只在画面推进的关键帧落一颗音，等于给笔尖配“呼吸点”。
for t, note in CUES['music']['notes']:
    keys.add(fm.epiano(note, 1.7, 0.5, bright=0.16, tremolo=0.05, release=0.8), t)

# ---- 笔触：噪声跟着每段的绘制包络走，而不是一段无关联的底噪。
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
    # 起笔轻、行笔稳、收笔收住；短段稍强，长段稍弱，避免长横线一直“沙沙”响。
    weight = min(1.25, 0.55 / max(0.12, b - a) ** 0.35)
    env += inside * weight * (0.25 + 0.75 * np.sin(np.pi * np.clip(q, 0, 1)) ** 0.7)
rng = np.random.default_rng(20260410)
noise = rng.normal(0, 0.05, n).astype(np.float32)
paper = np.asarray(filters.bpf(Sound(noise), 2800, q=0.8), dtype=np.float32).reshape(-1)[:n]
grain_n = rng.normal(0, 0.018, n).astype(np.float32)
draw = (paper + grain_n) * env
draw *= np.minimum(1, tt / 0.04)
draw *= np.minimum(1, np.maximum(0, (CUES['logo']['fillStart'] + 0.1 - tt) / 0.25))
pen.add(Sound(draw.astype(np.float32)), 0)

# ---- 细节音：叶片、塔尖、山脊这类“形完成”的瞬间，用很轻的钟片点一下。
for t in CUES['music']['glints']:
    pan = float(np.clip((t - 4.5) / 3.5, -0.6, 0.6))
    glint.add(fm.bell('D6', 1.4, 0.16, 'glock'), t, pan=pan)

# ---- 事件音
m.sfx(sfx.whoosh(1.1, 'air', direction=1, peak=0.4), at=CUES['pieces'][-3]['start'], gain=-20)
m.sfx(sfx.riser(0.9, 'tonal', note='A4'), at=CUES['logo']['archStart'], gain=-22)
m.sfx(sfx.shimmer_hit('D6'), at=CUES['logo']['fillStart'] + 0.06, gain=-13)
m.sfx(sfx.reverse_cymbal(0.8), at=CUES['type']['wordmark']['start'], gain=-24)

res = m.export(OUT, lufs=-14, tp=-1.2)
print(json.dumps({k: res[k] for k in res if k in ('duration', 'lufs', 'true_peak', 'warnings')}, ensure_ascii=False, indent=1))
