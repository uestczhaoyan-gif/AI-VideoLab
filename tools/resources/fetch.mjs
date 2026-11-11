#!/usr/bin/env node
/**
 * Restore the pinned resource repositories into resources/<category>/<name>/source/.
 *
 * The snapshots are intentionally not committed (about 2.1 GB). This script uses
 * GitHub's codeload archive for the exact revision in resources/MANIFEST.json.
 *
 *   npm run resources:fetch -- --dry-run
 *   npm run resources:fetch -- --only P05,P13
 *   npm run resources:fetch -- --only P22 --force
 *
 * P12 (Open Design) is partial and skipped unless --include-partial is passed;
 * a full checkout is several GB.
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { spawnSync } from 'node:child_process';
import { ROOT } from '../catalog/validate.mjs';

const args = process.argv.slice(2);
const has = (name) => args.includes(name);
const opt = (name, fallback = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] ?? fallback : fallback; };
const only = new Set(String(opt('--only', '')).split(',').map((s) => s.trim()).filter(Boolean));
const dryRun = has('--dry-run');
const force = has('--force');
const includePartial = has('--include-partial');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/MANIFEST.json'), 'utf8'));

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 8) return reject(new Error('too many redirects'));
    https.get(url, { headers: { 'User-Agent': 'VideoLab-resource-fetch' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(download(new URL(res.headers.location, url).toString(), dest, redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode} ${url}`)); }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(() => resolve(dest)));
      out.on('error', reject);
    }).on('error', reject);
  });
}

function extract(zip, target) {
  const tmp = path.join(ROOT, '.tmp/resources/extract-' + path.basename(zip, '.zip'));
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const command = process.platform === 'win32'
    ? ['powershell', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${tmp}' -Force`]]
    : ['unzip', ['-q', '-o', zip, '-d', tmp]];
  const result = spawnSync(command[0], command[1], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`解压失败：${zip}；可手动从上游 zip 解压到 ${target}`);
  const entries = fs.readdirSync(tmp, { withFileTypes: true }).filter((e) => e.isDirectory());
  const root = entries.length === 1 ? path.join(tmp, entries[0].name) : tmp;
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(root, target, { recursive: true });
  fs.rmSync(tmp, { recursive: true, force: true });
}

const selected = manifest.items.filter((item) => (only.size ? only.has(item.id) : true) && (includePartial || item.fetch !== false));
if (!selected.length) {
  console.error('没有匹配的资源；用 --only P05,P13 选择，或 --include-partial 包含 P12。');
  process.exit(1);
}
for (const item of selected) {
  const dest = path.join(ROOT, item.local_path);
  if (item.repo.startsWith('https://guanmo-ai.github.io/')) continue;
  const zip = path.join(ROOT, '.tmp/resources', `${item.id}.zip`);
  const repoPath = new URL(item.repo).pathname.replace(/^\/|\/$/g, '');
  const url = `https://codeload.github.com/${repoPath}/zip/${item.revision}`;
  if (dryRun) { console.log(`${item.id}\t${url}\t-> ${item.local_path}`); continue; }
  if (fs.existsSync(dest) && !force) { console.log(`${item.id}\t已存在，跳过（--force 覆盖）`); continue; }
  console.log(`${item.id}\t下载 ${url}`);
  try {
    await download(url, zip);
    extract(zip, dest);
    fs.rmSync(zip, { force: true });
    console.log(`${item.id}\tok ${item.local_path}`);
  } catch (error) {
    console.error(`${item.id}\t失败：${error.message}\n  手动恢复：${item.repo} @ ${item.revision}`);
    process.exitCode = 1;
  }
}
console.log('完成；资源仍受上游许可约束，不因本地存在而可再分发。');
