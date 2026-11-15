# VideoLab

> **产品方向更新（2026-11-13）**：建设“开源视频资源聚合 + 对话式需求理解 + 风格与 Workflow 路由”平台。根据主题、受众、时长与偏好选择并编排已有工具。架构、迁移顺序和验收见 [项目计划](PROJECT.md)。
>
> 使用 `npm run studio` 启动创作台。描述主题、受众和使用场景，先看 Agent 根据资源库提出的风格、片长和话稿。确认方案后制作预览，再导出成片。见 [本地创作台使用说明](docs/STUDIO.md)。

**VideoLab 将主题、受众和风格偏好整理成创作方案与制作 Prompt，交给 Agent 当场写代码并自选工具制作。**

HyperFrames、Anidoodle 等已收录工具供 Agent 选择。以下 CLI 用法适合需要编辑工程、导入旧任务或使用自己编码 Agent 的用户。

## 第一次使用

要求：Node.js 22+、本机 Chrome/Edge、ffmpeg；GitHub Release 资源可选。

```sh
git clone https://github.com/uestczhaoyan-gif/AI-VideoLab.git
cd AI-VideoLab
npm ci --ignore-scripts

# 资源库（约 2.1 GB；也可只取需要的）
npm run resources:fetch -- --dry-run
npm run resources:fetch
```

`resources/prompts/` 已随仓库提交（约 2.7 MB），即使不下载完整资源也能读到 LEMO/MG/shotcraft 的详细 Prompt。

## 制作流程

```sh
npm run make -- --topic "做一个非线性光学的视频"
```

它**不会生成固定模板视频**，只创建：

```text
projects/<日期>-<主题>/
  BRIEF.md          # 主题、时长、画幅、受众与边界
  RESOURCES.md      # 从资源库选出的视觉候选与 Prompt 路径
  AGENT_TASK.md     # 给 Agent 的完整任务契约
  video.json        # duration / fps / width / height
  project.json
```

然后把项目交给你的 Agent（任选其一）：

- 在 DSH / Codex / Claude Code / Pi 中打开本仓库，指向 `projects/<目录>/AGENT_TASK.md`
- Agent 读资源 Prompt，**从零写** `scene.html`（或自选本地工程），必须实现确定性 `window.render(t)`
- 不套用仓库里的固定 scene，不复制旧 recipe；每次都是新尝试

Agent 写完风格帧后：

```sh
npm run render:agent -- --project projects/<目录> --stage stills
```

看 `stills/` 与 `style-frames.jpg`，确认后：

```sh
npm run render:agent -- --project projects/<目录> --stage render
```

产物：`code-motion.mp4`、`storyboard.jpg`、`report.json`、`qa.json`。

`render:agent` 只抓帧/编码/机械检查，不写视频代码、不调用模型；内容、事实、观看与采用仍由用户和 Agent 负责。

## 只想要建议

```sh
npm run make -- --topic "做一个非线性光学的视频" --suggest
```

输出资源库视觉候选、Prompt 路径和用途建议，不建项目、不渲染。

## 资源库

`resources/` 是 2.1 GB 的参考库，不是固定执行器：

- `styles/`：51 个 LEMO 风格 + 15 个 MG 风格
- `prompt-libraries/`：341 条 CAP Prompt + fifi
- `engines/`：manim、hyperframes、anidoodle、onetake、video-shotcraft
- `skills/`、`workflows/`、`collections/`、`studies/`
- `prompts/`：已入库的可读 Prompt/STYLE/镜头卡文本
- `catalog/template-map.json` + `docs/library/TEMPLATE_MAP.md`：410 个模板 → Prompt 路径 → Workflow 对照

`resources/**/source/` 不进入 Git；用 `npm run resources:fetch` 或 Release ZIP 恢复。说明见 [resources/PACKS.md](resources/PACKS.md)。

## 仓库结构

```text
catalog/        410 条引用、38 来源、模板→Prompt→Workflow 映射
tools/agent/    Agent 任务生成 + 通用渲染/QA（不写固定视频代码）
tools/render/   通用 Chrome/ffmpeg 渲染工具
resources/      分类资源库 + 入库 Prompt 文本
shared/         项目契约、QA、资源推荐函数
docs/           Agent 交接、模板映射、Workflow、来源笔记
projects/       本机 Agent 任务与成片（Git 忽略）
```

## 验证

```sh
npm test
npm run catalog:check
npm run catalog:map:check
npm run integration:check
npm run docs:check
```

资源抽检：`npm run resources:audit`。

## 边界

- 不预置固定风格/模板；Agent 每次从零写代码，不保证与上次效果一致。
- `render:agent` 只支持本地 HTML + `window.render(t)`；Agent 也可以选择 Remotion/Manim 等自建工程，但需自己交付 mp4。
- 不调用付费模型/API；Agent 使用用户自己的密钥与服务。
- 不生成真人/短剧；不训练模型；不上传/发布素材。
- 资源仅作参考，许可见 [resources/AUDIT.md](resources/AUDIT.md)；`checked` 不代表已跑通。

## 文档

- [使用手册](docs/USAGE.md)
- [Agent 交接](docs/library/CREATE_VIDEO.md)
- [模板映射](docs/library/TEMPLATE_MAP.md)
- [资源恢复](resources/PACKS.md)
- [项目计划](PROJECT.md)
