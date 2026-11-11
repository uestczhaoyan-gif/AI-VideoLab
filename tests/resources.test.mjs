import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('three style templates and resource docs are present', () => {
  for (const style of ['blueprint', 'bauhaus', 'ink-wash']) {
    const file = path.join(ROOT, 'recipes/code-motion/styles', `${style}.html`);
    assert.ok(fs.existsSync(file), `${style} template missing`);
    assert.match(fs.readFileSync(file, 'utf8'), /window\.render/);
  }
  assert.ok(fs.existsSync(path.join(ROOT, 'resources/MANIFEST.json')));
  assert.ok(fs.existsSync(path.join(ROOT, 'resources/PACKS.md')));
});

test('resource manifest stays in sync with the pinned folders', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/MANIFEST.json'), 'utf8'));
  assert.equal(manifest.items.length, 20);
  for (const item of manifest.items) {
    assert.match(item.revision, /^[0-9a-f]{40}$/);
    if (fs.existsSync(path.join(ROOT, 'resources'))) {
      // Local snapshots are gitignored; CI has the manifest but not the 2.1 GB payload.
      if (fs.existsSync(path.join(ROOT, item.local_path))) assert.ok(fs.statSync(path.join(ROOT, item.local_path)).isDirectory());
    }
  }
});

test('style -> prompt -> workflow map covers all templates', () => {
  const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/template-map.json'), 'utf8'));
  assert.equal(map.templates.length, 410);
  assert.equal(map.sources.length, 38);
  const auto = map.templates.filter((t) => t.execution === 'auto_style');
  assert.deepEqual(auto.map((t) => t.cli_style).sort(), ['bauhaus', 'blueprint', 'ink-wash']);
  for (const t of map.templates) {
    assert.ok(t.prompt_path, `${t.id} has no prompt path`);
    assert.ok(Array.isArray(t.workflow_ids), `${t.id} has no workflow mapping`);
  }
});
