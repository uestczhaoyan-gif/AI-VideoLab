# VideoLab AI 交接

## 先读什么

1. `PROJECT.md`：当前范围、阶段、验证口径与下一步。
2. `README.md`：CLI 快速开始与三条 recipe。
3. `docs/library/INTEGRATION.md`：资源访问等级、路由与不夸大边界。
4. 按任务读取 `docs/library/VIDEO_WORKFLOWS.md`（视频→Workflow）、`docs/theory/extractions/`（逐来源证据）、`resources/README.md` 与 `resources/AUDIT.md`。

用户最新明确要求优先。`PROJECT.md` 是唯一当前计划，不另建平行总计划。

## 当前方向（2026-11-10）

**CLI-only、可发布初版。** 用户不打开网页，只运行 CLI：给主题，平台推荐类型，问少量必要信息，直接出片。不提供视频预览；最多把风格帧/成片路径打印出来。需要 Agent 时，把仓库交给已有 Pi / Codex / Claude Code / DSH，使用用户自己的 API 密钥。

- 保留：三条本地 recipe、项目契约、catalog、资源库、Workflow/来源笔记、路由层。
- 不做：Web 工作台、视频预览 UI、账号/队列/公网 API、真人短剧、模型训练。
- 不把“资源已下载/文档存在”说成“已能生成”；`resources/AUDIT.md` 的等级必须原样保留。

## 资料分层与执行边界

| 位置 | 是什么 | 能不能当执行能力 |
| --- | --- | --- |
| `catalog/` | 410 条引用、38 来源、3 条 recipe、integration registry | 否；条目数不是可执行路线数 |
| `recipes/` | code-motion / explain-data / real-product 本地执行器 | 有限；各自 README 的 limits 为准 |
| `examples/` | 可跑通输入示例与项目生成脚本 | 输入参考，不等于成片验收 |
| `resources/` | 分类资源库（styles/prompt-libraries/engines/skills/workflows/collections） | 否；`source/` Git 忽略，许可与安装状态见 AUDIT |
| `docs/library/` | Workflow、路由、方法、案例知识 | 否；人工可读知识层 |
| `docs/theory/` | Vxx/Pxx 逐来源笔记 | 否；证据不等于验证 |
| `projects/` | CLI 生成的项目与成片 | 本地输出，Git 忽略 |

## 关键规则

- 开始先看 `git status --short`，保留用户未提交改动；不重置、不删除用户文件。
- 视频制作统一走 `npm run make`；不要重新引入网页 UI 或浏览器前端。
- 模板是视觉语言，不是主题分类器：主题没有同名模板时，用最接近的风格 + 主题内容继续，不要停下反问“用哪个模板”；可先 `npm run make -- --topic "..." --suggest`。
- `npm run cli` 只加载系统提示，用户没说明需求时先问，不能自动开始。
- 三条执行器都必须先确认 Brief 再出风格帧、确认风格帧再渲染；`not_checked` 不是通过。
- 不调用付费模型/API、不登录账号、不上传/发布素材，除非用户明确授权。
- 资源只从固定版本恢复；不把 `resources/**/source/` 提交到 Git，不用 `git add -f`。
- 推荐模型/资源前核对 provider、model_id、许可与日期；未知价格不按零算。
- 资源抽检只证明入口/文档存在；不得把 AUDIT 的 checked 写成“已跑通”。

## 常用入口

- 制作：`npm run make -- --topic "..."`；非交互 `--yes`。
- Agent 交接：`npm run cli`，或让 Agent 读 `docs/library/CREATE_VIDEO.md`。
- 目录：`npm run catalog:check`；路由：`npm run integration:check`、`npm run route -- --topic "..."`。
- 语法：`npm run recipe:check`；测试：`npm test`；文档：`npm run docs:check`。
- 资源抽检：`node tools/catalog/audit-resources.mjs`。
- 最小闭环：`npm run loop:smoke`。

完成每个阶段后更新 `PROJECT.md` 的实际产物、验证与未验证项；细节留在对应 README/来源/审计文件，不新建平行总计划。
