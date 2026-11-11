import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadCatalog, validateCatalog, safeRelative, ROOT } from '../tools/catalog/validate.mjs';
import { fingerprint, verifySnapshot } from '../tools/catalog/fingerprint.mjs';
import { filterTemplates, recommendRecipes, recommendTemplates, buildPlan, planMarkdown } from '../shared/planning.mjs';

const catalog = loadCatalog();
const baseBrief = { topic: '介绍四季与地轴倾角', purpose: 'education', duration: 30, aspect: '16:9', resolution: '1080p', fps: '30', language: 'zh-CN', narration: 'none', bgm: 'none', subtitles: true, budget: '', currency: 'CNY', usage: 'personal' };
const plan = (input = baseBrief, tier = 'budget', id = 'lemo-one-line') => buildPlan(catalog, input, id, 'code-motion', tier);

test('catalog counts, boundaries and unresolved metadata remain explicit', () => {
  assert.equal(catalog.sources.length, 38);
  assert.equal(catalog.templates.length, 410);
  assert.equal(catalog.templates.filter((t) => t.collection === 'CAP').length, 341);
  assert.equal(catalog.templates.filter((t) => t.name.startsWith('未命名条目')).length, 8);
  assert.equal(catalog.templates.filter((t) => t.collection === 'LOCAL').length, 0);
  assert.equal(catalog.models.length, 1);
  assert.equal(catalog.models[0].model_id, 'deepseek-v4.1-flash');
  assert.equal(catalog.models[0].verification, 'user_designated_unverified');
  assert.equal(catalog.models[0].price_status, 'unknown');
  assert.ok(catalog.templates.every((t) => !t.runnable));
  const expected = {
    'code-motion': 'recipes/code-motion/run.mjs',
    'explain-data': 'recipes/explain-data/run.mjs',
    'real-product': 'recipes/real-product/run.mjs',
  };
  for (const [id, entry] of Object.entries(expected)) {
    const recipe = catalog.recipes.find((r) => r.id === id);
    assert.ok(recipe, id);
    assert.equal(recipe.runnable, true, id);
    assert.equal(recipe.status, 'local_adapted', id);
    assert.equal(recipe.adapter.entry, entry, id);
    assert.equal(recipe.adapter.status, 'local_only', id);
    assert.equal(recipe.adapter.director_model, 'deepseek-v4.1-flash', id);
  }
  assert.equal(catalog.recipes.length, 3);
  assert.equal(catalog.templates.find((t) => t.id === 'tool-onetake').license.commercial, 'restricted');
});

test('schema rejects duplicate IDs, dangling references, unsafe paths and false capabilities', () => {
  for (const mutate of [
    (c) => c.templates.push(c.templates[0]),
    (c) => { c.templates[0].revision = 'incorrect-revision'; },
    (c) => { c.templates[0].source_id = 'MISSING'; },
    (c) => { c.templates[0].related_ids = ['missing']; },
    (c) => { c.templates[0].recipe_ids = ['missing']; },
    (c) => { c.templates[0].reference_path = '../secret.md'; },
    (c) => { c.templates[0].preview = { kind: 'image', path: 'untrusted.html', scope: 'local_only' }; },
    (c) => { c.templates[0].runnable = true; },
    (c) => { c.templates[0].unrecognized = true; },
    (c) => { c.recipes.find((r) => r.id === 'code-motion').adapter.director_model = 'missing-model'; },
    (c) => { const r = c.recipes.find((x) => x.id === 'code-motion'); r.runnable = true; r.adapter = null; },
    (c) => { const r = c.recipes.find((x) => x.id === 'explain-data'); r.runnable = false; r.status = 'draft'; },
    (c) => { c.models.push(structuredClone(c.models[0])); },
  ]) { const copy = structuredClone(catalog); mutate(copy); assert.ok(validateCatalog(copy).length); }
  for (const p of ['../a', 'a/../b', '/a', 'C:/a', 'a\\b', 'a//b', 'file:///x', 'a\0b']) assert.equal(safeRelative(p), false);
  assert.equal(safeRelative('resources/目录/PROMPT.md'), true);
});

