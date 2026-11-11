#!/usr/bin/env node
/**
 * VideoLab CLI studio: topic → recommended video type → a few questions → video.
 *
 * It uses the same project contract, confirmation gates and local recipe
 * executors as the rest of the repo. There is no web UI: style frames are
 * written to disk and their paths are printed for a quick look; the final
 * artifacts are files.
 *
 * Examples:
 *   npm run make -- --topic "用三个指标解释缓存命中率" --purpose education --yes
 *   npm run make -- --topic "产品发布片" --purpose product --screens ./shots --yes
 *   npm run make -- --topic "一段片头动效" --yes
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ROOT, loadCatalog } from '../catalog/validate.mjs';
import { recommendRoute } from '../catalog/integration.mjs';
import { buildPlan, emptyForm, recommendIntent } from '../../shared/planning.mjs';
import { confirmGate, qaSummary, validateProject } from '../../shared/project.mjs';

const { values } = parseArgs({ options: {
  topic: { type: 'string' }, purpose: { type: 'string' }, duration: { type: 'string' },
  aspect: { type: 'string' }, data: { type: 'string' }, screens: { type: 'string' }, style: { type: 'string' },
  out: { type: 'string' }, yes: { type: 'boolean', default: false }, help: { type: 'boolean', default: false },
} });

if (values.help) {
  console.log(`VideoLab CLI 制作

npm run make -- --topic "主题" [--purpose education|product|data|story|motion] [--duration 10] [--aspect 16:9]
npm run make -- --topic "光学演示" --style blueprint --duration 20 --yes
npm run make -- --topic "数据解释" --data data.json --yes
npm run make -- --topic "产品演示" --screens ./screenshots --yes

code-motion 可选风格：default / blueprint / bauhaus / ink-wash（模板在 recipes/code-motion/styles/）。
不提供网页预览；风格帧与成片都写成文件，终端只打印路径。`);
  process.exit(0);
}

const catalog = loadCatalog();
const interactive = !values.yes && input.isTTY;
const rl = interactive ? createInterface({ input, output }) : null;

const PURPOSES = { education: '知识讲解 / 数据解释', product: '产品介绍', data: '数据报告', story: '叙事短片', motion: '短动效' };
const slug = (text) => String(text).replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'video';
const ask = async (text, fallback = '') => {
  if (!rl) return fallback;
  const answer = (await rl.question(`${text}${fallback ? `（默认：${fallback}）` : ''} `)).trim();
  return answer || fallback;
};
const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n'); };
const rel = (file) => path.relative(ROOT, file).replaceAll('\\', '/');

function buildContent(recipeId, project, extra) {
  const b = project.brief;
  const base = {
    kicker: `VIDEOLAB / ${recipeId.toUpperCase()}`,
    duration: b.duration_seconds,
    fps: b.fps,
    footer: `${recipeId} · local render(t) · chromium + ffmpeg`,
  };
  if (recipeId === 'code-motion') {
    return {
      ...base,
      ...(extra.style ? { style: extra.style } : {}),
      title: extra.title || String(b.topic).slice(0, 60),
      subtitle: extra.subtitle || (b.learning_goal || '一条时间表，驱动画面与声音'),
      steps: [
        { label: '01', title: '先写清目标', desc: (b.audience || '受众与目标').slice(0, 44) },
        { label: '02', title: '一条时间表', desc: (b.prerequisites || '画面、字幕、声音共用同一时基').slice(0, 44) },
        { label: '03', title: '检查后交付', desc: (b.learning_goal || '规格、帧数与确定性可机械核对').slice(0, 44) },
      ],
      specTitle: `${Number(b.duration_seconds).toFixed(1)} s / ${Math.round(b.duration_seconds * b.fps)} frames / ${b.fps} fps`,
      specSubtitle: `${b.resolution} · H.264 + AAC · deterministic render(t)`,
    };
  }
  if (recipeId === 'explain-data') {
    return {
      ...base,
      title: extra.title || String(b.topic).slice(0, 60),
      subtitle: extra.subtitle || '一张图回答一个问题',
      data_kind: extra.source.includes('示例数据') ? 'example' : 'real',
      chart: { title: extra.chartTitle || String(b.topic).slice(0, 40), unit: extra.unit, max: Math.max(...extra.bars.map((x) => x.value)) * 1.15 || 10, bars: extra.bars },
      source: extra.source,
      takeaway: extra.takeaway || (b.learning_goal || '看完能复述关键结论'),
    };
  }
  return {
    ...base,
    title: extra.title || String(b.topic).slice(0, 60),
    subtitle: extra.subtitle || '',
    scenes: extra.scenes,
  };
}

function parsePairs(text) {
  const bars = [];
  for (const part of String(text).split(/[，,;；\n]+/)) {
    const match = /^(.+?)[:：]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(part.trim());
    if (match) bars.push({ label: match[1].trim(), value: Number(match[2]) });
  }
  return bars;
}

function loadData(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const bars = Array.isArray(data) ? data : data.bars ?? data.chart?.bars;
  if (!Array.isArray(bars) || bars.length < 2 || bars.length > 6) throw new Error('数据需要 2–6 条 bars');
  const unit = data.unit ?? data.chart?.unit ?? '单位';
  const source = data.source ?? data.chart?.source ?? '示例数据，不是真实统计';
  return { bars: bars.map((b) => ({ label: String(b.label), value: Number(b.value) })), unit, source };
}

function listScreens(dir) {
  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
  if (files.length < 2 || files.length > 6) throw new Error(`截图需要 2–6 张 PNG/JPG，当前 ${files.length} 张`);
  return files;
}

async function main() {
  let topic = String(values.topic ?? '').trim();
  if (!topic) topic = await ask('这次想做什么视频？一句话主题：');
  if (!topic) throw new Error('需要主题。');

  const intent = recommendIntent(topic);
  let purpose = values.purpose && PURPOSES[values.purpose] ? values.purpose : intent.purpose;
  let route = recommendRoute(catalog, { topic, purpose }).route;
  console.log(`\n主题：${topic}`);
  console.log(`推荐类型：${PURPOSES[purpose]}；流程：${route.id}（${route.recipe?.revision}）`);
  console.log(`资源路由：${route.resources.map((r) => `${r.source_id}[${r.access}]`).join(' ')}`);
  if (rl) {
    const answer = await ask('回车接受；或输入 1–5 改用途（1 知识/数据 2 产品 3 数据报告 4 叙事 5 短动效）', '');
    const map = { '1': 'education', '2': 'product', '3': 'data', '4': 'story', '5': 'motion' };
    if (map[answer]) { purpose = map[answer]; route = recommendRoute(catalog, { topic, purpose }).route; }
  }

  const duration = Number(values.duration ?? await ask('目标时长（秒）', '10'));
  if (!Number.isFinite(duration) || duration < 5 || duration > 3600) throw new Error('时长需 5–3600 秒');
  const aspect = String(values.aspect ?? await ask('画幅 16:9 / 9:16 / 1:1 / 3:4', '16:9'));
  if (!['16:9', '9:16', '1:1', '3:4'].includes(aspect)) throw new Error('画幅无效');

  const form = { ...emptyForm(), topic, purpose, duration: String(duration), durationMin: String(duration), durationMax: String(duration), aspect, resolution: '720p', fps: '30', language: 'zh-CN', narration: 'none', bgm: 'none', subtitles: false, usage: 'personal', resourcePolicy: 'current_cli_local', selectionReason: `CLI 推荐：${intent.reason}` };
  let project = buildPlan(catalog, form, null, route.id, 'current_cli');
  const outDir = path.resolve(values.out ?? path.join(ROOT, 'projects', `${new Date().toISOString().slice(0, 10)}-${slug(topic)}`));
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`输出目录：${rel(outDir)}`);

  let extra = {};
  if (route.id === 'code-motion') {
    const style = values.style ?? await ask('风格模板（回车=default；可选 blueprint / bauhaus / ink-wash）', '');
    if (style && !fs.existsSync(path.join(ROOT, 'recipes/code-motion/styles', `${style}.html`))) throw new Error(`未知风格模板：${style}`);
    extra.style = style;
    extra.title = await ask('主标题（回车用主题）', String(topic).slice(0, 60));
    extra.subtitle = await ask('副标题（回车自动）', project.brief.learning_goal || '一条时间表，驱动画面与声音');
  } else if (route.id === 'explain-data') {
    let data;
    if (values.data) data = loadData(path.resolve(values.data));
    else {
      const raw = await ask('输入 2–6 条数据（例：A:42, B:68），或留空用示例数据', '');
      data = raw ? { bars: parsePairs(raw), unit: await ask('单位', '单位'), source: await ask('来源（示例数据必须注明）', '示例数据，不是真实统计') } : { bars: [{ label: '步骤一', value: 42 }, { label: '步骤二', value: 68 }, { label: '步骤三', value: 55 }], unit: '示例单位 u', source: '示例数据，不是真实统计' };
    }
    extra = { ...data, title: await ask('图表标题（回车用主题）', String(topic).slice(0, 40)), chartTitle: undefined };
    extra.chartTitle = String(topic).slice(0, 40);
    extra.takeaway = await ask('结尾要点（回车自动）', project.brief.learning_goal || '看完能复述关键结论');
  } else if (route.id === 'real-product') {
    let dir = values.screens ? path.resolve(values.screens) : await ask('真实截图文件夹（含 2–6 张 PNG/JPG）', '');
    if (!dir) throw new Error('real-product 需要截图文件夹');
    const files = listScreens(dir);
    const assetDir = path.join(outDir, 'assets');
    fs.mkdirSync(assetDir, { recursive: true });
    extra.scenes = [];
    for (const [index, file] of files.entries()) {
      const target = path.join(assetDir, `${String(index + 1).padStart(2, '0')}-${file}`);
      fs.copyFileSync(path.join(dir, file), target);
      extra.scenes.push({ image: `assets/${path.basename(target)}`, title: await ask(`第 ${index + 1} 张说明（回车用文件名）`, path.parse(file).name), desc: '', label: String(index + 1).padStart(2, '0') });
    }
    extra.title = await ask('主标题（回车用主题）', String(topic).slice(0, 60));
    extra.subtitle = '';
  }

  const content = buildContent(route.id, project, extra);
  const projectFile = path.join(outDir, 'project.json');
  const contentFile = path.join(outDir, 'content.json');
  write(projectFile, project);
  write(contentFile, content);
  console.log(`\nBrief：${route.id} · ${duration}s · ${aspect} · ${project.brief.resolution}/${project.brief.fps}fps`);
  const ok = values.yes || String(await ask('确认 Brief 并开始制作？(Y/n)', 'y')).toLowerCase() !== 'n';
  if (!ok) { console.log('已取消，项目和内容已写入。'); rl?.close(); return; }
  project = confirmGate(project, 'brief', { basis: values.yes ? 'CLI --yes 非交互确认 Brief' : 'CLI 用户确认 Brief' });
  const briefFile = path.join(outDir, 'project-brief.json');
  write(briefFile, project);

  const entry = route.executor.entry;
  const run = (stage, projectPath) => {
    const result = spawnSync(process.execPath, [entry, '--project', projectPath, '--content', contentFile, '--stage', stage, '--out', outDir], { cwd: ROOT, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${stage} 失败，退出码 ${result.status}`);
  };
  console.log('\n1/2 生成风格帧…');
  run('stills', briefFile);
  const styleSheet = path.join(outDir, 'style-frames.jpg');
  console.log(`\n风格帧：${rel(styleSheet)}（另见 ${rel(path.join(outDir, 'stills'))}/）`);
  const styleOk = values.yes || String(await ask('查看后确认风格帧并渲染成片？(Y/n)', 'y')).toLowerCase() !== 'n';
  if (!styleOk) { console.log('已停在风格帧；确认后可复用执行器继续。'); rl?.close(); return; }
  project = confirmGate(project, 'style_frame', { basis: values.yes ? 'CLI --yes 非交互确认风格帧' : 'CLI 用户查看 style-frames.jpg 后确认' });
  const styleFile = path.join(outDir, 'project-style.json');
  write(styleFile, project);
  console.log('\n2/2 渲染成片…');
  run('render', styleFile);

  const projectFiles = fs.readdirSync(outDir).filter((f) => /^project-v\d+\.json$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  const latest = projectFiles.length ? JSON.parse(fs.readFileSync(path.join(outDir, projectFiles.at(-1)), 'utf8')) : project;
  const summary = qaSummary(latest);
  console.log(`\n完成。成片：${rel(path.join(outDir, route.id === 'code-motion' ? 'code-motion.mp4' : route.id === 'explain-data' ? 'explain-data.mp4' : 'real-product.mp4'))}`);
  console.log(`联系表：${rel(path.join(outDir, 'storyboard.jpg'))}`);
  console.log(`QA：${summary.passed} passed / ${summary.waived} waived / ${summary.open.length} not_checked（${summary.open.join('、')}）`);
  console.log(`项目版本：${rel(path.join(outDir, projectFiles.at(-1) ?? 'project-style.json'))}`);
  rl?.close();
}

main().catch((error) => { console.error(`[make] ${error.message}`); rl?.close(); process.exitCode = 1; });
