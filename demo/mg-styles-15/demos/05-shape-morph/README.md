# 05 · 形变动画：morphe.「一形万象」

本地第五种风格，上游展示序号 06，源码 `08-morph`。固定上游版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，来源 [mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)。原版复现通过验收；WANDER 初版与 v2 作为失败迭代保留。用户勉强接受 [v3](extension/revisions/v3-rhythm/README.md)：节奏、全屏色彩和选择性小幅位移均有改善，但仍欠原作神韵。经验已归档，可推进下一项。

本次运行默认独立片，不启用 v5 汇编变体：1920×1080、30 fps、10 秒，4 次内部运动模糊采样，快门 0.5。保持原形变、镜头、文字、配乐与公共事件表，不把下载原片作为复现结果。

## 文件

- [观看预览](reproduction/preview.mp4) · [重建母版](reproduction/video.mp4)。
- `reproduction/comparison.jpg`、`check.json`：原片／重建对照与技术检查。
- [原始 Prompt](reproduction/UPSTREAM_PROMPT.md)、[资源校验值](reproduction/asset-checksums.json)。
- [实践记录](EXPERIENCE.md)。上游原片保留在 `source/videos/08-morph.mp4`。

## 环境与运行

所需资源：原始 `glyphs.json`、共享纸张纹理、IBM Plex Mono Medium、HarmonyOS Sans SC Medium、Outfit 字体。保留上游字形轮廓，不重新生成不同版本的轮廓数据。

字体来源为 Google Fonts 的 IBM Plex Mono 与 Outfit（OFL），HarmonyOS Sans 使用前例已准备的文件。Outfit 下载的是当前可变字体，按上游 URL 所要求的 `Outfit-SemiBold.ttf` 文件名存放，CSS 请求 600 字重；文件名不表示它是静态字重或与作者原字体二进制完全相同。校验值保存用于记录本次输入。

在 `demo/mg-styles-15` 执行：

```powershell
.\tools\run.ps1 -Case 05-shape-morph -Stills
.\tools\run.ps1 -Case 05-shape-morph
.\.venv\Scripts\python.exe tools/check.py --case 05-shape-morph
```

原音频脚本按当前目录读取 `cues.json` 并写 `out/`，因此运行器仅为本例切换到源码目录执行音频，之后恢复目录；未修改音频逻辑。第三方字体和纸张素材保留原许可。

## 检查结果

原片和重建均为 1080p、30 fps、10 秒、300 帧。已查看十组对照帧，形体、版式与片尾字标基本对应；SSIM All=0.974531，只表示像素结构接近，不是审美还原百分比。

重建约 −14.0 LUFS、真峰值 −2.2 dBFS；原片约 −14.1 LUFS／−2.6 dBFS。母版约 62.92 MB，轻量预览约 7.43 MB。准备字体可运行 `tools/prepare-morph-fonts.ps1`，它会核验记录的输入。用户已观看并认可整体效果；不据此声称逐像素或完整审听一致。

[设计拆解](DESIGN.md) · [方法草案](METHOD.md) · [拓展成片与源码](extension/README.md)
