# 从资料收集到可选择的工作流

状态：本文保存流程知识与候选契约；已有 CLI 制作入口与三条本地执行器，当前是 CLI-only 0.2。当前方向与实际进度以 [PROJECT.md](../../PROJECT.md) 为准。开始新创作可直接使用 [CREATE_VIDEO.md](CREATE_VIDEO.md)，不必先导出网页方案。

## 当前工作：收集、分类、组合

```text
视频／项目线索
  → 确认准确来源与关联项目
  → 提取可访问的字幕、画面、文档、Prompt 与代码
  → 保存逐来源 MD，注明实际覆盖与缺失
  → 标注用途、形式、风格、技术、资源与成本
  → 链接相似方法、重复来源与矛盾
  → 组合候选流程与 Prompt
  → 有执行需求时选最小验证，回写具体结果
```

1. **登记来源。** 继续使用 Vxx／Pxx 编号，不重用旧 ID。视频和项目各有一份记录，相互关联；只有链接也能入库，标记 `lead`。
2. **提取实际内容。** 按 [来源模板](templates/SOURCE.md) 填方法、输入输出、步骤、参数、资产与作者声明。取得字幕、抽样帧、完整观看或源码阅读，分别记录；缺少正文时先保存元信息。
3. **收集公开附件。** 优先获取作者提供的完整 Prompt、Workflow JSON、工程与依赖说明。固定 commit／版本，保留素材获取入口与许可；私有文件记缺口，不自行补造。
4. **多维分类。** 对应 [METHODS.md](METHODS.md) 的多个标签，视觉参考进入 [STYLES.md](STYLES.md)。多个视频讲同一工程时保留各自笔记，用关联字段避免重复计为独立验证。
5. **形成候选 recipe。** 说明适用任务、前置条件、步骤、产物、工具调用方式与失败回退。来源只证明“这样介绍过”时，将 recipe 标为 `draft`。
6. **按需验证。** 只有要确定该路线是否能执行／迁移时，才选一个代表难点的短任务；无需把每个收藏都做成片。结果继续保存在案例目录，再回链来源和方法。

第一批 13 份笔记保持归档；新增来源另建批次或标记为待提取，不打开旧批次修改覆盖结论。批次按收到的材料或目标范围收尾，后续可以继续收录，不再以完成全部 demo 为前提。

## 制作时怎样组合步骤

| 步骤 | 主要工作 | 保存的输入／输出 | 条件与分支 |
| --- | --- | --- | --- |
| 1. Brief | 通过少量问答确定受众基础、传播目标、深度／公式、主题、长度范围、画幅、声音、素材与资源 | `BRIEF.md` 或已有结构化需求；缺项与假设 | 已有答案不重问；深度影响脚本与时长，默认复用当前助手和本机可用工具 |
| 2. 选路线 | 比较少量可满足表达目标的方法 | `WORKFLOW.md`，列选中路线与依据 | 根据资源、真实资产、可调用接口和预计总代价过滤 |
| 3. 解释／剧本 | 明确观众依次理解什么、因果机制或剧情怎样变化；专业讲解确定核心公式、符号与必要推导 | `SCRIPT.md`、事实／公式来源及假设 | 内容深度与风格分别决定；公式不能只作为装饰，需与图示和旁白对应 |
| 4. 定时间依据 | 选择旁白、音乐或动作事件作为主时基 | `TIMELINE.json` 与音频版本 | 口播先定稿配音；音乐片先分析实际乐句；无声音片由动作／阅读需要定时 |
| 5. 设计与素材 | 规划关键画面、主体变化、镜头和资产需求 | `DESIGN.md`、样帧、资产清单 | 确认最难的关系与动作能够表达，再批量制作 |
| 6. 生成 Prompt | 根据 Brief、方法、风格和运行约束生成分工输入 | `PROMPT.md` 与本轮任务输入 | 按 [PROMPTS.md](PROMPTS.md) 分层，不把全库文档塞进每次调用 |
| 7. 分段制作 | 代码绘制、真实素材处理或生成镜头 | 可编辑源码／Workflow、资产、候选输出 | 代码路线明确逐帧时间；生成路线保存引用图、实际输入与所采用片段 |
| 8. 预览与修改 | 检查信息、动作、接续、文字和声音 | 低成本预览、定位到时间点的问题 | 修对应层；参考图错、动作错、声音错分别处理 |
| 9. 总装导出 | 合成画面、旁白、字幕、音乐与音效 | 成片、工程、混音与导出记录 | 时间变化后同步所有依赖；纯音频修改可只换音轨 |
| 10. 检查归档 | 核对规格、内容、实际视听和费用 | `QA.md`、`EXPERIENCE.md`、调用记录 | 自动检查与完整观看分别记录；未验证项保留 |

