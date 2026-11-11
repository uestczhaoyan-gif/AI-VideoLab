# 文档与目录导航

当前范围、阶段与验证口径只在 [PROJECT.md](../PROJECT.md) 维护；AI 从 [AGENTS.md](../AGENTS.md) 开始。平台是 CLI-only，没有网页入口。

## 资料入口

| 位置 | 职责 |
| --- | --- |
| [USAGE.md](USAGE.md) | CLI 安装、制作、产物、排错与验证 |
| [library/README.md](library/README.md) | 方法、风格、来源、Prompt、Workflow 的总入口 |
| [library/TEMPLATE_MAP.md](library/TEMPLATE_MAP.md) | 410 个模板 → Prompt → Workflow 的完整对照（生成文件） |
| [library/VIDEO_WORKFLOWS.md](library/VIDEO_WORKFLOWS.md) | 14 条视频，一视频一 Workflow，按复杂度 1–5 排列 |
| [library/INTEGRATION.md](library/INTEGRATION.md) | 统一制作规范、资源访问等级与路由（38 来源 / 410 条目 / 3 条执行器） |
| [library/CREATE_VIDEO.md](library/CREATE_VIDEO.md) | 交给已有 Agent 的制作启动提示（Pi/Codex/Claude Code/DSH） |
| [library/WORKFLOW.md](library/WORKFLOW.md) | 制作机制、阶段交接与确认门 |
| [library/ROUTING.md](library/ROUTING.md) | 模型/Skill/工具分工与验证方法 |
| [library/METHODS.md](library/METHODS.md) | 用途、形式、风格与技术分类 |
| [library/STYLES.md](library/STYLES.md) | 风格库与选择器入口 |
| [library/SOURCES.md](library/SOURCES.md) | 来源、Prompt、工程、验证与缺口 |
| [library/REPOSITORIES.md](library/REPOSITORIES.md) | 上游仓库固定版本、下载范围、许可 |
| [library/PROMPTS.md](library/PROMPTS.md) | 制作输入与返修 Prompt 的组织 |
| [UPLOAD.md](UPLOAD.md) | GitHub 上传前检查、提交/推送/tag 与干净克隆验证 |
| [library/cases/README.md](library/cases/README.md) | 本地案例知识沉淀（原 demo 工程已删除） |
| [theory/README.md](theory/README.md) | Vxx/Pxx 逐来源证据、读取范围与缺口 |

## 仓库结构

```text
catalog/                410 条引用、38 来源、3 条 recipe、integration.json
recipes/                code-motion / explain-data / real-product 执行器
examples/               可运行输入示例
shared/                 项目契约、QA、规划函数
resources/              分类资源库（styles/prompt-libraries/engines/skills/workflows/collections）
docs/                   本目录
tools/                  studio CLI、catalog、路由、资源抽检、渲染、最小闭环
projects/               CLI 生成的项目与成片（Git 忽略）
```

资源分类与抽检见 [resources/README.md](../resources/README.md) 与 [resources/AUDIT.md](../resources/AUDIT.md)。
