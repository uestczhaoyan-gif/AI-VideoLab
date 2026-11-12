# 文档与目录导航

当前是 **Agent-led 0.3**：`npm run make` 只生成 Brief/资源/AGENT_TASK，视频代码由用户的 DSH/Pi/Codex/Claude 从零编写；`render:agent` 只抓帧、编码、机械 QA。范围见 [PROJECT.md](../PROJECT.md)，Agent 契约为 [CREATE_VIDEO.md](library/CREATE_VIDEO.md)。

## 资料入口

| 位置 | 职责 |
| --- | --- |
| [USAGE.md](USAGE.md) | 安装、生成任务、交给 Agent、渲染、排错 |
| [library/CREATE_VIDEO.md](library/CREATE_VIDEO.md) | Agent 的制作契约（系统提示） |
| [library/TEMPLATE_MAP.md](library/TEMPLATE_MAP.md) | 410 个模板 → Prompt → Workflow 对照（全部为参考，Agent 重写） |
| [library/STYLE_GENERATION.md](library/STYLE_GENERATION.md) | 从资源 Prompt 生成自定义场景代码的说明 |
| [library/VIDEO_WORKFLOWS.md](library/VIDEO_WORKFLOWS.md) | 14 条视频的 Workflow 与复杂度 |
| [library/INTEGRATION.md](library/INTEGRATION.md) | 资源访问等级与历史路由说明 |
| [library/SOURCES.md](library/SOURCES.md) | 来源、Prompt、工程与缺口 |
| [library/REPOSITORIES.md](library/REPOSITORIES.md) | 上游仓库固定版本与许可 |
| [library/cases/README.md](library/cases/README.md) | 历史案例知识 |
| [theory/README.md](theory/README.md) | Vxx/Pxx 逐来源证据 |
| [UPLOAD.md](UPLOAD.md) | GitHub 上传与 Release 资源包 |

## 仓库结构

```text
catalog/                410 条引用、38 来源、模板映射
tools/agent/            make 任务生成 + 通用渲染
tools/render/           通用 Chrome/ffmpeg 工具
resources/              分类资源库 + 入库 Prompt
shared/                 项目契约、资源候选函数
docs/                   文档
projects/               Agent 任务与成片（Git 忽略）
```
