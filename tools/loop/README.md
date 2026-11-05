# 最小真实闭环（契约冒烟测试）

用一条**完全本地、零付费调用**的 8 秒代码动画，把 VideoLab 的项目契约完整跑一遍：Brief → 大纲 → 确定性 `render(t)` 逐帧截图 → ffmpeg 编码 → QA 证据 → 项目 JSON / Markdown（含三处确认门与 QA 清单）。

它不是风格 demo，也不证明成片质量；目的是让「共享项目契约 + 确认门 + QA 清单」有真实产物可对照，而不是只写在文档里。

## 运行

```sh
npm run loop:smoke
```

依赖：Node 22+、本机 Chrome 或 Edge（可用 `VIDEOLAB_BROWSER` 指定）、ffmpeg（优先 `FFMPEG` 环境变量，其次 `pip install imageio-ffmpeg` 自带的二进制）。不下载模型、不联网上传。

## 产物（全部在 Git 忽略的 `.tmp/loop/`）

| 文件 | 内容 |
| --- | --- |
| `loop.mp4` | 1280×720 / 30 fps / 8.000 s / 240 帧 / H.264 + AAC 点击音轨 |
| `frames/` | 240 张逐帧 PNG（确定性渲染的原始证据） |
| `contact-sheet.jpg` | 每秒 1 帧的联系表 |
| `qa.json` | 帧数、唯一帧、时长／分辨率／帧率、音轨、响度、确定性抽样 |
| `brief.md` / `outline.md` | Brief 与分镜大纲 |
| `loop-project.json` / `.md` | 带确认门、文档引用与 QA 状态的项目契约 |
| `report.json` | 本次运行的摘要（供 CI／人快速核对） |

## 这个脚本强制检查什么

- 240 帧齐全，且 `render(t)` 对同一时刻重复渲染结果一致（字节相同；个别亚像素字形差异用 PSNR > 45 dB 判定）。
- 编码后时长 8.000 s、1280×720、30 fps、含音频流。
- 项目契约通过 `validateProject`；QA 只把机械可核对的项写成 `passed`，内容／声音／完整观看／用户采用保持 `not_checked`。
- 确认门只自动确认 Brief 与风格帧（依据写进记录）；**导出前确认保持 pending**，因为还没有人决定最终交付。

## 边界

- 不调用任何模型或外部服务；不下载素材。
- 联系人审阅、主观试听、完整观看和用户采用不能由脚本代替；`NOT CHECKED` 不会被写成通过。
- 产物不提交仓库；需要复查时重新运行或查看 `.tmp/loop/report.json`。
