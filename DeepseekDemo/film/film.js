// ATELIER LINEA · 一笔画 — 由 DeepseekDemo 依据项目《一笔画》设计与方法笔记重新编写。
// 一条连续描边从种子长成树苗，树苗的枝条变成建筑与天际线，天际线隆起成山脊并在浪尖绕出一个环，
// 环加拱门构成标志，金色由线转面，最后是字标。见 ../docs/REBUILD-NOTES.md。
//
// 约定（沿用本仓库渲染管线）：window.DEMO / window.renderAt(t) 必须同步返回，画面只由 t 决定。

const W = 1920, H = 1080;
const DBG = new URLSearchParams(location.search).get('dbg') || '';
const cues = await (await fetch('./cues.json')).json();

await Promise.all([
  document.fonts.load(`${cues.type.wordmark.weight} ${cues.type.wordmark.size}px Cormorant`, cues.type.wordmark.text),
  document.fonts.load(`${cues.type.tagline.weight} ${cues.type.tagline.size}px NotoSerifSC`, cues.type.tagline.text),
]);
const grain = new Image();
grain.src = '../assets/textures/grain_fine_2048.png';
await grain.decode();

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const svg = document.querySelector('#geometry');

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = (x) => { x = clamp(x); return 1 - (1 - x) * (1 - x); };
const mix = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------- 平滑插值
// Fritsch–Carlson 单调三次：保证时间到弧长、时间到镜头位置都单调且 C1 连续，
// 不会出现分段缓动在接缝处的速度突跳（原片“不按相同速度机械划过”的要点）。
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

// ---------------------------------------------------------------- 几何采样
// 每条 piece 用 SVG 取长度与点，Canvas 负责最终绘制（与上游一致的混合管线）。
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
  return { el, len, pts };
}

// 圆环单独解析：SVG 的两段 A 命令在端点上会产生两条候选弧，容易拼成一个“花瓣”而不是整圆。
// 这里直接按角度采样，方向、半径与接点都可控。
function circlePoints(c, r, a0, dir, step = 1.25) {
  const len = 2 * Math.PI * r;
  const n = Math.max(16, Math.ceil(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + (dir * 360 * i) / n) * Math.PI) / 180;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return { len, pts };
}

// 扁平点表：每条 piece 的采样点带上“全路径弧长”，绘制时按弧长裁剪即可。
const pieces = [];
const pts = [];
let total = 0;
let cursor = cues.origin.slice();
for (const def of cues.pieces) {
  const sampled = def.circle
    ? circlePoints(def.circle.c, def.circle.r, def.circle.a0, def.circle.dir)
    : samplePath(`M${cursor[0]} ${cursor[1]} ${def.d}`);
  const { len, pts: raw } = sampled;
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

// 时间 → 弧长：锚点是每条 piece 的收笔时刻，笔速在锚点之间自动平滑。
const anchors = [[0, 0]];
for (const p of pieces) anchors.push([p.end, (p.offset + p.len) / total]);
anchors[anchors.length - 1][0] = Math.min(anchors[anchors.length - 1][0], cues.duration);
const sCurve = monotone(anchors);
const distance = (t) => total * clamp(sCurve(t), 0, 1);

// ---------------------------------------------------------------- 镜头
// 原片是“跟着笔尖走”的镜头：笔尖被稳定地放在画面偏左的位置，留出前进空间；
// 结尾把镜头交还给整幅构图。直接用笔尖位置会在一笔画环时猛甩，所以取一小段时间窗的加权平均。
const zoomCurve = monotone(cues.camera.zoom);
const leadCurve = monotone(cues.camera.lead);
function penPos(t) {
  const a0 = cues.logo.archStart, a1 = cues.logo.archEnd;
  if (t >= a0 && t <= a1) return archAt(ease((t - a0) / (a1 - a0)));
  return pointAt(distance(clamp(t, 0, cues.duration)));
}
function softPen(t) {
  const win = cues.camera.smooth || 0.34;
  let sx = 0, sy = 0, sw = 0;
  for (let i = -4; i <= 4; i++) {
    const u = t + (win * i) / 4;
    const p = penPos(clamp(u, 0, cues.duration));
    const w = Math.cos((i / 4) * Math.PI * 0.5) ** 2 + 0.001;
    sx += p[0] * w; sy += p[1] * w; sw += w;
  }
  return [sx / sw, sy / sw];
}
function camera(t) {
  const z = zoomCurve(t);
  const [px, py] = softPen(t);
  let x = px + leadCurve(t) / z;
  let y = py + cues.camera.leadY / z;
  const [s0, s1] = cues.camera.settle;
  const settle = ease((t - s0) / (s1 - s0));
  x = mix(x, W / 2, settle);
  y = mix(y, H / 2, settle);
  return { x, y, z };
}
const toScreen = (cam, x, y) => [W / 2 + (x - cam.x) * cam.z, H / 2 + (y - cam.y) * cam.z];

// ---------------------------------------------------------------- 标志与拱门
const C = cues.logo.center, R = cues.logo.r, A = cues.logo.anchor;
const arch = samplePath(cues.logo.arch, 1.0);
const archPts = [];
{
  const n = arch.pts.length - 1;
  for (let i = 0; i <= n; i++) archPts.push([arch.pts[i][0], arch.pts[i][1], (arch.len * i) / n]);
}
const archPath2D = (() => {
  // 拱门在 world 坐标下的 Path2D，用于在金色圆面上开出暗色门洞。
  const p = new Path2D(cues.logo.arch);
  return p;
})();

function archAt(u) {
  const s = clamp(u) * arch.len;
  let lo = 0, hi = archPts.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (archPts[mid][2] < s) lo = mid + 1; else hi = mid; }
  const b = archPts[lo], a = archPts[Math.max(0, lo - 1)];
  const span = b[2] - a[2], k = span > 1e-6 ? (s - a[2]) / span : 0;
  return [mix(a[0], b[0], k), mix(a[1], b[1], k)];
}

