# 03 · 线条动画：ATELIER LINEA「一笔画」

本地第三种风格；上游网页展示序号 04，源码为 `02-line-art`。平面矢量和等轴案例已经完成过迁移，本例先复现原版效果，再做设计逆向与新概念拓展。

来源：[mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，固定版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，MIT；字体各自保留 OFL。

## 本次复现范围

运行上游默认的 10 秒独立片，不启用 `v5` 汇编版。保持原版路径、镜头、线面转换、文字、纹理与配乐代码，沿用已有 Windows 渲染适配。本地输出是重新渲染的作品，不是直接拿作者 MP4 充当复现成果，也不是从 Prompt 独立重写工程。

原 Prompt 建议 SVG／GSAP，但最终源码使用 Canvas2D 绘制，并借助 SVG 路径几何数据计算绘制过程。复现以最终源码和成片为准，不用建议技术路线代替实际实现。

## 文件

- [本地观看预览](reproduction/preview.mp4)、[重建母版](reproduction/video.mp4)。
- [原片／重建对照](reproduction/comparison.jpg)、[技术报告](reproduction/check.json)。
- [原始 Prompt](reproduction/UPSTREAM_PROMPT.md)、[资源校验值](reproduction/asset-checksums.json)。
- [阶段经验](EXPERIENCE.md)：依赖、故障、检查与后续验收记录。

## 环境与运行

进入 `demo/mg-styles-15`，先准备现有共享环境，再执行：

```powershell
git -C source sparse-checkout add '/demos/02-line-art/' '/videos/02-line-art.mp4' '/assets/textures/grain/'
.\tools\prepare-line-art-fonts.ps1
.\tools\run.ps1 -Case 03-line-art -Stills
.\tools\run.ps1 -Case 03-line-art
.\.venv\Scripts\python.exe tools/check.py --case 03-line-art
```

字体脚本可传 `-Proxy` 使用自己的代理；不硬编码本机网络设置。需要 Cormorant Garamond 与 Noto Serif SC。音频还依赖上游 `out/timing.json`，保存了从路径推导的转角与速度数据；不是可随意丢弃的渲染缓存。

原版已获用户认可；设计方法已总结，已完成 [新概念拓展《归途》](extension/README.md)。上游的手绘逐帧风格 `05-cel-boil` 尚未复现，保留在后续队列；编号不表示前面的上游风格全部完成。

## 结果

原版已本地重建并通过完整解码：10 秒、1080p、30 fps、300 帧；十组对照帧基本对应，SSIM All=0.994781（非审美评分）。预览约 2.18 MB，渲染与合成约 204.8 秒。原版已获用户效果认可；后续拓展单独验收。

[设计与代码拆解](DESIGN.md) · [方法草案](METHOD.md) · [新片 Prompt](extension/PROMPT.md)

用户已认可《归途》的基本方向，并强调一笔画必须先规划表现形式的先后；已补入方法和经验，本案例初步收尾。
