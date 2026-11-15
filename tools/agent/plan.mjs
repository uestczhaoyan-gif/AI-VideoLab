#!/usr/bin/env node
/**
 * Prepare a Brief, resource references, and a task for a tool-using Agent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ROOT, loadCatalog } from '../catalog/validate.mjs';
import { loadWorkflowCatalog } from '../catalog/workflows.mjs';
import { projectFromArgs, routingOptions } from '../catalog/routing-input.mjs';
import { decideRoute } from '../../shared/routing.mjs';

const { values } = parseArgs({ options: {
  ...routingOptions,
  out: { type: 'string' }, yes: { type: 'boolean', default: false },
  suggest: { type: 'boolean', default: false }, json: { type: 'boolean', default: false }, help: { type: 'boolean', default: false },
} });
if (values.help) {
  console.log(`VideoLab Agent-led 计划（不会直接渲染）
npm run make -- --topic "主题" [--audience "受众"] [--context "使用场景"] [--duration 10] [--aspect 16:9]
npm run make -- --topic "非线性光学" --suggest --json

之后把 AGENT_TASK.md 交给 Agent。Agent 当场写代码并选择需要的工具。
HTML 工程可以选择 render:agent 抓帧。
`);
  process.exit(0);
}

const catalog = loadCatalog();
const interactive = !values.yes && input.isTTY;
const rl = interactive ? createInterface({ input, output }) : null;
const ask = async (q, fallback = '') => {
  if (!rl) return fallback;
  const a = (await rl.question(`${q}${fallback ? `（默认：${fallback}）` : ''} `)).trim();
  return a || fallback;
};
const slug = (s) => String(s).replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'video';
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');

const topic = String(values.topic ?? await ask('这次想做什么视频？一句话主题：')).trim();
if (!topic) throw new Error('需要主题。');
const rawDuration = values.duration ?? await ask('目标时长（秒）');
const rawAspect = values.aspect ?? await ask('画幅 16:9 / 9:16 / 1:1 / 3:4（默认 16:9）');
const audience = values.audience ?? await ask('这个视频主要给谁看？（可略过）');
rl?.close();
const project = projectFromArgs({
  ...values, topic,
  duration: rawDuration || undefined,
  aspect: rawAspect || undefined,
  audience: audience || undefined,
});
const duration = project.brief.duration_seconds;
if (!Number.isFinite(duration) || duration < 3 || duration > 600) throw new Error('时长需 3–600 秒。');
const aspect = project.brief.aspect_ratio;
const decision = decideRoute(project, loadWorkflowCatalog(catalog), {}, Date.now(), { agent: true });
const candidates = [decision.selected, ...decision.alternatives].filter(Boolean);
const routeSummary = candidates.length ? candidates.map((c) =>
  `- ${c.style} · ${c.workflow}：${c.reasons.join(' ')}${c.blockers.length ? ` 待补：${c.blockers.join(' ')}` : ''}`
).join('\n') : '当前没有满足条件的路线。';

if (values.suggest) {
  if (values.json) console.log(JSON.stringify({ brief: project.brief, decision }, null, 2));
  else console.log(`主题：${topic}\n${routeSummary}`);
  process.exit(0);
}

const outDir = path.resolve(values.out ?? path.join(ROOT, 'projects', `${new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)}-${slug(topic)}`));
fs.mkdirSync(outDir, { recursive: true });
const W = aspect === '16:9' ? 1280 : 720;
const H = aspect === '9:16' ? 1280 : aspect === '3:4' ? 960 : aspect === '1:1' ? 720 : 720;

const brief = `# Brief — ${topic}

- 目标时长：${duration} 秒
- 画幅：${aspect}（${W}×${H}）
- fps：30
- 语言：${project.brief.language}
- 受众：${project.brief.audience || '待明确'}
- 用途：${project.brief.purpose}
- 目标：由 Agent 从零写一个可逐帧渲染的视频实现；不是套用仓库里的固定模板。
- 内容与事实边界：先向用户确认；未验证的数据、引文、品牌与人物不能编造。
- 风格参考：见 RESOURCES.md；风格只作视觉语言参考，不是主题匹配器。
- 交付：由 Agent 自选工具编写本次工程并渲染；HTML 工程可选 render:agent。
`;
const resources = `# 资源候选（Agent 读取，不是自动套用）

主题：${topic}
${routeSummary}

| 风格 | Workflow | Prompt |
| --- | --- | --- |
${candidates.map((c) => `| ${c.style} | ${c.workflow} | ${c.resources.find((resource) => resource.prompt_path)?.prompt_path ?? '待补'} |`).join('\n')}

详细对应见 \`docs/library/TEMPLATE_MAP.md\`。资源不足时先 \`npm run resources:fetch\`；没有同名模板是正常的，选最接近的视觉语言即可，不要停下问“用哪个模板”。
`;
const task = `# AGENT_TASK — ${topic}

这是一个 **Agent-led** 视频任务。你（DSH / Pi / Codex / Claude 等）是导演、视觉设计与编码者；VideoLab CLI 只提供 Brief、资源与渲染/QA 工具。

## 必须做

1. 读 \`BRIEF.md\`、\`RESOURCES.md\` 与库中的制作契约 \`docs/library/CREATE_VIDEO.md\`。按需要阅读风格 Prompt、代码和参考作品。
2. **从零写代码**。选择并调用适合本次需求的可用制作工具，可参考开源实现与 Prompt。
3. 在项目目录写本次源码以及制作记录。若选择 VideoLab 自带 HTML 抓帧器，应写 \`scene.html\`：
   - 16:9 或 Brief 指定画幅；使用 \`video.json\` 的 width/height/duration/fps；
   - 自包含 HTML/CSS/SVG/JS（不要依赖网络、外部字体、未授权素材）；
   - 必须定义 \`window.render(t)\`，t 为秒；相同 t 得到相同画面；
   - 不依赖 Date、Math.random、网络请求或浏览器默认动画；
   - 文字、数据、旁白均由你根据 Brief 编写；不确定的事实先问用户。
4. 用所选工具做风格帧或短预览，让用户确认方向。若采用 HTML 抓帧工具：

   \`\`\`sh
   npm run render:agent -- --project "${rel(outDir)}" --stage stills
   \`\`\`

5. 用户确认后用所选工具渲染完整视频。若采用 HTML 抓帧工具：

   \`\`\`sh
   npm run render:agent -- --project "${rel(outDir)}" --stage render
   \`\`\`

6. 检查片长、画幅、内容、字幕和声音，记录实际使用的工具、命令、素材来源和未验收项。

## 不要做

- 不要套用 \`recipes/\` 的固定模板或旧 \`--style\`；不要生成“模板填空”式画面。
- 不要调用付费 API、上传素材、发布视频，除非用户明确授权。
- 不要因为模板名不匹配就拒绝或反问；主题和模板本来就不一一对应。

## 交付物

- 本次工程源码、预览、完整视频、制作与 QA 记录。使用 HTML 抓帧工具时，按该工具的产物路径交付。
`;
const video = { title: topic, duration, fps: 30, width: W, height: H, aspect, audio: true };
fs.writeFileSync(path.join(outDir, 'BRIEF.md'), brief);
fs.writeFileSync(path.join(outDir, 'RESOURCES.md'), resources);
fs.writeFileSync(path.join(outDir, 'AGENT_TASK.md'), task);
fs.writeFileSync(path.join(outDir, 'video.json'), JSON.stringify(video, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'project.json'), JSON.stringify(project, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'route.json'), JSON.stringify(decision, null, 2) + '\n');

console.log(`\n已创建 Agent 任务：${rel(outDir)}`);
console.log('1. 用 DSH / Pi / Codex / Claude 打开本仓库，指向 AGENT_TASK.md');
console.log('2. Agent 当场写代码并调用所选工具，先交付预览，确认后导出成片。');
