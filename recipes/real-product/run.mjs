#!/usr/bin/env node
/**
 * real-product recipe executor (local, semi-automatic).
 *
 * 输入：真实产品截图/录屏帧（PNG/JPG）+ 逐场景说明（content.json）。
 * 输出：16:9 产品介绍短片（截图缓慢推拉/平移、说明条、序号、可选高亮框、淡入淡出）。
 *
 * Stage 1 — stills: 渲染 3 张风格帧供人查看，不自动确认任何门。
 * Stage 2 — render: brief 与 style_frame 两个确认门都确认后，全片渲染、编码、
 * 机械 QA，并写回项目新版本（内容/主观声音/完整观看/用户采用保持 not_checked）。
 *
 * 边界：不调用模型、不联网、不下载素材、不上传、不发布；只用本机 Chrome/Edge
 * 与 ffmpeg。图片以 base64 注入 HTML，不新增静态服务；不把图片写进仓库（只读用户
 * 指定路径，产物与快照写入 .tmp 或 --out）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  contactSheet, encodeVideo, findFfmpeg, launchBrowser, measureLoudness, probeVideo,
  renderFrames, runFfmpeg, serveHtml, sha256, writeClickTrack,
} from '../../tools/render/local-render.mjs';
import { parseProject, reviseProject, validateProject, projectMarkdown, qaSummary } from '../../shared/project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RECIPE_ID = 'real-product';
const RESOLUTION = { '720p': [1280, 720], '1080p': [1920, 1080] };
const IMAGE_EXT = new Map([['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg']]);
const MOTIONS = new Set(['zoom-in', 'zoom-out', 'pan-left', 'pan-right']);
const LIMITS = { perImage: 3 * 1024 * 1024, totalImages: 8 * 1024 * 1024 };
const MAX_SCENES = 6;
const MIN_SCENES = 2;

function fail(message) { throw new Error(message); }
const rel = (file) => path.relative(ROOT, file).replaceAll('\\', '/');
const gate = (project, id) => (project.gates ?? []).find((g) => g.id === id);

function readJson(file, label) {
  if (!file) fail(`缺少 --${label} 文件`);
  const target = path.resolve(file);
  if (!fs.existsSync(target)) fail(`${label} 文件不存在：${target}`);
  const stat = fs.statSync(target);
  if (!stat.isFile()) fail(`${label} 不是文件：${target}`);
  try { return { value: JSON.parse(fs.readFileSync(target, 'utf8').replace(/^\uFEFF/, '')), file: target }; } catch (error) { fail(`${label} JSON 无效：${error.message}`); }
}

function detectImage(buffer, ext) {
  if (ext === '.png') return buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (ext === '.jpg' || ext === '.jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  return false;
}

function validateContent(content, project, contentFile) {
  const brief = project.brief;
  if (!content || typeof content !== 'object') fail('content.json 必须是对象');
  if (!String(content.title ?? '').trim()) fail('content.json 需要非空 title');
  if (!Array.isArray(content.scenes) || content.scenes.length < MIN_SCENES || content.scenes.length > MAX_SCENES) {
    fail(`content.json 的 scenes 需要 ${MIN_SCENES}–${MAX_SCENES} 项（每项一张真实截图与一条说明）`);
  }
  const [width, height] = RESOLUTION[brief.resolution] ?? fail(`${RECIPE_ID} 暂不支持分辨率 ${brief.resolution}（支持 720p / 1080p）`);
  if (Number(content.duration) !== Number(brief.duration_seconds)) fail(`content.duration=${content.duration} 与项目时长 ${brief.duration_seconds} 不一致`);
  if (Number(content.fps) !== Number(brief.fps)) fail(`content.fps=${content.fps} 与项目帧率 ${brief.fps} 不一致`);
  if (!Number.isFinite(Number(content.duration)) || Number(content.duration) <= 0) fail('content.duration 必须是正数');
  const frames = Math.round(Number(content.duration) * Number(content.fps));
  if (Math.abs(frames - Number(content.duration) * Number(content.fps)) > 0.01) fail('content.duration × fps 必须是整数帧');
  const perScene = Number(content.duration) / content.scenes.length;
  if (perScene < 0.8) fail(`场景过短：${content.scenes.length} 个场景 / ${content.duration}s，每段需 ≥ 0.8s`);

  const baseDir = path.dirname(contentFile);
  const images = [];
  let totalBytes = 0;
  content.scenes.forEach((scene, index) => {
    if (!scene || typeof scene !== 'object') fail(`scenes[${index}] 必须是对象`);
    if (!String(scene.title ?? '').trim()) fail(`scenes[${index}].title 不能为空`);
    if (!String(scene.image ?? '').trim()) fail(`scenes[${index}].image 不能为空`);
    if (scene.motion != null && !MOTIONS.has(scene.motion)) fail(`scenes[${index}].motion 只能是 ${[...MOTIONS].join(' / ')}`);
    if (scene.highlight != null) {
      const h = scene.highlight;
      if (typeof h !== 'object') fail(`scenes[${index}].highlight 必须是对象`);
      for (const key of ['x', 'y', 'w', 'h']) {
        if (!Number.isFinite(h[key]) || h[key] < 0 || h[key] > 1) fail(`scenes[${index}].highlight.${key} 需在 0–1 之间（相对图片的归一化坐标）`);
      }
      if (h.w <= 0 || h.h <= 0) fail(`scenes[${index}].highlight 的 w / h 必须大于 0`);
      if (h.x + h.w > 1.0001 || h.y + h.h > 1.0001) fail(`scenes[${index}].highlight 超出图片范围`);
    }
    const imageFile = path.resolve(baseDir, scene.image);
    if (!fs.existsSync(imageFile) || !fs.statSync(imageFile).isFile()) fail(`截图不存在：${scene.image}（相对 content.json 解析为 ${imageFile}）`);
    const real = fs.realpathSync(imageFile);
    const relativeToRoot = path.relative(fs.realpathSync(ROOT), real);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) fail(`截图必须位于仓库工作区内（可放 .tmp 或 projects/）：${scene.image}`);
    const ext = path.extname(real).toLowerCase();
    if (!IMAGE_EXT.has(ext)) fail(`不支持的图片格式 ${ext || '(无扩展名)'}；只接受 PNG / JPG（${scene.image}）`);
    const bytes = fs.statSync(real).size;
    if (bytes > LIMITS.perImage) fail(`单图超过 3 MiB：${scene.image}（${(bytes / 1048576).toFixed(2)} MiB）`);
    const buffer = fs.readFileSync(real);
    if (!detectImage(buffer, ext)) fail(`文件内容不是有效 ${ext === '.png' ? 'PNG' : 'JPEG'}：${scene.image}（扩展名与内容须一致）`);
    totalBytes += bytes;
    images.push({ index, file: real, relative: rel(real), bytes, mime: IMAGE_EXT.get(ext), base64: buffer.toString('base64') });
  });
  if (totalBytes > LIMITS.totalImages) fail(`图片总量超过 8 MiB（${(totalBytes / 1048576).toFixed(2)} MiB）`);
  return { width, height, fps: Number(content.fps), duration: Number(content.duration), frames, images, totalBytes };
}

function sceneWindows(content) {
  const n = content.scenes.length;
  const seg = Number(content.duration) / n;
  return content.scenes.map((_, index) => ({ index, start: Number((index * seg).toFixed(3)), end: Number(((index + 1) * seg).toFixed(3)), duration: Number(seg.toFixed(3)) }));
}

function buildPayload(content, size, images) {
  return {
    ...content,
    width: size.width,
    height: size.height,
    fps: size.fps,
    duration: size.duration,
    kicker: content.kicker || 'VIDEOLAB / REAL-PRODUCT',
    footer: content.footer || '真实截图 · 本地确定性渲染 · chromium + ffmpeg',
    scenes: content.scenes.map((scene, index) => ({
      label: scene.label ?? '',
      title: scene.title,
      desc: scene.desc ?? '',
      alt: scene.alt ?? '',
      motion: scene.motion ?? ['zoom-in', 'pan-left', 'zoom-out', 'pan-right'][index % 4],
      highlight: scene.highlight ?? null,
      image: `data:${images[index].mime};base64,${images[index].base64}`,
    })),
  };
}

function writeBriefFiles(outDir, project, content, size, windows) {
  const brief = project.brief;
  fs.writeFileSync(path.join(outDir, 'brief.md'), `# Brief（${RECIPE_ID}）

- 主题：${brief.topic}
- 受众：${brief.audience || '待明确'}
- 目标：${brief.learning_goal || '待明确'}
- 规格：${size.duration}s / ${size.width}×${size.height} / ${size.fps}fps（${size.frames} 帧）
- 声音：${brief.narration === 'none' ? '无配音' : brief.narration}；字幕：${brief.subtitles ? '有' : '无'}；BGM：${brief.bgm}
- 素材：${content.scenes.length} 张真实截图（单图 <3 MiB、总量 <8 MiB，base64 注入）
- 附加要求：${brief.notes || '无'}
- 边界：执行器不验证截图内容与产品事实的真实性，不生成或改写 UI；素材版权与产品事实由用户负责。
`);
  const rows = windows.map((w, i) => {
    const scene = content.scenes[i];
    return `| ${i + 1} | ${w.start}–${w.end}s | \`${scene.image}\` | ${scene.title} | ${scene.desc || '—'} | ${scene.motion ?? 'auto'} | ${scene.highlight ? '有' : '无'} |`;
  }).join('\n');
  fs.writeFileSync(path.join(outDir, 'outline.md'), `# 执行大纲（${RECIPE_ID}）

- 导演内容：content.json（标题、${content.scenes.length} 个场景的截图／说明条／序号／可选高亮框）
- 时间基：duration=${size.duration}s，fps=${size.fps}，${size.frames} 帧；render(t) 只由 t 决定
- 转场：场景间交叉淡入淡出；开场／结尾整体淡入淡出
- 机械检查：帧数／规格／解码／确定性／联系表；内容、主观声音、完整观看、用户采用保持未检查

| # | 时间窗 | 截图（相对 content.json） | 说明条标题 | 说明文字 | 运动 | 高亮框 |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

## 图片总量

- ${content.scenes.length} 张，共 ${(size.totalBytes / 1048576).toFixed(2)} MiB（限制：单图 <3 MiB，总量 <8 MiB）。
`);
}

async function main() {
  const { values } = parseArgs({ options: {
    project: { type: 'string' }, content: { type: 'string' }, stage: { type: 'string', default: 'stills' },
    out: { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log(`real-product 本地执行器（真实截图/录屏包装）

用法：
  node recipes/real-product/run.mjs --project <项目.json> --content <content.json> [--stage stills|render] [--out <目录>]

阶段：
  stills  渲染 3 张风格帧并生成联系表（默认）
  render  确认 brief 与 style_frame 两个确认门后，完整渲染、编码并写回项目

输入 content.json：title、scenes[2–6]（image 相对 content.json、title、desc、可选 label/motion/highlight）、duration、fps。
边界：只做本地确定性渲染与机械 QA；不调用模型、不上传、不发布、不验证截图内容真实性。`);
    return;
  }
  if (!['stills', 'render'].includes(values.stage)) fail('--stage 只能是 stills 或 render');
  if (!values.project) fail('缺少 --project <项目.json>');
  const projectFile = path.resolve(values.project);
  const project = parseProject(fs.readFileSync(projectFile, 'utf8').replace(/^\uFEFF/, ''));
  if (project.selection.recipe_id !== RECIPE_ID) fail(`项目选择的 recipe 是 ${project.selection.recipe_id ?? '未选择'}，本执行器只处理 ${RECIPE_ID}`);
  const contentRead = readJson(values.content, 'content');
  const content = contentRead.value;
  const size = validateContent(content, project, contentRead.file);
  const outDir = path.resolve(values.out ?? path.join(ROOT, '.tmp/real-product', project.project_id));
  fs.mkdirSync(outDir, { recursive: true });

  // 内容快照：图片路径改为仓库相对路径，便于项目引用；原始输入文件仍在原位置（只读）。
  const contentSnapshot = {
    ...content,
    image_path_base: 'content',
    scenes: content.scenes.map((scene, index) => ({ ...scene, image: path.relative(outDir, size.images[index].file).replaceAll('\\', '/') })),
    resolved_at: new Date().toISOString(),
    source_content: rel(contentRead.file),
  };
  fs.writeFileSync(path.join(outDir, 'content.json'), JSON.stringify(contentSnapshot, null, 2) + '\n');
  const windows = sceneWindows(content);
  writeBriefFiles(outDir, project, content, size, windows);

  const briefGate = gate(project, 'brief');
  if (briefGate?.status !== 'confirmed') fail(`brief 确认门尚未确认（当前 ${briefGate?.status ?? '缺失'}）。先运行 tools/project/cli.mjs gate --id brief --basis "…"`);

  const payload = buildPayload(content, size, size.images);
  const template = fs.readFileSync(path.join(ROOT, 'recipes/real-product/scene.template.html'), 'utf8');
  const sceneFile = path.join(outDir, 'scene.html');
  const inject = JSON.stringify(payload).replace(/<\/script/gi, '<\\/script');
  fs.writeFileSync(sceneFile, template.replace('__CONTENT_JSON__', inject));

  const ffmpeg = findFfmpeg();
  const server = await serveHtml(sceneFile);
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
    await page.goto(server.url);
    await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
    const shot = async (t, file) => {
      await page.evaluate((value) => window.render(value), t);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      await page.screenshot({ path: file });
    };

    if (values.stage === 'stills') {
      const stillDir = path.join(outDir, 'stills');
      fs.mkdirSync(stillDir, { recursive: true });
      // 取各场景中点，避免正好落在转场淡入淡出边界而看到半透明重影。
      const seg = size.duration / content.scenes.length;
      const picks = [...new Set([0, Math.floor(content.scenes.length / 2), content.scenes.length - 1])];
      const times = picks.map((index) => (index + 0.5) * seg);
      const files = [];
      for (let i = 0; i < times.length; i++) {
        const file = path.join(stillDir, `still-${i + 1}.png`);
        await shot(times[i], file);
        files.push({ t: Number(times[i].toFixed(2)), file: rel(file), sha256: sha256(file) });
      }
      const sheet = path.join(outDir, 'style-frames.jpg');
      runFfmpeg(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(stillDir, 'still-%d.png'), '-vf', 'tile=3x1', '-frames:v', '1', sheet], path.join(outDir, 'stills.log'));
      const result = {
        stage: 'stills', recipe: RECIPE_ID, project_id: project.project_id,
        content: rel(path.join(outDir, 'content.json')), scenes: content.scenes.length,
        images: { count: size.images.length, total_bytes: size.totalBytes },
        stills: files, sheet: rel(sheet),
        note: '风格帧只是抽看；人工确认后把 style_frame 确认门写进项目再渲染。',
      };
      fs.writeFileSync(path.join(outDir, 'stills.json'), JSON.stringify(result, null, 2) + '\n');
      console.log(JSON.stringify(result, null, 2));
      console.log(`\n确认风格帧后运行：\n  node tools/project/cli.mjs gate --from "${rel(projectFile)}" --id style_frame --basis "已查看风格帧" --out ${rel(outDir)}/project-style.json\n  node recipes/real-product/run.mjs --project ${rel(outDir)}/project-style.json --content "${rel(contentRead.file)}" --stage render --out ${rel(outDir)}`);
      return;
    }

    const styleGate = gate(project, 'style_frame');
    if (styleGate?.status !== 'confirmed') fail(`style_frame 确认门尚未确认（当前 ${styleGate?.status ?? '缺失'}）。先运行 stills 阶段并确认风格帧。`);

    const framesDir = path.join(outDir, 'frames');
    fs.rmSync(framesDir, { recursive: true, force: true });
    const frames = await renderFrames({ page, outDir: framesDir, duration: size.duration, fps: size.fps, width: size.width, height: size.height, sampleFrames: [0, Math.floor(size.frames / 2), size.frames - 1], logFile: path.join(outDir, 'qa') });
    if (!frames.determinism.every((d) => d.pass)) fail('确定性检查失败：同一时刻重复渲染结果不一致');
    const events = [0, ...windows.map((w) => w.start).slice(1), Number((size.duration * 0.92).toFixed(3))];
    const wav = path.join(outDir, 'click-track.wav');
    writeClickTrack(wav, size.duration, [...new Set(events)].sort((a, b) => a - b));
    const video = path.join(outDir, 'real-product.mp4');
    encodeVideo({ ffmpeg, framesDir, audioFile: wav, fps: size.fps, video, logFile: path.join(outDir, 'encode.log') });
    const probe = probeVideo(ffmpeg, video, path.join(outDir, 'probe.log'));
    const loud = measureLoudness(ffmpeg, video, path.join(outDir, 'loudness.log'));
    const contact = contactSheet(ffmpeg, video, path.join(outDir, 'storyboard.jpg'), path.join(outDir, 'contact.log'));
    if (frames.rendered !== frames.total) fail(`帧数不符：${frames.rendered}/${frames.total}`);
    if (probe.width !== size.width || probe.height !== size.height || probe.fps !== size.fps || Math.abs(probe.duration_seconds - size.duration) > 0.1) fail(`成片规格不符：${JSON.stringify(probe)}`);
    if (!probe.has_audio) fail('成片缺少音频流');

    const qa = {
      generated_at: new Date().toISOString(), recipe: RECIPE_ID, adapter: 'recipes/real-product/run.mjs',
      video: rel(video), frames: frames.rendered, unique_frames: frames.unique,
      duration_seconds: probe.duration_seconds, width: probe.width, height: probe.height, fps: probe.fps,
      determinism: frames.determinism,
      inputs: { images: size.images.map((image) => ({ path: image.relative, bytes: image.bytes, mime: image.mime })), total_bytes: size.totalBytes, scenes: content.scenes.length },
      probe,
      audio: { mean_volume_db: Number.isFinite(loud.mean_volume_db) ? loud.mean_volume_db : null, max_volume_db: Number.isFinite(loud.max_volume_db) ? loud.max_volume_db : null, subjective_listen: 'not_checked' },
      storyboard: rel(contact),
      note: '机械检查只覆盖规格、解码、帧数与确定性；截图内容真实性、内容表述、主观声音、完整观看、用户采用仍由人负责。',
    };
    fs.writeFileSync(path.join(outDir, 'qa.json'), JSON.stringify(qa, null, 2) + '\n');

    const update = (id, status, { evidence = null, notes = '' } = {}) => ({ id, status, evidence, notes });
    const noNarration = project.brief.narration === 'none' && !project.brief.subtitles;
    const updates = new Map([
      ['qa-spec', update('qa-spec', 'passed', { evidence: { base: 'repository', path: rel(path.join(outDir, 'qa.json')) }, notes: `${probe.width}×${probe.height} / ${probe.fps}fps / ${probe.duration_seconds}s / ${frames.rendered} 帧` })],
      ['qa-decode', update('qa-decode', 'passed', { evidence: { base: 'repository', path: rel(path.join(outDir, 'qa.json')) }, notes: 'ffmpeg 解码并读取音视频流无错误' })],
      ['qa-visual', update('qa-visual', 'passed', { evidence: { base: 'repository', path: rel(contact) }, notes: '抽帧联系表与三时刻确定性检查通过；不是完整审片' })],
      ['qa-timing', noNarration ? update('qa-timing', 'waived', { notes: '无旁白与字幕；说明条与点击音由同一场景表生成，执行器未做逐句对齐' }) : update('qa-timing', 'not_checked', { notes: '有旁白或字幕；执行器没有做逐句对齐检查' })],
      ['qa-content', update('qa-content', 'not_checked', { notes: '截图内容与产品事实由用户负责；执行器不验证功能真实性' })],
      ['qa-audio', update('qa-audio', 'not_checked', { evidence: { base: 'repository', path: rel(path.join(outDir, 'qa.json')) }, notes: `点击音已测响度 mean ${qa.audio.mean_volume_db} dB / max ${qa.audio.max_volume_db} dB；未主观试听` })],
      ['qa-viewing', update('qa-viewing', 'not_checked', { notes: '未完整观看；不得以抽帧替代' })],
      ['qa-accept', update('qa-accept', 'not_checked', { notes: '等待用户确认' })],
    ]);
    const nextRevision = project.revision + 1;
    const checks = project.records.checks.map((check) => updates.has(check.id) ? { ...check, ...updates.get(check.id), project_revision: nextRevision } : check);
    const artifacts = [
      ...project.records.artifacts,
      { id: `art-real-product-v${nextRevision}`, kind: 'video', project_revision: nextRevision, reference: { base: 'repository', path: rel(video) } },
      { id: `art-qa-v${nextRevision}`, kind: 'other', project_revision: nextRevision, reference: { base: 'repository', path: rel(path.join(outDir, 'qa.json')) } },
    ];
    const documents = {
      ...(project.documents ?? { brief: null, script: null, outline: null, source_notes: [] }),
      brief: { base: 'repository', path: rel(path.join(outDir, 'brief.md')) },
      outline: { base: 'repository', path: rel(path.join(outDir, 'outline.md')) },
      source_notes: [
        { base: 'repository', path: rel(path.join(outDir, 'content.json')) },
        ...size.images.map((image) => ({ base: 'repository', path: image.relative })),
      ],
    };
    const updated = reviseProject(project, { records: { ...project.records, checks, artifacts }, documents });
    const errors = validateProject(updated);
    if (errors.length) fail(`更新后的项目校验失败：\n${errors.join('\n')}`);
    const projectOut = path.join(outDir, `project-v${updated.revision}.json`);
    fs.writeFileSync(projectOut, JSON.stringify(updated, null, 2) + '\n');
    fs.writeFileSync(path.join(outDir, `project-v${updated.revision}.md`), projectMarkdown(updated));
    const summary = {
      stage: 'render', recipe: RECIPE_ID, project_id: project.project_id, project: rel(projectOut), revision: updated.revision,
      status: updated.status, video: rel(video), qa: rel(path.join(outDir, 'qa.json')), storyboard: rel(contact),
      format: { duration_seconds: probe.duration_seconds, width: probe.width, height: probe.height, fps: probe.fps, frames: frames.rendered, unique_frames: frames.unique, audio: probe.has_audio },
      inputs: { scenes: content.scenes.length, images: size.images.length, total_bytes: size.totalBytes },
      gates: updated.gates.map((g) => ({ id: g.id, status: g.status })), qa_summary: qaSummary(updated),
      note: 'export 确认门保持待确认；内容、主观声音、完整观看、用户采用仍是 not_checked。',
    };
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(summary, null, 2) + '\n');
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close().catch(() => {});
    await server.close();
  }
}

await main().catch((error) => { console.error(`[${RECIPE_ID}] ${error.message}`); process.exitCode = 1; });
