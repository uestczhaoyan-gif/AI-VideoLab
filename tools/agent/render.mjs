#!/usr/bin/env node
/**
 * Render an Agent-authored scene.html. This is not a template engine: the
 * Agent writes the code, this tool only captures frames, encodes, and records
 * mechanical QA.
 *
 *   npm run render:agent -- --project projects/<dir> --stage stills
 *   npm run render:agent -- --project projects/<dir> --stage render
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  contactSheet, encodeVideo, findFfmpeg, launchBrowser, measureLoudness, probeVideo,
  renderFrames, serveHtml, sha256, writeClickTrack,
} from '../render/local-render.mjs';

const { values } = parseArgs({ options: {
  project: { type: 'string' }, stage: { type: 'string' }, out: { type: 'string' }, help: { type: 'boolean', default: false },
} });
if (values.help) {
  console.log(`用法：npm run render:agent -- --project projects/<dir> --stage stills|render
项目需要：scene.html（window.render(t)）与 video.json（duration/fps/width/height）。
只做逐帧抓取、编码与机械 QA；不写视频代码，不调用模型。`);
  process.exit(0);
}
const projectDir = path.resolve(values.project ?? '');
const stage = values.stage ?? 'stills';
if (!projectDir || !fs.existsSync(projectDir)) throw new Error('需要 --project <目录>');
const scene = path.join(projectDir, 'scene.html');
const videoFile = path.join(projectDir, 'video.json');
if (!fs.existsSync(scene)) throw new Error(`Agent 还没有写 scene.html：${scene}`);
if (!fs.existsSync(videoFile)) throw new Error(`缺少 video.json：${videoFile}`);
const video = JSON.parse(fs.readFileSync(videoFile, 'utf8'));
const { duration, fps } = video;
const width = Number(video.width ?? 1280), height = Number(video.height ?? 720);
if (!(duration >= 1 && duration <= 600) || !(fps >= 1 && fps <= 120)) throw new Error('video.json 的 duration/fps 无效');
const outDir = path.resolve(values.out ?? projectDir);
const framesDir = path.join(outDir, 'frames');
const stillsDir = path.join(outDir, 'stills');
const reportFile = path.join(outDir, 'report.json');
const qaFile = path.join(outDir, 'qa.json');
const ffmpeg = findFfmpeg();
const browser = await launchBrowser();
const server = await serveHtml(scene);
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
try {
  await page.goto(server.url, { waitUntil: 'load' });
  await page.waitForFunction('typeof window.render === "function"', null, { timeout: 15000 });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
  if (stage === 'stills') {
    fs.rmSync(stillsDir, { recursive: true, force: true });
    fs.mkdirSync(stillsDir, { recursive: true });
    const times = [duration * 0.15, duration * 0.5, duration * 0.85].map((t) => Number(t.toFixed(2)));
    const files = [];
    for (const [i, t] of times.entries()) {
      await page.evaluate((time) => window.render(time), t);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      const file = path.join(stillsDir, `still-${i + 1}.png`);
      await page.screenshot({ path: file });
      files.push({ t, file: path.relative(process.cwd(), file).replaceAll('\\', '/'), sha256: sha256(file) });
    }
    const sheet = path.join(outDir, 'style-frames.jpg');
    // Use ffmpeg's image sequence tile; names are still-1..3.
    try {
      const { runFfmpeg } = await import('../render/local-render.mjs');
      runFfmpeg(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-start_number', '1', '-framerate', '1', '-i', path.join(stillsDir, 'still-%d.png'), '-vf', 'scale=426:-1,tile=3x1', '-frames:v', '1', sheet], path.join(outDir, 'stills.log'));
    } catch (error) {
      console.warn(`[render:agent] 联系表生成失败：${error.message}`);
    }
    const report = { stage, mode: 'agent_led', project: path.relative(process.cwd(), projectDir).replaceAll('\\', '/'), title: video.title ?? '', duration, fps, width, height, stills: files, sheet: fs.existsSync(sheet) ? path.relative(process.cwd(), sheet).replaceAll('\\', '/') : null, note: '风格帧只是抽看；确认后再 --stage render。' };
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } else if (stage === 'render') {
    if (!fs.existsSync(path.join(outDir, 'style-frames.jpg'))) throw new Error('先运行 --stage stills 并让用户看风格帧，再 render。');
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.mkdirSync(framesDir, { recursive: true });
    const frameInfo = await renderFrames({ page, outDir: framesDir, duration, fps, width, height, sampleFrames: [30, Math.floor((duration * fps) / 2), Math.max(0, Math.round(duration * fps) - 2)], logFile: path.join(outDir, 'frames.log') });
    const audioFile = path.join(outDir, 'click-track.wav');
    writeClickTrack(audioFile, duration, [0]);
    const mp4 = path.join(outDir, 'code-motion.mp4');
    encodeVideo({ ffmpeg, framesDir, audioFile, fps, video: mp4, logFile: path.join(outDir, 'encode.log') });
    const probe = probeVideo(ffmpeg, mp4, path.join(outDir, 'probe.log'));
    const loudness = measureLoudness(ffmpeg, mp4, path.join(outDir, 'loudness.log'));
    const storyboard = path.join(outDir, 'storyboard.jpg');
    contactSheet(ffmpeg, mp4, storyboard, path.join(outDir, 'contact.log'));
    const qa = [
      { id: 'qa-spec', status: probe.width === width && probe.height === height && probe.fps === fps ? 'passed' : 'failed', detail: probe },
      { id: 'qa-determinism', status: frameInfo.determinism.every((d) => d.pass) ? 'passed' : 'failed', detail: frameInfo.determinism },
      { id: 'qa-content', status: 'not_checked', detail: '画面内容/事实未由平台核验' },
      { id: 'qa-audio', status: 'not_checked', detail: `点击音轨；响度 ${JSON.stringify(loudness)}` },
      { id: 'qa-viewing', status: 'not_checked', detail: '需完整观看' },
      { id: 'qa-accept', status: 'not_checked', detail: '需用户确认采用' },
    ];
    fs.writeFileSync(qaFile, JSON.stringify({ qa, loudness }, null, 2) + '\n');
    const report = { stage, mode: 'agent_led', title: video.title ?? '', video: path.relative(process.cwd(), mp4).replaceAll('\\', '/'), storyboard: path.relative(process.cwd(), storyboard).replaceAll('\\', '/'), project: path.relative(process.cwd(), projectDir).replaceAll('\\', '/'), format: { ...probe, frames: frameInfo.total, unique_frames: frameInfo.unique, audio: true }, determinism: frameInfo.determinism, qa };
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } else {
    throw new Error('--stage 只能是 stills 或 render');
  }
} finally {
  await page.close();
  await server.close();
  await browser.close();
}
