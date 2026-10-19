"""一笔一生 · ONE LIFE —— 生成 cues.json

人生这条线要有“形状”，所以几何不手写 JSON，而是用参数生成：
每一段是一个形体，脚本负责算长度、按“每段的笔速”分配时间、再归一化到目标时长。
改片子只需要改这里的速度表 / 形体参数，然后重跑本脚本。

用法：python build_cues.py
"""
import json
import math
from pathlib import Path

DURATION = 82.0
FPS = 30
OUT = Path(__file__).with_name('cues.json')

# ---------------------------------------------------------------- 路径工具
def poly_len(pts):
    return sum(math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) for i in range(1, len(pts)))


def sample_cubic(p0, p1, p2, p3, n=24):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        pts.append((
            u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1],
        ))
    return pts


class Path:
    """累加 d 字符串，同时用采样点算真实长度。"""

    def __init__(self, start):
        self.cur = start
        self.d = ''
        self.pts = [start]

    def L(self, x, y):
        self.d += f'L {x:g} {y:g} '
        self.pts.append((x, y))
        self.cur = (x, y)
        return self

    def C(self, x1, y1, x2, y2, x3, y3):
        self.d += f'C {x1:g} {y1:g} {x2:g} {y2:g} {x3:g} {y3:g} '
        self.pts += sample_cubic(self.cur, (x1, y1), (x2, y2), (x3, y3))
        self.cur = (x3, y3)
        return self

    @property
    def length(self):
        return poly_len(self.pts)


def spiral_len(r0, r1, turns):
    total = 0.0
    prev = None
    n = 2000
    for i in range(n + 1):
        t = i / n
        th = 2 * math.pi * turns * t
        r = r0 + (r1 - r0) * t
        p = (r * math.cos(th), r * math.sin(th))
        if prev:
            total += math.hypot(p[0] - prev[0], p[1] - prev[1])
        prev = p
    return total


def circle_len(r):
    return 2 * math.pi * r


def spiral_end(c, r0, r1, a0, turns, dir_):
    ang = math.radians(a0 + dir_ * 360 * turns)
    return (c[0] + r1 * math.cos(ang), c[1] + r1 * math.sin(ang)), (a0 + dir_ * 360 * turns) % 360


def petal(c, angle_deg, length, width):
    """一片花瓣：从花心出去到尖端，再原路旁边回来。"""
    a = math.radians(angle_deg)
    tx, ty = c[0] + length * math.cos(a), c[1] + length * math.sin(a)
    nx, ny = -math.sin(a), math.cos(a)
    p = Path(c)
    mx, my = c[0] + 0.55 * (tx - c[0]), c[1] + 0.55 * (ty - c[1])
    p.C(c[0] + 0.30 * (tx - c[0]) + nx * width, c[1] + 0.30 * (ty - c[1]) + ny * width,
        mx + nx * width * 0.85, my + ny * width * 0.85, tx, ty)
    mx2, my2 = c[0] + 0.45 * (tx - c[0]), c[1] + 0.45 * (ty - c[1])
    p.C(mx2 - nx * width * 0.9, my2 - ny * width * 0.9,
        c[0] + 0.22 * (tx - c[0]) - nx * width * 0.9, c[1] + 0.22 * (ty - c[1]) - ny * width * 0.9,
        c[0], c[1])
    return p


# ---------------------------------------------------------------- 形体（世界坐标 1920×1080 基准，向右延伸）
PIECES = []


def add(name, path, speed, d=None):
    PIECES.append({'name': name, 'speed': speed, 'd': d if d else path.d.strip(), 'length': path.length})


def add_prim(name, obj, speed, length):
    PIECES.append({'name': name, 'speed': speed, 'shape': obj, 'length': length})


# 1 出生：一团卷曲
coil_c = (300, 700)
end_pt, end_ang = spiral_end(coil_c, 4, 64, 90, 1.7, 1)
add_prim('coil', {'spiral': {'c': list(coil_c), 'r0': 4, 'r1': 64, 'a0': 90, 'turns': 1.7, 'dir': 1}},
         70, spiral_len(4, 64, 1.7))

p = Path(end_pt).C(380, 680, 420, 700, 470, 700).L(520, 700)
add('ground-birth', p, 230)

