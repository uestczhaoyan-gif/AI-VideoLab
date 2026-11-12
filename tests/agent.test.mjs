import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '.tmp/agent-plan-test');

test('make creates an Agent task and does not render a video', () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const result = spawnSync(process.execPath, ['tools/agent/plan.mjs', '--topic', '做一个非线性光学的视频', '--duration', '5', '--yes', '--out', OUT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  for (const name of ['AGENT_TASK.md', 'BRIEF.md', 'RESOURCES.md', 'video.json', 'project.json']) {
    assert.ok(fs.existsSync(path.join(OUT, name)), `${name} missing`);
  }
  assert.ok(!fs.existsSync(path.join(OUT, 'code-motion.mp4')), 'make must not render');
  const video = JSON.parse(fs.readFileSync(path.join(OUT, 'video.json'), 'utf8'));
  assert.equal(video.duration, 5);
  assert.equal(video.fps, 30);
  const task = fs.readFileSync(path.join(OUT, 'AGENT_TASK.md'), 'utf8');
  assert.match(task, /从零写/);
  assert.match(task, /render:agent/);
  fs.rmSync(OUT, { recursive: true, force: true });
});

test('render harness is separate from code generation', () => {
  const result = spawnSync(process.execPath, ['tools/agent/render.mjs', '--help'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /只做逐帧抓取/);
});
