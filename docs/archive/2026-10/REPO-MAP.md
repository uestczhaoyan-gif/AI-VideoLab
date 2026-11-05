> Historical archive. Current direction and tasks: [PROJECT.md](../../../PROJECT.md). The original text below is retained for reference, not active instructions.

# VideoLab 仓库梳理

当前入口已调整为 [方法库](../../library/README.md)：优先收集、分类、保存 Prompt 与开源文件入口，已有 demo 保留，下一项实践不自动启动。白板非正式试片见 [TRIAL.md](../../../demo/lemo-opuscar/trials/whiteboard-24fps/TRIAL.md)。下文是 2026-10-20 的历史结构与体量快照，案例状态和统计不代表本轮重新测量；当前方向以 [研究计划开头](RESEARCH_PLAN.md) 为准。

快照：2026-10-20，对应提交 `adadc04`（含本次文档一致性修补，尚未提交）。本文件是维护用索引：说明仓库怎么组织、每个案例做到哪、体量与已知问题在哪。**细节与时间线不在这里重复**，以 [项目计划](RESEARCH_PLAN.md) 的推进日志、[demo 索引](../../../demo/README.md) 与各案例 README 为准。

## 1. 仓库是什么

一个**过程型研究仓库**：从公开作品与源码复现开始，把“设计 → 实现 → 迁移”的对应关系记录下来，最终希望沉淀为可复用的 Workflow 与 Skill。当前没有发布过经过验证的通用 Workflow 或 Skill。

三条线并行推进，但按批次串行：

| 线 | 载体 | 做什么 | 当前状态 |
| --- | --- | --- | --- |
| 实践线 | `demo/` | 逐个上游项目复现 → 拆解设计 → 总结方法 → 换概念迁移 | 第 5 个风格（形变）已归档，等待下一项 |
| 理论线 | `docs/theory/` | 逐视频／项目提取观点、参数与限制，保留重复与冲突 | 第一批 13 份笔记关闭，等实践汇合后写文章 |
| 独立验证 | `DeepseekDemo/` | 只凭已有方法笔记重写作品，检验“文档是否足以复原” | 3 部片技术检查通过，主观验收未全部完成 |

## 2. 结构地图

```text
VideoLab/
├── README.md              # 项目入口与当前状态
├── RESEARCH_PLAN.md       # 研究计划 + 按日推进日志（时间线的唯一权威）
├── REFERENCES.md          # 来源线索与证据状态
├── CONTRIBUTING.md        # 案例记录顺序、不提交什么
├── THIRD-PARTY-NOTICES.md # 第三方许可与发布边界
├── LICENSE                # 自行撰写部分：MIT
├── docs/                  # 参考与想法，不进入执行队列（索引见 docs/README.md）
│   ├── IDEAS.md
│   ├── REPO-MAP.md        # 本文件
│   └── theory/            # 理论线：extractions/ + 批次记录 + 文章提纲 + 工具
├── demo/                  # 实践线：按上游项目组织
│   ├── mg-styles-15/      # 6 个案例 + 共享 tools（主战场）
│   ├── anatomy/           # 仅登记并克隆，未开案例
│   └── lemo-opuscar/      # 51 种代码影片风格库，已下载快照，未运行
└── DeepseekDemo/          # 独立验证：一笔画引擎 + 3 部片
```

| 路径 | 作用 | 文件数 | 体积 |
| --- | --- | --- | --- |
| 根目录（6 份文档 + 2 份配置） | 入口、计划、来源、许可边界 | 8 | < 30 KB |
| [docs/](../..) | 想法池、理论线、索引 | 25 | ~0.1 MB |
| [demo/](../../../demo) | 上游项目复现与迁移 | 230 | 172 MB |
| [DeepseekDemo/](../../../DeepseekDemo) | 引擎与原创片 | 147 | 338 MB |
| 合计（含本次新增 4 份文档） | | 410 | 510 MB |

排除提交的本地缓存约 3.5 GB：上游源码 `demo/*/source/` 1.45 GB（含 lemo-opuscar 105 MB）、两处 `.venv` 848 MB、`.tmp`（浏览器配置与下载缓存）638 MB、`_evidence` 367 MB、`downloads` 170 MB、`_sources` 10 MB、`demo/anatomy/source/` 14 MB。工作区合计约 5.5 GB。

