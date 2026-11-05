# 文档与目录导航

当前方向、阶段和下一步只在 [PROJECT.md](../PROJECT.md) 维护；新的 AI 从 [AGENTS.md](../AGENTS.md) 开始。历史计划不再与当前排期并行生效。

## 当前资料

| 位置 | 唯一职责 |
| --- | --- |
| [library/README.md](library/README.md) | 知识入口：按需要找到下面各类资料 |
| [library/METHODS.md](library/METHODS.md) | 用途、形式、风格与技术分类，候选方法标签 |
| [library/STYLES.md](library/STYLES.md) | 风格库与现成选择器入口；不是逐风格执行队列 |
| [library/SOURCES.md](library/SOURCES.md) | 已有来源、Prompt、工程、验证与缺口 |
| [library/REPOSITORIES.md](library/REPOSITORIES.md) | 上游仓库的固定版本、下载范围、哈希和许可细节 |
| [library/CREATE_VIDEO.md](library/CREATE_VIDEO.md) | 交给已有 CLI 助手的制作启动任务：少量问答、受众／深度／公式、选配与交付 |
| [library/WORKFLOW.md](library/WORKFLOW.md) | 现有流程如何组合、步骤之间交接什么 |
| [library/ROUTING.md](library/ROUTING.md) | 模型／Skill／工具分工与小规模验证方法 |
| [library/PROMPTS.md](library/PROMPTS.md) | 制作输入与返修 Prompt 的组织和保存 |
| [library/cases/README.md](library/cases/README.md) | 2026-10 本地案例的知识沉淀（原 demo 工程已删除） |
| [USAGE.md](USAGE.md) | 使用手册：CLI／Web 启动、检索预览、方案保存导出与排错 |
| [theory/README.md](theory/README.md) | Vxx／Pxx 逐来源证据、覆盖和批次索引 |
| [archive/README.md](archive/README.md) | 旧计划、历史日志、原始想法、目录迁移与维护边界 |

当前人工知识与 [结构化 catalog](../catalog/README.md) 互相引用，不复制维护第二套正文。[工作台](../apps/workbench/README.md) 已提供首版浏览与任务包功能；模型品牌、费用与作者能力声明必须能回到具体证据。

## 仓库职责

```text
README.md / PROJECT.md / AGENTS.md / CONTRIBUTING.md / SECURITY.md   入口、主计划、AI 交接与协作规范
.github/                              CI、Issue 与 PR 模板
apps/workbench/                       本地只读工作台（浏览、预览、选型、任务包）
catalog/                              来源／模板／候选 recipe 与 Schema
docs/library/                         可组合知识、案例知识与使用手册
docs/theory/extractions/              一来源一记录，不提前删重复证据
docs/theory/_sources/ _evidence/      本机研究缓存（Git 忽略）
resources/                            上游开源快照（source/ Git 忽略，按固定版本恢复）
docs/archive/                         旧计划与原始记录，不执行旧指令
tools/                                catalog 导入／校验、文档检查、视频来源采集、最小闭环
tests/                                目录、服务、归档与浏览器回归
projects/                             本机个人制作工程（Git 忽略）
```

`catalog/`、工作台与视频来源采集工具已实现，CLI 启动入口复用已安装助手与同一资料库；统一执行适配、模型对照实测和生成 API 仍未实现。具体进度以项目主说明为准，启动命令见根 README。

## 本机资料与公开内容

- 上游快照：`resources/*/source/`、`docs/theory/_sources/`；下载范围与许可不同，不把全部文件默认打进模板仓库。恢复方式见 [resources/README.md](../resources/README.md)。
- 采集证据：`docs/theory/_evidence/`（含视频来源采集的低清流、抽帧与转写）；这些不是公开逐字稿或可任意重发素材。
- 环境与临时文件：`.venv/`、`node_modules/`、`.tmp/` 等；不属于知识条目或模板。
- 个人制作工程：`projects/`；保留在原路径，但被 Git 忽略，新机器不会自动取得。
- 2026-11 清理：VideoLab 自己做的逐风格 demo 复现已删除；知识在 [cases](library/cases/README.md)，上游资料在 [resources](../resources/README.md)。部分历史页面的旧 `demo/` 链接按历史记录保留说明，不再指向现存工程。
- 新机器缺少忽略文件时，依照固定来源恢复；无法恢复则显示缺失，不制造假预览或假执行成功。

新增资料使用 [来源模板](library/templates/SOURCE.md)，取得准确原址和版本后登记；缺正文、缺工程或未运行也可收录，但标记真实边界。