这些是候选 recipe 的产物名称，不要求给所有现有案例改名或补空文件。已有 `cues.json`、`timing.json` 或项目原生时间表可直接采用，避免重复维护时间数据。

## 三条优先组合

| 组合 | 流程骨架 | 现有基础 | 状态 |
| --- | --- | --- | --- |
| A：代码动效 | Brief → 对象／变化链 → 关键帧 → 统一事件表 → 页面／场景代码 → 音画合成 → 检查 | 平面矢量、一笔画、等轴方法与共享工具 | 部分案例已有验证；统一自动路由尚未实现 |
| B：真实产品／讲解 | 真实素材 → 剧本／配音或音乐时基 → 镜头设计 → 录屏／代码包装 → 合成与字幕 | P01、P04、V05 文档 | 候选流程，尚未独立跑通完整链路 |
| C：角色／电影片段 | 剧本 → 角色／场景参考 → 身份绑定 → 分镜生成 → 选片与接续 → 声音字幕 → 剪辑 | V01 与 P04 的方法记录 | 缺部分公开输入、生成接口与成本实测 |

本地生成可作为 C 的具体实现，但需要先补齐官方模型、权重、节点版本、Workflow JSON、显存与实际耗时；不能只根据“免费／开源”标签自动选中。

## 控制低预算的方法

- 先用已有来源与可复用组件，规划和实现分别调用需要的资料；是否采用较贵模型解决困难步骤，由真实质量与预算决定。
- 在全片高质量制作前，验证难动作、关键构图和声音代表句。预览分辨率与采样按难点选择，不把降质预览的成本当作最终成本。
- 缓存已通过的素材、配音与片段；按输入版本记录依赖，修改时只重做受影响的步骤。
- 生成路线记录候选与失败次数，设每镜头尝试和总预算上限；遇到超限时转为已有资产、较简单表现或待人工选择。
- 没有准确模型 ID、接口、报价日期或硬件资料时，将费用留为 `unknown`；先完成方案与缺项说明，不把未知费用按零计算。

费用记录至少包含：文本模型调用、图像／视频生成、语音、外部素材、CPU／GPU 渲染时长、重试和人工时间。云费用写币种与总额；本地计算与人工可以单独记录时长，无需虚构货币换算。

## 后续界面的最小输入与执行契约

界面可以先提供：用途、主题、表现形式／风格、时长、画幅、语言、声音、已有素材、设备与预算。引擎、依赖和参数由内部路线处理；只有影响用户的成本、素材条件、预计等待或质量选择需要呈现。

以下 JSON 是**待实现的接口示例**，没有对应已完成的执行器，也不直接启动模型或渲染：

