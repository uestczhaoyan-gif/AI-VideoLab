# VideoLab 本地创作台

VideoLab 将中文对话整理成 Brief，再让策划 Agent 阅读资源库节选，提出风格、片长、分段画面、口播稿或静音字幕稿，并说明参考依据。用户确认后，制作 Agent 当场编写本次的视频代码，选择所需工具并交付。

## 启动与使用

需要 Node.js 22 或更高版本，以及已使用 ChatGPT 登录的 Codex CLI。首次在新目录运行 `npm ci --ignore-scripts`。媒体验收使用 FFprobe。可通过 `VIDEOLAB_FFPROBE` 指明路径，或使用 PATH 上的 `ffprobe`。PATH 找不到 Codex 时可设 `VIDEOLAB_CODEX_EXECUTABLE`。

```powershell
npm.cmd run studio
```

打开 [本地创作台](http://127.0.0.1:4176/)。用中文说主题、给谁看、在哪里用。已经确定的时长、观看条件或素材也可以一并告诉 Agent。

1. 先读创作建议。可以在对话框要求缩短片长、改风格或改一句话稿。建议与用户已明确的需求在本地保存。
2. 点“确认方案并制作预览”。制作 Agent 读取当前提案和任务资料，完成最长 10 秒的预览。
3. 查看预览。用“想怎么改？”提出反馈，可以对照修改前的预览。点“导出成片”制作完整目标片长。
4. 下载 MP4，点开制作 Prompt、制作记录或检查记录。源码和任务文件保存在 `projects/_studio/<会话>/jobs/<任务>/`。

平台用 Codex 处理需求和制作。制作任务通过可在任务目录写文件的 Codex CLI 运行，宿主的工具和网络权限仍然适用。任务会使用当前账户的 Codex 额度。遇到素材、工具或权限缺口时，Agent 可以写下待补条件，用户补充后重试。

需要真实数据、截图或其他素材时，提案会显示待补项。补充所需素材后重新生成提案，再确认制作。

HyperFrames、Anidoodle、Manim、产品演示资源及其他开源项目是制作参考。Agent 可以选用现有工具，也可自行写代码实现适合本次任务的路线。已验证的历史样片仍保存在原目录。

## 命令行

```sh
npm run route -- --topic "黑洞科普" --audience "初中生" --duration 15 --style "手绘" --json
npm run make -- --topic "黑洞科普" --audience "初中生" --duration 15
```

`make` 生成任务目录，可交给其他 Agent 使用。既有 `render:agent` 兼容 HTML 工程。`workflow:render` 与 `route --legacy` 保留历史用途，供已有工程手动调用。
