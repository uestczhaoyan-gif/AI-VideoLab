import { PURPOSES, assertProject, createProject, reviseProject } from './project.mjs';

const briefFields = [
  'topic', 'purpose', 'audience', 'duration_seconds', 'aspect_ratio', 'language',
  'tone', 'style_preferences', 'deadline', 'usage', 'depth', 'formula_policy', 'learning_goal', 'viewing_context',
];
const patterns = {
  product: /产品|宣传片|界面|录屏|app\b|product/i,
  data: /数据报告|数据可视化|统计|图表|dashboard/i,
  education: /科普|讲解|解释|原理|公式|推导|教材|教学|课堂|explainer/i,
  story: /故事|叙事|剧情|电影|写实|短剧|cinematic/i,
};

export function inferPurpose(topic) {
  return Object.entries(patterns).find(([, pattern]) => pattern.test(topic))?.[0] ?? 'motion';
}

// Use the existing project contract for the CLI, the planner and subsequent revisions.
export function createRoutingProject(input = {}) {
  const topic = input.topic?.trim();
  if (!topic) throw new Error('需要一句视频主题。');
  const explicit = Object.fromEntries(briefFields.filter((key) => input[key] != null).map((key) => [key, input[key]]));
  const fields = Object.fromEntries(Object.keys(explicit).map((key) => [key, input.field_sources?.[key] ?? 'user']));
  const defaults = { duration_seconds: 10, aspect_ratio: '16:9', usage: 'personal', language: 'zh-CN' };
  for (const key of Object.keys(defaults)) fields[key] ??= 'default';
  fields.purpose ??= 'inferred';
  const project = createProject({
    ...defaults,
    purpose: inferPurpose(topic),
    ...explicit,
    topic,
    resolution: '720p',
    field_sources: fields,
  }, { originalRequest: topic });
  project.cost.budget_limit = input.budget ?? null;
  project.resources.max_wait_minutes = input.max_wait_minutes ?? null;
  return assertProject(project);
}

export function reviseRoutingProject(project, patch, fieldSources = {}) {
  const updates = Object.fromEntries(briefFields.filter((key) => Object.hasOwn(patch, key)).map((key) => [key, patch[key]]));
  const candidate = structuredClone(project);
  Object.assign(candidate.brief, updates);
  candidate.brief.field_sources ??= {};
  for (const key of Object.keys(updates)) candidate.brief.field_sources[key] = fieldSources[key] ?? 'user';
  if (Object.hasOwn(updates, 'topic')) {
    candidate.brief.topic = updates.topic.trim();
    candidate.title = candidate.brief.topic.slice(0, 70);
    if (!Object.hasOwn(updates, 'purpose') && candidate.brief.field_sources.purpose === 'inferred') {
      candidate.brief.purpose = inferPurpose(candidate.brief.topic);
    }
  }
  if (Object.hasOwn(updates, 'duration_seconds')) {
    candidate.brief.duration_min_seconds = updates.duration_seconds;
    candidate.brief.duration_max_seconds = updates.duration_seconds;
  }
  if (Object.hasOwn(patch, 'budget')) candidate.cost.budget_limit = patch.budget;
  if (Object.hasOwn(patch, 'max_wait_minutes')) candidate.resources.max_wait_minutes = patch.max_wait_minutes;
  return reviseProject(project, candidate);
}

function audienceType(brief) {
  if (['professional', 'derivation'].includes(brief.depth) || /专业|研究生|专家|从业|工程师|advanced|expert/i.test(brief.audience)) return 'advanced';
  if (brief.depth === 'introductory' || /小学生|初中|高中|幼儿|儿童|小朋友|入门|新手|大众|beginner/i.test(brief.audience)) return 'beginner';
  return 'general';
}

function requestedWorkflow(brief) {
  const request = `${brief.style_preferences} ${brief.topic}`;
  if (/真人|电影级|电影感|写实人物|写实镜头|角色连续/i.test(request)) return 'generative';
  if (/逐笔|手绘|蜡笔|水墨|绘本/i.test(request)) return 'draw';
  if (brief.formula_policy === 'derivation' || /公式推导|数学证明|严格推导/i.test(request)) return 'math';
  return null;
}

