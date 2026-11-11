import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { recommendIntent } from '../shared/planning.mjs';

test('CLI studio exposes help and intent routing', () => {
  const result = spawnSync(process.execPath, ['tools/studio/create.mjs', '--help'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /npm run make/);
  assert.equal(recommendIntent('产品界面功能演示').recipe, 'real-product');
  assert.equal(recommendIntent('三个数据指标解释缓存').recipe, 'explain-data');
  assert.equal(recommendIntent('一段片头动效').recipe, 'code-motion');
});
