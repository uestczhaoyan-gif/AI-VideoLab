# 资源库（本地快照）

这里放“辅助生成视频”的开源资源与知识原材料。`source/` 是上游仓库/站点快照，约 **2.1 GB**，**不进入 Git 历史**（体量大、许可各异）；完整获取方式见 [PACKS.md](PACKS.md)，固定版本与大小见 [MANIFEST.md](MANIFEST.md)，抽检见 [AUDIT.md](AUDIT.md)。仓库里会提交本页、MANIFEST 与各分类说明，用户不必只拿到一个空 Workflow。

## clone 仓库后先执行什么

```sh
npm run resources:fetch -- --dry-run   # 列出将下载的固定版本
npm run resources:fetch                # 下载全部（约 2.1 GB，P12 默认跳过）
```

只想要 Prompt/风格：

```sh
npm run resources:fetch -- --only P09,P02,LEMO
```

也可以下载 Release 中的分类 ZIP 解压到 `resources/`（[PACKS.md](PACKS.md)）。仓库内已包含 `prompts/` 文本包，不完全依赖下载才能读 Prompt。

## 目录

| 分类 | 目录 | 内容 |
| --- | --- | --- |
| 风格工程 | `styles/lemo-opuscar/` | LEMO 51 个风格工程、poster、渲染与风格文档 |
| 风格 Prompt | `styles/mg-styles-15/` | MG 15 个风格 Prompt、demo 工程、5 条演示视频 |
| Prompt 库 | `prompt-libraries/code-animation-prompts/` | P09：341 条风格 Prompt 与索引、B6/X7 示例 |
| Prompt 库 | `prompt-libraries/fifi-video-prompt/` | P03：高度具体的代码动画 Prompt |
| 引擎 | `engines/manim/` | P05：3b1b/manim 源码 |
| 引擎 | `engines/hyperframes/` | P15：可寻址 HTML 动画与 MP4 导出 |
| 引擎 | `engines/anidoodle/` | P17：逐笔构建的程序化绘画/动画 |
| 引擎 | `engines/onetake/` | P16：相邻段承接工具链（非商业限制） |
| 引擎 | `engines/video-shotcraft/` | P22：124 张镜头卡 / 150 镜头 + Remotion 实现 |
| 研究 | `studies/anatomy/` | P08：交互图解引擎 |
| Skill | `skills/auto-motion/` | P11：字幕驱动导演与单镜头模板 |
| Skill | `skills/manim-skill/` | P13：Manim Skill |
| Skill | `skills/open-design/` | P12：只保存可读部分（上游仓库过大） |
| Skill | `skills/remotion-skills/` | P14：Remotion 官方 Agent Skills |
| Skill | `skills/claudian/` | P18：文件工作台里调用已有 Agent |
| 工作流 | `workflows/ai-promo-video-maker/` | P01：产品宣传片工作流 |
| 工作流 | `workflows/table-video-sop/` | P04：以配音为时基的 SOP |
| 作品索引 | `collections/awesome-ai-motion/` | P19/P23：上千条 AI 动效作品索引 |
| 作品索引 | `collections/awesome-opus5-5-videos/` | P20：Opus 5.5 作品与 Prompt 集合 |
| 作品索引 | `collections/awesome-claude-5-5-videos/` | P21：流程集合 |
| Prompt 文本 | `prompts/` | 入库：LEMO 51 风格、MG 15 Prompt、video-shotcraft 125 镜头卡、manim-skill 文档（约 2.7 MB） |

## 详细 Prompt

资源里的 341 条 CAP Prompt、15 条 MG Prompt、124 张镜头卡与 LEMO 51 个风格工程，读取路径与使用方式见 [PROMPTS.md](PROMPTS.md)。`resources/**/source/` 不进入 Git；用 `npm run resources:fetch` 或 Release ZIP 恢复。

## 抽检与可用性

见 [AUDIT.md](AUDIT.md)。结论按等级区分：

- **checked（参考/待安装）**：目录、入口、README/SKILL/LICENSE 存在，文档确实在讲视频制作；**不代表已安装、已运行或效果已验证**。
- **partial**：只保存了可读部分或文件过少。
- `source/` 不进入 Git；用 `npm run resources:fetch` 从固定版本恢复，或下载 Release 中的分类 ZIP（见 [PACKS.md](PACKS.md)）。

## 规则

- 只把与视频生成直接相关的仓库/文档放在这里；研究证据、逐帧缓存不放。
- 每个资源的许可要回到上游核对；Apache-2.0/MIT 只覆盖代码，不自动覆盖素材、字体、音效、品牌资产。
- 不把下载的 `source/` 提交到 Git；不要用 `git add -f` 绕过忽略。全量通过 Release 附件分发。
- 资源路由与 access 等级见 `catalog/integration.json` 与 [INTEGRATION](../docs/library/INTEGRATION.md)。
