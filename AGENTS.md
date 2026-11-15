# VideoLab AI 交接

## 制片主路径（优先于下方历史说明）

用户已明确目标：聚合开源代码、Prompt、视频参考和 Workflow，让普通用户通过几句对话获得合适风格的视频。先读 `PROJECT.md` 新总计划；保留 0.3 代码兼容性，按阶段迁移。

- VideoLab 负责需求、资源索引、Workflow 推荐、任务 Prompt、阶段推进、交付记录和验收。Agent 根据本次需求从零写视频代码，自行选择并调用工具；同一项目的返修改已有源码。
- 创作台自动交接任务。Workflow、Prompt、代码与参考片都是 Agent 的制作资料，无需先接入某个风格的渲染适配器才能开工。历史的两条固定后端不用于创作台。
- 工具能力与环境由 Agent 实测。资源许可、预算、素材及用户确认是实际制作约束。
- 路由共同考虑主题、受众、片长、交付期限、素材、预算与环境；风格与 Workflow 分开建模。
- 分开记录资源收录、Prompt 可读、历史运行验证和当前可执行性；保留来源、许可、版本和证据。
- 创作台入口见 `docs/STUDIO.md`，Agent 制作契约见 `docs/library/CREATE_VIDEO.md`。

下方为 0.3 历史操作说明；与新产品方向冲突的限制以本节和 `PROJECT.md` 为准。

## 先读什么

1. `PROJECT.md`：Agent-led 0.3 的范围、分工和验证。
2. `README.md`：首次使用与 `make` / `render:agent` 流程。
3. `docs/library/CREATE_VIDEO.md`：Agent 的详细制作契约。
4. `docs/library/TEMPLATE_MAP.md`：模板 → Prompt → Workflow；`resources/PROMPTS.md`：可读 Prompt。
5. `docs/library/STYLE_GENERATION.md`：由 Agent 读资源 Prompt、从零生成视频代码的说明。

## 当前方向

**Agent-led，0.3。** `npm run make` 只生成 Brief、资源候选和 `AGENT_TASK.md`，不渲染、不套固定模板。用户把项目交给 DSH / Pi / Codex / Claude；Agent 从零写代码（默认 `scene.html`，也可自选本地工程），然后：

```sh
npm run render:agent -- --project projects/<目录> --stage stills
npm run render:agent -- --project projects/<目录> --stage render
```

不同模型、不同次生成会有不同实现，这是预期结果。不要为了“统一效果”加固定风格适配器。

## 边界

| 位置 | 职责 |
| --- | --- |
| `tools/agent/plan.mjs` | 生成 Agent 任务；不渲染 |
| `tools/agent/render.mjs` | 通用抓帧/编码/机械 QA；不写视频代码 |
| `resources/` | 参考库；`source/` Git 忽略，Prompt 文本入库 |
| `catalog/` | 410 模板、38 来源、模板映射 |
| 旧 `recipes/` / `tools/studio/` | 历史回归测试夹具；**不作为主路径，不再扩写** |

## 关键规则

- 开始先看 `git status --short`，保留用户未提交改动。
- `npm run make` 不得再生成固定模板视频；`render:agent` 不得替 Agent 写创意代码。
- 模板是视觉语言，不是主题分类器：没有同名模板不是阻塞，读最接近的 Prompt 后**重新写代码**。
- 每次视频从头写；不复制旧 scene/recipe/style 实现来“快速出片”。
- Agent 需要用户自己的模型/密钥；CLI 不代管、不调用付费 API。
- `render:agent` 只做机械检查：不要把 `passed` 说成内容/观看/采用验收。
- 资源只从固定版本恢复；不提交 `resources/**/source/`，不用 `git add -f`。
- 不再新增“风格适配器”或逐条 demo；资源可用性用 `resources/AUDIT.md` 与映射说明。

## 常用入口

- 计划：`npm run make -- --topic "..."`；建议：`--suggest`。
- 渲染：`npm run render:agent -- --project projects/<目录> --stage stills|render`。
- 检查：`npm test`、`npm run catalog:check`、`npm run catalog:map:check`、`npm run docs:check`。
- 资源：`npm run resources:fetch`、`npm run resources:audit`、`npm run resources:pack`。
- Agent 交接：`npm run cli`（Pi）或直接在 DSH/Codex/Claude 打开仓库。

完成阶段后更新 `PROJECT.md` 的实际产物与未验证项；细节留在对应文档，不另建平行总计划。
