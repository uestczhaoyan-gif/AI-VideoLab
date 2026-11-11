#!/usr/bin/env node
/**
 * Integration registry: one machine-readable routing layer for all resources.
 *
 * It does not pretend every collected repo is runnable. Each source gets an
 * access level:
 *   direct           — a local executor we have actually run
 *   prompt           — prompts/styles can be fed to a local recipe via the model
 *   install_required — code to install/verify before use
 *   index_only       — docs/site/index only, not executable
 *   reference        — video evidence, not an execution resource
 *   blocked          — license or dependency blocks execution
 *
 * Usage:
 *   node tools/catalog/integration.mjs --build
 *   node tools/catalog/integration.mjs --check
 *   node tools/catalog/route.mjs --purpose product --topic "产品演示"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, loadCatalog } from './validate.mjs';

export const INTEGRATION_PATH = path.join(ROOT, 'catalog/integration.json');

const ACCESS = {
  // Video sources: evidence/reference only.
  V01: ['reference', '角色资产锚定链；核心 Skill 未公开'],
  V02: ['reference', '模型比较展示；无可复现流程'],
  V03: ['reference', '成片展示；无公开制作链'],
  V04: ['reference', '确定性 render(t) + 逐帧 + 指标检查'],
  V05: ['reference', 'Agent 协作 SOP 与配音锁时基'],
  V06: ['reference', '341 风格 Prompt 的原始来源'],
  V07: ['reference', 'Prompt 分层与六个步骤'],
  V08: ['reference', '长片全流程与确认点'],
  V09: ['reference', '个人 harness 与多模型分工'],
  V10: ['reference', '46 秒全代码展示片；时间基与卡点'],
  V11: ['reference', 'fy-code-animation v1.0.0 十步流程'],
  V12: ['reference', 'motion-showreel 原理/技巧/QA'],
  V13: ['reference', 'web-video-presentation + Harness'],
  V14: ['reference', 'video-shotcraft 介绍；仓库见 P22'],
  // Projects / resources.
  P01: ['index_only', '工作流/SOP 文档；未执行'],
  P02: ['prompt', '15 条风格 Prompt；仅 5 条 demo 有本地视频'],
  P03: ['prompt', 'fifi 案例 Prompt；单案例'],
  P04: ['index_only', 'Table-VideoSOP 文档与模板'],
  P05: ['install_required', 'Manim 相关引擎；未安装'],
  P06: ['install_required', 'Manim 相关引擎；未安装'],
  P07: ['install_required', '绘图/动画引擎；未安装'],
  P08: ['install_required', 'Anatomy 交互图解；未安装'],
  P09: ['prompt', '341 条风格 Prompt 与索引；可喂给 code-motion 的导演步骤'],
  P10: ['index_only', 'Ploto 长片文章；方法参考'],
  P11: ['install_required', 'auto-motion 模板；需安装/运行'],
  P12: ['install_required', 'Open Design Skill；需安装'],
  P13: ['install_required', 'Skill 资源；需安装'],
  P14: ['install_required', 'Skill 资源；需安装'],
  P15: ['install_required', 'HyperFrames 引擎；需 Node/ffmpeg，未安装'],
  P16: ['install_required', 'Onetake 工具链；非商业许可'],
  P17: ['install_required', 'Anidoodle 插件；需安装'],
  P18: ['install_required', 'Claudian 工具；需安装'],
  P19: ['index_only', '索引/外链；未取得工程'],
  P20: ['index_only', '索引/外链；未取得工程'],
  P21: ['index_only', '索引/外链；未取得工程'],
  P22: ['install_required', 'video-shotcraft 镜头库；约 201 MB，Apache-2.0 代码，未安装未渲染'],
  P23: ['index_only', 'Awesome AI Motion 作品索引；许可逐条核对'],
  LEMO: ['install_required', '风格工程快照；未运行'],
};

const ROUTES = [
  {
    id: 'code-motion',
    recipe_id: 'code-motion',
    purposes: ['motion', 'story'],
    signals: ['动效', '片头', '转场', '代码动画', '风格'],
    executor: { kind: 'local_cli', status: 'verified', verified_at: '2026-11-08', evidence: '.tmp/recipe-runs/example-code-motion/report.json', example: 'examples/code-motion/README.md' },
    resources: [
      ['P09', 'prompt'], ['P02', 'prompt'], ['P03', 'prompt'],
      ['V06', 'reference'], ['V10', 'reference'], ['V11', 'reference'], ['V14', 'reference'],
      ['P22', 'install_required'],
    ],
    limits: ['文字/图形卡点短动效；无生成式素材、角色或真人', '导演内容由当前 CLI 模型写；执行器不调用模型 API'],
  },
  {
    id: 'explain-data',
    recipe_id: 'explain-data',
    purposes: ['education', 'data'],
    signals: ['数据', '图表', '统计', '指标', '科普', '机制'],
    executor: { kind: 'local_cli', status: 'verified', verified_at: '2026-11-08', evidence: '.tmp/explain-data/example-explain-data/qa.json', example: 'examples/explain-data/README.md' },
    resources: [
      ['V04', 'reference'], ['V12', 'reference'],
      ['P05', 'install_required'], ['P06', 'install_required'], ['P07', 'install_required'],
      ['P23', 'index_only'],
    ],
    limits: ['固定横向条形图版式；不支持折线图/多图联动/自定义布局', '不验证数据真实性；示例数据必须标注，真实统计人工核对'],
  },
  {
    id: 'real-product',
    recipe_id: 'real-product',
    purposes: ['product'],
    signals: ['产品', '截图', '界面', '功能', '演示', '落地页'],
    executor: { kind: 'local_cli', status: 'verified', verified_at: '2026-11-08', evidence: '.tmp/real-product/run/report.json', example: 'examples/real-product/README.md' },
    resources: [
      ['P22', 'install_required'], ['V05', 'reference'], ['V08', 'reference'], ['V14', 'reference'],
      ['P16', 'install_required'], ['P08', 'install_required'],
    ],
    limits: ['只包装真实截图；不生成 UI、不录屏、不验证功能真实性', '2–6 场景；图片须在仓库工作区内'],
  },
];

const PIPELINE = [
  { id: 'brief', name: '想法 / Brief', human: true, output: '一句话想法、受众、目标、时长、画幅、声音' },
  { id: 'route', name: '路由', human: false, output: 'recipe + 资源清单 + 可执行状态' },
  { id: 'style_frames', name: '风格帧', human: true, output: '三张代表帧，人确认' },
  { id: 'produce', name: '制作', human: false, output: '本地执行器或外部工具产物' },
  { id: 'qa', name: '质检', human: true, output: '机械 QA + 人工内容/声音/完整观看' },
  { id: 'export', name: '导出', human: true, output: '成片、项目 JSON、确认门记录' },
];

export function recommendRoute(catalog, { topic = '', purpose = '' } = {}) {
  const text = `${topic} ${purpose}`;
  const routes = buildIntegration(catalog).routes;
  const byId = Object.fromEntries(routes.map((r) => [r.id, r]));
  let id = 'code-motion';
  if (/数据|图表|统计|指标|机制|科普/.test(text) || ['data', 'education'].includes(purpose)) {
    id = /产品|截图|界面|功能|演示|落地页/.test(text) ? 'real-product' : 'explain-data';
  } else if (/产品|截图|界面|功能|演示|落地页/.test(text) || purpose === 'product') {
    id = 'real-product';
  }
  return { route: byId[id], alternatives: routes.filter((r) => r.id !== id).map((r) => r.id) };
}

export function buildIntegration(catalog = loadCatalog()) {
  const sourceById = Object.fromEntries(catalog.sources.map((s) => [s.id, s]));
  const resources = catalog.sources.map((source) => {
    const [access, note] = ACCESS[source.id] ?? ['index_only', '未分类资源'];
    const promptCount = catalog.templates.filter((t) => t.source_id === source.id && t.kind === 'prompt').length;
    const toolCount = catalog.templates.filter((t) => t.source_id === source.id).length;
    return {
      source_id: source.id,
      title: source.title,
      url: source.url,
      license: source.license.label,
      access,
      note,
      prompt_entries: promptCount,
      templates: toolCount,
      routes: ROUTES.filter((r) => r.resources.some(([id]) => id === source.id)).map((r) => r.id),
    };
  });
  const routes = ROUTES.map((route) => ({
    ...route,
    executor: { ...route.executor, entry: catalog.recipes.find((r) => r.id === route.recipe_id)?.adapter?.entry ?? null },
    resources: route.resources.map(([source_id, role]) => ({ source_id, role, access: resources.find((r) => r.source_id === source_id)?.access ?? 'index_only' })),
    recipe: (() => {
      const recipe = catalog.recipes.find((r) => r.id === route.recipe_id);
      return recipe ? { revision: recipe.revision, runnable: recipe.runnable, entry: recipe.adapter?.entry ?? null } : null;
    })(),
  }));
  return {
    schema_version: 1,
    updated_at: '2026-11-09',
    note: '资源访问等级不是执行承诺：direct/verified 只有三条本地 recipe；prompt 需要当前模型写代码；install_required 需安装验证；index_only/reference 不能直接出片。',
    pipeline: PIPELINE,
    routes,
    resources,
  };
}

export function validateIntegration(catalog = loadCatalog(), integration = buildIntegration(catalog)) {
  const errors = [];
  const sources = new Set(catalog.sources.map((s) => s.id));
  const recipes = new Map(catalog.recipes.map((r) => [r.id, r]));
  for (const route of integration.routes) {
    const recipe = recipes.get(route.recipe_id);
    if (!recipe) { errors.push(`route ${route.id}: missing recipe ${route.recipe_id}`); continue; }
    if (!recipe.runnable) errors.push(`route ${route.id}: recipe is not runnable`);
    const entry = route.executor?.entry ?? recipe.adapter?.entry;
    if (!entry) errors.push(`route ${route.id}: missing executor entry`);
    else if (!fs.existsSync(path.join(ROOT, entry))) errors.push(`route ${route.id}: executor file missing ${entry}`);
    for (const resource of route.resources) {
      if (!sources.has(resource.source_id)) errors.push(`route ${route.id}: missing resource ${resource.source_id}`);
    }
  }
  for (const resource of integration.resources) {
    if (!sources.has(resource.source_id)) errors.push(`integration resource ${resource.source_id} not in catalog`);
    if (!['direct', 'prompt', 'install_required', 'index_only', 'reference', 'blocked'].includes(resource.access)) errors.push(`bad access for ${resource.source_id}`);
  }
  for (const source of sources) if (!integration.resources.some((r) => r.source_id === source)) errors.push(`source ${source} has no integration access record`);
  for (const template of catalog.templates) if (!sources.has(template.source_id)) errors.push(`template ${template.id} has unknown source ${template.source_id}`);
  return errors;
}

export function accessSummary(catalog = loadCatalog()) {
  const integration = buildIntegration(catalog);
  const byAccess = {};
  for (const r of integration.resources) byAccess[r.access] = (byAccess[r.access] ?? 0) + 1;
  const promptEntries = integration.resources.filter((r) => r.access === 'prompt').reduce((sum, r) => sum + r.templates, 0);
  return { sources: integration.resources.length, templates: catalog.templates.length, byAccess, promptEntries };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = loadCatalog();
  const integration = buildIntegration(catalog);
  const errors = validateIntegration(catalog, integration);
  if (process.argv.includes('--build')) {
    if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else {
      fs.writeFileSync(INTEGRATION_PATH, JSON.stringify(integration, null, 2) + '\n');
      const summary = accessSummary(catalog);
      console.log(`Wrote catalog/integration.json: ${summary.sources} sources, ${summary.templates} templates, ${integration.routes.length} routes; access ${JSON.stringify(summary.byAccess)}`);
    }
  } else if (process.argv.includes('--check')) {
    if (!fs.existsSync(INTEGRATION_PATH)) { console.error('catalog/integration.json missing; run --build'); process.exitCode = 1; }
    else {
      const current = JSON.parse(fs.readFileSync(INTEGRATION_PATH, 'utf8'));
      const expected = JSON.stringify(integration);
      if (JSON.stringify(current) !== expected) { console.error('catalog/integration.json is stale; run --build'); process.exitCode = 1; }
      else if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
      else { const s = accessSummary(catalog); console.log(`Integration valid: ${integration.routes.length} routes, ${s.sources} sources, ${s.templates} templates; access ${JSON.stringify(s.byAccess)}`); }
    }
  } else {
    console.log('Usage: node tools/catalog/integration.mjs --build|--check');
  }
}