function viewingReasons(brief, workflow) {
  const context = brief.viewing_context ?? '';
  if (workflow.id === 'draw' && brief.purpose === 'education' && /课堂|投影|教室/.test(context)) {
    return ['课堂观看适合用逐步绘制，让观众跟着讲解看同一图中的变化。'];
  }
  if (workflow.id === 'motion' && /手机|静音|竖屏/.test(context)) {
    return ['移动或静音观看适合用简洁画面与易读文字独立传达要点。'];
  }
  return [];
}

function evaluate(project, workflow, style, runtime, now) {
  const { brief } = project;
  const reject = [];
  const blockers = [];
  if (brief.duration_seconds < workflow.duration[0] || brief.duration_seconds > workflow.duration[1]) {
    reject.push(`片长需在 ${workflow.duration.join('–')} 秒内。`);
  }
  if (runtime?.aspects && !runtime.aspects.includes(brief.aspect_ratio)) reject.push('执行后端不支持所选画幅。');
  if (runtime?.maxDuration && brief.duration_seconds > runtime.maxDuration) blockers.push(`当前本地创作入口最多支持 ${runtime.maxDuration} 秒。`);
  if (brief.usage === 'commercial' && (style.resource?.commercial !== 'allowed' || runtime?.commercial !== 'allowed')) {
    reject.push('尚未核实该组合的商业使用许可。');
  }
  const assetKinds = new Set(runtime?.assetKinds ?? []);
  for (const kind of workflow.required_assets) {
    if (!assetKinds.has(kind)) blockers.push(kind === 'product_screenshot_or_recording' ? '需要真实产品截图或录屏。' : `缺少素材 ${kind}。`);
  }
  const budget = project.cost.budget_limit;
  const cost = runtime?.cost?.currency === project.cost.currency && Number.isFinite(runtime?.cost?.amount) && runtime.cost.amount >= 0 ? runtime.cost.amount : null;
  if (budget !== null && cost !== null && cost > budget) reject.push('预计费用超过预算。');
  if (budget !== null && cost === null) blockers.push('成本未知，无法确认满足预算。');
  const wait = Number.isFinite(runtime?.minutes) && runtime.minutes >= 0 ? runtime.minutes : null;
  const deadline = brief.deadline ? Date.parse(brief.deadline) : null;
  const remaining = deadline === null ? Infinity : (deadline - now) / 60_000;
  const waitLimit = Math.min(remaining, project.resources.max_wait_minutes ?? Infinity);
  if (remaining <= 0) reject.push('交付期限已过。');
  else if (wait !== null && wait > waitLimit) reject.push('预计等待超过交付限制。');
  else if (Number.isFinite(waitLimit) && wait === null) blockers.push('耗时未知，无法确认按时交付。');
  if (style.resource?.availability === 'indexed') blockers.push('风格 Prompt 尚未恢复到本地。');
  if (!runtime?.ready) blockers.push(runtime?.reason ?? '尚未接入可调用的制作流程。');
  return { reject, blockers, cost, wait };
}

