#!/usr/bin/env node
/**
 * Build an explain-data example project (brief + recipe selection + confirmation
 * gates). It does NOT confirm any gate and does NOT render: the brief and the
 * style frames must be reviewed by a human first.
 *
 * The content in content.json is EXAMPLE DATA, not a real statistic. Neither the
 * script nor the recipe claims otherwise.
 *
 * Usage: node examples/explain-data/make-project.mjs [--out .tmp/explain-data/example-explain-data/project.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { buildPlan } from '../../shared/planning.mjs';
import { assertProject } from '../../shared/project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/catalog.json'), 'utf8'));
const { values } = parseArgs({ options: { out: { type: 'string' } } });

const form = {
  topic: '示例数据：四个指标条如何随时间增长',
  purpose: 'data',
  duration: '10',
  durationMin: '10',
  durationMax: '10',
  aspect: '16:9',
  resolution: '720p',
  fps: '30',
  language: 'zh-CN',
  narration: 'none',
  subtitles: false,
  bgm: 'none',
  budget: '',
  currency: 'CNY',
  usage: 'personal',
  notes: '示例项目：验证 explain-data 本地半自动执行器。content.json 中的数字是「示例数据，不是真实统计」，不得当作事实引用；机械检查不等于内容、声音与观看验收。',
  audience: '需要看懂一张指标图表的普通观众',
  prerequisites: '知道条形图的基本读法',
  learningGoal: '理解「单位与口径不同，数字不能直接比较」，并看到一条可从数据到画面的本地链路',
  depth: 'introductory',
  formulaPolicy: 'none',
  stylePreferences: '深色、克制的数据解释风；单一强调色 + 清晰单位与来源脚注；不做生成式素材',
  resourcePolicy: 'current_cli_local',
  availableTools: 'Chrome/Edge、ffmpeg、Playwright',
  resourceNotes: '本地执行，无外部服务、无付费调用、无素材下载',
  maxWait: '15',
  selectionReason: '科普／数据解释是 explain-data recipe 的代表任务：固定图表 + 单位 + 来源脚注 + 结尾要点',
  acceptance: '规格、帧数与确定性可机械核对；内容真实性、主观声音与完整观看仍需人工确认（示例数据不是真实统计）',
};

const project = assertProject({ ...buildPlan(catalog, form, null, 'explain-data', 'current_cli'), project_id: 'example-explain-data' });
const out = path.resolve(values.out ?? path.join(ROOT, '.tmp/explain-data', 'example-explain-data', 'project.json'));
fs.mkdirSync(path.dirname(out), { recursive: true });
if (fs.existsSync(out)) throw new Error(`目标已存在，拒绝覆盖：${out}`);
fs.writeFileSync(out, JSON.stringify(project, null, 2) + '\n');
const rel = (file) => path.relative(ROOT, file).replaceAll('\\', '/') || file;
console.log(`已写入 ${rel(out)}（项目 v${project.revision}，recipe=${project.selection.recipe_id}@${project.selection.recipe_revision}，确认门均为 pending）。`);
console.log(`示例数据说明：content.json 的数字是「示例数据，不是真实统计」。`);
console.log(`下一步：\n  node tools/project/cli.mjs gate --from "${rel(out)}" --id brief --basis "已核对示例 Brief 与数据边界" --out .tmp/explain-data/example-explain-data/project-brief.json\n  node recipes/explain-data/run.mjs --project .tmp/explain-data/example-explain-data/project-brief.json --content examples/explain-data/content.json --stage stills`);
