# WANDER · 一滴，游向天空

状态：初版被用户指出僵硬、形状承接不足，迁移未通过。整片及源码保留为失败记录；当前先看 [鱼→鸟关键转换研究](studies/02-fish-to-bird/README.md)。

原版验收后的新概念拓展，水滴→鱼→飞鸟→星星。它是抽象想象叙事，不是自然过程的科学说明。

- [成片](video.mp4)／[轻量预览](preview.mp4)
- [创作 brief 与修订](PROMPT.md)
- `src/film.js`：独立轮廓、采样对齐、形变、微动作、配色与排版。
- `src/cues.json`：共同时间表；`src/audio.py`：新配乐编排。
- `checks/morph-geometry.json`、`checks/seeking.json`：轮廓与随机时间定位检查。
- `check-result.json`、`storyboard.jpg`：最终技术检查与分镜。

在 `demo/mg-styles-15` 中执行：

```powershell
.\tools\run.ps1 -Case 05-shape-morph -Mode extension -Stills
.\tools\run.ps1 -Case 05-shape-morph -Mode extension
node tools/check-seeking.mjs 05-shape-morph
.\.venv\Scripts\python.exe tools/check-video.py demos/05-shape-morph/extension/video.mp4
```

复用现有公共渲染器、音色库、纸张纹理、DM Sans 与 HarmonyOS Sans；各自保留原许可。新写场景与配乐，没有把上游原片当作素材。方法局限见上级 DESIGN.md 与 METHOD.md，最终迁移观感由用户验收。

最新修订：[双翼比例与生长研究](studies/03-two-wings/README.md)，回应翅膀过大和缺失第二只翼的问题，保留前一版转换方向。

当前完整修订：[WANDER v2 连续序列](revisions/v2-sequence/README.md)，整合已研究的双翼转换，加入叶片与回到水滴，检验长段落的连贯性；等待成片检查与用户反馈。
