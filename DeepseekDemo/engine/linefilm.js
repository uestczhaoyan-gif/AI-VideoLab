// engine/linefilm.js — 一笔画通用引擎
//
// 由 film/film.js（ATELIER LINEA 复原版）抽出来的通用版本：把“哪些形、什么时刻、怎么跟镜头”
// 全部放进 cues.json，引擎只负责几何采样、时间映射、描边、线转面、文字与颗粒。
//
// 页面只需提供：
//   window.FILM = { cues: './cues.json', grain: '../../assets/textures/grain_fine_2048.png', assetBase: '../../assets/fonts/' }
//   <canvas width=1920 height=1080> + <svg id="geometry">
//
// 支持的路段类型（pieces[i]）：
//   { name, start, end, d: 'C ...' }                        SVG 路径段（从上一段终点续画）
//   { name, start, end, circle: {c,r,a0,dir} }              解析圆
//   { name, start, end, spiral: {c,r0,r1,a0,turns,dir} }     阿基米德螺线（波前/汇聚）
//   { name, start, end, rings: {c,radii,phase,dir} }        同心环 + 径向接缝（艾里斑）
//
// 其他数据：dots（小实心点）、captions（屏幕空间字幕）、logo（圆面 + 挖孔 + 填金）、
// pulse（反向光脉冲）、camera（缩放/去程/交还）、type（字标）、look（材质）、pen（笔尖）。

const CFG = window.FILM || {};
const W = 1920, H = 1080;
const DBG = new URLSearchParams(location.search).get('dbg') || '';
const cues = await (await fetch(CFG.cues || './cues.json')).json();

