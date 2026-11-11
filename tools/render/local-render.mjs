/**
 * Shared local rendering helpers for the minimal loop and recipe executors.
 *
 * Kept intentionally small: launch an installed Chrome/Edge, render a page's
 * `window.render(t)` frame by frame, encode with ffmpeg, and collect mechanical
 * QA evidence. No model calls, no uploads, no browser download.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from '@playwright/test';

export const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

export function findFfmpeg() {
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
export function runFfmpeg(ffmpeg, args, logFile, { allowFailure = false } = {}) {
  const fd = fs.openSync(logFile, 'w');
  try {
    const result = spawnSync(ffmpeg, args, { stdio: ['ignore', 'ignore', fd] });
    if (result.error) throw result.error;
    if (result.status !== 0 && !allowFailure) throw new Error(`ffmpeg failed (${result.status}); see ${logFile}`);
    return fs.readFileSync(logFile, 'utf8');
  } finally {
    fs.closeSync(fd);
  }
}

/** Peak signal-to-noise ratio between two captured frames; >45 dB means visually identical. */
export function psnr(ffmpeg, a, b, logFile) {
  const text = runFfmpeg(ffmpeg, ['-hide_banner', '-i', a, '-i', b, '-lavfi', 'psnr', '-f', 'null', '-'], logFile);
  return Number(text.match(/average:([\d.]+|inf)/)?.[1] ?? NaN);
}

export function browserExecutable() {
  const candidates = [
    process.env.VIDEOLAB_BROWSER,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    chromium.executablePath(),
  ].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error('No installed Chromium browser found. Set VIDEOLAB_BROWSER; no browser is downloaded automatically.');
  return found;
}

export async function launchBrowser() {
  return chromium.launch({ executablePath: browserExecutable(), headless: true });
}

/** Serve one HTML file on localhost so module scripts and fetch behave like a real page. */
export async function serveHtml(htmlPath) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(fs.readFileSync(htmlPath));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const close = () => new Promise((resolve) => { server.close(resolve); server.closeAllConnections?.(); });
  return { url: `http://127.0.0.1:${server.address().port}/`, close };
}

/** Render `window.render(t)` into numbered PNG frames and check determinism by re-rendering samples. */
export async function renderFrames({ page, outDir, duration, fps, width, height, sampleFrames = [0, 75, 150], logFile }) {
  fs.mkdirSync(outDir, { recursive: true });
  const total = Math.round(duration * fps);
  const started = Date.now();
  for (let frame = 0; frame < total; frame++) {
    await page.evaluate((t) => window.render(t), frame / fps);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
    await page.screenshot({ path: path.join(outDir, `f${String(frame).padStart(5, '0')}.png`) });
  }
  const names = fs.readdirSync(outDir).filter((f) => f.endsWith('.png')).sort();
  const hashes = names.map((f) => sha256(path.join(outDir, f)));
  const determinism = [];
  for (const frame of sampleFrames.filter((f) => f < total)) {
    const again = path.join(outDir, `..`, `determinism-${frame}.png`);
    await page.evaluate((t) => window.render(t), frame / fps);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
    await page.screenshot({ path: again });
    const original = path.join(outDir, `f${String(frame).padStart(5, '0')}.png`);
    const identical = sha256(again) === sha256(original);
    const db = identical ? Infinity : psnr(findFfmpeg(), original, again, `${logFile}.psnr-${frame}.log`);
    determinism.push({ frame, t: frame / fps, identical, psnr_db: Number.isFinite(db) ? Number(db.toFixed(2)) : 'inf', pass: identical || db > 45 });
  }
  return { total, rendered: names.length, unique: new Set(hashes).size, elapsed_s: Number(((Date.now() - started) / 1000).toFixed(1)), determinism };
}

/** Simple deterministic click track from the same event list as the picture. */
export function writeClickTrack(dest, duration, events = [0], rate = 44100) {
  const samples = new Float32Array(Math.ceil(duration * rate));
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
  return { file: dest, duration, events };
}

export function encodeVideo({ ffmpeg, framesDir, audioFile, fps, video, logFile }) {
  const args = ['-y', '-hide_banner', '-loglevel', 'info', '-framerate', String(fps), '-i', path.join(framesDir, 'f%05d.png')];
  if (audioFile) args.push('-i', audioFile);
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p');
  if (audioFile) args.push('-c:a', 'aac', '-b:a', '128k', '-shortest');
  args.push(video);
  runFfmpeg(ffmpeg, args, logFile);
  return video;
}

export function probeVideo(ffmpeg, video, logFile) {
  const text = runFfmpeg(ffmpeg, ['-hide_banner', '-i', video], logFile, { allowFailure: true });
  const duration = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const stream = text.match(/Stream #0:\d+.*?Video:.*?,\s*(\d+)x(\d+).*?,\s*([\d.]+) fps/);
  return {
    duration_seconds: duration ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]) : null,
    width: stream ? Number(stream[1]) : null,
    height: stream ? Number(stream[2]) : null,
    fps: stream ? Number(stream[3]) : null,
    has_audio: /Stream #0:\d+.*?Audio:/.test(text),
  };
}

export function measureLoudness(ffmpeg, video, logFile) {
  const text = runFfmpeg(ffmpeg, ['-hide_banner', '-i', video, '-af', 'volumedetect', '-f', 'null', '-'], logFile);
  return {
    mean_volume_db: Number(text.match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1] ?? NaN),
    max_volume_db: Number(text.match(/max_volume:\s*(-?[\d.]+) dB/)?.[1] ?? NaN),
  };
}

export function contactSheet(ffmpeg, video, dest, logFile, { cols = 4, rows = 2 } = {}) {
  runFfmpeg(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-vf', `fps=1,scale=320:-1,tile=${cols}x${rows}`, '-frames:v', '1', dest], logFile);
  return dest;
}