# 2 童年：风筝（菱形 + 升线 + 落线；不做尾巴，免得读成闪电）
p = Path((520, 700)).C(556, 640, 610, 520, 660, 430).C(676, 396, 688, 372, 700, 352)
add('kite-string', p, 190)
p = Path((700, 352)).L(600, 268).L(700, 150).L(800, 268).L(700, 352)
add('kite-body', p, 150)
p = Path((700, 352)).C(730, 420, 770, 560, 800, 640).C(812, 668, 818, 686, 824, 700)
add('kite-land', p, 195)

# 3 求学：一本打开的书（有厚度，立在人生线上）
p = Path((824, 700)).L(844, 700).L(852, 556).L(972, 616).L(1092, 556).L(1100, 700).L(1140, 700)
add('book', p, 140)

# 4 台阶
p = Path((1140, 700))
for k in range(6):
    p.L(1140 + 70 * (k + 1), 700 - 70 * k).L(1140 + 70 * (k + 1), 700 - 70 * (k + 1))
p.L(1560, 280)
add('stairs', p, 175)

# 5 门
p = Path((1560, 280)).L(1600, 280).L(1600, 156).L(1712, 156).L(1712, 280).L(1772, 318)
add('door', p, 165)

# 6 山与旗
p = Path((1772, 318)).C(1880, 290, 1958, 190, 2020, 150)
add('mountain-up', p, 155)
p = Path((2020, 150)).L(2020, 74).L(2098, 108).L(2020, 140)
add('flag', p, 135)
p = Path((2020, 140)).C(2100, 190, 2172, 300, 2240, 390).L(2272, 402)
add('mountain-down', p, 180)

# 7 坠落与裂缝
p = Path((2272, 402)).C(2330, 470, 2360, 560, 2372, 632)
add('fall', p, 215)
p = Path((2372, 632)).L(2334, 678).L(2390, 722).L(2346, 768).L(2402, 810).L(2364, 854).L(2412, 892)
add('crack', p, 135)

# 8 心结：向内绕紧，再反向松开（半径放大，才看得出“结”）
knot_c = (2478, 946)
a0 = math.degrees(math.atan2(892 - knot_c[1], 2412 - knot_c[0])) % 360
r0 = math.hypot(2412 - knot_c[0], 892 - knot_c[1])
knot_end, knot_ang = spiral_end(knot_c, r0, 14, a0, 2.2, 1)
add_prim('knot-in', {'spiral': {'c': list(knot_c), 'r0': round(r0, 2), 'r1': 14, 'a0': round(a0, 2), 'turns': 2.2, 'dir': 1}},
         95, spiral_len(r0, 14, 2.2))
knot_c2 = (2498, 928)
r0b = math.hypot(knot_end[0] - knot_c2[0], knot_end[1] - knot_c2[1])
a0b = math.degrees(math.atan2(knot_end[1] - knot_c2[1], knot_end[0] - knot_c2[0])) % 360
loose_end, _ = spiral_end(knot_c2, r0b, 148, a0b, 1.9, -1)
add_prim('knot-out', {'spiral': {'c': list(knot_c2), 'r0': round(r0b, 2), 'r1': 148, 'a0': round(a0b, 2), 'turns': 1.9, 'dir': -1}},
         105, spiral_len(r0b, 148, 1.9))

# 9 松开：一段平静的波
p = Path(loose_end).C(2580, 916, 2680, 872, 2780, 860).C(2850, 852, 2900, 868, 2950, 854)
add('calm', p, 125)

# 10 喜欢的事：一株花（茎更高、叶更大、花瓣更长）
p = Path((2950, 854)).C(2966, 812, 2988, 768, 2996, 726).C(3004, 688, 3006, 648, 3008, 618)
add('stem', p, 125)
p = Path((2996, 752)).C(2958, 738, 2912, 748, 2892, 768).C(2906, 790, 2954, 782, 2996, 758)
add('leaf-low', p, 135)
p = Path((3002, 692)).C(3038, 678, 3078, 686, 3098, 708).C(3086, 728, 3042, 720, 3002, 700)
add('leaf-high', p, 135)
p = Path((3008, 618)).L(3008, 612)
add('receptacle', p, 90)
petal_c = (3008, 566)
for i, ang in enumerate((90, 162, 234, 306, 18)):
    pt = petal(petal_c, ang, 96, 54)
    add(f'petal-{i + 1}', pt, 110)

