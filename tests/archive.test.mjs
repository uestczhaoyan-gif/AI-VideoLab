import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { marked } from 'marked';
import { ROOT } from '../tools/catalog/validate.mjs';

const manifestPath = path.join(ROOT, '.tmp/workbench-reorganization/manifest.json');
test('archive preserves original text, code and destinations; backup hashes match migration manifest', { skip: !fs.existsSync(manifestPath) && 'Local migration backups not present' }, () => {
  const { records } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const moves = new Map(records.filter((r) => r.operation === 'move').map((r) => [path.resolve(ROOT, r.from).toLowerCase(), path.resolve(ROOT, r.to)]));
  function normalize(value, origin) {
    if (Array.isArray(value)) return value.map((item) => normalize(item, origin));
    if (!value || typeof value !== 'object') return value;
    const result = {};
    for (const [key, data] of Object.entries(value)) {
      if (key === 'raw' || (key === 'text' && Array.isArray(value.tokens))) continue;
      if (key === 'href' && !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(data)) {
        const separator = data.search(/[?#]/);
        const href = separator < 0 ? data : data.slice(0, separator);
        const tail = separator < 0 ? '' : data.slice(separator);
        const resolved = path.resolve(ROOT, path.dirname(origin), decodeURIComponent(href));
        result[key] = (moves.get(resolved.toLowerCase()) ?? resolved).toLowerCase() + tail;
      } else result[key] = normalize(data, origin);
    }
    return result;
  }
  for (const record of records) {
    const backup = fs.readFileSync(path.join(ROOT, '.tmp/workbench-reorganization/before', record.from));
    assert.equal(crypto.createHash('sha256').update(backup).digest('hex'), record.original_sha256, record.from);
    const archived = fs.readFileSync(path.join(ROOT, record.to), 'utf8');
    assert.ok(archived.startsWith('> Historical archive.'), record.to);
    const originalBody = marked.lexer(backup.toString('utf8'));
    const archivedBody = marked.lexer(archived.replace(/^> Historical archive\.[^\n]*\n\n/, ''));
    assert.deepEqual(normalize(archivedBody, record.to), normalize(originalBody, record.from), `Archive content changed beyond banner/link relocation: ${record.to}`);
  }
});
