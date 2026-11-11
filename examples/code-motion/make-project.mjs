#!/usr/bin/env node
/**
 * Build a code-motion example project (brief + recipe selection + confirmation
 * gates). It does NOT confirm any gate and does NOT render: the brief and the
 * style frames must be reviewed by a human first.
 *
 * Usage: node examples/code-motion/make-project.mjs [--out .tmp/example-project.json]
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
  topic: '为什么 AI 视频需要一条统一的时间表',
  purpose: 'education',
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
  notes: '示例项目：验证 code-motion 本地半自动执行器。内容由导演脚本负责，机械检查不等于内容与声音验收。',
  audience: '对 AI 视频工作流感兴趣的创作者',
  prerequisites: '知道什么是分镜与时间轴',
  learningGoal: '理解画面、字幕与声音共用一条时间表的价值',
  depth: 'introductory',
  formulaPolicy: 'none',
  stylePreferences: '深色、克制的代码动效，不做生成式素材',
  resourcePolicy: 'current_cli_local',
  availableTools: 'Chrome/Edge、ffmpeg、Playwright',
  resourceNotes: '本地执行，无外部服务',
  maxWait: '15',
  selectionReason: '短动效 + 明确时间表，是 code-motion recipe 的代表任务',
  acceptance: '规格、帧数与确定性可机械核对；内容、声音与完整观看由人确认',
};

const project = assertProject({ ...buildPlan(catalog, form, null, 'code-motion', 'current_cli'), project_id: 'example-code-motion' });
const out = path.resolve(values.out ?? path.join(ROOT, '.tmp/recipe-runs/example-code-motion/project.json'));
fs.mkdirSync(path.dirname(out), { recursive: true });
if (fs.existsSync(out)) throw new Error(`目标已存在，拒绝覆盖：${out}`);
fs.writeFileSync(out, JSON.stringify(project, null, 2) + '\n');
console.log(`已写入 ${path.relative(ROOT, out).replaceAll('\\', '/') || out}（项目 v${project.revision}，确认门均为 pending）。`);
console.log(`下一步：\n  node tools/project/cli.mjs gate --from "${path.relative(ROOT, out)}" --id brief --basis "已核对示例 Brief" --out .tmp/recipe-runs/example-code-motion/project-brief.json\n  node recipes/code-motion/run.mjs --project .tmp/recipe-runs/example-code-motion/project-brief.json --content examples/code-motion/content.json --stage stills`);
