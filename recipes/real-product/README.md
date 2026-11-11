# real-product：真实产品与素材包装（本地半自动执行器）

第三条**本地可执行** recipe：输入真实产品截图（PNG/JPG）与逐场景说明，本执行器用确定性 `render(t)` 页面 + Chrome/Edge 逐帧截图 + ffmpeg 生成 16:9 产品介绍短片（截图缓慢推拉/平移、说明条、序号、可选高亮框、淡入淡出）。内容真实性、主观声音、完整观看与用户采用仍由人负责。

**不生成 UI、不录屏、不调用模型、不联网、不下载素材、不上传、不发布。** 截图只被读取并以 base64 注入渲染页，不会写入仓库；示例截图与产物全部落在 `.tmp/`（Git 忽略）。

## 流程

```text
真实截图 + content.json → Brief（人确认） → 风格帧（人确认） → 全片渲染 → 编码 → 机械 QA → 新项目版本（export 门仍待确认）
```

1. 准备 `content.json`，并用项目 JSON 选择 `selection.recipe_id = "real-product"`（`recipe_revision` 跟随 catalog）。
2. 确认 Brief 门（必须写依据）：
   ```sh
   node tools/project/cli.mjs gate --from <项目.json> --id brief --basis "已核对截图来源与内容边界" --out <项目-brief.json>
   ```
3. 出风格帧并查看：
   ```sh
   node recipes/real-product/run.mjs --project <项目-brief.json> --content <content.json> --stage stills --out .tmp/real-product/run
   ```
4. 看 `stills/still-1..3.png` 与 `style-frames.jpg`，确认后写 style_frame 门：
   ```sh
   node tools/project/cli.mjs gate --from <项目-brief.json> --id style_frame --basis "已查看风格帧" --out <项目-style.json>
   ```
5. 全片渲染：
   ```sh
   node recipes/real-product/run.mjs --project <项目-style.json> --content <content.json> --stage render --out .tmp/real-product/run
   ```
6. 产物在 `--out` 指定目录（默认 `.tmp/real-product/<project_id>/`）：`real-product.mp4`、`frames/`、`storyboard.jpg`、`qa.json`、`report.json`、`project-vN.json/.md`；`export` 门保持 pending，`qa-content`／`qa-audio`／`qa-viewing`／`qa-accept` 保持 `not_checked`。

## 输入格式（content.json）

```json
{
  "title": "视频标题（必填）",
  "kicker": "左上角品牌行（可选）",
  "footer": "右下角说明（可选）",
  "duration": 10,
  "fps": 30,
  "scenes": [
    {
      "image": "assets/01-shot.png",
      "title": "说明条标题（必填）",
      "desc": "说明条正文（可选）",
      "label": "左上角小标签（可选）",
      "motion": "zoom-in | zoom-out | pan-left | pan-right（可选）",
      "highlight": { "x": 0.1, "y": 0.2, "w": 0.5, "h": 0.2 }
    }
  ]
}
```

- `scenes` 需要 **2–6** 项；`content.duration`／`fps` 必须与项目 brief 一致；每段至少 0.8 秒。
- `image` 是**相对 content.json 的路径**，扩展名只接受 `.png`／`.jpg`／`.jpeg`，且文件内容必须是真 PNG/JPEG（校验文件头）。
- 限制：**单图 <3 MiB，总量 <8 MiB**；截图必须位于仓库工作区内（如 `projects/<名称>/assets/` 或 `.tmp/`），执行器会拒绝仓库外路径，避免把外部文件引用进项目记录。
- `highlight` 是相对图片的归一化坐标（0–1），用于框出界面局部；坐标和尺寸都会校验。
- `motion` 缺省时按场景顺序轮换；渲染没有 CSS 动画或实时时钟，同一个 `t` 永远得到同一帧。

## 能力与边界

- **支持**：16:9 的 720p／1080p、fps 跟随项目 brief；2–6 个截图场景；说明条、序号、进度条、可选高亮框；场景间顺序淡出→淡入与开场／结尾淡入淡出；截图缓慢推拉／平移；确定性逐帧渲染；点击音轨由同一场景表生成；机械 QA（规格／解码／帧数／确定性）。
- **不支持**：生成式 UI、录屏、真实交互演示、配音／BGM／字幕文件、自动剪辑、后台队列、自动发布；不验证截图中产品功能与文案是否真实。
- **人必须做的**：确认 Brief 与风格帧；确认截图来源、产品事实与素材许可；试听声音、完整观看、确认导出与采用。执行器只把机械可核对项写成 `passed`；`qa-timing` 在无旁白且无字幕时写 `waived`（说明条不参与逐句对齐）。
- **费用与授权**：全部本地执行，无模型调用与外部服务；使用本机 Chrome/Edge 与 ffmpeg。素材版权、界面截图再分发范围与产品事实由用户负责。
- **project 记录**：图片以仓库相对路径写入 `documents.source_notes`；执行器不复制图片到产物目录。`content.json` 快照会改写为仓库相对路径，便于项目引用。
- **catalog 接线**：本执行器只要求 `selection.recipe_id === 'real-product'`；`recipe_revision` 跟随 catalog（Agent 不硬编码）。catalog 的 `runnable`／`adapter` 字段与 Web 端入口由 Lead 统一接线。

## 文件

| 文件 | 作用 |
| --- | --- |
| `run.mjs` | 执行器（stills / render 两阶段，调用 `tools/render/local-render.mjs`） |
| `scene.template.html` | 确定性场景模板；`render(t)` 只由时间与 content 决定 |
| `../examples/real-product/` | 本机工作台真实截图、content 与项目生成脚本 |
