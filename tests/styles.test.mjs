import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recommendIntent } from '../shared/planning.mjs';
import { recommendResourceTemplates, recommendStyle } from '../shared/styles.mjs';
import { recommendRoute } from '../tools/catalog/integration.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/catalog.json'), 'utf8'));

test('nonlinear optics is a science explainer, not a data chart', () => {
  const intent = recommendIntent('做一个非线性光学的视频');
  assert.equal(intent.recipe, 'code-motion');
  assert.equal(intent.purpose, 'education');
  assert.equal(recommendRoute(catalog, { topic: '做一个非线性光学的视频', purpose: 'education' }).route.id, 'code-motion');
  assert.equal(recommendStyle('做一个非线性光学的视频', 'education').id, 'blueprint');
});

test('topic without a same-named template gets visual-language candidates, not a refusal', () => {
  const candidates = recommendResourceTemplates(catalog, '做一个非线性光学的视频', 3);
  assert.ok(candidates.length >= 1);
  assert.ok(candidates.some((c) => c.id === 'lemo-blueprint'));
  for (const candidate of candidates) assert.ok(fs.existsSync(path.join(ROOT, candidate.prompt_path)), candidate.prompt_path);
});

test('blueprint template has a nonlinear visual mode', () => {
  const html = fs.readFileSync(path.join(ROOT, 'recipes/code-motion/styles/blueprint.html'), 'utf8');
  assert.match(html, /nonlinearMode/);
  assert.match(html, /χ\(2\)/);
});