// 圆面填充用离屏画布，才能在“金色实体”上真正挖出门洞而不擦到背景和线条。
const disc = document.createElement('canvas');
const dctx = disc.getContext('2d');

function drawDisc(t, cam) {
  const p = clamp((t - cues.logo.fillStart) / (cues.logo.fillEnd - cues.logo.fillStart));
  if (p <= 0) return;
  const amt = easeOut(p);
  const [cx, cy] = toScreen(cam, C[0], C[1]);
  const rs = R * cam.z;
  const size = Math.ceil(rs * 2.7);
  if (disc.width !== size) { disc.width = size; disc.height = size; }
  dctx.setTransform(1, 0, 0, 1, 0, 0);
  dctx.clearRect(0, 0, size, size);
  dctx.setTransform(cam.z, 0, 0, cam.z, size / 2 - C[0] * cam.z, size / 2 - C[1] * cam.z);
  dctx.globalCompositeOperation = 'source-over';

  const g = dctx.createLinearGradient(C[0] - R * 0.9, C[1] - R, C[0] + R * 0.9, C[1] + R);
  const gs = cues.logo.gold;
  gs.forEach((c, i) => g.addColorStop(i / (gs.length - 1), c));
  dctx.fillStyle = g;
  dctx.beginPath();
  dctx.arc(C[0], C[1], R, 0, Math.PI * 2);
  dctx.fill();

  // 上部柔光：原片金色是“金属面”，不是纯色块。
  const hl = dctx.createRadialGradient(C[0] - R * 0.32, C[1] - R * 0.42, R * 0.05, C[0] - R * 0.32, C[1] - R * 0.42, R * 1.2);
  hl.addColorStop(0, 'rgba(255,248,222,0.24)');
  hl.addColorStop(0.55, 'rgba(255,244,210,0.07)');
  hl.addColorStop(1, 'rgba(255,240,200,0)');
  dctx.fillStyle = hl;
  dctx.beginPath();
  dctx.arc(C[0], C[1], R, 0, Math.PI * 2);
  dctx.fill();

  dctx.globalCompositeOperation = 'destination-out';
  dctx.fillStyle = '#000';
  dctx.fill(archPath2D);

  // 由“线落点”向外扩张的揭示：线转面的动因看得见。
  dctx.globalCompositeOperation = 'destination-in';
  const rr = R * 0.28 + R * 2.6 * amt;
  const reveal = dctx.createRadialGradient(A[0], A[1], 0, A[0], A[1], rr);
  reveal.addColorStop(0, 'rgba(0,0,0,1)');
  reveal.addColorStop(0.72, 'rgba(0,0,0,1)');
  reveal.addColorStop(1, 'rgba(0,0,0,0)');
  dctx.fillStyle = reveal;
  dctx.fillRect(C[0] - R * 2, C[1] - R * 2, R * 4, R * 4);
  dctx.globalCompositeOperation = 'source-over';

  // 圆面外的一层柔光，让标志从背景里“亮”起来（克制：原片几乎没有大光晕）。
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

function strokeArch(u, cam) {
  if (u <= 0) return;
  const s = clamp(u) * arch.len;
  ctx.beginPath();
  ctx.moveTo(archPts[0][0], archPts[0][1]);
  for (let i = 1; i < archPts.length && archPts[i][2] <= s; i++) ctx.lineTo(archPts[i][0], archPts[i][1]);
  const head = archAt(u);
  ctx.lineTo(head[0], head[1]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = cues.look.lineCore;
  ctx.lineWidth = cues.look.glowWidth / cam.z;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.lineWidth = cues.look.lineWidth / cam.z;
  ctx.globalAlpha = 0.96;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- 笔尖与光脉冲
function penTip(t) {
  const a0 = cues.logo.archStart, a1 = cues.logo.archEnd;
  if (t >= a0 && t <= a1) {
    const u = ease((t - a0) / (a1 - a0));
    return { p: archAt(u), live: true };
  }
  if (t < a0) return { p: pointAt(distance(t)), live: true };
  return { p: pointAt(total), live: false };
}

function drawPen(t, cam) {
  const { p, live } = penTip(t);
  if (!live) return;
  const fade = 1 - ease((t - cues.pen.until) / cues.pen.fade);
  if (fade <= 0) return;
  const [x, y] = toScreen(cam, p[0], p[1]);
  const bloom = cues.pen.bloom;
  const g = ctx.createRadialGradient(x, y, 0, x, y, bloom);
  g.addColorStop(0, `rgba(255,250,226,${0.85 * fade})`);
  g.addColorStop(0.12, `rgba(255,240,196,${0.42 * fade})`);
  g.addColorStop(0.45, `rgba(236,205,140,${0.13 * fade})`);
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
  if (t < p.start || t > p.end) return;
  const u = (t - p.start) / (p.end - p.start);
  const s = total * mix(p.from, p.to, ease(u));
  const [wx, wy] = pointAt(s);
  const [x, y] = toScreen(cam, wx, wy);
  const fade = (1 - ease(u)) * p.alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, p.glow);
  g.addColorStop(0, `rgba(255,246,214,${0.9 * fade})`);
  g.addColorStop(0.25, `rgba(240,214,150,${0.35 * fade})`);
  g.addColorStop(1, 'rgba(240,214,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - p.glow, y - p.glow, p.glow * 2, p.glow * 2);
  ctx.beginPath();
  ctx.arc(x, y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
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

function drawType(t) {
  const wm = cues.type.wordmark, tl = cues.type.tagline;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const a1 = ease((t - wm.start) / wm.fade);
  if (a1 > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(232,208,150,0.45)';
    ctx.shadowBlur = 12 * a1;
    spaced(wm.text, W / 2, wm.baseline, wm.size, wm.track, wm.weight, 'Cormorant', wm.color, a1);
    ctx.restore();
  }
  const a2 = ease((t - tl.start) / tl.fade);
  if (a2 > 0) {
    const width = spaced(tl.text, W / 2, tl.baseline, tl.size, tl.track, tl.weight, 'NotoSerifSC', tl.color, a2 * 0.92);
    // 两侧短线与光点：原片用它们把副标“钉”在画面里。
    const y = tl.baseline - tl.size * 0.36;
    const x0 = W / 2 - width / 2 - tl.ruleGap;
    const x1 = W / 2 + width / 2 + tl.ruleGap;
    ctx.strokeStyle = tl.color;
    ctx.globalAlpha = a2 * 0.5;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0 - tl.ruleLen, y); ctx.lineTo(x0, y);
    ctx.moveTo(x1, y); ctx.lineTo(x1 + tl.ruleLen, y);
    ctx.stroke();
    for (const dx of [x0 - tl.ruleLen, x1 + tl.ruleLen]) {
      const g = ctx.createRadialGradient(dx, y, 0, dx, y, 13);
      g.addColorStop(0, `rgba(255,247,214,${0.9 * a2})`);
      g.addColorStop(0.3, `rgba(240,220,170,${0.3 * a2})`);
      g.addColorStop(1, 'rgba(240,220,170,0)');
      ctx.fillStyle = g;
      ctx.fillRect(dx - 13, y - 13, 26, 26);
      ctx.fillStyle = '#fffaea';
      ctx.globalAlpha = a2;
      ctx.beginPath();
      ctx.arc(dx, y, tl.dot, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- 主渲染
function render(t) {
  const cam = camera(t);
  if (DBG === 'cam') {
    const pen = penPos(t), sp = softPen(t);
    console.error(`cam t=${t.toFixed(2)} x=${cam.x.toFixed(1)} y=${cam.y.toFixed(1)} z=${cam.z.toFixed(3)} pen=${pen[0].toFixed(0)},${pen[1].toFixed(0)} soft=${sp[0].toFixed(0)},${sp[1].toFixed(0)} drawn=${distance(t).toFixed(0)}/${total.toFixed(0)}`);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // 诊断开关：只看金色圆面本身（?dbg=disc），用于排查门洞与揭示遮罩。
  if (DBG === 'disc') {
    ctx.fillStyle = '#2c4a6e';
    ctx.fillRect(0, 0, W, H);
    drawDisc(t, { x: C[0], y: C[1], z: 1 });
    return;
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
  const archU = (t - cues.logo.archStart) / (cues.logo.archEnd - cues.logo.archStart);
  if (archU > 0) strokeArch(ease(archU), cam);
  ctx.restore();

  if (DBG !== 'nodisc') drawDisc(t, cam);
  drawPen(t, cam);
  drawPulse(t, cam);

  if (DBG !== 'nograin') {
    ctx.globalCompositeOperation = cues.look.grainMode;
    ctx.globalAlpha = cues.look.grainAlpha;
    ctx.drawImage(grain, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  drawType(t);
}

window.DEMO = {
  width: W, height: H, fps: cues.fps, duration: cues.duration,
  motionBlur: { samples: cues.blur.samples, shutter: cues.blur.shutter },
};
window.renderAt = (t) => { render(t); };
window.__info = {
  totalLength: total,
  pieces: pieces.map((p) => ({ name: p.name, length: +p.len.toFixed(1), start: p.start, end: p.end })),
  archLength: arch.len,
};
render(0);
window.__ready = true;
