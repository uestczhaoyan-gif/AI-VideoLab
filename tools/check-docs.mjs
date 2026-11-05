import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';
import { ROOT } from './catalog/validate.mjs';

const files = [...new Set(execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).split('\0').filter((p) => p.endsWith('.md') && fs.existsSync(path.join(ROOT, p))))];
const errors = [];
const optional = [];
const historical = [];
let checked = 0;
for (const file of files) {
  marked.walkTokens(marked.lexer(fs.readFileSync(path.join(ROOT, file), 'utf8')), (token) => {
    if (!['link', 'image'].includes(token.type)) return;
    const href = token.href;
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href)) return;
    let target;
    try { target = decodeURIComponent(href.split(/[?#]/)[0]); } catch { errors.push(`${file}: invalid URL ${href}`); return; }
    if (!target) return;
    checked++;
    const resolved = path.resolve(ROOT, path.dirname(file), target);
    if (fs.existsSync(resolved)) return;
    const relative = path.relative(ROOT, resolved).replaceAll('\\', '/');
    const message = `${file}: ${href}`;
    // 2026-11 清理把自制 demo 工程移出仓库；历史归档按当时路径保留原文，不强行改写。
    if (file.startsWith('docs/archive/')) historical.push(message);
    else if (/^(docs\/theory\/_(?:sources|evidence)\/|resources\/[^/]+\/source\/)/.test(relative)) optional.push(message);
    else errors.push(message);
  });
}
console.log(`Markdown: ${files.length} files, ${checked} relative file links; ${errors.length} missing required targets, ${optional.length} missing local-cache targets, ${historical.length} historical archive targets.`);
if (optional.length) console.log(`Optional local caches (restore by source note):\n${optional.join('\n')}`);
if (historical.length) console.log(`Historical archive links kept as recorded (docs/archive only):\n${historical.join('\n')}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
console.log('File targets only; external availability and heading fragments are not checked.');
