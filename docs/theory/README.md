# AI 视频制作：理论资料研究

当前资料为 [VideoLab 工作台计划](../../PROJECT.md) 提供背景与出处，分类、流程和 Prompt 归纳见 [方法库](../library/README.md)。本目录保存逐来源证据，不要求先完成 demo，也不把文章写作作为工作台前置条件。

创建：2026-10-14。目标是广泛、细致、可追溯地积累来源观点，为实践结束后的工程技术文章准备材料。**本目录是研究资料，不是当前视频制作的操作规范。**

**第一批资料已于 2026-10-15 收尾归档**：5 条视频逐来源提取＋8 份项目／工具来源笔记。视频正文已有全片时间范围的采样依据；公开材料未披露的内容与未完成的听辨明确保留为边界。[本批覆盖与交接](BATCH_01_REVIEW.md) 说明完成范围，不能将“提取完成”理解为作者观点已获验证。

## 资料与实验怎样配合

- 资料：逐个记录来源、版本、读取范围与缺口，供 catalog、模板预览和候选流程引用。
- 实验：按 [当前计划](../../PROJECT.md) 选择影响实际制作的代表难点；既有案例保留，不自动续做逐风格队列。
- 写作：用来源解释实测、保留反例，工程文章属于可选成果，早期提纲已归档。

原复现阶段采用过“资料批次收尾 → 实践批次与经验 → 综合分析”的顺序；旧计划保留在历史归档，不再决定当前排期。来源笔记和执行结果仍分开保存，历史批次不追加覆盖声明。

同一观点出现在不同来源中，分别记录。不因为重复而删除，也不把不同作者的话合成一个没有出处的“共识”。同一作者的视频和仓库分别建档，记录关联，后期不能当成两份独立实验证据。

## 目录与记录粒度

```text
theory/
├── README.md                 # 研究办法、来源索引、覆盖状态
├── BATCH_01_REVIEW.md        # 首批完成范围与验证边界
├── extractions/
│   ├── videos/Vxx-<video-id>.md  # 每个视频一份，保留章节／时间点
│   └── projects/Pxx-<project>.md # 每个项目或独立文档源一份
├── _sources/                # 忽略提交的上游资料副本，固定版本
├── tools/                   # 本地采集／提取辅助脚本，不是视频制作工具
└── _evidence/               # 忽略提交的缓存、时间戳帧、OCR 与浏览器采集归档
```

公开提取文件以结构化转述和必要的短摘录为主，保留许可、原始链接和修改说明；不复制受保护视频的完整逐字稿。截图、访问会话与原始字幕不默认随开源仓库分发。

## 提取格式与证据类型

每份记录包含：来源与关联、日期／commit、实际阅读范围、核心问题、逐项观点和方法、具体参数及适用条件、案例／反例、可检验命题、矛盾与缺口、待补范围。

条目标注四类依据：

- **作者表述**：来自正文、字幕、简介或注释；注明具体位置。
- **实现事实**：从文件、函数、参数或公开工程直接核对。
- **研究者解释**：我们对设计或工程机制的推断，不冒充作者原意。
- **待验证**：需要新的材料或实验才能判断的能力、因果或推广结论。

视频的简介、章节表、字幕和实际画面分别登记。读取简介不等于观看整片；自动 OCR 可能漏掉快闪字幕或识别错误，需要对关键论点回看截图。记录观察到的覆盖范围，不用“无遗漏”掩盖内容缺口。

同一来源内部按主题与时间点尽量完整保留信息，跨来源的重复和冲突原样保留到后期。来源文件更新时追加版本差异，不无声替换旧结论。

## 首批来源索引

