# VideoLab 使用手册（Agent-led）

适用于 0.3。没有网页界面、没有固定风格模板；`make` 只准备任务，视频由你的 Agent 从零写。

## 1. 安装

```sh
git clone https://github.com/uestczhaoyan-gif/AI-VideoLab.git
cd AI-VideoLab
npm ci --ignore-scripts
```

资源（可选，约 2.1 GB）：

```sh
npm run resources:fetch -- --dry-run
npm run resources:fetch
```

只取 Prompt/风格：

```sh
npm run resources:fetch -- --only P09,P02,LEMO
```

仓库里 `resources/prompts/` 已有 2.7 MB 可读 Prompt，不下载也能开始。

## 2. 生成 Agent 任务

```sh
npm run make -- --topic "做一个非线性光学的视频"
```

会问/使用：主题、时长、画幅。输出：

```text
projects/<日期>-<主题>/
  BRIEF.md
  RESOURCES.md
  AGENT_TASK.md
  video.json
  project.json
```

**不会生成视频**。它只从资源库挑视觉候选和 Prompt 路径，供 Agent 参考。

只看建议：

```sh
npm run make -- --topic "..." --suggest
```

## 3. 交给 Agent

任选：

- DSH / Codex / Claude Code / Pi 打开本仓库，指向 `AGENT_TASK.md`
- 或运行 `npm run cli` 启动 Pi，把任务给它

Agent 必须**从零写** `scene.html`（或自选本地工程）；不要复制旧 recipe/固定 style。要求见 `docs/library/CREATE_VIDEO.md`。

## 4. 渲染

Agent 写完：

```sh
npm run render:agent -- --project projects/<目录> --stage stills
```

看 `stills/` 与 `style-frames.jpg`。确认后：

```sh
npm run render:agent -- --project projects/<目录> --stage render
```

产物：

```text
code-motion.mp4
storyboard.jpg
report.json
qa.json
frames/（中间帧，可删）
```

`render:agent` 只抓帧/编码/机械检查；不写视频代码、不调用模型。

## 5. 资源与模板

- `resources/prompts/`：入库的 LEMO/MG/shotcraft 文本
- `docs/library/TEMPLATE_MAP.md`：410 个模板 → Prompt → Workflow
- `resources/PACKS.md`：2.1 GB 资源的 Release ZIP / fetch 方式
- `resources/AUDIT.md`：抽检，不等于已跑通

没有同名模板是正常的；Agent 读最接近的视觉语言后重新写代码。

## 6. 排错

| 现象 | 处理 |
| --- | --- |
| 找不到 Chrome/Edge | 设置 `VIDEOLAB_BROWSER` |
| 找不到 ffmpeg | 设置 `FFMPEG` 或安装 imageio-ffmpeg |
| `scene.html` 不存在 | Agent 还没写；先完成第 3 步 |
| `window.render is not a function` | Agent 的 HTML 没实现确定性 render(t) |
| 渲染很慢 | 时长/分辨率过高；先 5–10 秒验证 |
| `qa-content` 是 not_checked | 正常；脚本不替人审内容 |

## 7. 验证

```sh
npm test
npm run catalog:check
npm run catalog:map:check
npm run integration:check
npm run docs:check
npm run resources:audit
```

## 8. 边界

- 每次视频由 Agent 重新写代码，不保证风格/效果一致。
- 平台不调用模型 API；Agent 使用用户自己的密钥。
- 只支持本地 HTML + `window.render(t)` 的标准 harness；Agent 可选 Remotion/Manim 自交付 mp4。
- 不生成真人/短剧；不上传/发布；不训练模型。
- 资源许可逐项核对；P16 非商业，CAP 混合许可。