test('metadata overlap retains separate source and revision identities', () => {
  const first = catalog.templates.find((t) => t.id === 'mg-01-flat-vector');
  assert.ok(first.related_ids.includes('cap-v3'));
  assert.notEqual(first.revision, catalog.templates.find((t) => t.id === 'cap-v3').revision);
  assert.ok(catalog.templates.find((t) => t.id === 'lemo-one-line').related_ids.includes('cap-l21'));
});

test('timing and lineage express specs and same-source versions without inflating evidence', () => {
  const v10 = catalog.sources.find((s) => s.id === 'V10');
  assert.equal(v10.timing.frames, 1350);
  assert.equal(v10.timing.fps, 30);
  assert.equal(v10.timing.beat_frames, 14.0625);
  const v11 = catalog.sources.find((s) => s.id === 'V11');
  assert.equal(v11.lineage.evidence_role, 'new_version');
  assert.ok(v11.lineage.derived_from.includes('V06'));
  assert.equal(catalog.sources.find((s) => s.id === 'P09').lineage.evidence_role, 'packaging');
  assert.ok(catalog.sources.find((s) => s.id === 'V12').lineage.same_author.includes('V13'));
  // Same source chain (V06 / P09 / V11) must not be counted as three independent experiments.
  assert.ok(catalog.sources.filter((s) => s.lineage?.same_author?.includes('V11')).length >= 2);
});

test('timing and lineage are validated, not decorative', () => {
  const badTiming = structuredClone(catalog);
  badTiming.sources.find((s) => s.id === 'V10').timing.frames = 999;
  assert.ok(validateCatalog(badTiming).length);
  const badLineage = structuredClone(catalog);
  badLineage.sources.find((s) => s.id === 'V11').lineage.same_author.push('V99');
  assert.ok(validateCatalog(badLineage).some((e) => e.includes('V99')));
  const selfLineage = structuredClone(catalog);
  selfLineage.sources.find((s) => s.id === 'V11').lineage.derived_from.push('V11');
  assert.ok(validateCatalog(selfLineage).some((e) => e.includes('references itself')));
});

test('every local recipe points at real files, examples and a registered director model', () => {
  const examples = { 'code-motion': 'examples/code-motion/content.json', 'explain-data': 'examples/explain-data/content.json', 'real-product': 'examples/real-product/make-project.mjs' };
  for (const recipe of catalog.recipes.filter((r) => r.runnable)) {
    const entry = path.join(ROOT, recipe.adapter.entry);
    assert.ok(fs.existsSync(entry), `missing adapter entry ${recipe.adapter.entry}`);
    assert.ok(fs.existsSync(path.join(ROOT, examples[recipe.id])), `missing example for ${recipe.id}`);
    assert.ok(catalog.models.some((m) => m.id === recipe.adapter.director_model));
    const model = catalog.models.find((m) => m.id === recipe.adapter.director_model);
    assert.equal(model.verification, 'user_designated_unverified');
  }
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples/code-motion/content.json'), 'utf8'));
  assert.equal(content.duration, 10);
  assert.equal(content.fps, 30);
  assert.ok(Array.isArray(content.steps) && content.steps.length >= 2 && content.steps.length <= 5);
});

test('import is deterministic and does not remove entries with no snapshot', () => {
  const file = path.join(ROOT, 'catalog/catalog.json');
  for (const args of [[], [], ['--offline']]) {
    const before = fs.readFileSync(file, 'utf8');
    const result = spawnSync(process.execPath, ['tools/catalog/import.mjs', '--check', ...args], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(file, 'utf8'), before);
  }
});

test('changed pinned metadata cannot silently keep its version', () => {
  assert.throws(() => verifySnapshot('CAP', []), /Changed CAP snapshot/);
  assert.deepEqual(fingerprint([]), fingerprint([]));
});