## 3. 文档链

入口到证据的阅读顺序：

```text
README.md
  → RESEARCH_PLAN.md            计划、阶段、推进日志
  → demo/README.md              案例索引与状态
  → <project>/README.md         来源、固定 commit、案例表
  → <case>/README.md            本次目标、过程、结果、下一步
  → METHOD.md / DESIGN.md       方法（怎么做）／设计与代码对应
  → EXPERIENCE.md               实际做到什么、失败、成本、验收范围
  → reproduction/ extension/    成片、源码、Prompt、检查记录
```

规则：[CONTRIBUTING.md](../../../CONTRIBUTING.md) 规定每案例按“固定上游 → 重建 → 拆解 → 拓展 → EXPERIENCE”记录；[RESEARCH_PLAN.md](RESEARCH_PLAN.md) 第 5、6 节规定执行循环与必须保存的信息。`METHOD.md` 写方法，`EXPERIENCE.md` 写实际结果，两者不互相替代。

## 4. 实践线案例矩阵

上游固定版本：`mg-styles-15` @ `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`（MIT）。上游展示序号与本地编号不一致，两者在每个案例 README 中同时登记。

| 本地案例 | 上游路径 | 复现 | 迁移／拓展 | 文档 | 状态 |
| --- | --- | --- | --- | --- | --- |
| [01 平面矢量](../../../demo/mg-styles-15/demos/01-flat-vector/README.md) | `demos/01-flat-vector` | ✅ 10 s / 300 帧 / −14.0 LUFS | 种子花园，用户认可整体 | README + DESIGN + METHOD + EXPERIENCE | 一处 2–6 s 轻微卡顿未定位 |
| [02 等轴](../../../demo/mg-styles-15/demos/02-isometric/README.md) | `demos/03-isometric` | ✅ | SUNGRID，认可 | 齐全 | 收尾 |
| [02 芯片](../../../demo/mg-styles-15/demos/02-isometric-chip/README.md) | 同方法新写场景 | — | INSIDE ADD，概念通过、视觉偏简陋 | 齐全（无 reproduction/） | 已收尾，编号沿用 02 |
| [03 线条](../../../demo/mg-styles-15/demos/03-line-art/README.md) | `demos/02-line-art` | ✅ | 《归途》，初步通过 | 齐全 | 收尾，补记“一笔画先规划表现顺序” |
| [04 三维](../../../demo/mg-styles-15/demos/04-3d-render/README.md) | `demos/04-3d-render` | ✅ 1080p / 240 帧底片 | RIPPLE v1 失败 → v2 获接受 | 齐全 + `draft/` 低清预览 | 收尾 |
| [05 形变](../../../demo/mg-styles-15/demos/05-shape-morph/README.md) | `demos/08-morph` | ✅ | WANDER 初版／v2 失败 → v3 勉强接受 | 齐全 + `studies/` + `revisions/` | 归档，神韵差距保留 |
| [Anatomy](../../../demo/anatomy/README.md) | 外部仓库 | ❌ 仅克隆 | — | 仅 README（候选说明） | 未启动，不改变当前顺序 |
| [lemo-opuscar](../../../demo/lemo-opuscar/README.md) | 外部仓库（51 风格） | ❌ 仅下载快照 | — | README（来源、风险核查、接入顺序） | 候选，未运行；建议先做“一笔画”横向对照 |

三处结构变体（均在案例 README 登记）：`draft/` 阶段性降质完整预览、`extension/studies/` 单项运动研究、`extension/revisions/` 失败与修订版本。

## 5. 独立验证线（DeepseekDemo）

一笔画引擎 [`engine/linefilm.js`](../../../DeepseekDemo/engine/linefilm.js) 由 `cues.json` 驱动，三部片共用：

