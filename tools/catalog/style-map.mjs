#!/usr/bin/env node
/**
 * Build the style → prompt → workflow map.
 *
 * The map is a routing aid, not a claim that every template is executable:
 *   - prompt_path: where the detailed prompt/spec lives after resources:fetch
 *   - workflow_ids: recommended VIDEO_WORKFLOWS sections (Vxx)
 *   - execution: auto_style (wired into code-motion), prompt_reference, or resource_reference
 *
 *   node tools/catalog/style-map.mjs --build
 *   node tools/catalog/style-map.mjs --check
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadCatalog } from './validate.mjs';

const catalog = loadCatalog();
const MAP_FILE = path.join(ROOT, 'catalog/template-map.json');
const MD_FILE = path.join(ROOT, 'docs/library/TEMPLATE_MAP.md');

// Suggested mappings. V06/V11 = 341-style code animation; V14 = shot language;
// V04/V06 = aesthetic + deterministic code motion. These are routing hints, not proof of execution.
const SOURCE_WORKFLOWS = {
  P01: ['V01', 'V05'], P02: ['V06', 'V11'], P03: ['V06', 'V11'], P04: ['V05'],
  P05: ['V07', 'V10'], P06: ['V07'], P07: ['V10'], P08: ['V03', 'V07'],
  P09: ['V06', 'V11'], P10: ['V08'], P11: ['V09', 'V12'], P12: ['V09', 'V13'],
  P13: ['V07', 'V10'], P14: ['V10'], P15: ['V12', 'V14'], P16: ['V08'],
  P17: ['V03'], P18: ['V08', 'V13'], P19: ['V02', 'V03'], P20: ['V02', 'V03'],
  P21: ['V02', 'V03'], P22: ['V14'], P23: ['V14'], LEMO: ['V04', 'V06'],
};
const AUTO_STYLES = {}; // Agent-led: no fixed executable styles.
const NOTES = {
  P09: '341 条风格 Prompt；Agent 先选 1–3 条读，再为本次视频重写代码，不一次性全读。',
  P02: '15 条 MG 风格 Prompt + demo；Agent 按 Brief 读取，不预置固定适配器。',
  LEMO: '51 个风格 STYLE/DEMO；Agent 按 Brief 读取，不预置固定适配器。',
  P22: '125 张镜头卡 + Remotion 实现；作为镜头语言参考，不是 124 个自动执行器。',
};

function promptFor(t) {
  const candidates = [];
  if (t.source_id === 'LEMO') candidates.push(`resources/prompts/lemo/${t.upstream_id}/STYLE.md`);
  if (t.source_id === 'P02') candidates.push(`resources/prompts/mg/${t.upstream_id}.md`);
  candidates.push(t.reference_path);
  return candidates.find((p) => p && fs.existsSync(path.join(ROOT, p))) ?? t.reference_path;
}

const templates = catalog.templates.map((t) => ({
  id: t.id,
  name: t.name,
  source_id: t.source_id,
  collection: t.collection,
  category: t.category,
  kind: t.kind,
  prompt_path: promptFor(t),
  source_prompt_path: t.reference_path,
  project_path: t.project_path,
  workflow_ids: SOURCE_WORKFLOWS[t.source_id] ?? [],
  recipe_ids: t.recipe_ids,
  runnable: t.runnable,
  execution: t.kind === 'prompt' ? 'prompt_reference' : 'resource_reference',
  cli_style: AUTO_STYLES[t.id] ?? null,
  license: t.license?.label ?? 'unknown',
}));

const sources = catalog.sources.map((s) => {
  const count = templates.filter((t) => t.source_id === s.id).length;
  return { id: s.id, title: s.title, revision: s.revision, template_count: count, workflow_ids: SOURCE_WORKFLOWS[s.id] ?? [], note: NOTES[s.id] ?? '' };
});
const map = {
  schema_version: 1,
  generated_at: '2026-11-11',
  note: '路由辅助，不是执行证明。Agent-led：所有模板都是参考资料，由 Agent 读 Prompt 后从零写代码，没有固定执行风格。',
  auto_styles: AUTO_STYLES,
  sources,
  templates,
};
const json = JSON.stringify(map, null, 2) + '\n';

const cell = (s) => String(s ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
const bySource = new Map();
for (const t of templates) { if (!bySource.has(t.source_id)) bySource.set(t.source_id, []); bySource.get(t.source_id).push(t); }
const sourceRows = sources.map((s) => `| ${s.id} | ${cell(s.title)} | ${s.template_count} | ${s.workflow_ids.join(' / ') || '—'} | ${cell(NOTES[s.id] || '—')} |`);
let md = `# 模板 → Prompt → Workflow 对照表

生成文件，请勿手改；重建命令：

\`\`\`sh
npm run catalog:map
\`\`\`

机器可读版本：[catalog/template-map.json](../../catalog/template-map.json)。这是**路由辅助**，不是执行证明：Agent-led 主流程不预置固定风格，所有模板由 Agent 读 Prompt 后重新实现。

## 来源总览

| 来源 | 名称 | 模板数 | 建议 Workflow | 说明 |
| --- | --- | ---: | --- | --- |
${sourceRows.join('\n')}

## 固定执行风格（已取消）

无。主流程由 Agent 从零写代码，不预置风格。

## 全部模板

> 410 行。所有模板都是 prompt_reference / resource_reference：Agent 读取后重新写代码；不存在“固定适配器”。

| ID | 名称 | 来源 | Prompt/规格 | Workflow | 执行 | recipe |
| --- | --- | --- | --- | --- | --- | --- |
${templates.map((t) => `| ${t.id} | ${cell(t.name)} | ${t.source_id} | \`${cell(t.prompt_path)}\` | ${t.workflow_ids.join(' / ') || '—'} | ${t.execution}${t.cli_style ? ` (\`${t.cli_style}\`)` : ''} | ${t.recipe_ids.join(' / ') || '—'} |`).join('\n')}
`;
if (process.argv.includes('--check')) {
  const current = fs.existsSync(MAP_FILE) ? fs.readFileSync(MAP_FILE, 'utf8') : '';
  const currentMd = fs.existsSync(MD_FILE) ? fs.readFileSync(MD_FILE, 'utf8') : '';
  if (current !== json || currentMd !== md) { console.error('template map is stale; run npm run catalog:map'); process.exitCode = 1; }
  else console.log(`template map OK: ${templates.length} templates, ${sources.length} sources`);
} else {
  fs.writeFileSync(MAP_FILE, json);
  fs.writeFileSync(MD_FILE, md);
  console.log(`wrote catalog/template-map.json and docs/library/TEMPLATE_MAP.md (${templates.length} templates)`);
}
