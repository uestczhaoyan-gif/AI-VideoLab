# Prompt 库与模板怎么用

平台能直接出片的是三条 recipe；资源里的 341 条 CAP Prompt、15 条 MG Prompt、124 张视频镜头卡与 LEMO 51 个风格工程，是**可被 Agent/人读取并改写**的详细素材，不是自动渲染器。`resources/**/source/` 不进入 Git（约 2.1 GB），用下面任一方式取得：

```sh
npm run resources:fetch -- --only P09,P02,LEMO   # 先取 Prompt/风格
npm run resources:fetch                          # 全部 19 个
```

或下载 Release 中的分类 ZIP（见 [PACKS.md](PACKS.md)），解压到 `resources/`。

## 已入库的 Prompt 文本包

[resources/prompts/](prompts/README.md) 随 Git 提交（约 2.7 MB）：LEMO 51 个风格 STYLE/DEMO/style.json、MG 15 条 Prompt、video-shotcraft 125 张镜头卡、manim-skill 文档。没有完整 CAP 341 条（许可限制，使用 fetch）与图片/视频。先看这个目录，能立即读到详实 Prompt。

## 主要 Prompt 位置

| 资源 | 取得后路径 | 内容 |
| --- | --- | --- |
| CAP（P09） | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/` | 341 条风格 Prompt、索引、B6/X7 示例（fetch 后） |
| fifi（P03） | `resources/prompt-libraries/fifi-video-prompt/source/` | 高度具体的代码动画 Prompt |
| MG（P02） | `resources/styles/mg-styles-15/source/prompts/` | 15 条 MG 风格 Prompt + demo |
| LEMO | `resources/styles/lemo-opuscar/source/styles/<style>/` | 51 个风格工程、STYLE/DEMO/CREDITS |
| video-shotcraft（P22） | `resources/engines/video-shotcraft/source/` | 124 张镜头卡、150 镜头与 Remotion 实现 |
| Remotion Skills（P14） | `resources/skills/remotion-skills/source/skills/` | 官方 Agent Skill 文档 |

完整对应见 [TEMPLATE_MAP](../docs/library/TEMPLATE_MAP.md)（410 个模板逐行映射 Prompt 路径与建议 Workflow）。

## 三种使用方式

1. **Agent 直接读**：把仓库交给 Pi/Codex/Claude Code/DSH，让 Agent 读 `docs/library/CREATE_VIDEO.md` 和上表路径，先选中 1–3 条 Prompt，再写 `content.json` 与 Brief；不要一次塞 341 条。
2. **CLI 选已接入风格**：`npm run make -- --style blueprint|bauhaus|ink-wash`，对应 [styles/README](../recipes/code-motion/styles/README.md) 里的详细复刻 Prompt；这三个模板已真正进入渲染链路。
3. **人/Agent 改模板**：复制 `recipes/code-motion/styles/<style>.html` 或 `scene.template.html`，按上游 Prompt 改视觉规则，保持 `render(t)` 确定性，再作为新风格注册。

## 为什么不能“一键跑 408 条模板”

模板是视觉/文案参考，不是统一 API；每条要变成可执行画面都需要适配（HTML/Canvas/Manim/Remotion 等）与内容替换。当前已适配 3 条 style 模板；其余资源通过 Agent 读取 + 手工改写使用。`resources/AUDIT.md` 只证明资源存在且相关，不证明已运行。

## 许可

CAP 为混合来源/免费分享约定，不是统一 MIT；P16 Onetake 非商业；P22 代码 Apache-2.0 但素材另计。不要把下载的 Prompt/媒体直接重新分发或商用，先核对上游许可。
