import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../catalog/validate.mjs';

const local = (...parts) => path.join(ROOT, '.tmp', 'workflow-tools', ...parts);
const firstExe = (directory, name) => {
  if (!fs.existsSync(directory)) return null;
  const matches = fs.readdirSync(directory).filter((file) => name.test(file)).sort();
  return matches.length ? path.join(directory, matches[0]) : null;
};
const resolveConfigured = (key, fallback) => process.env[key] ? path.resolve(process.env[key]) : fallback;
const installedVersion = (packageFile) => {
  try { return JSON.parse(fs.readFileSync(packageFile, 'utf8')).version; }
  catch { return null; }
};

export function workflowRuntime() {
  const hyperframes = resolveConfigured('VIDEOLAB_HYPERFRAMES', local('hyperframes', 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs'));
  const anidoodle = resolveConfigured('VIDEOLAB_ANIDOODLE', local('anidoodle', 'skills', 'anidoodle', 'engine'));
  const ffmpeg = resolveConfigured('VIDEOLAB_FFMPEG', firstExe(path.join(ROOT, '.tmp/python/imageio_ffmpeg/binaries'), /^ffmpeg.*\.exe$/i));
  const ffprobe = resolveConfigured('VIDEOLAB_FFPROBE', local('ffprobe', 'node_modules', 'ffprobe-static', 'bin', 'win32', 'x64', 'ffprobe.exe'));
  const browser = resolveConfigured('VIDEOLAB_HEADLESS_BROWSER', local('browsers', 'chromium_headless_shell-1208', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'));
  const browserCache = resolveConfigured('PLAYWRIGHT_BROWSERS_PATH', local('browsers'));
  const cachedEsbuild = local('esbuild', 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe');
  const esbuild = resolveConfigured('ESBUILD_BINARY_PATH', fs.existsSync(cachedEsbuild) ? cachedEsbuild : null);
  const required = {
    hyperframes: { hyperframes, ffmpeg, ffprobe, browser },
    anidoodle: {
      anidoodle: path.join(anidoodle, 'tools/render.mjs'), ffmpeg, ffprobe, browser, browserCache,
      esbuild: esbuild ?? path.join(anidoodle, 'node_modules', 'esbuild', 'package.json'),
    },
  };
  const versions = {
    hyperframes: installedVersion(path.resolve(path.dirname(hyperframes), '../package.json')),
    anidoodle: installedVersion(path.join(anidoodle, 'package.json')),
  };
  const pinned = { hyperframes: '0.8.217', anidoodle: '0.10.0' };
  const environment = Object.fromEntries(Object.entries(required).map(([adapter, files]) => {
    const missing = Object.entries(files).filter(([, file]) => !file || !fs.existsSync(file)).map(([name]) => name);
    const version = versions[adapter];
    const reason = missing.length
      ? `本地依赖缺失：${missing.join('、')}。`
      : version !== pinned[adapter] ? `当前只验证了 ${adapter} ${pinned[adapter]}，本机版本为 ${version ?? '未知'}。` : null;
    return [adapter, { ready: reason === null, reason, version }];
  }));
  return { hyperframes, anidoodle, ffmpeg, ffprobe, browser, browserCache, esbuild, environment };
}

export function renderEnvironment(runtime, adapter) {
  const systemKeys = /^(path|systemroot|windir|systemdrive|comspec|pathext|temp|tmp|tmpdir|home|userprofile|appdata|localappdata|programfiles(?:\(x86\))?|programdata|lang|lc_.+)$/i;
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => systemKeys.test(key)));
  if (adapter === 'hyperframes') {
    return {
      ...env,
      DO_NOT_TRACK: '1',
      HYPERFRAMES_BROWSER_PATH: runtime.browser,
      HYPERFRAMES_FFMPEG_PATH: runtime.ffmpeg,
      HYPERFRAMES_FFPROBE_PATH: runtime.ffprobe,
    };
  }
  const pathKey = Object.keys(env).find((key) => /^path$/i.test(key)) ?? 'PATH';
  env[pathKey] = [path.dirname(runtime.ffprobe), env[pathKey]].filter(Boolean).join(path.delimiter);
  return { ...env, FFMPEG: runtime.ffmpeg, PLAYWRIGHT_BROWSERS_PATH: runtime.browserCache, ...(runtime.esbuild ? { ESBUILD_BINARY_PATH: runtime.esbuild } : {}) };
}
