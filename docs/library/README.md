# AI 视频方法库

本目录是 CLI 与 Agent 共用的人工可读知识层：整合已有方法、Prompt、流程与来源，为按内容／类型选择流程、模板预览和可选模型策略提供背景。**当前愿景、阶段与下一步统一见 [PROJECT.md](../../PROJECT.md)**；本页只负责资料导航。

已有案例知识保存在 [cases/](cases/README.md)：2026-10 的逐风格复现与独立验证工程、渲染产物与代码已于 2026-11 按用户要求清理，只保留总结的要点、Workflow、检查数字与用户反馈。资料可先收录；需判断兼容、质量或费用时，再选择代表难点验证。

本目录初版来自本地资料清点；2026-10-29 完成四条新视频的首轮提取，后续补齐长视频两秒字幕采样，并补查相关仓库，见 [第二批记录](../theory/BATCH_02_INTAKE.md)。2026-11 又提取了四条新视频（V10–V13），见 [第三批记录](../theory/BATCH_03_INTAKE.md)。字幕采样、文章阅读与完整视听分别标注；仍未调用制作模型或验证现行服务价格。

## 从哪里开始

| 入口 | 解决什么问题 |
| --- | --- |
| [TEMPLATE_MAP.md](TEMPLATE_MAP.md) | **模板 → Prompt → Workflow 完整对照**：每个模板的提示词路径、建议 V 章节、执行状态 |
| [VIDEO_WORKFLOWS.md](VIDEO_WORKFLOWS.md) | **按视频整理的 Workflow 总表**：一视频一节，按复杂度 1–5 从简到繁；全部方案保留，用“先简单后复杂”选择 |
| [INTEGRATION.md](INTEGRATION.md) | **统一制作规范与资源路由**：资源访问等级、三条已验证执行器、路由命令与验证口径 |
| [USAGE.md](../USAGE.md) | CLI 安装、制作、产物、排错与验证 |
| [CREATE_VIDEO.md](CREATE_VIDEO.md) | 交给已有 Agent（Pi/Codex/Claude Code/DSH）的制作启动提示 |
| [catalog](../../catalog/README.md) | 结构化来源／模板／候选流程、校验与缓存恢复 |
| [METHODS.md](METHODS.md) | 视频怎么分类；16 个候选方法标签分别适合什么、已有多少证据 |
| [SOURCES.md](SOURCES.md) | 已有视频、项目、Prompt、源码与环境文件在哪里；哪些来源尚不完整 |
| [STYLES.md](STYLES.md) | 341 条风格素材与离线挑选器，以及已有 51／15 风格资料；跨库重叠分别保留 |
| [WORKFLOW.md](WORKFLOW.md) | 怎样收集、怎样组合制作步骤，以及 CLI 的输入输出 |
| [ROUTING.md](ROUTING.md) | 按任务／风格分配模型、Skill 与工具；怎样以短对照验证而非逐个做 demo |
| [REPOSITORIES.md](REPOSITORIES.md) | 关联仓库固定版本、下载范围、阅读、哈希、许可与缺口 |
| [PROMPTS.md](PROMPTS.md) | 怎样从主题和方法生成 Prompt；怎样保存完整输入与返修要求 |
| [templates/SOURCE.md](templates/SOURCE.md) | 新视频／项目的单来源记录模板 |

## 本轮清点得到的基础

清点范围为当前 Git 已跟踪文件与未被忽略的新文件；上游缓存另行核对。以下数量是整理前的基线，后续增加文档时不把它们当作实时统计。

| 已有材料 | 数量／范围 | 保存与复用方式 |
| --- | --- | --- |
| 对外文档 | 100+ 个 Markdown 文件 | 保留原路径，新增导航，不批量合并或删除 |
| 逐来源笔记 | 13 条视频 + 21 份项目／工具，共 34 份 | 保留 [理论资料索引](../theory/README.md) 和原始来源 ID |
| 案例知识 | 8 篇（[cases/](cases/README.md)） | 原 demo 工程已清理；摘要保留设计、方法、数字、失败与反馈 |
| 上游本地快照 | mg-styles-15、lemo-opuscar、anatomy | 统一在 [resources/](../../resources/README.md)，`source/` 忽略提交，按固定版本恢复 |
| 风格资料 | mg-styles-15 的 15 份 Prompt；lemo-opuscar 索引中的 51 种风格 | 两个库有重叠，不能相加后宣称有 66 个独立方法 |
| 结构化索引 | [catalog](../../catalog/README.md) 408 条引用、35 条来源、3 条候选流程 | 引用而非复制正文；条目数不等于可执行路线数 |

