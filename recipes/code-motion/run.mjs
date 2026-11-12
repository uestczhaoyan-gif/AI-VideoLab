#!/usr/bin/env node
/**
 * code-motion recipe executor (local, semi-automatic).
 *
 * Stage 1 — stills: render three representative frames so a human can review
 * the style before any full render. Nothing is confirmed automatically.
 * Stage 2 — render: after brief + style-frame gates are confirmed, render all
 * frames, encode H.264 + AAC click track, collect mechanical QA evidence, and
 * write a new project revision with explicit pass/waive/not_checked states.
 *
 * It never calls a model, uploads media, downloads a browser, or publishes.
 * Director content (brief + content.json) is authored by the current CLI model;
 * this executor only renders and checks it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  contactSheet, encodeVideo, findFfmpeg, launchBrowser, measureLoudness, probeVideo,
  renderFrames, serveHtml, sha256, writeClickTrack, runFfmpeg,
} from '../../tools/render/local-render.mjs';
import { parseProject, reviseProject, validateProject, projectMarkdown, qaSummary } from '../../shared/project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RESOLUTION = { '720p': [1280, 720], '1080p': [1920, 1080] };
const GATE_LABEL = { brief: '需求 / Brief', style_frame: '风格帧 / 样片', export: '导出前' };

function fail(message) { throw new Error(message); }

function gate(project, id) {
  return (project.gates ?? []).find((g) => g.id === id);
}

function readJson(file, label) {
  if (!file) fail(`缺少 --${label} 文件`);
  if (!fs.existsSync(file)) fail(`${label} 文件不存在：${file}`);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { fail(`${label} JSON 无效：${error.message}`); }
}

function validateContent(content, project) {
  const brief = project.brief;
  if (!content.title || typeof content.title !== 'string') fail('content.json 需要 title');
  if (!Array.isArray(content.steps) || content.steps.length < 2 || content.steps.length > 5) fail('content.json 的 steps 需要 2–5 项');
  const [width, height] = RESOLUTION[brief.resolution] ?? fail(`code-motion 暂不支持分辨率 ${brief.resolution}`);
  if (content.duration !== brief.duration_seconds) fail(`content.duration=${content.duration} 与项目时长 ${brief.duration_seconds} 不一致`);
  if (content.fps !== brief.fps) fail(`content.fps=${content.fps} 与项目帧率 ${brief.fps} 不一致`);
  return { width, height, fps: content.fps, duration: content.duration };
}

function stepEvents(content) {
  const events = [0];
  content.steps.forEach((_, i) => events.push(content.duration * (0.22 + (i * (0.56 / content.steps.length)))));
  events.push(content.duration * 0.86);
  return events.map((t) => Number(t.toFixed(3)));
}

function writeBriefFiles(outDir, project, content) {
  const brief = project.brief;
  fs.writeFileSync(path.join(outDir, 'brief.md'), `# Brief（code-motion）\n\n- 主题：${brief.topic}\n- 受众：${brief.audience || '待明确'}\n- 目标：${brief.learning_goal || '待明确'}\n- 规格：${content.duration}s / ${content.width}×${content.height} / ${content.fps}fps\n- 声音：${brief.narration === 'none' ? '无配音' : brief.narration}；字幕：${brief.subtitles ? '有' : '无'}；BGM：${brief.bgm}\n- 附加要求：${brief.notes || '无'}\n`);
  fs.writeFileSync(path.join(outDir, 'outline.md'), `# 执行大纲（code-motion）\n\n- 导演内容：content.json（标题、副标题、${content.steps.length} 个步骤卡、页脚）\n- 时间基：duration=${content.duration}s，fps=${content.fps}，渲染只由 t 决定\n- 步骤卡亮起时刻：${stepEvents(content).map((t) => `${t}s`).join('、')}\n- 机械检查：帧数／规格／解码／确定性／联系表；内容与主观声音保持未检查\n`);
}

async function main() {
  const { values } = parseArgs({ options: {
    project: { type: 'string' }, content: { type: 'string' }, stage: { type: 'string', default: 'stills' },
    out: { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log(`code-motion 本地执行器

用法：
  node recipes/code-motion/run.mjs --project <项目.json> --content <content.json> [--stage stills|render] [--out <目录>]

阶段：
  stills  渲染 3 张风格帧并生成联系表（默认）
  render  确认 brief 与 style_frame 两个确认门后，完整渲染、编码并写回项目

边界：只做本地确定性渲染与机械 QA；不调用模型、不上传、不发布。`);
    return;
  }
  if (!values.project) fail('缺少 --project <项目.json>');
  const project = parseProject(fs.readFileSync(values.project, 'utf8'));
  if (project.selection.recipe_id !== 'code-motion') fail(`项目选择的 recipe 是 ${project.selection.recipe_id ?? '未选择'}，本执行器只处理 code-motion`);
  const contentFile = values.content ? path.resolve(values.content) : fail('缺少 --content <content.json>（由当前 CLI 模型编写）');
  const content = readJson(contentFile, 'content');
  const size = validateContent(content, project);
  const outDir = path.resolve(values.out ?? path.join(ROOT, '.tmp/recipe-runs', project.project_id));
  fs.mkdirSync(outDir, { recursive: true });
  content.width = size.width; content.height = size.height;
  fs.writeFileSync(path.join(outDir, 'content.json'), JSON.stringify(content, null, 2) + '\n');
  writeBriefFiles(outDir, project, content);

  const briefGate = gate(project, 'brief');
  if (briefGate?.status !== 'confirmed') fail(`brief 确认门尚未确认（当前 ${briefGate?.status ?? '缺失'}）。先运行 tools/project/cli.mjs gate --id brief --basis "…"`);

  const style = typeof content.style === 'string' && /^[a-z0-9-]{1,24}$/.test(content.style) ? content.style : null;
  const customFile = content.style_file ? path.resolve(outDir, content.style_file) : null;
  if (customFile && (!fs.existsSync(customFile) || path.extname(customFile).toLowerCase() !== '.html')) fail(`自定义风格文件不存在或不是 HTML：${content.style_file}`);
  const styleFile = style ? path.join(ROOT, 'recipes/code-motion/styles', `${style}.html`) : null;
  const templateFile = customFile ?? (styleFile && fs.existsSync(styleFile) ? styleFile : path.join(ROOT, 'recipes/code-motion/scene.template.html'));
  const template = fs.readFileSync(templateFile, 'utf8');
  const sceneFile = path.join(outDir, 'scene.html');
  fs.writeFileSync(sceneFile, template.replace('__CONTENT_JSON__', JSON.stringify(content)));

  const ffmpeg = findFfmpeg();
  const server = await serveHtml(sceneFile);
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
    await page.goto(server.url);
    await page.waitForFunction(() => window.__ready === true, { timeout: 15000 });
    const shot = async (t, file) => {
      await page.evaluate((value) => window.render(value), t);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      await page.screenshot({ path: file });
    };

    if (values.stage === 'stills') {
      const stillDir = path.join(outDir, 'stills');
      fs.mkdirSync(stillDir, { recursive: true });
      const times = [content.duration * 0.12, content.duration * 0.5, content.duration * 0.92];
      const files = [];
      for (let i = 0; i < times.length; i++) {
        const file = path.join(stillDir, `still-${i + 1}.png`);
        await shot(times[i], file);
        files.push({ t: Number(times[i].toFixed(2)), file: path.relative(ROOT, file).replaceAll('\\', '/'), sha256: sha256(file) });
      }
      const sheet = path.join(outDir, 'style-frames.jpg');
      runFfmpeg(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(stillDir, 'still-%d.png'), '-vf', 'tile=3x1', '-frames:v', '1', sheet], path.join(outDir, 'stills.log'));
      const result = { stage: 'stills', project_id: project.project_id, content: path.relative(ROOT, path.join(outDir, 'content.json')).replaceAll('\\', '/'), stills: files, sheet: path.relative(ROOT, sheet).replaceAll('\\', '/'), note: '风格帧只是抽看；人工确认后把 style_frame 确认门写进项目再渲染。' };
      fs.writeFileSync(path.join(outDir, 'stills.json'), JSON.stringify(result, null, 2) + '\n');
      console.log(JSON.stringify(result, null, 2));
      console.log(`\n确认风格帧后运行：\n  node tools/project/cli.mjs gate --from "${values.project}" --id style_frame --basis "已查看风格帧" --out <新项目.json>\n  node recipes/code-motion/run.mjs --project <新项目.json> --content "${path.relative(ROOT, contentFile)}" --stage render`);
      return;
    }

    const styleGate = gate(project, 'style_frame');
    if (styleGate?.status !== 'confirmed') fail(`style_frame 确认门尚未确认（当前 ${styleGate?.status ?? '缺失'}）。先运行 stills 阶段并确认风格帧。`);

    const framesDir = path.join(outDir, 'frames');
    fs.rmSync(framesDir, { recursive: true, force: true });
    const frames = await renderFrames({ page, outDir: framesDir, duration: content.duration, fps: content.fps, width: size.width, height: size.height, sampleFrames: [0, Math.floor(content.duration * content.fps / 2), Math.round(content.duration * content.fps) - 1], logFile: path.join(outDir, 'qa') });
    if (!frames.determinism.every((d) => d.pass)) fail('确定性检查失败：同一时刻重复渲染结果不一致');
    const wav = path.join(outDir, 'click-track.wav');
    writeClickTrack(wav, content.duration, stepEvents(content));
    const video = path.join(outDir, 'code-motion.mp4');
    encodeVideo({ ffmpeg, framesDir, audioFile: wav, fps: content.fps, video, logFile: path.join(outDir, 'encode.log') });
    const probe = probeVideo(ffmpeg, video, path.join(outDir, 'probe.log'));
    const loud = measureLoudness(ffmpeg, video, path.join(outDir, 'loudness.log'));
    const contact = contactSheet(ffmpeg, video, path.join(outDir, 'storyboard.jpg'), path.join(outDir, 'contact.log'));
    if (frames.rendered !== frames.total) fail(`帧数不符：${frames.rendered}/${frames.total}`);
    if (probe.width !== size.width || probe.height !== size.height || probe.fps !== content.fps || Math.abs(probe.duration_seconds - content.duration) > 0.1) fail(`成片规格不符：${JSON.stringify(probe)}`);
    if (!probe.has_audio) fail('成片缺少音频流');

    const qa = {
      generated_at: new Date().toISOString(), recipe: 'code-motion', adapter: 'recipes/code-motion/run.mjs',
      video: path.relative(ROOT, video).replaceAll('\\', '/'), frames: frames.rendered, unique_frames: frames.unique,
      duration_seconds: probe.duration_seconds, width: probe.width, height: probe.height, fps: probe.fps,
      determinism: frames.determinism, probe, audio: { mean_volume_db: Number.isFinite(loud.mean_volume_db) ? loud.mean_volume_db : null, max_volume_db: Number.isFinite(loud.max_volume_db) ? loud.max_volume_db : null, subjective_listen: 'not_checked' },
      storyboard: path.relative(ROOT, contact).replaceAll('\\', '/'),
      note: '机械检查只覆盖规格、解码、帧数与确定性；内容、主观声音、完整观看、用户采用仍由人负责。',
    };
    fs.writeFileSync(path.join(outDir, 'qa.json'), JSON.stringify(qa, null, 2) + '\n');

    const relative = (file) => path.relative(ROOT, file).replaceAll('\\', '/');
    const update = (id, status, { evidence = null, notes = '' } = {}) => ({ id, status, evidence, notes });
    const updates = new Map([
      [ 'qa-spec', update('qa-spec', 'passed', { evidence: { base: 'repository', path: relative(path.join(outDir, 'qa.json')) }, notes: `${probe.width}×${probe.height} / ${probe.fps}fps / ${probe.duration_seconds}s / ${frames.rendered} 帧` }) ],
      [ 'qa-decode', update('qa-decode', 'passed', { evidence: { base: 'repository', path: relative(path.join(outDir, 'qa.json')) }, notes: 'ffmpeg 解码并读取音视频流无错误' }) ],
      [ 'qa-visual', update('qa-visual', 'passed', { evidence: { base: 'repository', path: relative(contact) }, notes: '抽帧联系表与三时刻确定性检查通过；不是完整审片' }) ],
      [ 'qa-timing', project.brief.narration === 'none' && !project.brief.subtitles ? update('qa-timing', 'waived', { notes: '无旁白与字幕；点击音与画面同表生成，不做主观对齐检查' }) : update('qa-timing', 'not_checked', { notes: '有旁白或字幕；执行器没有做逐句对齐检查' }) ],
      [ 'qa-content', update('qa-content', 'not_checked', { notes: '内容由导演脚本负责；需要人工核对事实、数字与表述' }) ],
      [ 'qa-audio', update('qa-audio', 'not_checked', { evidence: { base: 'repository', path: relative(path.join(outDir, 'qa.json')) }, notes: `点击音已测响度 mean ${qa.audio.mean_volume_db} dB / max ${qa.audio.max_volume_db} dB；未主观试听` }) ],
      [ 'qa-viewing', update('qa-viewing', 'not_checked', { notes: '未完整观看；不得以抽帧替代' }) ],
      [ 'qa-accept', update('qa-accept', 'not_checked', { notes: '等待用户确认' }) ],
    ]);
    const nextRevision = project.revision + 1;
    const checks = project.records.checks.map((check) => updates.has(check.id) ? { ...check, ...updates.get(check.id), project_revision: nextRevision } : check);
    const artifacts = [
      ...project.records.artifacts,
      { id: `art-code-motion-v${nextRevision}`, kind: 'video', project_revision: nextRevision, reference: { base: 'repository', path: relative(video) } },
      { id: `art-qa-v${nextRevision}`, kind: 'other', project_revision: nextRevision, reference: { base: 'repository', path: relative(path.join(outDir, 'qa.json')) } },
    ];
    const documents = {
      ...(project.documents ?? { brief: null, script: null, outline: null, source_notes: [] }),
      brief: { base: 'repository', path: relative(path.join(outDir, 'brief.md')) },
      outline: { base: 'repository', path: relative(path.join(outDir, 'outline.md')) },
      source_notes: [{ base: 'repository', path: relative(path.join(outDir, 'content.json')) }],
    };
    const updated = reviseProject(project, { records: { ...project.records, checks, artifacts }, documents });
    const errors = validateProject(updated);
    if (errors.length) fail(`更新后的项目校验失败：\n${errors.join('\n')}`);
    const projectOut = path.join(outDir, `project-v${updated.revision}.json`);
    fs.writeFileSync(projectOut, JSON.stringify(updated, null, 2) + '\n');
    fs.writeFileSync(path.join(outDir, `project-v${updated.revision}.md`), projectMarkdown(updated));
    const summary = {
      stage: 'render', recipe: 'code-motion', project_id: project.project_id, project: relative(projectOut), revision: updated.revision,
      status: updated.status, video: relative(video), qa: relative(path.join(outDir, 'qa.json')), storyboard: relative(contact),
      format: { duration_seconds: probe.duration_seconds, width: probe.width, height: probe.height, fps: probe.fps, frames: frames.rendered, unique_frames: frames.unique, audio: probe.has_audio },
      gates: updated.gates.map((g) => ({ id: g.id, status: g.status })), qa_summary: qaSummary(updated),
      note: 'export 确认门保持待确认；声音、完整观看、内容与用户采用仍是 not_checked。',
    };
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(summary, null, 2) + '\n');
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close().catch(() => {});
    await server.close();
  }
}

await main().catch((error) => { console.error(`[code-motion] ${error.message}`); process.exitCode = 1; });
