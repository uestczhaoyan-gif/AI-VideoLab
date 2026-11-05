# 本地案例知识库（cases）

本目录保存 2026-10 在本机完成的复现、迁移与独立验证案例的**总结知识**：设计拆解、时间表、渲染与声音做法、检查数字、失败记录和用户反馈。它回答「当时实际做了什么、结果如何、哪些能复用」，不提供可执行工程。

## 归档背景与范围

- 用户要求删除只用于一次性复现的 demo 工程、渲染产物与代码，保留其中总结的要点、Workflow 与可复用经验。
- 删除范围（用户指定）：`demo/mg-styles-15/demos/**`、`demo/lemo-opuscar/trials/**`、`DeepseekDemo/**`。
- 本目录文档依据删除前的 `README`／`DESIGN`／`METHOD`／`EXPERIENCE`／`PROMPT`／`TRIAL`／`REBUILD-NOTES` 等文档整理，日期 2026-11-06。
- 上述目录及 `demo/` 下相关案例 README 已在本轮任务中删除；删除后原工程、源码、母版、分镜与检查 JSON 不再存在。
- 未重新运行任何渲染，未重新观看或试听成片；数字与用户原话照原文转录，未做新测量。原文未记录的信息写「未记录」。

## 上游快照与恢复入口

- 2026-11 整理把上游快照统一到 [resources/](../../../resources/README.md)，按 `resources/<项目>/source/` 存放；`source/` 被 Git 忽略，新机器需按固定版本重新获取。
- mg-styles-15：固定 commit `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`（MIT）。
- lemo-opuscar：固定 commit `b5e8ef93930b6d828f352055a689320f138237b1`（MIT）。
- 迁移前快照位于 `demo/*/source/`，2026-11 整理迁入 `resources/<项目>/source/`；以 [resources/README.md](../../../resources/README.md) 记录的版本与位置为准，不把本机绝对路径写成通用依赖。
- DeepseekDemo 依赖共享的 mg-styles-15 harness、mgaudio 与字体颗粒；其自身 `engine/linefilm.js`、`films/`、`assets/` 随删除不复存在，只剩本目录的文字和 `cues.json` 结构描述。
- 「有源码快照」不等于已在新机器恢复，也不等于可在当前环境直接运行。

## 案例索引

| 文档 | 案例 | 上游来源 | 交付与检查（原文数字） | 用户反馈（原话要点） |
| --- | --- | --- | --- | --- |
| [mg-01-flat-vector](mg-01-flat-vector.md) | 平面矢量：One Dot → 种子花园 | mg-styles-15 `demos/01-flat-vector` | 原作重建 300 帧／10.00 s；拓展同为 300 帧 | “做的还挺好的”；“有那种感觉了”“整体不错”；2–6 s 轻微卡顿未定位 |
| [mg-02-isometric](mg-02-isometric.md) | 等轴 2.5D：ISOPOLIS → SUNGRID | mg-styles-15 `demos/03-isometric` | 原作 SSIM All=0.964928；拓展 360 帧／12 s | 原版认可；拓展验收状态在原文中自相矛盾，见文内 |
| [mg-02-isometric-chip](mg-02-isometric-chip.md) | 芯片运行：INSIDE ADD | 同方法新写场景（无上游原片） | 540 帧／18 s；−16.0 LUFS／−2.2 dBFS | “还是有点简陋，但是有那个意思了吧，算可以了。” |
| [mg-03-line-art](mg-03-line-art.md) | 线条动画：ATELIER LINEA → 归途 | mg-styles-15 `demos/02-line-art` | 原作 SSIM All=0.994781；《归途》360 帧／12 s | “画得很好，很喜欢这个效果和风格”；《归途》“有那个意思了” |
| [mg-04-3d-render](mg-04-3d-render.md) | Blender 三维质感：Soft Landing → RIPPLE | mg-styles-15 `demos/04-3d-render` | 240 帧／24 fps；CPU 原质量约 9.93 h；v2 192 帧／8 s | “除了画质以外都还可以”→“很满意”；v1 被否定，v2 运动获认可 |
| [mg-05-shape-morph](mg-05-shape-morph.md) | 形变动画：一形万象 → WANDER | mg-styles-15 `demos/08-morph` | 原作 SSIM All=0.974531；v3 300 帧／10 s | “整体看起来没有什么问题”；WANDER “勉强接受”，仍欠原作神韵 |
| [lemo-whiteboard-trial](lemo-whiteboard-trial.md) | 白板讲解 24 fps 试片（非正式） | lemo-opuscar `styles/whiteboard` | 24.0 s／720 帧／30 fps；无配音字幕 | 未记录 |
| [deepseek-onetake](deepseek-onetake.md) | DeepseekDemo 一笔画引擎与三部片 | 依据本项目笔记从零重写 | 300／1800／2460 帧；−14.0 LUFS | 未记录（三部片均标“等待观看验收”） |

## 证据边界

- 「技术通过」指解码、帧数、分辨率、响度等检查通过；它与「完整视听」「用户采用」分开记录，不能互相推定。
- SSIM、像素哈希、响度数字只说明对应指标；SSIM 不是审美还原百分比，随机定位一致也不排除缓动停顿。
- 用户反馈是当时对话中的原话摘录。原文档未记录反馈的案例明确写「未记录」，不补写观感。
- 本目录不复刻上游 Prompt 全文，只保留结构与关键数字；完整 Prompt 按固定版本从上游仓库获取。

## 与其他资料的关系

- [方法索引](../METHODS.md)、[来源索引](../SOURCES.md)、[路由](../ROUTING.md) 继续回答「哪条路线适合什么、证据到哪一步」；本目录只提供案例事实与边界。
- 上游来源笔记：[P02](../../theory/extractions/projects/P02-mg-styles-15.md)（mg-styles-15）、[P08](../../theory/extractions/projects/P08-anatomy.md)（Anatomy，未在本次删除范围）、[P16](../../theory/extractions/projects/P16-onetake.md)（Onetake 相邻段承接）。
- 结构化 [catalog](../../../catalog/README.md) 当前条目已指向 `resources/` 上游快照；本目录不复制 catalog 数据，也不代替其字段与校验。

## 维护约定

- 本目录只存「总结知识」，不复制原工程；引用实现细节时写明来自哪份原文档。
- 新增案例文档命名沿用 `mg-<上游源码编号>-<风格>.md`；独立实验用独立名字，不冒用上游编号。
- 每个数字都要能回到删除前文档；不同来源的同类数字冲突时并列保留（如 mg-02 的验收状态）。
- 用户反馈只记原话；没有记录就写「未记录」，不根据成片观感补写。
- 「技术通过」「完整视听」「用户采用」「商用授权」分开写，不能互相推定。
- 删除后不再声称媒体可播放或工程可运行；需要恢复时按 resources/ 的固定版本重新获取。
- 上游 Prompt 全文不复制进本目录；需要原文时按 commit 从上游取。
- catalog 的导入、路径与恢复由 `tools/catalog/` 与 `resources/` 负责；本目录不改 catalog。
- 新增案例前先读对应来源笔记（Pxx）与本目录已有文档，避免重复建档。
- 本目录不替代 [来源索引](../SOURCES.md) 与 [方法索引](../METHODS.md)：案例事实在此，来源覆盖与方法标签在那边。
- 若后续重做同一案例，新建文档或明确标注新版本，不覆盖本次归档记录。
- 归档日期与依据文档清单放在每篇开头，便于核对。
- 状态与下一步不写在这里：统一在 [PROJECT.md](../../../PROJECT.md) 维护。
