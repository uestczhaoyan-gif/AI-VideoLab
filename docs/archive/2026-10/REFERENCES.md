> Historical archive. Current direction and tasks: [PROJECT.md](../../../PROJECT.md). The original text below is retained for reference, not active instructions.

# 参考资源

当前收集与分类入口：[方法库](../../library/README.md)。已有资料的版本、Prompt、源码位置和缺口集中见 [来源与开源文件](../../library/SOURCES.md)，风格见 [风格索引](../../library/STYLES.md)。下方保留历史资源登记；本轮没有重新验证现行模型名称、服务价格或上游最新版本。

进度更新（2026-10-15）：mg-styles-15 已完成平面矢量原作重建、花园拓展和等轴城市原作重建。第一批 5 条视频及相关项目资料已整理为 [独立来源笔记](../../theory/README.md)，具体覆盖见 [批次收尾](../../theory/BATCH_01_REVIEW.md)。下方“初始资源”表保留初次规划记录，不表示这些视频现在仍无法读取。

## 第二批新来源（2026-10-29）

四条视频可访问公开页面与低清播放文件，字幕接口要求登录；已读取全片时间范围的两秒烧录文字采样，长视频补齐 965 个时间点，但未完整视听。覆盖及缺口见 [本批记录](../../theory/BATCH_02_INTAKE.md)；新补关联仓库的固定版本、下载与许可见 [仓库清单](../../library/REPOSITORIES.md)。

| 来源 | 记录 | 主要用途 |
| --- | --- | --- |
| [341 风格与 DeepSeek](https://www.bilibili.com/video/BV1bqx76wEUM/) | [V06](../../theory/extractions/videos/V06-BV1bqx76wEUM.md) | 细规格 Prompt、离线风格选择与少量跨模型示例 |
| [code-animation-prompts](https://github.com/XiaoyeCodes/code-animation-prompts) | [P09](../../theory/extractions/projects/P09-code-animation-prompts.md) | 341 个风格条目、检索与渲染工具，完整本地快照已保存 |
| [Vibe 科普拆解](https://www.bilibili.com/video/BV1ALnw6YEM7/) | [V07](../../theory/extractions/videos/V07-BV1ALnw6YEM7.md) | 角色、受众、内容、风格与输出规格的制作输入 |
| [制作全流程](https://www.bilibili.com/video/BV1xFnt6zE3K/) | [V08](../../theory/extractions/videos/V08-BV1xFnt6zE3K.md) | 短片与长片的制作、审阅、分段重渲与成本 |
| [Ploto 作者文章](https://ploto.me/posts/how-i-made-a-long-video-with-ai/) | [P10](../../theory/extractions/projects/P10-ploto-long-video-workflow.md) | 视频关联全文与工作台展示，已完整阅读 |
| [个人 harness](https://www.bilibili.com/video/BV1Gg3E6BEbn/) | [V09](../../theory/extractions/videos/V09-BV1Gg3E6BEbn.md) | 多模型任务分工、风格适配、按需 Skill 与对照测试 |
| [auto-motion](https://github.com/vibe-motion/auto-motion) | [P11](../../theory/extractions/projects/P11-auto-motion.md) | 完整固定 ZIP 与核心脚本；当前 HyperFrames，与视频 Remotion 版本分开 |
| [Open Design](https://github.com/nexu-io/open-design) | [P12](../../theory/extractions/projects/P12-open-design.md) | 49 个核心文件，非完整软件；运行时适配、Skill 选择与设计契约 |
| Manim／Remotion Skill、HyperFrames、Onetake、Anidoodle、Claudian、三个作品集 | [P13–P21 清单](../../library/REPOSITORIES.md) | 固定 ZIP 与范围初读；未运行，许可分别标明 |

## 后续加入的理论来源

- [Opus5.5 审美分析](https://www.bilibili.com/video/BV1wqpi6PE19/) → [V04](../../theory/extractions/videos/V04-BV1wqpi6PE19.md)。
- [Agent 讲解视频与 SOP](https://www.bilibili.com/video/BV1xGah67E1j/) → [V05](../../theory/extractions/videos/V05-BV1xGah67E1j.md)。
- [fifi-video-prompt](https://github.com/huiq777/fifi-video-prompt) → [P03](../../theory/extractions/projects/P03-fifi-video-prompt.md)。
- [Table-VideoSOP](https://github.com/duoduoler-ops/Table-VideoSOP) → [P04](../../theory/extractions/projects/P04-Table-VideoSOP.md)。

## 初始资源

新增（2026-10-15）：[wheresryan22/anatomy](https://github.com/wheresryan22/anatomy)，已下载至 `demo/anatomy/source/`，后续按原例复现、拆解与推广研究；[候选记录](../../../demo/anatomy/README.md)。

新增（2026-10-20）：[lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)，51 种纯代码影片风格库（MIT，固定版本 `b5e8ef9`）；已下载至 `demo/lemo-opuscar/source/` 并完成静态风险核查，尚未运行；[候选记录](../../../demo/lemo-opuscar/README.md)。

核查日期：2026-10-13。下面的“已读”仅指可访问的页面文字；本次规划没有实际播放参考视频、运行上游源码或验证作者的质量宣称。

| ID | 资源 | 当前证据状态与研究用途 |
| --- | --- | --- |
| R01 | [ai-promo-video-maker](https://github.com/liyupi/ai-promo-video-maker) | 已读仓库说明；作者提供产品片流程及 Remotion 工程，配音为可选项。候选：完整产品片方法复现 |
| R02 | [mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) | 已读仓库说明；提供短片、提示词与代码，并披露迭代过程。候选：风格对照、源码重建与提示词再生成 |
| R03 | [0 基础 AI 视频教程](https://www.bilibili.com/video/BV1Z28P6HEGa/) | 本次链接读取失败；用户笔记提到角色／场景生图、提示词、TAPNOW 画布。待观看后核实制作链 |
| R04 | [用户记录的 Opus 与 GPT 视频比较](https://www.bilibili.com/video/BV1Haaq6ZEei/) | 本次链接读取失败；模型名称、版本、预算和人工修改情况均待核实 |
| R05 | [用户记录的 GPT 直出视频展示](https://www.bilibili.com/video/BV1E2t26vEVx/) | 本次链接读取失败；“像幻灯片”是用户观感，待用时间点和画面行为具体描述 |
| R06 | [3b1b/manim](https://github.com/3b1b/manim) 与 [Manim Community 文档](https://docs.manim.community/en/stable/) | 已读取入口；作为解释动画技术参考，两套实现分别记录版本，不混用命令与示例 |
| R07 | [Remotion 官方文档](https://www.remotion.dev/docs/) | 已读入口，包含代码制作与 Agent Skill 使用路径；用作技术核对，不视为成片质量证据 |
| R08 | 3Blue1Brown、Vibe 知识大赏及相关制作 Skill | 用户提供的检索线索；尚无选定作品／Skill 的准确地址与来源核验 |
| R09 | TAPNOW、Seedance、ElevenLabs、免费或本地视频模型 | 用户提供的候选工具；可用版本、导出方式、成本和使用条件待对应实验时核查 |
| R10 | X 上 GPT、Kimi 视频及 Kimi K3 介绍片 | 用户观察线索，缺少具体原帖；补齐前不作为模型自制或模型优劣的证据 |

初始表中的项目能力描述来自当时作者 README；后续实测范围以 demo 记录为准，不能由个别案例推广为全库支持。使用代码时固定 commit 并逐项确认依赖和素材许可；不能从代码许可证推断所有外部素材均可再分发。
