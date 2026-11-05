import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT } from './validate.mjs';
import { REVISIONS } from './seed.mjs';

const LOCK = path.join(ROOT, 'catalog/snapshots.json');
export function fingerprint(relativePaths) {
  const entries = [...relativePaths].sort().map((relative) => ({ path: relative, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relative))).digest('hex') }));
  return { count: entries.length, sha256: crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex') };
}
export function verifySnapshot(collection, files) {
  const expected = JSON.parse(fs.readFileSync(LOCK, 'utf8'))[collection];
  const actual = fingerprint(files);
  if (!expected || expected.revision !== REVISIONS[collection] || expected.count !== actual.count || expected.sha256 !== actual.sha256) throw new Error(`Changed ${collection} snapshot inputs. Review provenance and version; do not silently import with the old revision.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv.includes('--initialize') || fs.existsSync(LOCK)) throw new Error('Initialization only: pass --initialize when no lock exists. Review revision and provenance first.');
  const files = {
    CAP: ['docs/theory/_sources/code-animation-prompts/skills/code-animation-prompts/references/catalog.json'],
    LEMO: fs.readdirSync(path.join(ROOT, 'resources/lemo-opuscar/source/styles')).map((name) => `resources/lemo-opuscar/source/styles/${name}/style.json`).filter((p) => !p.includes('/_template/') && fs.existsSync(path.join(ROOT, p))),
    MG15: fs.readdirSync(path.join(ROOT, 'resources/mg-styles-15/source/prompts')).filter((p) => p.endsWith('.md')).map((p) => `resources/mg-styles-15/source/prompts/${p}`),
  };
  const lock = Object.fromEntries(Object.entries(files).map(([key, paths]) => [key, { revision: REVISIONS[key], ...fingerprint(paths) }]));
  fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n');
  console.log('Recorded metadata fingerprints; this does not independently verify every upstream asset.');
}
