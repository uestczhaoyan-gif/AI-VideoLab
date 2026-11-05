import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProject, confirmGate, updateCheck, projectMarkdown, projectGaps,
  validateProject, qaSummary, GATES, QA_ITEMS,
} from '../shared/project.mjs';

const evidence = (path) => ({ base: 'repository', path });

function withAllChecksPassed(project) {
  let current = project;
  for (const item of QA_ITEMS) current = updateCheck(current, item.id, { status: 'passed', evidence: evidence(`.tmp/evidence/${item.id}.json`) });
  return current;
}

test('new projects start with three pending confirmation gates, document slots and explicit QA states', () => {
  const p = createProject({ topic: '最小闭环验证' });
  assert.deepEqual(p.gates.map((g) => g.id), GATES.map((g) => g.id));
  assert.ok(p.gates.every((g) => g.status === 'pending' && g.confirmed_at === null));
  assert.deepEqual(Object.keys(p.documents), ['brief', 'script', 'outline', 'source_notes']);
  assert.equal(p.documents.brief, null);
  assert.equal(p.records.checks.length, QA_ITEMS.length);
  assert.ok(p.records.checks.every((c) => c.status === 'not_checked' && c.evidence === null));
  assert.deepEqual(validateProject(p), []);
  assert.deepEqual(qaSummary(p).open, QA_ITEMS.map((q) => q.id));
});

test('confirmation gates require a written basis and keep the revision they were confirmed at', () => {
  const p = createProject({ topic: '确认门测试' });
  assert.throws(() => confirmGate(p, 'brief', { basis: '  ' }), /确认依据/);
  assert.throws(() => confirmGate(p, 'unknown', { basis: 'x' }), /未知确认门/);
  const q = confirmGate(p, 'brief', { basis: '与用户确认受众与深度', at: '2026-11-06T00:00:00.000Z' });
  assert.notEqual(q.id, p.id);
  assert.equal(q.revision, p.revision + 1);
  const gate = q.gates.find((g) => g.id === 'brief');
  assert.equal(gate.status, 'confirmed');
  assert.equal(gate.project_revision, p.revision);
  assert.equal(gate.confirmed_at, '2026-11-06T00:00:00.000Z');
  assert.deepEqual(validateProject(q), []);
  const waived = confirmGate(p, 'export', { basis: '用户要求跳过导出前确认，保留风险记录', status: 'waived' });
  assert.equal(waived.gates.find((g) => g.id === 'export').confirmed_at, null);
});

test('QA checks need evidence to pass and NOT CHECKED is never a delivery pass', () => {
  const p = createProject({ topic: 'QA 合同测试' });
  assert.throws(() => updateCheck(p, 'qa-spec', { status: 'passed' }), /证据/);
  assert.throws(() => updateCheck(p, 'missing-check', { status: 'passed', evidence: evidence('.tmp/x.json') }), /未知检查项/);
  const failed = updateCheck(p, 'qa-visual', { status: 'failed', evidence: evidence('.tmp/frames/contact.jpg'), notes: '关键帧出现跳帧' });
  assert.deepEqual(validateProject(failed), []);

  const deliveredEarly = { ...p, status: 'delivered' };
  assert.ok(validateProject(deliveredEarly).some((e) => e.includes('未通过的检查')));

  const passed = withAllChecksPassed(p);
  const nextRevision = passed.revision + 1;
  const delivered = {
    ...passed,
    revision: nextRevision,
    status: 'delivered',
    records: { ...passed.records, artifacts: [{ id: 'art-video', kind: 'video', project_revision: nextRevision, reference: evidence('.tmp/out.mp4') }] },
  };
  assert.deepEqual(validateProject(delivered), []);
});

test('gates, documents and QA are written into the exported task pack', () => {
  const p = createProject({ topic: '导出一致性' });
  const text = projectMarkdown(p);
  for (const expected of ['确认门（三处人工确认）', '项目文档（brief / script / outline）', 'QA 清单（NOT CHECKED 不算通过）', 'qa-spec', '待确认']) {
    assert.ok(text.includes(expected), expected);
  }
  const gaps = projectGaps(p);
  assert.ok(gaps.some((g) => g.includes('确认门待确认')));
  assert.ok(gaps.some((g) => g.includes('NOT CHECKED 不算通过')));
});

test('documents and gate records validate path safety and uniqueness', () => {
  const p = createProject({ topic: '结构校验' });
  const badDoc = { ...p, documents: { ...p.documents, brief: { base: 'repository', path: '../secret.md' } } };
  assert.ok(validateProject(badDoc).length);
  const duplicateGate = { ...p, gates: [p.gates[0], p.gates[0], p.gates[2]] };
  assert.ok(validateProject(duplicateGate).some((e) => e.includes('确认门')));
  const unknownGate = { ...p, gates: [...p.gates, { id: 'extra', status: 'pending', confirmed_at: null, basis: '', project_revision: 1 }] };
  assert.ok(validateProject(unknownGate).length);
});
