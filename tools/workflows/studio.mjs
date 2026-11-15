import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { ROOT, loadCatalog } from '../catalog/validate.mjs';
import { loadWorkflowCatalog } from '../catalog/workflows.mjs';
import { decideRoute } from '../../shared/routing.mjs';
import { assertProject } from '../../shared/project.mjs';
import { interpretMessage, runProductionAgent } from './model.mjs';
import { createProposal } from './proposal.mjs';
import { stageFile, writeAgentTask } from './agent-task.mjs';
import { workflowRuntime } from './runtime.mjs';

const storage = path.join(ROOT, 'projects', '_studio');
const catalog = loadCatalog();
const registry = loadWorkflowCatalog(catalog);
const controllers = new Map();
const conversations = new Set();
const validId = (id) => /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id ?? '');
const file = (id) => path.join(storage, id, 'session.json');
const workspace = (id) => path.join(storage, id);
const errorStatus = (status, message) => Object.assign(new Error(message), { status });
const route = (project) => decideRoute(project, registry, {}, Date.now(), { agent: true });
const exec = promisify(execFile);

async function inspectOutput(directory, filename, signal) {
  const target = path.join(directory, filename);
  const stat = await fs.lstat(target).catch(() => null);
  if (!stat?.isFile() || !stat.size || (await fs.realpath(target)) !== path.join(await fs.realpath(directory), filename)) {
    throw new Error(`Agent 尚未交付 ${filename}，请查看任务记录后重试。`);
  }
  const ffprobe = workflowRuntime().ffprobe ?? 'ffprobe';
  const { stdout } = await exec(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', target], { timeout: 15000, windowsHide: true, signal });
  const { streams, format } = JSON.parse(stdout);
  const video = streams.find((item) => item.codec_type === 'video');
  const duration = Number(format?.duration);
  const [numerator, denominator] = (video?.avg_frame_rate ?? '').split('/').map(Number);
  if (!video || video.codec_name !== 'h264' || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(numerator / denominator)) {
    throw new Error('Agent 交付的 MP4 无法通过媒体检查。');
  }
  return { duration_seconds: duration, width: video.width, height: video.height, fps: numerator / denominator, codec: video.codec_name, has_audio: streams.some((item) => item.codec_type === 'audio') };
}

async function loadSession(id) {
  if (!validId(id)) throw errorStatus(404, '未找到创作项目。');
  try { return JSON.parse(await fs.readFile(file(id), 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    throw errorStatus(404, '未找到创作项目。');
  }
}

async function saveSession(session) {
  await fs.mkdir(workspace(session.id), { recursive: true });
  const target = file(session.id);
  const temp = target + '.' + randomUUID() + '.new';
  await fs.writeFile(temp, JSON.stringify(session, null, 2) + '\n', 'utf8');
  await fs.rename(temp, target);
}

async function getSession(id) {
  const session = await loadSession(id);
  if (session.job?.status === 'running' && !controllers.has(id)) {
    session.job.status = 'failed';
    session.job.error = '上次运行中断，可以重试。';
    await saveSession(session);
  }
  if (session.job?.status === 'running' && session.job.provider === 'agent') {
    const progress = await fs.readFile(path.join(workspace(id), 'jobs', session.job.id, 'progress.json'), 'utf8')
      .then(JSON.parse).catch(() => null);
    if (['planning', 'authoring', 'rendering', 'checking'].includes(progress?.phase)) session.job.phase = progress.phase;
    if (typeof progress?.message === 'string') session.job.detail = progress.message.slice(0, 240);
  }
  if (session.proposal?.revision !== session.project.revision &&
      (!session.job || session.job.status !== 'running')) session.decision = route(session.project);
  return session;
}

async function message(input) {
  const id = input.session ?? randomUUID();
  if (controllers.has(id) || conversations.has(id)) throw errorStatus(409, '上一项工作仍在进行。');
  conversations.add(id);
  try {
    const current = input.session ? await getSession(id) : { id, project: null, messages: [], job: null, artifacts: {} };
    const response = await interpretMessage(input.message, current.project);
    Object.assign(current, await createProposal({
      project: response.project,
      decision: route(response.project),
      catalog,
      message: input.message.trim(),
      previous: current.proposal ?? null,
      conversation: current.messages,
    }));
    current.messages.push({ role: 'user', text: input.message }, { role: 'assistant', text: response.reply });
    current.messages = current.messages.slice(-60);
    await saveSession(current);
    return current;
  } finally {
    conversations.delete(id);
  }
}

async function render(session, job, candidate, controller) {
  const deadline = session.project.brief.deadline;
  const remaining = deadline ? Date.parse(deadline) - Date.now() : Infinity;
  const requestedWait = (session.project.resources.max_wait_minutes ?? Infinity) * 60_000;
  const wait = Math.min(20 * 60_000, requestedWait, remaining);
  const timeout = AbortSignal.timeout(Math.max(0, Math.floor(wait)));
  const signal = AbortSignal.any([controller.signal, timeout]);
  const jobDir = path.join(workspace(session.id), 'jobs', job.id);
  try {
    assertProject(session.project);
    await fs.mkdir(jobDir, { recursive: true });
    await fs.writeFile(path.join(jobDir, 'project.json'), JSON.stringify(session.project), 'utf8');
    const prior = session.artifacts.preview;
    const reuse = prior?.provider === 'agent' && prior.revision === session.project.revision && prior.style === candidate.style_id && prior.workflow === candidate.workflow_id;
    const fullDuration = session.project.brief.duration_seconds;
    const duration = job.stage === 'preview' ? Math.min(fullDuration, 10) : fullDuration;
    const filename = stageFile(job.stage);
    const previous = reuse ? path.join(workspace(session.id), 'jobs', prior.id) : null;
    const retry = job.retryId ? path.join(workspace(session.id), 'jobs', job.retryId) : null;
    const prompt = await writeAgentTask(jobDir, {
      project: session.project, candidate, catalog, stage: job.stage, duration,
      proposal: session.proposal ?? null, messages: session.messages, previous, retry, feedback: job.feedback,
    });
    const log = await fs.open(path.join(jobDir, 'agent.log'), 'wx');
    let pending = Promise.resolve();
    let logError;
    try {
      await runProductionAgent(prompt, { cwd: jobDir, signal, onOutput: (_, chunk) => {
        pending = pending.then(() => log.write(chunk)).catch((error) => { logError ??= error; });
      } });
    } finally {
      await pending;
      await log.close();
    }
    if (logError) throw logError;
    signal.throwIfAborted();
    const waiting = path.join(jobDir, 'NEEDS_INPUT.md');
    const waitingFile = await fs.lstat(waiting).catch(() => null);
    if (waitingFile?.isFile() && waitingFile.size && waitingFile.size < 32_000) {
      job.status = 'waiting_input';
      job.error = (await fs.readFile(waiting, 'utf8')).trim().slice(0, 600);
      return;
    }
    job.phase = 'checking';
    await saveSession(session);
    const source = await fs.lstat(path.join(jobDir, 'source')).catch(() => null);
    if (!source?.isDirectory() || !(await fs.readdir(path.join(jobDir, 'source'))).length) {
      throw new Error('Agent 尚未交付本次制作源码。');
    }
    for (const name of ['PRODUCTION.md', 'QA.md']) {
      const report = await fs.lstat(path.join(jobDir, name)).catch(() => null);
      if (!report?.isFile() || !report.size) throw new Error(`Agent 尚未交付 ${name}。`);
    }
    const media = await inspectOutput(jobDir, filename, signal);
    const ratios = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1, '3:4': 3 / 4 };
    if (Math.abs(media.width / media.height - ratios[session.project.brief.aspect_ratio]) > 0.02 ||
        Math.abs(media.duration_seconds - duration) > 0.2 ||
        Math.abs(media.fps - session.project.brief.fps) > 0.05) throw new Error('Agent 输出的片长、画幅或帧率与本次制作要求不符。');
    const artifact = {
      id: job.id,
      stage: job.stage,
      revision: session.project.revision,
      workflow: candidate.workflow_id,
      style: candidate.style_id,
      provider: 'agent',
      compositionId: job.id,
      previewId: job.stage === 'render' ? prior.id : null,
      relativePath: path.relative(workspace(session.id), path.join(jobDir, filename)).split(path.sep).join('/'),
      media,
    };
    const superseded = session.artifacts[job.stage];
    if (superseded) session.previousArtifacts = [...(session.previousArtifacts ?? []), superseded].slice(-20);
    session.artifacts[job.stage] = artifact;
    if (job.feedback) {
      session.project.records.feedback.push({
        id: job.id, project_revision: session.project.revision, text: job.feedback, time_seconds: null, status: 'open',
      });
      if (session.project.records.feedback.length > 200) session.project.records.feedback.shift();
    }
    job.status = 'succeeded';
  } catch (error) {
    job.status = controller.signal.aborted ? 'cancelled' : 'failed';
    job.error = controller.signal.aborted ? '已取消。' : timeout.aborted ? 'Agent 制作超过本阶段的等待上限。' : error.message;
  } finally {
    job.finishedAt = new Date().toISOString();
    try { await saveSession(session); }
    finally { controllers.delete(session.id); }
  }
}

async function startJob(id, input) {
  if (controllers.has(id) || conversations.has(id)) throw errorStatus(409, '上一项工作仍在进行。');
  const controller = new AbortController();
  controllers.set(id, controller);
  try {
    const session = await loadSession(id);
    const decision = session.proposal?.revision === session.project.revision ? session.decision : route(session.project);
    const candidates = [decision.selected, ...decision.alternatives].filter(Boolean);
    const candidate = candidates.find((item) => item.workflow_id === input.workflow && item.style_id === input.style);
    if (!candidate) throw errorStatus(400, '请选择一个方案或由 Agent 自定流程。');
    if (session.project.brief.deadline && Date.parse(session.project.brief.deadline) <= Date.now()) {
      throw errorStatus(409, '交付期限已过，请更新交付日期。');
    }
    if (!candidate.ready) throw errorStatus(409, candidate.blockers.join(' ') || '请先补齐本次制作条件。');
    if (!['preview', 'render'].includes(input.stage)) throw errorStatus(400, '未知制作阶段。');
    const feedback = typeof input.feedback === 'string' ? input.feedback.trim().slice(0, 1000) : '';
    if (input.stage === 'render' && (feedback || session.artifacts.preview?.provider !== 'agent' || session.artifacts.preview.revision !== session.project.revision ||
      session.artifacts.preview.style !== candidate.style_id || session.artifacts.preview.workflow !== candidate.workflow_id)) {
      throw errorStatus(400, '请先让 Agent 制作当前方案的预览。');
    }
    const priorJob = session.job;
    const retryId = ['failed', 'waiting_input'].includes(priorJob?.status) && validId(priorJob.id) &&
      priorJob.stage === input.stage && priorJob.workflow === candidate.workflow_id && priorJob.style === candidate.style_id ? priorJob.id : null;
    const job = {
      id: randomUUID(), provider: 'agent', stage: input.stage, status: 'running', phase: 'planning',
      revision: session.project.revision, workflow: candidate.workflow_id, style: candidate.style_id,
      feedback, retryId, startedAt: new Date().toISOString(),
    };
    session.job = job;
    await saveSession(session);
    void render(session, job, candidate, controller).catch((error) => console.error('保存任务状态失败', error.message));
    return session;
  } catch (error) {
    controllers.delete(id);
    throw error;
  }
}

const assets = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
const jobDocuments = new Set(['AGENT_TASK.md', 'PRODUCTION.md', 'QA.md', 'NEEDS_INPUT.md', 'agent.log']);
const send = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
};

async function readBody(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] ?? '')) throw errorStatus(415, '需要 JSON 请求。');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 24_000) throw errorStatus(413, '请求过长。');
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw errorStatus(400, '请求数据无效。'); }
}

