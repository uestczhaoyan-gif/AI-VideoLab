# 参与与复现

当前产品方向、阶段和 AI 交接见 [PROJECT.md](PROJECT.md) 与 [AGENTS.md](AGENTS.md)。项目以整合已有流程、模板与模型经验、逐步搭建本地工作台为主；资料入口是 [方法库](docs/library/README.md)，逐来源记录按 [来源模板](docs/library/templates/SOURCE.md) 标明版本、许可、读取范围和缺口。

项目按用途、形式、风格与技术分别分类。2026-11 清理后，VideoLab 自己做的逐风格 demo 复现工程不再保留，总结知识在 [案例库](docs/library/cases/README.md)；上游快照在 [resources/](resources/README.md)。**不再默认逐个风格重做 demo**，除非有具体任务与验收理由。结构化 catalog 引用已有文档与代码，不重复复制正文。候选模型、已有预览和可执行适配分开记录。具体开发与验证按主计划，不以先完成所有复现为条件。

明确选择开展新的视频实验时，按以下顺序记录：

1. 固定上游提交、Prompt、资产和许可证，说明本次实验的版本。
2. 先做能播放的样片或关键帧，再对照关键画面与时间。
3. 根据成片、Prompt 与最终代码拆解设计和实现，区分观察事实与解释。
4. 新概念拓展单独保存输入、源码和输出；失败版本也保留。原版通过不代表拓展成功。
5. 把结果与用户反馈总结进 [案例库](docs/library/cases/README.md)（或对应来源笔记），而不是长期保留一次性工程。

不提交 `.venv/`、`node_modules/`、渲染帧、临时浏览器数据、访问凭据与上游源码缓存。保留案例成片、必要源文件、运行说明和授权信息；大型原始输入注明来源及获取方法。

## 开发检查

结构化目录见 [catalog/README.md](catalog/README.md)，本地应用见 [工作台说明](apps/workbench/README.md)，项目契约见 `shared/project.schema.json`。在根目录运行 `npm run catalog:check`、`npm test`、`npm run docs:check`；涉及界面时用已安装浏览器运行 `npm run test:ui`；涉及项目契约或 QA 时运行 `npm run loop:smoke`（需要浏览器与 ffmpeg）。不自动下载浏览器或全局安装 Skill。

修改项目契约时：先改 `shared/project.schema.json`，再运行 `npm run project:schema` 重新生成 `shared/project-validator.mjs`（CI 会用 `--check` 验证是否为最新）；不要手改生成文件。QA 状态里 `not_checked` 不是通过；确认门必须写依据。

不要直接修改生成的 `catalog/catalog.json` 后又被导入覆盖；修改负责该数据的上游固定快照／人工清单，审阅版本与许可，再重跑导入。更新模板／recipe 时保留稳定 ID 并变更相应 revision，已保存方案不静默换版。上游原文、媒体和源码不因加入索引而获准公开分发。

提交记录说明环境、输入和实际生成的内容。不要把直接运行上游源码描述成独立创作，也不要把 SSIM 等像素指标写成审美评分。用户对某一成片的评价仅适用于该成片。
