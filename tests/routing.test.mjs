import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRoutingProject, decideRoute, reviseRoutingProject } from '../shared/routing.mjs';
import { loadProject } from '../shared/project.mjs';
import { loadCatalog } from '../tools/catalog/validate.mjs';
import { loadWorkflowCatalog } from '../tools/catalog/workflows.mjs';
import { drawingCuts } from '../tools/workflows/compose.mjs';
import { acceptProposal, readPromptReferences } from '../tools/workflows/proposal.mjs';

const registry = loadWorkflowCatalog(loadCatalog());
const route = (input, environment) => decideRoute(createRoutingProject(input), registry, environment, Date.parse('2026-11-13T12:00:00Z'));

test('same science topic adapts to the audience and respects an explicit medium', () => {
  const common = { topic: '黑洞科普', duration_seconds: 60 };
  assert.equal(route({ ...common, audience: '初中生' }).selected.workflow_id, 'draw');
  assert.equal(route({ ...common, audience: '物理专业学生' }).selected.workflow_id, 'math');
  assert.equal(route({ ...common, audience: '物理专业学生', style_preferences: '逐笔手绘' }).selected.workflow_id, 'draw');
  assert.equal(route({ topic: '公式推导', purpose: 'education' }).selected.workflow_id, 'math');
});

test('viewing context informs workflow choices before a duration is specified', () => {
  const common = { topic: '解释影子为什么会变长', audience: '小学生' };
  const recommend = (context) => decideRoute(createRoutingProject({
    ...common, viewing_context: context,
  }), registry, {}, Date.now(), { agent: true }).selected;
  const classroom = recommend('老师在课堂上投影');
  const mobile = recommend('家长在手机上静音播放');
  assert.equal(classroom.workflow_id, 'draw');
  assert.match(classroom.reasons.at(-1), /逐步绘制/);
  assert.equal(mobile.workflow_id, 'motion');
  assert.match(mobile.reasons.at(-1), /易读文字/);
});

test('assets, deadline, budget and commercial rights constrain execution', () => {
  const shotcraft = { ready: true, minutes: 10, cost: { currency: 'CNY', amount: 20 } };
  const product = { topic: '产品发布', duration_seconds: 15 };
  assert.equal(route(product, { shotcraft }).status, 'planning_only');
  assert.match(route(product, { shotcraft }).questions[0], /截图或录屏/);
  shotcraft.assetKinds = ['product_screenshot_or_recording'];
  assert.equal(route(product, { shotcraft }).status, 'ready');
  assert.equal(route({ ...product, budget: 10 }, { shotcraft }).status, 'no_feasible_route');
  const zeroBudget = createRoutingProject({ ...product, budget: 0 });
  assert.equal(zeroBudget.cost.budget_limit, 0);
  assert.equal(zeroBudget.cost.estimate, null);
  assert.equal(route({ ...product, budget: 0 }, { shotcraft }).status, 'no_feasible_route');
  assert.equal(route({ ...product, max_wait_minutes: 5 }, { shotcraft }).status, 'no_feasible_route');
  assert.equal(route({ ...product, usage: 'commercial' }, { shotcraft }).status, 'no_feasible_route');
  assert.equal(route({ ...product, deadline: '2026-11-13T19:59:00+08:00' }, { shotcraft }).status, 'no_feasible_route');
  assert.equal(route({ ...product, duration_seconds: 181 }, { shotcraft }).status, 'no_feasible_route');
  assert.equal(route({ ...product, budget: 100 }, { shotcraft: { ...shotcraft, cost: null } }).status, 'planning_only');
});

test('unverified generative work stays visible as a capability gap', () => {
  const decision = route({ topic: '写实人物电影感短片' });
  assert.equal(decision.selected.workflow_id, 'generative');
  assert.equal(decision.status, 'planning_only');
  assert.equal(decision.selected.resources.length, 0);
});

test('Agent production offers a route even without preinstalled workflow adapters', () => {
  const project = createRoutingProject({ topic: '做一段像素风星星动画', style_preferences: '像素风' });
  const decision = decideRoute(project, registry, {}, Date.now(), { agent: true });
  const options = [decision.selected, ...decision.alternatives];
  assert.ok(options.every((item) => item.adapter === 'agent'));
  assert.ok(options.some((item) => item.workflow_id === 'agent-designed'));
  const empty = decideRoute(project, { workflows: [], styles: [] }, {}, Date.now(), { agent: true });
  assert.equal(empty.selected.workflow_id, 'agent-designed');
  const math = createRoutingProject({ topic: '带公式的严格推导', purpose: 'education' });
  const selected = decideRoute(math, registry, {}, Date.now(), { agent: true }).selected;
  assert.equal(selected.workflow_id, 'math');
  assert.equal(selected.adapter, 'agent');
});

test('content length affects pacing and runtime restrictions stay explicit', () => {
  const request = { topic: '产品演示', purpose: 'product' };
  const shotcraft = { ready: true, assetKinds: ['product_screenshot_or_recording'], aspects: ['16:9'] };
  assert.equal(route({ ...request, duration_seconds: 15 }, { shotcraft }).selected.ready, true);
  assert.equal(route({ ...request, duration_seconds: 90 }, { shotcraft: { ...shotcraft, maxDuration: 60 } }).status, 'planning_only');
  assert.equal(route({ ...request, aspect_ratio: '9:16' }, { shotcraft }).status, 'no_feasible_route');
  const motion = { topic: '标题动效', purpose: 'motion' };
  const short = route({ ...motion, duration_seconds: 12 });
  const long = route({ ...motion, duration_seconds: 90 });
  assert.notDeepEqual(short.selected.reasons, long.selected.reasons);
  const noRuntime = route(motion, { hyperframes: { ready: false, reason: '本地依赖缺失。' } });
  assert.ok(noRuntime.selected.blockers.includes('本地依赖缺失。'));
});

