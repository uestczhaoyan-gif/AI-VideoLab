import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadCatalog } from '../tools/catalog/validate.mjs';

const catalog = loadCatalog();
const recipes = catalog.recipes.filter((r) => r.runnable);

test('all local recipes expose an adapter, template, README and example', () => {
  assert.equal(recipes.length, 3);
  for (const recipe of recipes) {
    const base = path.join(ROOT, 'recipes', recipe.id);
    assert.ok(fs.existsSync(path.join(ROOT, recipe.adapter.entry)), recipe.id);
    assert.ok(fs.existsSync(path.join(base, 'README.md')), recipe.id);
    assert.ok(fs.existsSync(path.join(base, 'scene.template.html')), recipe.id);
    assert.ok(fs.existsSync(path.join(ROOT, 'examples', recipe.id, 'make-project.mjs')), recipe.id);
    const runner = fs.readFileSync(path.join(ROOT, recipe.adapter.entry), 'utf8');
    assert.ok(runner.includes('selection.recipe_id'), recipe.id);
    assert.ok(runner.includes(recipe.id), recipe.id);
    assert.ok(!/https?:\/\//.test(runner) || runner.includes('localhost'), `${recipe.id} should not call remote services`);
  }
});

test('explain-data example is explicitly labelled example data, not statistics', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples/explain-data/content.json'), 'utf8'));
  assert.equal(content.data_kind, 'example');
  assert.match(content.source, /示例数据/);
  assert.ok(content.chart.unit.length > 0);
  assert.ok(Array.isArray(content.chart.bars) && content.chart.bars.length >= 2 && content.chart.bars.length <= 6);
});

test('real-product requires user screenshots and never generates UI', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'recipes/real-product/README.md'), 'utf8');
  assert.match(readme, /真实截图/);
  assert.match(readme, /不生成 UI|不验证截图/);
  assert.ok(fs.existsSync(path.join(ROOT, 'examples/real-product/make-project.mjs')));
  assert.ok(!fs.existsSync(path.join(ROOT, 'examples/real-product/capture.mjs')));
});
