import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/schema.json'), 'utf8'));
const validateSchema = new Ajv({ allErrors: true }).compile(schema);

export function safeRelative(value) {
  return typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.includes('\0') && !path.posix.isAbsolute(value) && !/^[a-z]+:/i.test(value) && value.split('/').every((part) => part && part !== '.' && part !== '..');
}

export function validateCatalog(data) {
  const errors = [];
  if (!validateSchema(data)) return validateSchema.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
  const unique = (items, kind) => {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item.id)) errors.push(`Duplicate ${kind}: ${item.id}`);
      seen.add(item.id);
    }
    return seen;
  };
  const sources = unique(data.sources, 'source');
  const templates = unique(data.templates, 'template');
  const recipes = unique(data.recipes, 'recipe');
  const checkPath = (value, owner) => { if (value !== null && !safeRelative(value)) errors.push(`Unsafe path for ${owner}: ${value}`); };
  const checkTiming = (timing, owner) => {
    if (!timing) return;
    if (Math.abs(timing.duration_seconds * timing.fps - timing.frames) > 1) errors.push(`Timing is inconsistent for ${owner}`);
    if (timing.bpm !== null && timing.bpm !== undefined && timing.beat_frames != null && Math.abs(60 / timing.bpm * timing.fps - timing.beat_frames) > 0.25) errors.push(`Beat frames do not match BPM for ${owner}`);
  };
  const checkLineage = (lineage, owner, known) => {
    if (!lineage) return;
    for (const id of [...lineage.same_author, ...lineage.derived_from]) {
      if (id === owner) errors.push(`Lineage of ${owner} references itself`);
      else if (known && !known.has(id)) errors.push(`Unknown lineage source ${id} on ${owner}`);
    }
  };
  for (const source of data.sources) {
    checkPath(source.note_path, source.id);
    checkTiming(source.timing, source.id);
    checkLineage(source.lineage, source.id, sources);
  }
  const sourceRecords = new Map(data.sources.map((s) => [s.id, s]));
  for (const t of data.templates) {
    if (!sources.has(t.source_id)) errors.push(`Unknown source ${t.source_id} on ${t.id}`);
    const sourceRevision = sourceRecords.get(t.source_id)?.revision;
    if (sourceRevision && sourceRevision !== t.revision) errors.push(`Revision mismatch for ${t.id}`);
    for (const id of t.recipe_ids) if (!recipes.has(id)) errors.push(`Unknown recipe ${id} on ${t.id}`);
    for (const id of t.related_ids) if (!templates.has(id) || id === t.id) errors.push(`Invalid relation ${id} on ${t.id}`);
    checkPath(t.reference_path, t.id);
    checkPath(t.project_path, t.id);
    checkTiming(t.timing, t.id);
    checkLineage(t.lineage, t.id, sources);
    if (t.preview) {
      checkPath(t.preview.path, t.id);
      if (t.preview.poster_path) {
        checkPath(t.preview.poster_path, t.id);
        if (!/\.(jpe?g|png|webp)$/i.test(t.preview.poster_path)) errors.push(`Unsupported poster ${t.id}`);
      }
      const ext = path.extname(t.preview.path).toLowerCase();
      if (!(t.preview.kind === 'image' ? ['.jpg', '.jpeg', '.png', '.webp'] : ['.mp4', '.webm']).includes(ext)) errors.push(`Unsupported preview ${t.id}`);
    }
  }
  for (const recipe of data.recipes) {
    for (const id of recipe.source_ids) if (!sources.has(id)) errors.push(`Unknown source ${id} on ${recipe.id}`);
    unique(recipe.stages, `stage in ${recipe.id}`);
  }
  return errors;
}

export function loadCatalog() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog/catalog.json'), 'utf8'));
  const errors = validateCatalog(data);
  if (errors.length) throw new Error(errors.join('\n'));
  return data;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = loadCatalog();
  console.log(`Catalog valid: ${data.sources.length} sources, ${data.templates.length} templates, ${data.recipes.length} draft recipes; no executable model routes.`);
}
