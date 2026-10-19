# 02 · 等轴 2.5D：ISOPOLIS

当前阶段：原作已重建、主要效果已对照，已完成设计与代码拆解，SUNGRID 新概念拓展已获用户认可；原版已获用户效果认可。上游展示序号 02，源码目录 `03-isometric`；固定版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。

2026-10-16 恢复实践：[设计与实现拆解](DESIGN.md)、[方法草案](METHOD.md)、[阶段实践经验](EXPERIENCE.md)。用户已认可原版复现；拓展改为 [SUNGRID：一束阳光，点亮一座小镇](extension/README.md)，场景与配乐独立重写。

来源：[mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)。这是本地第 2 个案例，与第 1 个平面矢量案例分别保存。

## 本次目标与输入

重建作者 10 秒的白天版 ISOPOLIS「让城市自己生长」，对齐地砖铺开、建筑生长、核心塔启动、数据提示和片尾退镜／字标。源码还有夜景与汇编片选项，本次使用原独立样片对应的默认路径。

输入包括作者源码、[原始 Prompt 快照](reproduction/UPSTREAM_PROMPT.md)、`source/demos/03-isometric/cues.json`、字体与音色库。本次执行作者程序重建，Prompt 用于理解创意与目标，不宣称已用模型重新生成该工程。

原片十个时间点见 [参考分镜](reproduction/reference-storyboard.jpg)。原片为 1920×1080、30 fps、300 帧、10.00 秒，带双声道音乐与音效。

## 工作记录

- 已获取固定版本源码与原片，检查默认白天版和夜景变体的区别。
- 补齐 HarmonyOS Sans SC、JetBrains Mono、Unbounded；从可变字体生成立体字标所需的 Unbounded 800 静态字重。
- 复用前一案例的本地环境和 Windows 渲染补丁；新增上游音频校验使用的 librosa 依赖。
- 已按原默认参数渲染完整影片，没有改写城市场景、镜头或配乐代码。

## 结果（2026-10-14）

- [轻量预览](reproduction/preview.mp4)：约 6.6 MB，便于直接观看。
- [重建母版](reproduction/video.mp4)：约 76.5 MB；1920×1080、30 fps、300 帧、10.00 秒，H.264 + 48 kHz 双声道 AAC。
- [原片／重建对照帧](reproduction/comparison.jpg)、[技术检查](reproduction/check-result.json)。十组时间点的地块、建筑、塔体、数据卡和字标结构可对应。
- 使用原始白天版、内部 16 次子采样与默认 0.5 快门参数；未启用 `v5` 夜景／汇编变体。
- 完整解码通过；重建混音约 −14.1 LUFS，真峰值约 −1.0 dBTP；原片相应测量约 −14.1 LUFS／−1.2 dBTP。音频脚本的检测警告为空，节奏检查按作者阈值通过。
- 与原片逐帧计算 SSIM，平均 All 为 **0.964928**。这是像素结构相近程度，不能解释为“96.5% 审美还原”或替代正常速度观看。
- 渲染与合成约 419.8 秒，不含下载、配乐生成和检查。预览额外转码，母版保留。

已实际查看原片与重建的十组对照帧；没有主观完成全片审听。剩余差异包括编码／颗粒、字体文件版本和 GPU 渲染差异，色彩元数据也非完全相同。没有把这些差异隐去后声称逐像素复制。

本次工作是执行上游代码后的本地重建，不是直接交付作者 MP4，也不是让模型从 Prompt 重新编写整个工程。花园版的旧问题按用户指示暂缓处理，与本案例独立。

## 运行

在 `demo/mg-styles-15/` 的 PowerShell 中执行：

```powershell
.\tools\run.ps1 -Case 02-isometric -Stills
.\tools\run.ps1 -Case 02-isometric
.\tools\run.ps1 -Case 02-isometric -SkipAudio # 已有有效音轨时
.\.venv\Scripts\python.exe tools/check.py --case 02-isometric
```

复现基线已建立，后续拓展应保留自己的 Prompt、源码与成片，并单独验证概念正确性及视觉效果。

## 新环境补齐本案例

先按项目 [SETUP.md](../../tools/SETUP.md) 准备共享环境，再执行：

```powershell
git -C source sparse-checkout add '/demos/03-isometric/' '/prompts/03-isometric.md' '/videos/03-isometric.mp4'
.\.venv\Scripts\python.exe -m pip install -r tools/requirements-lock.txt
.\.venv\Scripts\python.exe tools/prepare-isometric-fonts.py
.\tools\run.ps1 -Case 02-isometric
```

本案例使用 **HarmonyOS Sans 字体**，原始文件来自华为官方字体包，许可保留在对应字体目录；JetBrains Mono 和 Unbounded 使用各自 OFL。字体获取地址可能更新，当前文件 SHA256 记录在 `reproduction/font-checksums.json`，不能将本项目许可证覆盖到第三方字体。

用户进一步提出芯片运行题材，另建 [芯片加法流程案例](../02-isometric-chip/README.md)，不覆盖本案例。
