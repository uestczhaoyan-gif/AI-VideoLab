# PROJECT：VideoLab CLI 版

状态：**0.2 可发布初版。** 2026-11-10 按用户要求移除可视化工作台，改为 CLI 单入口：用户给主题 → 平台推荐视频类型 → 少量必要问答 → 直接生成视频。不提供网页预览；需要 Agent 辅助时，把仓库交给已有 Agent（Pi / Codex / Claude Code / DSH 等）打开。

## 1. 产品定义

一句话：**本地优先、可追溯、能直接出片的 AI 视频 CLI 平台。**

目标用户流程：

```text
npm run make
  → 输入一句话主题
  → 平台推荐类型/recipe 与资源路由（可改）
  → 询问 2–5 个真正影响方案的问题（时长/画幅/声音；数据或截图）
  → 生成 3 张风格帧（文件）
  → 用户确认
  → 渲染成片
  → 输出 mp4、联系表、QA、项目 JSON
```

不做：网页工作台、视频预览播放器、账号系统、云队列、公网生成 API、真人/短剧、模型训练。

## 2. 当前发布范围（0.2）

### 已有

- 三条本地可执行 recipe：`code-motion`、`explain-data`、`real-product`，共享项目契约与确认门。
- `code-motion` 已接入三个风格模板（blueprint / bauhaus / ink-wash），可用 `npm run make -- --style ...` 选择。
- `npm run make` 交互式 CLI：类型推荐、必要问答、风格帧、渲染、路径输出。
- `npm run cli`：把仓库交给已有 Agent 的启动入口（Pi 系统提示）。
- 410 条引用 / 38 条来源 / 3 条 recipe 的 catalog。
- 统一资源路由：`catalog/integration.json`、`npm run route`、`npm run integration:check`。
- 分类资源库：styles / prompt-libraries / engines / skills / workflows / collections，共 20 个仓库/索引、约 2.1 GB；`resources/prompts/` 入库约 2.7 MB 详实 Prompt 文本，`resources/MANIFEST.md` 固定版本，`resources/AUDIT.md` 抽检，`resources/PACKS.md` 记录 Git 之外的分发方式。
- 项目契约 v2：三处确认门、文档槽、8 项 QA；`not_checked` 不是通过。
- 测试：目录、契约、执行器、路由；最小闭环 `loop:smoke`。

### 不在本版

- 视频预览/网页选型/可视化编辑。
- 自动安装上游依赖或自动调用全部资源；只验证数据与入口，未安装的明确标注。
- 自动配音/BGM/字幕烧录；三条 recipe 目前使用点击音轨或静音画面。
- 自动质检多 Agent、自动剪辑、后台队列、对外 API。
- 模型/价格对比：当前只记录用户指定模型，不做能力或费用声明。

## 3. 用户流程与实现

### 3.1 交互次数

| 步骤 | 是否必问 | 默认 |
| --- | --- | --- |
| 主题 | 是（除非 `--topic`） | — |
| 类型/recipe | 可改 | 关键词推荐 |
| 时长 | 是 | 10 秒 |
| 画幅 | 是 | 16:9 |
| 数据/截图 | 仅对应 recipe | 示例数据/必须提供截图 |
| Brief 确认 | 是 | `--yes` 自动确认 |
| 风格帧确认 | 是 | `--yes` 自动确认 |

### 3.2 技术路径

- `tools/studio/create.mjs`：CLI 编排、问答、内容生成、调用执行器。
- `shared/planning.mjs`：项目构建、类型推荐、模板/recipe 候选。
- `shared/project.mjs`：确认门、QA、导出与校验。
- `recipes/<id>/run.mjs`：确定性渲染 + Chrome/ffmpeg + QA + 项目写回。
- `catalog/integration.mjs` / `route.mjs`：资源→recipe→执行器路由与验证。
- `resources/`：本地快照，`source/` 不入库；`AUDIT.md` 记录抽检。

## 4. 阶段与状态

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| 0 | 方向、清理、来源证据 | 完成 |
| 1 | catalog、来源笔记、Workflow | 完成；持续补充 |
| 2 | 三条本地执行器与 CLI 制作流程 | 完成 |
| 2.5 | 移除 Web 工作台，CLI-only 精简 | 完成（本版） |
| 3 | 资源库下载、分类、抽检、Release 打包/恢复 | 完成初版（20 个仓库/索引；`resources:fetch` / `resources:pack`） |
| 4 | 统一路由、资源访问等级、模板接入 | 完成初版（3 routes / 38 sources / 3 风格模板） |
| 5 | 质量与体验：更多 recipe、声音、自动 QA | 后续 |
| 6 | 对外发布/API/队列 | 不做或远期 |

## 5. 验证口径

- 代码：`npm test`（项目契约、catalog、执行器结构、路由）。
- 目录：`npm run catalog:check`。
- 整合：`npm run integration:check`（来源覆盖、路由、适配器文件、JSON 是否为最新）。
- 语法：`npm run recipe:check`。
- 文档：`npm run docs:check`。
- 真实制作：`npm run make -- --topic ... --yes`（会调用本机 Chrome/ffmpeg）。
- 抽检：`node tools/catalog/audit-resources.mjs` → `resources/AUDIT.md`。

## 6. 资源与许可

- 资源按类别放在 `resources/`，`source/` 被 Git 忽略；新机器按上游 URL 恢复。
- 抽检只证明“目录/入口/文档存在且相关”，不证明安装、运行、效果或商用许可。
- Apache/MIT 只覆盖代码；素材、字体、音效、品牌资产逐项核对。
- P16 Onetake 非商业；P12 Open Design 因体积过大只保存可读部分；P22 video-shotcraft 已下载完整源码但未安装。

## 7. 下一步（按优先级）

1. 让 `npm run make` 支持更多风格模板与 `--recipe` 强制选择，减少交互。
2. 为 explain-data 增加折线图/多图；为 real-product 支持录屏片段。
3. 增加配音/BGM 的本地可插拔路径（先文件，后 TTS）。
4. 把 `resources/AUDIT.md` 的“checked”逐项升级为“安装并跑通”的证据。
5. 如需发布：提交当前树、推送 GitHub、打 tag（步骤见交付说明）。

## 8. 决策记录

- 2026-11-10：用户要求删除所有可视化界面；保留视频制作资源与知识，改为 CLI-only。
- 2026-11-10：不引入平台内置模型/API；Agent 使用用户自己的密钥。
- 2026-11-10：资源分级而非“假装全部可执行”；`install_required/index_only/reference` 明确。
- 2026-11-09：新增 V14/P22/P23，建立统一整合层。
- 2026-11-08：三条本地执行器完成并实测。
- 2026-11-06：历史重写与 demo 清理（历史保留在本地备份中）。
