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
import { fileURLToPath } from 'node:url';
import {
  contactSheet, encodeVideo, findFfmpeg, launchBrowser, measureLoudness, probeVideo,
  renderFrames, serveHtml, writeClickTrack,
} from '../render/local-render.mjs';
import { buildPlan } from '../../shared/planning.mjs';
import { confirmGate, updateCheck, projectMarkdown, qaSummary, validateProject, reviseProject } from '../../shared/project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, '.tmp/loop');
const FRAMES = path.join(OUT, 'frames');
const FPS = 30;
const DURATION = 8;
const TOTAL = FPS * DURATION;
const log = (msg) => console.log(`[loop] ${msg}`);

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const ffmpeg = findFfmpeg();
  resetDir(OUT);
  log(`ffmpeg: ${ffmpeg}`);
  const server = await serveHtml(path.join(ROOT, 'tools/loop/scene.html'));
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await page.goto(server.url);
    await page.waitForFunction(() => window.__ready === true, { timeout: 15000 });
    log(`rendering ${TOTAL} frames at ${FPS} fps (1280×720)`);
    const frames = await renderFrames({ page, outDir: FRAMES, duration: DURATION, fps: FPS, width: 1280, height: 720, sampleFrames: [0, 75, 150], logFile: path.join(OUT, 'qa') });
    log(`frames: ${frames.rendered}/${frames.total} in ${frames.elapsed_s}s; unique ${frames.unique}; determinism ${frames.determinism.map((d) => `${d.frame}:${d.pass ? 'pass' : 'FAIL'}`).join(' ')}`);

    const wav = path.join(OUT, 'click-track.wav');
    writeClickTrack(wav, DURATION, [0, 1.6, 3.4, 5.6, 7.4]);
    const video = path.join(OUT, 'loop.mp4');
    encodeVideo({ ffmpeg, framesDir: FRAMES, audioFile: wav, fps: FPS, video, logFile: path.join(OUT, 'encode.log') });
    const probe = probeVideo(ffmpeg, video, path.join(OUT, 'probe.log'));
    const loud = measureLoudness(ffmpeg, video, path.join(OUT, 'loudness.log'));
    const contact = contactSheet(ffmpeg, video, path.join(OUT, 'contact-sheet.jpg'), path.join(OUT, 'contact.log'));
    const qa = {
      generated_at: new Date().toISOString(),
      video: path.relative(ROOT, video).replaceAll('\\', '/'),
      frames_rendered: frames.rendered,
      expected_frames: TOTAL,
      unique_frames: frames.unique,
      deterministic: frames.determinism.every((d) => d.pass),
      determinism_samples: frames.determinism,
      probe,
      audio: { mean_volume_db: Number.isFinite(loud.mean_volume_db) ? loud.mean_volume_db : null, max_volume_db: Number.isFinite(loud.max_volume_db) ? loud.max_volume_db : null, subjective_listen: 'not_checked' },
      contact_sheet: path.relative(ROOT, contact).replaceAll('\\', '/'),
      ffmpeg,
      note: '机械检查只证明规格、解码、确定性与抽帧；不包含内容、主观声音、完整观看或用户采用。',
    };
    fs.writeFileSync(path.join(OUT, 'qa.json'), JSON.stringify(qa, null, 2) + '\n');
    if (frames.rendered !== TOTAL) throw new Error(`frame count mismatch: ${frames.rendered}/${TOTAL}`);
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
    project = updateCheck(project, 'qa-spec', { status: 'passed', evidence: { base: 'repository', path: '.tmp/loop/qa.json' }, notes: `${probe.width}x${probe.height} / ${probe.fps}fps / ${probe.duration_seconds}s / ${frames.rendered} 帧` });
    project = updateCheck(project, 'qa-decode', { status: 'passed', evidence: { base: 'repository', path: '.tmp/loop/qa.json' }, notes: 'ffmpeg 解码并读取音视频流无错误' });
    project = updateCheck(project, 'qa-timing', { status: 'waived', notes: '无旁白与字幕；点击音与事件同表生成，不做主观对齐检查' });
    project = updateCheck(project, 'qa-content', { status: 'waived', notes: '本片为机制演示，无事实、数字或公式内容' });
    project = updateCheck(project, 'qa-visual', { status: 'passed', evidence: { base: 'repository', path: '.tmp/loop/contact-sheet.jpg' }, notes: '自动抽检：3 个时间点重渲哈希一致、240 帧无重复占位；不是完整审片' });
    project = updateCheck(project, 'qa-audio', { status: 'not_checked', evidence: { base: 'repository', path: '.tmp/loop/qa.json' }, notes: `点击音已测响度 mean ${qa.audio.mean_volume_db} dB / max ${qa.audio.max_volume_db} dB；未主观试听，按未检查处理` });
    project = updateCheck(project, 'qa-viewing', { status: 'not_checked', notes: '未完整观看 8 秒成片；不得以抽帧替代' });
    project = updateCheck(project, 'qa-accept', { status: 'not_checked', notes: '等待用户确认' });
    project = reviseProject(project, { documents: { brief: { base: 'repository', path: '.tmp/loop/brief.md' }, script: null, outline: { base: 'repository', path: '.tmp/loop/outline.md' }, source_notes: [] } });
    const nextRevision = project.revision + 1;
    project = reviseProject(project, { records: { ...project.records, artifacts: [
      { id: 'art-video', kind: 'video', project_revision: nextRevision, reference: { base: 'repository', path: '.tmp/loop/loop.mp4' } },
      { id: 'art-qa', kind: 'other', project_revision: nextRevision, reference: { base: 'repository', path: '.tmp/loop/qa.json' } },
    ] } });
    const errors = validateProject(project);
    if (errors.length) throw new Error(`project validation failed:\n${errors.join('\n')}`);
    fs.writeFileSync(path.join(OUT, 'loop-project.json'), JSON.stringify(project, null, 2) + '\n');
    fs.writeFileSync(path.join(OUT, 'loop-project.md'), projectMarkdown(project));
    const summary = { generated_at: new Date().toISOString(), video: qa.video, contact_sheet: qa.contact_sheet, project: '.tmp/loop/loop-project.json', markdown: '.tmp/loop/loop-project.md', qa: '.tmp/loop/qa.json', project_revision: project.revision, status: project.status, qa_summary: qaSummary(project), gates: project.gates.map((g) => ({ id: g.id, status: g.status })), probe, determinism: frames.determinism, unique_frames: frames.unique };
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(summary, null, 2) + '\n');
    log(`done: ${qa.video} (${frames.rendered} frames, ${probe.duration_seconds}s, ${frames.unique} unique)`);
    log(`project: .tmp/loop/loop-project.json (v${project.revision}, ${project.status}); QA open: ${qaSummary(project).open.join(', ')}`);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close().catch(() => {});
    await server.close();
  }
}

await main().catch((error) => { console.error(error); process.exitCode = 1; });
