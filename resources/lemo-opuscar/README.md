# lemo-opuscar：51 种纯代码影片风格（上游快照）

来源：[lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)，MIT，固定版本 `b5e8ef93930b6d828f352055a689320f138237b1`（`main`，该分支 2026-10-19 最后一次提交）。登记／下载：2026-10-20，仅下载与静态核查，未安装为全局 Skill。

本目录只保存上游快照，不包含 VideoLab 自己的复现工程。2026-11 清理时已删除当时的白板试片，其经验摘要见 [docs/library/cases/lemo-whiteboard-trial.md](../../docs/library/cases/lemo-whiteboard-trial.md)。

## 它是什么

一套面向编码 agent 的短片风格库：每种风格 = 一份 `STYLE.md`（观感、色彩、字体、运动、镜头、声音与常见坑）＋ 一份 `DEMO.md` ＋ 一支完全由代码渲染的 demo 片。上游把“风格”固定、把“故事”留给使用者，agent 负责导演与制作。

- 51 种风格，分 10 类：实证影像 8、手绘与绘画 7、东方传统 4、印刷与版画 5、图形与排版 7、信息与发布 5、卡通与动画 4、游戏 4、电影与时代 2、材质与 3D 5。索引见 `source/styles/README.md`。
- 配套指南：`DIRECTOR.md`（剧本、声音、节奏、检查、交付）、`TECHNIQUE.md`（逐帧渲染、配音、配乐、混音）、`MY-STYLES.md`（改一个风格并留作自己的）、`core/`（渲染、TTS、采样器、混音工具）、`tools/fetch.sh`（字体以外的模型与乐器素材）。
- 发行形态是 Claude Code 插件（`plugin/skills/` + `.claude-plugin/marketplace.json`）。作者在 README 明确：风格按 Claude Opus 5.5 调，其他模型适配度不高。

51 个风格入口已纳入 [风格索引](../../docs/library/STYLES.md)；结构化条目见 [catalog](../../catalog/README.md) 的 `lemo-*`。

## 本地安装状态

- 源码快照：`source/`，不随仓库提交（`.gitignore` 的 `resources/*/source/`）。
- 来源是 codeload 的 zip（本机 git 配置指向未启动的 `127.0.0.1:7897` 代理，无法直接 clone）：压缩包 90.9 MB / 解压 104.9 MB / 2099 个文件，zip sha256 `70bc85cf58c98ac734789ac4f52d48f16e61d65315088f78e596c4b5a69724bb`。
- 因此 `source/` **没有 `.git`**：不能 `git pull`。更新时重新下载并核对 commit 与哈希，再补记差异。
- 目录体积：`styles/` 74.1 MB（含各风格 demo 源码与图片）、`styleboard/` 14.1 MB、`core/` 12.2 MB、`docs/` 4.2 MB、其余 < 1 MB。
- 未执行 `plugin/skills/lemo-opuscar/scripts/setup.sh`、`deps`、`fetch.sh`；未装 npm 包、Playwright Chromium、venv 或语音／乐器模型（最大包约 400 MB 级，按需再取）。

## 风险核查（2026-10-20，静态扫描）

结论：**作为离线研究快照风险低**。依据：

- **许可**：代码 MIT（© 2026 LemoLab）。各 demo 素材在 `CREDITS` 里逐项标注：CC0／CC BY（Poly Haven HDRI、OpenSlide 测试数据、Salamander 钢琴 CC BY 3.0、Versilian 等采样库）。用到具体风格时须先读该风格的 `CREDITS`，CC BY 素材需要署名。
- **代码形态**：只有 `.js/.mjs/.py/.sh`，无二进制、无混淆代码；`package.json` 仅 `playwright-core`、`three`，**没有** `install`/`postinstall` 脚本。
- **安装脚本**：`setup.sh` 只做稀疏 clone、`npm install`、下载 Playwright Chromium、建 venv 并 `pip install`；`rm -rf` 仅作用于它自己的克隆目录和损坏的 venv；无 `sudo`、无读取凭据／SSH 密钥、无 `curl | sh`。
- **网络**：安装与取素材会访问 GitHub、npm、PyPI、Playwright CDN、HuggingFace 镜像、Poly Haven、OpenSlide 等公开源；部分 demo 的 `build.sh` 用 `curl` 拉公开数据（Natural Earth GeoJSON、3D BAG、OpenSlide 测试切片、Scott Buckley 音乐）。
- **提示词面**：`AGENTS.md`／`CLAUDE.md`／`SKILL.md` 是写给编码 agent 的长指令，会指挥 agent 直接开工。它们**不作为**本仓库 agent 的常驻规则，只在具体实验时按 VideoLab 规则选择性读取，避免上游规范覆盖本项目的方法与验收。
- 未发现后门、凭据外传或隐蔽执行。需要网络与第三方依赖，与任何开源仓库一样，按“先读后跑”处理。

## 将来如何接入

1. 读 `STYLE.md` + `DEMO.md`，源码重建该风格的 demo 片，记录环境差异。
2. 对照代码拆解“设计意图 → 视觉决策 → 代码”，补设计／方法笔记。
3. 换一个新概念做迁移片，检查后再写经验记录。

建议先做 **一笔画 One-line Drawing**：与 [一笔画案例](../../docs/library/cases/deepseek-onetake.md) 和 [线条动画案例](../../docs/library/cases/mg-03-line-art.md) 形成横向对照，成本最低；其后可选 **数据叙事** 或 **等距信息图**（衔接科普方向）；**实证影像** 需要真实数据／扫描件，成本较高，放到后面。

## 已知限制

- 本机 `ffmpeg` 不在 PATH（Node 24、npm 11、Python 3.11 已有），渲染链未验证。
- 非 git 快照，无法追溯中间提交，只能按固定 commit 重新下载。
- 仓库仍在更新（2026-10-19 有提交），本文件的版本身份需要随上游变化重新核对。
- 上游面向 Claude Code，Windows 下的脚本以 `sh` 为主，首次运行可能还需 Git Bash 或 WSL；这一点在真正开工时验证。
