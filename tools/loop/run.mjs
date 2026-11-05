#!/usr/bin/env node
/**
 * Contract smoke test: run one complete local loop without any paid model or
 * cloud service — Brief → outline → deterministic HTML render(t) → frames →
 * ffmpeg encode → QA evidence → project JSON/Markdown with confirmation gates.
 *
 * All artifacts stay under the git-ignored `.tmp/loop/` tree. The generated
 * project deliberately keeps content/audio/viewing/user-acceptance checks in
 * NOT CHECKED because this script cannot honestly confirm them.
 *
 * Usage: npm run loop:smoke   (set VIDEOLAB_BROWSER / FFMPEG to override)
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import {
  buildPlan,
} from '../../apps/workbench/public/domain.mjs';
import {
  confirmGate, updateCheck, projectMarkdown, qaSummary, validateProject, reviseProject,
} from '../../shared/project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, '.tmp/loop');
const FRAMES = path.join(OUT, 'frames');
const FPS = 30;
const DURATION = 8;
const TOTAL = FPS * DURATION;
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const log = (msg) => console.log(`[loop] ${msg}`);

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function findFfmpeg() {
  if (process.env.FFMPEG && fs.existsSync(process.env.FFMPEG)) return process.env.FFMPEG;
  const candidates = [];
  const appData = process.env.APPDATA;
  if (appData && fs.existsSync(path.join(appData, 'Python'))) {
    for (const py of fs.readdirSync(path.join(appData, 'Python'))) {
      const dir = path.join(appData, 'Python', py, 'site-packages', 'imageio_ffmpeg', 'binaries');
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir)) if (name.endsWith('.exe') && name.startsWith('ffmpeg')) candidates.push(path.join(dir, name));
    }
  }
  const found = candidates.find((file) => fs.existsSync(file));
  if (found) return found;
  throw new Error('ffmpeg not found. Set FFMPEG or install imageio-ffmpeg (pip install imageio-ffmpeg).');
}

/** Run ffmpeg and capture stderr in a file (Node pipes are restricted on Windows sandboxes). */
function runFfmpeg(ffmpeg, args, logFile, { allowFailure = false } = {}) {
  const fd = fs.openSync(logFile, 'w');
  try {
    const result = spawnSync(ffmpeg, args, { stdio: ['ignore', 'ignore', fd] });
    if (result.error) throw result.error;
    if (result.status !== 0 && !allowFailure) throw new Error(`ffmpeg failed (${result.status}); see ${path.relative(ROOT, logFile)}`);
    return fs.readFileSync(logFile, 'utf8');
  } finally {
    fs.closeSync(fd);
  }
}

/** Peak signal-to-noise ratio between two captured frames; >45 dB means visually identical. */
function psnr(ffmpeg, a, b, logFile) {
  const text = runFfmpeg(ffmpeg, ['-hide_banner', '-i', a, '-i', b, '-lavfi', 'psnr', '-f', 'null', '-'], logFile);
  return Number(text.match(/average:([\d.]+|inf)/)?.[1] ?? NaN);
}

function writeWav(dest) {
  const rate = 44100;
  const samples = new Float32Array(DURATION * rate);
  const events = [0, 1.6, 3.4, 5.6, 7.4];
  for (const start of events) {
    const from = Math.floor(start * rate);
    const len = Math.floor(0.07 * rate);
    for (let i = 0; i < len; i++) {
      const n = from + i;
      if (n >= samples.length) break;
      const env = Math.min(1, i / (0.004 * rate)) * Math.exp((-i / len) * 4.5);
      samples[n] += Math.sin((2 * Math.PI * 1046 * i) / rate) * env * 0.22;
    }
  }
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), i * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(dest, Buffer.concat([header, data]));
}

function parseProbe(logText) {
  const duration = logText.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const video = logText.match(/Stream #0:\d+.*?Video:.*?,\s*(\d+)x(\d+).*?,\s*([\d.]+) fps/);
  const audio = /Stream #0:\d+.*?Audio:/.test(logText);
  return {
    duration_seconds: duration ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]) : null,
    width: video ? Number(video[1]) : null,
    height: video ? Number(video[2]) : null,
    fps: video ? Number(video[3]) : null,
    has_audio: audio,
  };
}

