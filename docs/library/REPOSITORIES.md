# 资源仓库索引

从 0.2 起，**不再维护第二份完整仓库清单**。唯一权威入口：

- [resources/README.md](../../resources/README.md)：分类目录、用途、许可与“source/ 不入库”规则。
- [resources/AUDIT.md](../../resources/AUDIT.md)：20 个本地仓库/索引的抽检结果（checked / partial / missing）与检查方式。
- [catalog/sources](../../catalog/README.md)：结构化来源记录（固定 commit、笔记路径、覆盖范围）。
- `catalog/integration.json`：资源访问等级（reference / prompt / install_required / index_only）与 recipe 路由。

## 已保存范围

所有仓库快照位于 `resources/<category>/<name>/source/`，被 Git 忽略；新机器按 [resources/README.md](../../resources/README.md) 的上游 URL 与固定版本恢复。抽检只证明目录、入口、README/SKILL/LICENSE 与“文档确实在讲视频制作”，**不证明安装、运行、效果或商用许可**。

## 未保存/不完整

- P06 Manim Community 文档、P07 Remotion 文档：官方文档页，未下载整站。
- P10 Ploto 文章：只保留结构化摘要。
- P12 Open Design：上游约 3.6 GB，只保存可读部分。
- 各仓库的依赖、模型权重、音源、字体、站外素材通常未取得，需按上游说明单独处理。
- P16 Onetake 为非商业许可，P22 video-shotcraft 的代码许可只覆盖代码；素材/字体/音效逐项核对。
