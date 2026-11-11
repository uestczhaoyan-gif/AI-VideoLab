# 已有来源、Prompt 与开源文件

旧条目来自已有本地笔记；2026-10-29 新增来源的访问、下载与核对范围见 [第二批记录](../theory/BATCH_02_INTAKE.md)。文件存在不代表完整审计或成功制片，模型价格、能力与外部许可未一并核验。上游源码缓存未随 VideoLab 提交，公开版本保留固定链接与获取说明。

## 已提取的项目／工具

| 来源 | 固定版本／入口 | 已保存什么 | 可执行性与缺口 |
| --- | --- | --- | --- |
| P01 ai-promo-video-maker | `279ba5178c3c80d472b84ac2efa36c6fca33bba2`；[提取笔记](../theory/extractions/projects/P01-ai-promo-video-maker.md) | 本地 `resources/workflows/ai-promo-video-maker/source/`；工作流、Skill、参考文档、脚本等；记录为 MIT | 未独立跑完整产品片；依赖真实产品素材和可选声音服务；完整案例工程覆盖范围见笔记 |
| P02 mg-styles-15 | `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；[提取笔记](../theory/extractions/projects/P02-mg-styles-15.md) | 本地 `resources/styles/mg-styles-15/source/` 为选择性获取：15 份 Prompt、5 个上游 demo 源码目录、渲染器与音频库；[MIT 文本](../../resources/styles/mg-styles-15/UPSTREAM-LICENSE) | 本项目仅部分风格有对照案例（摘要见 [cases](cases/README.md)）；其他风格源码需补取；原 demo 环境说明已随清理删除，重跑需按上游 README 重建 |
| P03 fifi-video-prompt | `6b31ed2cefe610c164e2bd96da03e02e34103495`；[提取笔记](../theory/extractions/projects/P03-fifi-video-prompt.md) | 本地 `resources/prompt-libraries/fifi-video-prompt/source/`；README 与验证码案例完整 Prompt；记录为 MIT | 该版本没有完整已生成动画源码；可以研究 Prompt，不能称为直接可渲染工程 |
| P04 Table-VideoSOP | `a51fea1c8a1e6b9b0a5d1d42491fd58978816dd0`；[提取笔记](../theory/extractions/projects/P04-Table-VideoSOP.md) | 本地 `resources/workflows/table-video-sop/source/`；SOP、设计、QA、协作与工具；正文 CC BY 4.0、工具 MIT | 不含完整制作项目、生成服务与角色素材；采用生成素材的环节包含人工操作 |
| P05 ManimGL | [官方仓库](https://github.com/3b1b/manim)；[提取笔记](../theory/extractions/projects/P05-manim-gl.md) | 已有 README 摘要与使用边界 | 未保存本项目固定引擎版本或运行案例；使用前核对对应版本依赖和许可 |
| P06 Manim Community | [官方文档](https://docs.manim.community/en/stable/)；[提取笔记](../theory/extractions/projects/P06-manim-community.md) | 历史笔记记录页面版本 v0.22.0，提取构件与渲染机制 | 文档的 `stable` 链接会变化；未本地跑案例；不能混用 ManimGL 示例 |
| P07 Remotion | [官方文档](https://www.remotion.dev/docs/)；[提取笔记](../theory/extractions/projects/P07-remotion.md) | 逐帧组件、动画与时间组合说明 | 未固定本项目执行版本、未跑完整视频；源码可读不说明所有商业或自动化场景免费，需核查实际许可 |
| P08 Anatomy | `bc943e40c59998be5da61f9d39c6a983b1116099`；[提取笔记](../theory/extractions/projects/P08-anatomy.md) | 本地 `resources/studies/anatomy/source/`；源码、Skill 与示例；记录为 MIT | 未运行；原输出首先是交互图解，转视频需要时间线与导出层 |
| P09 code-animation-prompts | `69ccbeaf0b821591a40936572c2f559d8f4cfb68`；[项目提取](../theory/extractions/projects/P09-code-animation-prompts.md) | 本地 `resources/prompt-libraries/code-animation-prompts/source/`；341 个 Prompt、193 图、离线挑选器、Skill、检索与渲染工具、3 份示例 HTML 与 3 个 MP4 | 555 原素材哈希全部通过，只读检索通过；未安装／渲染，未逐条精读；合集非统一 MIT |
| P10 Ploto 长片制作文章 | [作者原文](https://ploto.me/posts/how-i-made-a-long-video-with-ai/)；[文章提取](../theory/extractions/projects/P10-ploto-long-video-workflow.md) | 完整文章、方法与成本表、公开工作台展示；正文 CC BY 4.0 | 没有取得完整长片源码、插件实现、调用明细或完整工作库 |
| P11 auto-motion | `17ead629d010f7e5495f645d46fafd6876482c32`；[核心提取](../theory/extractions/projects/P11-auto-motion.md) | 完整 ZIP、主 Prompt、单镜头脚本与技术测试已读 | 当前为 HyperFrames，视频讲 Remotion；未运行，根未见全项目 LICENSE |
| P12 Open Design | `fa19ff40e34dd50a9b01888b0339a1b2e1e68cc7`；[核心提取](../theory/extractions/projects/P12-open-design.md) | 仅 49 份核心文档与 Skill 入口；适配、加载与设计初读 | 不是完整软件；根 Apache-2.0，例外与依赖未收齐 |
| P13–P18 制作与工作台候选 | [逐仓库清单](REPOSITORIES.md)；各自固定 commit | Manim Skill、Remotion Skills、HyperFrames、Onetake、Anidoodle、Claudian 完整 ZIP；范围初读分别建档 | 未安装／运行；Onetake 非商业，Remotion Skills 根未见单独 LICENSE，其他条款分别记录 |
| P19–P21 作品／Prompt 集合 | [逐仓库清单](REPOSITORIES.md)；各自固定 commit | 三个作品集完整 ZIP，README／权利范围初读 | 不含全部外链工程与视频；第三方媒体／Prompt 不继承根许可 |
| lemo-opuscar | `b5e8ef93930b6d828f352055a689320f138237b1`；[本地记录](../../resources/styles/lemo-opuscar/README.md) | 本地 `resources/styles/lemo-opuscar/source/`；51 个风格目录、`STYLE.md`、`DEMO.md`、demo 与 `core/`；记录为 MIT，资产许可另计 | 本轮核对风格索引和文件数量，未逐份阅读；白板试片摘要见 [案例](cases/lemo-whiteboard-trial.md)，尚无正式原作复现 |

lemo-opuscar 中实际有 52 组 `STYLE.md`／`DEMO.md`，其中 `_template` 是模板；索引的 51 个风格目录全部存在。这里不把模板计为额外风格。

## 已有视频资料

V01–V05 属于第一批，覆盖见 [BATCH_01_REVIEW.md](../theory/BATCH_01_REVIEW.md)。V06–V09 见 [BATCH_02_INTAKE.md](../theory/BATCH_02_INTAKE.md)；V10–V13 见 [BATCH_03_INTAKE.md](../theory/BATCH_03_INTAKE.md)。字幕／画面采样不能改写为完整观看或审听；第三批为本机转写，不是作者原字幕。

| ID | 入口 | 可提取的方法 | 关键缺口 |
| --- | --- | --- | --- |
| V01 | [0 基础生成流程](../theory/extractions/videos/V01-BV1Z28P6HEGa.md) | 角色资产、参考绑定、剧本与镜头调度、生成与审片 | 作者部分 Skill 未取得；总费用、失败次数与长段落一致性未披露 |
| V02 | [模型视频比较](../theory/extractions/videos/V02-BV1Haaq6ZEei.md) | 多轮迭代展示与对照条件的辨析 | 缺完整输入、预算与迭代日志；不是单次调用的公平对照 |
| V03 | [代码视频展示](../theory/extractions/videos/V03-BV1E2t26vEVx.md) | 录音／逐字稿与制作要求等输入披露 | 缺完整制作工程与全过程；影片内容观点与制作方法分别记录 |
| V04 | [审美与 Prompt 分析](../theory/extractions/videos/V04-BV1wqpi6PE19.md) | 设计约束、运动与审美论点，并关联 P03 | 训练解释存在推断；模型名与能力结论不由展示自动证实 |
| V05 | [Agent 讲解视频 SOP](../theory/extractions/videos/V05-BV1xGah67E1j.md) | 配音时基、设计测试、分段制作、局部返修，并关联 P04 | 生图／生视频含手动操作；缺完整原工程、调用成本与独立复现 |
| V06 | [341 风格与 DeepSeek](../theory/extractions/videos/V06-BV1bqx76wEUM.md) | 离线选风格、细规格 Prompt、少量跨模型示例；关联 P09 | 1 元是作者测试报告，缺账单与全部尝试；341 项不是独立流程 |
| V07 | [Vibe 科普拆解](../theory/extractions/videos/V07-BV1ALnw6YEM7.md) | 任务、受众、内容、具体风格与输出规格的 Prompt 骨架 | 模板附件／代码未取得；90 与 140 秒规格存在冲突 |
| V08 | [动画制作全流程](../theory/extractions/videos/V08-BV1xFnt6zE3K.md) | 短片参考、长片六节点、分段重渲、多模型分工与成本；关联 P10、P13–P21 | 965 个两秒文字采样已读，非完整视听；缺完整长片工程 |
| V09 | [个人 harness](../theory/extractions/videos/V09-BV1Gg3E6BEbn.md) | 多模型任务分工、风格适配、非交互 CLI 与 Skill A/B；关联 P11／P12 | 完整视听与模型对照未做，论文／评测出处仍缺；示意数值不算实测 |
| V10 | [代码动画展示片（DSH+Remotion）](../theory/extractions/videos/V10-BV1ztH96uE1Z.md) | BPM→帧时间基、三层卡点、每拍风格切换、自指画面与规格卡 | 无口播；68 cuts 与工程未核实；未听音 |
| V11 | [俯仰代码动画加强版](../theory/extractions/videos/V11-BV1vsx66BE4p.md) | 技能包分层与按需加载、四阶段授权、任务卡／分镜表／音乐四案／返修表、质量底线；与 V06／P09 同源新版本 | 四组 A/B 无日志与评分标准；网盘资源未取；未安装运行 |
| V12 | [AI 动画完全指南](../theory/extractions/videos/V12-BV1f94c6uEr3.md) | render(t) 确定性、单一时间表、三处确认门、QA 材料化、独立审片 | 43 风格未逐份读；未安装 Skill；费用与耗时未披露 |
| V13 | [Harness 实践](../theory/extractions/videos/V13-BV1ypdgBCE9B.md) | 四阶段两检查点、按阶段分发文档、Outline 状态记忆、多 Agent 隔离、最小切片修复、Reviewer Agent | 讲的是较早的 web-video-presentation；未取得工程与账单；未完整视听 |

## 案例知识（原工程已于 2026-11 清理）

本地逐风格复现与独立验证的**工程、源码、媒体和检查 JSON 已按用户要求删除**；总结知识改由 [案例库](cases/README.md) 保存。原路径只用于追溯，不再作为可执行入口。

| 原类型 | 案例文档 | 保留原因 |
| --- | --- | --- |
| 设计与代码对应 | [MG 平面矢量](cases/mg-01-flat-vector.md)、[线条](cases/mg-03-line-art.md) 等案例 | 从创作意图到几何、镜头与时间的推导；只留 Prompt 会丢失这部分知识 |
| 方法说明 | [MG 案例](cases/README.md)、[一笔画案例](cases/deepseek-onetake.md) | 生成新 Prompt、挑选工具与定义检查的基础 |
| 实际输入 | 案例文档中的 Prompt 结构与关键参数 | 区分作者输入、实际执行输入和事后归纳；上游 Prompt 原文在 `resources/*/source/prompts/` |
| 实际结果与失败 | 各案例文档的验收、失败与用户反馈段 | 避免把技术通过或单次成功推广为稳定能力 |
| 可编辑实现 | 已删除；结构与做法写入案例文档 | 需要重建时按上游固定版本与案例描述重做，不冒充现成工程 |
| 执行依赖 | 已删除；保留上游快照与版本 | 原案例依赖本机虚拟环境、字体、音频库与 Chrome，不能仅靠根目录 `npm ci` 复原 |

## 怎样判断“开源文件够不够”

收藏时可以不完整，但生成流程要按实际文件逐项判断：

- 有完整 Prompt，还是只有标题／短介绍？是否保存实际执行版本与补充反馈？
- 有可编辑源码、工作流导出或节点图吗？如果只有文字说明，需要重新实现哪些部分？
- 引擎／模型／节点版本、锁文件、启动与导出命令齐全吗？
- 字体、纹理、音乐、角色与外部数据能从哪里取得？哪些需要账号、额度或手动操作？
- 有可播放输出、失败记录和检查范围吗？干净环境重建是否实际做过？
- 代码、文档、模型权重和外部素材分别是什么许可？哪些文件可以一起发布？

缺失项写在来源卡与候选流程中，不用空文件或推测补全。缓存可以保留本地；开源发布至少保留固定来源、获取步骤、许可与可复用的原创文件，避免复制整套环境和渲染帧。

## 优先补齐的来源

| 缺口 | 希望收集的证据 |
| --- | --- |
| 图生／文生视频 | 一个有完整输入、工作流／API 示例、失败与费用记录的可运行工程 |
| 本地生成与 ComfyUI | 官方仓库、具体模型与权重许可、节点清单、Workflow JSON、显存与耗时实测 |
| 数字人／口型同步 | 官方实现、声音／人物输入要求、可调用方式与示例工程 |
| 图片分层／2.5D | 资产拆分方法、遮挡处理、镜头参数和可编辑工程 |
| 小模型／便宜模型适配 | 准确服务与模型 ID、实际完整 Prompt、工具权限、尝试次数、总费用和输出 |

DeepSeek、用户提到的“GPT-6.1 luna”以及想法池中的其他名字，没有准确产品链接与 API ID 时，不填官方价格、不假定能力，也不做自动路由。新视频中的模型标签与费用按作者报告单独保留，不因已读到标签就视为官方验证。

第二批关联仓库的固定版本、ZIP 校验、选择性获取、阅读范围、许可与 404／附件缺口见 [REPOSITORIES.md](REPOSITORIES.md)；多模型与 Skill 的后续组合见 [ROUTING.md](ROUTING.md)。不是全部外链已递归下载或已验证。
