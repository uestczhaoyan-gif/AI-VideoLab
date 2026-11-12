#!/usr/bin/env node
/**
 * Agent-led planning (no video generation).
 *
 * `npm run make` creates a self-contained brief + resource selection + task
 * contract. The user's AI Agent (DSH / Pi / Codex / Claude) writes the video
 * code from scratch in that project directory; `npm run render:agent` then
 * performs only frame capture, encoding and mechanical QA.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ROOT, loadCatalog } from '../catalog/validate.mjs';
import { recommendIntent } from '../../shared/planning.mjs';
import { recommendResourceTemplates } from '../../shared/styles.mjs';

const { values } = parseArgs({ options: {
  topic: { type: 'string' }, purpose: { type: 'string' }, duration: { type: 'string' },
  aspect: { type: 'string' }, out: { type: 'string' }, yes: { type: 'boolean', default: false },
  suggest: { type: 'boolean', default: false }, help: { type: 'boolean', default: false },
} });
if (values.help) {
  console.log(`VideoLab Agent-led 计划（不会直接渲染）
npm run make -- --topic "主题" [--duration 10] [--aspect 16:9]
npm run make -- --topic "非线性光学" --suggest

之后把项目目录交给 DSH / Pi / Codex / Claude；Agent 从零写 scene.html。
风格帧：npm run render:agent -- --project projects/<目录> --stage stills
成片：  npm run render:agent -- --project projects/<目录> --stage render
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
const duration = Number(values.duration ?? await ask('目标时长（秒）', '10'));
if (!Number.isFinite(duration) || duration < 3 || duration > 600) throw new Error('时长需 3–600 秒。');
const aspect = String(values.aspect ?? await ask('画幅 16:9 / 9:16 / 1:1 / 3:4', '16:9'));
if (!['16:9', '9:16', '1:1', '3:4'].includes(aspect)) throw new Error('画幅无效。');
const intent = recommendIntent(topic);
const candidates = recommendResourceTemplates(catalog, topic, 5);

if (values.suggest) {
  console.log(`主题：${topic}`);
  console.log(`用途建议：${intent.reason}`);
  console.log('资源库视觉/风格候选：');
  for (const c of candidates) console.log(`- ${c.name}（${c.source_id}）：${c.reason}\n  ${c.prompt_path}`);
  console.log('不会生成视频；把主题与这些候选交给 Agent，由它从零写代码。');
  rl?.close();
  process.exit(0);
}

const outDir = path.resolve(values.out ?? path.join(ROOT, 'projects', `${new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)}-${slug(topic)}`));
fs.mkdirSync(outDir, { recursive: true });
const W = aspect === '9:16' ? 720 : aspect === '3:4' ? 720 : 1280;
const H = aspect === '9:16' ? 1280 : aspect === '3:4' ? 960 : aspect === '1:1' ? 720 : 720;

const brief = `# Brief — ${topic}

- 目标时长：${duration} 秒
- 画幅：${aspect}（${W}×${H}）
- fps：30
- 语言：中文
- 目标：由 Agent 从零写一个可逐帧渲染的视频实现；不是套用仓库里的固定模板。
- 内容与事实边界：先向用户确认；未验证的数据、引文、品牌与人物不能编造。
- 风格参考：见 RESOURCES.md；风格只作视觉语言参考，不是主题匹配器。
- 交付：scene.html（含 window.render(t)）或等价的本地工程；再用 render:agent 渲染。
`;
const resources = `# 资源候选（Agent 读取，不是自动套用）

主题：${topic}
用途建议：${intent.reason}

| 候选 | 来源 | Prompt/规格 | 为什么 |
| --- | --- | --- | --- |
${candidates.map((c) => `| ${c.name} | ${c.source_id} | \`${c.prompt_path}\` | ${c.reason} |`).join('\n')}

详细对应见 \`docs/library/TEMPLATE_MAP.md\`。资源不足时先 \`npm run resources:fetch\`；没有同名模板是正常的，选最接近的视觉语言即可，不要停下问“用哪个模板”。
`;
const task = `# AGENT_TASK — ${topic}

这是一个 **Agent-led** 视频任务。你（DSH / Pi / Codex / Claude 等）是导演、视觉设计与编码者；VideoLab CLI 只提供 Brief、资源与渲染/QA 工具。

## 必须做

1. 读 \`BRIEF.md\` 与 \`RESOURCES.md\`，按用户主题决定内容与视觉方案；资源模板只作参考。
2. **从零写代码**，不要复制仓库里的固定 scene 模板、不要调用已废弃的旧 recipe；每次视频都应是新的实现，允许不同模型做出不同效果。
3. 在项目目录写 \`scene.html\`：
   - 16:9 或 Brief 指定画幅；使用 \`video.json\` 的 width/height/duration/fps；
   - 自包含 HTML/CSS/SVG/JS（不要依赖网络、外部字体、未授权素材）；
   - 必须定义 \`window.render(t)\`，t 为秒；相同 t 得到相同画面；
   - 不依赖 Date、Math.random、网络请求或浏览器默认动画；
   - 文字、数据、旁白均由你根据 Brief 编写；不确定的事实先问用户。
4. 先把风格帧做出来让用户看：

   \`\`\`sh
   npm run render:agent -- --project "${rel(outDir)}" --stage stills
   \`\`\`

5. 用户确认后再渲染：

   \`\`\`sh
   npm run render:agent -- --project "${rel(outDir)}" --stage render
   \`\`\`

6. 检查 \`report.json\` / \`qa.json\`，不要把机械检查说成内容/观看/采用验收。

## 不要做

- 不要套用 \`recipes/\` 的固定模板或旧 \`--style\`；不要生成“模板填空”式画面。
- 不要调用付费 API、上传素材、发布视频，除非用户明确授权。
- 不要因为模板名不匹配就拒绝或反问；主题和模板本来就不一一对应。

## 交付物

- \`scene.html\`（或你自选的本地工程）
- \`stills/\` + \`style-frames.jpg\`（风格帧）
- \`code-motion.mp4\`（由 render:agent 生成）
- \`report.json\` / \`qa.json\`
`;
const video = { title: topic, duration, fps: 30, width: W, height: H, aspect, audio: true };
fs.writeFileSync(path.join(outDir, 'BRIEF.md'), brief);
fs.writeFileSync(path.join(outDir, 'RESOURCES.md'), resources);
fs.writeFileSync(path.join(outDir, 'AGENT_TASK.md'), task);
fs.writeFileSync(path.join(outDir, 'video.json'), JSON.stringify(video, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'project.json'), JSON.stringify({ schema_version: 1, mode: 'agent_led', topic, duration, fps: 30, width: W, height: H, aspect, resources: candidates.map((c) => ({ id: c.id, source_id: c.source_id, prompt_path: c.prompt_path })) }, null, 2) + '\n');

console.log(`\n已创建 Agent 任务：${rel(outDir)}`);
console.log('1. 用 DSH / Pi / Codex / Claude 打开本仓库，指向 AGENT_TASK.md');
console.log('2. Agent 从零写 scene.html（不是套固定模板）');
console.log(`3. npm run render:agent -- --project "${rel(outDir)}" --stage stills`);
console.log(`4. 看风格帧后：npm run render:agent -- --project "${rel(outDir)}" --stage render`);
rl?.close();
