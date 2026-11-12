# AI 视频方法库

本目录是 Agent 与用户共用的人工可读知识层：整理资源、Prompt、Workflow 与来源。**当前 Agent-led 流程与阶段见 [PROJECT.md](../../PROJECT.md)**；本页只负责资料导航。

## 从哪里开始

| 入口 | 解决什么问题 |
| --- | --- |
| [CREATE_VIDEO.md](CREATE_VIDEO.md) | Agent 的制作契约：从零写代码、风格帧、渲染与边界 |
| [TEMPLATE_MAP.md](TEMPLATE_MAP.md) | 410 个模板 → Prompt 路径 → 建议 Workflow；全部为参考，不是固定执行器 |
| [STYLE_GENERATION.md](STYLE_GENERATION.md) | 资源 Prompt → Agent 现写场景代码 → 通用渲染 |
| [VIDEO_WORKFLOWS.md](VIDEO_WORKFLOWS.md) | 14 条视频的 Workflow 与复杂度 |
| [INTEGRATION.md](INTEGRATION.md) | 资源访问等级、历史路由与验证口径 |
| [SOURCES.md](SOURCES.md) | 来源、Prompt、工程、验证与缺口 |
| [REPOSITORIES.md](REPOSITORIES.md) | 仓库固定版本、下载范围、许可 |
| [METHODS.md](METHODS.md) | 用途、形式、风格与技术分类 |
| [STYLES.md](STYLES.md) | 风格库索引与选择参考（不是执行队列） |
| [WORKFLOW.md](WORKFLOW.md) | 制作机制、阶段交接与人工确认 |
| [ROUTING.md](ROUTING.md) | 模型/Skill/工具分工与验证方法 |
| [PROMPTS.md](PROMPTS.md) | Prompt 的组织与保存 |
| [cases/README.md](cases/README.md) | 历史案例知识 |
| [../theory/README.md](../theory/README.md) | Vxx/Pxx 逐来源证据 |

## 使用原则

- 资源是参考，不是固定模板；每次视频由 Agent 读 Brief/Prompt 后从零写代码。
- 不在主流程里为每个风格预写适配器；不同模型/不同次实现允许不同。
- `resources/prompts/` 已有可读 Prompt；完整资源通过 `npm run resources:fetch` 或 Release ZIP。
- 生成结果与许可必须回到来源核对；`resources/AUDIT.md` 的 checked 不等于已跑通。
