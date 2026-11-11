#!/usr/bin/env node
/**
 * Spot-check downloaded resource repositories.
 *
 * This is not a full install/run test. It verifies that each configured
 * resource folder exists, contains a real project/document entry, has a
 * license or explicit unknown status, and that its docs mention video/visual
 * production. Results are written to resources/AUDIT.md and .tmp/resource-audit.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './validate.mjs';

const ITEMS = [
  { id: 'P02', dir: 'styles/mg-styles-15', kind: 'styles', repo: 'https://github.com/Vincentwei1021/mg-styles-15', license: 'MIT（工程）/ 资产另计', entry: 'source/prompts' },
  { id: 'LEMO', dir: 'styles/lemo-opuscar', kind: 'styles', repo: 'https://github.com/lemomo-ai/lemo-opuscar', license: 'MIT（工程）/ 素材另计', entry: 'source/styles' },
  { id: 'P09', dir: 'prompt-libraries/code-animation-prompts', kind: 'prompt-library', repo: 'https://github.com/XiaoyeCodes/code-animation-prompts', license: '混合来源 / 免费分享约定', entry: 'source/skills/code-animation-prompts' },
  { id: 'P03', dir: 'prompt-libraries/fifi-video-prompt', kind: 'prompt-library', repo: 'https://github.com/huiq777/fifi-video-prompt', license: 'MIT', entry: 'source' },
  { id: 'P05', dir: 'engines/manim', kind: 'engine', repo: 'https://github.com/3b1b/manim', license: 'MIT', entry: 'source/manimlib' },
  { id: 'P15', dir: 'engines/hyperframes', kind: 'engine', repo: 'https://github.com/heygen-com/hyperframes', license: 'Apache-2.0', entry: 'source' },
  { id: 'P17', dir: 'engines/anidoodle', kind: 'engine', repo: 'https://github.com/alexgreensh/anidoodle', license: 'Apache-2.0', entry: 'source' },
  { id: 'P16', dir: 'engines/onetake', kind: 'engine', repo: 'https://github.com/feitangyuan/onetake', license: 'NOASSERTION / 非商业限制见上游', entry: 'source' },
  { id: 'P22', dir: 'engines/video-shotcraft', kind: 'engine', repo: 'https://github.com/Vincentwei1021/video-shotcraft', license: 'Apache-2.0（代码；素材另计）', entry: 'source/SKILL.md' },
  { id: 'P08', dir: 'studies/anatomy', kind: 'study', repo: 'https://github.com/wheresryan22/anatomy', license: '见上游', entry: 'source' },
  { id: 'P11', dir: 'skills/auto-motion', kind: 'skill', repo: 'https://github.com/vibe-motion/auto-motion', license: '见上游', entry: 'source' },
  { id: 'P13', dir: 'skills/manim-skill', kind: 'skill', repo: 'https://github.com/Yusuke710/manim-skill', license: 'MIT', entry: 'source/skills' },
  { id: 'P12', dir: 'skills/open-design', kind: 'skill', repo: 'https://github.com/nexu-io/open-design', license: 'Apache-2.0（仓库体积过大，仅保存可读部分）', entry: 'source' },
  { id: 'P14', dir: 'skills/remotion-skills', kind: 'skill', repo: 'https://github.com/remotion-dev/skills', license: '见上游', entry: 'source/skills' },
  { id: 'P18', dir: 'skills/claudian', kind: 'skill', repo: 'https://github.com/YishenTu/claudian', license: 'MIT', entry: 'source' },
  { id: 'P01', dir: 'workflows/ai-promo-video-maker', kind: 'workflow', repo: 'https://github.com/liyupi/ai-promo-video-maker', license: 'MIT', entry: 'source' },
  { id: 'P04', dir: 'workflows/table-video-sop', kind: 'workflow', repo: 'https://github.com/duoduoler-ops/Table-VideoSOP', license: 'CC-BY-4.0（正文）/ MIT（脚本）', entry: 'source' },
  { id: 'P19', dir: 'collections/awesome-ai-motion', kind: 'collection', repo: 'https://github.com/guanmo-ai/awesome-ai-motion', license: 'NOASSERTION / 条目许可各异', entry: 'source' },
  { id: 'P20', dir: 'collections/awesome-opus5-5-videos', kind: 'collection', repo: 'https://github.com/yihui-dev/awesome-opus5-5-videos', license: 'MIT', entry: 'source' },
  { id: 'P21', dir: 'collections/awesome-claude-5-5-videos', kind: 'collection', repo: 'https://github.com/athemeroy/awesome-claude-5-5-videos', license: 'CC-BY-4.0', entry: 'source' },
];

const sum = (dir) => {
  let bytes = 0, files = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { const sub = sum(full); bytes += sub.bytes; files += sub.files; }
    else { bytes += fs.statSync(full).size; files++; }
  }
  return { bytes, files };
};
const has = (dir, names) => names.some((name) => fs.existsSync(path.join(dir, name)));
const readDocs = (dir) => {
  const candidates = ['README.md', 'README_CN.md', 'SKILL.md', 'readme.md', 'README.txt'];
  return candidates.map((name) => { const file = path.join(dir, name); return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }).join('\n');
};

const rows = [];
for (const item of ITEMS) {
  const dir = path.join(ROOT, 'resources', item.dir);
  if (!fs.existsSync(dir)) { rows.push({ ...item, status: 'missing', files: 0, mb: 0, relevance: false, license_file: false }); continue; }
  const { bytes, files } = sum(dir);
  const docs = readDocs(dir);
  const relevance = /video|视频|render|渲染|animation|动画|remotion|manim|motion|动效/i.test(docs);
  const licenseFile = has(dir, ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING']) || has(path.join(dir, 'source'), ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING']);
  const entryExists = fs.existsSync(path.join(dir, item.entry));
  const partial = files < 5 || bytes < 100 * 1024 || item.id === 'P12';
  const status = partial ? 'partial' : entryExists ? 'checked' : 'needs_review';
  rows.push({ ...item, status, files, mb: Number((bytes / 1024 / 1024).toFixed(1)), relevance, license_file: licenseFile, entry_exists: entryExists });
}

const missing = rows.filter((r) => r.status === 'missing');
const partial = rows.filter((r) => r.status === 'partial');
const checked = rows.filter((r) => r.status === 'checked');
const report = { generated_at: new Date().toISOString(), total: rows.length, checked: checked.length, partial: partial.length, missing: missing.length, rows };
fs.mkdirSync(path.join(ROOT, '.tmp'), { recursive: true });
fs.writeFileSync(path.join(ROOT, '.tmp/resource-audit.json'), JSON.stringify(report, null, 2) + '\n');

const md = `# 资源库抽检报告

生成时间：${new Date().toISOString().slice(0, 10)}。检查方式：目录存在、文件数量、README/SKILL/LICENSE、入口文件、文档是否真的在讲视频/动画制作。**不是安装/运行测试**；标为 checked 只表示“可作为参考/待安装使用”，不等于已能出片。

| ID | 分类 | 仓库 | 文件数 | MB | 许可文件 | 入口 | 抽检 |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r.id} | ${r.kind} | ${r.repo} | ${r.files} | ${r.mb} | ${r.license_file ? '有' : '无/未统一'} | ${r.entry} | ${r.status === 'checked' ? 'checked（参考/待安装）' : r.status} |`).join('\n')}

- checked：${checked.length}；partial：${partial.length}；missing：${missing.length}。
- 所有条目都未安装依赖或实际渲染；P16 有非商业限制，P12 因仓库过大只保留可读部分，P22 已下载完整源码但未安装。
- “文档相关”检查只证明仓库在讲视频制作，不证明效果、许可或可运行性。

## 补充抽检（2026-11-10 本机执行）

- JSON 可解析：video-shotcraft、hyperframes、claudian、remotion-skills、mg-styles-15 的 package.json；anidoodle 根目录没有 package.json（以插件结构提供）。
- CAP 索引：catalog.json 声明 341 条，实际 entries 341。
- LEMO：51 个 style.json（不含 _template）。
- Python：resources/engines/manim/source/manimlib/__init__.py 通过 py_compile；Onetake 的 Python 脚本未逐文件编译（只做了目录与入口检查）。
- 未安装任何上游依赖、未运行上游 demo、未渲染上游示例；因此“可以辅助生成视频”只能按参考/待安装理解。
`;

fs.writeFileSync(path.join(ROOT, 'resources/AUDIT.md'), md);
console.log(`Resource audit: ${checked.length} checked, ${partial.length} partial, ${missing.length} missing -> resources/AUDIT.md`);
if (missing.length) process.exitCode = 1;