## 第二批新增：四条视频与 341 风格库

- 首轮 [V06–V09 与 P09–P10](../theory/BATCH_02_INTAKE.md) 六份之外，补入 P11–P21 十一份仓库笔记，累计三十份。四条视频均有全片时间范围的两秒文字采样；长视频 965 个时间点文字已读，仍不是完整视听。
- 已保存 [code-animation-prompts](../theory/extractions/projects/P09-code-animation-prompts.md) 固定快照，核对 341 个 Prompt、193 张图、原素材 555 个文件哈希，并只读测试检索。
- 本机可打开 [341 风格离线挑选器](../../resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格挑选.html)；该链接依赖本地来源缓存，公开使用者按 [固定版本](https://github.com/XiaoyeCodes/code-animation-prompts/tree/69ccbeaf0b821591a40936572c2f559d8f4cfb68) 获取。
- 补存十个完整仓库 ZIP，另取 Open Design 的 49 份核心文件，见 [仓库清单](REPOSITORIES.md)；后者不是完整软件。auto-motion 当前源码与视频的渲染路线不同，Onetake 当前仅允许相应非商业用途。
- 长片确认、局部重渲、费用口径，以及多模型分工、风格适配与 A/B 已分别记录，并整理成 [路由草案](ROUTING.md)。它们仍是待验证的建议，不是已实现选模器。
- 合集和相关仓库分别遵守自身许可，第三方部分另计，不整体归入 VideoLab 根 MIT；未安装为全局 Skill、未启动制片。

## 四种信息分别保存

1. **来源记录**回答“谁展示了什么、实际读取了什么”。继续使用 `docs/theory/extractions/videos/` 和 `projects/`；同源视频与仓库互相回链。
2. **方法索引**回答“哪些任务可以考虑这条路线”。本目录归纳并链接来源，保留冲突、缺失文件和未经验证的建议。
3. **流程与 Prompt**回答“输入准备好后怎样做”。通用骨架在本目录，案例的实际 Prompt、源码和检查仍在原案例旁。
4. **执行结果**回答“具体版本实际做到了什么”。2026-11 清理后，各案例的 README／EXPERIENCE 内容合并保存在 [cases/](cases/README.md)；后续新结果按同样方式沉淀，不重新堆回 demo 工程。

来源可以先收录，不要求有源码或先复现；但只有链接、只有 Prompt、有完整工程、已本地运行，必须让使用者一眼分清。源码复用和只有说明可供重写，也分别记录。

## 证据与可执行性

| 字段 | 建议值 | 含义 |
| --- | --- | --- |
| `coverage` | `lead` / `metadata` / `transcript` / `sampled_frames` / `full_viewing` / `docs` / `code_read` | 可多选，写明实际范围和时间点；字幕、抽帧与完整视听分别记录 |
| `artifacts` | Prompt、源码、资产清单、版本、运行命令、输出、许可 | 分项列存在与缺失，避免一个“开源”标签掩盖实际缺口 |
| `validation` | `unrun` / `technical_pass` / `viewed` / `transfer_tested` | 绑定具体输出版本；沿用历史记录时注明来源，不能跨版本继承 |
| `automation` | `manual` / `assisted` / `scripted` / `api_ready` | 按实际流程标注；有脚本不自动等于可无人值守运行 |
| `cost_status` | `unknown` / `author_reported` / `estimated` / `measured` | 写币种、日期、硬件、重试与人工时间；本地生成也有资源成本 |

这些字段用于检索和解释，不组成能力排名。某个样片被认可，不等于整个方法、全部模型或所有题材都通过。

## 怎样继续收录

按 [PROJECT.md](../../PROJECT.md) 的阶段推进目录化、预览和推荐，不再把“不断扩大收藏”作为单独排期。新增来源优先填补当前 recipe 的实际缺口：完整 Prompt、Workflow、依赖、素材、许可与成本证据。数字人、本地生成等尚缺直接资料的方向先标缺口，不自动开新工程。

有准确来源时按 [收集流程](WORKFLOW.md) 建档；模型名称或同名仓库未确认时保留线索。先利用现成 catalog 与工程，不要求先做完整样片。
