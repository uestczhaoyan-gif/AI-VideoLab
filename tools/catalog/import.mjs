import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { ROOT, validateCatalog, safeRelative } from './validate.mjs';
import { REVISIONS, LICENCES, MG_STYLES, RECIPES, MODELS } from './seed.mjs';
import { verifySnapshot } from './fingerprint.mjs';

const out = path.join(ROOT, 'catalog/catalog.json');
const previous = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null;
const localPath = (p) => path.join(ROOT, p);
const readJSON = (p) => JSON.parse(fs.readFileSync(localPath(p), 'utf8'));
const report = { schema_version: 1, collections: [] };
function sourceNote(notePath) {
  const text = fs.readFileSync(localPath(notePath), 'utf8');
  const tokens = marked.lexer(text);
  const title = tokens.find((t) => t.type === 'heading' && t.depth === 1)?.text;
  const links = [];
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'link' && /^https:\/\//.test(token.href)) links.push(token.href);
  });
  const id = path.basename(notePath).slice(0, 3);
  if (!title || !links.length) throw new Error(`Missing source identity: ${notePath}`);
  const revision = text.match(/`([a-f0-9]{40})`/)?.[1] ?? null;
  return {
    id, title: title.replace(/^[VP]\d+\s*[·.]?\s*/, ''), note_path: notePath,
    url: links[0], revision,
    coverage: id.startsWith('V') ? '已提取文字／画面；完整视听范围见笔记，未独立验证作者方法。' : '已读范围与已取得文件逐项见来源笔记，未运行不视为通过。',
    license: id === 'P16' ? LICENCES.noncommercial : id === 'P09' ? LICENCES.CAP : id === 'P22' ? LICENCES.APACHE : id === 'P23' ? LICENCES.SITE : LICENCES.unknown,
  };
}
const sources = [];
for (const folder of ['videos', 'projects']) {
  const dir = `docs/theory/extractions/${folder}`;
  for (const file of fs.readdirSync(localPath(dir)).filter((f) => /^[VP]\d{2}-.+\.md$/.test(f)).sort()) sources.push(sourceNote(`${dir}/${file}`));
}
sources.push(
  { id: 'LEMO', title: 'lemo-opuscar 风格工程', note_path: 'resources/lemo-opuscar/README.md', url: `https://github.com/lemomo-ai/lemo-opuscar/tree/${REVISIONS.LEMO}`, revision: REVISIONS.LEMO, coverage: '索引与文件核查，未精读或重渲全部风格。', license: LICENCES.LEMO },
);
// Optional timing / lineage metadata: only for sources where the note actually records it.
// Lineage keeps "same author, same material" from being counted as independent evidence.
const SOURCE_EXTRA = {
  V10: { timing: { fps: 30, duration_seconds: 45, frames: 1350, bpm: 128, beat_frames: 14.0625, hit_tiers: ['每 4 秒 BIG HIT', '每 2 秒 SMALL HIT', '每拍 KEYFRAME'], note: '页面标 46s，本地低清流 45.0s；按 45.0s / 1350 帧记录。' } },
  V06: { lineage: { same_author: ['V11', 'P09'], derived_from: [], evidence_role: 'primary', note: '341 风格素材库的原始来源。' } },
  P09: { lineage: { same_author: ['V06', 'V11'], derived_from: ['V06'], evidence_role: 'packaging', note: '同一 341 素材库的仓库封装与索引，不构成独立实验。' } },
  V11: { lineage: { same_author: ['V06', 'P09'], derived_from: ['V06', 'P09'], evidence_role: 'new_version', note: '同一 341 素材库的加强版封装；四组 A/B 无日志与评分标准，不计独立验证。' } },
  V12: { lineage: { same_author: ['V13'], derived_from: [], evidence_role: 'primary', note: 'motion-showreel：逐帧时间表方案。' } },
  V13: { lineage: { same_author: ['V12'], derived_from: [], evidence_role: 'primary', note: 'web-video-presentation：网页录屏方案，早于 V12；与 motion-showreel 不同 Skill，不互为替代。' } },
  V14: { lineage: { same_author: ['P22'], derived_from: [], evidence_role: 'primary', note: 'video-shotcraft 的介绍视频；与 P22 同作者同仓库链。' } },
  P22: { lineage: { same_author: ['V14'], derived_from: ['V14'], evidence_role: 'packaging', note: 'V14 介绍的仓库本体，不构成独立验证。' } },
};
for (const source of sources) {
  const extra = SOURCE_EXTRA[source.id];
  if (!extra) continue;
  if (extra.timing) {
    const t = extra.timing;
    if (Math.abs(t.duration_seconds * t.fps - t.frames) > 1) throw new Error(`Inconsistent timing for ${source.id}`);
    source.timing = t;
  }
  if (extra.lineage) source.lineage = extra.lineage;
}
function entry(data) {
  return { revision: '1', project_path: null, preview: null, validation: 'indexed', runnable: false, recipe_ids: ['code-motion'], related_ids: [], engine: null, parameters: [], requirements: ['采用前按原文件核对可改参数、资产与运行依赖。'], ...data };
}
function snapshot(collection, input, make) {
  if (!process.argv.includes('--offline') && fs.existsSync(localPath(input))) {
    const entries = make();
    report.collections.push({ collection, input, status: 'imported', count: entries.length });
    return entries;
  }
  const retained = previous?.templates.filter((t) => t.collection === collection) ?? [];
  if (!retained.length) throw new Error(`Missing ${input}; restore the pinned snapshot before first import.`);
  report.collections.push({ collection, input, status: 'retained_from_catalog', count: retained.length });
  return retained;
}
const capRoot = 'resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts';
const templates = snapshot('CAP', `${capRoot}/references/catalog.json`, () => {
  verifySnapshot('CAP', [`${capRoot}/references/catalog.json`]);
  const catalog = readJSON(`${capRoot}/references/catalog.json`);
  if (!Array.isArray(catalog.entries) || catalog.entries.length !== catalog.total || catalog.total !== 341) throw new Error('Unexpected CAP catalog revision or count');
  return catalog.entries.map((item) => {
    if (!safeRelative(item.file) || (item.image && !safeRelative(item.image))) throw new Error(`Unsafe CAP path: ${item.id}`);
    return entry({ id: `cap-${item.id.toLowerCase()}`, name: item.name || `未命名条目 ${item.id}`, source_id: 'P09', revision: REVISIONS.CAP, upstream_id: item.id, collection: 'CAP', category: item.category, kind: 'prompt', summary: item.description || `上游索引未提供描述，保留原编号 ${item.id}，采用前需阅读原文件。`, purposes: [], tags: [...new Set([item.series, ...(item.tags ?? []), item.fit].filter(Boolean))], reference_path: `${capRoot}/${item.file}`, preview: item.image ? { kind: 'image', path: `${capRoot}/${item.image}`, scope: 'local_only' } : null, license: LICENCES.CAP });
  });
});
const lemoRoot = 'resources/styles/lemo-opuscar/source/styles';
templates.push(...snapshot('LEMO', `${lemoRoot}/README.md`, () => {
  const folders = fs.readdirSync(localPath(lemoRoot), { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== '_template' && fs.existsSync(localPath(`${lemoRoot}/${d.name}/style.json`)));
  verifySnapshot('LEMO', folders.map(({ name }) => `${lemoRoot}/${name}/style.json`));
  if (folders.length !== 51) throw new Error('Unexpected Lemo snapshot; review version before importing');
  return folders.map(({ name }) => {
    const item = readJSON(`${lemoRoot}/${name}/style.json`);
    if (item.slug !== name || !safeRelative(name)) throw new Error(`Invalid Lemo style ${name}`);
    return entry({ id: `lemo-${name}`, name: item.cn, source_id: 'LEMO', revision: REVISIONS.LEMO, upstream_id: name, collection: 'LEMO', category: item.category_cn, kind: 'project', summary: item.line_cn || item.line || item.film, purposes: [], tags: [...new Set([item.en, ...(item.uses ?? [])])], reference_path: `${lemoRoot}/${name}/STYLE.md`, project_path: `${lemoRoot}/${name}/demo`, preview: { kind: 'image', path: `${lemoRoot}/${name}/poster.jpg`, scope: 'local_only' }, license: LICENCES.LEMO });
  });
}));
const mgRoot = 'resources/styles/mg-styles-15';
if (!process.argv.includes('--offline') && fs.existsSync(localPath(`${mgRoot}/source/prompts`))) verifySnapshot('MG15', MG_STYLES.map(([slug]) => `${mgRoot}/source/prompts/${slug}.md`));
report.collections.push({ collection: 'MG15', status: 'curated_index', count: MG_STYLES.length });
templates.push(...MG_STYLES.map(([slug, name, category]) => {
  const upstreamDemo = `${mgRoot}/source/demos/${slug}`;
  const upstreamVideo = `${mgRoot}/source/videos/${slug}.mp4`;
  const hasDemo = fs.existsSync(localPath(upstreamDemo));
  const hasVideo = fs.existsSync(localPath(upstreamVideo));
  const posterPath = `${mgRoot}/source/videos/${slug}.jpg`;
  const hasPoster = fs.existsSync(localPath(posterPath));
  return entry({ id: `mg-${slug}`, name, source_id: 'P02', revision: REVISIONS.MG15, upstream_id: slug, collection: 'MG15', category, kind: hasDemo ? 'project' : 'prompt', summary: hasDemo ? '上游示例工程与演示视频保存在本地快照；本项目 2026-10 做过对照学习，摘要见 docs/library/cases/。不代表工作台已实现执行适配。' : '已保存风格 Prompt；本项目未取得或验证该风格的完整工程。', purposes: [], tags: [name, slug], reference_path: `${mgRoot}/source/prompts/${slug}.md`, project_path: hasDemo ? upstreamDemo : null, preview: hasVideo ? { kind: 'video', path: upstreamVideo, scope: 'local_only' } : hasPoster ? { kind: 'image', path: posterPath, scope: 'local_only' } : null, license: LICENCES.MG15 });
}));
templates.push(entry({ id: 'tool-onetake', name: 'Onetake 连续镜头', source_id: 'P16', revision: '013a61ac8d98883c73733f59c06e49e9ba444f14', upstream_id: 'onetake', collection: 'TOOLS', category: '形变与运动', kind: 'reference', summary: '连续性方法与工具候选；案例不含影片源码。商业使用受限，尚无工作台适配。', purposes: ['product', 'motion'], tags: ['一镜到底', '连续性', '非商业'], reference_path: 'docs/theory/extractions/projects/P16-onetake.md', preview: fs.existsSync(localPath('resources/engines/onetake/preview/skill-demo.jpg')) ? { kind: 'image', path: 'resources/engines/onetake/preview/skill-demo.jpg', scope: 'local_only' } : null, license: LICENCES.noncommercial }));
templates.push(entry({ id: 'tool-video-shotcraft', name: 'video-shotcraft 镜头库', source_id: 'P22', revision: '1266a3ec4831289c4d893d42dd5102723658039a', upstream_id: 'video-shotcraft', collection: 'TOOLS', category: '镜头与动效', kind: 'project', summary: '124 张镜头配方卡 / 150 个镜头 + Remotion 实现 + Ink Press 产品片模板；Apache-2.0 代码，素材另计。本机只读索引，未安装未渲染。', purposes: ['product', 'motion'], tags: ['镜头卡', 'Remotion', '产品宣传片', 'Apache-2.0'], reference_path: 'docs/theory/extractions/projects/P22-video-shotcraft.md', preview: fs.existsSync(localPath('resources/engines/video-shotcraft/source/assets/readme/examples/rhythm.webp')) ? { kind: 'image', path: 'resources/engines/video-shotcraft/source/assets/readme/examples/rhythm.webp', scope: 'local_only' } : null, license: LICENCES.APACHE }));
templates.push(entry({ id: 'tool-awesome-ai-motion', name: 'Awesome AI Motion 参考库', source_id: 'P23', revision: '5d57042e22c9297fefdc3e633b0de4f935bbbe3c', upstream_id: 'awesome-ai-motion', collection: 'TOOLS', category: '参考索引', kind: 'reference', summary: '一千多条 AI 动效作品索引，按题材分类，部分附原作者提示词与源码链接；许可逐条核对，不搬运素材。', purposes: ['education', 'motion', 'product'], tags: ['参考作品', '提示词', '索引'], reference_path: 'docs/theory/extractions/projects/P23-awesome-ai-motion.md', license: LICENCES.SITE }));

const related = (a, b) => {
  const first = templates.find((t) => t.id === a), second = templates.find((t) => t.id === b);
  if (first && second) {
    first.related_ids = [...new Set([...first.related_ids, b])];
    second.related_ids = [...new Set([...second.related_ids, a])];
  }
};
// Metadata-level overlap only; the two pinned collections are not equivalent revisions.
const capMG = [3, 4, 2, 5, 1, 9, 14, 6, 11, 12, 10, 15, 7, 13, 8];
MG_STYLES.forEach(([slug], i) => related(`mg-${slug}`, `cap-v${capMG[i]}`));
const normalized = (name) => name.replace(/[\s·/]/g, '').toLowerCase();
for (const t of templates.filter((t) => t.collection === 'LEMO')) {
  for (const cap of templates.filter((c) => c.collection === 'CAP' && c.tags.includes('L') && normalized(c.name) === normalized(t.name))) related(t.id, cap.id);
}
for (const t of templates) for (const id of [...t.related_ids]) related(t.id, id);
const data = { schema_version: 1, sources: sources.sort((a, b) => a.id.localeCompare(b.id, 'en')), templates, recipes: RECIPES, models: MODELS };
const errors = validateCatalog(data);
if (errors.length) throw new Error(errors.join('\n'));
const serialized = JSON.stringify(data, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== serialized) throw new Error('Catalog is out of date. Review inputs, then run catalog:import.');
  console.log('Catalog matches deterministic import; no files changed.');
} else {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, serialized);
  fs.writeFileSync(path.join(ROOT, 'catalog/import-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Imported ${templates.length} entries, ${sources.length} source records, ${RECIPES.filter((r) => r.runnable).length} locally runnable recipe(s) and ${MODELS.length} user-designated model record(s). Unverified models and missing adapters are not execution claims.`);
}