| ID | 来源 | 提取文件 | 当前覆盖 |
| --- | --- | --- | --- |
| V01 | 0 基础 AI 视频教程 | [BV1Z28P6HEGa](extractions/videos/V01-BV1Z28P6HEGa.md) | 已提取全片范围：资产、调度、参考绑定、人工审片与限制 |
| V02 | Opus 与 Astra 视频比较 | [BV1Haaq6ZEei](extractions/videos/V02-BV1Haaq6ZEei.md) | 已提取简介及全片范围画面观察；无完整迭代日志可供核验 |
| V03 | GPT6 直出展示 | [BV1E2t26vEVx](extractions/videos/V03-BV1E2t26vEVx.md) | 已提取开场制作披露、正文形式与用户观感；修正初始记录 |
| V04 | Opus5.5 审美分析 | [BV1wqpi6PE19](extractions/videos/V04-BV1wqpi6PE19.md) | 已逐段提取全片范围，保留训练推断、指标与字幕冲突 |
| V05 | Agent 讲解视频与开源 SOP | [BV1xGah67E1j](extractions/videos/V05-BV1xGah67E1j.md) | 已逐章提取工具、分工、设计、配音时基、返工与边界 |
| P01 | ai-promo-video-maker | [项目提取](extractions/projects/P01-ai-promo-video-maker.md) | 工作流、风格、声音、复盘和检查等核心文字资料 |
| P02 | mg-styles-15 | [项目提取](extractions/projects/P02-mg-styles-15.md) | README、Prompt 结构、渲染／音频架构及已读案例代码 |
| P03 | fifi-video-prompt | [项目提取](extractions/projects/P03-fifi-video-prompt.md) | 当前仓库 README 与唯一公开案例的完整 Prompt |
| P04 | Table-VideoSOP | [项目提取](extractions/projects/P04-Table-VideoSOP.md) | SOP、设计、协作、QA、叙事、镜头与声音核心文档 |
| P05 | 3b1b/manim | [项目提取](extractions/projects/P05-manim-gl.md) | 官方 README 的能力、版本与复现边界 |
| P06 | Manim Community 文档 | [文档提取](extractions/projects/P06-manim-community.md) | 官方构件与渲染机制文档，未运行 |
| P07 | Remotion 官方文档 | [文档提取](extractions/projects/P07-remotion.md) | 官方逐帧时间模型与组合机制，未制作新案例 |
| P08 | Anatomy | [项目初读](extractions/projects/P08-anatomy.md) | README／Skill 核心方法；源码已下载，未执行 |

P03 从 V04 作者简介中定位。P04 由公开检索线索找到，再以仓库作者身份与方法描述交叉核对；不能把仓库的更新内容当作视频发布时已经讲过的内容。

仅有名称、缺少准确来源的 Fogsight、muyang 动画项目、math-concept-film、FastMovieAI 等线索仍在 [想法池](../archive/2026-10/IDEAS.md)。确认准确地址后逐个建档，不将名称相似的仓库擅自当作用户所指项目。

## 第二批来源：2026-10-29 建档与关联仓库补查

首轮四条视频与两份来源之外，本次补入 P11–P21 十一份仓库记录，读取与获取范围见 [BATCH_02_INTAKE.md](BATCH_02_INTAKE.md) 和 [仓库清单](../library/REPOSITORIES.md)。四条视频均完成全时间范围的两秒文字采样；32 分钟视频已补齐 965 个时间点并通读文字，仍未完整视听。

