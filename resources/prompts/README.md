# Prompt 文本包（入库）

这里汇集许可允许再分发的 Prompt、风格卡与制作指南，供 Agent 按本次 Brief 选取。

| 目录 | 来源 | 内容 | 许可 |
| --- | --- | --- | --- |
| `lemo/` | LEMO（`resources/styles/lemo-opuscar`） | 51 个风格的 `STYLE.md`、`style.json` | MIT（工程）；素材另计 |
| `mg/` | MG 15（`resources/styles/mg-styles-15`） | 15 条 Prompt Markdown | MIT（工程）；素材另计 |
| `shotcraft/` | video-shotcraft（P22） | 125 张镜头卡 / 参考 Markdown | Apache-2.0（代码）；素材另计 |
| `manim-skill/` | manim-skill（P13） | Skill 文档 | MIT |

## 怎么用

- 需要描述风格时，阅读 `resources/prompts/lemo/<style>/STYLE.md` 或 `resources/prompts/mg/*.md` 中相关条目。
- 需要细化分镜时，在 `shotcraft/shots/` 选与当前场景匹配的镜头卡，把用途、画面变化和节奏写进任务包。
- **CAP（P09）341 条**：仓库只保留 catalog 索引与摘要（完整 Prompt 受混合来源/免费分享约定限制，不直接再分发）；取得资源后读 `resources/prompt-libraries/.../source/`。

LEMO 具体作品的制作说明可在 [固定上游版本](https://github.com/lemomo-ai/lemo-opuscar/tree/b5e8ef93930b6d828f352055a689320f138237b1/styles) 查阅。

## 不包含

- 图片、视频、字体、音效、demo 工程源码（体积与许可原因）。
- CAP 完整 Prompt（先 `npm run resources:fetch -- --only P09`，按上游许可使用）。
- 依赖、模型权重、外部素材。

完整资源与打包方式见 [../PACKS.md](../PACKS.md)；固定版本见 [../MANIFEST.md](../MANIFEST.md)。
