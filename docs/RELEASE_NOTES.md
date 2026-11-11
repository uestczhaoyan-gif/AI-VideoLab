# VideoLab 0.2 — CLI-only

首个可发布的 CLI-only 初版：

- 一句主题 → 推荐视频类型 → 少量问答 → 直接出片（`npm run make`）。
- 三条本地 recipe：`code-motion` / `explain-data` / `real-product`；三处确认门与 8 项 QA。
- `code-motion` 接入 3 个风格模板：`blueprint`、`bauhaus`、`ink-wash`。
- 38 个来源 / 410 个条目 / 3 条可执行 recipe / 3 个风格模板。
- 资源约 2.1 GB：仓库内提交 `resources/prompts/`（约 2.7 MB 详实 Prompt），完整源码/媒体通过 Release ZIP 或 `npm run resources:fetch` 获取。
- 没有网页 UI、没有视频预览、不代理模型调用；Agent 交给 Pi / Codex / Claude Code / DSH，使用用户自己的密钥。

## 边界

- 只有三条 recipe 与三个风格模板是本地可执行；其余资源是参考/待安装，`resources/AUDIT.md` 的 checked 不代表已跑通。
- `resources/**/source/`、`projects/`、`dist/` 不进入 Git。
- 上游资源许可逐项核对；P16 Onetake 非商业，CAP 不是统一 MIT，素材/字体/音效另计。
