import { PURPOSES, COLLECTIONS, KINDS, filterTemplates, recommendRecipes, recommendTemplates, buildPlan, planMarkdown, projectToForm, emptyForm } from './domain.mjs';
import { parseProject, GATES, QA_ITEMS } from '../../../shared/project.mjs';

const LINEAGE_ROLES = { primary: '一手来源', new_version: '同源新版本', packaging: '同源封装', reference: '参考' };

const $ = (s) => document.querySelector(s);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name) => `<i data-lucide="${name}"></i>`;
const icons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 1.65 } });
const loadStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
let favorites = loadStorage('videolab:favorites:v1', []);
let saved = loadStorage('videolab:plans:v1', []);
if (!Array.isArray(favorites) || favorites.some((x) => typeof x !== 'string')) favorites = [];
if (!Array.isArray(saved)) saved = [];
saved = saved.filter((p) => p && [1, 2].includes(p.schema_version) && typeof p.id === 'string' && typeof p.title === 'string' && typeof p.created_at === 'string' && p.brief && typeof p.brief.topic === 'string' && p.selection && typeof p.selection.template_id !== 'undefined' && typeof p.selection.recipe_id !== 'undefined' && p.cost);
let catalog;
let comparison = [];
let filters = { query: '', collection: '', kind: '', purpose: '', category: '', availableOnly: false, favoritesOnly: false, commercialOnly: false };
let brief = emptyForm();
let currentProject = null;
let selectedTemplate = 'mg-01-flat-vector';
let selectedRecipe = 'explain-data';
let tier = 'budget';
let page = 1;
const PAGE_SIZE = 24;
let toastTimer;
function toast(message) {
  $('#toast').textContent = message; $('#toast').hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000);
}
function store() {
  try { localStorage.setItem('videolab:favorites:v1', JSON.stringify(favorites)); localStorage.setItem('videolab:plans:v1', JSON.stringify(saved)); return true; }
  catch { toast('浏览器存储不可用，请导出方案。'); return false; }
}
function template(id = selectedTemplate) { return catalog.templates.find((t) => t.id === id); }
function media(t, large = false) {
  if (!t?.preview || !t.availability.preview) return `<div class="empty-media">${icon(t?.preview ? 'file-question' : 'image')}<span>${t?.preview ? '本机预览文件缺失' : '尚无预览'}</span></div>`;
  const url = `/api/media?id=${encodeURIComponent(t.id)}`;
  return t.preview.kind === 'video' ? `<video src="${url}" ${large ? 'controls' : ''} ${t.availability.poster ? `poster="/api/poster?id=${encodeURIComponent(t.id)}"` : ''} preload="metadata" muted playsinline aria-label="${esc(t.name)}预览"></video>${!large ? `<span class="media-type">${icon('play')}视频</span>` : ''}` : `<img src="${url}" alt="${esc(t.name)}${t.collection === 'MG15' ? '对照图' : '参考画面'}" ${large ? '' : 'loading="lazy"'}>`;
}
function options(map, value, empty = '') { return (empty ? `<option value="">${empty}</option>` : '') + Object.entries(map).map(([key, label]) => `<option value="${esc(key)}" ${key === String(value) ? 'selected' : ''}>${esc(label)}</option>`).join(''); }
function top(title, sub, action = '') { return `<div class="page-heading"><div><div class="eyebrow">VIDEOLAB / WORKSPACE</div><h1>${title}</h1><p>${sub}</p></div>${action}</div>`; }
function navigate(view) { if (location.hash === `#${view}`) render(); else location.hash = view; }
function renderCollections() {
  $('#collections').innerHTML = Object.entries(COLLECTIONS).map(([key, label]) => `<button data-collection="${key}" class="${filters.collection === key && view() === 'templates' ? 'active' : ''}"><span class="collection-dot c-${key.toLowerCase()}"></span><span>${label}</span><small>${catalog.templates.filter((t) => t.collection === key).length}</small></button>`).join('');
}
function view() { const v = location.hash.slice(1); return ['templates', 'recipes', 'plan', 'sources', 'saved'].includes(v) ? v : 'templates'; }
function render() {
  if (!catalog) return;
  const v = view();
  document.body.dataset.view = v;
  const labels = { templates: '模板库', recipes: '流程库', plan: '制作方案', sources: '来源与证据', saved: '已存方案' };
  $('#breadcrumb').textContent = labels[v];
  document.querySelectorAll('#navigation a').forEach((a) => { a.classList.toggle('active', a.dataset.view === v); if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#template-count').textContent = catalog.templates.length;
  $('#saved-count').textContent = saved.length;
  renderCollections();
  ({ templates: renderLibrary, recipes: renderRecipes, plan: renderPlanNew, sources: renderSources, saved: renderSaved })[v]();
  icons();
}
function renderLibrary() {
  $('#main').innerHTML = top('模板库', '上游风格与 Prompt 资料 · 未接执行适配。', `<button class="button primary" data-action="new-plan">${icon('plus')}制作方案</button>`) +
    `<div class="library-summary"><div><strong>${catalog.templates.length}</strong><span>索引条目</span></div><div><strong>${catalog.templates.filter((t) => t.availability.preview).length}</strong><span>本机预览</span></div><div><strong>3</strong><span>候选流程</span></div><span class="summary-note">跨库条目可能重叠 · 执行适配尚未接入</span></div>
    <section class="library-controls" aria-label="筛选模板"><div class="control-row"><div class="segmented"><button data-scope="all" class="${!filters.favoritesOnly ? 'selected' : ''}">全部模板</button><button data-scope="favorites" class="${filters.favoritesOnly ? 'selected' : ''}">${icon('bookmark')}收藏 <span>${favorites.length}</span></button></div><label class="search">${icon('search')}<input id="search" type="search" placeholder="名称、风格、编号或关键词" value="${esc(filters.query)}" aria-label="搜索模板"></label></div>
    <div class="filter-row"><select id="collection-filter" aria-label="资料集合">${options(COLLECTIONS, filters.collection, '全部集合')}</select><select id="kind-filter" aria-label="条目类型">${options(KINDS, filters.kind, '全部类型')}</select><select id="purpose-filter" aria-label="已标用途">${options(PURPOSES, filters.purpose, '全部用途')}</select><select id="category-filter" aria-label="风格类别">${options(Object.fromEntries([...new Set(catalog.templates.map((t) => t.category))].sort((a, b) => a.localeCompare(b, 'zh')).map((x) => [x, x])), filters.category, '全部风格')}</select><label class="check-label"><input id="available-filter" type="checkbox" ${filters.availableOnly ? 'checked' : ''}>有本机预览</label><label class="check-label"><input id="commercial-filter" type="checkbox" ${filters.commercialOnly ? 'checked' : ''}>商用已核查</label><button class="icon-button" data-action="clear-filters" title="重置筛选" aria-label="重置筛选">${icon('rotate-ccw')}</button></div></section>
    <div id="library-results"></div><div id="compare-bar"></div>`;
  $('#search').addEventListener('input', (e) => { filters.query = e.target.value; page = 1; renderResults(); });
  for (const [id, key] of [['collection', 'collection'], ['kind', 'kind'], ['purpose', 'purpose'], ['category', 'category']]) $(`#${id}-filter`).addEventListener('change', (e) => { filters[key] = e.target.value; page = 1; renderCollections(); renderResults(); });
  for (const [id, key] of [['available', 'availableOnly'], ['commercial', 'commercialOnly']]) $(`#${id}-filter`).addEventListener('change', (e) => { filters[key] = e.target.checked; page = 1; renderResults(); });
  renderResults();
}
function renderResults() {
  const all = filterTemplates(catalog.templates, { ...filters, favorites });
  all.sort((a, b) => Number(Boolean(b.availability.preview)) - Number(Boolean(a.availability.preview)));
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  page = Math.min(page, pages);
  $('#library-results').innerHTML = `<div class="result-heading"><span>${all.length} 个条目${filters.purpose ? ' · 仅含已标注用途' : ''}</span><span>来源分开保存，不合并计数</span></div>` + (all.length ? `<div class="template-grid">${all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((t) => `<article class="template-card"><button class="preview-button" data-detail="${t.id}" aria-label="查看 ${esc(t.name)}">${media(t)}<span class="collection-badge">${esc(COLLECTIONS[t.collection].split(' · ')[0])}</span></button><div class="card-content"><div class="card-title"><button data-detail="${t.id}" class="title-button">${esc(t.name)}</button><button class="icon-button favorite ${favorites.includes(t.id) ? 'is-on' : ''}" data-favorite="${t.id}" aria-label="${favorites.includes(t.id) ? '取消收藏' : '收藏'} ${esc(t.name)}" title="${favorites.includes(t.id) ? '取消收藏' : '收藏'}">${icon('bookmark')}</button></div><div class="card-meta"><span>${esc(t.category)}</span><span class="mono">${esc(t.upstream_id)}</span></div><div class="card-footer"><span class="tag ${t.kind === 'project' ? 'teal' : ''}">${KINDS[t.kind]}</span><span class="license-hint">${t.license.commercial === 'restricted' ? '非商业' : '许可逐项核查'}</span><button class="icon-button ${comparison.includes(t.id) ? 'is-on' : ''}" data-compare="${t.id}" aria-label="对比 ${esc(t.name)}" aria-pressed="${comparison.includes(t.id)}" title="加入对比">${icon('columns-2')}</button></div></div></article>`).join('')}</div><div class="pagination"><button class="button subtle" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>${icon('chevron-left')}上一页</button><span>${page} / ${pages}</span><button class="button subtle" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}>下一页${icon('chevron-right')}</button></div>` : `<div class="empty-state">${icon('search-x')}<h2>没有匹配条目</h2><p>${filters.commercialOnly ? '当前目录没有已完成商用授权核查的模板。' : '暂无匹配的风格或编号。'}</p><button class="button" data-action="clear-filters">重置筛选</button></div>`);
  renderCompareBar(); icons();
}
function renderCompareBar() { $('#compare-bar').innerHTML = comparison.length ? `<div class="compare-bar"><span>${icon('columns-2')}已选 ${comparison.length} / 3</span><button class="button subtle" data-action="clear-compare">清空</button><button class="button primary" data-action="show-compare">比较条目${icon('arrow-right')}</button></div>` : ''; }
function detail(id) {
  const t = template(id); if (!t) return;
  const source = catalog.sources.find((s) => s.id === t.source_id);
  const dialog = $('#detail-dialog');
  dialog.innerHTML = `<div class="dialog-header"><div><span class="eyebrow">${esc(t.source_id)} / ${esc(t.upstream_id)}</span><h2 id="detail-title">${esc(t.name)}</h2></div><button class="icon-button" data-close="detail-dialog" aria-label="关闭详情" title="关闭">${icon('x')}</button></div><div class="detail-media">${media(t, true)}</div><div class="detail-body"><div class="tag-row"><span class="tag teal">${KINDS[t.kind]}</span><span class="tag">${esc(t.category)}</span><span class="tag amber">未接执行适配</span></div><p>${esc(t.summary)}</p><dl class="facts"><dt>来源</dt><dd>${esc(source.title)}</dd><dt>版本</dt><dd class="mono">${esc(t.revision)}</dd><dt>原始文件</dt><dd>${t.availability.reference ? '本机已取得' : '本机缺失，按固定版本恢复'}</dd><dt>工程范围</dt><dd>${t.project_path ? '有工程路径；依赖与运行另查' : '未取得本条目完整工程'}</dd><dt>本地验证</dt><dd>${esc({ indexed: '仅索引／资料核查，未验证制片', code_read: '源码初读，未运行', technical_pass: '具体案例技术检查通过', accepted_with_limits: '既有案例反馈，局限见原记录' }[t.validation])}</dd><dt>证据状态</dt><dd>${t.availability.preview ? '有本机参考预览' : '无本机预览'}；${t.availability.project ? '工程路径存在' : '无工程路径'}；不可执行（未接适配）</dd><dt>时间规格</dt><dd>${t.timing ? `${t.timing.frames} 帧 / ${t.timing.duration_seconds}s / ${t.timing.fps} fps${t.timing.bpm ? ` / ${t.timing.bpm} BPM` : ''}` : '未登记'}</dd><dt>谱系</dt><dd>${source.lineage ? `${esc(LINEAGE_ROLES[source.lineage.evidence_role])}；同源：${esc(source.lineage.same_author.join('、') || '无')}${source.lineage.derived_from.length ? `；派生自：${esc(source.lineage.derived_from.join('、'))}` : ''}` : '无谱系记录'}</dd></dl><h3>许可与使用</h3><p class="notice ${t.license.commercial === 'restricted' ? 'warning' : ''}"><strong>${esc(t.license.label)}</strong><br>${esc(t.license.note)}</p><h3>参数与运行条件</h3><p>${t.parameters.length ? esc(t.parameters.join('、')) : '可改参数尚未逐项登记；方案规格是制作需求，不是模板已验证能力。'}<br>引擎：${esc(t.engine ?? '待按原文件核对')}。${esc(t.requirements.join(' '))}</p><h3>相关流程</h3><div class="related-recipes">${t.recipe_ids.map((id) => `<span>${esc(catalog.recipes.find((r) => r.id === id).name)} · 草案</span>`).join('')}</div><div class="source-actions">${t.related_ids.map((id) => `<button class="text-button" data-detail="${id}">${esc(template(id).name)} · 相关版本${icon('arrow-up-right')}</button>`).join('')}</div><div class="source-actions"><button class="button" data-doc="${esc(t.reference_path)}">${icon('file-text')}${t.availability.reference ? '原始文件' : '查看缺失状态'}</button><button class="button" data-doc="${esc(source.note_path)}">${icon('notebook-text')}来源笔记</button>${source.url ? `<a class="button" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${icon('external-link')}原始来源</a>` : ''}</div></div><div class="dialog-footer"><button class="button" data-favorite="${t.id}">${icon('bookmark')}${favorites.includes(t.id) ? '取消收藏' : '收藏'}</button><button class="button primary" data-use="${t.id}">采用此模板${icon('arrow-right')}</button></div>`;
  dialog.showModal(); icons();
}
async function documentView(p) {
  const dialog = $('#document-dialog');
  dialog.innerHTML = `<div class="dialog-header"><h2 id="document-title">原始文档</h2><button class="icon-button" data-close="document-dialog" aria-label="关闭文档" title="关闭">${icon('x')}</button></div><div class="document-path">${esc(p)}</div><pre class="document-text">正在读取…</pre>`;
  if (!dialog.open) dialog.showModal(); icons();
  try {
    const response = await fetch(`/api/document?path=${encodeURIComponent(p)}`); const data = await response.json();
    dialog.querySelector('pre').textContent = response.ok ? data.text : data.error;
  } catch { dialog.querySelector('pre').textContent = '本机服务暂时不可用。'; }
}
function showCompare() {
  const dialog = $('#compare-dialog');
  dialog.innerHTML = `<div class="dialog-header"><h2 id="compare-title">模板对比</h2><button class="icon-button" data-close="compare-dialog" title="关闭" aria-label="关闭对比">${icon('x')}</button></div><div class="compare-grid">${comparison.map((id) => { const t = template(id); return `<section><div class="compare-media">${media(t, true)}</div><h3>${esc(t.name)}</h3><dl class="facts"><dt>类型</dt><dd>${KINDS[t.kind]}</dd><dt>取得</dt><dd>${t.availability.reference ? '本机原始文件已取得' : '本机原始文件缺失'}</dd><dt>许可</dt><dd>${esc(t.license.label)}</dd><dt>执行</dt><dd>未适配</dd></dl><p>${esc(t.summary)}</p><button class="button primary" data-use="${id}">采用此模板${icon('arrow-right')}</button></section>`; }).join('')}</div>`;
  dialog.showModal(); icons();
}
function renderRecipes() {
  $('#main').innerHTML = top('流程库', '3 条候选 · 所有路线尚未适配。') + `<div class="recipe-list">${catalog.recipes.map((r, index) => `<section class="recipe-band"><div class="recipe-number">0${index + 1}</div><div class="recipe-info"><div class="tag-row"><span class="tag amber">草案</span><span class="mono">${r.revision}</span></div><h2>${esc(r.name)}</h2><p>${esc(r.summary)}</p><div class="flow-line">${r.stages.map((s) => `<span>${esc(s.name)}</span>`).join(icon('chevron-right'))}</div><div class="recipe-columns"><div><h3>输入条件</h3><ul>${r.requirements.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div><div><h3>当前缺口</h3><ul>${r.limitations.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div></div><div class="recipe-footer"><div>${r.source_ids.map((id) => `<button class="text-button" data-doc="${esc(catalog.sources.find((s) => s.id === id).note_path)}">${id}${icon('arrow-up-right')}</button>`).join('')}</div><button class="button" data-recipe="${r.id}">采用此流程${icon('arrow-right')}</button></div></div></section>`).join('')}</div>`;
}
function renderPlanNew() {
  const t = template();
  const suggestions = recommendRecipes(catalog, brief.purpose, t);
  if (!catalog.recipes.some((r) => r.id === selectedRecipe)) selectedRecipe = suggestions[0]?.id ?? catalog.recipes[0].id;
  const r = catalog.recipes.find((x) => x.id === selectedRecipe) ?? catalog.recipes[0];
  const field = (label, name, content, classes = '') => `<label class="field ${classes}"><span>${label}</span>${content.replace('NAME', name)}</label>`;
  const text = (label, name, value, placeholder, rows=2) => field(label, name, `<textarea name="NAME" rows="${rows}" maxlength="3000" placeholder="${placeholder}">${esc(value)}</textarea>`);
  const advanced = `<section class="form-section"><div class="section-heading"><span class="step-number">02</span><h2>受众与讲解深度</h2></div>${text('目标观众','audience',brief.audience,'例如：熟悉 Maxwell 方程的光子学研究生')}${text('前置知识','prerequisites',brief.prerequisites,'观众已经知道什么？')}${text('看完应理解什么','learningGoal',brief.learningGoal,'只写一个最重要的理解或传播目标') }<div class="field-grid">${field('讲解深度','depth',`<select name="NAME">${options({unspecified:'待明确',introductory:'入门直觉',professional:'专业概述',derivation:'推导 / 研究'},brief.depth)}</select>`)}${field('公式策略','formulaPolicy',`<select name="NAME">${options({unspecified:'待明确',none:'不需要公式',core:'核心公式',derivation:'必要推导'},brief.formulaPolicy)}</select>`)}${field('目标时长下限','durationMin',`<input name="NAME" type="number" min="5" max="3600" value="${esc(brief.durationMin)}">`)}${field('目标时长上限','durationMax',`<input name="NAME" type="number" min="5" max="3600" value="${esc(brief.durationMax)}">`)}</div>${text('风格偏好','stylePreferences',brief.stylePreferences,'可留空；由助手按内容选配，不等于固定模板约束')}</section>`;
  const delivery = `<section class="form-section"><div class="section-heading"><span class="step-number">01</span><h2>内容与交付</h2></div>${field('主题 / 文案','topic',`<textarea name="NAME" required maxlength="2000" rows="4" placeholder="例如：用直观画面解释伴随法为什么能高效求梯度">${esc(brief.topic)}</textarea>`)}<div class="field-grid">${field('视频用途','purpose',`<select name="NAME">${options(PURPOSES,brief.purpose)}</select>`)}${field('目标时长 · 秒','duration',`<input name="NAME" type="number" min="5" max="3600" value="${esc(brief.duration)}" required>`)}${field('画幅','aspect',`<select name="NAME">${options({'16:9':'横屏 16:9','9:16':'竖屏 9:16','1:1':'方形 1:1','3:4':'竖屏 3:4'},brief.aspect)}</select>`)}${field('分辨率','resolution',`<select name="NAME">${options({'720p':'720p','1080p':'1080p','2160p':'2160p'},brief.resolution)}</select>`)}${field('帧率','fps',`<select name="NAME">${options({24:'24 fps',30:'30 fps',60:'60 fps'},brief.fps)}</select>`)}${field('语言','language',`<select name="NAME">${options({'zh-CN':'中文',en:'English'},brief.language)}</select>`)}</div></section>`;
  const sound = `<section class="form-section"><div class="section-heading"><span class="step-number">03</span><h2>声音、资源与验收</h2></div><div class="field-grid">${field('配音','narration',`<select name="NAME">${options({none:'无配音',tts:'AI 配音 · 服务待选',provided:'自带音频 · 待提供'},brief.narration)}</select>`)}${field('BGM','bgm',`<select name="NAME">${options({none:'无 BGM',library:'授权曲库 · 待选',provided:'自带音乐 · 待提供'},brief.bgm)}</select>`)}${field('预算上限 · 可留空','budget',`<input name="NAME" type="number" min="0.01" step="0.01" max="100000" value="${esc(brief.budget)}" placeholder="未设定">`)}${field('币种','currency',`<select name="NAME">${options({CNY:'CNY · 人民币',USD:'USD · 美元'},brief.currency)}</select>`)}${field('使用场景','usage',`<select name="NAME">${options({personal:'个人 / 研究',commercial:'商业发布'},brief.usage)}</select>`)}<label class="check-label subtitle-toggle"><input name="subtitles" type="checkbox" ${brief.subtitles?'checked':''}>需要字幕</label></div>${text('验收要求（每行一条）','acceptance',brief.acceptance,'例如：公式符号有定义；最终需要人工试听',3)}${text('附加要求','notes',brief.notes,'已有素材、事实出处、音色和不可改变内容',3)}</section>`;
  const resources = `<section class="form-section"><div class="section-heading"><span class="step-number">04</span><h2>资源与交接</h2></div><div class="field-grid">${field('资源策略','resourcePolicy',`<select name="NAME">${options({current_cli_local:'优先当前助手和本地工具',additional_services_possible:'可讨论额外服务',unspecified:'待明确'},brief.resourcePolicy)}</select>`)}${field('最长等待 · 分钟','maxWait',`<input name="NAME" type="number" min="1" value="${esc(brief.maxWait)}" placeholder="未设定">`)}</div>${text('本机工具（每行一项）','availableTools',brief.availableTools,'例如：Edge、FFmpeg、现有白板引擎',3)}${text('资源说明','resourceNotes',brief.resourceNotes,'许可、素材位置或额外服务授权',3)}</section>`;
  $('#main').innerHTML = top('制作方案','共享项目契约 v2 · 需求可校验 · 不自动执行。',`<button class="button" data-action="import-project">${icon('upload')}导入 JSON</button><input id="project-import" type="file" accept="application/json,.json" hidden><button class="button primary" data-action="save-plan">${icon('save')}保存方案</button>`) + `<div class="plan-layout"><form id="brief-form" class="brief-form">${delivery}${advanced}${sound}${resources}</form><aside class="selection-panel"><div class="section-heading"><span class="step-number">05</span><h2>模板与流程</h2></div><div class="selection-preview">${t?media(t,true):'<div class="empty-media">尚未选择模板</div>'}</div><div class="selected-template"><div><h3>${esc(t?.name??'未选择')}</h3><span>${t?`${esc(COLLECTIONS[t.collection])} · ${KINDS[t.kind]}`:'可先导入或选择模板'}</span></div><button class="icon-button" data-action="choose-template" title="更换模板" aria-label="更换模板">${icon('replace')}</button></div><label class="field"><span>候选流程</span><select id="recipe-select">${catalog.recipes.map(x=>`<option value="${x.id}" ${x.id===r.id?'selected':''}>${esc(x.name)}${x.purposes.includes(brief.purpose)?' · 用途匹配':' · 用途需复核'}</option>`).join('')}</select></label><div class="notice"><strong>预计费用：${currentProject?.cost?.estimate??'未知'}</strong><br>同一项目记录可交给 CLI 继续；尚无统一执行器。</div>${t&&brief.usage==='commercial'&&t.license.commercial!=='allowed'?`<div class="notice warning"><strong>${t.license.commercial==='restricted'?'商业使用受限，不能执行':'商用许可待核查'}</strong><br>${esc(t.license.note)}</div>`:''}${t&&!t.availability.reference?'<div class="notice warning"><strong>本机原始文件缺失</strong><br>需按固定来源恢复后再制作。</div>':''}<div class="selection-footer">${t?`<button class="button" data-doc="${esc(t.reference_path)}">${icon('file-text')}模板文件</button><button class="button" data-detail="${t.id}">${icon('info')}详情</button>`:''}</div><div class="template-suggestions"><h3>按用途匹配 · 候选</h3>${recommendTemplates(catalog,brief).filter(x=>x.id!==t?.id).slice(0,3).map(x=>`<button data-use="${x.id}"><span>${esc(x.name)}<small>${esc(x.reason)} · 适配待核查</small></span>${icon('arrow-up-right')}</button>`).join('')||'<p>暂无其他匹配，仍可按风格检索。</p>'}</div></aside></div><section class="form-section contract-panel"><div class="section-heading"><span class="step-number">06</span><h2>确认门与 QA 契约</h2></div><p class="contract-note">导出的 JSON 与制作任务包会带上以下条目；确认与检查结果由 CLI 或项目工具记录，工作台不代签，NOT CHECKED 不算通过。</p><div class="contract-grid"><div><h3>三处人工确认</h3><ol class="contract-list">${GATES.map(g=>`<li><strong>${esc(g.label)}</strong><span>${esc(g.description)}</span></li>`).join('')}</ol></div><div><h3>QA 清单</h3><ul class="contract-list">${QA_ITEMS.map(q=>`<li><span class="mono">${esc(q.id)}</span> ${esc(q.requirement)}</li>`).join('')}</ul></div></div></section><section class="routing-section"><div class="routing-heading"><div><h2>阶段路由</h2><p>准确 provider / model_id 待配置，不触发模型调用。</p></div><div class="segmented tier-control"><button data-tier="current_cli" class="${tier==='current_cli'?'selected':''}">${icon('terminal')}当前 CLI</button><button data-tier="premium" class="${tier==='premium'?'selected':''}">${icon('sparkles')}高玩版</button><button data-tier="budget" class="${tier==='budget'?'selected':''}">${icon('coins')}平民版</button></div></div><div class="table-wrap"><table><thead><tr><th>阶段</th><th>选择原则</th><th>交付</th><th>模型</th></tr></thead><tbody>${r.stages.map(s=>`<tr><td><strong>${esc(s.name)}</strong></td><td>${esc(s[tier]??'按当前 CLI 与本地工具核查')}</td><td>${esc(s.output)}</td><td><span class="tag">${s.id==='render'?'确定性工具':'待配置'}</span></td></tr>`).join('')}</tbody></table></div><div class="export-row"><span class="tag amber">需求／选型可校验 · 尚不可自动执行</span><div><button class="button" data-export="json">${icon('download')}JSON</button><button class="button primary" data-export="md">${icon('download')}制作任务包</button></div></div></section>`;
  const form=$('#brief-form');
  const capture=()=>{const d=new FormData(form);for(const key of Object.keys(brief))brief[key]=key==='subtitles'?d.has(key):d.get(key);};
  form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',capture);form.addEventListener('change',e=>{capture();if(['purpose','usage'].includes(e.target.name))renderPlanAndIcons();});
  $('#recipe-select').addEventListener('change',e=>{selectedRecipe=e.target.value;renderPlanAndIcons();});
  $('#project-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const p=parseProject(await file.text());currentProject=p;brief=projectToForm(p);selectedTemplate=p.selection.template_id??selectedTemplate;selectedRecipe=p.selection.recipe_id??selectedRecipe;tier=p.selection.tier??'current_cli';renderPlanAndIcons();toast(`已导入项目 v${p.revision}；文件引用未自动复制。`);}catch(error){toast(error.message);}e.target.value='';});
}
function renderPlanAndIcons() { renderPlanNew(); icons(); }
function currentPlan() {
  try { if (!$('#brief-form').reportValidity()) return null; return buildPlan(catalog, brief, selectedTemplate, selectedRecipe, tier, currentProject); }
  catch (error) { toast(error.message); return null; }
}
function download(name, content, mime) {
  const blob = new Blob([content], { type: mime }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function renderSources() {
  const role = (lineage) => lineage ? `<span class="tag teal">${esc(LINEAGE_ROLES[lineage.evidence_role])}</span>` : '<span class="muted">—</span>';
  $('#main').innerHTML = top('来源与证据', 'V01–V13 / P01–P21 / Lemo。') + `<div class="sources-info"><span class="tag">${catalog.sources.length} 条引用记录</span><span>索引数量不代表独立方法、完整观看或成功制片。</span></div><div class="table-wrap"><table class="source-table"><thead><tr><th>编号</th><th>来源</th><th>读取 / 验证</th><th>谱系</th><th>版本</th><th>入口</th></tr></thead><tbody>${catalog.sources.map((s) => `<tr><td class="mono">${s.id}</td><td><strong>${esc(s.title)}</strong></td><td>${esc(s.coverage)}</td><td>${role(s.lineage)}</td><td class="mono">${esc(s.revision?.slice(0, 12) ?? '见来源笔记')}</td><td><div class="source-buttons"><button class="icon-button" data-doc="${esc(s.note_path)}" title="来源笔记" aria-label="${s.id} 来源笔记">${icon('file-text')}</button>${s.url ? `<a class="icon-button" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" title="原始来源" aria-label="${s.id} 原始来源">${icon('external-link')}</a>` : ''}</div></td></tr>`).join('')}</tbody></table></div>`;
}
function renderSaved() {
  $('#main').innerHTML = top('已存方案', `当前浏览器 · ${saved.length} 份草案。`, `<button class="button primary" data-action="new-plan">${icon('plus')}制作方案</button>`) + (saved.length ? `<div class="saved-list">${saved.map((p) => `<article class="saved-item"><span class="saved-icon">${icon('file-video')}</span><div><h2>${esc(p.title)}</h2><p>${esc(p.selection.template_id ?? '未选模板')} · ${p.selection.tier === 'premium' ? '高玩版' : p.selection.tier === 'budget' ? '平民版' : '当前 CLI'} · v${esc(p.revision ?? 1)} · ${esc(p.brief.duration_seconds)} 秒</p><span>${esc(new Date(p.created_at).toLocaleString('zh-CN'))}</span></div><span class="tag amber">草案</span><div class="saved-actions"><button class="button" data-open-plan="${esc(p.id)}">打开${icon('arrow-right')}</button><button class="icon-button" data-download-plan="${esc(p.id)}" aria-label="导出 ${esc(p.title)}" title="导出方案 JSON">${icon('download')}</button><button class="icon-button" data-delete-plan="${esc(p.id)}" aria-label="删除 ${esc(p.title)}" title="删除方案">${icon('trash-2')}</button></div></article>`).join('')}</div>` : `<div class="empty-state">${icon('folder-open')}<h2>还没有保存方案</h2><button class="button primary" data-action="new-plan">${icon('plus')}制作方案</button></div>`);
}
function useTemplate(id) { selectedTemplate = id; for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close(); const matches = recommendRecipes(catalog, brief.purpose, template()); if (matches.length) selectedRecipe = matches[0].id; navigate('plan'); }

document.addEventListener('click', (e) => {
  const b = e.target.closest('button, a[data-view]'); if (!b || b.disabled || !catalog) return;
  if (b.dataset.close) $(`#${b.dataset.close}`).close();
  else if (b.dataset.detail) detail(b.dataset.detail);
  else if (b.dataset.doc) documentView(b.dataset.doc);
  else if (b.dataset.use) useTemplate(b.dataset.use);
  else if (b.dataset.favorite) {
    const id = b.dataset.favorite; favorites = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id]; store();
    if (view() === 'templates') renderLibrary();
    if ($('#detail-dialog').open) { $('#detail-dialog').close(); detail(id); }
    icons();
  } else if (b.dataset.compare) {
    const id = b.dataset.compare;
    if (!comparison.includes(id) && comparison.length >= 3) return toast('最多比较 3 个条目。');
    comparison = comparison.includes(id) ? comparison.filter((x) => x !== id) : [...comparison, id]; renderResults();
  } else if (b.dataset.page) { page = Number(b.dataset.page); renderResults(); $('#library-results').scrollIntoView({ block: 'start' }); }
  else if (b.dataset.scope) { filters.favoritesOnly = b.dataset.scope === 'favorites'; page = 1; renderLibrary(); icons(); }
  else if (b.dataset.collection) { filters.collection = b.dataset.collection; page = 1; navigate('templates'); }
  else if (b.dataset.recipe) { selectedRecipe = b.dataset.recipe; navigate('plan'); }
  else if (b.dataset.tier) { tier = b.dataset.tier; renderPlanAndIcons(); }
  else if (b.dataset.action === 'import-project') $('#project-import')?.click();
  else if (b.dataset.export) { const p = currentPlan(); if (p) download(`videolab-project-v${p.revision}.${b.dataset.export}`, b.dataset.export === 'md' ? planMarkdown(p) : JSON.stringify(p, null, 2), b.dataset.export === 'md' ? 'text/markdown;charset=utf-8' : 'application/json'); }
  else if (b.dataset.openPlan) {
    const raw = saved.find((x) => x.id === b.dataset.openPlan);
    let p; try { p = parseProject(JSON.stringify(raw)); } catch (error) { return toast(error.message); }
    if (!p.selection.template_id || !template(p.selection.template_id) || !p.selection.recipe_id || !catalog.recipes.some((r) => r.id === p.selection.recipe_id)) return toast('目录中已无对应版本，请重新选择。');
    if (template(p.selection.template_id).revision !== p.selection.template_revision || catalog.recipes.find((r) => r.id === p.selection.recipe_id).revision !== p.selection.recipe_revision) return toast('模板或流程版本已变化；原方案仍可导出，请重新选择后另存。');
    currentProject = p; selectedTemplate = p.selection.template_id; selectedRecipe = p.selection.recipe_id; tier = p.selection.tier;
    brief = projectToForm(p);
    navigate('plan');
  } else if (b.dataset.downloadPlan) { const p = saved.find((x) => x.id === b.dataset.downloadPlan); if (p) download(`videolab-${p.id}.json`, JSON.stringify(p, null, 2), 'application/json'); }
  else if (b.dataset.deletePlan) { if (confirm('删除这份浏览器内的方案？')) { saved = saved.filter((x) => x.id !== b.dataset.deletePlan); store(); render(); } }
  else if (b.dataset.action === 'clear-filters') { filters = { query: '', collection: '', kind: '', purpose: '', category: '', availableOnly: false, favoritesOnly: false, commercialOnly: false }; page = 1; render(); }
  else if (b.dataset.action === 'clear-compare') { comparison = []; renderResults(); }
  else if (b.dataset.action === 'show-compare') showCompare();
  else if (b.dataset.action === 'new-plan') { currentProject = null; brief = emptyForm(); selectedTemplate = 'mg-01-flat-vector'; selectedRecipe = 'explain-data'; tier = 'current_cli'; navigate('plan'); }
  else if (b.dataset.action === 'choose-template') navigate('templates');
  else if (b.dataset.action === 'save-plan') { const p = currentPlan(); if (p) { currentProject = p; saved.unshift(p); if (store()) { $('#saved-count').textContent = saved.length; toast(`项目 v${p.revision} 已保存到当前浏览器。`); } else saved.shift(); } }
});
$('#project-doc').addEventListener('click', () => documentView('PROJECT.md'));
window.addEventListener('hashchange', render);
try {
  const response = await fetch('/api/catalog'); if (!response.ok) throw new Error(); catalog = await response.json();
  favorites = favorites.filter((id) => catalog.templates.some((t) => t.id === id));
  render();
} catch {
  $('#main').innerHTML = `<div class="empty-state">${icon('circle-alert')}<h1>目录读取失败</h1><p>检查本机服务与 catalog 校验结果后重试。</p><button class="button" id="reload">${icon('rotate-cw')}重新读取</button></div>`; $('#reload').addEventListener('click', () => location.reload()); icons();
}