async function videoResponse(req, res, id, artifactId) {
  const session = await loadSession(id);
  const recent = Object.values(session.artifacts);
  const referencedPreview = recent.find((item) => item.previewId === artifactId);
  const artifact = [...recent, ...(session.previousArtifacts ?? [])].find((item) => item.id === artifactId) ??
    (referencedPreview ? { relativePath: `jobs/${artifactId}/preview.mp4` } : null);
  if (!artifact) throw errorStatus(404, '未找到视频。');
  const root = await fs.realpath(workspace(id));
  const target = await fs.realpath(path.join(root, artifact.relativePath));
  const relative = path.relative(root, target);
  if (path.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + path.sep)) throw errorStatus(404, '未找到视频。');
  const { size } = await fs.stat(target);
  const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
  const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (!match) {
    res.writeHead(200, { ...headers, 'Content-Length': size });
    createReadStream(target).pipe(res);
    return;
  }
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
    res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
    return;
  }
  res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
  createReadStream(target, { start, end }).pipe(res);
}

const { values } = parseArgs({ options: { port: { type: 'string', default: '4176' } } });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('端口必须在 1024–65535。');
const host = `127.0.0.1:${port}`;
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  try {
    if (req.headers.host !== host || (req.headers.origin && req.headers.origin !== `http://${host}`)) throw errorStatus(403, '仅允许本机创作页面访问。');
    const url = new URL(req.url, `http://${host}`);
    const [api, resource, id, action] = url.pathname.split('/').slice(1);
    if (req.method === 'GET' && Object.hasOwn(assets, url.pathname)) {
      const [name, mime] = assets[url.pathname];
      const contents = await fs.readFile(path.join(ROOT, 'app', name));
      res.writeHead(200, { 'Content-Type': `${mime}; charset=utf-8` }).end(contents);
    } else if (req.method === 'POST' && url.pathname === '/api/message') {
      send(res, 200, await message(await readBody(req)));
    } else if (api === 'api' && resource === 'session' && req.method === 'GET' && !action) {
      send(res, 200, await getSession(id));
    } else if (api === 'api' && resource === 'session' && req.method === 'POST' && action === 'jobs') {
      send(res, 202, await startJob(id, await readBody(req)));
    } else if (api === 'api' && resource === 'session' && req.method === 'POST' && action === 'cancel') {
      if (!controllers.has(id)) throw errorStatus(409, '当前没有运行中的任务。');
      controllers.get(id).abort();
      send(res, 202, { cancelled: true });
    } else if (api === 'api' && resource === 'video' && req.method === 'GET' && validId(action)) {
      await videoResponse(req, res, id, action);
    } else if (api === 'api' && resource === 'job-document' && req.method === 'GET' && validId(action)) {
      const name = url.pathname.split('/')[5];
      if (!jobDocuments.has(name)) throw errorStatus(404, '未找到制作记录。');
      const session = await loadSession(id);
      const knownJobs = [session.job?.id, ...Object.values(session.artifacts).map((item) => item.id),
        ...(session.previousArtifacts ?? []).map((item) => item.id), session.artifacts.render?.previewId];
      if (!knownJobs.includes(action)) throw errorStatus(404, '未找到制作任务。');
      const folder = await fs.realpath(path.join(workspace(id), 'jobs', action));
      const expected = path.join(await fs.realpath(workspace(id)), 'jobs', action);
      const filePath = path.join(folder, name);
      const stat = await fs.lstat(filePath).catch(() => null);
      if (folder !== expected || !stat?.isFile() || stat.size > 512_000) throw errorStatus(404, '未找到制作记录。');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }).end(await fs.readFile(filePath));
    } else throw errorStatus(404, '页面不存在。');
  } catch (error) {
    if (!res.headersSent) send(res, error.status ?? 400, { error: error.message });
    else res.destroy();
  }
});

server.listen(port, '127.0.0.1', () => console.log(`VideoLab Studio http://${host}`));
