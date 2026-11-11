#!/usr/bin/env node
/**
 * explain-data recipe executor (local, semi-automatic).
 *
 * Second executable recipe in VideoLab: a data / science explainer built from a
 * deterministic `render(t)` page. The director (the current CLI model) writes
 * the brief and a content.json; this executor only renders and mechanically
 * checks that content. Nothing is confirmed automatically.
 *
 * Stage 1 — stills: after the brief gate is confirmed, render three
 * representative frames (opening / mid / takeaway) so a human can review the
 * style before any full render.
 * Stage 2 — render: after brief + style_frame gates are confirmed, render all
 * frames, encode H.264 + AAC click track, collect mechanical QA evidence, and
 * write a new project revision with explicit pass / waive / not_checked states.
 *
 * It never calls a model, uploads media, downloads a browser or published file,
 * and never writes to any shared repository file. Director content is authored
 * by the current CLI model; this executor only renders and checks it.
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
const RECIPE_ID = 'explain-data';
const RESOLUTION = { '720p': [1280, 720], '1080p': [1920, 1080] };

function fail(message) { throw new Error(message); }

function gate(project, id) {
  return (project.gates ?? []).find((g) => g.id === id);
}

function requireGate(project, id, hint) {
  const current = gate(project, id);
  if (current?.status !== 'confirmed') {
    fail(`${id} 确认门尚未确认（当前 ${current?.status ?? '缺失'}）。${hint}`);
  }
}

function readJson(file, label) {
  if (!file) fail(`缺少 --${label} 文件`);
  if (!fs.existsSync(file)) fail(`${label} 文件不存在：${file}`);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { fail(`${label} JSON 无效：${error.message}`); }
}

function validateContent(content, project) {
  const brief = project.brief;
  if (typeof content.title !== 'string' || !content.title.trim()) fail('content.json 需要 title');
  if (typeof content.subtitle !== 'string' || !content.subtitle.trim()) fail('content.json 需要 subtitle');
  if (typeof content.source !== 'string' || content.source.trim().length < 8) fail('content.json 需要 source（来源／口径说明，不能为空）');
  if (typeof content.takeaway !== 'string' || !content.takeaway.trim()) fail('content.json 需要 takeaway（结尾要点）');
  if (!['example', 'real'].includes(content.data_kind)) fail('content.json 的 data_kind 必须是 "example" 或 "real"');
  if (content.data_kind === 'example' && !content.source.includes('示例数据')) {
    fail('data_kind=example 时，source 必须明确写「示例数据」，避免被误读为真实统计');
  }
  const chart = content.chart;
  if (!chart || typeof chart !== 'object') fail('content.json 需要 chart');
  if (typeof chart.title !== 'string' || !chart.title.trim()) fail('chart.title 不能为空');
  if (typeof chart.unit !== 'string' || !chart.unit.trim()) fail('chart.unit 不能为空（图表必须有单位）');
  if (!Number.isFinite(chart.max) || chart.max <= 0) fail('chart.max 需要是大于零的数字');
  if (!Array.isArray(chart.bars) || chart.bars.length < 2 || chart.bars.length > 6) fail('chart.bars 需要 2–6 项');
  for (const [i, bar] of chart.bars.entries()) {
    if (!bar || typeof bar !== 'object') fail(`chart.bars[${i}] 需要是对象`);
    if (typeof bar.label !== 'string' || !bar.label.trim()) fail(`chart.bars[${i}].label 不能为空`);
    if (!Number.isFinite(bar.value) || bar.value < 0) fail(`chart.bars[${i}].value 需要是非负数字`);
    if (bar.note !== undefined && typeof bar.note !== 'string') fail(`chart.bars[${i}].note 需要是字符串`);
    if (bar.value > chart.max) fail(`chart.bars[${i}].value=${bar.value} 超过 chart.max=${chart.max}`);
  }
  if (content.duration !== brief.duration_seconds) fail(`content.duration=${content.duration} 与项目时长 ${brief.duration_seconds} 不一致`);
  if (content.fps !== brief.fps) fail(`content.fps=${content.fps} 与项目帧率 ${brief.fps} 不一致`);
  if (brief.aspect_ratio !== '16:9') fail(`explain-data 目前只支持 16:9，项目为 ${brief.aspect_ratio}`);
  const [width, height] = RESOLUTION[brief.resolution] ?? fail(`explain-data 暂不支持分辨率 ${brief.resolution}`);
  return { width, height, fps: content.fps, duration: content.duration };
}

/** One schedule drives both picture and click track, so they can never drift. */
function buildSchedule(content) {
  const duration = content.duration;
  const count = content.chart.bars.length;
  const grow = duration * 0.22;
  const starts = Array.from({ length: count }, (_, i) => Number((duration * 0.16 + i * duration * 0.10).toFixed(3)));
  return { bar_starts: starts, grow_seconds: Number(grow.toFixed(3)), takeaway_at: Number((duration * 0.74).toFixed(3)) };
}

