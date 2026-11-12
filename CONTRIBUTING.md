# 参与与复现

VideoLab 是 **Agent-led** 本地视频项目：`npm run make` 只生成 Brief/资源/任务，视频代码由用户的 DSH/Pi/Codex/Claude 从零写，`render:agent` 只抓帧、编码、机械 QA。范围见 [PROJECT.md](PROJECT.md)，Agent 契约见 [CREATE_VIDEO.md](docs/library/CREATE_VIDEO.md)。

## 开发环境

```sh
npm ci --ignore-scripts
npm test
npm run catalog:check
npm run catalog:map:check
npm run docs:check
```

真实渲染还需要 Chrome/Edge 与 ffmpeg；先由 Agent 写 `scene.html`，再：

```sh
npm run render:agent -- --project projects/<目录> --stage stills
npm run render:agent -- --project projects/<目录> --stage render
```

## 结构

- `tools/agent/plan.mjs`：生成 Agent 任务，不渲染。
- `tools/agent/render.mjs`：通用抓帧/编码/QA，不写视频代码。
- `tools/render/`：Chrome/ffmpeg 工具。
- `resources/`：参考库；`source/` 不入库，Prompt 文本入库。
- 旧 `recipes/`、`tools/studio/`：0.2 回归夹具；**不作为主路径，不再扩写**。

## 修改规则

- 不重新引入固定风格/模板生成；每次视频由 Agent 重写。
- 不新增“风格适配器”或逐条 demo；资源通过映射/Prompt 使用。
- 来源 ID 稳定；新资源先登记 `resources/` + AUDIT + TEMPLATE_MAP。
- 确认门与 `not_checked` 语义不能放宽；机械 QA 不冒充内容/观看/采用。
- 提交前跑 `npm test`、`npm run catalog:map:check`、`npm run docs:check`；改渲染工具时至少跑一次 `render:agent`。

## 许可

根代码许可见 [LICENSE](LICENSE)；上游资源许可见各 LICENSE 与 [resources/AUDIT.md](resources/AUDIT.md)。Apache/MIT 不自动覆盖素材、字体、音效、品牌资产。
