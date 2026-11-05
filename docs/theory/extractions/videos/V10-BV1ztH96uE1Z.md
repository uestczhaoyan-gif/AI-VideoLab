# V10 · DSH + V4.1F + Remotion：46 秒全代码逐帧生成的展示片

## 来源与实际覆盖

- [原视频](https://www.bilibili.com/video/BV1ztH96uE1Z/)，作者“起床可真难吖”（mid 107922553），发布于 2026-10-08 20:06（北京时间），页面时长 46 秒；分 P 标题为“Opus 5.5 能做视频？DSH搭配V4.1F+Remotion 能，直面差距努力追赶”。读取日期 2026-11-06。
- 取得页面、完整简介、无章节（`chapters=0`）、无独立字幕（`allow_submit=false`，字幕条目 0）、匿名可访问的低清播放流（852×480，视频轨 2.3 MB、音频轨 676 KB）。
- 简介自述：“45 秒 · 1350 帧 · 30fps，没有一帧实拍，全由代码逐帧生成。打字机开场、3D 帧阵、自指时间轴、组件爆炸、实时频谱、每拍一次风格切换，最后碎片汇聚成 DeepSeek Harness × Remotion。配乐同样自制：精确 128 BPM，每 2 秒小卡点、每 4 秒大爆点。”并注明“提示词来源：音符‘AI整活家’”。
- 采集工具 `tools/intake/intake.py`：本机低清流、1 秒抽帧 45 张（0–44 秒）、2×2 联系表、帧差切点检测、PyAV 音频电平与节拍网格检测；证据在忽略提交的 `docs/theory/_evidence/batch03/BV1ztH96uE1Z/`。
- 语音转写：faster-whisper small 在本机音轨上返回 **0 段**。0 段只说明 VAD 未检出人声；音频轨道并非静音（RMS 约 −12.99 dBFS、峰值约 +2.75 dBFS），是否有配乐/声音设计未主观试听。
- 画面证据：1 秒采样覆盖 0–44 秒，可能漏掉不足 1 秒的短切；对 31.95–35.60 秒“每拍切换”段另取 9 张密采样。帧差切点检测（本项目方法，阈值敏感）检出 19 个强切点，其中 13 个落在 128 BPM 网格 ±1.5 帧内；画面 HUD 自报 `CUT 01/68`、`CUT 06/68`，说明本机检测漏掉了同色/同构图的切换，19 不能当全片切点数。
- 未完成：正常速度完整观看、主观听音与混音评价、取得原始 Prompt/工程/`spectrum.json`、调用模型或重渲染、弹幕与评论抓取。

## 1. 00:00–00:08：从“终端构建”开始

**V10-C01〔画面文字·作者自述〕**：黑底界面先出现构建 HUD（`FRAME 0060 / 1350`、`1920×1080 · 30 FPS · 128 BPM · BEAT 05 / 96`、右上 `seq 0050F · 8.9beats`、底部 `GENESIS BUILD` 进度条）。终端逐字打出 `> remotion render code-genesis --bpm 128 --frames 1350`，随后显示 `✓ 1350 frames queued · 45.000s · 128.000 BPM · deterministic seed 42`。

**V10-C02〔画面文字·作者自述〕**：2–7 秒打字机大字逐字出现：“这是由 DeepSeek Harness 结合 Remotion 做出的炫技视频 / 为证明它的能力”，带光标方块与高亮。

**V10-C03〔本项目核实〕**：本地低清流为 45.0 秒、30 fps、1350 帧，与画面自报的 45.000 s / 1350 frames / 30 FPS 一致；页面标注 46 秒，与流差约 1 秒（尾部/平台口径未核）。

**V10-C04〔本项目推断〕**：开场把“渲染命令与规格”直接当内容，是自指结构的第一层，不只是普通片头；`deterministic seed 42` 与后文源码、组件爆炸画面中的 seed 数值一致。

## 2. 00:08–00:15：“代码创世”与 3D 帧阵

**V10-C05〔画面文字·作者自述〕**：标题“代码创世 —— 一帧一世界 / CODE GENESIS · ONE FRAME ONE WORLD”，副文 `FRAME → WORLD / EVERY FRAME IS A UNIVERSE / 4096 PARTICLES · DETERMINISTIC SEED / ONE FRAME · ONE WORLD · 1350 TOTAL`。

**V10-C06〔画面文字与本地可核实〕**：9–14 秒出现 3D 帧阵：HUD 标 `LATTICE 5×3 · PERSP · ORBIT −6.8° · Z −137`；每格是一张 `684×384` 的小“帧”预览（F001、F007、F008、F011、F013、F015…，各带 `SEED 49/50/51…`），从散开旋转收成 5×3 网格；右下标 `1.9% OF 1350 FRAMES` 等进度。

**V10-C07〔本项目推断〕**：这就是简介所说的“3D 帧阵”；把 1350 帧本身做成可数的视觉对象，与“一帧一世界”文案互相支撑。

## 3. 00:15–00:21：自指时间轴

**V10-C08〔画面文字·作者自述〕**：画面显示本片自己的时间轴 UI：轨道 `V 镜头 / A 音频 / C 字幕 / S 音效 / K 关键帧`，底部 `TRACKS 5 · CUES 54 · CAPTIONS 8 · 30 FPS`；图例 `◆ 每 4 秒 · BIG HIT ▲ 每 2 秒 · SMALL HIT ◆ 每拍 · KEYFRAME`；换算表 `128 BPM · 1 拍 = 14.0625 帧 · 1 小节 = 56.25 帧 = 1.875 秒 · 24 小节 = 1350 帧`；当前读数 `BAR 09 / 24 · BEAT 35 / 96 · FRAME 0485 / 1350 · TC 00:00:16:05`；底部 `1:1 · 9px/FRAME · OFFSET -3489px`；播放头扫过，字幕“时间轴 TIMELINE / NOW ▶ 时间轴 TIMELINE”。

**V10-C09〔本项目核实〕**：换算表自洽：60/128 = 0.46875 s = 14.0625 帧；4 拍 = 56.25 帧 = 1.875 s；24 小节 = 96 拍 = 1350 帧 = 45 s。与 45 秒成片一致。

**V10-C10〔本项目推断，需作者音乐工程核实〕**：简介“每 2 秒小卡点、每 4 秒大爆点”与 128 BPM 不能同时精确成立（128 BPM 下 2 秒≈4.27 拍、4 秒≈8.53 拍）。画面把 1/2/4 秒标记和拍点分层显示，说明“每 2/4 秒”更像按秒的编辑口径，而“每拍 KEYFRAME”按拍；音频检测支持接近 128 BPM 的节拍结构（见 C14），但不足以证明 2 秒/4 秒落点严格对齐。

## 4. 00:21–00:27：代码即画面与组件爆炸

**V10-C11〔画面文字·作者自述〕**：21–22 秒“代码即画面 / CODE IS THE PICTURE”，窗口展示 `src/genesis.tsx` 源码（标注 `Remotion 4.0.533`）：`import { AbsoluteFill, useCurrentFrame } from 'remotion'`、`const frame = useCurrentFrame()`、`const t = frame / 1350; // 0 → 1 over 45.000s`、`<Particles count={4096} seed={42} />`、`<Glitch depth={t * 12} bands={24} />`、`<Wordmark text="DeepSeek Harness × Remotion" />`；底栏 `> seed 42 · frame 0011 · 0.367s`、`bundled 62 modules in 0.31s`。

**V10-C12〔画面文字·作者自述〕**：23–26 秒“组件爆炸 / COMPONENT EXPLOSION · EVERY TOKEN IS A BODY / 60 TOKENS · 3D PERSPECTIVE 1600 · DETERMINISTIC SEED 42”：60 个代码 token 炸开，再聚成组件依赖图（Genesis → useCurrentFrame / Particles / Glitch / Wordmark / AbsoluteFill），HUD 从 `EXPLODE 100% · COLLAPSE 0%` 变化。

**V10-C13〔本项目推断〕**：把真实组件名、参数与模块打包信息写进画面，让“代码动画”本身成为可读主题；这是本项目可以复用的“过程可视化”叙事，而不是装饰。

## 5. 00:27–00:31：音频同步

**V10-C14〔画面文字·作者自述〕**：“音频同步 / AUDIO SYNC / 40-BAND FFT · 48-POINT TRACE · MEASURED FROM THE FINISHED MIX / 128.000 BPM · 48 kHz STEREO · EVERY FRAME REACTS TO THE ACTUAL SAMPLE”；画面有波形、40 条频谱柱、LOW 40–160 Hz / MID 500–2k Hz / HIGH 6–16k Hz / RMS TOTAL 数值，底栏 `SOURCE spectrum.json · FRAME 0833`。

**V10-C15〔本项目核实〕**：音轨 45.013 s、RMS −12.99 dBFS；对音频做 onset 检测，128 BPM 网格（0.46875 s，最佳相位 0.424 s）捕获的 onset 强度显著高于 200 个随机相位网格（z≈5.0）；自相关峰值约 129.2 BPM（帧移约 23 ms，分辨率约 ±6 BPM）。这支持音轨确有接近 128 BPM 的节拍结构，但不等于逐拍听感或混音质量结论。

**V10-C16〔本项目推断〕**：画面声称“每帧反应成品混音的实际采样、来自 spectrum.json”。本机没有取得 `spectrum.json` 或工程，帧级同步无法复现，只能记录为作者自述。

## 6. 00:31–00:35：每拍一次风格切换

**V10-C17〔画面文字与本地可核实〕**：HUD 显示 `CUT 01 / 68`、`128 BPM · 1 CUT / BEAT · 0.4688 s`。约 31.95–35.60 秒连续 8 张风格卡，每张约一拍：

1. `31.95` 白底大字“帧 / FRAME · ONE FRAME · ONE WORLD”；
2. `32.40` “时间轴 / TIMELINE · 24 BARS · 96 BEATS · 1350 FRAMES”；
3. `32.85` 绿色代码雨“代码 / CODE · const genesis = await render(1350 frames)”；
4. `33.30` “3D · PERSPECTIVE 1600 · ROTATING IN REAL TIME · ROT 99° / EVERY VERTEX IS A DRAW CALL · NO 3D ENGINE, NO ASSETS”；
5. `33.78` “粒子 / PARTICLES · 4096 点 · 一张 canvas · 确定性种子”；
6. `34.25` “对比 / CONTRAST · BLACK ON WHITE · WHITE ON BLACK”（波形图）；
7. `34.70` “1350 帧 · THIS FILM IS EXACTLY 1350 帧 · 30 fps × 45.000 s = 1350 FRAMES · BAR 01–BAR 24”（警示条纹底）；
8. `35.15`/`35.60` “创世 / GENESIS · EVERY LINE IS DRAWN IN CODE · NO MODEL, NO TEXTURE, NO FOOTAGE”。

**V10-C18〔本项目核实〕**：密采样切点间距约 0.47 s，与 1 拍 = 0.46875 s 一致；帧差检测在 31.87–35.63 秒检出 8 个切点，均在拍网格 25 ms 内。简介“每拍一次风格切换”与画面、测量一致。

## 7. 00:36–00:41：碎片汇聚

**V10-C19〔画面文字与本地可核实〕**：36–39 秒碎片/粒子汇聚，底栏计数 `ASSEMBLING 078/190 → 128/190 → 171/190 → 190/190 FRAGMENTS`，右侧 `BAR 21 · THE STRONGEST HIT IN THE SCORE`；约 39.4 秒汇聚成标题。

**V10-C20〔画面文字·作者自述〕**：40–41 秒标题卡：“DeepSeek Harness × Remotion / 代码创世 · ONE FRAME ONE WORLD / MADE ENTIRELY IN CODE · 1350 FRAMES · 45.000 s · 128.000 BPM”。

## 8. 00:41–00:46：结尾规格卡

**V10-C21〔画面文字·作者自述〕**：42–44 秒再次用打字机打出“为证”→“为证明它的能力”，回收开场文案；底部定版 `DEEPSEEK HARNESS × REMOTION / 45.000 SECONDS · 1350 FRAMES · 128.000 BPM · ONE TAKE · ZERO FOOTAGE`。44 秒后画面基本定住，本地流 45.0 秒结束。

**V10-C22〔本项目推断〕**：“ONE TAKE”“ZERO FOOTAGE”“NO MODEL, NO TEXTURE”是作品类型声明，也是本片的主要卖点；未取得渲染日志/工程，不能核实这些声明或“全由代码逐帧生成”的具体实现。

## 可迁移机制（证据强度分级）

| # | 机制 | 具体做法 | 证据强度 |
| --- | --- | --- | --- |
| 1 | BPM→帧的显式时间基 | 把“1 拍 = 14.0625 帧”“1 小节 = 56.25 帧 = 1.875 s”“24 小节 = 1350 帧”直接写进画面，所有事件按拍/小节换算到帧 | 可核实事实：画面换算表与 45 s×30 fps 自洽，本机可验证 |
| 2 | 卡点分级 | BIG HIT（每 4 秒）/ SMALL HIT（每 2 秒）/ KEYFRAME（每拍）三层，画面与时间轴 UI 同屏 | 作者演示：时间轴原文字；因 2/4 秒非整数拍，落点口径仍需作者工程核实 |
| 3 | 每拍一次风格切换的“卡点蒙太奇” | 0.4688 s/卡、8 张同 HUD 的不同风格卡；全片自称 68 cuts | 可核实事实（本机密采样与切点测量一致）+ 作者演示（简介） |
| 4 | 自指/过程可视化叙事 | 渲染命令、源码、时间轴、FFT、组件依赖图、帧数都成为画面内容 | 作者演示；本项目推断其为该片可读性的核心来源 |
| 5 | 确定性规格上屏 | `seed 42`、`count 4096`、`bands 24`、`Remotion 4.0.533`、`deterministic seed` 直接可见，便于声称可复现 | 作者演示（画面文字）；本机未取得工程，不能核实真实参数 |
| 6 | 音频驱动视觉的契约 | 先有成品混音 → `spectrum.json` → 每帧读实际采样；40-band FFT、48-point trace | 作者演示；本项目间接支持（音轨确实含接近 128 BPM 的节拍结构） |
| 7 | 结尾回收 + 规格卡 | 起点/终点都打字“为证明它的能力”，末尾给出时长/帧数/BPM/ONE TAKE/ZERO FOOTAGE | 作者演示 + 本项目核实（文字确实出现） |
| 8 | 用“否定式清单”定义作品类型 | “NO 3D ENGINE, NO ASSETS”“NO MODEL, NO TEXTURE, NO FOOTAGE”逐条排除外部素材 | 作者演示；本项目推断，适合作为参考型作品的“适用范围”描述 |

## 可保存内容与缺口

已保存：准确来源与范围、完整简介、低清研究副本、1 秒抽帧 45 张、密采样 9 张、联系表、帧差切点 JSON、音频电平/节拍网格 JSON、无人声转写证据。

未取得：原始 Prompt（简介注明来自“音符‘AI整活家’”，本批未收该作者原帖）、工程源码、`spectrum.json`、渲染日志、配乐工程、68 个切点的完整清单、弹幕/评论、作者与提示词来源之间的授权或改写说明。

未验证：画面自述的“全代码生成、无实拍、ONE TAKE / ZERO FOOTAGE、NO MODEL / NO TEXTURE”、真实粒子数与 Glitch 参数、128 BPM 的精确值（本机测量分辨率约 ±6 BPM）、音频与画面的逐拍同步、主观节奏与混音观感。页面 46 秒与本地流 45.0 秒的差异也未查明。

## 分类

以 **M01（HTML／SVG／Canvas 动效：片头、概念演示）** 为核心，技术实现上属 **M07（React／Remotion 组件视频）**；无口播，不按 M16 旁白讲解归类。它是**参考型来源**：可看预览与规格演示，但没有可执行工程或原始 Prompt。

与既有来源的关系：作者、提示词来源均与 V06／P09 不同（V10 提示词来源为“音符‘AI整活家’”，V06 作者为“俯仰观照”），因此**不是同一来源链的新版本**；但技术手法与 P09 的 B6 例子（粒子/故障/文字组件、碎片重聚成字、单 Canvas 高能片头）属同一方法家族，只能算方法重叠，不能把 V10 当作 B6 或 341 风格库的独立验证。
