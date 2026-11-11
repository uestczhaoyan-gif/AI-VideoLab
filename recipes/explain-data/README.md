# explain-data：科普与数据解释（本地半自动执行器）

catalog 中 `explain-data` recipe 的本地执行器：导演（当前 CLI 模型）写 brief 与 `content.json`，本执行器用确定性 `render(t)` 页面 + Chrome/Edge 逐帧截图 + ffmpeg 编码，产出 H.264 + AAC 的数据解释短片和机械 QA 证据。内容、主观声音、完整观看与用户采用仍由人负责。

这是仓库第二条**本地可执行** recipe；`catalog.json` 中 `explain-data` 的状态与 `runnable` 标记由维护者单独接线（本目录不修改 catalog）。

## 流程

```text
Brief（人确认） → 3 张风格帧（人确认） → 全片渲染 → 编码 → QA → 新项目版本（export 门仍待确认）
```

1. 用工作台或 `examples/explain-data/make-project.mjs` 生成项目 JSON（确认门均为 pending，`selection.recipe_id = explain-data`）。
2. 导演写 `content.json`（标题／副标题／图表／单位／来源／结尾 takeaway／时长／帧率），并让 `content.duration`、`content.fps` 与项目 brief 一致。
3. 确认 Brief 门（必须写依据）：
   ```sh
   node tools/project/cli.mjs gate --from <项目.json> --id brief --basis "已核对受众、规格与数据边界" --out <项目-brief.json>
   ```
4. 出风格帧并查看（brief 门未确认会直接失败）：
   ```sh
   node recipes/explain-data/run.mjs --project <项目-brief.json> --content examples/explain-data/content.json --stage stills
   ```
5. 看 `stills/still-1..3.png` 与 `style-frames.jpg`（开场／中段／结尾要点），确认后写 style_frame 门：
   ```sh
   node tools/project/cli.mjs gate --from <项目-brief.json> --id style_frame --basis "已查看风格帧" --out <项目-style.json>
   ```
6. 全片渲染（缺任一确认门会失败）：
   ```sh
   node recipes/explain-data/run.mjs --project <项目-style.json> --content examples/explain-data/content.json --stage render
   ```
7. 产物默认在 `.tmp/explain-data/<project_id>/`：`explain-data.mp4`、`frames/`、`storyboard.jpg`、`qa.json`、`content.json`、`brief.md`、`outline.md`、`project-vN.json/.md`、`report.json`；`export` 门保持待确认。

## content.json 字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` / `subtitle` | 是 | 标题与副标题；副标题说清这张图回答什么问题 |
| `kicker` | 否 | 左上角小字，默认 `VIDEOLAB / EXPLAIN-DATA` |
| `data_kind` | 是 | `example`（示例数据）或 `real`（真实数据声明） |
| `chart.title` / `chart.unit` / `chart.max` | 是 | 图表标题、单位（不能为空）、坐标上限（> 0） |
| `chart.bars` | 是 | 2–6 条：`label`、`value`（非负数字）、可选 `note`；`value ≤ max` |
| `source` | 是 | 来源／口径脚注；`data_kind=example` 时必须包含「示例数据」，否则执行器拒绝渲染 |
| `takeaway` | 是 | 结尾要点（「看完应理解」） |
| `duration` / `fps` | 是 | 必须与项目 brief 的时长／帧率一致 |
| `accent` / `accentSoft` / `wash` | 否 | 强调色与背景色 |

## 画面与时间

- 16:9；`720p`（1280×720）或 `1080p`（1920×1080）；帧率读取 content（示例 30fps）。
- 只由 `t` 决定：标题／副标题淡入、图表出现、每条指标条从 0 增长到目标值并同步计数、结尾 takeaway 出现、进度条与 HUD；**无 CSS 动画、无随机数、无 `Date.now` 状态**。
- 一条 schedule 同时驱动画面与点击音轨（`bar_starts`、`grow_seconds`、`takeaway_at`），两者不会漂移；音轨由共享 `writeClickTrack` 生成，不配音。

## QA 映射（写回项目新版本）

| 检查项 | 状态 | 依据 |
| --- | --- | --- |
| `qa-spec` | `passed` | `qa.json`：分辨率／帧率／时长／帧数 |
| `qa-decode` | `passed` | ffmpeg 解码音视频流无错误 |
| `qa-visual` | `passed` | `storyboard.jpg` + 三时刻重渲确定性（不是完整审片） |
| `qa-timing` | `waived` | 仅当 brief 无旁白且无字幕；否则 `not_checked`（执行器不渲染字幕／旁白） |
| `qa-content` | `not_checked` | 内容由导演脚本负责；示例数据仍需人工核对是否被误读 |
| `qa-audio` | `not_checked` | 已测响度，但未主观试听 |
| `qa-viewing` | `not_checked` | 未完整观看，不以抽帧替代 |
| `qa-accept` | `not_checked` | 等待用户确认 |

`not_checked` 不是通过；`delivered` 状态需要全部检查变成 `passed`/`waived` 并保留证据。

## 能力与边界

- **支持**：固定版式的数据解释短片（标题／副标题／横向条形图／数值增长／单位／来源脚注／结尾要点），本地确定性渲染与编码，点击音轨。
- **不支持**：折线图或多图联动、自定义布局、角色／生成式素材、配音、BGM、字幕烧录、自动剪辑、后台队列、自动发布。
- **数据边界**：执行器不验证数据真实性。示例内容必须标「示例数据，不是真实统计」；真实统计必须由导演脚本提供出处与口径，并保持 `qa-content = not_checked` 直到人工核对。
- **不调用模型**：导演内容由当前 CLI 模型在对话中生成；执行器只渲染与检查。
- 需要本机 Chrome/Edge 与 ffmpeg；不自动下载浏览器、不联网生成、不上传媒体、不发布。

## 文件

| 文件 | 作用 |
| --- | --- |
| `run.mjs` | 执行器（stills / render 两阶段，调用 `tools/render/local-render.mjs`） |
| `scene.template.html` | 确定性场景模板；`render(t)` 只由时间与 content 决定 |
| `examples/explain-data/` | 示例 content（示例数据）、项目生成脚本与跑法 |