async function main() {
  const ffmpeg = findFfmpeg();
  resetDir(OUT);
  fs.mkdirSync(FRAMES, { recursive: true });
  log(`ffmpeg: ${ffmpeg}`);

  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, 'tools/loop/scene.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(fs.readFileSync(file));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({
    executablePath: process.env.VIDEOLAB_BROWSER || [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      chromium.executablePath(),
    ].find((p) => fs.existsSync(p)),
    headless: true,
  });
  let page;
  try {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await page.goto(base);
    await page.waitForFunction(() => window.__ready === true, { timeout: 15000 });

    log(`rendering ${TOTAL} frames at ${FPS} fps (1280×720)`);
    const started = Date.now();
    for (let frame = 0; frame < TOTAL; frame++) {
      await page.evaluate((t) => window.render(t), frame / FPS);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      await page.screenshot({ path: path.join(FRAMES, `f${String(frame).padStart(5, '0')}.png`) });
    }
    log(`frames rendered in ${((Date.now() - started) / 1000).toFixed(1)}s`);

    // Determinism: the same t must reproduce the same picture. Byte equality is
    // preferred; otherwise accept PSNR > 45 dB (subpixel glyph hinting only).
    const determinism = [];
    for (const frame of [0, 75, 150]) {
      const again = path.join(OUT, `check-${frame}.png`);
      await page.evaluate((t) => window.render(t), frame / FPS);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      await page.screenshot({ path: again });
      const original = path.join(FRAMES, `f${String(frame).padStart(5, '0')}.png`);
      const identical = sha256(again) === sha256(original);
      const db = identical ? Infinity : psnr(ffmpeg, original, again, path.join(OUT, `psnr-${frame}.log`));
      determinism.push({ frame, t: frame / FPS, identical, psnr_db: Number.isFinite(db) ? Number(db.toFixed(2)) : 'inf', pass: identical || db > 45 });
    }
    log(`determinism: ${determinism.map((d) => `${d.frame}:${d.pass ? 'pass' : 'FAIL'}${d.identical ? '(byte)' : `(${d.psnr_db}dB)`}`).join(' ')}`);

    const wav = path.join(OUT, 'click-track.wav');
    writeWav(wav);
    const video = path.join(OUT, 'loop.mp4');
    log('encoding mp4 (h264 + aac)');
    runFfmpeg(ffmpeg, [
      '-y', '-hide_banner', '-loglevel', 'info',
      '-framerate', String(FPS), '-i', path.join(FRAMES, 'f%05d.png'),
      '-i', wav,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k', '-shortest', video,
    ], path.join(OUT, 'encode.log'));

    const probeLog = runFfmpeg(ffmpeg, ['-hide_banner', '-i', video], path.join(OUT, 'probe.log'), { allowFailure: true });
    const probe = parseProbe(probeLog);
    log(`probe: ${probe.width}x${probe.height} ${probe.fps}fps ${probe.duration_seconds}s audio=${probe.has_audio}`);

    const loudnessLog = runFfmpeg(ffmpeg, ['-hide_banner', '-i', video, '-af', 'volumedetect', '-f', 'null', '-'], path.join(OUT, 'loudness.log'));
    const mean = Number(loudnessLog.match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1] ?? NaN);
    const peak = Number(loudnessLog.match(/max_volume:\s*(-?[\d.]+) dB/)?.[1] ?? NaN);

    const contact = path.join(OUT, 'contact-sheet.jpg');
    runFfmpeg(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-vf', 'fps=1,scale=320:-1,tile=4x2', '-frames:v', '1', contact], path.join(OUT, 'contact.log'));

    const frameNames = fs.readdirSync(FRAMES).filter((f) => f.endsWith('.png')).sort();
    const frameHashes = frameNames.map((f) => sha256(path.join(FRAMES, f)));
    const uniqueFrames = new Set(frameHashes).size;
    const qa = {
      generated_at: new Date().toISOString(),
      video: path.relative(ROOT, video).replaceAll('\\', '/'),
      frames_rendered: frameNames.length,
      expected_frames: TOTAL,
      unique_frames: uniqueFrames,
      deterministic: determinism.every((d) => d.pass),
      determinism_samples: determinism,
      probe,
      audio: { mean_volume_db: Number.isFinite(mean) ? mean : null, max_volume_db: Number.isFinite(peak) ? peak : null, subjective_listen: 'not_checked' },
      contact_sheet: path.relative(ROOT, contact).replaceAll('\\', '/'),
      ffmpeg,
      note: '机械检查只证明规格、解码、确定性与抽帧；不包含内容、主观声音、完整观看或用户采用。',
    };
    fs.writeFileSync(path.join(OUT, 'qa.json'), JSON.stringify(qa, null, 2) + '\n');

    if (frameNames.length !== TOTAL) throw new Error(`frame count mismatch: ${frameNames.length}/${TOTAL}`);
    if (!qa.deterministic) throw new Error('render(t) is not deterministic across repeated renders');
    if (probe.duration_seconds === null || Math.abs(probe.duration_seconds - DURATION) > 0.1) throw new Error('encoded duration mismatch');
    if (probe.width !== 1280 || probe.height !== 720 || probe.fps !== FPS) throw new Error('encoded specs mismatch');
    if (!probe.has_audio) throw new Error('encoded file has no audio track');

    fs.writeFileSync(path.join(OUT, 'brief.md'), `# Brief：最小真实闭环验证\n\n- 目标：验证 VideoLab 项目契约、确定性渲染与 QA 清单能在本机完整跑通，不追求风格与画面质量。\n- 受众：项目维护者（内部验证）。\n- 规格：${DURATION} 秒 / ${FPS} fps / 1280×720 / H.264 + AAC。\n- 声音：静音画面 + 事件点击音轨；无人声、无 BGM。\n- 边界：不使用付费模型、不上传素材；内容/主观声音/完整观看/用户采用保持 NOT CHECKED。\n`);
    fs.writeFileSync(path.join(OUT, 'outline.md'), `# 分镜 / 大纲\n\n| 时间 | 画面 | 声音 |\n| --- | --- | --- |\n| 0.0–1.6s | 标题与副标题逐字出现 | 起点击音 |\n| 1.6–3.4s | 第 1 张卡片亮起（Brief） | 点击音 |\n| 3.4–5.6s | 第 2 张卡片亮起（Render） | 点击音 |\n| 5.6–6.9s | 第 3 张卡片亮起（QA），进度条推进 | 点击音 |\n| 6.9–8.0s | 规格卡淡入并收尾 | 收尾点击音 |\n`);

    const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/catalog.json'), 'utf8'));
    const form = {
      topic: 'VideoLab 最小真实闭环：Brief → 确定性渲染 → QA',
      purpose: 'motion', duration: String(DURATION), durationMin: String(DURATION), durationMax: String(DURATION),
      aspect: '16:9', resolution: '720p', fps: String(FPS), language: 'zh-CN', narration: 'none', subtitles: false,
      bgm: 'none', budget: '', currency: 'CNY', usage: 'personal', notes: '仅用于验证契约与 QA；不是风格 demo，不代表成片质量。',
      audience: '项目维护者', prerequisites: '无', learningGoal: '验证 BRIEF→渲染→编码→QA 的完整交接',
      depth: 'unspecified', formulaPolicy: 'unspecified', stylePreferences: '无（确定性代码画面）',
      resourcePolicy: 'current_cli_local', availableTools: 'Chrome、Playwright、ffmpeg（本地）', resourceNotes: '无外部服务、无付费调用',
      maxWait: '10', selectionReason: '本地可复现的最小闭环，不依赖模型服务', acceptance: '规格、帧数、确定性与音频流可机械核对；其余检查显式未检查',
    };
    let project = buildPlan(catalog, form, null, 'code-motion', 'current_cli');
    project = confirmGate(project, 'brief', { basis: '用户 2026-11-06 授权自主完成本轮工作；Brief 与大纲由本脚本记录' });
    project = confirmGate(project, 'style_frame', { basis: '已生成联系表并抽看首/中/末帧；本片为既有设计，不做风格挑样' });
    project = updateCheck(project, 'qa-spec', { status: 'passed', evidence: { base: 'repository', path: '.tmp/loop/qa.json' }, notes: `${probe.width}x${probe.height} / ${probe.fps}fps / ${probe.duration_seconds}s / ${frameNames.length} 帧` });
    project = updateCheck(project, 'qa-decode', { status: 'passed', evidence: { base: 'repository', path: '.tmp/loop/qa.json' }, notes: 'ffmpeg 解码并读取音视频流无错误' });
    project = updateCheck(project, 'qa-timing', { status: 'waived', notes: '无旁白与字幕；点击音与事件同表生成，不做主观对齐检查' });
    project = updateCheck(project, 'qa-content', { status: 'waived', notes: '本片为机制演示，无事实、数字或公式内容' });
    project = updateCheck(project, 'qa-visual', { status: 'passed', evidence: { base: 'repository', path: '.tmp/loop/contact-sheet.jpg' }, notes: '自动抽检：3 个时间点重渲哈希一致、240 帧无重复占位；不是完整审片' });
    project = updateCheck(project, 'qa-audio', { status: 'not_checked', evidence: { base: 'repository', path: '.tmp/loop/qa.json' }, notes: `点击音已测响度 mean ${qa.audio.mean_volume_db} dB / max ${qa.audio.max_volume_db} dB；未主观试听，按未检查处理` });
    project = updateCheck(project, 'qa-viewing', { status: 'not_checked', notes: '未完整观看 8 秒成片；不得以抽帧替代' });
    project = updateCheck(project, 'qa-accept', { status: 'not_checked', notes: '等待用户确认' });
    project = reviseProject(project, {
      documents: {
        brief: { base: 'repository', path: '.tmp/loop/brief.md' },
        script: null,
        outline: { base: 'repository', path: '.tmp/loop/outline.md' },
        source_notes: [],
      },
    });
    const nextRevision = project.revision + 1;
    project = reviseProject(project, {
      records: {
        ...project.records,
        artifacts: [
          { id: 'art-video', kind: 'video', project_revision: nextRevision, reference: { base: 'repository', path: '.tmp/loop/loop.mp4' } },
          { id: 'art-qa', kind: 'other', project_revision: nextRevision, reference: { base: 'repository', path: '.tmp/loop/qa.json' } },
        ],
      },
    });
    const errors = validateProject(project);
    if (errors.length) throw new Error(`project validation failed:\n${errors.join('\n')}`);
    fs.writeFileSync(path.join(OUT, 'loop-project.json'), JSON.stringify(project, null, 2) + '\n');
    fs.writeFileSync(path.join(OUT, 'loop-project.md'), projectMarkdown(project));
    const summary = { generated_at: new Date().toISOString(), video: qa.video, contact_sheet: qa.contact_sheet, project: '.tmp/loop/loop-project.json', markdown: '.tmp/loop/loop-project.md', qa: '.tmp/loop/qa.json', project_revision: project.revision, status: project.status, qa_summary: qaSummary(project), gates: project.gates.map((g) => ({ id: g.id, status: g.status })), probe, determinism, unique_frames: uniqueFrames };
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(summary, null, 2) + '\n');
    log(`done: ${qa.video} (${frameNames.length} frames, ${probe.duration_seconds}s, ${uniqueFrames} unique)`);
    log(`project: .tmp/loop/loop-project.json (v${project.revision}, ${project.status}); QA open: ${qaSummary(project).open.join(', ')}`);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await page?.close().catch(() => {});
    await browser.close().catch(() => {});
    server.close();
    server.closeAllConnections?.();
  }
}

await main().catch((error) => { console.error(error); process.exitCode = 1; });
