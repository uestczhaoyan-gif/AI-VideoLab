# 第三方来源与发布边界

根目录 [MIT License](LICENSE) 适用于本项目自行撰写的代码与文档，以及没有另行声明的原创内容。它不覆盖第三方源码、素材、字体或引用作品。

- `resources/mg-styles-15/` 保存固定上游版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` 的本机快照。上游动画、提示词和成片的版权归原作者；其 MIT 条款文本保留在 [UPSTREAM-LICENSE](resources/mg-styles-15/UPSTREAM-LICENSE)。上游源码与本地采集缓存不纳入发布快照。VideoLab 自己做的复现工程已于 2026-11 清理，总结见 [案例库](docs/library/cases/README.md)。
- `DeepseekDemo/` 是依据本项目方法笔记开展的独立验证，已于 2026-11 按用户要求删除；其案例说明、差异记录与自评摘要保留在 [一笔画案例](docs/library/cases/deepseek-onetake.md)。原随附的 Noto Serif SC 与 Cormorant Garamond 字体文件同时删除，第三方字体许可边界不变，重新使用需从字体官方来源获取。
- `resources/lemo-opuscar/` 记录上游 [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)（MIT，© 2026 LemoLab）。上游源码与各风格素材不纳入发布快照；其 demo 素材许可逐项写在上游各风格的 `CREDITS`（CC0、CC BY 等），后续引用或再分发时保留对应署名与条款。
- [P09 · code-animation-prompts](docs/theory/extractions/projects/P09-code-animation-prompts.md) 基于 [XiaoyeCodes/code-animation-prompts](https://github.com/XiaoyeCodes/code-animation-prompts) 固定版本 `69ccbeaf0b821591a40936572c2f559d8f4cfb68` 的资料提取。其混合来源合集按原素材的免费分享约定提供，不是统一 MIT；第三方部分继续按原许可。完整快照仅保留本地，不随 VideoLab 根 MIT 分发，具体见上游 `LICENSE.md`。
- [P10 · Ploto 长片制作文章](docs/theory/extractions/projects/P10-ploto-long-video-workflow.md) 基于 Ploto 的[作者原文](https://ploto.me/posts/how-i-made-a-long-video-with-ai/)，正文为 CC BY 4.0；摘要包含转述、重组与新增解释，保留作者、链接与许可。文章展示及引用的第三方作品分别保留权利边界，不因文章许可一并开放。
- [P11–P21 关联仓库](docs/library/REPOSITORIES.md) 仅本地缓存固定版本，公开部分为来源摘要，不随根 MIT 重新分发上游。Open Design 只有选择性资料；Onetake 当前为 PolyForm Noncommercial 1.0.0，不能默认商用；auto-motion 与 Remotion Skills 根目录未见覆盖全项目的独立 LICENSE，第三方条款不能替代授权。
- P19／P20 的集合根许可不自动覆盖原作者 Prompt、视频、音轨与品牌素材；[P21](docs/theory/extractions/projects/P21-awesome-claude-videos.md) 的原创写作、表格与图示为 CC BY 4.0，本文仅结构化转述并新增范围说明，保留来源，第三方内容不在该授权内。具体文件范围和许可例外见各自记录。
- `docs/theory/extractions/` 是对公开视频、仓库和官方文档的结构化摘要，保留来源和范围，不是视频逐字稿。原始视频、登录会话、OCR 缓存与采集素材不发布。
- `catalog/catalog.json` 保留上游名称、短描述和标签的出处与版本，不复制完整 Prompt 或媒体。引用部分继续适用原权利边界，不归根 MIT；不能把全部索引和本机缓存自动作为可商用／再分发素材发布。工作台仅在本机回环地址提供已登记文件，不构成公开托管授权。
- 工作台的 Lucide 图标代码为 ISC；AJV 为 MIT，Marked 为 MIT；Playwright 测试工具为 Apache-2.0。准确版本由 `package-lock.json` 固定，分发依赖时保留其包内许可与通知。
- 各案例使用的外部字体、库与纹理须按各自来源和许可证获取并保留授权信息。复现者应阅读对应案例说明。

本页是仓库导航，不替代各素材自带的完整许可证。新增素材或代码时，应先记录来源与许可，再更新本页。