// ---------------------------------------------------------------- 字体与颗粒
const families = new Set();
for (const item of [cues.type?.wordmark, cues.type?.tagline, ...(cues.captions || []), ...(cues.dots || [])]) {
  if (item && item.family) families.add(item.family);
}
const fontJobs = [];
for (const t of [cues.type?.wordmark, cues.type?.tagline]) {
  if (t) fontJobs.push(document.fonts.load(`${t.weight || 400} ${t.size}px ${t.family}`, t.text));
}
if (cues.captions?.length) {
  const c = cues.captions[0];
  fontJobs.push(document.fonts.load(`${c.weight || 300} ${c.size}px ${c.family}`, cues.captions.map((x) => x.text).join('')));
}
await Promise.all(fontJobs);
const grain = new Image();
grain.src = CFG.grain;
await grain.decode();

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const svg = document.querySelector('#geometry');

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = (x) => { x = clamp(x); return 1 - (1 - x) * (1 - x); };
const mix = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------- 单调三次插值
// 时间 → 弧长、时间 → 镜头参数都用它：C1 连续、不过冲，转角自然减速、长线自然加速。
function monotone(keys) {
  const n = keys.length;
  const x = keys.map((k) => k[0]), y = keys.map((k) => k[1]);
  if (n === 1) return () => y[0];
  const d = [];
  for (let i = 0; i < n - 1; i++) {
    const h = x[i + 1] - x[i];
    d.push(h > 1e-9 ? (y[i + 1] - y[i]) / h : 0);
  }
  const m = new Array(n);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (t) => {
    if (t <= x[0]) return y[0] + m[0] * (t - x[0]);
    if (t >= x[n - 1]) return y[n - 1] + m[n - 1] * (t - x[n - 1]);
    let i = 0;
    while (t > x[i + 1]) i++;
    const h = x[i + 1] - x[i], u = (t - x[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * y[i] + (u3 - 2 * u2 + u) * h * m[i]
      + (-2 * u3 + 3 * u2) * y[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}

// ---------------------------------------------------------------- 几何生成
function samplePath(d, step = 1.25) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d);
  svg.appendChild(el);
  const len = el.getTotalLength();
  const n = Math.max(2, Math.ceil(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const p = el.getPointAtLength((len * i) / n);
    pts.push([p.x, p.y]);
  }
  return { len, pts };
}

function circleGeometry({ c, r, a0 = 0, dir = 1 }, step = 1.25) {
  const len = 2 * Math.PI * r;
  const n = Math.max(16, Math.ceil(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + (dir * 360 * i) / n) * Math.PI) / 180;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return { len, pts };
}

function spiralGeometry({ c, r0, r1, a0 = 0, turns = 2, dir = 1 }, step = 1.25) {
  const approx = Math.PI * (r0 + r1) * turns;
  const n = Math.max(32, Math.ceil(approx / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = ((a0 + dir * 360 * turns * u) * Math.PI) / 180;
    const r = mix(r0, r1, u);
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { len, pts };
}

// 同心环：每个环画满 360°，再径向跳到下一环、沿下一环错开一个角度继续。
// 接缝因此绕着圈走，不会堆成一根竖线；一条线画出来的“艾里斑”就是这种带接缝的环簇。
function ringsGeometry({ c, radii, phase = 90, dir = 1, jog = 46 }, step = 1.2) {
  const pts = [];
  let a0 = phase;
  for (let i = 0; i < radii.length; i++) {
    const r = radii[i];
    const n = Math.max(24, Math.ceil((2 * Math.PI * r) / step));
    for (let k = 0; k <= n; k++) {
      const ang = ((a0 + (dir * 360 * k) / n) * Math.PI) / 180;
      pts.push([c[0] + r * Math.cos(ang), c[1] + r * Math.sin(ang)]);
    }
    if (i < radii.length - 1) {
      const rr = radii[i + 1];
      const aEnd = a0;
      for (let k = 1; k <= 4; k++) {
        const rk = mix(r, rr, k / 4);
        const ang = (aEnd * Math.PI) / 180;
        pts.push([c[0] + rk * Math.cos(ang), c[1] + rk * Math.sin(ang)]);
      }
      const a1 = aEnd + dir * jog;
      const m = Math.max(6, Math.ceil(((Math.PI * rr * Math.abs(jog)) / 180) / step));
      for (let k = 1; k <= m; k++) {
        const ang = (mix(aEnd, a1, k / m) * Math.PI) / 180;
        pts.push([c[0] + rr * Math.cos(ang), c[1] + rr * Math.sin(ang)]);
      }
      a0 = a1;
    }
  }
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { len, pts };
}

const pieces = [];
const pts = [];
let total = 0;
let cursor = cues.origin.slice();
for (const def of cues.pieces) {
  let geo;
  if (def.circle) geo = circleGeometry(def.circle);
  else if (def.spiral) geo = spiralGeometry(def.spiral);
  else if (def.rings) geo = ringsGeometry(def.rings);
  else geo = samplePath(`M${cursor[0]} ${cursor[1]} ${def.d}`);
  const { len, pts: raw } = geo;
  const offset = total;
  const n = raw.length - 1;
  for (let i = 0; i <= n; i++) pts.push([raw[i][0], raw[i][1], offset + (len * i) / n]);
  pieces.push({ name: def.name, start: def.start, end: def.end, offset, len, from: raw[0], to: raw[n] });
  total += len;
  cursor = raw[n];
}

function pointAt(s) {
  s = clamp(s, 0, total);
  let lo = 0, hi = pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (pts[mid][2] < s) lo = mid + 1; else hi = mid;
  }
  const b = pts[lo], a = pts[Math.max(0, lo - 1)];
  const span = b[2] - a[2];
  const u = span > 1e-6 ? (s - a[2]) / span : 0;
  return [mix(a[0], b[0], u), mix(a[1], b[1], u)];
}

// 时间 → 弧长
const anchors = [[0, 0]];
for (const p of pieces) anchors.push([p.end, (p.offset + p.len) / total]);
anchors[anchors.length - 1][0] = Math.min(anchors[anchors.length - 1][0], cues.duration);
const sCurve = monotone(anchors);
const distance = (t) => total * clamp(sCurve(t), 0, 1);

// ---------------------------------------------------------------- 镜头
const zoomCurve = monotone(cues.camera.zoom);
const leadCurve = monotone(cues.camera.lead);
const settleTarget = cues.camera.settleTarget || [W / 2, H / 2];
function penPos(t) {
  const a0 = cues.logo?.archStart ?? 1e9, a1 = cues.logo?.archEnd ?? 1e9;
  if (t >= a0 && t <= a1 && archAt) return archAt(ease((t - a0) / (a1 - a0)));
  return pointAt(distance(clamp(t, 0, cues.duration)));
}
function softPen(t) {
  const win = cues.camera.smooth || 0.34;
  let sx = 0, sy = 0, sw = 0;
  for (let i = -4; i <= 4; i++) {
    const p = penPos(clamp(t + (win * i) / 4, 0, cues.duration));
    const w = Math.cos((i / 4) * Math.PI * 0.5) ** 2 + 0.001;
    sx += p[0] * w; sy += p[1] * w; sw += w;
  }
  return [sx / sw, sy / sw];
}
function camera(t) {
  let z = zoomCurve(t);
  const [px, py] = softPen(t);
  let x = px + leadCurve(t) / z;
  let y = py + (cues.camera.leadY ?? 34) / z;
  const [s0, s1] = cues.camera.settle;
  const settle = ease((t - s0) / (s1 - s0));
  x = mix(x, settleTarget[0], settle);
  y = mix(y, settleTarget[1], settle);
  // 第二段：整体退开，让观众看到“这一整幅画”。用于结尾把镜头交还给全片。
  const rv = cues.camera.reveal;
  if (rv) {
    const k = ease((t - rv.start) / (rv.end - rv.start));
    x = mix(x, rv.target[0], k);
    y = mix(y, rv.target[1], k);
    z = mix(z, rv.zoom, k);
  }
  return { x, y, z };
}
const toScreen = (cam, x, y) => [W / 2 + (x - cam.x) * cam.z, H / 2 + (y - cam.y) * cam.z];

// ---------------------------------------------------------------- 标志与填金
const L = cues.logo || null;
const dots = (cues.dots || []).map((d) => ({ ...d }));
const disc = document.createElement('canvas');
const dctx = disc.getContext('2d');

function drawFill(t, cam) {
  if (!L) return;
  const p = clamp((t - L.fillStart) / (L.fillEnd - L.fillStart));
  if (p <= 0) return;
  const amt = easeOut(p);
  const [cx, cy] = toScreen(cam, L.center[0], L.center[1]);
  const rs = L.r * cam.z;
  const size = Math.ceil(rs * 2.6);
  if (disc.width !== size) { disc.width = size; disc.height = size; }
  dctx.setTransform(1, 0, 0, 1, 0, 0);
  dctx.clearRect(0, 0, size, size);
  dctx.setTransform(cam.z, 0, 0, cam.z, size / 2 - L.center[0] * cam.z, size / 2 - L.center[1] * cam.z);
  dctx.globalCompositeOperation = 'source-over';

  const g = dctx.createLinearGradient(L.center[0] - L.r * 0.9, L.center[1] - L.r, L.center[0] + L.r * 0.9, L.center[1] + L.r);
  const gs = L.gold || ['#f0dfb4', '#e2cd97', '#cfae72', '#b78f4e'];
  gs.forEach((c, i) => g.addColorStop(i / (gs.length - 1), c));
  dctx.fillStyle = g;
  dctx.beginPath();
  dctx.arc(L.center[0], L.center[1], L.r, 0, Math.PI * 2);
  dctx.fill();

  const hl = dctx.createRadialGradient(L.center[0] - L.r * 0.32, L.center[1] - L.r * 0.42, L.r * 0.05,
    L.center[0] - L.r * 0.32, L.center[1] - L.r * 0.42, L.r * 1.2);
  hl.addColorStop(0, 'rgba(255,248,222,0.24)');
  hl.addColorStop(0.55, 'rgba(255,244,210,0.07)');
  hl.addColorStop(1, 'rgba(255,240,200,0)');
  dctx.fillStyle = hl;
  dctx.beginPath();
  dctx.arc(L.center[0], L.center[1], L.r, 0, Math.PI * 2);
  dctx.fill();

  // 挖孔：本片是“两个被分辨的点”，ATELIER 版是拱门；都只是 circle 列表。
  dctx.globalCompositeOperation = 'destination-out';
  for (const hole of L.holes || []) {
    dctx.beginPath();
    dctx.arc(hole.c[0], hole.c[1], hole.r, 0, Math.PI * 2);
    dctx.fill();
  }

  // 由“线落点”向外扩张的揭示：线转面的动因看得见。
  dctx.globalCompositeOperation = 'destination-in';
  const a = L.anchor || L.center;
  const rr = L.r * 0.28 + L.r * 2.6 * amt;
  const reveal = dctx.createRadialGradient(a[0], a[1], 0, a[0], a[1], rr);
  reveal.addColorStop(0, 'rgba(0,0,0,1)');
  reveal.addColorStop(0.72, 'rgba(0,0,0,1)');
  reveal.addColorStop(1, 'rgba(0,0,0,0)');
  dctx.fillStyle = reveal;
  dctx.fillRect(L.center[0] - L.r * 2, L.center[1] - L.r * 2, L.r * 4, L.r * 4);
  dctx.globalCompositeOperation = 'source-over';

  const bloom = ctx.createRadialGradient(cx, cy, rs * 0.92, cx, cy, rs * 1.3);
  bloom.addColorStop(0, 'rgba(233,201,132,0.07)');
  bloom.addColorStop(1, 'rgba(233,201,132,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(cx - rs * 1.4, cy - rs * 1.4, rs * 2.8, rs * 2.8);

  ctx.globalAlpha = clamp(amt * 2.2, 0, 1);
  ctx.drawImage(disc, cx - size / 2, cy - size / 2, size, size);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 描边
function strokeMain(drawn, cam) {
  const lw = (v) => v / cam.z;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && pts[i][2] <= drawn; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  const head = pointAt(drawn);
  ctx.lineTo(head[0], head[1]);

  ctx.lineWidth = lw(cues.look.glowWidth * 1.9);
  ctx.strokeStyle = cues.look.lineGlow;
  ctx.globalAlpha = 0.16;
  ctx.shadowColor = cues.look.lineGlow;
  ctx.shadowBlur = cues.look.blur * cam.z;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.lineWidth = lw(cues.look.glowWidth);
  ctx.globalAlpha = 0.42;
  ctx.stroke();

  ctx.lineWidth = lw(cues.look.lineWidth);
  ctx.strokeStyle = cues.look.lineCore;
  ctx.globalAlpha = 0.96;
  ctx.stroke();

  ctx.lineWidth = lw(cues.look.lineWidth * 0.42);
  ctx.strokeStyle = '#f6e8bd';
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 点 / 笔尖 / 脉冲
function drawDots(t, cam) {
  for (const d of dots) {
    const p = clamp((t - d.t) / (d.fade || 0.6));
    if (p <= 0) continue;
    const scale = easeOut(p);
    const [x, y] = toScreen(cam, d.c[0], d.c[1]);
    const r = (d.r || 7) * cam.z * (0.4 + 0.6 * scale);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
    glow.addColorStop(0, `rgba(255,246,214,${0.55 * scale})`);
    glow.addColorStop(0.35, `rgba(240,212,150,${0.20 * scale})`);
    glow.addColorStop(1, 'rgba(240,212,150,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,250,232,${0.95 * scale})`;
    ctx.fill();
  }
}

function drawPen(t, cam) {
  const fade = 1 - ease((t - cues.pen.until) / cues.pen.fade);
  if (fade <= 0) return;
  const p = penPos(t);
  const [x, y] = toScreen(cam, p[0], p[1]);
  const bloom = cues.pen.bloom;
  const g = ctx.createRadialGradient(x, y, 0, x, y, bloom);
  g.addColorStop(0, `rgba(255,250,226,${0.8 * fade})`);
  g.addColorStop(0.12, `rgba(255,240,196,${0.4 * fade})`);
  g.addColorStop(0.45, `rgba(236,205,140,${0.12 * fade})`);
  g.addColorStop(1, 'rgba(236,205,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - bloom, y - bloom, bloom * 2, bloom * 2);
  ctx.beginPath();
  ctx.arc(x, y, cues.pen.core, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,253,240,${0.95 * fade})`;
  ctx.fill();
}

function drawPulse(t, cam) {
  const p = cues.pulse;
  if (!p || t < p.start || t > p.end) return;
  const u = (t - p.start) / (p.end - p.start);
  const s = total * mix(p.from, p.to, ease(u));
  const [wx, wy] = pointAt(s);
  const [x, y] = toScreen(cam, wx, wy);
  const fade = (1 - ease(u)) * (p.alpha ?? 0.85);
  const g = ctx.createRadialGradient(x, y, 0, x, y, p.glow ?? 24);
  g.addColorStop(0, `rgba(255,246,214,${0.9 * fade})`);
  g.addColorStop(0.25, `rgba(240,214,150,${0.35 * fade})`);
  g.addColorStop(1, 'rgba(240,214,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - (p.glow ?? 24), y - (p.glow ?? 24), (p.glow ?? 24) * 2, (p.glow ?? 24) * 2);
  ctx.beginPath();
  ctx.arc(x, y, p.radius ?? 4, 0, Math.PI * 2);
  ctx.fillStyle = p.color || '#fff3cd';
  ctx.globalAlpha = fade;
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 文字
function spaced(text, cx, baseline, size, track, weight, family, color, alpha) {
  if (alpha <= 0) return 0;
  ctx.font = `${weight} ${size}px ${family}`;
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const width = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
  let x = cx - width / 2;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, baseline);
    x += widths[i] + track;
  }
  ctx.globalAlpha = 1;
  return width;
}

function drawCaptions(t) {
  if (!cues.captions) return;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const c of cues.captions) {
    const a = ease((t - c.t0) / (c.fade ?? 0.6)) * (1 - ease((t - c.t1) / (c.fade ?? 0.6)));
    if (a <= 0.002) continue;
    ctx.font = `${c.weight || 300} ${c.size || 30}px ${c.family || 'NotoSerifSC'}`;
    ctx.fillStyle = c.color || '#b9b39c';
    ctx.globalAlpha = a * (c.alpha ?? 0.85);
    ctx.fillText(c.text, c.x ?? 120, c.y ?? 960);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'left';
}

function drawType(t) {
  const wm = cues.type?.wordmark, tl = cues.type?.tagline;
  if (!wm && !tl) return;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (wm) {
    const a = ease((t - wm.start) / wm.fade);
    if (a > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(232,208,150,0.45)';
      ctx.shadowBlur = 12 * a;
      spaced(wm.text, W / 2, wm.baseline, wm.size, wm.track, wm.weight, wm.family, wm.color, a);
      ctx.restore();
    }
  }
  if (tl) {
    const a = ease((t - tl.start) / tl.fade);
    if (a > 0) {
      const width = spaced(tl.text, W / 2, tl.baseline, tl.size, tl.track, tl.weight, tl.family, tl.color, a * 0.92);
      const y = tl.baseline - tl.size * 0.36;
      const x0 = W / 2 - width / 2 - (tl.ruleGap ?? 34);
      const x1 = W / 2 + width / 2 + (tl.ruleGap ?? 34);
      ctx.strokeStyle = tl.color;
      ctx.globalAlpha = a * 0.5;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0 - (tl.ruleLen ?? 26), y); ctx.lineTo(x0, y);
      ctx.moveTo(x1, y); ctx.lineTo(x1 + (tl.ruleLen ?? 26), y);
      ctx.stroke();
      for (const dx of [x0 - (tl.ruleLen ?? 26), x1 + (tl.ruleLen ?? 26)]) {
        const g = ctx.createRadialGradient(dx, y, 0, dx, y, 13);
        g.addColorStop(0, `rgba(255,247,214,${0.9 * a})`);
        g.addColorStop(0.3, `rgba(240,220,170,${0.3 * a})`);
        g.addColorStop(1, 'rgba(240,220,170,0)');
        ctx.fillStyle = g;
        ctx.fillRect(dx - 13, y - 13, 26, 26);
        ctx.fillStyle = '#fffaea';
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(dx, y, tl.dot ?? 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
}

// ---------------------------------------------------------------- 主渲染
function render(t) {
  const cam = camera(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  if (DBG === 'cam') {
    const pen = penPos(t), sp = softPen(t);
    console.error(`cam t=${t.toFixed(2)} x=${cam.x.toFixed(1)} y=${cam.y.toFixed(1)} z=${cam.z.toFixed(3)} ` +
      `pen=${pen[0].toFixed(0)},${pen[1].toFixed(0)} soft=${sp[0].toFixed(0)},${sp[1].toFixed(0)} ` +
      `drawn=${distance(t).toFixed(0)}/${total.toFixed(0)}`);
  }

  const bg = ctx.createRadialGradient(W / 2, H * 0.44, 40, W / 2, H * 0.44, 1160);
  bg.addColorStop(0, cues.look.bgCenter);
  bg.addColorStop(0.52, cues.look.bgMid);
  bg.addColorStop(1, cues.look.bgEdge);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const drawn = distance(t);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);
  strokeMain(drawn, cam);
  ctx.restore();

  drawFill(t, cam);
  drawDots(t, cam);
  drawPen(t, cam);
  drawPulse(t, cam);

  if (DBG !== 'nograin') {
    ctx.globalCompositeOperation = cues.look.grainMode;
    ctx.globalAlpha = cues.look.grainAlpha;
    ctx.drawImage(grain, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  drawCaptions(t);
  drawType(t);
}

// 拱门（ATELIER 版用到；新片没有就跳过）
let archAt = null;
if (cues.logo?.arch) {
  const arch = samplePath(cues.logo.arch, 1.0);
  const archPts = [];
  const n = arch.pts.length - 1;
  for (let i = 0; i <= n; i++) archPts.push([arch.pts[i][0], arch.pts[i][1], (arch.len * i) / n]);
  archAt = (u) => {
    const s = clamp(u) * arch.len;
    let lo = 0, hi = archPts.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (archPts[mid][2] < s) lo = mid + 1; else hi = mid; }
    const b = archPts[lo], a = archPts[Math.max(0, lo - 1)];
    const span = b[2] - a[2], k = span > 1e-6 ? (s - a[2]) / span : 0;
    return [mix(a[0], b[0], k), mix(a[1], b[1], k)];
  };
}

window.DEMO = {
  width: W, height: H, fps: cues.fps, duration: cues.duration,
  motionBlur: { samples: cues.blur?.samples ?? 4, shutter: cues.blur?.shutter ?? 0.5 },
};
window.renderAt = (t) => { render(t); };
window.__info = {
  totalLength: +total.toFixed(1),
  pieces: pieces.map((p) => ({ name: p.name, length: +p.len.toFixed(1), start: p.start, end: p.end })),
};
render(0);
window.__ready = true;
