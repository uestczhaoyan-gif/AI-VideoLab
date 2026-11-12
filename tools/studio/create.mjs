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
import { EXECUTABLE_STYLES, recommendResourceTemplates, recommendStyle } from '../../shared/styles.mjs';
import { confirmGate, qaSummary, validateProject } from '../../shared/project.mjs';

const { values } = parseArgs({ options: {
  topic: { type: 'string' }, purpose: { type: 'string' }, duration: { type: 'string' },
  aspect: { type: 'string' }, data: { type: 'string' }, screens: { type: 'string' }, style: { type: 'string' }, 'style-file': { type: 'string' }, suggest: { type: 'boolean', default: false },
  out: { type: 'string' }, yes: { type: 'boolean', default: false }, help: { type: 'boolean', default: false },
} });

if (values.help) {
  console.log(`VideoLab CLI 制作

npm run make -- --topic "主题" [--purpose education|product|data|story|motion] [--duration 10] [--aspect 16:9]
npm run make -- --topic "光学演示" --style blueprint --duration 20 --yes
npm run make -- --topic "数据解释" --data data.json --yes
npm run make -- --topic "产品演示" --screens ./screenshots --yes
npm run make -- --topic "非线性光学" --suggest
npm run make -- --topic "任意主题" --style-file .\my-style.html --yes

code-motion 可执行风格：default / blueprint / bauhaus / ink-wash；--style auto 自动按主题推荐；
--style-file 使用 Agent 即时生成的确定性 HTML 模板。不提供网页预览；风格帧与成片都写成文件，终端只打印路径。`);
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

function buildNarrative(topic, purpose) {
  const text = String(topic);
  if (/非线性光学|倍频|混频|自相位|四波混频|非线性/i.test(text)) {
    return {
      title: '非线性光学：光如何改写介质',
      subtitle: '从线性响应到倍频、混频与自相位调制',
      steps: [
        { label: '01', title: '线性区', desc: '低强度下，介质极化与光场近似成正比' },
        { label: '02', title: '二阶效应', desc: '倍频、和频、差频：两个光子合成一个新频率' },
        { label: '03', title: '三阶效应', desc: '自相位调制、四波混频：光强改变折射率' },
      ],
    };
  }
  if (/光学|透镜|棱镜|干涉|折射|激光|物理/i.test(text)) {
    return {
      title: text.slice(0, 60),
      subtitle: '从现象、机制到可核对的结论',
      steps: [
        { label: '01', title: '现象', desc: `先看“${text.slice(0, 28)}”里发生了什么` },
        { label: '02', title: '机制', desc: '用光路/波形/公式解释关键关系' },
        { label: '03', title: '结论', desc: '给出可复述的结论与成立边界' },
      ],
    };
  }
  if (purpose === 'product') {
    return { title: text.slice(0, 60), subtitle: '问题、功能、结果', steps: [
      { label: '01', title: '问题', desc: '先说清用户在什么场景卡住' },
      { label: '02', title: '功能', desc: '用真实界面/截图展示关键动作' },
      { label: '03', title: '结果', desc: '给出可核对的前后变化' },
    ] };
  }
  if (purpose === 'story') {
    return { title: text.slice(0, 60), subtitle: '开始、变化、落点', steps: [
      { label: '01', title: '开始', desc: '建立人物/问题与观看动机' },
      { label: '02', title: '变化', desc: '让冲突或发现推动下一步' },
      { label: '03', title: '落点', desc: '收束到一个可记住的结论' },
    ] };
  }
  return { title: text.slice(0, 60), subtitle: '现象、机制、结论', steps: [
    { label: '01', title: '现象', desc: `先说明“${text.slice(0, 26)}”要解决的问题` },
    { label: '02', title: '机制', desc: '用一张图或一条时间线解释关键关系' },
    { label: '03', title: '结论', desc: '给出可复述的结论与适用边界' },
  ] };
}

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
      ...(extra.styleFile ? { style_file: extra.styleFile } : {}),
      ...(extra.visual ? { visual: extra.visual } : {}),
      title: extra.title || extra.narrative?.title || String(b.topic).slice(0, 60),
      subtitle: extra.subtitle || extra.narrative?.subtitle || (b.learning_goal || '一条时间线，驱动画面与声音'),
      steps: extra.narrative?.steps || [
        { label: '01', title: '现象', desc: `先说明“${String(b.topic).slice(0, 26)}”要解决的问题` },
        { label: '02', title: '机制', desc: '用一张图或一条时间线解释关键关系' },
        { label: '03', title: '结论', desc: '给出可复述的结论与适用边界' },
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

  if (values['style-file'] && !values.data && !values.screens) {
    purpose = 'motion';
    route = recommendRoute(catalog, { topic: '', purpose }).route;
  }

  const styleAdvice = route.id === 'code-motion' ? recommendStyle(topic, purpose, EXECUTABLE_STYLES) : null;
  const referenceCandidates = route.id === 'code-motion' ? recommendResourceTemplates(catalog, topic, 3) : [];
  if (route.id === 'code-motion') {
    console.log(`\n资源库视觉候选：`);
    for (const item of referenceCandidates) console.log(`  - ${item.name}（${item.source_id}）：${item.reason}；${item.prompt_path}`);
    console.log(`可执行风格建议：${styleAdvice.id}（${styleAdvice.label}，${styleAdvice.reason}）`);
  }
  if (values.suggest) {
    console.log('\n--suggest：只给建议，不渲染。');
    rl?.close();
    return;
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
    let style = '';
    if (values['style-file']) {
      const sourceFile = path.resolve(values['style-file']);
      if (!fs.existsSync(sourceFile) || path.extname(sourceFile).toLowerCase() !== '.html') throw new Error(`--style-file 不存在或不是 HTML：${values['style-file']}`);
      fs.copyFileSync(sourceFile, path.join(outDir, 'custom-style.html'));
      extra.styleFile = 'custom-style.html';
      console.log(`自定义风格：${rel(path.join(outDir, 'custom-style.html'))}（来自 ${values['style-file']}）`);
    } else {
      style = values.style === 'auto' ? styleAdvice.id : (values.style ?? await ask(`风格模板（回车=${styleAdvice.id}；可选 default / blueprint / bauhaus / ink-wash）`, styleAdvice.id));
      if (style && style !== 'default' && !fs.existsSync(path.join(ROOT, 'recipes/code-motion/styles', `${style}.html`))) throw new Error(`未知风格模板：${style}`);
    }
    extra.style = style === 'default' ? '' : style;
    extra.visual = /非线性光学|倍频|混频|自相位|四波混频|非线性/.test(topic) ? 'nonlinear' : 'lens';
    extra.narrative = buildNarrative(topic, purpose);
    extra.title = await ask('主标题（回车用建议）', extra.narrative.title);
    extra.subtitle = await ask('副标题（回车用建议）', extra.narrative.subtitle);
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
