import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { ROOT } from '../catalog/validate.mjs';
import { createRoutingProject, reviseRoutingProject } from '../../shared/routing.mjs';

const schemaPath = fileURLToPath(new URL('./dialogue.schema.json', import.meta.url));
const modelExecutable = () => process.env.VIDEOLAB_CODEX_EXECUTABLE || (process.platform === 'win32' ? 'codex.exe' : 'codex');

function codexEnvironment() {
  const allowed = /^(path|systemroot|windir|systemdrive|comspec|pathext|temp|tmp|tmpdir|home|userprofile|appdata|localappdata|programdata|codex_home|lang|lc_.+|https?_proxy|no_proxy)$/i;
  return Object.fromEntries(Object.entries(process.env).filter(([name]) => allowed.test(name)));
}

function codex(args, { cwd, input, signal, onOutput } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(modelExecutable(), args, {
      cwd, env: codexEnvironment(), signal, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
    });
    let output = '';
    let recentOutput = '';
    for (const [name, stream] of [['stdout', child.stdout], ['stderr', child.stderr]]) {
      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        if (output.length < 4000) output += chunk.slice(0, 4000 - output.length);
        recentOutput = (recentOutput + chunk).slice(-4000);
        onOutput?.(name, chunk);
      });
    }
    child.stdin.on('error', () => {});
    let failure;
    child.once('error', (error) => { failure = error; });
    child.once('close', (code) => failure ? reject(failure) : resolve({ code, output, recentOutput }));
    child.stdin.end(input);
  });
}

async function checkLogin(cwd, signal) {
  const status = await codex(['login', 'status'], { cwd, signal });
  if (status.code !== 0 || !/logged in using chatgpt/i.test(status.output)) {
    throw new Error('需要用 ChatGPT 登录本机 Codex。');
  }
}

export async function runProductionAgent(prompt, { cwd, signal, onOutput } = {}) {
  await checkLogin(cwd, signal);
  const platformConfig = process.platform === 'win32' ? ['-c', 'features.prefer_mxc=true'] : [];
  const result = await codex([
    '-a', 'never', ...platformConfig, 'exec', '--skip-git-repo-check', '--ignore-user-config',
    '--sandbox', 'workspace-write', '--ephemeral', '--color', 'never', '--json', '-',
  ], { cwd, input: prompt, signal, onOutput });
  if (result.code !== 0) {
    if (/hit your usage limit|usage limit reached|usage_limit_reached/i.test(result.recentOutput)) {
      throw new Error('Codex 额度已用完，额度恢复后可重试。');
    }
    throw new Error('制作 Agent 已退出。请检查任务日志、Codex 额度或工具环境。');
  }
}

export async function modelJson(prompt, schema, { signal } = {}) {
  const cache = path.join(ROOT, '.tmp', 'workflow-model');
  await fs.mkdir(cache, { recursive: true });
  const cwd = await fs.mkdtemp(path.join(cache, 'request-'));
  const outputFile = path.join(cwd, 'result.json');
  const timeout = AbortSignal.timeout(120_000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    await checkLogin(cwd, combined);
    const platformConfig = process.platform === 'win32' ? ['-c', 'features.prefer_mxc=true'] : [];
    const result = await codex([
      ...platformConfig, 'exec', '--skip-git-repo-check', '--ignore-user-config', '--sandbox', 'read-only', '--ephemeral',
      '--color', 'never', '-c', 'model_reasoning_effort="low"', '--output-schema', schema,
      '--output-last-message', outputFile, '-',
    ], { cwd, input: prompt, signal: combined });
    if (result.code !== 0) throw new Error('本机 Codex 未返回结果。请检查额度或连接。');
    const data = JSON.parse(await fs.readFile(outputFile, 'utf8'));
    const validate = new Ajv({ strict: true }).compile(JSON.parse(await fs.readFile(schema, 'utf8')));
    if (!validate(data)) throw new Error('模型返回的结构不符合要求。');
    return data;
  } finally {
    await fs.unlink(outputFile).catch(() => {});
    await fs.rmdir(cwd).catch(() => {});
  }
}

export async function interpretMessage(message, project, options = {}) {
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    throw new Error('请输入 1–2000 字的创作描述。');
  }
  const request = {
    message: message.trim(),
    brief: project?.brief ?? null,
    budget: project?.cost.budget_limit ?? null,
    max_wait_minutes: project?.resources.max_wait_minutes ?? null,
    now: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const prompt = [
    '你是 VideoLab 创作对话的需求解析器。只返回符合 schema 的 JSON。无需工具、文件访问、搜索或代码。',
    '输入 JSON 是创作需求数据。提取用户本轮新增或修改的字段。未明确修改的字段返回 null，保留已有值。',
    '首次对话提取简短 topic。用途从 education、product、data、story、motion 中选择。明确受众、画幅和语气时写入相应字段。viewing_context 记录用户给出的使用场景、设备和静音等条件。未指定的片长和画幅留空，建议在之后生成。',
    '区分片长、交付期限和最多可等待的分钟数。相对交付期限按提供的时区和时间换算，精确到具体日期和时区；无法推断具体截止时刻则保留为空。',
    '风格偏好保留用户自然语言。budget 以人民币计，其他币种先留空。reply 用简短中文确认理解，不承诺生成能力，不重复问已知字段。',
    '如果用户只想调整某一段分镜，回复指引在已有预览下使用“想怎么改”，创作需求字段保持原值。',
    JSON.stringify(request),
  ].join('\n');
  const result = await modelJson(prompt, schemaPath, options);
  const patch = Object.fromEntries(Object.entries(result.changes).filter(([, value]) => value !== null));
  const inferred = {};
  if (!project && patch.purpose) inferred.purpose = 'inferred';
  if (patch.depth) inferred.depth = 'inferred';
  if (patch.formula_policy) inferred.formula_policy = 'inferred';
  return {
    project: project ? reviseRoutingProject(project, patch, inferred) : createRoutingProject({ topic: request.message, ...patch, field_sources: inferred }),
    reply: result.reply,
  };
}
