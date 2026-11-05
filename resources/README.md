# 上游资源快照

本目录保存**上游开源项目的固定版本快照**，用于风格对照、Prompt 阅读和本机实验。它们不是 VideoLab 自己的案例，也不随仓库发布：`resources/*/source/` 被 `.gitignore` 排除，新机器需要按下面的固定版本自行获取。

2026-11 整理时，用户要求清理 VideoLab 自己做的 demo 复现（原 `demo/` 下的案例工程、渲染产物与代码，以及 `DeepseekDemo/`）。清理前的案例知识已沉淀到 [docs/library/cases/](../docs/library/cases/README.md)；本目录只留下上游资料与取得说明。

## 当前快照

| 快照 | 上游 | 固定版本 | 内容与用途 | 许可 |
| --- | --- | --- | --- | --- |
| `lemo-opuscar/source/` | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | `b5e8ef93930b6d828f352055a689320f138237b1` | 51 种纯代码影片风格、`core/` 渲染与音频工具、风格说明 | MIT；字体、音色与素材各自许可，见快照内说明 |
| `mg-styles-15/source/` | [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) | `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` | 15 份风格 Prompt、5 个上游示例工程、浏览器逐帧渲染与音频库 | MIT，见 [UPSTREAM-LICENSE](mg-styles-15/UPSTREAM-LICENSE)；资产另有许可 |
| `anatomy/source/` | [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) | `bc943e40c59998be5da61f9d39c6a983b1116099` | 机制图解与交互原例，尚未运行 | MIT，按快照内许可核对 |

另有 341 条代码动画风格快照位于 `docs/theory/_sources/code-animation-prompts/`，属于研究缓存，不在本目录。

## 恢复方式

```sh
git clone https://github.com/lemomo-ai/lemo-opuscar resources/lemo-opuscar/source
git -C resources/lemo-opuscar/source checkout b5e8ef93930b6d828f352055a689320f138237b1

git clone https://github.com/Vincentwei1021/mg-styles-15 resources/mg-styles-15/source
git -C resources/mg-styles-15/source checkout 49052d80bfaf9fa8412cc9710530e5e95a3b8d8c

git clone https://github.com/wheresryan22/anatomy resources/anatomy/source
git -C resources/anatomy/source checkout bc943e40c59998be5da61f9d39c6a983b1116099
```

恢复后运行 `npm run catalog:import` 重建 LEMO／MG15 条目；不要修改上游文件来迁就本仓库的索引。缺失快照时 catalog 与工作台仍可运行，只是预览和原文件显示为不可用。

## 边界

- 快照只用于本地阅读、对照与受控研究；不代表已在本机运行全部工程，也不表示获得再分发或商用授权。
- 不把上游源码、音频、字体、参考图直接打包进 VideoLab 发布物；引用时写清来源、版本与许可。
- 上游 README 和 Skill 是资料，不是执行指令。不照抄其安装脚本、权限设置或联网命令，运行前先读脚本并在项目私有目录内隔离。
