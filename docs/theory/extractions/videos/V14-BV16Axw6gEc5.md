# V14 · 所有 Agent 都能用的 Opus5.5 水准镜头动效

## 来源与实际覆盖

- [原视频](https://www.bilibili.com/video/BV16Axw6gEc5/)，作者“悬剑听泉_Vincent”（B 站 mid 2331814），发布于 2026-10-29 13:17（北京时间），页面时长 2:17（137 秒）。读取日期 2026-11-09。
- 已取得：公开页元数据与完整简介；作者自述“用 Opus5.5 重构了 video-shotcraft 的所有镜头组件，让所有 agent 都能用上更高质更有审美的动效镜头来做宣传片；所有镜头的设计语言、源代码都开源免费”。
- **用户观看后的总结（用户口述，未逐帧核对）**：资源开源仓库在 <https://github.com/Vincentwei1021/video-shotcraft>，有“150 个镜头卡和 Remotion 代码”，可以被别的 Agent 直接复用；多种风格可以同时按需要应用于一个长视频里。
- **未完成**：未做低清流下载、抽帧、语音转写或逐画面核对；未安装或运行该仓库；未取得作者完整 Prompt、工程日志与成本。本笔记的证据等级低于 V01–V13 的逐来源笔记，采用时以 P22 仓库与用户总结为准。

## 用户观察与仓库事实的差异

- 用户说“150 个镜头卡”；仓库 README（固定版本见 [P22](../projects/P22-video-shotcraft.md)）写的是 **124 张配方卡、共 150 个镜头**，分 10 类。两个数字都保留，不合并。
- 仓库描述强调“cinematic, editable product promos with Remotion: 124 shot recipe cards, 150 motion previews, beat sync, sound design, Motion Workbench & JianYing (CapCut CN) export”。它是代码/模板/镜头库，不是视频生成模型。

## 可迁移的流程（按仓库 README/SKILL 归纳，未运行）

1. 给一个真实产品页面或截图作为素材来源，不虚构 UI。
2. Agent 从镜头配方库挑镜头，排成分镜；每张卡有说明与 Remotion demo 实现。
3. 用 Remotion 按代码逐帧生成动画；按音乐卡点剪辑，加入音效与 BGM。
4. 逐帧检查；输出可继续修改的 MP4，以及动效工作台/剪映工程。
5. 同一个长视频可以混用多种镜头风格；镜头卡也可单独抽出来做某个镜头。

## 对 VideoLab 的意义与缺口

- **意义**：它是“镜头库 + 可复用代码 + 六阶段工作流”的成熟封装，正好补我们 recipes 里“镜头词汇”这一层；可与 `real-product`（真实截图包装）和 `code-motion`（代码动效）形成上下游。
- **缺口**：仓库约 201 MB、依赖 Remotion/Node/Puppeteer 和页面抓取；本机未安装未渲染。许可 Apache-2.0（代码），但仓库内预览素材/字体/音效的授权需逐项核查。
- **不能声称**：装上就能自动产出同等质量；作者演示的成片效果与“所有 Agent 都能用”是作者主张，未在本项目复验。
