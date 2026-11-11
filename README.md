# VideoLab

**本地优先的 CLI AI 视频制作平台：给一句想法，平台推荐视频类型、问几个必要问题，然后直接出片。**

不提供网页工作台，不提供视频预览。风格帧、成片、项目记录都写成文件路径；需要 Agent 辅助时，把仓库交给 Pi、Codex、Claude Code、DSH 等已有 Agent 打开即可，不需要平台再提供模型 API。

## 快速开始

要求：Node.js 22+、本机已安装 Chrome 或 Edge、ffmpeg（`FFMPEG` 可指定路径；也支持 imageio-ffmpeg）。首次安装：

```sh
npm ci --ignore-scripts
npm run catalog:check
npm run resources:fetch -- --dry-run   # 先看会下载什么（约 2.1 GB）
npm run resources:fetch                # 首次：按固定 commit 恢复全部开源资源
```

`resources:fetch` 是下载仓库后必须配套执行的脚本；它从上游恢复 19 个仓库/索引到 `resources/**/source/`（P12 默认跳过）。只想要 Prompt/风格可先：

```sh
npm run resources:fetch -- --only P09,P02,LEMO
```

不想逐仓库下载时，下载 Release 里的分类 ZIP 解压到 `resources/` 即可。完整说明见 [resources/PACKS.md](resources/PACKS.md)。

制作一条视频：

```sh
npm run make -- --topic "用三个指标解释缓存为什么快"
```

交互流程只有几步：

1. 平台按主题推荐类型与 recipe（知识讲解/产品介绍/数据解释/短动效），可改。
2. 询问时长、画幅；数据解释会要数据点/单位/来源，产品片会要真实截图文件夹。
3. 生成 3 张风格帧并打印路径；确认后渲染成片。
4. 终端打印 mp4、联系表、QA 与项目版本路径。

非交互/演示：

```sh
npm run make -- --topic "一段片头动效" --yes
npm run make -- --topic "三个指标解释缓存" --data data.json --yes
npm run make -- --topic "产品演示" --screens ./screenshots --yes
```

产物在 `projects/<日期>-<主题>/`（已被 Git 忽略）。不调用模型 API，不联网生成，不上传。

## 三条本地 recipe

| recipe | 输入 | 输出 | 边界 |
| --- | --- | --- | --- |
| `code-motion` | 主题、时长、画幅；平台生成文案与三张卡 | 文字/图形卡点动效 | 不做生成式素材、角色、真人 |
| `explain-data` | 主题 + 2–6 条数据、单位、来源 | 固定横向条形图数据解释 | 不验证数据真实性；示例数据必须标注 |
| `real-product` | 主题 + 2–6 张真实截图 | 截图包装产品片 | 不生成 UI、不录屏、不验证产品事实 |

每条都走同一项目契约：Brief 确认 → 风格帧确认 → 渲染 → 机械 QA（内容/主观声音/完整观看/采用永远保留给人）。

> 这里的“三条”指三种**可执行渲染器**，不是资源库只有三个模板。资源库有 51 个 LEMO 风格、15 个 MG 风格、341 条 CAP Prompt、125 张镜头卡等；已把其中 3 个风格模板真正接进 `code-motion` 的执行链，见下文 Demo。其余资源可通过 Agent 读取/改写，或按 `resources/PROMPTS.md` 使用。

## 三个可执行风格模板

`code-motion` 已接入 3 个风格模板（可执行渲染，不是只写文档）：

| CLI 风格 | 来源 | 适合 |
| --- | --- | --- |
| `blueprint` | LEMO `blueprint` | 光路、结构、工程解释 |
| `bauhaus` | MG `09-bauhaus` | 概念、对比、几何/色彩 |
| `ink-wash` | LEMO `ink-wash` | 波/场、时间、东方视觉 |

```sh
npm run make -- --topic "透镜如何改写一束光" --style blueprint --duration 20 --yes
```

模板在 `recipes/code-motion/styles/`，是按上游视觉语言改写的确定性 HTML，不是直接运行上游工程。模板 → Prompt → Workflow 的对应见 [TEMPLATE_MAP](docs/library/TEMPLATE_MAP.md)。

## 让已有 Agent 接手

```sh
npm run cli
```

用已安装的 Pi 加载 `docs/library/CREATE_VIDEO.md`（系统提示），等用户说明需求后再开始；也可把整个仓库交给 DSH、Codex、Claude Code 等 Agent，让它读 [AGENTS.md](AGENTS.md) 与 [CREATE_VIDEO.md](docs/library/CREATE_VIDEO.md)。Agent 使用你自己的 API 密钥，平台不代管密钥。

## 仓库结构

```text
catalog/         410 条引用、38 条来源、3 条可执行 recipe、统一整合 registry
recipes/         三个本地执行器（code-motion / explain-data / real-product）
examples/        可跑通的输入示例
shared/          项目契约、QA、规划与路由函数
resources/       分类资源库（styles / prompt-libraries / engines / skills / workflows / collections）
docs/            来源笔记、Workflow、整合规范与使用手册
tools/           CLI studio、catalog 校验、路由、资源抽检、渲染与最小闭环
projects/        本机生成的项目与成片（Git 忽略）
```

资源共 20 个仓库/索引、约 2.1 GB；详细 Prompt 的读取路径见 [resources/PROMPTS.md](resources/PROMPTS.md)。GitHub 普通仓库放不下，所以 `source/` 不进 Git：用 `npm run resources:fetch` 从固定版本恢复，或下载 Release 里的分类 ZIP（见 [resources/PACKS.md](resources/PACKS.md)）。仓库内提交 [resources/MANIFEST.md](resources/MANIFEST.md)、[resources/README.md](resources/README.md) 与 [resources/AUDIT.md](resources/AUDIT.md)，用户拿到的是可恢复的完整资源，不是空 Workflow。视频 Workflow 总表在 [docs/library/VIDEO_WORKFLOWS.md](docs/library/VIDEO_WORKFLOWS.md)，统一路由规范在 [docs/library/INTEGRATION.md](docs/library/INTEGRATION.md)。

## 验证

```sh
npm test                 # 目录、契约、执行器、路由
npm run catalog:check
npm run integration:check
npm run catalog:map:check
npm run recipe:check
npm run docs:check
npm run resources:audit
```

`npm run loop:smoke` 会跑一次 8 秒本地最小闭环；`npm run make -- --yes` 是真制作，不是 demo。

## 边界

- 除三条 recipe 与三个已接入的风格模板外，其余上游资源只作参考/待安装；`resources/AUDIT.md` 的 checked 不等于已安装、已运行或效果已验证。
- 只有三条本地 recipe 能直接出片；其他引擎/仓库需要安装、许可核对与人工确认。
- 不生成真人/短剧，不训练模型，不提供公网生成 API。
- 许可：代码与内容许可见各上游 LICENSE；Apache/MIT 不自动覆盖素材、字体、音效与品牌资产。

## 文档

- [使用手册](docs/USAGE.md)
- [项目计划](PROJECT.md)
- [AI 交接](AGENTS.md)
- [贡献指南](CONTRIBUTING.md)
- [上传到 GitHub](docs/UPLOAD.md)
- [安全](SECURITY.md)
