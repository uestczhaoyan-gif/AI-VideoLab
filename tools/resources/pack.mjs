#!/usr/bin/env node
/**
 * Build release-ready resource packs, one ZIP per category, each below 2 GB.
 * Upload the ZIPs as GitHub Release assets (not into the git tree).
 *
 *   npm run resources:pack
 *   npm run resources:pack -- --only engines,styles --out dist/resources
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from '../catalog/validate.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback = '') => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] ?? fallback : fallback; };
const only = new Set(String(opt('--only', '')).split(',').map((s) => s.trim()).filter(Boolean));
const outDir = path.resolve(ROOT, opt('--out', 'dist/resources'));
const categories = fs.readdirSync(path.join(ROOT, 'resources'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !['source', 'prompts', 'preview'].includes(e.name))
  .map((e) => e.name)
  .filter((name) => (only.size ? only.has(name) : true));
if (!categories.length) { console.error('没有匹配分类'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
for (const category of categories) {
  const src = path.join(ROOT, 'resources', category);
  const zip = path.join(outDir, `videolab-resources-${category}-${date}.zip`);
  fs.rmSync(zip, { force: true });
  const command = process.platform === 'win32'
    ? ['powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${src}' -DestinationPath '${zip}' -CompressionLevel Optimal -Force`]]
    : ['zip', ['-qr', zip, category]];
  console.log(`pack ${category} -> ${path.relative(ROOT, zip)}`);
  const result = spawnSync(command[0], command[1], { cwd: path.join(ROOT, 'resources'), stdio: 'inherit' });
  if (result.status !== 0) { console.error(`失败：${category}`); process.exitCode = 1; continue; }
  const mb = (fs.statSync(zip).size / 1024 / 1024).toFixed(1);
  console.log(`  ${mb} MB`);
}
console.log(`\nZIP 在 ${path.relative(ROOT, outDir)}/；每个 <2 GB，可作为 GitHub Release assets 上传，不要 git add。`);
