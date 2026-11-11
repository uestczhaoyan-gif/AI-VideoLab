# 第三方来源与发布边界

根目录 [MIT License](LICENSE) 适用于本项目自行撰写的代码与文档，以及没有另行声明的原创内容。它不覆盖第三方源码、素材、字体或引用作品。

- `resources/` 保存上游固定版本快照，分类见 [resources/README.md](resources/README.md)，抽检见 [resources/AUDIT.md](resources/AUDIT.md)。`source/` 被 Git 忽略，不随本仓库发布。
- `resources/styles/mg-styles-15/`：上游固定版本 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；上游动画、Prompt 与成片版权归原作者，MIT 文本保留在 UPSTREAM-LICENSE；本地复现工程已清理，总结见 [案例库](docs/library/cases/README.md)。
- `resources/styles/lemo-opuscar/`：[lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)（MIT，© 2026 LemoLab）；各风格素材许可逐项见上游 `CREDITS`（CC0、CC BY 等），再分发须保留署名与条款。
- `resources/prompt-libraries/code-animation-prompts/`：[P09](docs/theory/extractions/projects/P09-code-animation-prompts.md) 基于 [XiaoyeCodes/code-animation-prompts](https://github.com/XiaoyeCodes/code-animation-prompts) 固定版本 `69ccbeaf0b821591a40936572c2f559d8f4cfb68`；合集非统一 MIT，第三方部分按原许可。
- `resources/prompt-libraries/fifi-video-prompt/`、`resources/workflows/`、`resources/skills/`、`resources/engines/`、`resources/collections/`：各自上游许可见 [resources/README.md](resources/README.md) 与来源笔记；P16 Onetake 为 PolyForm Noncommercial 1.0.0，不能默认商用；P12 Open Design 只保存可读部分；P22 video-shotcraft 为 Apache-2.0 代码、素材另计。
- [P10 · Ploto 文章](docs/theory/extractions/projects/P10-ploto-long-video-workflow.md)：正文 CC BY 4.0；摘要为转述与新增解释，保留作者、链接与许可；文章引用的第三方作品保留各自权利。
- P19／P20／P21 作品索引的根许可不自动覆盖原作者 Prompt、视频、音轨与品牌素材；[P21](docs/theory/extractions/projects/P21-awesome-claude-videos.md) 的原创写作、表格与图示为 CC BY 4.0，本文只做结构化转述。
- `docs/theory/extractions/` 是对公开视频、仓库和官方文档的结构化摘要，不是逐字稿。原始视频、登录会话、OCR 缓存与采集素材不发布。
- `catalog/catalog.json` 保留上游名称、短描述和标签的出处与版本，不复制完整 Prompt 或媒体；引用部分继续适用原权利边界，不归根 MIT。下载快照不等于获得公开托管、再分发或商用授权。
- 依赖：AJV（MIT）、Marked（MIT）、Playwright 测试工具（Apache-2.0），准确版本由 `package-lock.json` 固定；分发依赖时保留其包内许可与通知。Lucide 已随 Web 工作台移除。
- 各案例使用的外部字体、库与纹理须按各自来源和许可证获取并保留授权信息。复现者应阅读对应案例说明。

本页是仓库导航，不替代各素材自带的完整许可证。新增素材或代码时，应先记录来源与许可，再更新本页。
