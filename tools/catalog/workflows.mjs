import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import { ROOT, safeRelative } from './validate.mjs';

const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const validate = new Ajv({ allErrors: true, strict: true }).compile(read('catalog/workflows.schema.json'));

export function loadWorkflowCatalog(catalog) {
  const data = read('catalog/workflows.json');
  if (!validate(data)) {
    throw new Error(validate.errors.map((error) => `${error.instancePath} ${error.message}`).join('\n'));
  }
  const templates = new Map(catalog.templates.map((entry) => [entry.id, entry]));
  const sources = new Map(catalog.sources.map((entry) => [entry.id, entry]));
  const snapshots = new Map(read('resources/MANIFEST.json').items.map((entry) => [entry.id, entry]));
  const mapping = new Map(read('catalog/template-map.json').templates.map((entry) => [entry.id, entry]));
  const workflowIds = new Set(data.workflows.map(({ id }) => id));
  if (workflowIds.size !== data.workflows.length || new Set(data.styles.map(({ id }) => id)).size !== data.styles.length) {
    throw new Error('Workflow 和风格 ID 不能重复。');
  }
  const workflows = data.workflows.map((workflow) => {
    const source = sources.get(workflow.source_id);
    const snapshot = snapshots.get(workflow.source_id);
    if (workflow.source_id !== null && (!source || snapshot?.revision !== workflow.revision)) {
      throw new Error(`Workflow ${workflow.id} 与资源清单固定版本不一致。`);
    }
    if ((workflow.source_id === null) !== (workflow.revision === null) || workflow.duration[0] > workflow.duration[1]) {
      throw new Error(`Workflow ${workflow.id} 的来源版本或时长范围无效。`);
    }
    const references = workflow.reference_ids.map((id) => {
      const reference = sources.get(id);
      if (!reference) throw new Error(`Workflow ${workflow.id} 引用了未知来源 ${id}。`);
      return { id, url: reference.url, role: 'reference' };
    });
    return { ...workflow, source: source ? { id: source.id, url: snapshot.repo, revision: snapshot.revision } : null, references };
  });
  const styles = data.styles.map((style) => {
    if (style.workflows.some((id) => !workflowIds.has(id))) throw new Error(`风格 ${style.id} 引用了未知 Workflow。`);
    if (!style.template_id) return { ...style, resource: null };
    const template = templates.get(style.template_id);
    const prompt = mapping.get(style.template_id)?.prompt_path;
    if (!template || !safeRelative(prompt)) throw new Error(`风格 ${style.id} 的 Prompt 映射缺失。`);
    const source = sources.get(template.source_id);
    const preview = template.preview?.path;
    return {
      ...style,
      resource: {
        id: template.id,
        source_id: template.source_id,
        revision: template.revision,
        url: source.url,
        prompt_path: prompt,
        availability: fs.existsSync(path.join(ROOT, prompt)) ? 'cached' : 'indexed',
        commercial: template.license.commercial,
        preview_path: safeRelative(preview) && fs.existsSync(path.join(ROOT, preview)) ? preview : null,
      },
    };
  });
  return { workflows, styles };
}
