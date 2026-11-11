import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadCatalog } from '../tools/catalog/validate.mjs';
import { buildIntegration, validateIntegration, recommendRoute, accessSummary } from '../tools/catalog/integration.mjs';

const catalog = loadCatalog();
const integration = buildIntegration(catalog);

test('integration registry covers every catalog source and validates', () => {
  assert.deepEqual(validateIntegration(catalog, integration), []);
  assert.equal(integration.routes.length, 3);
  assert.equal(integration.resources.length, catalog.sources.length);
  assert.deepEqual(new Set(integration.resources.map((r) => r.source_id)), new Set(catalog.sources.map((s) => s.id)));
  const saved = JSON.parse(fs.readFileSync('catalog/integration.json', 'utf8'));
  assert.deepEqual(saved, integration, 'catalog/integration.json is stale; run npm run integration:build');
});

test('every route points at a runnable recipe and a real adapter', () => {
  for (const route of integration.routes) {
    assert.ok(route.recipe?.runnable, route.id);
    assert.ok(route.executor.entry && fs.existsSync(route.executor.entry), route.id);
    assert.equal(route.executor.status, 'verified', route.id);
    for (const resource of route.resources) assert.ok(catalog.sources.some((s) => s.id === resource.source_id), `${route.id}:${resource.source_id}`);
  }
  const summary = accessSummary(catalog);
  assert.ok(summary.byAccess.install_required >= 10);
  assert.ok(summary.promptEntries >= 341);
});

test('route recommendation follows purpose and topic signals', () => {
  assert.equal(recommendRoute(catalog, { topic: '数据图表解释', purpose: 'education' }).route.id, 'explain-data');
  assert.equal(recommendRoute(catalog, { topic: '产品功能截图演示', purpose: 'product' }).route.id, 'real-product');
  assert.equal(recommendRoute(catalog, { topic: '做一段片头动效', purpose: 'motion' }).route.id, 'code-motion');
  assert.equal(recommendRoute(catalog, { topic: '产品宣传片', purpose: 'motion' }).route.id, 'real-product');
});

test('idea recommendation maps plain language to purpose and recipe', async () => {
  const { recommendIntent } = await import('../shared/planning.mjs');
  assert.deepEqual(recommendIntent('用三个数据指标解释缓存为什么快'), { purpose: 'education', recipe: 'explain-data', reason: '包含数据/机制/科普信号，适合固定数据图解' });
  assert.equal(recommendIntent('给产品做一支 30 秒界面演示').recipe, 'real-product');
  assert.equal(recommendIntent('做一段片头动效').recipe, 'code-motion');
  assert.equal(recommendIntent('讲一个故事').purpose, 'story');
});
