import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { parseArgs, promisify } from 'node:util';
import { loadCatalog } from '../catalog/validate.mjs';
import { loadWorkflowCatalog } from '../catalog/workflows.mjs';
import { parseProject } from '../../shared/project.mjs';
import { decideRoute } from '../../shared/routing.mjs';
import { renderEnvironment, workflowRuntime } from './runtime.mjs';

const execute = promisify(execFile);
const writeState = async (directory, state) => {
  const filename = path.join(directory, 'run.json');
  await fs.writeFile(filename + '.new', JSON.stringify(state, null, 2) + '\n', 'utf8');
  await fs.rename(filename + '.new', filename);
};

async function runProcess(entry, args, cwd, env, logPath, signal) {
  const log = await fs.open(logPath, 'wx');
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [entry, ...args], { cwd, env, signal, windowsHide: true, stdio: ['ignore', log.fd, log.fd] });
      let spawnError;
      child.once('error', (error) => { spawnError = error; });
      child.once('close', (code, termination) => {
        if (spawnError) reject(spawnError);
        else if (code === 0) resolve();
        else reject(new Error(`制作工具退出：${code ?? termination}。日志：${logPath}`));
      });
    });
  } finally {
    await log.close();
  }
}

function adapterCommand(candidate, runtime, composition, output, project, preview) {
  if (candidate.adapter === 'hyperframes') {
    const args = ['render', composition, '--output', output, '--fps', String(project.brief.fps), '--quality', preview ? 'draft' : 'looks', '--workers', '1', '--no-browser-gpu'];
    return { entry: runtime.hyperframes, cwd: composition, args, inputFile: 'index.html' };
  }
  if (candidate.adapter === 'anidoodle') {
    return {
      entry: path.join(runtime.anidoodle, 'tools/render.mjs'),
      cwd: composition,
      args: ['film', '--out', output, '--workers', '1', '--scale', preview ? '0.5' : '1'],
      inputFile: 'src/canvas-core/film.ts',
    };
  }
  throw new Error(`未接入 ${candidate.workflow} 执行后端。`);
}

const aspectNumbers = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1, '3:4': 3 / 4 };

export async function executeWorkflow({ projectDir, compositionDir, workflowId, styleId, preview = false, durationOverride, signal }) {
  const directory = path.resolve(projectDir);
  const project = parseProject(await fs.readFile(path.join(directory, 'project.json'), 'utf8'));
  const runtime = workflowRuntime();
  const registry = loadWorkflowCatalog(loadCatalog());
  const chosenWorkflow = workflowId ? registry.workflows.find((workflow) => workflow.id === workflowId) : null;
  if (workflowId && !chosenWorkflow) throw new Error(`未知 Workflow：${workflowId}。`);
  const scoped = {
    workflows: chosenWorkflow ? [chosenWorkflow] : registry.workflows,
    styles: styleId ? registry.styles.filter((style) => style.id === styleId) : registry.styles,
  };
  const decision = decideRoute(project, scoped, runtime.environment);
  const selected = decision.selected;
  if (!selected?.ready) throw new Error(selected?.blockers.join(' ') || '没有符合需求的可执行路线。');
  const composition = path.resolve(compositionDir);
  const runs = path.join(directory, 'runs');
  await fs.mkdir(runs, { recursive: true });
  const runDir = await fs.mkdtemp(path.join(runs, `${selected.workflow_id}-${preview ? 'preview' : 'render'}-`));
  const output = path.join(runDir, preview ? 'preview.mp4' : 'video.mp4');
  const command = adapterCommand(selected, runtime, composition, output, project, preview);
  const state = {
    schema_version: 1, status: 'running', stage: preview ? 'preview' : 'render',
    started_at: new Date().toISOString(), decision, log: 'render.log', output: null,
    backend: { id: selected.adapter, version: runtime.environment[selected.adapter].version },
  };
  await writeState(runDir, state);
  try {
    await fs.access(path.join(composition, command.inputFile));
    const env = renderEnvironment(runtime, selected.adapter);
    const timeout = AbortSignal.timeout(10 * 60_000);
    const runSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    await runProcess(command.entry, command.args, command.cwd, env, path.join(runDir, state.log), runSignal).catch((error) => {
      if (timeout.aborted && !signal?.aborted) throw new Error('渲染超过十分钟。', { cause: error });
      throw error;
    });
    const { stdout } = await execute(runtime.ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', output], { env, signal, windowsHide: true, timeout: 15000 });
    const media = JSON.parse(stdout);
    const video = media.streams.find((stream) => stream.codec_type === 'video');
    const duration = Number(media.format?.duration);
    const expectedDuration = durationOverride ?? project.brief.duration_seconds;
    const [fpsNumerator, fpsDenominator] = (video?.avg_frame_rate ?? '').split('/').map(Number);
    const fps = fpsNumerator / fpsDenominator;
    if (!video || !Number.isFinite(duration) || duration <= 0 ||
        Math.abs(video.width / video.height - aspectNumbers[project.brief.aspect_ratio]) > 0.015 ||
        Math.abs(duration - expectedDuration) > 0.1 || fps !== project.brief.fps) {
      throw new Error('输出不符合 Brief 的片长、帧率或画幅。');
    }
    state.status = 'succeeded';
    state.output = path.basename(output);
    state.media = { width: video.width, height: video.height, duration_seconds: duration, fps, codec: video.codec_name, has_audio: media.streams.some((stream) => stream.codec_type === 'audio') };
  } catch (error) {
    state.status = signal?.aborted ? 'cancelled' : 'failed';
    state.error = error.message;
  }
  state.ended_at = new Date().toISOString();
  state.elapsed_seconds = (Date.parse(state.ended_at) - Date.parse(state.started_at)) / 1000;
  await writeState(runDir, state);
  return { runDir, ...state };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: {
    project: { type: 'string' }, composition: { type: 'string' }, workflow: { type: 'string' },
    preview: { type: 'boolean' }, help: { type: 'boolean' },
  } });
  if (values.help || !values.project || !values.composition || !values.workflow) {
    console.log('npm run workflow:render -- --project <项目目录> --composition <已准备的原生工程> --workflow motion|draw [--preview]');
    process.exitCode = values.help ? 0 : 1;
  } else {
    const controller = new AbortController();
    process.once('SIGINT', () => controller.abort());
    try {
      const run = await executeWorkflow({ projectDir: values.project, compositionDir: values.composition, workflowId: values.workflow, preview: values.preview, signal: controller.signal });
      console.log(JSON.stringify(run, null, 2));
      if (run.status !== 'succeeded') process.exitCode = 1;
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
