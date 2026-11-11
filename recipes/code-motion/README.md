# code-motion：代码动效短片（本地半自动执行器）

catalog 中第一条**本地可执行**的 recipe：导演（当前 CLI 模型）先写 brief 与 `content.json`，本执行器用确定性 `render(t)` 页面 + Chrome/Edge 逐帧截图 + ffmpeg 编码，产出 H.264 + AAC 短片和机械 QA 证据；内容、主观声音、完整观看与用户采用仍由人负责。

## 流程

```text
Brief（人确认） → 风格帧（人确认） → 全片渲染 → 编码 → QA → 新项目版本（export 门仍待确认）
```

1. 用 `npm run make` 或 `examples/code-motion/make-project.mjs` 生成项目 JSON（确认门均为 pending）。
2. 导演写 `content.json`（标题、副标题、2–5 个步骤卡、页脚、规格），并让 `content.duration/fps` 与项目一致。
3. 确认 Brief 门（必须写依据）：
   ```sh
   node tools/project/cli.mjs gate --from <项目.json> --id brief --basis "已核对受众与规格" --out <项目-brief.json>
   ```
4. 出风格帧并查看：
   ```sh
   node recipes/code-motion/run.mjs --project <项目-brief.json> --content examples/code-motion/content.json --stage stills
   ```
5. 看 `stills/still-1..3.png` 与 `style-frames.jpg`，确认后写 style_frame 门：
   ```sh
   node tools/project/cli.mjs gate --from <项目-brief.json> --id style_frame --basis "已查看风格帧" --out <项目-style.json>
   ```
6. 全片渲染：
   ```sh
   node recipes/code-motion/run.mjs --project <项目-style.json> --content examples/code-motion/content.json --stage render
   ```
7. 产物在 `.tmp/recipe-runs/<project_id>/`：`code-motion.mp4`、`frames/`、`storyboard.jpg`、`qa.json`、`project-vN.json/.md`；`export` 门保持待确认。

## 风格模板

`content.style` 可选，执行器从 `recipes/code-motion/styles/<style>.html` 读取确定性模板；CLI 用 `--style` 传入：

```sh
npm run make -- --topic "透镜如何改写一束光" --style blueprint --duration 20 --yes
```

已接入：`blueprint`（技术蓝图）、`bauhaus`（包豪斯几何）、`ink-wash`（水墨）。三者按下载资源 LEMO blueprint / MG 09-bauhaus / LEMO ink-wash 的视觉语言改写，不是上游代码。未指定时使用通用 `scene.template.html`。

## 能力与边界

- **支持**：文字／图形卡点短动效，可选三种风格模板，16:9 的 720p／1080p，30 fps（按 content 与项目规格读取），确定性逐帧渲染，点击音轨由同一事件表生成。
- **不支持**：生成式素材、真实人物、角色动画、自动剪辑、字幕对齐、配音、BGM、后台队列、自动发布。
- **人必须做的**：确认 Brief 与风格帧、核对内容事实、试听声音、完整观看、确认导出与采用。执行器只把机械可核对项写成 `passed`；`qa-audio`、`qa-viewing`、`qa-accept` 保持 `not_checked`。
- **不调用模型**：导演内容由当前 CLI 模型（DeepSeek V4.1 Flash，用户指定、未核实官方 ID／价格）在对话中生成；执行器只渲染与检查。
- 需要本机 Chrome/Edge 与 ffmpeg；不自动下载浏览器、不上传媒体、不发布。

## 文件

| 文件 | 作用 |
| --- | --- |
| `run.mjs` | 执行器（stills / render 两阶段，调用 `tools/render/local-render.mjs`） |
| `scene.template.html` | 确定性场景模板；`render(t)` 只由时间与 content 决定 |
| `examples/code-motion/` | 示例 brief／content／项目生成脚本 |
