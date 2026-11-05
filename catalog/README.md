# 结构化目录

这是工作台与 AI 共用的引用索引，不是原始素材包。当前统计由 `catalog.json` 计算：408 个引用条目、35 个来源记录（34 份 Vxx/Pxx 笔记，加 Lemo 快照）、3 个候选流程；模型目录为空，所有 `runnable` 为 `false`。

## 文件与边界

- `schema.json`：v1 JSON Schema；未知引擎为 `null`，未逐项确认的参数为空数组，不代表无限可改。
- `catalog.json`：实际条目。沿用上游 ID，工作台用 `cap-*`、`lemo-*`、`mg-*` 命名空间避免混淆；不复制完整 Prompt 或源码正文。
- `snapshots.json`：导入输入的 SHA-256 指纹。覆盖 CAP 的 JSON、Lemo 的 51 份 `style.json`、MG 的 15 份 Prompt；不是所有上游素材的独立鉴定。2026-11 上游快照迁移到 `resources/` 后按新路径重新记录，内容与版本未变。
- `import-report.json`：最近导入的读取／保留范围。`retained_from_catalog` 表示缓存缺失或显式离线，不是本次重新取得原文。
- [导入工具](../tools/catalog/import.mjs)：优先读取现成 JSON；来源笔记使用 Markdown 解析器取标题／入口。发生输入指纹变化时停止，不继续沿用旧版本。
- [校验工具](../tools/catalog/validate.mjs)：检查结构、ID、引用、路径安全、媒体扩展名及能力边界；不要求忽略缓存在新机器存在。

341 个 CAP、51 个 Lemo、15 个 MG、1 个工具参考是**引用条目数**，不能当作独立风格或成功实验数。CAP 有 8 个空名称条目，保留原编号并标记“未命名条目”；未补造内容。部分同名／同系列关联以 `related_ids` 登记，关系只表示相关版本，不表示 Prompt、资产、引擎完全等价；未完成所有条目的人工去重。

2026-11 清理时删除了 4 条 VideoLab 自制案例条目（`local-*`）及其来源记录；案例知识改存 [docs/library/cases/](../docs/library/cases/README.md)，不再作为 catalog 模板。

### 时间规格与谱系（2026-11 增补）

- `timing`（可选）：`fps`、`duration_seconds`、`frames`、`bpm`、`beat_frames`、`hit_tiers`、`note`。只登记来源实际公布的规格，不代表模板可执行。V10 的 45.0 s / 1350 帧 / 30 fps / 128 BPM 已登记，便于按「节拍→帧」核对卡点。
- `lineage`（可选）：`same_author`、`derived_from`、`evidence_role`（`primary` / `new_version` / `packaging` / `reference`）。V06／P09／V11 属于同一作者的同一 341 素材库，分别标记为原始来源、同源封装与同源新版本，**不把同一作者的新封装当作独立验证**；V12／V13 是同作者的两套不同 Skill。
- 校验：`timing` 需满足 `duration_seconds × fps ≈ frames`（±1 帧），有 BPM 时 `60 / bpm × fps ≈ beat_frames`（±0.25）；`lineage` 引用的来源必须存在且不能自指。工作台来源页显示谱系标签，模板详情显示证据状态、时间规格与来源谱系。

`kind` 区分参考、Prompt、工程；有工程路径不证明依赖和全部资产齐备。`validation` 指现有证据范围，与商用、可播放、可执行互不推导。用途标注为空表示没有确认，而不是适合全部用途。详情中未登记的参数与引擎均需回原文件核对。

## 使用

在仓库根目录：

```sh
npm ci --ignore-scripts
npm run catalog:check
npm run catalog:import
node tools/catalog/import.mjs --offline
npm test
```

导入按固定 ID 覆盖同一索引，重跑不追加重复条目。可加 `--check` 仅比较当前输出，不写文件；回归测试用这个模式检查普通重跑与 `--offline` 的一致性。CAP／Lemo 快照不存在时保留随仓库提供的索引；可照常校验、检索和导出，但媒体与原文件按本机实际存在状态显示。MG 的轻量列表是人工核对的固定清单；其余条目的工程路径代表上游示例，不代表本机可运行。

## 恢复缓存

本工具不自动下载、安装或运行上游内容。先核对来源、固定版本、许可与取得范围：

| 集合 | 恢复位置 | 来源说明 |
| --- | --- | --- |
| CAP | `docs/theory/_sources/code-animation-prompts/` | [P09](../docs/theory/extractions/projects/P09-code-animation-prompts.md)；固定 `69ccbeaf0b821591a40936572c2f559d8f4cfb68` |
| Lemo | `resources/lemo-opuscar/source/` | [快照说明](../resources/lemo-opuscar/README.md)；固定 `b5e8ef93930b6d828f352055a689320f138237b1` |
| MG | `resources/mg-styles-15/source/` | [P02](../docs/theory/extractions/projects/P02-mg-styles-15.md)、[快照说明](../resources/mg-styles-15/README.md)；固定 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` |

2026-11 清理前还有 4 条本地案例视频预览；案例工程与媒体已删除，知识摘要见 [cases](../docs/library/cases/README.md)。不再从 catalog 恢复这些媒体，也不要为缺失的旧预览制造占位文件。

恢复后重跑导入与校验。指纹不符时检查是否拿错 commit 或修改了输入，不删除锁来强行通过；有意升级应同时审阅差异、版本、许可和已保存方案。

## 许可

索引中引用的名称、短描述、标签和媒体继续受对应来源约束，不因根 MIT 而改变许可。CAP 不是统一 MIT，Lemo／MG 的工程许可也不统一覆盖声音、字体和其他素材。工作台仅在回环地址提供本机已有文件，不等于获得公开托管／再分发／商用授权；发布前仍要逐项检查。详见 [第三方说明](../THIRD-PARTY-NOTICES.md)。
