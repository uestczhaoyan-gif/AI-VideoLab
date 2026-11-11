# VideoLab 使用手册（CLI 版）

适用于 0.2 CLI-only 版本。没有网页界面，没有视频预览；所有输入在终端，所有产物是文件。

## 1. 安装

要求：

- Node.js 22+（本机验证 24）
- 本机已安装 Chrome 或 Edge（可用 `VIDEOLAB_BROWSER` 指定路径）
- ffmpeg（可用 `FFMPEG` 指定；也支持 imageio-ffmpeg 自带二进制）

```sh
npm ci --ignore-scripts
npm run catalog:check
npm test
```

## 2. 制作一条视频

```sh
npm run make -- --topic "用三个指标解释缓存为什么快"
```

终端会依次：

1. 推荐视频类型与 recipe（知识讲解/产品介绍/数据解释/短动效），可回车接受或改用途。
2. 问时长（默认 10 秒）与画幅（默认 16:9）。
3. 按 recipe 问必要信息：
   - `code-motion`：主标题、副标题（回车用默认）。
   - `explain-data`：数据点/单位/来源；也可用 `--data data.json`。
   - `real-product`：真实截图文件夹（2–6 张 PNG/JPG）。
4. 打印 Brief 摘要；确认后生成 3 张风格帧，打印 `style-frames.jpg` 路径。
5. 确认风格帧后渲染成片，打印 mp4、联系表、QA、项目版本路径。

产物在 `projects/<日期>-<主题>/`，不进入 Git。

### 非交互

```sh
npm run make -- --topic "一段片头动效" --yes
npm run make -- --topic "三个指标解释缓存" --data data.json --yes
npm run make -- --topic "产品演示" --screens ./screenshots --yes
```

`--yes` 会自动确认 Brief 与风格帧（记录为 CLI 非交互确认），适合脚本与演示；正式交付前仍应人工看片。

## 3. 三条 recipe 的输入

### code-motion

无需额外文件；平台根据主题/受众/目标生成标题、副标题与三张步骤卡。内容可由 CLI 模型或用户改写后再跑。

可选风格模板（`--style`）：`blueprint`（技术蓝图）、`bauhaus`（包豪斯几何）、`ink-wash`（水墨）；不传则用通用模板。

```sh
npm run make -- --topic "透镜如何改写一束光" --style blueprint --duration 20 --yes
```

模板复刻 Prompt 见 `recipes/code-motion/styles/README.md`。

### explain-data

`data.json` 最小格式：

```json
{
  "unit": "%",
  "source": "示例数据，不是真实统计",
  "bars": [
    { "label": "命中", "value": 82 },
    { "label": "未命中", "value": 18 }
  ]
}
```

- 2–6 条；`value` 非负；`source` 必填。
- 示例数据必须写“示例数据”；真实统计由用户核对，执行器不验证真实性。
- 输出固定横向条形图，不支持折线图/多图联动。

### real-product

- 一个文件夹，2–6 张 `.png/.jpg/.jpeg` 真实截图。
- 不生成 UI、不录屏；不验证截图中的产品功能是否真实。
- 截图会复制到项目 `assets/`，源文件不动；版权与再分发由用户负责。

## 4. 产物与项目契约

每个项目目录包含：

- `code-motion.mp4` / `explain-data.mp4` / `real-product.mp4`
- `style-frames.jpg`、`stills/`、`storyboard.jpg`
- `qa.json`、`brief.md`、`outline.md`、`content.json`
- `project.json`、`project-brief.json`、`project-style.json`、`project-vN.json/.md`

三处确认门：Brief、风格帧、导出。CLI 只确认前两处；`export` 保持 pending。QA 8 项里，规格/解码/视觉抽检可 `passed`，内容/主观声音/完整观看/用户采用保持 `not_checked`——脚本不会替人通过。

## 5. 让已有 Agent 接手

```sh
npm run cli
```

- 用已安装的 Pi 加载 `docs/library/CREATE_VIDEO.md`（系统提示），等用户说明需求后再开始。
- 也可把仓库交给 Codex、Claude Code、DSH 等：让 Agent 先读 `AGENTS.md`、`PROJECT.md`、`docs/library/CREATE_VIDEO.md`。
- 平台不提供模型/API 密钥；Agent 使用用户自己的服务与密钥。

## 6. 资源与路由

```sh
npm run route -- --topic "产品功能演示" --purpose product
npm run integration:check
```

- `catalog/`：410 条引用、38 来源、3 条可执行 recipe。
- `catalog/integration.json`：资源访问等级与 route 映射。
- `resources/`：分类快照（`source/` 约 2.1 GB，不入库）；`resources/AUDIT.md` 记录抽检状态，checked ≠ 已跑通。
- 资源恢复：`npm run resources:fetch`；按分类打 Release 包：`npm run resources:pack`；详细 Prompt 路径见 `resources/PROMPTS.md`。
- `docs/library/VIDEO_WORKFLOWS.md`：按视频整理的 Workflow 总表（14 条）。
- `docs/library/INTEGRATION.md`：统一规范与路由说明。

## 7. 排错

| 现象 | 处理 |
| --- | --- |
| 找不到 Chrome/Edge | 设置 `VIDEOLAB_BROWSER` 为本机浏览器 exe |
| 找不到 ffmpeg | 设置 `FFMPEG` 为 ffmpeg.exe；或安装 imageio-ffmpeg |
| 渲染很久 | 时长越长帧越多；1080p 更慢；先用 5–10 秒验证 |
| 数据被拒绝 | 检查 2–6 条 bars、value 非负、source 非空 |
| 截图被拒绝 | 检查 2–6 张、PNG/JPG、单图 <3 MiB、总 <8 MiB、位于工作区内 |
| 项目版本找不到 | 看 `projects/<目录>/project-vN.json`，以最高版本为准 |

## 8. 验证

```sh
npm test
npm run catalog:check
npm run integration:check
npm run catalog:map:check
npm run recipe:check
npm run docs:check
npm run resources:audit
npm run loop:smoke
```

`loop:smoke` 是 8 秒本地闭环；`npm run make -- --yes` 是真实制作。

## 9. 已知边界

- 只有三条 recipe 可本地出片；其他资源需安装/人工使用。
- 无网页 UI、无视频预览、无后台队列、无对外 API。
- 无自动配音/BGM/字幕烧录；需要时先用外部工具生成文件，再作为后续扩展。
- 资源许可逐项核对；Apache/MIT 不自动覆盖素材、字体、音效与品牌资产。
