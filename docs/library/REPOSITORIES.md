# 第二批关联仓库：获取、阅读与许可状态

核查日期：2026-10-29。上一轮只下载 P09；本次补查 V09 的准确工程与 P10 的直接外链。**新增 10 个完整 ZIP 快照、1 个选择性文档快照**，没有安装依赖、全局 Skill、调用模型或运行演示。完整 ZIP 指该提交的仓库归档，不包括 Git 历史、子模块／LFS 实体或站外资产的完整性保证。

入口：[来源索引](SOURCES.md) · [模型／Skill 路由](ROUTING.md) · [视频覆盖](../theory/BATCH_02_INTAKE.md)

## 已保存范围

本地目录均位于 `docs/theory/_sources/`，不纳入提交。新机器应从固定提交重新获取，不能依赖本机缓存；正文的固定文件树链接也可替换为 `https://codeload.github.com/<owner>/<repo>/zip/<commit>` 获取 ZIP。

| 来源／固定版本 | 本地目录 | 获取与实际阅读 | 许可边界 |
| --- | --- | --- | --- |
| [P09 code-animation-prompts](../theory/extractions/projects/P09-code-animation-prompts.md) `69ccbeaf0b82` | `code-animation-prompts/` | 上一轮已存全快照；341 条索引／555 素材哈希、核心工具，未精读全部 Prompt | 合集非统一 MIT；免费分享条件与第三方条款分开 |
| [P11 auto-motion](../theory/extractions/projects/P11-auto-motion.md) `17ead629d010` | `auto-motion-17ead629d010/` | 完整 ZIP，239 文件；README、主 Prompt、调用模板、测试脚本已读 | 根目录未见全项目 LICENSE；内嵌 Skill 不能替代主项目授权 |
| [P12 open-design](../theory/extractions/projects/P12-open-design.md) `fa19ff40e34d` | `open-design-fa19ff40e34d/` | **仅 49 文件**：核心文档与 25 个 Skill 入口；不是可运行 checkout | 根 Apache-2.0；各 Skill、模板、素材可能例外，未收齐所有许可证 |
| [P13 manim-skill](../theory/extractions/projects/P13-manim-skill.md) `a0048d9e2654` | `manim-skill-a0048d9e2654/` | 完整 ZIP，14 文件；README 与根许可初读 | MIT；权重、音源和依赖另查 |
| [P14 Remotion Skills](../theory/extractions/projects/P14-remotion-skills.md) `30d4553ecd46` | `skills-30d4553ecd46/` | 完整 ZIP，293 文件；README 初读与根文件检查 | 根未见单独 LICENSE；不继承 VideoLab MIT，软件商业使用条件另查 |
| [P15 HyperFrames](../theory/extractions/projects/P15-hyperframes.md) `4e2a1c215a42` | `hyperframes-4e2a1c215a42/` | 完整 ZIP，9,456 归档文件；README 初读；两处内部符号链接在解压目录转为目标副本 | Apache-2.0；外部素材、依赖和服务另查 |
| [P16 Onetake](../theory/extractions/projects/P16-onetake.md) `013a61ac8d98` | `onetake-013a61ac8d98/` | 完整 ZIP，114 文件；方法与工具／许可初读；**案例不含影片源码** | PolyForm Noncommercial 1.0.0，不能默认商用 |
| [P17 Anidoodle](../theory/extractions/projects/P17-anidoodle.md) `40d2c3e4debe` | `anidoodle-40d2c3e4debe/` | 完整 ZIP，1,830 文件；中文 README 前 160 行与 NOTICE 初读 | Apache-2.0；可选音源、空间响应、素材另有条款 |
| [P18 Claudian](../theory/extractions/projects/P18-claudian.md) `6168cd004988` | `claudian-6168cd004988/` | 完整 ZIP，1,590 文件；README 的使用、隐私与架构初读 | MIT；Obsidian、CLI、服务和其他插件另计 |
| [P19 Awesome AI Motion](../theory/extractions/projects/P19-awesome-ai-motion.md) `8733ddf7cb18` | `awesome-ai-motion-8733ddf7cb18/` | 完整 ZIP，5,381 文件；README、第三方范围初读，未逐片看 | 自编部分 MIT，第三方 Prompt／视频等不在其中 |
| [P20 Awesome Opus Videos](../theory/extractions/projects/P20-awesome-opus-videos.md) `92aee2f586ac` | `awesome-opus5-5-videos-92aee2f586ac/` | 完整 ZIP，707 文件；概况与分类初读，未精读 703 条目 | 根 MIT 不替代原帖／Prompt／媒体授权 |
| [P21 Awesome Claude Videos](../theory/extractions/projects/P21-awesome-claude-videos.md) `87e5cbfaa4bf` | `awesome-claude-5-5-videos-87e5cbfaa4bf/` | 完整 ZIP，322 文件；中文 README 与第三方范围，未重算分析 | 原创说明 CC BY 4.0，媒体与外链保留各自权利 |

