#!/usr/bin/env node
/**
 * Route one idea to a recipe + resource pack + executor command.
 *
 * Usage:
 *   node tools/catalog/route.mjs --topic "讲清产品三个功能" --purpose product
 *   node tools/catalog/route.mjs --check
 *   node tools/catalog/route.mjs --topic "..." --json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ROOT, loadCatalog } from './validate.mjs';
import { buildIntegration, recommendRoute, validateIntegration, accessSummary, INTEGRATION_PATH } from './integration.mjs';

const { values } = parseArgs({ options: {
  topic: { type: 'string', default: '' },
  purpose: { type: 'string', default: '' },
  check: { type: 'boolean', default: false },
  json: { type: 'boolean', default: false },
} });

const catalog = loadCatalog();
const integration = buildIntegration(catalog);
const errors = validateIntegration(catalog, integration);

if (values.check) {
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
        console.log(`Access: ${JSON.stringify(summary.byAccess)}; prompt-usable entries: ${promptEntries}.`);
        console.log('Verified local executors: ' + integration.routes.filter((r) => r.executor.status === 'verified').map((r) => `${r.id} (${r.executor.entry})`).join(', '));
        console.log('Not executable via integration: install_required/index_only/reference resources stay explicit; no pretence of calling them.');
      }
    }
  }
} else {
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
    console.log(`示例：${route.executor.example}`);
    console.log('资源包：');
    for (const r of route.resources) console.log(`- ${r.source_id} [${r.access}/${r.role}]`);
    console.log(`限制：${route.limits.join('；')}`);
    console.log(`备选：${alternatives.join('、')}`);
  }
}
