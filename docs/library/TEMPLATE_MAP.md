# 模板 → Prompt → Workflow 对照表

生成文件，请勿手改；重建命令：

```sh
npm run catalog:map
```

机器可读版本：[catalog/template-map.json](../../catalog/template-map.json)。这是**路由辅助**，不是执行证明：只有 `execution=auto_style` 且 `cli_style` 非空的模板已被 `code-motion` 真正接进渲染链路。

## 来源总览

| 来源 | 名称 | 模板数 | 建议 Workflow | 说明 |
| --- | --- | ---: | --- | --- |
| LEMO | lemo-opuscar 风格工程 | 51 | V04 / V06 | 51 个风格 STYLE/DEMO；当前只把 blueprint、ink-wash 接成可执行模板。 |
| P01 | ai-promo-video-maker：产品宣传片工作流提取 | 0 | V01 / V05 | — |
| P02 | mg-styles-15：多风格代码动画方法提取 | 15 | V06 / V11 | 15 条 MG 风格 Prompt + demo；当前只把 09-bauhaus 接成可执行模板。 |
| P03 | fifi-video-prompt：高度具体的代码动画 Prompt | 0 | V06 / V11 | — |
| P04 | Table-VideoSOP：以配音为时基的人机制作流程 | 0 | V05 | — |
| P05 | 3b1b/manim：程序化解释动画的工具边界 | 0 | V07 / V10 | — |
| P06 | Manim Community：对象、动画与场景 | 0 | V07 | — |
| P07 | Remotion：把视频表示为逐帧组件 | 0 | V10 | — |
| P08 | Anatomy：把概念做成可工作的物体 | 0 | V03 / V07 | — |
| P09 | Code Animation Prompts：341 条风格素材与代码动画工具包 | 341 | V06 / V11 | 341 条风格 Prompt；先选 1–3 条，再由 code-motion/Agent 改写，不一次性全读。 |
| P10 | Ploto：我是如何借助 AI 制作一支长视频的 | 0 | V08 | — |
| P11 | auto-motion：字幕驱动的导演与单镜头执行模板 | 0 | V09 / V12 | — |
| P12 | Open Design：Agent 适配、按需 Skill 与设计工作台 | 0 | V09 / V13 | — |
| P13 | Manim Skill：旁白计时与代码动画 | 0 | V07 / V10 | — |
| P14 | Remotion Agent Skills：按工序加载的官方指导 | 0 | V10 | — |
| P15 | HyperFrames：可寻址 HTML 动画与 MP4 导出 | 0 | V12 / V14 | — |
| P16 | Onetake：设计相邻段之间的承接 | 1 | V08 | — |
| P17 | Anidoodle：逐笔构建的程序化绘画与动画 | 0 | V03 | — |
| P18 | Claudian：在文件工作台中调用已有 Agent | 0 | V08 / V13 | — |
| P19 | Awesome AI Motion：按题材发现参考与制作线索 | 0 | V02 / V03 | — |
| P20 | Awesome Opus 5.5 Videos：原帖与 Prompt 集合 | 0 | V02 / V03 | — |
| P21 | Awesome Claude 5.5 Videos：带来源与覆盖标记的流程集合 | 0 | V02 / V03 | — |
| P22 | video-shotcraft：镜头配方卡 + Remotion 产品宣传片 | 1 | V14 | 125 张镜头卡 + Remotion 实现；作为镜头语言参考，不是 124 个自动执行器。 |
| P23 | Awesome AI Motion：上千条 AI 动效作品索引 | 1 | V14 | — |
| V01 | 0 基础，带你做出你人生第一个 AI 视频 | 0 | — | — |
| V02 | Opus 5.5 与 G*T 6 Astra 的视频比较 | 0 | — | — |
| V03 | GPT6 直出的视频是什么效果 | 0 | — | — |
| V04 | Opus5.5 为啥审美这么好？我研究了下发现… | 0 | — | — |
| V05 | 用 Agent 做讲解视频：我的 AI 视频制作流程和开源 SOP | 0 | — | — |
| V06 | 341 种风格提示词：Opus 代码动画，DeepSeek 也能做 | 0 | — | — |
| V07 | Vibe 科普动画的拆解：任务、受众、内容、风格与规格 | 0 | — | — |
| V08 | 全网 150 万播放的 AI 动画：短片尝试与长片制作全流程 | 0 | — | — |
| V09 | 如何构建个人 harness？从 vibe 动画到 auto 动画 | 0 | — | — |
| V10 | DSH + V4.1F + Remotion：46 秒全代码逐帧生成的展示片 | 0 | — | — |
| V11 | 代码动画加强版：fy-code-animation v1.0.0（俯仰观照） | 0 | — | — |
| V12 | AI 做动画视频完全指南：原理、技巧、Skill 一次给全 | 0 | — | — |
| V13 | Harness 实践：让 Agent 全自动制作知识讲解视频 | 0 | — | — |
| V14 | 所有 Agent 都能用的 Opus5.5 水准镜头动效 | 0 | — | — |