表内文件数来自 ZIP 清单，不代表逐个阅读、独立方法数或可运行项目数。P13–P21 主要是范围明确的初读，只有 P11／P12 做了针对当前编排问题的核心提取。

## 原始归档 SHA-256

以下为本次网络获取内容的留存校验，不是签名、恶意代码扫描或可执行性证明。完整 commit 在各来源笔记；ZIP 名为上述本地目录名加 `.zip`。

```text
auto-motion          3f3f219fe7da0f1d33fea25302e849391e55cba0d804c6c1a2a4f035867ac9da
manim-skill          aee63c9a65c03739bbc9f40d8bb3284d95185eeed6c566980b9270f858e3c0e3
remotion-skills      9415e530efccaa73265842f589e97216e49e2de5ec156521ede6e5101bf36d69
hyperframes          92c2f53518c183127f37687091772c1602c40242379554b4deb1e0737902f496
onetake              61377c5a936702db93b173a81b45d626acf097b6fa994bc8d07b05f25bf4eaf9
anidoodle            f05df98266031c6dfaddacbca56694bb351ad373188c00b6c25184a4062b5b56
claudian             a3ddceb398c64c669a7a83b25670e1cce74124aca791e1cead6983c106a04e69
awesome-ai-motion    ea7f9d080546d38863d24b36093d2a36e354eafa2ae1c64dc90229b4a413ade2
awesome-opus-videos  58ff819b5e845b7f8efc377d2d924d3b66eb8a405819c4450fc474fb06eef106
awesome-claude       36420cf004e16bbb5d9488e87957d55978fe91d1fc88c19bf54847ab4ef21424
```

本机详情：`docs/theory/_evidence/batch02-access/followup/repo-downloads.json`；Open Design 逐文件清单与哈希在同目录 `nexu-io--open-design-selected.json`。证据缓存不提交，不包含可发布的登录凭据。P09 的素材清单校验另见其来源笔记。

## 没有取得的东西

- `Bae-ChangHyun/code-video` 的准确已记录地址本次返回 404。无法仅由 404 判断删除、转私有或改名；不伪造成功下载。
- `vibe-motion/vibe-motion` 试查也为 404。V09 的 `vibe-motion` 名称不证明存在同名独立仓库；能由画面确认的公开工程是 `vibe-motion/auto-motion`。
- V09 的 Self-Harness 论文、所谓 Google 评测表仍缺可确认的准确出处；不随意匹配同名项目。
- V07 的十五套模板附件仍未取得。公开热评接口第一页没有给出准确附件入口；没有登录、购买第三方 API 或读取浏览器凭据。
- P10 完整长片工程、作者自制插件、账单和运行日志未公开取得。三个作品集的全部外链也不在本次下载范围，不递归展开成无限收集队列。
- Open Design 全库与 Skill 引用文件没有收齐。整包超过本轮上限后中止，过滤式 Git 连接重置；不能将 49 个入口说成完整软件已备好。

缺口不妨碍先提取方法，但在来源或关键依赖不全时不能把对应 recipe 标为可执行。当前下一步是按任务选少量组合，见 [ROUTING.md](ROUTING.md)，不是逐仓库做一个新 demo。

## 本次检查

十个新 ZIP 的 CRC、SHA-256 与清单一致；Open Design 的 49 份文件哈希一致。已核对来源笔记编号与相对链接、四条视频采样时间覆盖，并对 auto-motion 的三份 Shell 脚本做 `bash -n` 语法检查。没有运行端到端测试、制作模型、渲染或完整视听；这些静态检查不证明生成质量与可执行性。OCR 后台任务已结束，未完成的整包临时文件已清理。