export function decideRoute(project, registry, environment = {}, now = Date.now(), { agent = false } = {}) {
  assertProject(project);
  const { brief } = project;
  const wanted = requestedWorkflow(brief);
  const audience = audienceType(brief);
  const ranked = [];
  const excluded = [];
  for (const workflow of registry.workflows) {
    if (wanted ? workflow.id !== wanted : !workflow.purposes.includes(brief.purpose)) continue;
    if (!wanted && workflow.id === 'generative') continue;
    for (const style of registry.styles.filter((entry) => entry.workflows.includes(workflow.id))) {
      // Agent routes recommend creative references. Tools and feasibility are determined in production.
      const limits = agent ? { reject: [], blockers: [], cost: null, wait: null }
        : evaluate(project, workflow, style, environment[workflow.adapter], now);
      if (limits.reject.length) {
        excluded.push({ workflow_id: workflow.id, style_id: style.id, reasons: limits.reject });
        continue;
      }
      const preference = brief.style_preferences.toLowerCase();
      const text = `${brief.topic} ${brief.tone ?? ''}`.toLowerCase();
      const preferences = style.signals.filter((signal) => preference.includes(signal));
      const matches = style.signals.filter((signal) => text.includes(signal));
      const ready = limits.blockers.length === 0;
      const reasons = [`表达类型：${PURPOSES[brief.purpose]} · ${workflow.label}`];
      let score = ready ? 3 : 0;
      if (!agent && workflow.verification === 'probe_passed') score += 2;
      if (wanted) reasons.push(`需求包含${workflow.capabilities.join('、')}等制作能力。`);
      if (style.audience === audience && audience !== 'general') {
        score += 7;
        reasons.push(audience === 'beginner' ? '面向入门受众，降低画面信息密度。' : '适合有先修知识的受众，保留结构细节。');
      }
      if (style.audience === 'advanced' && audience === 'beginner') score -= 5;
      if (style.audience === 'general') score += 1;
      if (preferences.length) {
        score += 12 + preferences.length;
        reasons.push(`匹配风格偏好：${preferences.join('、')}。`);
      }
      if (matches.length) {
        score += matches.length * 2;
        reasons.push(`匹配内容或情绪：${matches.join('、')}。`);
      }
      if (audience === 'advanced' && workflow.id === 'math') score += 4;
      if (brief.duration_seconds >= 45 && workflow.id === 'math') {
        score += 2;
        reasons.push('片长足以展开分步骤图解。');
      } else if (brief.duration_seconds <= 20 && workflow.id === 'motion' && brief.field_sources?.duration_seconds !== 'default') {
        score += 2;
        reasons.push('短片适合集中呈现一个观点或节奏段落。');
      }
      const contextReasons = viewingReasons(brief, workflow);
      score += 4 * contextReasons.length;
      reasons.push(...contextReasons);
      ranked.push({
        style_id: style.id, style: style.label,
        workflow_id: workflow.id, workflow: workflow.label, workflow_version: workflow.version,
        adapter: agent ? 'agent' : workflow.adapter, suggested_tool: workflow.adapter,
        source: workflow.source, verification: workflow.verification,
        steps: workflow.steps, resources: [style.resource, ...workflow.references].filter(Boolean),
        ready, blockers: limits.blockers, estimated_cost: limits.cost, estimated_minutes: limits.wait,
        reasons, score,
      });
    }
  }
  ranked.sort((a, b) => b.score - a.score || a.style_id.localeCompare(b.style_id) || a.workflow_id.localeCompare(b.workflow_id));
  if (agent) {
    ranked.push({
      style_id: 'agent-designed', style: brief.style_preferences || '由 Agent 设计',
      workflow_id: 'agent-designed', workflow: '按需求制定制片流程', workflow_version: 1,
      adapter: 'agent', source: null, verification: 'unverified',
      steps: ['选参考与定方案', '写分镜和代码', '调用工具制作', '检查并交付'],
      resources: [], ready: true, blockers: [], estimated_cost: null, estimated_minutes: null,
      reasons: ['由 Agent 根据需求检索资源，临场设计分镜、选择工具和写代码。'],
    });
  }
  const selected = ranked[0] ?? null;
  const alternatives = ranked.slice(1).sort((a, b) => Number(a.workflow_id === selected.workflow_id) - Number(b.workflow_id === selected.workflow_id)).slice(0, agent ? 1 : 2);
  if (agent && selected?.workflow_id !== 'agent-designed' && !alternatives.some((entry) => entry.workflow_id === 'agent-designed')) {
    alternatives.push(ranked.at(-1));
  }
  const questions = [];
  if (selected?.blockers.includes('需要真实产品截图或录屏。') ||
      (agent && selected?.workflow_id === 'product' && !project.resources.assets.length)) {
    questions.push('有真实产品截图或录屏的话，请在需求里说明本机素材位置。');
  }
  if (!brief.audience) questions.push('这个视频主要给谁看？');
  if (brief.field_sources?.aspect_ratio === 'default') questions.push('主要用横屏展示，还是竖屏观看？');
  return {
    schema_version: 1,
    project_id: project.project_id,
    brief_revision: project.revision,
    status: agent ? 'agent_review' : !selected ? 'no_feasible_route' : selected.ready ? 'ready' : 'planning_only',
    selected, alternatives, excluded, questions: questions.slice(0, 2),
  };
}