## 已接入执行链的 3 个风格

| 模板 ID | CLI 风格 | Prompt/规格 |
| --- | --- | --- |
| lemo-blueprint | `blueprint` | `resources/prompts/lemo/blueprint/STYLE.md` |
| lemo-ink-wash | `ink-wash` | `resources/prompts/lemo/ink-wash/STYLE.md` |
| mg-09-bauhaus | `bauhaus` | `resources/prompts/mg/09-bauhaus.md` |

## 全部模板

> 410 行。`执行` 为 `auto_style` 才是已接入；其余是 `prompt_reference` / `resource_reference`，用 Agent 读取后改写，或先安装对应上游引擎。

| ID | 名称 | 来源 | Prompt/规格 | Workflow | 执行 | recipe |
| --- | --- | --- | --- | --- | --- | --- |
| cap-a1 | 字雨 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/A1_字雨.md` | V06 / V11 | prompt_reference | code-motion |
| cap-a2 | 光标打字 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/A2_光标打字.md` | V06 / V11 | prompt_reference | code-motion |
| cap-a3 | 大字冲击 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/A3_大字冲击.md` | V06 / V11 | prompt_reference | code-motion |
| cap-a4 | 字的隧道 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/A4_字的隧道.md` | V06 / V11 | prompt_reference | code-motion |
| cap-a5 | 字散了再聚 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/A5_字散了再聚.md` | V06 / V11 | prompt_reference | code-motion |
| cap-b1 | 流动的丝线 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/B1_流动的丝线.md` | V06 / V11 | prompt_reference | code-motion |
| cap-b2 | 萤火光尘 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/B2_萤火光尘.md` | V06 / V11 | prompt_reference | code-motion |
| cap-b3 | 粒子聚形 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/B3_粒子聚形.md` | V06 / V11 | prompt_reference | code-motion |
| cap-b4 | 星空连线 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/B4_星空连线.md` | V06 / V11 | prompt_reference | code-motion |
| cap-b5 | 呼吸的圆 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/B5_呼吸的圆.md` | V06 / V11 | prompt_reference | code-motion |
| cap-c1 | 水墨晕开 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/C1_水墨晕开.md` | V06 / V11 | prompt_reference | code-motion |
| cap-c2 | 一笔画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/C2_一笔画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-c3 | 心里的等高线 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/C3_心里的等高线.md` | V06 / V11 | prompt_reference | code-motion |
| cap-c4 | 涟漪 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/C4_涟漪.md` | V06 / V11 | prompt_reference | code-motion |
| cap-d1 | 雨窗 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/D1_雨窗.md` | V06 / V11 | prompt_reference | code-motion |
| cap-d2 | 窗光与尘 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/D2_窗光与尘.md` | V06 / V11 | prompt_reference | code-motion |
| cap-d3 | 雪与火星 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/D3_雪与火星.md` | V06 / V11 | prompt_reference | code-motion |
| cap-d4 | 天亮 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/D4_天亮.md` | V06 / V11 | prompt_reference | code-motion |
| cap-e1 | 极简几何 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/E1_极简几何.md` | V06 / V11 | prompt_reference | code-motion |
| cap-e2 | 剪纸层叠 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/E2_剪纸层叠.md` | V06 / V11 | prompt_reference | code-motion |
| cap-e3 | 字符画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/E3_字符画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-f1 | 图表生长 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/F1_图表生长.md` | V06 / V11 | prompt_reference | code-motion |
| cap-f2 | 关系图 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/F2_关系图.md` | V06 / V11 | prompt_reference | code-motion |
| cap-f3 | 分屏对比 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/F3_分屏对比.md` | V06 / V11 | prompt_reference | code-motion |
| cap-g1 | 老胶片 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/G1_老胶片.md` | V06 / V11 | prompt_reference | code-motion |
| cap-g2 | 信号故障 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/A-G_代码样片/G2_信号故障.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m1 | 白板手绘讲解 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M1_白板手绘讲解.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m2 | 纸感手写笔记 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M2_纸感手写笔记.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m18 | 数学/科学讲解（3Blue1Brown 那种） | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M18_数学·科学讲解（3Blue1Brown 那种）.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m19 | 零基础科普 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M19_零基础科普.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m20 | 时间线/历史 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M20_时间线·历史.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m21 | 原理拆解（它是怎么工作的） | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M21_原理拆解（它是怎么工作的）.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m22 | 配方式步骤 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M22_配方式步骤.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m23 | 五幕讲解（万能讲解模板） | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M23_五幕讲解（万能讲解模板）.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m24 | 四段式发布片 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M24_四段式发布片.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m8 | 口播 + 逐字字幕 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M8_口播 + 逐字字幕.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m9 | 情绪弧线：混乱、掌控、清晰 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M9_情绪弧线：混乱、掌控、清晰.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m10 | 把一个抽象概念、一种情绪做成画面 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M10_把一个抽象概念、一种情绪做成画面.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m11 | 人生循环 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M11_人生循环.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m12 | 剪纸皮影 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M12_剪纸皮影.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m13 | 手绘定格，第一人称 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M13_手绘定格，第一人称.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m27 | 无对白短片，声音讲一半 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M27_无对白短片，声音讲一半.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m28 | 对称暖色的电影感空镜 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M28_对称暖色的电影感空镜.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m29 | 日落天空的 3D 空镜加一句话 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M29_日落天空的 3D 空镜加一句话.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m30 | 东方意境 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M30_东方意境.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m31 | 粘土定格 MV | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M31_粘土定格 MV.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m3 | 文字建筑（口播金句专用） | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M3_文字建筑（口播金句专用）.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m25 | 歌词卡点 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M25_歌词卡点.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m36 | 破框 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M36_破框.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m4 | 一个元素串全片 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M4_一个元素串全片.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m5 | 一镜到底 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M5_一镜到底.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m33 | 从一个点拉远到宇宙 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M33_从一个点拉远到宇宙.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m38 | 一个形状变到底 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M38_一个形状变到底.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m37 | Logo 慢慢拼出来（片头片尾） | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M37_Logo 慢慢拼出来（片头片尾）.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m6 | 苹果发布会风 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M6_苹果发布会风.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m7 | 极简卡点 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M7_极简卡点.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m32 | 竖屏快节奏 POV | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M32_竖屏快节奏 POV.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m34 | 新闻快讯盘点 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M34_新闻快讯盘点.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m14 | 未命名条目 M14 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M14_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m15 | 未命名条目 M15 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M15_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m16 | 未命名条目 M16 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M16_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m17 | 未命名条目 M17 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M17_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m26 | 未命名条目 M26 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M26_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m35 | 未命名条目 M35 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M35_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m39 | 未命名条目 M39 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M39_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-m40 | 未命名条目 M40 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/M_动态风格/M40_.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k1 | 扁平矢量 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K1_扁平矢量.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k2 | Q 版 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K2_Q 版.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k3 | 卡哇伊 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K3_卡哇伊.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k4 | 极简线条小人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K4_极简线条小人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k5 | 孟菲斯扁平人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K5_孟菲斯扁平人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k6 | 清线漫画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K6_清线漫画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k7 | 日式动画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K7_日式动画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k8 | 绘本 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K8_绘本.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k9 | 涂鸦 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K9_涂鸦.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k10 | 粉笔黑板 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K10_粉笔黑板.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k11 | 手账笔记 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K11_手账笔记.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k12 | 报纸四格 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K12_报纸四格.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k13 | 美漫网点 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K13_美漫网点.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k14 | 波普 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K14_波普.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k15 | 橡皮管 1930 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K15_橡皮管 1930.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k16 | 中世纪现代 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K16_中世纪现代.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k17 | 几何 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K17_几何.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k18 | 水彩 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K18_水彩.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k19 | 厚涂 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K19_厚涂.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k20 | 剪纸 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K20_剪纸.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k21 | 手工纸艺 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K21_手工纸艺.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k22 | 折纸 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K22_折纸.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k23 | 拼贴 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K23_拼贴.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k24 | 粘土 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K24_粘土.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k25 | 皮克斯式 3D | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K25_皮克斯式 3D.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k26 | 卡通渲染 3D | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K26_卡通渲染 3D.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k27 | 低多边形 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K27_低多边形.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k28 | 像素 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K28_像素.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k29 | 蓝图 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K29_蓝图.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k30 | 说明书线稿 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K30_说明书线稿.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k31 | 平铺整理 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K31_平铺整理.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k32 | 积木 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K32_积木.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k33 | 地铁图 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K33_地铁图.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k34 | 赛博霓虹 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K34_赛博霓虹.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k35 | 旧学院风 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K35_旧学院风.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k36 | 丝网印刷 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K36_丝网印刷.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k37 | 哥特 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K37_哥特.md` | V06 / V11 | prompt_reference | code-motion |
| cap-k38 | 情景喜剧 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/K_卡通画风/K38_情景喜剧.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z1 | 水墨 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z1_水墨.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z2 | 工笔 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z2_工笔.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z3 | 写意 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z3_写意.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z4 | 山水 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z4_山水.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z5 | 剪纸 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z5_剪纸.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z6 | 年画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z6_年画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z7 | 皮影 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z7_皮影.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z8 | 敦煌 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z8_敦煌.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z9 | 青花 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z9_青花.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z10 | 木版画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z10_木版画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z11 | 京剧脸谱 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z11_京剧脸谱.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z12 | 书法 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z12_书法.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z13 | 水墨漫画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z13_水墨漫画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z14 | 彩铅手绘 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z14_彩铅手绘.md` | V06 / V11 | prompt_reference | code-motion |
| cap-z15 | 温暖水彩科普卡 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/Z_中国风/Z15_温暖水彩科普卡.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h1 | Biennale Yellow | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H1_Biennale Yellow.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h2 | BlockFrame | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H2_BlockFrame.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h3 | Blue Professional | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H3_Blue Professional.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h4 | Bold Poster | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H4_Bold Poster.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h5 | Broadside | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H5_Broadside.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h6 | Capsule | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H6_Capsule.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h7 | Cartesian | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H7_Cartesian.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h8 | Cobalt Grid | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H8_Cobalt Grid.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h9 | Coral | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H9_Coral.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h10 | Creative Mode | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H10_Creative Mode.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h11 | Daisy Days | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H11_Daisy Days.md` | V06 / V11 | prompt_reference | code-motion |
| cap-h12 | Editorial Forest | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/H_现成版式/H12_Editorial Forest.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l1 | 字幕新闻 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L1_字幕新闻.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l2 | 1920 年代新闻片 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L2_1920 年代新闻片.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l3 | 倒计时分屏 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L3_倒计时分屏.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l4 | 延时摄影交响 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L4_延时摄影交响.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l5 | 视觉调查 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L5_视觉调查.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l6 | 构成主义蒙太奇 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L6_构成主义蒙太奇.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l7 | 体育战术板 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L7_体育战术板.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l8 | 电视新闻包装 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L8_电视新闻包装.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l9 | 卫星地图简报 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L9_卫星地图简报.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l10 | 工程方案比较墙 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L10_工程方案比较墙.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l11 | 激光点云扫描 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L11_激光点云扫描.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l12 | 白模投影 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L12_白模投影.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l13 | 数据实体化 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L13_数据实体化.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l14 | 爆炸图拆解 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L14_爆炸图拆解.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l15 | 显微镜故事 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L15_显微镜故事.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l16 | 档案灯箱 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L16_档案灯箱.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l17 | 蜡笔儿童绘本 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L17_蜡笔儿童绘本.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l18 | 水彩笔刷 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L18_水彩笔刷.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l19 | 中国水墨 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L19_中国水墨.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l20 | 油画厚涂 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L20_油画厚涂.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l21 | 一笔画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L21_一笔画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l22 | 白板讲解 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L22_白板讲解.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l23 | 钢笔淡彩 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L23_钢笔淡彩.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l24 | 皮影戏 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L24_皮影戏.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l25 | 浮世绘 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L25_浮世绘.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l26 | 红色窗花剪纸 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L26_红色窗花剪纸.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l27 | 纸雕灯影 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L27_纸雕灯影.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l28 | Risograph 丝网印刷 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L28_Risograph 丝网印刷.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l29 | 复古半调案卷 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L29_复古半调案卷.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l30 | 木刻版画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L30_木刻版画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l31 | 铜版画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L31_铜版画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l32 | 丝印旅行海报 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L32_丝印旅行海报.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l33 | 瑞士动态排版 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L33_瑞士动态排版.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l34 | 60s 间谍片头 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L34_60s 间谍片头.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l35 | 装饰艺术 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L35_装饰艺术.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l36 | 蓝图 / 工程制图 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L36_蓝图 · 工程制图.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l37 | 彩色玻璃窗 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L37_彩色玻璃窗.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l38 | 象形运动图形 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L38_象形运动图形.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l39 | ASCII / CRT 终端 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L39_ASCII · CRT 终端.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l40 | 数据叙事 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L40_数据叙事.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l41 | 等距信息图 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L41_等距信息图.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l42 | 暗色科技发布 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L42_暗色科技发布.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l43 | 活体实机录屏 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L43_活体实机录屏.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l44 | 科幻全息界面 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L44_科幻全息界面.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l45 | 1930s 橡皮管卡通 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L45_1930s 橡皮管卡通.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l46 | 80 年代赛璐璐动画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L46_80 年代赛璐璐动画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l47 | 科幻情景喜剧卡通 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L47_科幻情景喜剧卡通.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l48 | 50s 扁平卡通 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L48_50s 扁平卡通.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l49 | 16-bit 像素 RPG | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L49_16-bit 像素 RPG.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l50 | HD-2D | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L50_HD-2D.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l51 | 微游戏快闪 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L51_微游戏快闪.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l52 | 综艺节奏扁平 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L52_综艺节奏扁平.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l53 | 1920s 默片 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L53_1920s 默片.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l54 | 后室 / 新怪谈 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L54_后室 · 新怪谈.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l55 | 积木玩具 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L55_积木玩具.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l56 | 纸片立体书 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L56_纸片立体书.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l57 | 移轴微缩 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L57_移轴微缩.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l58 | 低多边形等距 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L58_低多边形等距.md` | V06 / V11 | prompt_reference | code-motion |
| cap-l59 | 玻璃质感产品 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/L_Lemo-Opuscar/L59_玻璃质感产品.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v1 | 逐帧手绘 / 抖动线条 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V1_逐帧手绘 · 抖动线条.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v2 | 等距 2.5D | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V2_等距 2.5D.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v3 | 扁平矢量 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V3_扁平矢量.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v4 | 线条画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V4_线条画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v5 | 3D 渲染 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V5_3D 渲染.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v6 | 形变 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V6_形变.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v7 | 贴纸讲解 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V7_贴纸讲解.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v8 | 赛博朋克界面 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V8_赛博朋克界面.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v9 | 拼贴 / 剪贴 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V9_拼贴 · 剪贴.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v10 | 极光与毛玻璃 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V10_极光与毛玻璃.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v11 | 包豪斯几何 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V11_包豪斯几何.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v12 | 80 年代合成波 / VHS | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V12_80 年代合成波 · VHS.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v13 | 像素 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V13_像素.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v14 | 液态流动 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V14_液态流动.md` | V06 / V11 | prompt_reference | code-motion |
| cap-v15 | 综艺花字 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/V_mg-styles-15/V15_综艺花字.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x1 | 手绘 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X1_手绘.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x2 | 品牌动态图形 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X2_品牌动态图形.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x3 | 沙画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X3_沙画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x4 | 歌词 MV | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X4_歌词 MV.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x5 | 卡点素材剪辑 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X5_卡点素材剪辑.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x6 | 界面形变 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X6_界面形变.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x7 | 英雄漫画 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X7_英雄漫画.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x8 | 手账剪贴本 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X8_手账剪贴本.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x9 | 撕纸拼贴 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X9_撕纸拼贴.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x10 | 粒子 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X10_粒子.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x11 | 翻牌显示板 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X11_翻牌显示板.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x12 | 霓虹灯牌 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X12_霓虹灯牌.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x13 | 16-bit 街机 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X13_16-bit 街机.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x14 | CRT 终端 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X14_CRT 终端.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x15 | 热敏小票 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X15_热敏小票.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x16 | 地铁线路图 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X16_地铁线路图.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x17 | 蓝图 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X17_蓝图.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x18 | 漫画书 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X18_漫画书.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x19 | 纪录片 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X19_纪录片.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x20 | 博物馆展览 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X20_博物馆展览.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x21 | 突发新闻 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X21_突发新闻.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x22 | 侦探线索板 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X22_侦探线索板.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x23 | 绘本 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X23_绘本.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x24 | RPG 任务 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X24_RPG 任务.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x25 | 天气预报 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X25_天气预报.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x26 | 电视购物 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X26_电视购物.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x27 | 体育直播 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X27_体育直播.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x28 | 组装说明书 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X28_组装说明书.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x29 | 白板讲课 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X29_白板讲课.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x30 | 电影预告片 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X30_电影预告片.md` | V06 / V11 | prompt_reference | code-motion |
| cap-x31 | 数学证明讲课 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/X_code-video/X31_数学证明讲课.md` | V06 / V11 | prompt_reference | code-motion |
| cap-r1 | 霓虹雨夜 · 电影感 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/R_照参考学来的/R1_霓虹雨夜 · 电影感.md` | V06 / V11 | prompt_reference | code-motion |
| cap-r2 | 80–90 年代复古日漫 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/R_照参考学来的/R2_80–90 年代复古日漫.md` | V06 / V11 | prompt_reference | code-motion |
| cap-r3 | 美式漫画 · 潮流涂鸦 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/R_照参考学来的/R3_美式漫画 · 潮流涂鸦.md` | V06 / V11 | prompt_reference | code-motion |
| cap-r4 | 末日工业 · 暗黑科幻 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/R_照参考学来的/R4_末日工业 · 暗黑科幻.md` | V06 / V11 | prompt_reference | code-motion |
| cap-r5 | 像素赛博 · 复古游戏 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/R_照参考学来的/R5_像素赛博 · 复古游戏.md` | V06 / V11 | prompt_reference | code-motion |
| cap-r6 | 东方赛博 · 国风幻想 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/R_照参考学来的/R6_东方赛博 · 国风幻想.md` | V06 / V11 | prompt_reference | code-motion |
| cap-r7 | 扁平插画 · 黄昏屋顶 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/R_照参考学来的/R7_扁平插画 · 黄昏屋顶.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o1 | 翼 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O1_翼.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o2 | 百老汇旋律 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O2_百老汇旋律.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o3 | 西线无战事 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O3_西线无战事.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o4 | 壮志千秋 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O4_壮志千秋.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o5 | 大饭店 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O5_大饭店.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o6 | 乱世春秋 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O6_乱世春秋.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o7 | 一夜风流 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O7_一夜风流.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o8 | 叛舰喋血记 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O8_叛舰喋血记.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o9 | 歌舞大王齐格飞 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O9_歌舞大王齐格飞.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o10 | 左拉传 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O10_左拉传.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o11 | 浮生若梦 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O11_浮生若梦.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o12 | 乱世佳人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O12_乱世佳人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o13 | 蝴蝶梦 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O13_蝴蝶梦.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o14 | 青山翠谷 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O14_青山翠谷.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o15 | 忠勇之家 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O15_忠勇之家.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o16 | 卡萨布兰卡 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O16_卡萨布兰卡.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o17 | 与我同行 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O17_与我同行.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o18 | 失去的周末 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O18_失去的周末.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o19 | 黄金时代 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O19_黄金时代.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o20 | 君子协定 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O20_君子协定.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o21 | 王子复仇记 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O21_王子复仇记.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o22 | 国王班底 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O22_国王班底.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o23 | 彗星美人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O23_彗星美人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o24 | 一个美国人在巴黎 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O24_一个美国人在巴黎.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o25 | 戏王之王 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O25_戏王之王.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o26 | 乱世忠魂 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O26_乱世忠魂.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o27 | 码头风云 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O27_码头风云.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o28 | 君子好逑 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O28_君子好逑.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o29 | 环游地球八十天 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O29_环游地球八十天.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o30 | 桂河大桥 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O30_桂河大桥.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o31 | 金粉世界 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O31_金粉世界.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o32 | 宾虚 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O32_宾虚.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o33 | 桃色公寓 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O33_桃色公寓.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o34 | 西区故事 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O34_西区故事.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o35 | 阿拉伯的劳伦斯 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O35_阿拉伯的劳伦斯.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o36 | 汤姆·琼斯 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O36_汤姆·琼斯.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o37 | 窈窕淑女 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O37_窈窕淑女.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o38 | 音乐之声 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O38_音乐之声.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o39 | 日月精忠 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O39_日月精忠.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o40 | 炎热的夜晚 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O40_炎热的夜晚.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o41 | 雾都孤儿 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O41_雾都孤儿.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o42 | 午夜牛郎 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O42_午夜牛郎.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o43 | 巴顿将军 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O43_巴顿将军.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o44 | 法国贩毒网 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O44_法国贩毒网.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o45 | 教父 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O45_教父.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o46 | 骗中骗 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O46_骗中骗.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o47 | 教父2 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O47_教父2.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o48 | 飞越疯人院 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O48_飞越疯人院.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o49 | 洛奇 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O49_洛奇.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o50 | 安妮·霍尔 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O50_安妮·霍尔.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o51 | 猎鹿人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O51_猎鹿人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o52 | 克莱默夫妇 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O52_克莱默夫妇.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o53 | 普通人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O53_普通人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o54 | 烈火战车 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O54_烈火战车.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o55 | 甘地传 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O55_甘地传.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o56 | 母女情深 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O56_母女情深.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o57 | 莫扎特传 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O57_莫扎特传.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o58 | 走出非洲 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O58_走出非洲.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o59 | 野战排 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O59_野战排.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o60 | 末代皇帝 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O60_末代皇帝.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o61 | 雨人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O61_雨人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o62 | 为黛西小姐开车 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O62_为黛西小姐开车.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o63 | 与狼共舞 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O63_与狼共舞.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o64 | 沉默的羔羊 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O64_沉默的羔羊.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o65 | 不可饶恕 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O65_不可饶恕.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o66 | 辛德勒的名单 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O66_辛德勒的名单.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o67 | 阿甘正传 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O67_阿甘正传.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o68 | 勇敢的心 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O68_勇敢的心.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o69 | 英国病人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O69_英国病人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o70 | 泰坦尼克号 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O70_泰坦尼克号.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o71 | 莎翁情史 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O71_莎翁情史.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o72 | 美国丽人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O72_美国丽人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o73 | 角斗士 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O73_角斗士.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o74 | 美丽心灵 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O74_美丽心灵.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o75 | 芝加哥 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O75_芝加哥.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o76 | 指环王：王者无敌 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O76_指环王：王者无敌.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o77 | 百万美元宝贝 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O77_百万美元宝贝.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o78 | 撞车 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O78_撞车.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o79 | 无间行者 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O79_无间行者.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o80 | 老无所依 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O80_老无所依.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o81 | 贫民窟的百万富翁 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O81_贫民窟的百万富翁.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o82 | 拆弹部队 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O82_拆弹部队.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o83 | 国王的演讲 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O83_国王的演讲.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o84 | 艺术家 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O84_艺术家.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o85 | 逃离德黑兰 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O85_逃离德黑兰.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o86 | 为奴十二年 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O86_为奴十二年.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o87 | 鸟人 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O87_鸟人.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o88 | 聚焦 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O88_聚焦.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o89 | 月光男孩 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O89_月光男孩.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o90 | 水形物语 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O90_水形物语.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o91 | 绿皮书 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O91_绿皮书.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o92 | 寄生虫 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O92_寄生虫.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o93 | 无依之地 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O93_无依之地.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o94 | 健听女孩 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O94_健听女孩.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o95 | 瞬息全宇宙 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O95_瞬息全宇宙.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o96 | 奥本海默 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O96_奥本海默.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o97 | 阿诺拉 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O97_阿诺拉.md` | V06 / V11 | prompt_reference | code-motion |
| cap-o98 | 一战再战 | P09 | `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格提示词/O_奥斯卡98部/O98_一战再战.md` | V06 / V11 | prompt_reference | code-motion |
| lemo-archive-lighttable | 档案灯台 | LEMO | `resources/prompts/lemo/archive-lighttable/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-art-deco | 装饰艺术 | LEMO | `resources/prompts/lemo/art-deco/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-ascii-crt | ASCII / CRT 终端 | LEMO | `resources/prompts/lemo/ascii-crt/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-backrooms | 后室 / 新怪谈 | LEMO | `resources/prompts/lemo/backrooms/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-blueprint | 蓝图 / 工程制图 | LEMO | `resources/prompts/lemo/blueprint/STYLE.md` | V04 / V06 | auto_style (`blueprint`) | code-motion |
| lemo-brick-toy | 积木玩具 | LEMO | `resources/prompts/lemo/brick-toy/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-briefing-board | 工程简报板 | LEMO | `resources/prompts/lemo/briefing-board/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-cel-anime-80s | 80 年代赛璐璐动画 | LEMO | `resources/prompts/lemo/cel-anime-80s/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-crayon-book | 蜡笔儿童绘本 | LEMO | `resources/prompts/lemo/crayon-book/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-dark-keynote | 暗色科技发布 | LEMO | `resources/prompts/lemo/dark-keynote/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-data-physical | 数据实物化 | LEMO | `resources/prompts/lemo/data-physical/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-dataviz | 数据叙事 | LEMO | `resources/prompts/lemo/dataviz/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-engraving | 铜版画 | LEMO | `resources/prompts/lemo/engraving/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-game-show | 综艺节奏扁平 | LEMO | `resources/prompts/lemo/game-show/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-glass-product | 玻璃质感产品 | LEMO | `resources/prompts/lemo/glass-product/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-halftone-dossier | 复古半调案卷 | LEMO | `resources/prompts/lemo/halftone-dossier/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-hd-2d | HD-2D | LEMO | `resources/prompts/lemo/hd-2d/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-hologram-hud | 科幻全息界面 | LEMO | `resources/prompts/lemo/hologram-hud/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-impasto | 油画厚涂 | LEMO | `resources/prompts/lemo/impasto/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-ink-wash | 中国水墨 | LEMO | `resources/prompts/lemo/ink-wash/STYLE.md` | V04 / V06 | auto_style (`ink-wash`) | code-motion |
| lemo-iso-infographic | 等距信息图 | LEMO | `resources/prompts/lemo/iso-infographic/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-lidar-survey | 点云测绘 | LEMO | `resources/prompts/lemo/lidar-survey/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-living-screencast | 活体实机录屏 | LEMO | `resources/prompts/lemo/living-screencast/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-lowpoly-island | 低多边形等距 | LEMO | `resources/prompts/lemo/lowpoly-island/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-microgame | 微游戏快闪（瓦里奥制造式） | LEMO | `resources/prompts/lemo/microgame/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-microscope | 显微叙事 | LEMO | `resources/prompts/lemo/microscope/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-midcentury-toon | 50s 扁平卡通 | LEMO | `resources/prompts/lemo/midcentury-toon/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-one-line | 一笔画 | LEMO | `resources/prompts/lemo/one-line/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-paper-lantern | 纸雕灯影 | LEMO | `resources/prompts/lemo/paper-lantern/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-paper-popup | 纸片立体书 | LEMO | `resources/prompts/lemo/paper-popup/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-papercut-red | 红色窗花剪纸 | LEMO | `resources/prompts/lemo/papercut-red/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-pictogram-motion | 象形运动图形 | LEMO | `resources/prompts/lemo/pictogram-motion/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-pixel-rpg | 16-bit 像素 RPG | LEMO | `resources/prompts/lemo/pixel-rpg/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-risograph | Risograph 丝网印刷 | LEMO | `resources/prompts/lemo/risograph/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-rubber-hose | 1930s 橡皮管卡通 | LEMO | `resources/prompts/lemo/rubber-hose/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-satellite-briefing | 卫星简报 | LEMO | `resources/prompts/lemo/satellite-briefing/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-scifi-toon | 科幻情景喜剧卡通 | LEMO | `resources/prompts/lemo/scifi-toon/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-shadow-puppet | 皮影戏 | LEMO | `resources/prompts/lemo/shadow-puppet/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-silent-film | 1920s 默片 | LEMO | `resources/prompts/lemo/silent-film/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-silkscreen-poster | 丝印旅行海报 | LEMO | `resources/prompts/lemo/silkscreen-poster/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-spy-titles | 60s 间谍片头 | LEMO | `resources/prompts/lemo/spy-titles/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-stained-glass | 彩色玻璃窗 | LEMO | `resources/prompts/lemo/stained-glass/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-swiss-motion | 瑞士动态排版 | LEMO | `resources/prompts/lemo/swiss-motion/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-teardown | 产品拆解 | LEMO | `resources/prompts/lemo/teardown/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-tilt-shift | 移轴微缩 | LEMO | `resources/prompts/lemo/tilt-shift/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-ukiyoe | 浮世绘 | LEMO | `resources/prompts/lemo/ukiyoe/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-urban-sketch | 钢笔淡彩 | LEMO | `resources/prompts/lemo/urban-sketch/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-watercolor | 水彩笔刷 | LEMO | `resources/prompts/lemo/watercolor/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-white-model | 白模投影 | LEMO | `resources/prompts/lemo/white-model/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-whiteboard | 白板讲解 | LEMO | `resources/prompts/lemo/whiteboard/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| lemo-woodcut | 木刻版画 | LEMO | `resources/prompts/lemo/woodcut/STYLE.md` | V04 / V06 | resource_reference | code-motion |
| mg-01-flat-vector | 平面矢量 | P02 | `resources/prompts/mg/01-flat-vector.md` | V06 / V11 | resource_reference | code-motion |
| mg-02-line-art | 线条动画 | P02 | `resources/prompts/mg/02-line-art.md` | V06 / V11 | resource_reference | code-motion |
| mg-03-isometric | 等轴空间 | P02 | `resources/prompts/mg/03-isometric.md` | V06 / V11 | resource_reference | code-motion |
| mg-04-3d-render | 三维材质 | P02 | `resources/prompts/mg/04-3d-render.md` | V06 / V11 | resource_reference | code-motion |
| mg-05-cel-boil | 手绘沸腾线 | P02 | `resources/prompts/mg/05-cel-boil.md` | V06 / V11 | prompt_reference | code-motion |
| mg-06-collage | 拼贴 | P02 | `resources/prompts/mg/06-collage.md` | V06 / V11 | prompt_reference | code-motion |
| mg-07-liquid | 液态 | P02 | `resources/prompts/mg/07-liquid.md` | V06 / V11 | prompt_reference | code-motion |
| mg-08-morph | 连续形变 | P02 | `resources/prompts/mg/08-morph.md` | V06 / V11 | resource_reference | code-motion |
| mg-09-bauhaus | 包豪斯 | P02 | `resources/prompts/mg/09-bauhaus.md` | V06 / V11 | auto_style (`bauhaus`) | code-motion |
| mg-10-synthwave | 合成波 | P02 | `resources/prompts/mg/10-synthwave.md` | V06 / V11 | prompt_reference | code-motion |
| mg-12-aurora-glass | 极光玻璃 | P02 | `resources/prompts/mg/12-aurora-glass.md` | V06 / V11 | prompt_reference | code-motion |
| mg-18-hanazi | 综艺花字 | P02 | `resources/prompts/mg/18-hanazi.md` | V06 / V11 | prompt_reference | code-motion |
| mg-19-paperclip | 知识拼贴 | P02 | `resources/prompts/mg/19-paperclip.md` | V06 / V11 | prompt_reference | code-motion |
| mg-20-pixel | 像素 | P02 | `resources/prompts/mg/20-pixel.md` | V06 / V11 | prompt_reference | code-motion |
| mg-22-hud | HUD | P02 | `resources/prompts/mg/22-hud.md` | V06 / V11 | prompt_reference | code-motion |
| tool-onetake | Onetake 连续镜头 | P16 | `docs/theory/extractions/projects/P16-onetake.md` | V08 | resource_reference | code-motion |
| tool-video-shotcraft | video-shotcraft 镜头库 | P22 | `docs/theory/extractions/projects/P22-video-shotcraft.md` | V14 | resource_reference | code-motion |
| tool-awesome-ai-motion | Awesome AI Motion 参考库 | P23 | `docs/theory/extractions/projects/P23-awesome-ai-motion.md` | V14 | resource_reference | code-motion |
