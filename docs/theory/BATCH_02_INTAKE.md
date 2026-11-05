# 第二批：四条新视频与关联仓库提取

日期：2026-10-29。首轮完成六份笔记；后续补齐 V08 两秒字幕采样，新增 P11–P21 共十一份仓库记录。本批共十七份来源笔记，累计三十份。**资料提取与核心工程补查已推进；完整视听、全部附件与本地制片验证仍未完成。** 第一批十三份笔记保持归档。

入口：[理论来源索引](README.md) · [方法库](../library/README.md) · [风格目录](../library/STYLES.md)

## 能读到什么

四条视频的公开页面、元信息与低清播放文件均可访问。匿名播放器接口对四条都返回 `need_login_subtitle=true`；没有取得独立字幕，没有登录或读取用户浏览器凭据。后续文字主要来自烧录字幕 OCR 与画面核对，而非独立音轨转写。

| 来源 | 页面时长 | 实际完成的阅读／提取 | 本轮范围 |
| --- | --- | --- | --- |
| [V06 · 341 风格与 DeepSeek](extractions/videos/V06-BV1bqx76wEUM.md) | 5:36 | 页面、简介、章节、0–334 秒每两秒烧录字幕与每十秒画面文字，共 168 个采样点 | 有全片时间范围的文字采样，未正常速度完整视听 |
| [V07 · Vibe 科普拆解](extractions/videos/V07-BV1ALnw6YEM7.md) | 3:40 | 页面、简介、章节、0–218 秒每两秒烧录字幕与每十秒画面文字，共 110 点 | 有全片时间范围的文字采样，未取得其模板附件 |
| [V08 · 制作全流程](extractions/videos/V08-BV1xFnt6zE3K.md) | 32:09 | 首轮 128 个不同时间点；后续补齐 0–1928 秒每两秒共 965 个字幕采样并通读文字，全画面仍是稀疏提取，另复看关键帧 | 已非仅章节初读，仍不是逐句转写或完整视听 |
| [V09 · 个人 harness](extractions/videos/V09-BV1Gg3E6BEbn.md) | 3:16 | 页面、元信息、0–194 秒每两秒烧录字幕与每十秒画面文字，共 98 点；补核模型分工与准确仓库 | 已关联 P11／P12；论文与评测出处仍缺 |
| [P09 · code-animation-prompts](extractions/projects/P09-code-animation-prompts.md) | 固定 commit | README、许可、Skill、渲染文档／脚本、完整索引及部分 Prompt；完整文件清单校验 | 未精读全部 341 篇、未安装 Skill／依赖、未制片 |
| [P10 · Ploto 作者博客](extractions/projects/P10-ploto-long-video-workflow.md) | 2026-10-23 原文 | 完整正文、表格、附录及 W01／W03／W04 展示页文字 | 文章与视频分开归属；外链与完整工程未逐项核查 |

四条视频页面标注的总时长为 44:41，解码共得到 1,341 个两秒采样帧，现均完成对应文字采样并读取汇总。**不是逐帧或完整视听**：两秒采样可能漏快闪内容，OCR 有漏字与误读，无字幕演示、运动与声音判断仍未充分覆盖。V08 全画面文字主要每 20 秒抽取，博客阅读单独记作 P10。

## 已保存的开源文件

仓库：`XiaoyeCodes/code-animation-prompts`，固定为 `69ccbeaf0b821591a40936572c2f559d8f4cfb68`。本地完整快照在 `docs/theory/_sources/code-animation-prompts/`，不纳入提交。

- 341 个唯一风格编号与 Prompt，193 张参考静帧、148 个文字条目，引用文件路径全部存在。
- 原素材清单中 555 个文件的 SHA-256 全部通过。
- 3 个原始示例 HTML 与 3 个 MP4、离线挑选网页、Skill、目录 JSON、检索和渲染脚本均已保存。
- 已阅读检索代码后运行 `search 水墨` 和 `show B3`，只读测试成功；没有执行安装脚本、调用模型或渲染。
- 合集按免费分享约定分发，第三方文件保留各自许可，不是统一 MIT。素材包不并入 VideoLab 根 MIT 范围。

