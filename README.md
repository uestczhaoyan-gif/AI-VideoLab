# VideoLab

**按你想要的模型、风格、主题与时长，极简高质量地生成 AI 视频的本地优先工作台。**

整合分散的 AI 视频流程、模板、Prompt 与开源工具，提供 **CLI 对话制作 + Web 浏览选型** 两种入口，共用 catalog 与制作资料。当前重心是把工作台完整搭起来，并持续丰富资源库与 Workflow（「合百家之长」），暂不做真人／短剧类视频。

**当前主说明：[PROJECT.md](PROJECT.md)**。模型、费用、可执行性与许可的真实状态以它和各来源笔记为准；仓库里的条目数不代表可直接生成。

## 快速开始

要求 Node.js 22+。首次缺依赖时安装：

```sh
npm ci --ignore-scripts
```

### 方式一：CLI 对话制作（推荐）

```sh
npm run cli
```

启动已安装的 Pi，并把 [制作启动任务](docs/library/CREATE_VIDEO.md) 带入首轮对话；沿用 Pi 已有模型配置，不另建模型客户端。启动后说明主题，助手用 1–3 轮短问答补齐受众、深度／公式、规格与资源，再按现有工具制作。

### 方式二：Web 浏览与选型（可选）

```sh
npm run web
```

打开 <http://127.0.0.1:4317>，可检索 catalog、查看参考预览、收藏／比较、填写制作需求并导出引用型任务包。制作方案页会显示三处人工确认门与 QA 清单；来源页显示固定版本与谱系。当前网页不执行制片、不调用模型；原 `npm run dev` 保留兼容。

### 方式三：本地最小闭环（验证用）

```sh
npm run loop:smoke
```

用一条 8 秒、完全本地、零付费调用的确定性代码动画跑一遍「Brief → 渲染 → 编码 → QA → 项目记录」，需要本机 Chrome／Edge 与 ffmpeg。它不是风格 demo，只验证项目契约在本机可用；详见 [tools/loop](tools/loop/README.md)。

## 仓库里有什么

| 位置 | 内容 |
| --- | --- |
| [PROJECT.md](PROJECT.md) | 愿景、阶段、验收与下一步的唯一主说明 |
| [docs/library/](docs/library/README.md) | 方法、风格、来源、流程、Prompt 与 [案例知识](docs/library/cases/README.md) |
| [docs/theory/](docs/theory/README.md) | Vxx／Pxx 逐来源证据、读取范围与缺口 |
| [catalog/](catalog/README.md) | 408 条引用条目：来源、模板／Prompt、3 条 recipe 草案与校验 |
| [apps/workbench/](apps/workbench/README.md) | 本地只读工作台：检索、预览、比较、方案与任务包 |
| [resources/](resources/README.md) | 上游开源快照（lemo-opuscar、mg-styles-15、anatomy；`source/` 不随仓库发布） |
| [tools/intake/](tools/intake/README.md) | 视频来源采集：公开元数据、低清抽帧、本地语音转写 |
| [tools/loop/](tools/loop/README.md) | 本地最小闭环：确定性渲染 → 编码 → QA → 项目记录 |
| [shared/project.schema.json](shared/project.schema.json) | 项目契约：brief／确认门／文档槽／QA 清单 |
| [docs/USAGE.md](docs/USAGE.md) | 使用手册：启动、检索预览、保存导出、资料恢复与排错 |
| [tests/](tests/) | catalog、服务、归档、项目契约与浏览器回归 |

2026-11 清理：VideoLab 自己做的逐风格 demo 复现与 DeepseekDemo 已按用户要求删除；总结的设计、方法、检查数字与用户反馈保留在 [案例库](docs/library/cases/README.md)，上游资料在 `resources/`。不再自动逐风格做 demo。

## 状态与边界

- 阶段 0／1／2 首版已落地；CLI 已有本机白板讲解片的制作与返修记录。项目契约（三处确认门、文档槽、QA 清单）、catalog 时间规格／谱系字段与本地最小闭环已落地；统一执行适配、双档模型实测与生成 API 尚未完成。
- 没有后台任务队列、生成 API 或已验证的模型路由；工作台是本地只读服务，只认已登记文件。
- 不把参考预览、Prompt 收录或技术检查当作成片质量；未知价格不按零计算。`NOT CHECKED` 不算通过。
- 模型推荐前必须核对 provider／model_id、接口能力、许可与日期；新增付费调用、外发素材与发布按用户实际授权执行。

开发回归：`npm run catalog:check`、`npm test`、`npm run docs:check`；界面改动另跑 `npm run test:ui`，契约改动另跑 `npm run loop:smoke`（均使用已安装浏览器与 ffmpeg，不自动下载）。

## 参与与许可

见 [CONTRIBUTING.md](CONTRIBUTING.md)、[SECURITY.md](SECURITY.md)、[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)、[LICENSE](LICENSE) 与[第三方边界](THIRD-PARTY-NOTICES.md)。上游缓存、环境、原始采集与个人项目不随仓库发布；完整来源与获取范围保留在对应笔记。
