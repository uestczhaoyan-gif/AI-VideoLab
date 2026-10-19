# 04 · Blender 三维质感：Soft Landing

上游展示序号 05，源码 `04-3d-render`，固定版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。目标为原版 10 秒、1920×1080、24 fps、240 帧影片；不启用 v5 变体。

当前状态：原质量复现已完成，240 张三维底片、网页合成、配乐与技术检查均通过。用户已认可低清版除画质以外的表现；原质量版本已获用户明确认可。首次后台中断及修复过程保留在经验记录中。

## 文件与证据

- [原始 Prompt](reproduction/UPSTREAM_PROMPT.md)。
- [9 秒处试渲染](reproduction/sample-raw-9s.png)：本地 Blender 输出，尚未叠加作者的网页调色、景深和文字，不能代替最终成片。
- `reproduction/upstream-events.json`：上游原始碰撞时间。
- `reproduction/event-comparison.json`、`event-diff.json`：重建事件与原值比较。
- `reproduction/job-status.json`、`job-output.log`、`job-error.log`：本地任务记录。
- [1080p 观看预览](reproduction/preview.mp4) · [原质量母版](reproduction/video.mp4) · [原片／重建对照](reproduction/comparison.jpg) · [技术报告](reproduction/check.json)。

## 本地适配与运行

检测到 Blender 5.1.0 与 Intel i7-12700H CPU；Cycles 未检测到可用计算 GPU。保留 Cycles、原分辨率、24 samples、自适应采样和降噪参数，仅通过独立 `tools/blender-cpu.py` 将上游 GPU 设备选择切换至 CPU，不改原场景设计。

本机 9 秒处一帧耗时 73.1 秒，线性外推整片约 4.9 小时，实际受帧内容、温度和系统负载影响。后台任务以低优先级运行，不降低原画质；启动前记录任务进程，支持跳过已经完成的帧。

在 `demo/mg-styles-15` 执行以下步骤（已有任务运行时不要重复启动）：

```powershell
# 首次准备：source 已包含场景、mesh、HDRI、字体、共享环境
New-Item -ItemType Directory -Force source/demos/04-3d-render/work
$env:MG_ROOT=(Resolve-Path source).Path
.\.venv\Scripts\python.exe source/demos/04-3d-render/blender/sim.py
& 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' -b --factory-startup -P tools/blender-cpu.py -- scene
.\tools\render-soft.ps1
```

首次资源获取还需要上游 `assets/hdri/`、附带字母网格、DM Sans 和 Noto Sans SC。复用上游 MIT 代码，字体与 HDRI 保留各自许可。运行使用自带的字母网格，不再次生成不同版本的字形。

后续仍按“原版效果验收 → 设计与代码拆解 → 新概念拓展”推进，不因渲染耗时而把试帧当作完成。

## 低清预览与续跑

首次启动器只完成第 0 帧就退出，退出原因未留下日志，不能确定是进程生命周期、系统会话还是其他原因。没有证据表明后续数小时持续渲染。

现使用一次性 Windows 任务 `VideoLab-SoftLanding-FullQuality`，当前用户交互登录方式、无周期触发、无管理员任务权限。任务开始后由任务计划服务承载；完成后进入 `ready_for_review`，失败则写入 `failed`。用户注销、关机、睡眠仍可能中断，已完成帧可续跑；不承诺后台任务必然完成。

为先查看全部动作，`draft/preview.mp4` 使用 480×270 三维帧、4 samples、自适应阈值 0.15，加原网页调色／排版后输出 960×540、24 fps、10 秒。保持原运动、材质定义与配乐，但降噪细节和质感不能作为原质量验收依据。

已交付 [完整低清动态预览](draft/preview.mp4)（10 秒，含配乐）；原质量版本由一次性任务续跑。可运行 `tools/soft-status.ps1` 查看进程存活和帧数。

## 完成结果

2026-10-17 核验：原片与重建均为 1920×1080、24 fps、10 秒、240 帧；重建母版约 31.07 MB、预览约 8.48 MB。响度约 −14.0 LUFS，真峰值约 −1.0 dBFS。已查看十组对照帧，主体与时序基本对应；不据此声称逐像素一致。设计拆解见 [DESIGN.md](DESIGN.md)。

原版通过后，继续 [RIPPLE 新概念拓展](extension/README.md)。源场景、运动和声音重新编写；方法见 [METHOD.md](METHOD.md)。