| 片 | 时长 | 类型 | 技术检查 | 验收状态 |
| --- | --- | --- | --- | --- |
| [ATELIER LINEA 复原](../../../DeepseekDemo/README.md) | 10 s | 只凭方法笔记重写原片 | 300 帧、−14.0 LUFS | 待按正常速度观看 |
| [TWO POINTS 两点之间](../../../DeepseekDemo/films/two-points/README.md) | 60 s | 原创科普（分辨率） | 1800 帧、−14.0 LUFS | 等待观看验收（重点 30–45 s） |
| [ONE LIFE 一生，一笔](../../../DeepseekDemo/films/life/README.md) | 82 s | 原创叙事 | 2460 帧、−14.0 LUFS | 已自评，列出 3 处待修 |

这条线的价值在于检验“文档能否复原”和“风格能否承担科普／叙事”，其产出**不计入**实践线风格序列。

## 6. 理论线

[docs/theory/README.md](../../theory/README.md)：5 条视频（V01–V05）＋ 8 份项目／工具（P01–P08）逐来源笔记，共 13 份，第一批已关闭（[批次收尾](../../theory/BATCH_01_REVIEW.md)）。证据分四类：作者表述、实现事实、研究者解释、待验证。文章提纲在 [ARTICLE_PLAN.md](ARTICLE_PLAN.md)，等实践线经验齐了才展开。

## 7. 体量与发布现状

- 510 MB 已跟踪内容中，**109 个抽帧 PNG 占 223 MB**，mp4 32 个 177 MB，wav 12 个 70 MB，字体 25 MB；storyboard／poster／comparison 合计只有 8.3 MB。
- `.git` 636 MB、612 个松散对象、无 pack。最新提交删除的 2 个 mp4（76 MB + 63 MB）仍留在历史里，因此克隆体积仍是 600 MB 量级。
- 有 **110 个文件命中 `.gitignore` 却仍在索引中**（先提交、后加规则），`.gitignore` 的 `*.mp4` 等规则只对新增文件生效。
- 未启用 Git LFS。远端 `origin` 已公开，要缩小历史必须 rewrite + force push，影响面需单独决定。

## 8. 已知问题与维护建议

| 优先级 | 问题 | 建议 |
| --- | --- | --- |
| 高 | 抽帧 PNG／mp4／wav 占 470 MB，与 CONTRIBUTING“不提交渲染帧”冲突 | 抽帧移出索引（保留 storyboard／poster／comparison／`check.json`）；成片改 LFS 或 Release |
| 高 | 历史体积无法靠普通提交去除 | 需要时再评估 rewrite + force push，先确认协作影响 |
| 中 | 编号重复（`02-isometric` 与 `02-isometric-chip`） | 已在文档说明“同属等轴方法”，暂不改名以免断链 |
| 中 | 三部原创片与 01 卡顿均未完成主观验收 | 观看后再更新状态，不提前写成通过 |
| 低 | `docs/` 根两份原始笔记体例与 `extractions/` 不同 | 已在 [docs 索引](../../README.md) 登记为原始记录，不改写 |
| 低 | 理论线与实践线尚未汇合，方法未封装 Skill | 等案例经验齐后按 ARTICLE_PLAN 展开 |

**发布前必查**：链接完整性、每案例 `EXPERIENCE.md` 是否存在、`source/` 与缓存是否仍在忽略列表、成片是否可访问。

## 9. 常用入口

```powershell
# 仓库状态与体量
git status --short
git count-objects -vH

# 案例渲染（在 demo/mg-styles-15）
.\tools\run.ps1 -Case 05-shape-morph -Stills
.\tools\run.ps1 -Case 05-shape-morph
.\.venv\Scripts\python.exe tools/check.py

# 独立验证片（在 DeepseekDemo）
pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode video -FilmName films/two-points
..\demo\mg-styles-15\.venv\Scripts\python.exe tools\check.py --film films/two-points
```

环境安装见 [SETUP.md](../../../demo/mg-styles-15/tools/SETUP.md)；上游源码不在发布快照中，需按各项目 README 的固定 commit 自行克隆。

## 10. 如何维护本文件

结构增删、案例状态变化、体量量级变化时更新；不把逐日进展写进来（那是 `RESEARCH_PLAN.md` 日志的职责）。新增上游项目时，先在 `demo/<project>/README.md` 登记来源、commit 与候选顺序，再回到第 2、4 节补一行。
