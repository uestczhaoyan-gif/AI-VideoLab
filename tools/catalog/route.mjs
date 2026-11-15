#!/usr/bin/env node
/**
 * Route a brief to a compatible style and workflow.
 *
 * Usage:
 *   node tools/catalog/route.mjs --topic "讲清产品三个功能" --purpose product
 *   node tools/catalog/route.mjs --check
 *   node tools/catalog/route.mjs --topic "..." --json
 */
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { loadCatalog } from './validate.mjs';
import { buildIntegration, recommendRoute, validateIntegration, accessSummary, INTEGRATION_PATH } from './integration.mjs';
import { loadWorkflowCatalog } from './workflows.mjs';
import { projectFromArgs, routingOptions } from './routing-input.mjs';
import { decideRoute } from '../../shared/routing.mjs';

const { values } = parseArgs({ options: {
  ...routingOptions,
  check: { type: 'boolean', default: false },
  json: { type: 'boolean', default: false },
  legacy: { type: 'boolean', default: false },
  help: { type: 'boolean', default: false },
} });

if (values.help) {
  console.log('npm run route -- --topic "主题" [--audience "受众"] [--context "使用场景"] [--duration 30] [--aspect 16:9] [--style "手绘"] [--json]\n旧 recipe 路由：--legacy');
  process.exit(0);
}
const catalog = loadCatalog();
const workflows = loadWorkflowCatalog(catalog);

if (values.check) {
  const integration = buildIntegration(catalog);
  const errors = validateIntegration(catalog, integration);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else {
    if (!fs.existsSync(INTEGRATION_PATH)) { console.error('catalog/integration.json missing; run npm run integration:build'); process.exitCode = 1; }
    else {
      const saved = JSON.parse(fs.readFileSync(INTEGRATION_PATH, 'utf8'));
      if (JSON.stringify(saved) !== JSON.stringify(integration)) { console.error('catalog/integration.json is stale; run npm run integration:build'); process.exitCode = 1; }
      else {
        const summary = accessSummary(catalog);
        const promptEntries = summary.promptEntries;
        console.log(`Integration valid: ${integration.routes.length} routes, ${summary.sources} sources, ${summary.templates} templates.`);
        console.log(`Workflow catalog valid: ${workflows.workflows.length} workflows, ${workflows.styles.length} styles.`);
        console.log(`Access: ${JSON.stringify(summary.byAccess)}; prompt-usable entries: ${promptEntries}.`);
        console.log('Verified local executors: ' + integration.routes.filter((r) => r.executor.status === 'verified').map((r) => `${r.id} (${r.executor.entry})`).join(', '));
        console.log('Not executable via integration: install_required/index_only/reference resources stay explicit; no pretence of calling them.');
      }
    }
  }
} else if (values.legacy) {
  const { route, alternatives } = recommendRoute(catalog, { topic: values.topic, purpose: values.purpose });
  const entry = route.executor.entry;
  const result = {
    topic: values.topic,
    purpose: values.purpose,
    route: route.id,
    recipe_revision: route.recipe?.revision ?? null,
    executor: route.executor,
    command: `node ${entry} --project <项目.json> --content <content.json> --stage render`,
    examples: route.executor.example,
    resources: route.resources,
    limits: route.limits,
    alternatives,
    note: 'install_required/index_only 资源只能作为参考或安装后使用；没有自动调用。',
  };
  if (values.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`想法：${values.topic || '（无）'}`);
    console.log(`推荐 route：${route.id}（recipe ${route.recipe?.revision}）`);
    console.log(`执行器：${entry} [${route.executor.status}]`);
    console.log(`命令：${result.command}`);
    console.log(`使用说明：${route.executor.example}`);
    console.log('资源包：');
    for (const r of route.resources) console.log(`- ${r.source_id} [${r.access}/${r.role}]`);
    console.log(`限制：${route.limits.join('；')}`);
    console.log(`备选：${alternatives.join('、')}`);
  }
} else {
  const project = projectFromArgs(values);
  const decision = decideRoute(project, workflows, {}, Date.now(), { agent: true });
  if (values.json) console.log(JSON.stringify({ brief: project.brief, decision }, null, 2));
  else {
    if (decision.selected) {
      for (const [index, candidate] of [decision.selected, ...decision.alternatives].entries()) {
        console.log(`${index ? '备选' : '推荐'}：${candidate.style} · ${candidate.workflow}`);
        console.log(candidate.reasons.join(' '));
        if (candidate.blockers.length) console.log(`待补：${candidate.blockers.join(' ')}`);
      }
    } else {
      console.log('没有满足条件的路线。');
      for (const reason of new Set(decision.excluded.flatMap((entry) => entry.reasons))) console.log(`- ${reason}`);
    }
    for (const question of decision.questions) console.log(question);
  }
}