```json
{
  "recipe_id": "line-explainer-v0",
  "status": "draft",
  "brief": {
    "purpose": "education",
    "topic": "用户提供的主题",
    "duration_seconds": 30,
    "aspect_ratio": "16:9",
    "language": "zh-CN",
    "narration": false
  },
  "selection": {
    "method_ids": ["M01", "M02"],
    "style_ref": "lemo-opuscar/one-line",
    "style_revision": "b5e8ef93930b6d828f352055a689320f138237b1",
    "renderer": "browser"
  },
  "execution": {
    "text_provider": null,
    "text_model_id": null,
    "max_attempts_per_step": 2,
    "max_total_cost": null,
    "currency": null,
    "cost_status": "unknown",
    "paid_execution_ready": false
  },
  "references": ["docs/library/cases/deepseek-onetake.md"],
  "steps": ["brief", "design", "prompts", "assets_or_code", "preview", "render", "qa"],
  "outputs": ["prompt", "editable_project", "video", "qa", "cost_record"]
}
```

这里的风格引用只指定待读取的规范，不意味着任何案例已遵守另一项目的全部风格特征。实际复用哪些引擎、素材与叙事，生成任务时分别列明。

执行器将来需要：模型适配、方法到工具的映射、依赖检查、步骤状态、缓存与定向重试、费用统计和产物链接。当前先让资料与 recipe 能表达这些条件；只在有相应可执行实现时，把状态升级为可运行。

## 第二批资料对流程的补充

以下来自 2026-10-29 新来源，不是本项目已验证的新流水线：

| 可采用的组织方式 | 对应来源 | 接入条件与限制 |
| --- | --- | --- |
| 挑选主画风、运动与版式，再生成实际输入 | [P09](../theory/extractions/projects/P09-code-animation-prompts.md)、[V06](../theory/extractions/videos/V06-BV1bqx76wEUM.md) | 可利用离线选择器与 catalog；341 项不是完整工作流，声音与导出仍需明确 |
| 长片分六个确认节点 | [V08](../theory/extractions/videos/V08-BV1xFnt6zE3K.md)、[P10](../theory/extractions/projects/P10-ploto-long-video-workflow.md) | 立项、稿件、风格、关键帧、动画、成片；短片不强制套全套审批 |
| 按关键帧／片段依赖局部重渲 | P10 | 单帧改动影响相邻段，时间变化影响覆盖段与后续对齐；实际缓存实现尚未取得 |
| 导演、编码与检查分步调用 | [V09](../theory/extractions/videos/V09-BV1Gg3E6BEbn.md)、[P11](../theory/extractions/projects/P11-auto-motion.md) | 已取得核心脚本；当前 P11 为 HyperFrames，视频为 Remotion，需分别固定版本和实际模型配置 |
| 按任务／风格路由模型与 Skill | V09、[P12](../theory/extractions/projects/P12-open-design.md)、[路由草案](ROUTING.md) | 生产可多模型分工；测试某条 Skill 时固定模型和其他条件，不能将示意分数当实测 |
| API 标价、订阅分摊、人时与渲染分开 | V06、V08、P10 | 不把作者的 1 元或订阅估算当作任意任务的费用保证 |

当前已补查相关工程，下载与许可边界见 [REPOSITORIES.md](REPOSITORIES.md)。推进顺序为“整理少量候选组合 → 选择代表难点做短对照 → 回写路由与回退 → 有真实需求时制作”，不逐个风格重做完整 demo。多模型的具体职责、风格适配记录和验证顺序见 [ROUTING.md](ROUTING.md)；不自动安装所有 Skill，不将资料充足等同于可无人值守执行。

## 第三批资料对流程的补充

2026-11-06 的四条视频（V10–V13，见 [BATCH_03_INTAKE](../theory/BATCH_03_INTAKE.md)）给出一套可检查的流程骨架，已进入项目契约与 CLI 流程：

