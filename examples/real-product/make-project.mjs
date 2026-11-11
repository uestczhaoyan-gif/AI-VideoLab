#!/usr/bin/env node
/**
 * 生成 real-product 示例项目（brief + recipe 选择 + 三个待确认门）。
 * 不确认任何门、不渲染：Brief 与风格帧必须由人查看后确认。
 *
 * Usage: node examples/real-product/make-project.mjs [--out .tmp/real-product/project.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { assertProject, createProject } from '../../shared/project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { values } = parseArgs({ options: { out: { type: 'string' } } });
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/catalog.json'), 'utf8'));
// catalog 由 Lead 统一接线；这里跟随 catalog 里的真实 revision，未接线时退回 draft-1。
const recipe = catalog.recipes.find((item) => item.id === 'real-product');
const recipeRevision = recipe?.revision ?? 'draft-1';

const brief = {
  topic: 'VideoLab 工作台：本地真实界面走查',
  purpose: 'product',
  duration_seconds: 10,
  resolution: '720p',
  fps: 30,
  language: 'zh-CN',
  narration: 'none',
  subtitles: false,
  bgm: 'none',
  usage: 'personal',
  audience: '关注本地 AI 视频工作台的创作者与评审者',
  prerequisites: '知道模板库、流程与确认门的大致含义',
  learning_goal: '看懂工作台当前真实可用的四个页面及其证据边界',
  depth: 'introductory',
  formula_policy: 'none',
  style_preferences: '真实界面截图、克制的产品介绍；不生成或改写 UI',
  notes: '示例项目：4 张截图由 examples/real-product/capture.mjs 从本机工作台截取；执行器只做确定性包装，不验证界面内容真实性。',
};

const base = createProject(brief, {
  projectId: 'example-real-product',
  originalRequest: '用真实的产品界面截图做一支 10 秒 720p 产品介绍，验证 real-product 本地执行器。',
});

const acceptance = [
  ['technical', '成片规格、帧数、编码与确定性可机械核对'],
  ['content', '截图来自本机真实工作台；说明条与页面内容一致'],
  ['visual', '关键帧与四段截图包装可抽看；不是完整审片'],
  ['rights', '界面截图的来源与再分发范围由用户确认（示例仅本机使用）'],
].map(([category, requirement]) => ({ id: globalThis.crypto.randomUUID(), category, requirement }));

const project = assertProject({
  ...base,
  title: '真实产品截图包装：VideoLab 工作台走查',
  selection: {
    template_id: null, template_revision: null, source_id: null,
    recipe_id: 'real-product', recipe_revision: recipeRevision,
    tier: 'current_cli', reason: `真实界面截图 + 逐场景说明，正好是 real-product recipe（catalog revision ${recipeRevision}）的代表任务；示例不依赖模板库条目。`,
  },
  requirements: recipe?.requirements?.length ? recipe.requirements : [
    '2–6 张真实截图（PNG/JPG）与逐场景说明（content.json）',
    '截图单图 <3 MiB、总量 <8 MiB；路径相对 content.json',
    '本机 Chrome/Edge 与 ffmpeg；不调用模型、不上传',
  ],
  stages: (recipe?.stages ?? []).map((stage) => ({
    id: stage.id, name: stage.name, output: stage.output,
    strategy: '复用当前助手与已核查的本地工具，按需补最小适配', provider: null, model_id: null, state: 'not_configured',
  })),
  acceptance,
  resources: {
    ...base.resources,
    available_tools: ['本机 Chrome/Edge', 'ffmpeg', 'Playwright（已安装）'],
    notes: '全部本地执行；截图写入 .tmp/real-product/assets/（Git 忽略）。',
    max_wait_minutes: 15,
  },
  records: {
    ...base.records,
    assumptions: [
      '示例截图来自本机 VideoLab 工作台的真实页面（capture.mjs），未使用虚构 UI 或外部图片。',
      '内容、主观声音、完整观看与用户采用由人负责；执行器的 passed 只代表机械检查。',
    ],
    unknowns: [
      '未验证界面截图内容的产品事实、界面状态是否代表当前版本，以及素材再分发许可。',
    ],
  },
});

const out = path.resolve(values.out ?? path.join(ROOT, '.tmp/real-product/project.json'));
fs.mkdirSync(path.dirname(out), { recursive: true });
if (fs.existsSync(out)) throw new Error(`目标已存在，拒绝覆盖：${out}`);
fs.writeFileSync(out, JSON.stringify(project, null, 2) + '\n');
const rel = (file) => path.relative(ROOT, file).replaceAll('\\', '/');
console.log(`已写入 ${rel(out)}（项目 v${project.revision}，确认门均为 pending）。`);
console.log(`下一步：
  node tools/project/cli.mjs gate --from "${rel(out)}" --id brief --basis "已核对示例 Brief、截图来源与内容边界" --out .tmp/real-product/project-brief.json
  node recipes/real-product/run.mjs --project .tmp/real-product/project-brief.json --content .tmp/real-product/content.json --stage stills`);
