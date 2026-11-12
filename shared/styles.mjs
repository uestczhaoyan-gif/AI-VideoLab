export const EXECUTABLE_STYLES = [
  { id: 'blueprint', label: '工程蓝图', hints: ['光', '物理', '工程', '结构', '原理', '机制', '系统', '电路', '数学', '技术', '参数', '流程', '方法', '光学', '镜头', '激光'] },
  { id: 'bauhaus', label: '包豪斯几何', hints: ['几何', '设计', '色彩', '艺术', '品牌', '概念', '对比', '视觉', '构成', '产品', '发布'] },
  { id: 'ink-wash', label: '水墨', hints: ['时间', '情绪', '波', '场', '自然', '东方', '诗', '叙事', '流动', '故事', '记忆'] },
];

/** Pick an executable style from a topic. This is a visual-language hint, not a topic classifier. */
export function recommendStyle(topic, purpose, styles = EXECUTABLE_STYLES) {
  const text = String(topic ?? '').toLowerCase();
  const scores = styles.map((style) => {
    let score = 0;
    const hits = [];
    for (const hint of style.hints) if (text.includes(hint)) { score += 2; hits.push(hint); }
    if (purpose === 'education' && style.id === 'blueprint') score += 1;
    if (purpose === 'motion' && style.id === 'bauhaus') score += 1;
    if (purpose === 'story' && style.id === 'ink-wash') score += 1;
    if (purpose === 'product' && style.id === 'bauhaus') score += 1;
    return { ...style, score, hits };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const best = scores[0];
  return { ...best, alternatives: scores.slice(1), reason: best.hits.length ? `主题含“${best.hits.join('、')}”` : '按用途选择最接近的视觉语言' };
}

const STOP = new Set(['的', '了', '和', '与', '在', '是', '把', '用', '做', '一个', '视频', '什么', '如何', '为什么', '怎么', '我们', '这个', '那个', '一下']);
const STOP_PARTS = ['的', '了', '是', '做', '一个', '视频', '什么', '如何', '为什么', '怎么'];
function searchTerms(topic) {
  const raw = String(topic ?? '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((x) => x.length >= 2 && !STOP.has(x));
  const out = new Set(raw);
  for (const term of raw) {
    if (!/[一-龥]/.test(term)) continue;
    for (let i = 0; i < term.length - 1; i++) {
      const pair = term.slice(i, i + 2);
      if (!STOP.has(pair) && !STOP_PARTS.some((part) => pair.includes(part))) out.add(pair);
    }
  }
  return [...out];
}

/** Prefer the tracked prompt pack so a fresh clone can open it before resources:fetch. */
function displayPrompt(t) {
  if (t.collection === 'LEMO') return `resources/prompts/lemo/${t.upstream_id}/STYLE.md`;
  if (t.collection === 'MG15') return `resources/prompts/mg/${t.upstream_id}.md`;
  return t.reference_path;
}

/** Rank visual-language references; never claim a topic-specific match that does not exist. */
export function recommendResourceTemplates(catalog, topic, limit = 3) {
  const terms = searchTerms(topic);
  const candidates = catalog.templates
    .filter((t) => ['LEMO', 'MG15', 'CAP'].includes(t.collection) && t.reference_path)
    .map((t) => {
      const haystack = [t.name, t.summary, t.category, ...(t.tags ?? [])].join(' ').toLowerCase();
      const hits = terms.filter((term) => haystack.includes(term));
      return { ...t, _score: hits.length, _hits: hits };
    })
    .filter((t) => t._score > 0)
    .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ _score, _hits, ...t }) => ({ id: t.id, name: t.name, source_id: t.source_id, summary: t.summary, prompt_path: displayPrompt(t), reason: `索引含“${_hits.join('、')}”` }));
  if (candidates.length) return candidates;
  // No topic-named template: expose visual-language candidates rather than pretending a match.
  const fallbackIds = ['lemo-blueprint', 'lemo-microscope', 'lemo-dataviz', 'mg-09-bauhaus', 'mg-03-isometric'];
  return fallbackIds
    .map((id) => catalog.templates.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, limit)
    .map((t) => ({ id: t.id, name: t.name, source_id: t.source_id, summary: t.summary, prompt_path: displayPrompt(t), reason: '主题无同名模板；作为视觉语言候选' }));
}
