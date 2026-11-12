# VideoLab 0.3 — Agent-led

- `npm run make` 只生成 Brief、资源候选、`AGENT_TASK.md`、`video.json`，不再套固定模板出片。
- 用户的 DSH / Pi / Codex / Claude 读资源 Prompt，每次从零写代码；不同模型/不同次结果不同是预期。
- `npm run render:agent -- --project ... --stage stills|render` 只抓帧、编码、机械 QA，不写视频代码。
- 资源：20 个仓库/索引、约 2.1 GB；`resources/prompts/` 2.7 MB 详细 Prompt 入库；完整资源通过 Release ZIP 或 `resources:fetch`。
- 410 个模板 → Prompt → Workflow 对照。
- 不预置固定风格适配器；没有同名模板不是阻塞。
- 无网页 UI、无视频预览、不代理模型调用。

## 边界

- 每次视频由 Agent 重写，风格/效果不保证一致。
- `render:agent` 只支持 HTML + `window.render(t)` 的标准 harness；其他栈由 Agent 自交付。
- 资源许可逐项核对；P16 非商业，CAP 混合许可，P12 部分。