test('search combines terms, filters and favorites; missing previews are not available', () => {
  const items = catalog.templates.map((t) => ({ ...t, availability: { preview: t.id === 'lemo-one-line' } }));
  assert.deepEqual(filterTemplates(items, { collection: 'LEMO', availableOnly: true }).map((t) => t.id), ['lemo-one-line']);
  assert.equal(filterTemplates(items, { query: 'no-such-style-123' }).length, 0);
  assert.equal(filterTemplates(items, { commercialOnly: true }).length, 0);
  assert.deepEqual(filterTemplates(items, { favoritesOnly: true, favorites: ['lemo-one-line'] }).map((t) => t.id), ['lemo-one-line']);
});

test('recommendations are deterministic candidates with reasons, not model claims', () => {
  const recommendations = recommendRecipes(catalog, 'education', catalog.templates.find((t) => t.id === 'lemo-one-line'));
  assert.equal(recommendations[0].id, 'code-motion');
  assert.ok(recommendations[0].reasons.includes('用途匹配'));
  assert.deepEqual(recommendTemplates(catalog, baseBrief), recommendTemplates(catalog, baseBrief));
  assert.ok(recommendTemplates(catalog, { ...baseBrief, purpose: 'product', usage: 'commercial' }, 500).every((t) => t.license.commercial !== 'restricted'));
});

test('tier selection never changes output requirements or turns unknown cost into zero', () => {
  const a = plan(baseBrief, 'budget'), b = plan(baseBrief, 'premium');
  assert.deepEqual(a.brief, b.brief);
  assert.notDeepEqual(a.stages, b.stages);
  assert.equal(a.cost.estimate, null);
  assert.equal(a.cost.budget_limit, null);
  assert.equal(a.execution_ready, false);
  assert.ok(a.stages.every((s) => s.model_id === null));
  const budget = plan({ ...baseBrief, budget: 50 });
  assert.equal(budget.cost.budget_limit, 50);
  assert.equal(budget.cost.estimate, null);
});

test('commercial use, missing files and sound generate blockers', () => {
  const p = plan({ ...baseBrief, usage: 'commercial', narration: 'tts', bgm: 'provided' }, 'budget', 'tool-onetake');
  assert.ok(p.blockers.some((b) => b.includes('不能执行商业制作')));
  assert.ok(p.blockers.some((b) => b.includes('缺少模板原始文件')));
  assert.ok(p.blockers.some((b) => b.includes('配音')));
  assert.ok(p.blockers.some((b) => b.includes('BGM')));
});

test('invalid briefs are rejected before saving or export', () => {
  for (const input of [{ topic: '' }, { duration: -1 }, { duration: 'Infinity' }, { budget: '-1' }, { aspect: 'huge' }, { purpose: 'undefined' }, { subtitles: 'true' }]) assert.throws(() => plan({ ...baseBrief, ...input }));
  assert.throws(() => plan(baseBrief, 'free'));
  assert.throws(() => plan(baseBrief, 'budget', 'missing'));
});

test('export preserves provenance, version, sound, constraints and unknown costs', () => {
  const p = plan({ ...baseBrief, notes: '必须保留地轴方向', narration: 'tts', bgm: 'library' });
  const text = planMarkdown(p);
  for (const expected of ['不能自动执行', '预计费用：未知', 'lemo-one-line', 'recipe', 'provider/model_id', '必须保留地轴方向', 'tts', 'library', '30 fps', '许可']) {
    if (expected === 'recipe') assert.ok(text.includes(p.selection.recipe_id)); else assert.ok(text.includes(expected), expected);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(p)), p);
  assert.equal(p.selection.template_revision, catalog.templates.find((t) => t.id === 'lemo-one-line').revision);
  assert.ok(p.sources.some((s) => s.id === p.selection.source_id));
  assert.ok(p.sources.some((s) => s.url?.startsWith('https://')));
});