test('an existing decision retains its workflow version when the catalog changes', () => {
  const project = createRoutingProject({ topic: '几何动效', purpose: 'motion' });
  const old = decideRoute(project, registry);
  const updated = structuredClone(registry);
  const workflow = updated.workflows.find((entry) => entry.id === old.selected.workflow_id);
  workflow.version += 1;
  workflow.verification = 'unverified';
  const next = decideRoute(project, updated);
  assert.equal(old.selected.workflow_version, 1);
  assert.equal(old.selected.verification, 'probe_passed');
  assert.equal(next.selected.workflow_version, 2);
  assert.equal(next.selected.verification, 'unverified');
});

test('Anidoodle cuts fit its beat grid and cover all frames', () => {
  for (const [duration, fps, count] of [[10, 30, 4], [3, 24, 5], [5.2, 60, 3]]) {
    const cuts = drawingCuts(duration, fps, count);
    assert.equal(cuts.length, count + 1);
    assert.equal(cuts[0], 0);
    assert.equal(cuts.at(-1), Math.round(duration * fps));
    cuts.slice(0, -1).forEach((cut, index) => {
      assert.equal(cut % (fps / 2), 0);
      assert.ok(cut < cuts[index + 1]);
    });
  }
});

test('revision preserves the project and old make projects keep their reference paths', () => {
  const project = createRoutingProject({ topic: '黑洞科普', audience: '成人' });
  const next = reviseRoutingProject(project, { audience: '儿童', aspect_ratio: '9:16' });
  assert.equal(next.project_id, project.project_id);
  assert.equal(next.revision, 2);
  assert.equal(next.brief.topic, project.brief.topic);
  assert.equal(next.brief.field_sources.aspect_ratio, 'user');
  const old = loadProject({
    schema_version: 1, mode: 'agent_led', topic: '旧任务', duration: 3, fps: 30, aspect: '1:1',
    resources: [{ id: 'lemo-whiteboard', prompt_path: 'resources/prompts/lemo/whiteboard/STYLE.md' }],
  });
  assert.equal(old.brief.duration_seconds, 3);
  assert.equal(old.migration.from_version, 1);
  assert.match(old.records.inputs[0].reference.path, /whiteboard/);
});

test('make and route use the same decision for the same flags', () => {
  const args = ['--topic', '新功能上线', '--purpose', 'product', '--audience', '新用户', '--duration', '15', '--json'];
  const run = (entry, extra = []) => JSON.parse(execFileSync(process.execPath, [entry, ...args, ...extra], { encoding: 'utf8' }));
  const routed = run('tools/catalog/route.mjs');
  const planned = run('tools/agent/plan.mjs', ['--suggest', '--yes']);
  assert.deepEqual(routed.brief, planned.brief);
  assert.deepEqual(routed.decision.selected, planned.decision.selected);
  assert.equal(routed.decision.selected.workflow_id, 'product');
});
test('creative proposal resolves real sources and hands off the suggested duration and script', async () => {
  const project = createRoutingProject({
    topic: '解释折射', audience: '初中生', viewing_context: '课堂投影', aspect_ratio: '16:9',
  });
  const catalog = loadCatalog();
  const decision = decideRoute(project, registry, {}, Date.now(), { agent: true });
  const candidate = decision.selected;
  const references = await readPromptReferences(candidate.resources, 4, 500);
  assert.ok(references[0].excerpt);
  const draft = {
    workflow_id: candidate.workflow_id, style_id: candidate.style_id, duration_seconds: 18, aspect_ratio: '16:9',
    rationale: '在课堂投屏中留出观察关键变化的时间。', assumptions: '', question: '', voice_mode: 'narration',
    segments: [{ seconds: 18, visual: '依次显示两条线', text: '先看两条线相交的位置。' }],
    references: [{ id: references[0].id, used_for: '组织逐步出现的画面' }],
  };
  const result = acceptProposal(project, decision, draft, references, catalog);
  assert.equal(result.project.brief.duration_seconds, 18);
  assert.equal(result.project.brief.field_sources.duration_seconds, 'inferred');
  assert.equal(result.project.brief.field_sources.aspect_ratio, 'user');
  assert.equal(result.proposal.revision, result.project.revision);
  assert.equal(result.decision.brief_revision, result.project.revision);
  assert.equal(result.proposal.references[0].revision, references[0].revision);
  assert.match(result.proposal.references[0].url, /^https:\/\//);
  assert.deepEqual(result.proposal.segments, draft.segments);
  assert.throws(() => acceptProposal(project, decision, { ...draft, aspect_ratio: '9:16' }, references, catalog), /指定的片长或画幅/);
  assert.throws(() => acceptProposal(project, decision, { ...draft, duration_seconds: 20 }, references, catalog), /分段与建议片长/);
  assert.throws(() => acceptProposal(project, decision, { ...draft, references: [{ id: 'not-in-catalog', used_for: '输入校验' }] }, references, catalog), /无效的资源引用/);
  const blocked = acceptProposal(project, decision, { ...draft, missing_inputs: ['需要数据及出处'] }, references, catalog);
  assert.equal(blocked.decision.selected.ready, false);
  assert.deepEqual(blocked.decision.selected.blockers, ['需要数据及出处']);
  const topicOnly = createRoutingProject({ topic: project.brief.topic });
  const provisional = acceptProposal(topicOnly, decision, draft, references, catalog);
  assert.equal(provisional.decision.questions.length, 1);
  assert.match(provisional.decision.questions[0], /给谁看/);
});