# 11 落叶归根：地平线与太阳
p = Path(petal_c).C(3070, 616, 3160, 668, 3240, 700).L(3420, 700)
add('horizon', p, 165)
sun_c = [3420, 530]
add_prim('sun', {'circle': {'c': sun_c, 'r': 180, 'a0': 90, 'dir': 1}}, 155, circle_len(180))

# ---------------------------------------------------------------- 时间表
total_len = sum(p['length'] for p in PIECES)
raw = [p['length'] / p['speed'] for p in PIECES]
scale = (DURATION - 8.4) / sum(raw)   # 末尾留 8.4 s 给填金、落版与退开
t = 1.0                                # 开场先亮一个点
for p in PIECES:
    p['start'] = round(t, 3)
    t += p['length'] / p['speed'] * scale
    p['end'] = round(t, 3)
draw_end = t

def t_of(name):
    for p in PIECES:
        if p['name'] == name:
            return p['start'], p['end']
    raise KeyError(name)

# ---------------------------------------------------------------- 输出
def piece_out(p):
    if 'shape' in p:
        return {'name': p['name'], 'start': p['start'], 'end': p['end'], **p['shape']}
    return {'name': p['name'], 'start': p['start'], 'end': p['end'], 'd': p['d']}

caption_specs = [
    ('一开始，只是一团卷曲', t_of('coil')[0] + 0.6),
    ('风把线拉高——那是童年', t_of('kite-string')[0]),
    ('书要一页一页读', t_of('book')[0]),
    ('台阶一步一步上', t_of('stairs')[0]),
    ('门口有过光', t_of('door')[0]),
    ('山顶插过一面旗', t_of('mountain-up')[0]),
    ('也摔过，摔出一道裂缝', t_of('fall')[0]),
    ('心打成结的那些年', t_of('knot-in')[0]),
    ('后来，线自己松开了', t_of('calm')[0]),
    ('剩下的时间，只做喜欢的事', t_of('leaf-low')[0]),
    ('最后，画成一个圆', t_of('horizon')[0]),
]
# 字幕严格串行：上一句在下一句出现前 0.6 s 淡完（engine 的 fade=0.45），绝不压叠。
captions = []
for i, (text, t0) in enumerate(caption_specs):
    t1 = (caption_specs[i + 1][1] - 0.6) if i + 1 < len(caption_specs) else DURATION - 0.6
    captions.append((text, t0, max(t0 + 1.2, t1)))

act_notes = [t_of(n)[0] for n in ('coil', 'kite-string', 'book', 'stairs', 'door', 'mountain-up',
                                  'fall', 'knot-in', 'calm', 'leaf-low', 'horizon')]
glints = [t_of(n)[1] for n in ('coil', 'kite-body', 'book', 'stairs', 'door', 'flag', 'crack',
                               'knot-in', 'petal-5', 'sun')]

