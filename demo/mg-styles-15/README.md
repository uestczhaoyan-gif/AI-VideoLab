# mg-styles-15：学习、拆解与迁移

来源：[Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，固定版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。

项目目的不仅是重新渲染原作，而是从成片与代码中提炼可解释的设计决策，并将它们用于新的创作。

| 本地案例 | 上游源码路径 | 进展 |
| --- | --- | --- |
| [01 · 平面矢量](demos/01-flat-vector/README.md) | `source/demos/01-flat-vector/` | 原作已重建、拓展整体获认可；轻微卡顿按用户要求暂缓 |
| [02 · 等轴 2.5D](demos/02-isometric/README.md) | `source/demos/03-isometric/` | 原版与 SUNGRID 拓展获用户认可 |
| [02 · 芯片运行拓展](demos/02-isometric-chip/README.md) | 同属等轴方法，场景独立新写 | 概念迁移基本通过，用户指出视觉简陋，已收尾 |
| [03 · 线条动画](demos/03-line-art/README.md) | `source/demos/02-line-art/` | 原版获认可；《归途》初步迁移通过，已记录叙事顺序要求 |
| [04 · 三维质感](demos/04-3d-render/README.md) | `source/demos/04-3d-render/` | 原质量获认可；RIPPLE v1 未通过；v2 运动与最终成片获接受；失败版本和经验已归档 |
| [05 · 形变动画](demos/05-shape-morph/README.md) | `source/demos/08-morph/` | 原版获认可；WANDER 初版未通过；短研究修订后，14 秒 v2 长版待观看 |

## 目录

- `source/`：上游源码、Prompt、原演示与许可；兼容修改保存为 `tools/windows-render.patch`。
- `demos/<编号-风格>/`：每个案例的记录、方法、源码与成品；原作复现与新概念拓展分开保存。
- `tools/`：共享渲染、字体获取、检查脚本和锁定依赖。
- `.venv/`、`.tmp/`、`downloads/`：本地环境与缓存，不作为案例成果提交。

上游展示顺序和源码编号不同。本地按研究顺序编号，并同时登记上游路径。用户已明确允许暂缓第一个案例的细节问题、推进第二个案例。

## 当前工作区运行

从本目录的 PowerShell 执行：

```powershell
.\tools\run.ps1 -Mode reproduction
.\tools\run.ps1 -Mode extension
.\tools\run.ps1 -Mode extension -Stills
.\.venv\Scripts\python.exe tools/check.py
```

输出自动进入 `demos/01-flat-vector/reproduction/` 或 `extension/`。`tools/check.py` 用于原作与复现对照；拓展检查命令见该案例记录。

新环境的安装步骤见 [环境说明](tools/SETUP.md)。本地 MP4 已保留在案例内；尚未发布远程仓库。

## 来源与贡献边界

原作的创意、画面和动画实现归上游作者。本会话助手完成环境适配、分析，以及已明确标为新增的拓展场景代码。不能把原作重建说成模型独立创作，也不把有参考的学习迁移贬成无效实验。

上游 MIT 许可证见 [UPSTREAM-LICENSE](UPSTREAM-LICENSE)。音色库与字体保持各自来源和许可，参见上游 `lib/audio/README.md` 和下载的字体许可证。
