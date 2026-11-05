import { validateV1, validateV2 } from './project-validator.mjs';

export const PURPOSES = { education:'知识讲解', product:'产品介绍', data:'数据报告', story:'叙事短片', motion:'短动效' };
export const DEPTHS = { unspecified:'待明确', introductory:'入门直觉', professional:'专业概述', derivation:'推导 / 研究' };
export const FORMULAS = { unspecified:'待明确', none:'不需要', core:'核心公式', derivation:'必要推导' };
export const TIERS = { current_cli:'当前 CLI 与本地工具', premium:'高玩版', budget:'平民版' };
export const RESOURCE_POLICIES = { current_cli_local:'优先当前助手和本地工具', additional_services_possible:'可讨论额外服务', unspecified:'待明确' };
export const MAX_PROJECT_BYTES = 2 * 1024 * 1024;
// Three human confirmation gates keep the human in charge without adding ceremony
// to every reversible step. Sources: V12 (three stop points) and V13 (two hard checks).
export const GATES = [
  { id:'brief', label:'需求 / Brief 确认', description:'受众、前置知识、讲解深度与公式策略、时长范围、配音与字幕要求' },
  { id:'style_frame', label:'风格帧 / 样片确认', description:'先看开场、记忆点、结尾三帧或首章样片，再放开后续制作' },
  { id:'export', label:'导出前确认', description:'规格、字幕、声音与产物清单逐项确认后才合成最终文件' },
];
// QA contract: "NOT CHECKED" is an explicit state and never counts as a pass.
export const QA_ITEMS = [
  { id:'qa-spec', kind:'technical', requirement:'规格、帧数与编码可读取（分辨率 / 帧率 / 时长 / 帧数）' },
  { id:'qa-decode', kind:'technical', requirement:'完整解码无错误，可正常播放' },
  { id:'qa-timing', kind:'technical', requirement:'字幕 / 旁白与画面时基对齐' },
  { id:'qa-content', kind:'content', requirement:'事实、数字、公式与来源核对' },
  { id:'qa-visual', kind:'visual', requirement:'关键帧与运动抽检（不是完整审片）' },
  { id:'qa-audio', kind:'audio_review', requirement:'响度检查与主观试听（未听写未检查）' },
  { id:'qa-viewing', kind:'viewing', requirement:'完整观看并记录问题' },
  { id:'qa-accept', kind:'user_acceptance', requirement:'用户采用结论' },
];
export const defaultDocuments = () => ({brief:null,script:null,outline:null,source_notes:[]});
export const defaultGates = (revision = 1) => GATES.map(g => ({id:g.id,status:'pending',confirmed_at:null,basis:'',project_revision:revision}));
export const defaultQA = (revision = 1) => QA_ITEMS.map(item => ({id:item.id,kind:item.kind,project_revision:revision,status:'not_checked',evidence:null,notes:''}));
export const defaultResources = () => ({policy:'current_cli_local',available_tools:[],assets:[],max_wait_minutes:null,notes:''});
export const defaultRecords = () => ({original_request:'',assumptions:[],unknowns:[],inputs:[],timeline:null,tools:[],artifacts:[],checks:[],feedback:[]});
export const defaultBrief = () => ({topic:'',purpose:'education',duration_seconds:30,aspect_ratio:'16:9',resolution:'1080p',fps:30,language:'zh-CN',narration:'none',subtitles:true,bgm:'none',usage:'personal',notes:'',audience:'',prerequisites:'',learning_goal:'',depth:'unspecified',formula_policy:'unspecified',duration_min_seconds:30,duration_max_seconds:30,style_preferences:''});
const noneSelected = () => ({template_id:null,template_revision:null,source_id:null,recipe_id:null,recipe_revision:null,tier:'current_cli',reason:''});
export const stableJSON = value => JSON.stringify(value, (_,v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])) : v);
export function safeProjectPath(p) {
  return typeof p==='string' && p.length>0 && !/[\\:\x00-\x1f\x7f]/.test(p) && p.split('/').every(s=>s && s!=='.' && s!=='..');
}
function safeURL(value) { try { const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password; } catch { return false; } }
function schemaErrors(validator, value) {
  return validator(value) ? [] : validator.errors.map(e=>`${e.instancePath || '/'} ${e.message}${e.params.additionalProperty ? ': '+e.params.additionalProperty : ''}`);
}
export function validateProject(project) {
  const errors=schemaErrors(validateV2,project);if(errors.length)return errors;
  const p=project,b=p.brief,s=p.selection;
  if(!b.topic.trim() || !p.title.trim())errors.push('主题和标题不能只有空白。');
  if(!Number.isFinite(Date.parse(p.created_at)) || new Date(p.created_at).toISOString()!==p.created_at)errors.push('created_at 不是有效 UTC 日期。');
  if(!(b.duration_min_seconds<=b.duration_seconds && b.duration_seconds<=b.duration_max_seconds))errors.push('时长须满足最短 ≤ 目标 ≤ 最长。');
  if((p.cost.status==='unknown') !== (p.cost.estimate===null))errors.push('未知费用须为 null；估算／实测费用须有数值及依据。');
  if(Boolean(s.template_id)!==Boolean(s.template_revision) || Boolean(s.template_id)!==Boolean(s.source_id) || Boolean(s.template_id)!==Boolean(p.template))errors.push('模板 ID、版本、来源和快照必须一起存在或一起为空。');
  if(Boolean(s.recipe_id)!==Boolean(s.recipe_revision))errors.push('流程 ID 和版本必须成对记录。');
  if(s.source_id && !p.sources.some(x=>x.id===s.source_id))errors.push('模板来源不在 sources 中。');
  if(p.parent_id===p.id)errors.push('parent_id 不能指向自身。');
  const groups=[p.sources,p.stages,p.resources.assets,p.acceptance,p.records.inputs,p.records.tools,p.records.artifacts,p.records.checks,p.records.feedback];
  for(const group of groups)if(new Set(group.map(x=>x.id)).size!==group.length)errors.push('同一记录集合不能包含重复 ID。');
  for(const row of [...p.records.artifacts,...p.records.checks,...p.records.feedback])if(row.project_revision>p.revision)errors.push(`记录 ${row.id} 指向尚不存在的项目版本。`);
  for(const check of p.records.checks)if(['passed','failed'].includes(check.status)&&!check.evidence)errors.push(`检查 ${check.id} 缺少证据引用。`);
  for(const tool of p.records.tools)if(tool.identity_verified&&!tool.evidence.trim())errors.push(`工具 ${tool.id} 声称核实身份但没有依据。`);
  if(p.gates){
    const ids=p.gates.map(g=>g.id);
    if(new Set(ids).size!==ids.length)errors.push('确认门 ID 不能重复。');
    if(ids.length!==GATES.length||!GATES.every(g=>ids.includes(g.id)))errors.push('确认门必须恰好包含 brief / style_frame / export 三项。');
    for(const gate of p.gates){
      if(gate.status==='confirmed'&&!gate.confirmed_at)errors.push(`确认门 ${gate.id} 标记已确认但缺少确认时间。`);
      if(gate.status!=='confirmed'&&gate.confirmed_at)errors.push(`确认门 ${gate.id} 尚未确认却带有确认时间。`);
      if(gate.project_revision>p.revision)errors.push(`确认门 ${gate.id} 指向尚不存在的项目版本。`);
    }
  }
  const d=p.documents;
  if(d&&(!Array.isArray(d.source_notes)||Object.keys(d).length!==4))errors.push('项目文档结构不完整。');
  if(p.status==='delivered'){
    if(!p.records.artifacts.some(a=>a.kind==='video'&&a.project_revision===p.revision))errors.push('交付状态需要当前版本的视频产物引用；引用仍不等于已检查文件。');
    const open=p.records.checks.filter(c=>['not_checked','pending','failed'].includes(c.status));
    if(open.length)errors.push(`交付状态仍有未通过的检查：${open.map(c=>c.id).join('、')}；NOT CHECKED 不算通过。`);
  }
  const visit=value=>{
    if(!value||typeof value!=='object')return;
    if(Object.hasOwn(value,'base')&&Object.hasOwn(value,'path')){
      if(!(value.base==='url'?safeURL(value.path):safeProjectPath(value.path)))errors.push(`无效引用：${value.path}`);
    }
    for(const child of Object.values(value))visit(child);
  };visit(p);
  for(const source of p.sources){if(!safeProjectPath(source.note_path))errors.push(`无效来源路径：${source.note_path}`);if(source.url!==null&&!safeURL(source.url))errors.push(`无效来源网址：${source.url}`);}
  if(p.template)for(const key of ['reference_path','project_path'])if(p.template[key]!==null&&!safeProjectPath(p.template[key]))errors.push(`无效模板路径：${p.template[key]}`);
  return errors;
}
export function assertProject(project) {
  const errors=validateProject(project);if(errors.length)throw new Error('项目校验失败：\n'+errors.join('\n'));return project;
}
export function createProject(brief, {projectId, originalRequest}={}) {
  const id=globalThis.crypto.randomUUID(),b={...defaultBrief(),...brief};
  if(brief.duration_min_seconds===undefined)b.duration_min_seconds=b.duration_seconds;
  if(brief.duration_max_seconds===undefined)b.duration_max_seconds=b.duration_seconds;
  return assertProject({schema_version:2,id,project_id:projectId??id,revision:1,parent_id:null,created_at:new Date().toISOString(),title:b.topic.slice(0,70),status:'draft',execution_ready:false,brief:b,selection:noneSelected(),template:null,sources:[],requirements:[],stages:[],cost:{status:'unknown',estimate:null,budget_limit:null,currency:'CNY',basis:'未记录报价或实际费用；预算不是预计费用。'},blockers:[],outputs:['可编辑工程','视频／字幕／声音','来源与检查记录'],resources:defaultResources(),acceptance:[],documents:defaultDocuments(),gates:defaultGates(1),records:{...defaultRecords(),checks:defaultQA(1),original_request:originalRequest??b.topic},migration:null});
}
export function loadProject(value) {
  if(value?.schema_version===2)return assertProject(structuredClone(value));
  if(value?.schema_version!==1)throw new Error('不支持的项目版本；仅接受原方案 v1 和共享项目 v2。');
  const errors=schemaErrors(validateV1,value);if(errors.length)throw new Error('旧方案校验失败：\n'+errors.join('\n'));
  const p=structuredClone(value),duration=p.brief.duration_seconds;
  return assertProject({...p,schema_version:2,project_id:p.id,revision:1,parent_id:null,brief:{...defaultBrief(),...p.brief,duration_min_seconds:duration,duration_max_seconds:duration},selection:{...p.selection,reason:''},resources:{...defaultResources(),policy:'unspecified'},acceptance:[],records:{...defaultRecords(),original_request:p.brief.topic},migration:{from_version:1,notes:['旧版受众、深度、公式、资源和验收字段未记录，保留为待明确。','原始 ID、来源版本、费用、声音要求和缺口原样保留；不推定当前可执行。']}});
}
export function parseProject(text) {
  if(new TextEncoder().encode(text).length>MAX_PROJECT_BYTES)throw new Error('项目 JSON 不能超过 2 MiB。');
  let value;try{value=JSON.parse(text);}catch{throw new Error('不是有效的项目 JSON。');}
  return loadProject(value);
}
export function forkProject(project) {
  assertProject(project);
  return {...structuredClone(project),id:globalThis.crypto.randomUUID(),parent_id:project.id,revision:project.revision+1,created_at:new Date().toISOString(),status:'draft'};
}
export function reviseProject(project, changes) {
  const candidate={...structuredClone(project),...changes};
  if(stableJSON(candidate)===stableJSON(project))return assertProject(candidate);
  return assertProject({...candidate,id:globalThis.crypto.randomUUID(),parent_id:project.id,project_id:project.project_id,revision:project.revision+1,created_at:new Date().toISOString(),status:'draft'});
}
export function confirmGate(project, gateId, {basis='', status='confirmed', at=new Date().toISOString()}={}) {
  const gate=(project.gates??defaultGates(project.revision)).find(g=>g.id===gateId);
  if(!gate)throw new Error(`未知确认门：${gateId}`);
  if(!GATES.some(g=>g.id===gateId))throw new Error(`未知确认门：${gateId}`);
  if(status==='confirmed'&&!basis.trim())throw new Error('确认门需要记录确认依据。');
  const gates=(project.gates??defaultGates(project.revision)).map(g=>g.id===gateId?{...g,status,basis:String(basis).trim(),confirmed_at:status==='confirmed'?at:null,project_revision:project.revision}:g);
  return reviseProject(project,{gates});
}
export function updateCheck(project, checkId, {status, evidence=null, notes=''}={}) {
  if(!['not_checked','pending','passed','failed','waived'].includes(status))throw new Error('检查状态无效。');
  const current=project.records.checks.find(c=>c.id===checkId);
  if(!current)throw new Error(`未知检查项：${checkId}`);
  if(['passed','failed'].includes(status)&&!evidence)throw new Error('通过／失败检查必须带证据引用。');
  const checks=project.records.checks.map(c=>c.id===checkId?{...c,status,evidence,notes:String(notes),project_revision:project.revision}:c);
  return reviseProject(project,{records:{...project.records,checks}});
}
export function qaSummary(project) {
  const checks=project.records.checks;
  const open=checks.filter(c=>['not_checked','pending','failed'].includes(c.status));
  return {total:checks.length,passed:checks.filter(c=>c.status==='passed').length,waived:checks.filter(c=>c.status==='waived').length,open:open.map(c=>c.id)};
}
export function selectionIssues(p,catalog) {
  const issues=[];
  for(const [kind,items] of [['template',catalog.templates],['recipe',catalog.recipes]]){
    const id=p.selection[kind+'_id'];if(!id){issues.push(`尚未选择${kind==='template'?'模板':'流程'}。`);continue;}
    const current=items.find(x=>x.id===id);
    if(!current)issues.push(`目录缺少 ${kind}：${id}；保留项目原引用。`);
    else if(current.revision!==p.selection[kind+'_revision'])issues.push(`${id} 版本已变化；保留项目原版本，需明确重新选型。`);
    else if(kind==='template'&&current.source_id!==p.selection.source_id)issues.push(`${id} 来源不匹配。`);
  }
  return issues;
}
export function projectGaps(p) {
  const gaps=[];
  for(const [key,name] of [['audience','受众'],['learning_goal','理解／传播目标']])if(!p.brief[key].trim())gaps.push(`${name}待明确。`);
  if(p.brief.depth==='unspecified')gaps.push('讲解深度待明确。');
  if(p.brief.formula_policy==='unspecified')gaps.push('公式策略待明确。');
  if(!p.acceptance.length)gaps.push('验收要求待记录。');
  const pendingGates=(p.gates??[]).filter(g=>g.status==='pending').map(g=>GATES.find(x=>x.id===g.id)?.label??g.id);
  if(pendingGates.length)gaps.push(`确认门待确认：${pendingGates.join('、')}。`);
  if(p.documents){
    for(const [key,label] of [['brief','需求 Brief'],['script','口播 / 解说稿'],['outline','分镜 / 开发大纲']])if(!p.documents[key])gaps.push(`${label}文档未提供（显式为空）。`);
  }
  const openChecks=(p.records?.checks??[]).filter(c=>['not_checked','pending','failed'].includes(c.status));
  if(openChecks.length)gaps.push(`QA 未通过 ${openChecks.length} 项：${openChecks.map(c=>c.id).join('、')}；NOT CHECKED 不算通过。`);
  return gaps;
}
export function projectReferences(p) {
  const refs=[];
  const visit=v=>{if(!v||typeof v!=='object')return;if(v.base&&v.path)refs.push(v);for(const x of Object.values(v))visit(x);};visit(p);
  if(p.template)for(const k of ['reference_path','project_path'])if(p.template[k])refs.push({base:'repository',path:p.template[k]});
  for(const s of p.sources)refs.push({base:'repository',path:s.note_path});
  return [...new Map(refs.map(r=>[`${r.base}:${r.path}`,r])).values()];
}
export function projectMarkdown(p) {
  assertProject(p);
  const safe=s=>String(s??'').replaceAll('`',"'").replaceAll('\r','');
  const bullets=rows=>rows.length?rows.map(x=>`- ${safe(x)}`).join('\n'):'- 尚未记录';
  const gateLabel=id=>GATES.find(g=>g.id===id)?.label??id;
  const gateBlock=(p.gates??[]).length
    ? p.gates.map(g=>`- ${gateLabel(g.id)}：${g.status==='confirmed'?`已确认（v${g.project_revision}；${g.confirmed_at}）`:g.status==='waived'?'已豁免（不代表已检查）':'待确认'}${g.basis?`；依据：${safe(g.basis)}`:''}`).join('\n')
    : '- 旧项目未记录确认门；新项目应包含 brief / style_frame / export 三项。';
  const docs=p.documents;
  const docBlock=[
    ['brief','需求 Brief'],['script','口播 / 解说稿'],['outline','分镜 / 开发大纲'],
  ].map(([key,label])=>`- ${label}：${docs?.[key]?`${docs[key].base}:${docs[key].path}`:'未提供（显式为空）'}`)
    .concat(`- 来源文件：${docs?.source_notes?.length?docs.source_notes.map(r=>`${r.base}:${r.path}`).join('；'):'未记录'}`).join('\n');
  const qaBlock=(p.records.checks??[]).length
    ? p.records.checks.map(c=>`- [${c.kind}] ${c.id}：${c.status}${c.evidence?`；证据 ${c.evidence.base}:${c.evidence.path}`:''}${c.notes?`；${safe(c.notes)}`:''}`).join('\n')
    : '- 未记录检查项；NOT CHECKED 不算通过。';
  return `# VideoLab 制作任务包\n\n项目 ${p.project_id} / 版本 ${p.revision} / 快照 ${p.id}\n状态：${p.status}；本任务包不能自动执行。\n\n## 需求\n\n${safe(p.brief.topic)}\n\n- 受众：${safe(p.brief.audience)||'待明确'}\n- 前置知识：${safe(p.brief.prerequisites)||'待明确'}\n- 理解／传播目标：${safe(p.brief.learning_goal)||'待明确'}\n- 深度：${DEPTHS[p.brief.depth]}；公式：${FORMULAS[p.brief.formula_policy]}\n- 规格：${p.brief.duration_seconds} 秒（${p.brief.duration_min_seconds}–${p.brief.duration_max_seconds}）/ ${p.brief.aspect_ratio} / ${p.brief.resolution} / ${p.brief.fps} fps\n- 用途：${PURPOSES[p.brief.purpose]}；语言：${p.brief.language}；使用：${p.brief.usage}\n- 配音：${p.brief.narration}；字幕：${p.brief.subtitles?'有':'无'}；BGM：${p.brief.bgm}\n- 风格偏好：${safe(p.brief.style_preferences)||'由助手按内容选配'}\n- 附加要求：${safe(p.brief.notes)||'无'}\n\n## 选型与资源\n\n- 模板：${p.selection.template_id??'未选择'} @ ${p.selection.template_revision??'待定'}\n- 流程：${p.selection.recipe_id??'未选择'} @ ${p.selection.recipe_revision??'待定'}\n- 原始模板：${p.template?.reference_path??'未选择'}；工程：${p.template?.project_path??'未取得'}\n- 许可：${safe(p.template?.license.label??'未核查')}；${safe(p.template?.license.note??'')}\n- 选择理由：${safe(p.selection.reason)||'待补'}\n- 策略：${TIERS[p.selection.tier]}；${RESOURCE_POLICIES[p.resources.policy]}（偏好不等于调用授权）\n- 本机工具：${safe(p.resources.available_tools.join('、'))||'待登记'}\n- 等待时间：${p.resources.max_wait_minutes??'未设定'} 分钟；资源补充：${safe(p.resources.notes)}\n- 预算上限：${p.cost.budget_limit??'未设定'} ${p.cost.currency}；预计费用：${p.cost.estimate??'未知'}；依据：${safe(p.cost.basis)}\n\n## 确认门（三处人工确认）

${gateBlock}

## 项目文档（brief / script / outline）

${docBlock}

## QA 清单（NOT CHECKED 不算通过）

${qaBlock}

## 来源与固定版本\n\n${bullets(p.sources.map(s=>`${s.id}：${s.title}；${s.url??'本项目文件'}；版本 ${s.revision??'见笔记'}；笔记 ${s.note_path}`))}\n\n## 阶段与缺口\n\n${bullets(p.stages.map(s=>`${s.name}：${s.strategy}；交付 ${s.output}；provider/model_id：${s.provider??'未知'}/${s.model_id??'未知'}`))}\n\n${bullets([...p.requirements,...p.blockers,...projectGaps(p)])}\n\n## 验收要求\n\n${bullets(p.acceptance.map(c=>`[${c.category}] ${c.requirement}`))}\n\n## 制作记录\n\n原始要求：${safe(p.records.original_request)}\n\n${bullets(p.records.artifacts.map(a=>`产物 ${a.id}（版本 ${a.project_revision}）：${a.reference.base}:${a.reference.path}`))}\n\n${bullets(p.records.checks.map(c=>`检查 ${c.id}（版本 ${c.project_revision}）：${c.kind} / ${c.status}；${c.evidence?c.evidence.base+':'+c.evidence.path:'未记录证据'}；${c.notes}`))}\n\n${bullets(p.records.feedback.map(f=>`反馈 ${f.id}（版本 ${f.project_revision}，${f.time_seconds??'整片'} 秒）：${f.text} / ${f.status}`))}\n\n${bullets(p.records.tools.map(t=>`工具 ${t.name}：${t.role}；${t.provider??'未知'}/${t.model_id??'未知'}；版本 ${t.version??'未知'}；依据 ${t.evidence||'未记录'}`))}\n\n## 引用与未知项\n\n${bullets(projectReferences(p).map(r=>`${r.base}:${r.path}`))}\n\n${bullets([...p.records.assumptions.map(x=>'假设：'+x),...p.records.unknowns.map(x=>'未知：'+x)])}\n\n${bullets(p.outputs)}\n\n这是引用型交接，完整结构以同版本 JSON 为准，不包含媒体、源码或密钥。技术检查、完整观看、试听和用户采用分别记录；旧版本证据不自动证明新版本通过。额外费用、外发与发布按会话实际授权处理。\n`;
}