cues = {
    'title': 'ONE LIFE · 一生，一笔',
    'duration': DURATION,
    'fps': FPS,
    'blur': {'samples': 4, 'shutter': 0.5},
    'origin': [coil_c[0], coil_c[1]],
    'pieces': [piece_out(p) for p in PIECES],
    'dots': [
        {'c': [coil_c[0], coil_c[1]], 'r': 8, 't': 0.4, 'fade': 1.0},
        {'c': sun_c, 'r': 6, 't': t_of('sun')[0] + 1.2, 'fade': 1.4},
    ],
    'logo': {
        'center': sun_c,
        'r': 180,
        'anchor': [sun_c[0], sun_c[1] + 180],
        'holes': [{'c': [sun_c[0], sun_c[1]], 'r': 13}],
        'fillStart': round(t_of('sun')[1] + 0.2, 2),
        'fillEnd': round(t_of('sun')[1] + 3.2, 2),
        'gold': ['#f0dfb4', '#e2cd97', '#cfae72', '#b78f4e'],
    },
    'pulse': {'start': round(t_of('sun')[1] + 1.8, 2), 'end': round(t_of('sun')[1] + 6.6, 2),
              'from': 1.0, 'to': 0.03, 'alpha': 0.75, 'radius': 4.0, 'glow': 24, 'color': '#fff3cd'},
    'camera': {
        'zoom': [[0.0, 2.6], [6.0, 2.6], [11.0, 2.35], [16.0, 2.15], [21.0, 2.0], [25.0, 1.9],
                 [30.0, 1.72], [36.0, 1.55], [44.0, 1.46], [52.0, 1.4], [60.0, 1.32],
                 [66.0, 1.2], [71.0, 1.1], [DURATION - 4.0, 1.02], [DURATION, 1.02]],
        'lead': [[0.0, 300], [8.0, 220], [16.0, 150], [26.0, 90], [36.0, 40], [48.0, -10],
                 [60.0, -20], [71.0, 0], [DURATION, 0]],
        'leadY': 34,
        'smooth': 0.42,
        'settle': [round(t_of('sun')[1] - 2.0, 2), round(t_of('sun')[1] + 1.0, 2)],
        'settleTarget': [sun_c[0], sun_c[1] + 30],
        'reveal': {'start': round(t_of('sun')[1] + 3.4, 2), 'end': round(t_of('sun')[1] + 6.4, 2),
                   'target': [1950, 584], 'zoom': 0.55},
    },
    'captions': [
        {'text': t, 't0': round(a, 2), 't1': round(b, 2), 'x': 140, 'y': 986, 'fade': 0.45,
         'size': 30, 'family': 'NotoSerifSC', 'weight': 300}
        for (t, a, b) in captions
    ],
    'type': {
        'wordmark': {'text': 'ONE LIFE', 'size': 64, 'track': 30, 'weight': 500, 'baseline': 884,
                     'color': '#d9cca6', 'start': round(t_of('sun')[1] + 3.0, 2), 'fade': 0.8,
                     'family': 'Cormorant'},
        'tagline': {'text': '一生，一笔', 'size': 32, 'track': 18, 'weight': 300, 'baseline': 947,
                    'color': '#bdb49a', 'start': round(t_of('sun')[1] + 5.0, 2), 'fade': 0.6,
                    'family': 'NotoSerifSC', 'ruleLen': 26, 'ruleGap': 36, 'dot': 2.6},
    },
    'pen': {'bloom': 34, 'core': 3.0, 'until': round(t_of('sun')[1] + 0.1, 2), 'fade': 0.4},
    'look': {
        'bgCenter': '#162435', 'bgMid': '#0d1724', 'bgEdge': '#060b13',
        'lineCore': '#c6b383', 'lineGlow': '#c2a86c',
        'lineWidth': 2.0, 'glowWidth': 4.0, 'blur': 9,
        'grainAlpha': 0.07, 'grainMode': 'screen',
    },
    'music': {
        'chords': [[0.0, 'Dmaj9'], [round(act_notes[2], 2), 'Bm11'], [round(act_notes[4], 2), 'Gmaj9'],
                   [round(act_notes[6], 2), 'Dmaj9/F#'], [round(act_notes[7], 2), 'Bm11'],
                   [round(act_notes[8], 2), 'Gmaj9'], [round(act_notes[10], 2), 'Dmaj9'],
                   [round(t_of('sun')[1], 2), 'Dmaj9']],
        'notes': [[round(act_notes[i], 2), n] for i, n in enumerate(
            ['A5', 'F#5', 'D5', 'A4', 'B4', 'D5', 'F#4', 'B4', 'D5', 'A4', 'E5'])],
        'glints': [round(g, 2) for g in glints],
    },
}

OUT.write_text(json.dumps(cues, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'pieces={len(PIECES)}  total={total_len:.0f}px  draw_end={draw_end:.2f}s  duration={DURATION}s')
print(f'mean speed={total_len / (draw_end - 1.0):.0f}px/s')
for p in PIECES:
    print(f"  {p['name']:<14} {p['start']:6.2f} → {p['end']:6.2f}  len={p['length']:6.1f}  "
          f"v={p['length'] / max(0.001, p['end'] - p['start']):5.0f}px/s")