本机可打开：[341 风格离线挑选器](_sources/code-animation-prompts/skills/code-animation-prompts/assets/library/风格挑选.html)。这个链接依赖本地忽略提交的快照；公开使用者从 [固定仓库版本](https://github.com/XiaoyeCodes/code-animation-prompts/tree/69ccbeaf0b821591a40936572c2f559d8f4cfb68) 获取后打开同一路径。

## 当前可用的综合认识

1. 风格条目、Prompt 与完整流程分开：341 个条目可以用于检索，但不能直接当作 341 套独立制片方法；与已有 51／15 风格资料也存在重叠。
2. 便宜模型的可行线索来自少量示例；详细输入已经规定很多实现决策，1 元是作者测试费用，不是任意视频的价格保证。
3. 工作流可以复用“难镜头试验 → 内容／风格／时间确认 → 分段制作 → 局部重渲 → 问题闭环”，不必照搬作者的软件和订阅。
4. 大量资料按需检索，制作时只加载当前相关部分；有无 Skill 的改善需要按具体模型和任务检验，而非无限叠加规则。
5. 文章对 API 标价、订阅分摊、人时和渲染耗时分别记账，这个口径值得保留，价格与服务名称仍需使用时向官方核查。

这些是跨来源归纳，不代表本项目已验证新的通用流水线。V06/P09、V08/P10 分别是相关来源，不计成两次独立实验。

## 后续补查的关联仓库

由 V09 仓库画面及用户给出的准确地址补取 [P11 auto-motion](extractions/projects/P11-auto-motion.md) 与 [P12 Open Design](extractions/projects/P12-open-design.md)。前者是完整 ZIP 和核心代码阅读，后者只取得 49 个核心文件，不能称为全库下载。

以下 P10 的直接外链已补为固定版本快照与范围明确的初读，详见 [获取、哈希与许可清单](../library/REPOSITORIES.md)。没有安装或运行，也没有逐项核查作品集的全部外链：

| 线索 | 入口 | 后续研究用途 |
| --- | --- | --- |
| [P19 Awesome AI Motion](extractions/projects/P19-awesome-ai-motion.md) | https://guanmo-ai.github.io/awesome-ai-motion/ | 完整仓库快照；按题材发现原帖、Prompt 与源码线索，未逐片看 |
| [P20 Opus 视频集合](extractions/projects/P20-awesome-opus-videos.md) | https://github.com/yihui-dev/awesome-opus5-5-videos | 完整仓库快照；Prompt 与原帖入口，站外重做源码未取 |
| [P21 Claude 视频路径集合](extractions/projects/P21-awesome-claude-videos.md) | https://github.com/athemeroy/awesome-claude-5-5-videos | 完整快照；中文 README 与权利范围初读，未重算研究 |
| [P13 Manim Skill](extractions/projects/P13-manim-skill.md) | https://github.com/Yusuke710/manim-skill | 完整快照；旁白计时与数学／解释动画候选 |
| [P14 Remotion Skills](extractions/projects/P14-remotion-skills.md) | https://github.com/remotion-dev/skills | 完整快照；官方工序指导，根未见独立 LICENSE |
| [P15 HyperFrames](extractions/projects/P15-hyperframes.md) | https://github.com/heygen-com/hyperframes | 完整 ZIP；两处内部链接在 Windows 解压目录展开为副本 |
| [P16 Onetake](extractions/projects/P16-onetake.md) | https://github.com/feitangyuan/onetake | 完整快照；非商业许可，演示影片源码不随仓库提供 |
| [P17 Anidoodle](extractions/projects/P17-anidoodle.md) | https://github.com/alexgreensh/anidoodle | 完整快照；逐笔绘画／程序化媒介候选，音源条款另计 |
| [P18 Claudian](extractions/projects/P18-claudian.md) | https://github.com/YishenTu/claudian | 完整快照；文件与 Agent 工作台，未取得作者自制全部插件 |
| code-video | https://github.com/Bae-ChangHyun/code-video | 准确已记录地址本次 404，未下载独立工程 |

V09 的 `vibe-motion` 是否另有独立仓库仍不确定；同名路径返回 404。Self-Harness 与评测表仍需准确出处。V07 公开热评第一页未给出模板附件，未扩大成“全部评论已检索”。

新增关键认识：V09 把**生产时多模型按任务／风格分工**与**评测时固定模型测试 Skill 增益**放在不同层次；当前 auto-motion 源码使用 HyperFrames，视频示例讲 React／Remotion，版本不能混用。落地建议见 [ROUTING.md](../library/ROUTING.md)，不写成已实现的路由器。

## 缓存与后续范围

访问响应、下载记录、SHA-256、解码帧清单、OCR 与网页缓存保存于忽略提交的 `docs/theory/_evidence/batch02-access/`；不发布播放 URL、逐字 OCR、原视频或用户会话。原素材校验为 `catalog-audit.json`，覆盖为 `coverage-audit.json`；本次补查详情在 `followup/`，V08 合并覆盖在 `ocr/BV1xFnt6zE3K-merged-audit.json`。OCR 任务已结束。

后续只按具体缺口补 V07 附件、V09 引用出处、V08 的运动／声音与完整工程。制作推进按“候选组合 → 代表难点短对照 → 局部返修 → 真实任务”进行，不逐个风格做完整 demo；不自动安装生成工具、不购买 API，也不把未完成的视听／跨模型验证写成通过。
