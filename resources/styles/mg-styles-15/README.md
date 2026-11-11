# mg-styles-15：15 种 MG 风格的上游快照

来源：[Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，固定版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`，MIT（见 [UPSTREAM-LICENSE](UPSTREAM-LICENSE)）；字体、配乐与音频素材另计。

本目录只保存上游内容，不包含 VideoLab 自己的复现工程。2026-11 清理时，本地复现工程、渲染产物与对照图已删除；清理前的经验已沉淀为案例记录：

| 本地原案例 | 上游风格 | 案例记录 |
| --- | --- | --- |
| 01 平面矢量 | `01-flat-vector` | [mg-01-flat-vector.md](../../../docs/library/cases/mg-01-flat-vector.md) |
| 02 等轴 2.5D | `03-isometric` | [mg-02-isometric.md](../../../docs/library/cases/mg-02-isometric.md) |
| 02 芯片运行拓展 | 同属等轴方法 | [mg-02-isometric-chip.md](../../../docs/library/cases/mg-02-isometric-chip.md) |
| 03 线条动画 | `02-line-art` | [mg-03-line-art.md](../../../docs/library/cases/mg-03-line-art.md) |
| 04 三维质感 | `04-3d-render` | [mg-04-3d-render.md](../../../docs/library/cases/mg-04-3d-render.md) |
| 05 形变动画 | `08-morph` | [mg-05-shape-morph.md](../../../docs/library/cases/mg-05-shape-morph.md) |

## 快照内容

- `source/prompts/`：15 份风格 Prompt，catalog 的 `mg-*` 条目引用这里。
- `source/demos/`：上游示例工程（浏览器逐帧渲染、音频库等）。
- `source/` 属于本地采集缓存，不纳入发布快照；复现者按固定 commit 自行 clone 后再运行 `npm run catalog:import`。

## 与 VideoLab 的关系

上游展示顺序和源码编号与本项目案例编号不同，对照见上表。当前只作为风格规则、Prompt 与工程参考，不自动继续逐风格复现；是否重新复现某个风格按具体需要决定。

## 来源与贡献边界

原作创意、画面和动画实现归上游作者。VideoLab 的复现与迁移曾分别记录，不能把原作重建说成模型独立创作，也不把有参考的学习迁移贬成无效实验。音色库与字体保持各自来源和许可，详见上游说明。
