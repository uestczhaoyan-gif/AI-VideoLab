# 芯片运行过程 · INSIDE ADD

状态：用户认为概念表达基本可以，但视觉偏简陋；已保存局限并收尾，后续推进线条动画原版复现。

等轴风格的第二个独立拓展。用户在观看 SUNGRID 后提出芯片题材，并选择“运行过程”。本例展示一条 RISC-V `ADD x3, x1, x2`：初始 x1=3、x2=5、x3=0，完成后 x3=8，源寄存器不变。

这是一支新写的教学示意片，不是另一个上游原片的复现；方法基线来自已获用户认可的 [ISOPOLIS 复现](../02-isometric/README.md)。能源岛案例保留在原目录。

- [观看预览](extension/preview.mp4)／[成片母版](extension/video.mp4)
- [创作 Prompt 与分镜](extension/PROMPT.md)
- [设计方法与语义依据](METHOD.md)
- [实践经验](EXPERIENCE.md)
- `extension/src/`：HTML、场景代码、状态模型、事件表、配乐与状态检查。
- `extension/checks/`：可再生成的渲染／音频／随机定位日志。

## 重建

沿用项目现有环境与固定版本上游，进入 `demo/mg-styles-15`：

```powershell
node demos/02-isometric-chip/extension/src/check-state.mjs
.\tools\run.ps1 -Case 02-isometric-chip -Mode extension -Stills
.\tools\run.ps1 -Case 02-isometric-chip -Mode extension
node tools/check-seeking.mjs 02-isometric-chip
.\.venv\Scripts\python.exe tools/check-video.py demos/02-isometric-chip/extension/video.mp4
```

复用：上游累计渲染器与辅助动画模块、音色库、Three.js、HarmonyOS Sans 字体、现有离线渲染脚本；新写：功能布局、几何场景、数据路线、时间模型、屏幕标注、文案、配乐编排。第三方许可沿用项目 `UPSTREAM-LICENSE` 与相应字体／依赖许可。