| 机制 | 对应来源 | 落地位置与边界 |
| --- | --- | --- |
| 三处人工确认：需求 / 风格帧 / 导出前 | V12（三处停点）、V13（两检查点 + 首章基准） | 项目 `gates`（pending / confirmed / waived，确认需写依据）；CLI 只记录用户确认，不代签 |
| Brief、口播稿、大纲／分镜、来源四类文档 | V12 Brief 模板、V13 的 Outline 与按阶段分发 | 项目 `documents`；允许显式 null，路径统一校验 |
| 单一时间表驱动画面、口播、配乐、音效 | V10（BPM→帧）、V12（同一张时间表） | recipe 的时基要求；`catalog.sources[].timing` 可记录已公布规格 |
| 确定性 `render(t)` + 逐帧截图 + 编码 | V12、V13 的网页方案 | 渲染后端选项，不合并录屏式与逐帧式两条路线 |
| QA 材料化与 NOT CHECKED | V12 的抽帧／文字框景／波形／硬指标；V13 的自检清单 | 项目 `records.checks` 六类检查；`not_checked` 不算通过，delivered 会被拒绝 |
| 独立 Reviewer / 多 Agent 隔离 | V12 独立审片、V13 章目录与 CSS 前缀隔离 | 后续能力；先做可脚本化的 QA 材料与人工终审 |

## 最小真实闭环（2026-11-06）

`npm run loop:smoke` 用一条 8 秒、完全本地、零付费调用的确定性代码动画，把「Brief → 大纲 → 渲染 → 编码 → QA → 项目记录」跑通一遍。它不是风格 demo，也不证明成片质量，只验证契约字段、确认门与 QA 规则在本机可用。

实测结果（本机 Chrome + imageio-ffmpeg）：240 帧全部唯一；输出 8.000 s / 1280×720 / 30 fps / H.264 + AAC；对 t=0、2.5、5 三个时刻重复渲染，两处字节一致、一处 PSNR 112.55 dB（亚像素字形差异）；项目记录到 v13，`brief`／`style_frame` 两处确认门已确认并带依据，`export` 保持待确认；QA 为 3 passed（规格、解码、视觉抽检）／2 waived（无对白时基、无事实内容）／3 not_checked（主观声音、完整观看、用户采用），状态保持 `draft`。细节与复现命令见 [tools/loop/README.md](../../tools/loop/README.md)。

## 第一条可执行 recipe：code-motion（2026-11-06）

catalog 顺序第一的 `code-motion` 已从草案变为**本地可执行（半自动）**，适配器 `recipes/code-motion/run.mjs`。流程固定为「Brief 门 → 风格帧门 → 全片渲染 → 编码 → 机械 QA → 新项目版本（export 门仍待确认）」：

```text
examples/code-motion/make-project.mjs        生成项目（三个确认门均 pending）
tools/project/cli.mjs gate --id brief         人确认 Brief（必须写依据）
recipes/code-motion/run.mjs --stage stills    出三张风格帧 + 联系表（不自动确认）
tools/project/cli.mjs gate --id style_frame   人确认风格帧
recipes/code-motion/run.mjs --stage render    全片渲染、编码、QA、写回项目
```

- **导演内容**由当前 CLI 模型（用户指定的 DeepSeek V4.1 Flash，未核实官方 ID／价格）写成 brief 与 `content.json`；执行器**不调用模型 API**，只做确定性 `render(t)` 逐帧、ffmpeg 编码与机械检查。
- **2026-11-06 实测**：示例 10.0 秒／1280×720／30 fps／300 帧全唯一／H.264+AAC；brief 与 style_frame 两门确认，export 待确认；QA 3 passed（规格、解码、视觉抽检）／1 waived（无对白时基）／4 not_checked（内容、主观声音、完整观看、用户采用），项目 `draft`。产物在 `.tmp/recipe-runs/example-code-motion/`。
- **边界**：只覆盖文字／图形卡点短动效；没有生成式素材、角色、真人、字幕对齐、配音、BGM、自动剪辑、后台队列或发布。风格帧与成片仍要人看；内容事实与声音仍要人核对。
- 示例与命令见 [examples/code-motion](../../examples/code-motion/README.md)，适配器说明见 [recipes/code-motion](../../recipes/code-motion/README.md)。
