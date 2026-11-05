import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { createWorkbenchServer, byteRange, confinedFile } from '../apps/workbench/server.mjs';
import { loadCatalog } from '../tools/catalog/validate.mjs';

async function serve(t, catalog = loadCatalog()) {
  const server = createWorkbenchServer(catalog);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('range parser handles seeking, suffixes and malformed ranges', () => {
  assert.deepEqual(byteRange('bytes=2-9', 100), { start: 2, end: 9 });
  assert.deepEqual(byteRange('bytes=80-', 100), { start: 80, end: 99 });
  assert.deepEqual(byteRange('bytes=-10', 100), { start: 90, end: 99 });
  assert.deepEqual(byteRange('bytes=2-999', 100), { start: 2, end: 99 });
  assert.equal(byteRange(undefined, 100), null);
  for (const range of ['bytes=-', 'bytes=2-1', 'bytes=100-', 'bytes=-0', 'bytes=0-1,4-5', 'bad', 'bytes=999999999999999999-']) assert.equal(byteRange(range, 100), false);
});

test('server provides catalog and safe static application with security headers', async (t) => {
  const base = await serve(t);
  const res = await fetch(base); assert.equal(res.status, 200);
  assert.ok((await res.text()).includes('VideoLab'));
  assert.ok(res.headers.get('content-security-policy').includes("frame-src 'none'"));
  const data = await (await fetch(`${base}/api/catalog`)).json();
  assert.equal(data.templates.length, 408);
  assert.equal(typeof data.templates[0].availability.preview, 'boolean');
  assert.equal((await fetch(`${base}/vendor/lucide.js`)).status, 200);
  // The workbench is a no-build ES-module app; shared modules must be served too.
  assert.equal((await fetch(`${base}/shared/project.mjs`)).status, 200);
  assert.equal((await fetch(`${base}/shared/project-validator.mjs`)).status, 200);
});

test('only registered Markdown and preview media can be read; no HTML, credentials or scripts', async (t) => {
  const base = await serve(t);
  const response = await fetch(`${base}/api/document?path=PROJECT.md`);
  assert.equal(response.status, 200); assert.ok((await response.json()).text.includes('VideoLab'));
  for (const url of ['/api/document?path=../secret.md', '/api/document?path=.git/config', '/api/document?path=.env', '/docs/theory/_sources/auto-motion/index.html', '/package.json', '/node_modules/ajv/package.json', '/api/media?id=../secret', '/api/poster?id=missing', '/api/execute', '/api/generate']) assert.equal((await fetch(base + url)).status, 404, url);
  assert.equal((await fetch(`${base}/api/catalog`, { method: 'POST' })).status, 405);
  assert.equal(confinedFile('../outside-secret'), null);
  assert.equal((await fetch(`${base}/api/catalog`, { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  const status = await new Promise((resolve, reject) => {
    const req = http.get(`${base}/api/catalog`, { headers: { Host: 'untrusted.example' } }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); }); req.on('error', reject);
  });
  assert.equal(status, 403);
});

test('missing cached files remain indexed and never become executable', async (t) => {
  const data = structuredClone(loadCatalog());
  data.templates[0].reference_path = 'not-cached/PROMPT.md';
  data.templates[0].preview = { kind: 'image', path: 'not-cached/poster.jpg', scope: 'local_only' };
  const base = await serve(t, data);
  const item = (await (await fetch(`${base}/api/catalog`)).json()).templates[0];
  assert.equal(item.availability.reference, false); assert.equal(item.availability.preview, false); assert.equal(item.runnable, false);
  assert.equal((await fetch(`${base}/api/media?id=${item.id}`)).status, 404);
  assert.equal((await fetch(`${base}/api/document?path=${encodeURIComponent(item.reference_path)}`)).status, 404);
});

test('actual local preview supports byte ranges and HEAD without executing content', async (t) => {
  const catalog = loadCatalog();
  const item = catalog.templates.find((x) => x.preview && confinedFile(x.preview.path));
  if (!item) return t.skip('Local caches not present; missing-cache behavior is tested separately.');
  const base = await serve(t, catalog);
  const res = await fetch(`${base}/api/media?id=${item.id}`, { headers: { Range: 'bytes=0-31' } });
  assert.equal(res.status, 206); assert.equal((await res.arrayBuffer()).byteLength, 32);
  assert.ok(res.headers.get('content-type').startsWith(item.preview.kind === 'image' ? 'image/' : 'video/'));
  const head = await fetch(`${base}/api/media?id=${item.id}`, { method: 'HEAD' }); assert.equal(head.status, 200); assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal((await fetch(`${base}/api/media?id=${item.id}`, { headers: { Range: 'bytes=999999999999999999-' } })).status, 416);
});
