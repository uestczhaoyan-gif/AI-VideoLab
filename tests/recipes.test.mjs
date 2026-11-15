import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createProject } from '../shared/project.mjs';
import { ROOT, loadCatalog } from '../tools/catalog/validate.mjs';

const catalog = loadCatalog();
const recipes = catalog.recipes.filter((r) => r.runnable);

test('all local recipes expose an adapter, template and README', () => {
  assert.equal(recipes.length, 3);
  for (const recipe of recipes) {
    const base = path.join(ROOT, 'recipes', recipe.id);
    assert.ok(fs.existsSync(path.join(ROOT, recipe.adapter.entry)), recipe.id);
    assert.ok(fs.existsSync(path.join(base, 'README.md')), recipe.id);
    assert.ok(fs.existsSync(path.join(base, 'scene.template.html')), recipe.id);
    const runner = fs.readFileSync(path.join(ROOT, recipe.adapter.entry), 'utf8');
    assert.ok(runner.includes('selection.recipe_id'), recipe.id);
    assert.ok(runner.includes(recipe.id), recipe.id);
    assert.ok(!/https?:\/\//.test(runner) || runner.includes('localhost'), `${recipe.id} should not call remote services`);
  }
});

function checkRecipeInput(t, id, content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'videolab-recipe-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const adapter = recipes.find((recipe) => recipe.id === id);
  const project = createProject({ topic: '输入校验', duration_seconds: 10, fps: 30 });
  Object.assign(project.selection, { recipe_id: id, recipe_revision: adapter.revision });
  const projectFile = path.join(dir, 'project.json');
  const contentFile = path.join(dir, 'content.json');
  fs.writeFileSync(projectFile, JSON.stringify(project));
  fs.writeFileSync(contentFile, JSON.stringify({ title: '输入校验', duration: 10, fps: 30, ...content }));
  return spawnSync(process.execPath, [adapter.adapter.entry, '--project', projectFile, '--content', contentFile], { cwd: ROOT, encoding: 'utf8' });
}

test('explain-data rejects synthetic data advertised as statistics', (t) => {
  const result = checkRecipeInput(t, 'explain-data', {
    subtitle: '输入校验', source: '未标注数据性质的来源', takeaway: '输入校验', data_kind: 'example',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /source 必须明确写「示例数据」/);
});

test('real-product requires user screenshots and never generates UI', (t) => {
  const readme = fs.readFileSync(path.join(ROOT, 'recipes/real-product/README.md'), 'utf8');
  assert.match(readme, /真实截图/);
  assert.match(readme, /不生成 UI|不验证截图/);
  const result = checkRecipeInput(t, 'real-product', { scenes: [{ title: '场景一' }, { title: '场景二' }] });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /scenes\[0\]\.image 不能为空/);
});
