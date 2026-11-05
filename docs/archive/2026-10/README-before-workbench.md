> Historical archive. Current direction and tasks: [PROJECT.md](../../../PROJECT.md). The original text below is retained for reference, not active instructions.

# VideoLab

收集、分类并整理可复用的 AI 视频制作方法，保存 Prompt、开源工程与适用条件，逐步形成面向不同视频用途的 Workflow 与 Skill。

覆盖产品与项目介绍、知识解释、叙事与电影感短片等方向。视频用途、表现形式、视觉风格与制作技术分别记录；光学科普是候选案例之一。

## 当前状态

当前按用户最新要求转为**资料收集 → 多维分类 → 工作流与 Prompt 整理**，入口为 [AI 视频方法库](../../library/README.md)。已有代码、案例、原始笔记和 Prompt 全部保留；不再以完成下一支 demo 为收录新方法的前提。

先看 [方法分类](../../library/METHODS.md)、[已有来源与开源文件](../../library/SOURCES.md)、[风格目录](../../library/STYLES.md)，再看 [工作流草案](../../library/WORKFLOW.md) 与 [Prompt 构造](../../library/PROMPTS.md)。当前有 16 个起始方法标签，整理了多个风格库入口；这不代表这些路线全部已验证或已有自动执行界面。

2026-10-29 新资料与补查见 [第二批记录](../../theory/BATCH_02_INTAKE.md)，累计 30 份逐来源笔记。四条视频均有全片范围的两秒文字采样，32 分钟视频补齐 965 个时间点，但未完整视听；除 341 风格库外新增十个完整仓库 ZIP，Open Design 仅取 49 份核心文件。获取与许可见 [仓库清单](../../library/REPOSITORIES.md)，后续按任务／风格分工与短对照验证见 [路由草案](../../library/ROUTING.md)；未安装 Skill 或制片。

既有实践仍在 `demo/` 和 `DeepseekDemo/`。原复现阶段的计划与日志保存在 [研究计划](RESEARCH_PLAN.md)，其开头说明本轮方向调整；来源线索见 [参考资源](REFERENCES.md)。第一批理论资料保持归档，见 [覆盖与交接](../../theory/BATCH_01_REVIEW.md)。需要判断某条路线的可执行性时，再选择最小验证任务。

后续构想与尚未启动的工具路线放在 [想法池](IDEAS.md)，有准确来源后再纳入来源记录。

另有一次独立验证：[DeepseekDemo](../../../DeepseekDemo/README.md) 只依据已有的《一笔画》设计与方法笔记（不读上游源码）
重写了一条同风格短片，用来检验“文档是否足以复原”。该验证随后抽成通用一笔画引擎，并扩展出两部原创短片
（[TWO POINTS 两点之间](../../../DeepseekDemo/films/two-points/README.md)、[ONE LIFE 一生，一笔](../../../DeepseekDemo/films/life/README.md)）；
方法与差异清单都在该目录内。

理论资料另设 [独立研究目录](../../theory/README.md)：每个视频、项目单独提取观点和方法，保留重复与冲突，待阶段性实验结束后汇合为工程技术文章；现阶段不自动改变制作流程。

已有形变动画原版已验收，WANDER v3 获用户勉强接受并归档（仍欠原作神韵，差距记录保留为后续风格经验）；版本记录见 [形变案例](../../../demo/mg-styles-15/demos/05-shape-morph/README.md)。当前不自动启动下一种风格。另有 [白板非正式试片](../../../demo/lemo-opuscar/trials/whiteboard-24fps/TRIAL.md)，其覆盖与差距已纳入方法库。

文档目录索引见 [docs/README.md](../../README.md)；目录结构、案例进展与已知仓库问题汇总在 [仓库梳理](REPO-MAP.md)。

## 推进方式

1. 广泛收录视频、开源项目、完整 Prompt 与制作流程，注明实际读取范围和缺失文件。
2. 按用途、形式、风格、技术、自动化与资源条件分类，保留原始来源与冲突。
3. 将相关资料组合成有输入输出、步骤、成本与限制的候选 Workflow，保存 Prompt 构造方法。
4. 按需要做代表难点的最小验证，回写实际结果；具备可执行实现后，再封装 Skill 或选择类型的界面。

样片、可编辑工程、完整输入、运行记录和失败案例继续作为证据。来源收录与本地验证分别标注；可运行不等于好看，单个精彩样片也不等于方法已经通用。

## 参与研究

欢迎提供有成片、有制作过程或有源码的参考，或提交带环境、输入、输出和失败记录的复现结果。贡献边界见 [CONTRIBUTING.md](../../../CONTRIBUTING.md)，根目录自行撰写的代码与文档使用 [MIT 许可证](../../../LICENSE)；第三方来源与素材范围见 [THIRD-PARTY-NOTICES.md](../../../THIRD-PARTY-NOTICES.md)。