| ID | 来源 | 提取文件 | 当前覆盖 |
| --- | --- | --- | --- |
| V06 | 341 风格与 DeepSeek 代码动画 | [BV1bqx76wEUM](extractions/videos/V06-BV1bqx76wEUM.md) | 简介、章节、168 个采样点的烧录文字；费用按作者报告 |
| V07 | Vibe 科普动画拆解 | [BV1ALnw6YEM7](extractions/videos/V07-BV1ALnw6YEM7.md) | 简介、章节、110 个采样点；保留 90／140 秒规格冲突 |
| V08 | AI 动画制作全流程 | [BV1xFnt6zE3K](extractions/videos/V08-BV1xFnt6zE3K.md) | 965 个两秒文字采样；补核分工、审片返工、时间对齐与分段细节，非完整视听 |
| V09 | 个人 harness 与 auto 动画 | [BV1Gg3E6BEbn](extractions/videos/V09-BV1Gg3E6BEbn.md) | 98 个采样点；多模型任务分工、风格适配与 A/B；P11／P12 已定位 |
| P09 | code-animation-prompts | [项目提取](extractions/projects/P09-code-animation-prompts.md) | 索引 341 项、193 图、555 文件哈希校验；核心文档／脚本与部分完整 Prompt 已读，未安装／渲染 |
| P10 | Ploto 长视频制作文章 | [文章提取](extractions/projects/P10-ploto-long-video-workflow.md) | 完整文章、表格、附录与部分展示页；未取得完整制片工程 |
| P11 | auto-motion | [核心提取](extractions/projects/P11-auto-motion.md) | 完整固定 ZIP；README、Prompt、调用与测试脚本已读；未运行 |
| P12 | Open Design | [核心提取](extractions/projects/P12-open-design.md) | 仅 49 个相关文件；适配、按需加载与时间线初读；非完整软件 |
| P13 | Manim Skill | [范围初读](extractions/projects/P13-manim-skill.md) | 完整快照；README 与许可；未渲染 |
| P14 | Remotion Agent Skills | [范围初读](extractions/projects/P14-remotion-skills.md) | 完整快照；官方工序入口，根未见单独 LICENSE |
| P15 | HyperFrames | [范围初读](extractions/projects/P15-hyperframes.md) | 完整 ZIP；README 与许可，内部链接展开为 Windows 副本 |
| P16 | Onetake | [范围初读](extractions/projects/P16-onetake.md) | 完整快照；连续性方法，非商业许可，案例源码不含 |
| P17 | Anidoodle | [范围初读](extractions/projects/P17-anidoodle.md) | 完整快照；媒介／逐笔动画说明，音源另有条款 |
| P18 | Claudian | [范围初读](extractions/projects/P18-claudian.md) | 完整快照；文件工作台与隐私说明，不含作者全部自制插件 |
| P19 | Awesome AI Motion | [范围初读](extractions/projects/P19-awesome-ai-motion.md) | 完整快照；题材索引与第三方权利，未逐片看 |
| P20 | Awesome Opus Videos | [范围初读](extractions/projects/P20-awesome-opus-videos.md) | 完整快照；概况／分类，未精读全部 Prompt |
| P21 | Awesome Claude Videos | [范围初读](extractions/projects/P21-awesome-claude-videos.md) | 完整快照；中文 README 与证据／权利范围，未重算分析 |

累计逐来源笔记为 9 条视频、21 份项目／工具／文章，共 30 份；其中 P13–P21 为范围明确的初读，不称为深读全部工程。另有 lemo-opuscar 本地项目记录未计入 Pxx。来源数量不是独立实验次数。

## 第三批来源：2026-11-06 视频与工作流参考

四支视频完成本地低清抽取、稀疏抽帧与 `faster-whisper` 转写；**无独立字幕，转写不是作者原字幕，也未完整视听**。采集方式、覆盖与落地建议见 [BATCH_03_INTAKE.md](BATCH_03_INTAKE.md)。

| ID | 来源 | 提取文件 | 当前覆盖 |
| --- | --- | --- | --- |
| V10 | DSH+Remotion 代码动画展示片 | [BV1ztH96uE1Z](extractions/videos/V10-BV1ztH96uE1Z.md) | 45.0 s 全片 1 秒抽帧、切点与节拍网格分析；无口播，未听音 |
| V11 | 俯仰代码动画加强版 | [BV1vsx66BE4p](extractions/videos/V11-BV1vsx66BE4p.md) | 转写 367 段覆盖全片；仓库固定 commit／许可只读核查；未安装运行 |
| V12 | AI 做动画视频完全指南 | [BV1f94c6uEr3](extractions/videos/V12-BV1f94c6uEr3.md) | 转写 453 段覆盖全片；motion-showreel 结构只读核查；未安装 Skill |
| V13 | Harness 实践 | [BV1ypdgBCE9B](extractions/videos/V13-BV1ypdgBCE9B.md) | 转写 602 段覆盖全片；四外链只读核查；未取得工程与账单 |

本批四条视频合计约 52 分钟，累计逐来源笔记为 **13 条视频 + 21 份项目／工具／文章，共 34 份**。V06／P09／V11 是同一作者、同一 341 素材库的不同版本与封装，V12／V13 是同一作者的两套不同 Skill 与年代；均不能算独立验证。来源数量不是独立实验次数。

## 当前问题意识

后期再回答：成片质量分别受到内容、设计、模型、工具、素材、迭代与人工选择哪些影响？“一句话”是否只是用户入口，背后是否已有长规则、参考、技能、多人分工与返修？同 Prompt 是否意味着同预算、同工具和同反馈？细化 Prompt 如何减少失误而不固定视觉答案？

这些问题帮助整理资料，现阶段不据此给模型排名，也不将来源中的阈值或方法直接变成 VideoLab 制作规范。
