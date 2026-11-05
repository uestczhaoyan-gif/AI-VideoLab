import { PURPOSES, createProject, assertProject, reviseProject, defaultBrief, projectMarkdown } from '../../../shared/project.mjs';
export { PURPOSES };
export const COLLECTIONS = { LEMO:'Lemo · 51', MG15:'MG · 15', CAP:'Prompt · 341', TOOLS:'其他工具' };
export const KINDS = { reference:'参考', prompt:'Prompt', project:'工程' };

export function recommendRecipes(catalog, purpose, template) {
  return catalog.recipes.map(recipe => {
    const purposeMatch=recipe.purposes.includes(purpose),templateMatch=template?.recipe_ids.includes(recipe.id)??false;
    return {...recipe,score:Number(purposeMatch)*2+Number(templateMatch),reasons:[purposeMatch?'用途匹配':'用途需复核',templateMatch?'有模板关联':'模板兼容待核对']};
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
export function recommendTemplates(catalog,brief,limit=4) {
  const hints={education:['科普','解释','教育','图解','白板','信息图','explainer'],product:['产品','发布','拆解','实机','录屏','product'],data:['数据','图表','统计','data','chart'],story:['叙事','故事','绘本','story'],motion:['动态','运动','矢量','形变','motion']};
  return catalog.templates.filter(t=>brief.usage!=='commercial'||t.license.commercial!=='restricted').map(t=>{
    const haystack=[t.name,t.category,t.summary,...t.tags].join(' ').toLowerCase(),declared=t.purposes.includes(brief.purpose),hint=(hints[brief.purpose]??[]).find(x=>haystack.includes(x));
    return {...t,score:Number(declared)*4+Number(Boolean(hint))*2,reason:declared?'已有用途标注':hint?`索引含“${hint}”`:'未匹配'};
  }).filter(t=>t.score>0).sort((a,b)=>b.score-a.score||Number(b.availability?.preview??false)-Number(a.availability?.preview??false)).slice(0,limit);
}
export function filterTemplates(templates,filters={}) {
  const terms=(filters.query??'').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return templates.filter(t=>{
    const text=[t.name,t.summary,t.upstream_id,t.category,...t.tags].join(' ').toLocaleLowerCase();
    return terms.every(term=>text.includes(term))&&(!filters.collection||t.collection===filters.collection)&&(!filters.kind||t.kind===filters.kind)&&(!filters.purpose||t.purposes.includes(filters.purpose))&&(!filters.category||t.category===filters.category)&&(!filters.availableOnly||t.availability?.preview)&&(!filters.favoritesOnly||filters.favorites?.includes(t.id))&&(!filters.commercialOnly||t.license.commercial==='allowed');
  });
}
const lines=s=>[...new Set(String(s??'').split('\n').map(x=>x.trim()).filter(Boolean))];
export function projectToForm(p) {
  const b=p.brief;
  return {topic:b.topic,purpose:b.purpose,duration:String(b.duration_seconds),durationMin:String(b.duration_min_seconds),durationMax:String(b.duration_max_seconds),aspect:b.aspect_ratio,resolution:b.resolution,fps:String(b.fps),language:b.language,narration:b.narration,subtitles:b.subtitles,bgm:b.bgm,currency:p.cost.currency,usage:b.usage,budget:p.cost.budget_limit??'',notes:b.notes,audience:b.audience,prerequisites:b.prerequisites,learningGoal:b.learning_goal,depth:b.depth,formulaPolicy:b.formula_policy,stylePreferences:b.style_preferences,resourcePolicy:p.resources.policy,availableTools:p.resources.available_tools.join('\n'),resourceNotes:p.resources.notes,maxWait:p.resources.max_wait_minutes??'',selectionReason:p.selection.reason,acceptance:p.acceptance.map(c=>c.requirement).join('\n')};
}
export function emptyForm() {
  const b=defaultBrief();
  return {topic:'',purpose:b.purpose,duration:'30',durationMin:'',durationMax:'',aspect:b.aspect_ratio,resolution:b.resolution,fps:'30',language:b.language,narration:b.narration,subtitles:b.subtitles,bgm:b.bgm,currency:'CNY',usage:b.usage,budget:'',notes:'',audience:'',prerequisites:'',learningGoal:'',depth:'unspecified',formulaPolicy:'unspecified',stylePreferences:'',resourcePolicy:'current_cli_local',availableTools:'',resourceNotes:'',maxWait:'',selectionReason:'',acceptance:''};
}
export function buildPlan(catalog,input,templateId,recipeId,tier,base=null) {
  const template=catalog.templates.find(t=>t.id===templateId),recipe=catalog.recipes.find(r=>r.id===recipeId);
  if((templateId&&!template)||(recipeId&&!recipe))throw new Error('请选择有效模板与流程。');
  if(!['current_cli','premium','budget'].includes(tier))throw new Error('请选择方案档位。');
  if(base&&((templateId===base.selection.template_id&&template&&template.revision!==base.selection.template_revision)||(recipeId===base.selection.recipe_id&&recipe&&recipe.revision!==base.selection.recipe_revision)))throw new Error('目录版本已变化，不能静默替换原方案。');
  const topic=String(input.topic??'').trim(),duration=Number(input.duration);
  if(!topic||topic.length>2000)throw new Error('请填写主题或文案（不超过 2000 字）。');
  if(!PURPOSES[input.purpose])throw new Error('请选择视频用途。');
  if(!Number.isFinite(duration)||duration<5||duration>3600)throw new Error('时长需在 5 到 3600 秒之间。');
  const budget=input.budget===''||input.budget==null?null:Number(input.budget);
  if(budget!==null&&(!Number.isFinite(budget)||budget<=0||budget>100000))throw new Error('预算需为大于零的有效金额。');
  const b={topic,purpose:input.purpose,duration_seconds:duration,aspect_ratio:input.aspect,resolution:input.resolution,fps:Number(input.fps),language:input.language,narration:input.narration,subtitles:input.subtitles,bgm:input.bgm,usage:input.usage,notes:String(input.notes??''),audience:String(input.audience??''),prerequisites:String(input.prerequisites??''),learning_goal:String(input.learningGoal??''),depth:input.depth??'unspecified',formula_policy:input.formulaPolicy??'unspecified',duration_min_seconds:input.durationMin===''||input.durationMin==null?duration:Number(input.durationMin),duration_max_seconds:input.durationMax===''||input.durationMax==null?duration:Number(input.durationMax),style_preferences:String(input.stylePreferences??'')};
  const original=base??createProject(b);
  const sameTemplate=Boolean(base)&&base.selection.template_id===(template?.id??null)&&base.selection.template_revision===(template?.revision??null);
  const sameRecipe=Boolean(base)&&base.selection.recipe_id===(recipe?.id??null)&&base.selection.recipe_revision===(recipe?.revision??null);
  const blockers=[...(recipe?.limitations??[]),...(tier==='current_cli'?['统一执行适配未接入；由当前助手核查所需本地工具。']:['尚未配置准确 provider/model_id，双档策略未实测。'])];
  if(template&&template.license.commercial!=='allowed'&&input.usage==='commercial')blockers.push(template.license.commercial==='restricted'?'所选来源禁止相应商业使用，不能执行商业制作。':'模板和资产商用许可尚待逐项核查。');
  if(template&&!template.availability?.reference)blockers.push('本机缺少模板原始文件，需从固定来源恢复。');
  if(input.narration!=='none')blockers.push('配音文件或 TTS 服务、音色与授权尚待提供。');
  if(input.bgm!=='none')blockers.push('BGM 文件、曲目与授权尚待提供。');
  if(base&&base.cost.status!=='unknown'&&input.currency!==base.cost.currency)throw new Error('已有费用记录不能直接换币种；请先核对原始费用依据。');
  const sources=[...new Set([...(template?[template.source_id]:[]),...(recipe?.source_ids??[])])].map(id=>catalog.sources.find(s=>s.id===id));
  const selected={template_id:template?.id??null,template_revision:template?.revision??null,source_id:template?.source_id??null,recipe_id:recipe?.id??null,recipe_revision:recipe?.revision??null,tier,reason:String(input.selectionReason??base?.selection.reason??'')};
  const changes={
    title:topic.slice(0,70),brief:b,selection:selected,
    template:sameTemplate?base.template:template?{name:template.name,reference_path:template.reference_path,project_path:template.project_path,license:template.license}:null,
    sources:sameTemplate&&sameRecipe?base.sources:sources,
    requirements:sameRecipe?base.requirements:[...(recipe?.requirements??[])],
    stages:sameRecipe&&base.selection.tier===tier?base.stages:(recipe?.stages??[]).map(s=>({id:s.id,name:s.name,output:s.output,strategy:tier==='current_cli'?(s.id==='render'?'复用已核查的本地渲染工具':'复用当前 CLI 助手，按需核查本地工具'):s[tier],provider:null,model_id:null,state:'not_configured'})),
    cost:{...original.cost,budget_limit:budget,currency:input.currency},
    blockers:[...new Set([...(sameTemplate&&sameRecipe?base.blockers:[]),...blockers])],
    resources:{...original.resources,policy:input.resourcePolicy??original.resources.policy,available_tools:input.availableTools===undefined?original.resources.available_tools:lines(input.availableTools),notes:String(input.resourceNotes??original.resources.notes),max_wait_minutes:input.maxWait===''||input.maxWait==null?null:Number(input.maxWait)},
    acceptance:input.acceptance===undefined?original.acceptance:lines(input.acceptance).map(requirement=>original.acceptance.find(c=>c.requirement===requirement)??{id:globalThis.crypto.randomUUID(),category:'general',requirement}),
  };
  return base?reviseProject(base,changes):assertProject({...original,...changes});
}
export const planMarkdown=projectMarkdown;
