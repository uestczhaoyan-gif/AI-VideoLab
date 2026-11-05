import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium } from '@playwright/test';
import { createWorkbenchServer } from '../apps/workbench/server.mjs';
import { ROOT } from '../tools/catalog/validate.mjs';

const output = path.join(ROOT, '.tmp/workbench-verification');
fs.mkdirSync(output, { recursive: true });
const executable = process.env.VIDEOLAB_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  chromium.executablePath(),
].find((p) => fs.existsSync(p));
if (!executable) throw new Error('No installed Chromium browser found. Set VIDEOLAB_BROWSER; no browser is downloaded automatically.');
const server = createWorkbenchServer();
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const checks = [];
const mediaSkipped = [];
try {
  browser = await chromium.launch({ executablePath: executable, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', (route) => {
    if (route.request().url().startsWith(base)) return route.continue();
    externalRequests.push(route.request().url()); return route.abort();
  });
  async function noOverflow(label) {
    const over = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(over.scroll <= over.width + 1, `${label} horizontal overflow: ${JSON.stringify(over)}`);
    const clipped = await page.locator('.title-button,.page-heading h1,.selected-template h3').evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent));
    assert.deepEqual(clipped, [], `${label}: clipped text`);
    checks.push(label);
  }
  await page.goto(base);
  await page.getByRole('searchbox', { name: '搜索模板' }).waitFor();
  assert.equal(await page.locator('.template-card').count(), 24);
  await page.evaluate(() => { localStorage.setItem('videolab:plans:v1', '[{"schema_version":1,"id":"bad","brief":{},"selection":{}}]'); });
  await page.reload();
  await page.getByRole('searchbox', { name: '搜索模板' }).waitFor();
  assert.equal(await page.locator('#saved-count').textContent(), '0');
  checks.push('malformed-browser-storage-ignored');
  const actualCatalog = await (await fetch(`${base}/api/catalog`)).json();
  let imagePixels = null;
  if (actualCatalog.templates.some((t) => t.preview?.kind === 'image' && t.availability.preview)) {
    await page.locator('.template-card img').first().waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('.template-card img')].some((img) => img.complete && img.naturalWidth > 0));
    imagePixels = await page.evaluate(() => {
      const image = [...document.querySelectorAll('.template-card img')].find((img) => img.complete && img.naturalWidth > 0);
      const canvas = document.createElement('canvas'); canvas.width = 80; canvas.height = 45;
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, 80, 45);
      const pixels = ctx.getImageData(0, 0, 80, 45).data; const colors = new Set();
      for (let i = 0; i < pixels.length; i += 16) colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
      return colors.size;
    });
    assert.ok(imagePixels > 20, `Preview unexpectedly blank: ${imagePixels} colors`);
  } else mediaSkipped.push('No local image previews; pixel check skipped.');
  await noOverflow('desktop-library-1440');
  await page.screenshot({ path: path.join(output, 'desktop-library.png') });
  await page.getByRole('searchbox').fill('一笔画');
  assert.ok(await page.locator('.template-card').count() >= 2);
  await page.getByRole('searchbox').fill('no-result-12345');
  await page.getByRole('heading', { name: '没有匹配条目' }).waitFor();
  await page.locator('.empty-state [data-action="clear-filters"]').click();
  await page.locator('#commercial-filter').check();
  await page.getByText('当前目录没有已完成商用授权核查的模板。').waitFor();
  await page.locator('#commercial-filter').uncheck();
  await page.locator('#collection-filter').selectOption('MG15');
  assert.equal(await page.locator('.template-card').count(), 15);
  await page.locator('[data-favorite="mg-01-flat-vector"]').click();
  await page.locator('[data-scope="favorites"]').click();
  assert.equal(await page.locator('.template-card').count(), 1);
  await page.locator('[data-scope="all"]').click();
  await page.locator('[data-compare="mg-01-flat-vector"]').click();
  await page.locator('[data-compare="mg-03-isometric"]').click();
  await page.locator('[data-action="show-compare"]').click();
  assert.equal(await page.locator('#compare-dialog .compare-grid section').count(), 2);
  await page.locator('[data-close="compare-dialog"]').click();
  await page.getByRole('button', { name: '查看 平面矢量', exact: true }).click();
  await page.locator('#detail-dialog').getByText('尚无预览', { exact: true }).waitFor();
  await page.locator('#detail-dialog').getByText('本机已取得', { exact: true }).waitFor();
  const facts = await page.locator('#detail-dialog .facts').innerText();
  for (const label of ['证据状态', '时间规格', '谱系']) assert.ok(facts.includes(label), label);
  await page.locator('#detail-dialog [data-doc]').first().click();
  await page.waitForFunction(() => (document.querySelector('#document-dialog pre')?.textContent ?? '').length > 200);
  await page.locator('[data-close="document-dialog"]').click();
  await page.locator('#detail-dialog [data-use]').click();
  await page.getByText('确认门与 QA 契约', { exact: true }).waitFor();
  assert.equal(await page.locator('.contract-list li').count(), 11);
  checks.push('plan-contract-panel');
  await page.locator('textarea[name="topic"]').fill('用直观画面解释四季与地轴倾角');
  await page.locator('[name="budget"]').fill('50');
  await page.locator('[name="narration"]').selectOption('tts');
  await page.locator('[name="bgm"]').selectOption('library');
  await page.locator('[name="notes"]').fill('必须保留地轴方向；完整视听需人工确认。');
  await noOverflow('desktop-plan-1440');
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(output, 'desktop-plan.png'), fullPage: true });
  async function jsonExport() {
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-export="json"]').click()]);
    return JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  }
  const budgetPlan = await jsonExport();
  assert.equal(budgetPlan.cost.budget_limit, 50); assert.equal(budgetPlan.cost.estimate, null);
  assert.equal(budgetPlan.brief.narration, 'tts'); assert.equal(budgetPlan.execution_ready, false);
  await page.locator('[data-tier="premium"]').click();
  const premiumPlan = await jsonExport();
  assert.deepEqual(premiumPlan.brief, budgetPlan.brief);
  assert.equal(premiumPlan.selection.tier, 'premium');
  const [markdown] = await Promise.all([page.waitForEvent('download'), page.locator('[data-export="md"]').click()]);
  assert.ok(fs.readFileSync(await markdown.path(), 'utf8').includes('不能自动执行'));
  await page.evaluate(() => { window.restoreStorage = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error('Storage unavailable'); }; });
  await page.locator('[data-action="save-plan"]').click();
  await page.getByText('浏览器存储不可用，请导出方案。', { exact: true }).waitFor();
  await page.locator('#navigation [data-view="saved"]').click();
  await page.getByRole('heading', { name: '还没有保存方案' }).waitFor();
  await page.evaluate(() => { Storage.prototype.setItem = window.restoreStorage; delete window.restoreStorage; });
  await page.locator('#navigation [data-view="plan"]').click();
  checks.push('storage-write-failure-not-shown-as-saved');
  await page.locator('[data-action="save-plan"]').click();
  await page.locator('#navigation [data-view="saved"]').click();
  await page.locator('.saved-item').waitFor();
  await page.reload();
  await page.locator('.saved-item').waitFor();
  assert.equal(await page.locator('.saved-item').count(), 1);
  await page.locator('[data-open-plan]').click();
  assert.equal(await page.locator('[name="budget"]').inputValue(), '50');
  assert.equal(await page.locator('[name="narration"]').inputValue(), 'tts');
  checks.push('filters-favorites-compare-save-reopen-json-markdown');
  await page.evaluate(() => { const data = JSON.parse(localStorage.getItem('videolab:plans:v1')); data[0].selection.template_revision = 'outdated'; localStorage.setItem('videolab:plans:v1', JSON.stringify(data)); });
  await page.locator('#navigation [data-view="saved"]').click();
  await page.reload();
  await page.locator('[data-open-plan]').click();
  await page.getByText('模板或流程版本已变化；原方案仍可导出，请重新选择后另存。', { exact: true }).waitFor();
  const [oldDownload] = await Promise.all([page.waitForEvent('download'), page.locator('[data-download-plan]').click()]);
  assert.equal(JSON.parse(fs.readFileSync(await oldDownload.path(), 'utf8')).selection.template_revision, 'outdated');
  checks.push('stale-saved-version-never-silently-upgraded');
  await page.locator('#navigation [data-view="templates"]').click();
  await page.locator('#collection-filter').selectOption('TOOLS');
  await page.getByRole('button', { name: '查看 Onetake 连续镜头', exact: true }).click();
  await page.locator('#detail-dialog').getByText('PolyForm Noncommercial 1.0.0', { exact: true }).waitFor();
  await page.locator('#detail-dialog [data-use]').click();
  await page.locator('[name="usage"]').selectOption('commercial');
  await page.getByText('商业使用受限，不能执行', { exact: true }).waitFor();
  checks.push('restricted-license-blocker-visible');
  await page.locator('#navigation [data-view="sources"]').click();
  await page.locator('.source-table tbody tr').first().waitFor();
  assert.equal(await page.locator('.source-table tbody tr').count(), 35);
  assert.equal(await page.locator('.source-table .tag.teal').count(), 5);
  assert.ok((await page.locator('.source-table').innerText()).includes('同源新版本'));
  checks.push('sources-lineage-tags');
  await page.locator('#navigation [data-view="plan"]').click();
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 740 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await noOverflow(`plan-${viewport.width}`);
    if (viewport.width === 390) { await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: path.join(output, 'mobile-plan.png'), fullPage: true }); }
    await page.locator('#navigation [data-view="templates"]').click();
    await page.locator('#collection-filter').selectOption('');
    await noOverflow(`library-${viewport.width}`);
    if (viewport.width === 390) await page.screenshot({ path: path.join(output, 'mobile-library.png') });
    await page.locator('#navigation [data-view="plan"]').click();
  }
  const offline = await (await fetch(`${base}/api/catalog`)).json();
  for (const t of offline.templates) t.availability = { reference: false, preview: false, poster: false, project: false };
  await page.route('**/api/catalog', (route) => route.fulfill({ json: offline }));
  await page.goto(base);
  await page.locator('.template-card [data-detail]').first().waitFor();
  assert.ok(await page.getByText('本机预览文件缺失', { exact: true }).count() > 0);
  await page.locator('.template-card [data-detail]').first().click();
  await page.getByText('本机缺失，按固定版本恢复', { exact: true }).waitFor();
  await noOverflow('missing-cache-detail');
  checks.push('all-local-caches-missing-still-browsable');
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  const result = { browser: path.basename(executable), checks, preview_unique_sample_colors: imagePixels, media_checks_skipped: mediaSkipped, page_errors: errors, external_requests: externalRequests, screenshots: ['desktop-library.png', 'desktop-plan.png', 'mobile-library.png', 'mobile-plan.png'] };
  fs.writeFileSync(path.join(output, 'browser-report.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close();
  await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
}
