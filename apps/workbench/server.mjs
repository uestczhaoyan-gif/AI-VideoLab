import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, loadCatalog } from '../../tools/catalog/validate.mjs';

const publicRoot = path.join(ROOT, 'apps/workbench/public');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const realRoot = fs.realpathSync(ROOT);
export function confinedPath(relative, kind) {
  try {
    const file = fs.realpathSync(path.join(ROOT, relative));
    const rel = path.relative(realRoot, file);
    const stat = fs.statSync(file);
    if (rel.startsWith('..') || path.isAbsolute(rel) || !(kind === 'directory' ? stat.isDirectory() : stat.isFile())) return null;
    return file;
  } catch { return null; }
}
export const confinedFile = (relative) => confinedPath(relative, 'file');
export function byteRange(header, size) {
  if (!header) return null;
  const parts = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!parts || (!parts[1] && !parts[2])) return false;
  let start = parts[1] ? Number(parts[1]) : Math.max(0, size - Number(parts[2]));
  const end = parts[1] ? (parts[2] ? Math.min(Number(parts[2]), size - 1) : size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start < 0 || start >= size) return false;
  return { start, end };
}
const sendJSON = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };

export function getRegisteredDocuments(catalog = loadCatalog()) {
  return new Set(['PROJECT.md', 'docs/README.md', 'docs/library/README.md', 'shared/project.schema.json', 'shared/project.mjs', ...catalog.sources.map((s) => s.note_path), ...catalog.templates.map((t) => t.reference_path)]);
}

export function createWorkbenchServer(catalog = loadCatalog()) {
  const documents = getRegisteredDocuments(catalog);
  const staticFiles = new Map(['/index.html', '/app.mjs', '/domain.mjs', '/styles.css'].map((name) => [name, path.join(publicRoot, name.slice(1))]));
  staticFiles.set('/shared/project.mjs', path.join(ROOT, 'shared/project.mjs'));
  staticFiles.set('/shared/project-validator.mjs', path.join(ROOT, 'shared/project-validator.mjs'));
  staticFiles.set('/vendor/lucide.js', path.join(ROOT, 'node_modules/lucide/dist/umd/lucide.js'));
  return http.createServer((req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    if (!/^localhost(?::\d+)?$|^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host ?? '')) return sendJSON(res, 403, { error: 'Local host only' });
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return sendJSON(res, 403, { error: 'Cross-origin access denied' });
    if (!['GET', 'HEAD'].includes(req.method)) return sendJSON(res, 405, { error: 'Read-only workbench' });
    let url;
    try { url = new URL(req.url, `http://${req.headers.host}`); } catch { return sendJSON(res, 400, { error: 'Invalid URL' }); }
    if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    if (url.pathname === '/api/project-schema') {
      const file = confinedFile('shared/project.schema.json');
      return file ? sendJSON(res, 200, JSON.parse(fs.readFileSync(file, 'utf8'))) : sendJSON(res, 404, { error: 'Project schema unavailable' });
    }
    if (url.pathname === '/api/catalog') {
      const data = { ...catalog, templates: catalog.templates.map((t) => ({ ...t, availability: { reference: Boolean(confinedFile(t.reference_path)), preview: Boolean(t.preview && confinedFile(t.preview.path)), poster: Boolean(t.preview?.poster_path && confinedFile(t.preview.poster_path)), project: Boolean(t.project_path && confinedPath(t.project_path, 'directory')) } })) };
      return sendJSON(res, 200, data);
    }
    if (url.pathname === '/api/document') {
      const relative = url.searchParams.get('path');
      if (!documents.has(relative)) return sendJSON(res, 404, { error: 'Document not registered' });
      const file = confinedFile(relative);
      if (!file) return sendJSON(res, 404, { error: '本机文件缺失，请根据来源固定版本恢复。' });
      if (!file.toLowerCase().endsWith('.md') || fs.statSync(file).size > 1024 * 1024) return sendJSON(res, 400, { error: 'Unsupported document' });
      return sendJSON(res, 200, { path: relative, text: fs.readFileSync(file, 'utf8') });
    }
    let file;
    if (url.pathname === '/api/media' || url.pathname === '/api/poster') {
      const template = catalog.templates.find((t) => t.id === url.searchParams.get('id'));
      const relative = url.pathname === '/api/poster' ? template?.preview?.poster_path : template?.preview?.path;
      if (!relative) return sendJSON(res, 404, { error: 'No preview registered' });
      file = confinedFile(relative);
    } else {
      file = staticFiles.get(url.pathname === '/' ? '/index.html' : url.pathname);
    }
    if (!file || !fs.existsSync(file)) return sendJSON(res, 404, { error: 'Resource unavailable' });
    const size = fs.statSync(file).size;
    const range = byteRange(req.headers.range, size);
    if (range === false) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end(); }
    const headers = { 'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'Content-Length': range ? range.end - range.start + 1 : size };
    if (range) headers['Content-Range'] = `bytes ${range.start}-${range.end}/${size}`;
    res.writeHead(range ? 206 : 200, headers);
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(file, range ?? {});
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4317);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const server = createWorkbenchServer();
  server.on('error', (error) => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} occupied. Set PORT to another port.` : error); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`VideoLab: http://127.0.0.1:${port}`));
}
