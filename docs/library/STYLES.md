# 风格入口：现有开源资料

风格描述画面的视觉与运动语言，方法描述怎样生产。一个风格可以由多种技术实现，也可能需要特定资产。这里的路由标签是依据索引名称做的初步整理，不等于已经读完该风格说明或验证其技术实现。

## Code Animation Prompts：341 条素材

新来源：[XiaoyeCodes/code-animation-prompts](https://github.com/XiaoyeCodes/code-animation-prompts/tree/69ccbeaf0b821591a40936572c2f559d8f4cfb68)，对应 [V06](../theory/extractions/videos/V06-BV1bqx76wEUM.md) 与 [P09](../theory/extractions/projects/P09-code-animation-prompts.md)。本轮实际核对了 341 个唯一编号、193 张参考图和 555 个原素材文件的哈希，未精读全部 Prompt。

| 素材组 | 数量 | 选取职责 |
| --- | --- | --- |
| A–G 代码样片 | 26 | 文字、粒子、线与墨、光、图形、解释与材质 |
| M 动态风格 | 40 | 镜头、运动与叙事 |
| K 卡通画风 | 38 | 主视觉、角色 |
| Z 中国风 | 15 | 主视觉、材料与笔触 |
| H 现成版式 | 12 | 配色与字体 |
| L Lemo-Opuscar | 59 | 整理的第三方风格，版本与下表 51 项不同 |
| V mg-styles-15 | 15 | 整理的动态图形风格，与已有来源重叠 |
| X code-video | 31 | 第三方代码视频风格 |
| R 参考临摹 | 7 | 赛博等视觉参考 |
| O 影片画风 | 98 | 电影视觉参考，不是完整制片流水线 |

- [固定版完整索引](https://github.com/XiaoyeCodes/code-animation-prompts/blob/69ccbeaf0b821591a40936572c2f559d8f4cfb68/docs/STYLES.md)可定位所有条目；不要把 B6 独立示例误记为索引项。
- 本机可打开 [341 风格离线挑选器](../../resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/assets/library/风格挑选.html)，需要保持它和相邻提示词／图片文件夹的相对位置；本轮未做交互验收。
- 轻量索引位于本地 `resources/prompt-libraries/code-animation-prompts/source/skills/code-animation-prompts/references/catalog.json`，适合将来按编号／标签检索后组装输入。
- 合集不是统一 MIT。免费使用／分享约定与第三方原许可见 P09；当前只保存本地缓存与原创摘要，未并入根 MIT 素材发布。

跨库的重叠条目按来源、编号与版本分别保存，不计算为 `341 + 51 + 15` 个独立方法，也不默认 L 系列 59 项与旧快照 51 项一一相同。

## lemo-opuscar：51 个索引条目

固定来源：[styles/ 索引](https://github.com/lemomo-ai/lemo-opuscar/tree/b5e8ef93930b6d828f352055a689320f138237b1/styles)，本地快照位于 `resources/styles/lemo-opuscar/source/styles/`。按表中的 slug 打开 `<slug>/STYLE.md` 看风格约束、`<slug>/DEMO.md` 看案例说明、`<slug>/demo/` 看实现；资产许可按具体案例的 `CREDITS` 核对。

本轮读取了索引并确认 51 个目录的 `STYLE.md` 与 `DEMO.md` 都存在；另一个 `_template` 目录不计入风格数。没有在本轮逐份读取风格文件或播放 51 支影片。下表沿用上游分组与名称，保证线索可定位。

| 上游分组 | 风格 | slug | 初步检索方向 |
| --- | --- | --- | --- |
| 实证影像 | 卫星简报 | `satellite-briefing` | 地图、真实数据 |
| 实证影像 | 工程简报板 | `briefing-board` | 工程关系、报告 |
| 实证影像 | 点云测绘 | `lidar-survey` | 点云、测量 |
| 实证影像 | 白模投影 | `white-model` | 模型、空间映射 |
| 实证影像 | 数据实物化 | `data-physical` | 数据与实体关系 |
| 实证影像 | 产品拆解 | `teardown` | 部件、组装关系 |
| 实证影像 | 显微叙事 | `microscope` | 显微图像、尺度 |
| 实证影像 | 档案灯台 | `archive-lighttable` | 档案、证据 |
| 手绘与绘画 | 蜡笔儿童绘本 | `crayon-book` | 绘本叙事 |
| 手绘与绘画 | 水彩笔刷 | `watercolor` | 笔刷、绘画 |
| 手绘与绘画 | 中国水墨 | `ink-wash` | 水墨、叙事 |
| 手绘与绘画 | 油画厚涂 | `impasto` | 绘画材质 |
| 手绘与绘画 | 一笔画 | `one-line` | 连续路径、M02 |
| 手绘与绘画 | 白板讲解 | `whiteboard` | 解释、绘制、M03 |
| 手绘与绘画 | 钢笔淡彩 | `urban-sketch` | 手绘场景 |
| 东方传统 | 皮影戏 | `shadow-puppet` | 剪影、角色 |
| 东方传统 | 浮世绘 | `ukiyoe` | 版画、场景 |
| 东方传统 | 红色窗花剪纸 | `papercut-red` | 剪纸、形状 |
| 东方传统 | 纸雕灯影 | `paper-lantern` | 分层、灯影 |
| 印刷与版画 | Risograph 丝网印刷 | `risograph` | 网点、叠印 |
| 印刷与版画 | 复古半调案卷 | `halftone-dossier` | 档案、拼贴 |
| 印刷与版画 | 木刻版画 | `woodcut` | 刀刻、纹理 |
| 印刷与版画 | 铜版画 | `engraving` | 线刻、图解 |
| 印刷与版画 | 丝印旅行海报 | `silkscreen-poster` | 海报、场景 |
| 图形与排版 | 瑞士动态排版 | `swiss-motion` | 字体、网格 |
| 图形与排版 | 60s 间谍片头 | `spy-titles` | 片头、图形 |
| 图形与排版 | 装饰艺术 | `art-deco` | 几何、排版 |
| 图形与排版 | 蓝图／工程制图 | `blueprint` | 结构、工程图 |
| 图形与排版 | 彩色玻璃窗 | `stained-glass` | 分块、透光 |
| 图形与排版 | 象形运动图形 | `pictogram-motion` | 图标、动作 |
| 图形与排版 | ASCII／CRT 终端 | `ascii-crt` | 字符、终端 |
| 信息与发布 | 数据叙事 | `dataviz` | 数据、图表、M10 |
| 信息与发布 | 等距信息图 | `iso-infographic` | 空间关系、M04 |
| 信息与发布 | 暗色科技发布 | `dark-keynote` | 产品、发布会 |
| 信息与发布 | 活体实机录屏 | `living-screencast` | 实际界面、M09 |
| 信息与发布 | 科幻全息界面 | `hologram-hud` | HUD、信息层级 |
| 卡通与动画 | 1930s 橡皮管卡通 | `rubber-hose` | 角色、夸张运动 |
| 卡通与动画 | 80 年代赛璐璐动画 | `cel-anime-80s` | 分层、线稿 |
| 卡通与动画 | 科幻情景喜剧卡通 | `scifi-toon` | 角色、对话 |
| 卡通与动画 | 50s 扁平卡通 | `midcentury-toon` | 平面角色 |
| 游戏 | 16-bit 像素 RPG | `pixel-rpg` | 像素、精灵 |
| 游戏 | HD-2D | `hd-2d` | 像素与纵深 |
| 游戏 | 微游戏快闪 | `microgame` | 短动作、节奏 |
| 游戏 | 综艺节奏扁平 | `game-show` | 信息、游戏 |
| 电影与时代 | 1920s 默片 | `silent-film` | 默片、字卡 |
| 电影与时代 | 后室／新怪谈 | `backrooms` | 空间、氛围 |
| 材质与 3D | 积木玩具 | `brick-toy` | 模块、组装 |
| 材质与 3D | 纸片立体书 | `paper-popup` | 分层、折叠 |
| 材质与 3D | 移轴微缩 | `tilt-shift` | 景深、微缩 |
| 材质与 3D | 低多边形等距 | `lowpoly-island` | 几何、空间 |
| 材质与 3D | 玻璃质感产品 | `glass-product` | 材质、产品 |

已有相关产物摘要见[白板试片案例](cases/lemo-whiteboard-trial.md)，未完整实现上游默认特征。上游对模型适配的声明见[项目记录](../../resources/styles/lemo-opuscar/README.md)，不直接作为其他模型无法使用的结论。

## mg-styles-15：另一组 15 风格资料

固定来源：[完整项目版本](https://github.com/Vincentwei1021/mg-styles-15/tree/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c)。本地 `source/prompts/` 有 15 份 Markdown；`source/demos/` 仅获取了平面矢量、线条、等轴、三维、形变这 5 个上游案例目录，其他风格的完整工程需从固定版本补取。完整对应与技术线索见 [P02 第 5 节](../theory/extractions/projects/P02-mg-styles-15.md)。

| 源码标识 | 风格 | 本项目覆盖 |
| --- | --- | --- |
| `01-flat-vector` | 平面矢量 | 有复现与花园拓展记录（见[案例](cases/mg-01-flat-vector.md)） |
| `02-line-art` | 线条动画 | 有复现、《归途》与一笔画独立验证（见[案例](cases/mg-03-line-art.md)） |
| `03-isometric` | 等轴 | 有复现、SUNGRID 与芯片迁移（见[案例](cases/mg-02-isometric.md)） |
| `04-3d-render` | 三维材质 | 有 Soft Landing 复现、RIPPLE 迁移 |
| `05-cel-boil` | 手绘沸腾线 | 资料线索，未本地复现 |
| `06-collage` | 拼贴 | 资料线索，未本地复现 |
| `07-liquid` | 液态 | 资料线索，未本地复现 |
| `08-morph` | 形变 | 有复现、WANDER 多版与迁移局限 |
| `09-bauhaus` | 包豪斯 | 资料线索，未本地复现 |
| `10-synthwave` | 合成波 | 资料线索，未本地复现 |
| `12-aurora-glass` | 极光玻璃 | 资料线索，未本地复现 |
| `18-hanazi` | 综艺花字 | 资料线索，未本地复现 |
| `19-paperclip` | 知识拼贴 | 资料线索，未本地复现 |
| `20-pixel` | 像素 | 资料线索，未本地复现 |
| `22-hud` | HUD | 资料线索，未本地复现 |

表中为检索标识，精确路径以固定版本文件为准；上游 Prompt 编号、展示序号与本地案例编号不完全一致。跨库相近风格保留各自来源，不把它们合成一份无出处的 Prompt。
