# 归途 · THE WAY HOME

线条动画的新概念拓展：山峰 → 河流 → 桥 → 家门。它是基于原版设计分析重新编写的短片，与 `reproduction/` 原版复现分开保存。

- [观看预览](preview.mp4)／[成片母版](video.mp4)
- [创作要求与修订](PROMPT.md)
- `src/film.js`：路径采样、运动、镜头、形体填充与排版。
- `src/cues.json`：分段时间与公共音画事件。
- `src/audio.py`：新配乐与笔触声编排。
- `check-result.json`、`storyboard.jpg`、`checks/`：技术与关键帧检查。

在 `demo/mg-styles-15` 执行：

```powershell
.\tools\run.ps1 -Case 03-line-art -Mode extension -Stills
.\tools\run.ps1 -Case 03-line-art -Mode extension
node tools/check-seeking.mjs 03-line-art
.\.venv\Scripts\python.exe tools/check-video.py demos/03-line-art/extension/video.mp4
```

需要已准备好的 Cormorant Garamond、Noto Serif SC、共享颗粒纹理和音色库，许可保留在上游资源目录。方法与局限见上级 `DESIGN.md`、`METHOD.md` 和 `EXPERIENCE.md`。最终效果由用户观看验收。
