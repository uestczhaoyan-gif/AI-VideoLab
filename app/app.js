const get = (id) => document.getElementById(id);
const messages = get('thread');
let session = null;
let chosen = null;
let sending = false;
let timer = null;
let currentVideo = null;
const candidateKey = (item) => item && item.workflow_id + '/' + item.style_id;

async function request(url, body) {
  const response = await fetch(url, body === undefined ? {} : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

function render() {
  const running = session?.job?.status === 'running';
  get('send').disabled = sending || running;
  get('new').disabled = sending || running;
  get('message').disabled = sending || running;
  const count = messages.childElementCount;
  messages.replaceChildren(...(session?.messages ?? []).map((entry) => {
    const item = document.createElement('p');
    item.className = 'bubble ' + entry.role;
    item.textContent = entry.text;
    return item;
  }));
  if (messages.childElementCount !== count) messages.scrollTop = messages.scrollHeight;
  const brief = session?.project.brief;
  get('brief').textContent = brief ? [brief.audience, brief.duration_seconds + ' 秒', brief.aspect_ratio].filter(Boolean).join(' · ') : '';
  const decision = session?.decision;
  const proposal = session?.proposal?.revision === session?.project.revision ? session?.proposal : null;
  const plans = [decision?.selected, ...(decision?.alternatives ?? [])].filter(Boolean);
  const recentPreview = session?.artifacts.preview;
  const existingChoice = recentPreview?.revision === session?.project.revision && recentPreview
    ? recentPreview.workflow + '/' + recentPreview.style : null;
  chosen = plans.find((item) => candidateKey(item) === (candidateKey(chosen) ?? existingChoice)) ?? plans[0] ?? null;
  get('plans').replaceChildren(...plans.map((item, index) => {
    const button = document.createElement('button');
    const title = document.createElement('strong');
    const details = document.createElement('span');
    button.type = 'button';
    button.className = 'plan';
    button.disabled = running || sending;
    button.setAttribute('aria-pressed', String(candidateKey(item) === candidateKey(chosen)));
    title.textContent = (index ? '' : '推荐 · ') + item.style + ' / ' + item.workflow;
    details.textContent = (item.ready ? item.reasons.at(-1) : item.blockers.join(' ')) || '';
    button.append(title, details);
    button.onclick = () => { chosen = item; render(); };
    return button;
  }));
  if (!plans.length) {
    const note = document.createElement('p');
    note.className = 'muted';
    const reason = decision?.excluded.flatMap((item) => item.reasons)[0];
    note.textContent = decision ? (reason || '当前没有匹配的制作方案。') : '发送创作描述后查看推荐方案。';
    get('plans').append(note);
  }
  get('proposal').hidden = !proposal;
  get('rationale').textContent = proposal?.rationale ?? '';
  get('assumptions').textContent = proposal?.assumptions ?? '';
  get('script-title').textContent = proposal?.voice_mode === 'captions' ? '静音字幕稿' : '口播稿';
  let elapsed = 0;
  get('script').replaceChildren(...(proposal?.segments ?? []).map((segment) => {
    const item = document.createElement('li');
    const description = document.createElement('p');
    const text = document.createElement('p');
    const start = elapsed;
    elapsed += segment.seconds;
    description.className = 'muted';
    description.textContent = `${Number(start.toFixed(2))}–${Number(elapsed.toFixed(2))} 秒 · ${segment.visual}`;
    text.textContent = segment.text;
    item.append(description, text);
    return item;
  }));
  get('question').textContent = decision?.questions.join(' ') || '';
  const referenceList = get('references');
  const linked = new Set();
  referenceList.replaceChildren(...(proposal?.references ?? chosen?.resources ?? []).flatMap((resource) => {
    const key = proposal ? resource.id : resource.url;
    if (!/^https:\/\//i.test(resource.url ?? '') || linked.has(key)) return [];
    linked.add(key);
    const link = document.createElement('a');
    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = resource.used_for ? `${resource.name} · ${resource.used_for}`
      : resource.prompt_path ? '风格来源' : `参考 · ${resource.id}`;
    return [link];
  }));
  referenceList.hidden = !referenceList.childElementCount;
  const estimates = get('estimates');
  estimates.hidden = !chosen;
  estimates.textContent = chosen ? [
    chosen.estimated_cost === null ? '费用待估' : `预计 ¥${chosen.estimated_cost}`,
    chosen.estimated_minutes === null ? '耗时待估' : `预计 ${chosen.estimated_minutes} 分钟`,
  ].join(' · ') : '';
  get('production').hidden = !chosen;
  const matches = (artifact) => !!artifact && artifact.revision === session?.project.revision && artifact.workflow === chosen?.workflow_id && artifact.style === chosen?.style_id;
  const preview = matches(session?.artifacts.preview) ? session.artifacts.preview : null;
  const output = session?.artifacts.render;
  const samePreview = output?.previewId ? output.previewId === preview?.id : output?.compositionId === preview?.compositionId;
  const final = matches(output) && samePreview ? output : null;
  const previousPreview = (session?.previousArtifacts ?? []).findLast((item) => item.stage === 'preview' && matches(item))?.id ??
    (matches(output) && !samePreview ? output.previewId : null);
  const previousLink = get('previous-preview');
  previousLink.hidden = !preview || !previousPreview;
  if (previousPreview) previousLink.href = '/api/video/' + session.id + '/' + previousPreview;
  const media = final ?? preview;
  const videoUrl = media ? '/api/video/' + session.id + '/' + media.id : null;
  const player = get('player');
  player.hidden = !videoUrl;
  if (currentVideo !== videoUrl) {
    currentVideo = videoUrl;
    if (videoUrl) player.src = videoUrl;
    else { player.removeAttribute('src'); player.load(); }
  }
  get('download').hidden = !final;
  if (final) get('download').href = '/api/video/' + session.id + '/' + final.id;
  get('preview').disabled = !chosen?.ready || running || sending;
  get('export').disabled = !chosen?.ready || preview?.provider !== 'agent' || running || sending;
  get('cancel').hidden = !running;
  get('feedback').hidden = !preview || running || sending;
  const state = session?.job;
  const phase = { planning:'Agent 正在读需求与参考资料…', authoring:'Agent 正在写分镜和制作代码…', rendering:'Agent 正在调用制作工具…', checking:'正在核验交付文件…' };
  get('activity').textContent = running ? (state.detail || phase[state.phase]) : state?.error || (final ? '成片已生成' : preview ? '预览已生成' : '');
  const records = get('job-records');
  const needsInput = state?.status === 'waiting_input';
  const stopped = state?.provider === 'agent' && (state.status === 'failed' || needsInput);
  const recordId = stopped ? state.id : (final ?? preview)?.id;
  const recordedOutput = (final ?? preview)?.id === recordId && (final ?? preview)?.provider === 'agent';
  const recordLinks = recordedOutput ? [['AGENT_TASK.md', '制作 Prompt'], ['PRODUCTION.md', '制作记录'], ['QA.md', '检查记录']]
    : stopped ? [['AGENT_TASK.md', '制作 Prompt'], ['agent.log', '执行日志'], ...(needsInput ? [['NEEDS_INPUT.md', '待补条件']] : [])] : [];
  records.replaceChildren(...recordLinks.map(([name, label]) => {
    const link = document.createElement('a');
    link.href = '/api/job-document/' + session.id + '/' + recordId + '/' + name;
    link.textContent = label;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  }));
  records.hidden = !records.childElementCount;
  clearTimeout(timer);
  if (running) timer = setTimeout(refresh, 1200);
}

async function refresh() {
  try { session = await request('/api/session/' + session.id); render(); }
  catch (error) { get('status').textContent = error.message; timer = setTimeout(refresh, 2500); }
}

get('composer').onsubmit = async (event) => {
  event.preventDefault();
  if (sending || session?.job?.status === 'running') return;
  const input = get('message');
  sending = true;
  get('status').textContent = '正在查阅资源库并拟定创作方案…';
  render();
  try {
    session = await request('/api/message', { session: session?.id, message: input.value });
    localStorage.setItem('videolab-session', session.id);
    input.value = '';
    get('status').textContent = '';
  } catch (error) { get('status').textContent = error.message; }
  finally { sending = false; render(); input.focus(); }
};

async function job(stage, feedback) {
  if (sending || session?.job?.status === 'running') return;
  sending = true;
  render();
  try {
    session = await request('/api/session/' + session.id + '/jobs', { stage, workflow: chosen.workflow_id, style: chosen.style_id, feedback });
    get('status').textContent = '';
    if (feedback) get('revision').value = '';
  } catch (error) { get('status').textContent = error.message; }
  finally { sending = false; render(); }
}
get('preview').onclick = () => job('preview');
get('export').onclick = () => job('render');
get('feedback').onsubmit = (event) => { event.preventDefault(); void job('preview', get('revision').value); };
get('cancel').onclick = async () => {
  try { await request('/api/session/' + session.id + '/cancel', {}); }
  catch (error) { get('status').textContent = error.message; }
};
get('new').onclick = () => {
  localStorage.removeItem('videolab-session');
  session = chosen = null;
  get('status').textContent = '';
  render();
  get('message').focus();
};
const remembered = localStorage.getItem('videolab-session');
if (remembered) {
  try { session = await request('/api/session/' + remembered); }
  catch { localStorage.removeItem('videolab-session'); }
}
render();