function clickEvents(schedule) {
  return [0, ...schedule.bar_starts, schedule.takeaway_at];
}

function writeBriefFiles(outDir, project, content, schedule) {
  const brief = project.brief;
  const dataLine = content.data_kind === 'example'
    ? '- 数据性质：**示例数据，不是真实统计**；仅用于演示渲染链，不能引用为事实或趋势。'
    : '- 数据性质：声称真实数据；来源与口径见 content.json 的 source，仍需人工核对。';
  fs.writeFileSync(path.join(outDir, 'brief.md'), `# Brief（explain-data）\n\n- 主题：${brief.topic}\n- 受众：${brief.audience || '待明确'}\n- 目标：${brief.learning_goal || '待明确'}\n- 规格：${content.duration}s / ${content.width}×${content.height} / ${content.fps}fps / ${brief.aspect_ratio}\n- 声音：${brief.narration === 'none' ? '无配音' : brief.narration}；字幕：${brief.subtitles ? '有' : '无'}；BGM：${brief.bgm}\n- 图表：${content.chart.title}（单位：${content.chart.unit}；${content.chart.bars.length} 组）\n${dataLine}\n- 来源／口径：${content.source}\n- 结尾要点：${content.takeaway}\n- 附加要求：${brief.notes || '无'}\n`);
  fs.writeFileSync(path.join(outDir, 'outline.md'), `# 执行大纲（explain-data）\n\n- 导演内容：content.json（标题、副标题、${content.chart.bars.length} 组指标条、单位、来源脚注、结尾 takeaway）\n- 时间基：duration=${content.duration}s，fps=${content.fps}，渲染只由 t 决定\n- 指标条增长起点：${schedule.bar_starts.map((t) => `${t}s`).join('、')}（增长 ${schedule.grow_seconds}s）\n- 结尾要点出现：${schedule.takeaway_at}s\n- 声音：点击音由同一事件表生成；无配音、无 BGM\n- 机械检查：帧数／规格／解码／确定性／联系表；内容、主观声音、完整观看、用户采用保持未检查\n- 数据边界：${content.data_kind === 'example' ? '示例数据，不是真实统计' : '真实数据声明，来源见 source，仍需人工核对'}\n`);
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

async function main() {
  const { values } = parseArgs({ options: {
    project: { type: 'string' }, content: { type: 'string' }, stage: { type: 'string', default: 'stills' },
    out: { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log(`explain-data 本地执行器

用法：
  node recipes/explain-data/run.mjs --project <项目.json> --content <content.json> [--stage stills|render] [--out <目录>]

阶段：
  stills  确认 brief 确认门后，渲染 3 张风格帧（开场／中段／结尾要点）并生成联系表（默认）
  render  确认 brief 与 style_frame 两个确认门后，完整渲染、编码并写回项目新版本

要求：项目的 selection.recipe_id 必须是 explain-data；content.duration/fps 与项目 brief 一致。
内容边界：content.json 是导演内容，本执行器只渲染与机械检查；示例数据必须在 source 中写明「示例数据」。
边界：不调用模型、不联网、不下载素材、不上传、不发布；只使用本机 Chrome/Edge 与 ffmpeg。`);
    return;
  }
  if (!values.project) fail('缺少 --project <项目.json>');
  const project = parseProject(fs.readFileSync(values.project, 'utf8'));
  if (project.selection.recipe_id !== RECIPE_ID) {
    fail(`项目选择的 recipe 是 ${project.selection.recipe_id ?? '未选择'}，本执行器只处理 ${RECIPE_ID}`);
  }
  const contentFile = values.content ? path.resolve(values.content) : fail('缺少 --content <content.json>（由当前 CLI 模型编写）');
  if (!['stills', 'render'].includes(values.stage)) fail(`--stage 只能是 stills 或 render（当前 ${values.stage}）`);
  const content = readJson(contentFile, 'content');
  const size = validateContent(content, project);

  // GATES: brief must be confirmed before any style frame is rendered.
  requireGate(project, 'brief', '先运行 tools/project/cli.mjs gate --id brief --basis "…" --out <新项目.json>');
  if (values.stage === 'render') {
    requireGate(project, 'style_frame', '先运行 stills 阶段并确认风格帧，再写 style_frame 门。');
  }

  const defaultOut = path.join(ROOT, '.tmp/explain-data', String(project.project_id).replace(/[^A-Za-z0-9._-]+/g, '-'));
  const outDir = path.resolve(values.out ?? defaultOut);
  fs.mkdirSync(outDir, { recursive: true });
  content.width = size.width; content.height = size.height;
  const schedule = buildSchedule(content);
  fs.writeFileSync(path.join(outDir, 'content.json'), JSON.stringify(content, null, 2) + '\n');
  writeBriefFiles(outDir, project, content, schedule);

  const template = fs.readFileSync(path.join(ROOT, 'recipes/explain-data/scene.template.html'), 'utf8');
  const sceneFile = path.join(outDir, 'scene.html');
  const sceneContent = { ...content, schedule };
  fs.writeFileSync(sceneFile, template.replace('__CONTENT_JSON__', () => JSON.stringify(sceneContent).replaceAll('<', '\\u003c')));

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
      const times = [content.duration * 0.2, content.duration * 0.5, content.duration * 0.92];
      const files = [];
      for (let i = 0; i < times.length; i++) {
        const file = path.join(stillDir, `still-${i + 1}.png`);
        await shot(times[i], file);
        files.push({ t: Number(times[i].toFixed(2)), file: relative(file), sha256: sha256(file) });
      }
      const sheet = path.join(outDir, 'style-frames.jpg');
      runFfmpeg(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(stillDir, 'still-%d.png'), '-vf', 'tile=3x1', '-frames:v', '1', sheet], path.join(outDir, 'stills.log'));
      const result = {
        stage: 'stills', recipe: RECIPE_ID, project_id: project.project_id,
        content: relative(path.join(outDir, 'content.json')), stills: files, sheet: relative(sheet),
        data: { kind: content.data_kind, unit: content.chart.unit, bars: content.chart.bars.length, source: content.source },
        gate: { brief: 'confirmed', style_frame: gate(project, 'style_frame')?.status ?? 'missing' },
        note: '风格帧只是抽看；示例数据不是真实统计；人工确认后把 style_frame 确认门写进项目再渲染。',
      };
      fs.writeFileSync(path.join(outDir, 'stills.json'), JSON.stringify(result, null, 2) + '\n');
      console.log(JSON.stringify(result, null, 2));
      console.log(`\n确认风格帧后运行：\n  node tools/project/cli.mjs gate --from "${values.project}" --id style_frame --basis "已查看风格帧" --out <新项目.json>\n  node recipes/explain-data/run.mjs --project <新项目.json> --content "${relative(contentFile)}" --stage render`);
      return;
    }

    const framesDir = path.join(outDir, 'frames');
    fs.rmSync(framesDir, { recursive: true, force: true });
    const frames = await renderFrames({ page, outDir: framesDir, duration: content.duration, fps: content.fps, width: size.width, height: size.height, sampleFrames: [0, Math.floor(content.duration * content.fps / 2), Math.round(content.duration * content.fps) - 1], logFile: path.join(outDir, 'qa') });
    if (!frames.determinism.every((d) => d.pass)) fail('确定性检查失败：同一时刻重复渲染结果不一致');

    const wav = path.join(outDir, 'click-track.wav');
    writeClickTrack(wav, content.duration, clickEvents(schedule));
    const video = path.join(outDir, 'explain-data.mp4');
    encodeVideo({ ffmpeg, framesDir, audioFile: wav, fps: content.fps, video, logFile: path.join(outDir, 'encode.log') });
    const probe = probeVideo(ffmpeg, video, path.join(outDir, 'probe.log'));
    const loud = measureLoudness(ffmpeg, video, path.join(outDir, 'loudness.log'));
    const contact = contactSheet(ffmpeg, video, path.join(outDir, 'storyboard.jpg'), path.join(outDir, 'contact.log'));
    if (frames.rendered !== frames.total) fail(`帧数不符：${frames.rendered}/${frames.total}`);
    if (probe.width !== size.width || probe.height !== size.height || probe.fps !== content.fps || Math.abs(probe.duration_seconds - content.duration) > 0.1) fail(`成片规格不符：${JSON.stringify(probe)}`);
    if (!probe.has_audio) fail('成片缺少音频流');

    const qa = {
      generated_at: new Date().toISOString(), recipe: RECIPE_ID, adapter: 'recipes/explain-data/run.mjs',
      project_id: project.project_id,
      data: { kind: content.data_kind, source: content.source, unit: content.chart.unit, bars: content.chart.bars.length, boundary: content.data_kind === 'example' ? '示例数据，不是真实统计' : '真实数据声明；来源与口径仍需人工核对' },
      video: relative(video), frames: frames.rendered, unique_frames: frames.unique,
      duration_seconds: probe.duration_seconds, width: probe.width, height: probe.height, fps: probe.fps,
      schedule,
      determinism: frames.determinism,
      probe,
      audio: { track: 'click', mean_volume_db: Number.isFinite(loud.mean_volume_db) ? loud.mean_volume_db : null, max_volume_db: Number.isFinite(loud.max_volume_db) ? loud.max_volume_db : null, subjective_listen: 'not_checked', narration_rendered: false },
      storyboard: relative(contact),
      note: '机械检查只覆盖规格、解码、帧数与确定性；示例数据不是真实统计，内容、主观声音、完整观看、用户采用仍由人负责。',
    };
    fs.writeFileSync(path.join(outDir, 'qa.json'), JSON.stringify(qa, null, 2) + '\n');

    const update = (id, status, { evidence = null, notes = '' } = {}) => ({ id, status, evidence, notes });
    const timingWaived = project.brief.narration === 'none' && !project.brief.subtitles;
    const updates = new Map([
      [ 'qa-spec', update('qa-spec', 'passed', { evidence: { base: 'repository', path: relative(path.join(outDir, 'qa.json')) }, notes: `${probe.width}×${probe.height} / ${probe.fps}fps / ${probe.duration_seconds}s / ${frames.rendered} 帧` }) ],
      [ 'qa-decode', update('qa-decode', 'passed', { evidence: { base: 'repository', path: relative(path.join(outDir, 'qa.json')) }, notes: 'ffmpeg 解码并读取音视频流无错误' }) ],
      [ 'qa-visual', update('qa-visual', 'passed', { evidence: { base: 'repository', path: relative(contact) }, notes: '抽帧联系表与三时刻确定性检查通过；不是完整审片' }) ],
      [ 'qa-timing', timingWaived
        ? update('qa-timing', 'waived', { notes: '无旁白与字幕；点击音与图表事件同表生成，不做主观对齐检查' })
        : update('qa-timing', 'not_checked', { notes: '项目要求配音或字幕；执行器只生成点击音轨，未渲染／未检查字幕与旁白对齐' }) ],
      [ 'qa-content', update('qa-content', 'not_checked', { notes: content.data_kind === 'example' ? '内容标注为示例数据，不是真实统计；示例数据仍需人工核对是否被误读为事实' : '内容由导演脚本负责；需要人工核对事实、数字、单位与来源' }) ],
      [ 'qa-audio', update('qa-audio', 'not_checked', { evidence: { base: 'repository', path: relative(path.join(outDir, 'qa.json')) }, notes: `点击音已测响度 mean ${qa.audio.mean_volume_db} dB / max ${qa.audio.max_volume_db} dB；未主观试听` }) ],
      [ 'qa-viewing', update('qa-viewing', 'not_checked', { notes: '未完整观看；不得以抽帧替代' }) ],
      [ 'qa-accept', update('qa-accept', 'not_checked', { notes: '等待用户确认' }) ],
    ]);
    const nextRevision = project.revision + 1;
    const checks = project.records.checks.map((check) => updates.has(check.id) ? { ...check, ...updates.get(check.id), project_revision: nextRevision } : check);
    const artifacts = [
      ...project.records.artifacts,
      { id: `art-explain-data-v${nextRevision}`, kind: 'video', project_revision: nextRevision, reference: { base: 'repository', path: relative(video) } },
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
      stage: 'render', recipe: RECIPE_ID, project_id: project.project_id, project: relative(projectOut), revision: updated.revision,
      status: updated.status, video: relative(video), qa: relative(path.join(outDir, 'qa.json')), storyboard: relative(contact),
      format: { duration_seconds: probe.duration_seconds, width: probe.width, height: probe.height, fps: probe.fps, frames: frames.rendered, unique_frames: frames.unique, audio: probe.has_audio },
      data: qa.data,
      gates: updated.gates.map((g) => ({ id: g.id, status: g.status })),
      qa_summary: qaSummary(updated),
      known_limitations: [
        '只生成点击音轨；不渲染配音、BGM 或字幕',
        '图表样式固定（横向条形 + 数值增长），不支持自定义布局或折线图',
        '示例数据不是真实统计；真实数据必须由导演脚本提供来源并人工核对',
        '机械检查不等于内容、声音、完整观看或采用验收',
      ],
      note: 'export 确认门保持待确认；声音、完整观看、内容与用户采用仍是 not_checked。',
    };
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(summary, null, 2) + '\n');
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close().catch(() => {});
    await server.close();
  }
}

await main().catch((error) => { console.error(`[explain-data] ${error.message}`); process.exitCode = 1; });
