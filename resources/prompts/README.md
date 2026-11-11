# Prompt 文本包（入库）

这里是从下载资源中**可再分发/许可允许**的文本复制出的 prompt/风格卡，随 Git 提交，解决“只有 Workflow、没有详实 Prompt”的问题。约 2.7 MB，不含图片/视频/字体。

| 目录 | 来源 | 内容 | 许可 |
| --- | --- | --- | --- |
| `lemo/` | LEMO（`resources/styles/lemo-opuscar`） | 51 个风格的 `STYLE.md`、`DEMO.md`、`style.json` | MIT（工程）；素材另计 |
| `mg/` | MG 15（`resources/styles/mg-styles-15`） | 15 条 Prompt Markdown | MIT（工程）；素材另计 |
| `shotcraft/` | video-shotcraft（P22） | 125 张镜头卡 / 参考 Markdown | Apache-2.0（代码）；素材另计 |
| `manim-skill/` | manim-skill（P13） | Skill 文档 | MIT |

## 怎么用

- **直接选风格**：`resources/prompts/lemo/<style>/STYLE.md` 与 `style.json` 是 51 个风格的可读规格；CLI 已把 3 个（blueprint、ink-wash、bauhaus 来自 MG）做成可执行模板，其余可复制改写。
- **写内容**：Agent 读 `resources/prompts/mg/*.md` 或 `shotcraft/shots/**`，选中 1–3 条，转成 `content.json` 的标题、步骤与画面规则，而不是把 341 条全部塞进上下文。
- **复刻 Prompt**：`recipes/code-motion/styles/README.md` 里有 3 个已接入模板的详细复刻 Prompt。
- **CAP（P09）341 条**：仓库只保留 catalog 索引与摘要（完整 Prompt 受混合来源/免费分享约定限制，不直接再分发）；取得资源后读 `resources/prompt-libraries/.../source/`。

## 不包含

- 图片、视频、字体、音效、demo 工程源码（体积与许可原因）。
- CAP 完整 Prompt（先 `npm run resources:fetch -- --only P09`，按上游许可使用）。
- 依赖、模型权重、外部素材。

完整资源与打包方式见 [../PACKS.md](../PACKS.md)；固定版本见 [../MANIFEST.md](../MANIFEST.md)。
