# 白板讲解 24 fps 试片（lemo-whiteboard-trial，非正式）

> 归档 2026-11-06。依据删除前的 `demo/lemo-opuscar/trials/whiteboard-24fps/TRIAL.md` 整理，未重跑。这是**非正式试片**：原文档明确说“没有按 VideoLab 的正式流程做原版复现、设计拆解和 EXPERIENCE 归档”。

## 来源与版本

- 上游：lemomo-ai/lemo-opuscar，固定 commit `b5e8ef93930b6d828f352055a689320f138237b1`（MIT）。
- 本地快照按 [resources](../../../resources/README.md) 的说明位于 `resources/lemo-opuscar/source/`（整理中；快照被 Git 忽略，需按固定版本获取）。
- 风格骨架取自 `styles/whiteboard/STYLE.md`；来源记录见 [SOURCES](../SOURCES.md)、[STYLES](../STYLES.md) 里的 lemo-opuscar 条目。
- 制作日期：2026-10-20。
- 目录名 `whiteboard-24fps` 指**题材**（为什么 24 帧／秒看起来连续），不是输出帧率——成片实际为 30 fps。

## 目标

只用于看 lemo-opuscar 白板风格在本地渲染链上的初步效果；画面与文案全部新写，不冒充上游 demo 复现。

## 风格骨架（按上游 STYLE.md 取用）

- 一块暖白干擦板：细划痕、旧课的浅色残影、缓慢移动的斜向高光。
- 马克笔**浮空**、没有手；笔画带手抖、起笔积墨、四边略出头的矩形、圆圈叠口。
- 三色语义：黑＝结构与字，蓝＝测量与信号，橙＝要点（运动点、答案圈）。
- 相机在一块比画面更大的板上移动，不切镜；推拉用平滑速度曲线并做边界约束，避免露板边。
- 内容分五个区域，最后拉回全身：标题 → 三格胶片 → 时间轴（1/24 秒 = 41.7 毫秒）→ 眼睛（视觉暂留）→ 圈出「24 帧/秒」，收在「眼睛和大脑会补」。

## 时间轴与文件

- 全部文案、坐标、颜色标记、时间窗与相机关键帧集中在 `timeline.json`。
- `film.js` 画板、笔迹、文字、浮空马克笔、相机与合成。
- `build_player.py` 把 timeline 与 film.js 打包成自包含 `player.html`。
- `audio.py` 由 timeline 生成笔触声与配乐（`audio-raw.wav`）。
- `encode.ps1` 做响度归一并编码成片。

## 实际出片链路（原文）

1. `python build_player.py` 生成 `player.html`。
2. 浏览器打开 `player.html`，逐帧执行 `window.renderAt(t)` 并截图：**720 帧、30 fps**，存为 `out/frames/f0001.jpg…f0720.jpg`。
3. `python audio.py` 生成 `audio-raw.wav`。
4. `pwsh -File encode.ps1`：loudnorm 到 −14 LUFS，再与帧序列合成 `out/video.mp4`。

- 本机 Chrome 被沙箱拦住，所以改用代理浏览器逐帧截图。
- `sandbox-shim.mjs`：本机沙箱禁止 puppeteer 给 Chrome 建管道，用它把 Chrome 的 stdio 改成 ignore（仅供 mg-styles 渲染器使用）。
- `render.ps1` 的渲染器直连方式在本机沙箱报 `spawn EPERM`。
- 在有正常 Chrome 权限的机器上可直接用 mg-styles 的 `harness/render.mjs`（同一套 `window.renderAt` 接口），无需截帧步骤。

## 实际结果（原文数字）

- 成片 24.0 s／1920×1080／30 fps／AAC；720 帧。
- 音频：只做了马克笔摩擦声、笔尖轻响、房间底噪和一段 D 大调拨弦小曲；loudnorm 目标 −14 LUFS。
- 中间帧与 `audio-raw.wav` 已在原目录清理，重跑上述四步可复现（原始工程随本次删除不再存在）。

## 用户反馈

未记录。原文档只记录“只用于看初步效果”，没有用户观看或采用结论。

## 失败与未验证边界（与上游风格的差距，原文）

- **没有配音与字幕**：上游风格默认有旁白并带烧录字幕。
- **文字是逐字出现，不是真正的单笔画字库**：上游用单线笔迹字体逐笔写；本版用 KaiTi / Segoe Print 逐字揭示，近似“写出来”但笔顺不真实。
- 没有道具（笔帽、板擦、磁铁、笔槽）、没有镜头运动模糊、没有多笔并行。
- 笔只在书写时出现，未做“离场停放再飞回”。
- 板面纹理与马克笔干涩感是程序生成的近似，不是上游实测纹理。
- 镜头因边界约束推近幅度比上游保守。
- 这是解释性短片，不做模型能力或风格优劣结论。
- “视觉暂留”是常见但偏简化的说法，片尾用“眼睛和大脑会补”而非写成完整机制。

## 对 VideoLab 可复用的要点

- **Workflow**：单文件时间表（`timeline.json`）驱动画面、相机与声音，改片只改数据。
- 先打包成可逐帧求值的 `player.html`，再截帧／渲染、出音频，最后 loudnorm + 编码。
- **Prompt**：三色语义（结构／测量／要点）与“浮空马克笔 + 手抖 + 起笔积墨”是可以写进 brief 的明确风格规则。
- brief 里要承认近似边界（逐字揭示 ≠ 真实单笔画字库），避免冒充上游完成度。
- **质检**：沙箱与渲染链路要分开定位（`spawn EPERM` 是环境权限问题，不是画面问题）。
- 环境受限时可用代理浏览器截帧，但要在记录里写清替代链路与可复现步骤。
