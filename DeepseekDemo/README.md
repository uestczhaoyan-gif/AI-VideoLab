# DeepseekDemo · 一笔画工作区

这里有两部片，共用一套一笔画引擎：

| 片 | 时长 | 内容 | 入口 |
| --- | --- | --- | --- |
| **ATELIER LINEA 复原** | 10 s | 用项目已有的《一笔画》笔记从零重写原片：种子→树苗→屋檐→天际线→山脊→圆环→填金→字标 | [film/](film) · [README 下文](#atelier-linea-10-秒复原) |
| **TWO POINTS 两点之间** | 60 s | 原创科普：一粒光的波前→透镜→焦点→艾里斑→两个点合成一团→算法三层读回→光圈与两个孔 | [films/two-points/](films/two-points/README.md) |
| **ONE LIFE 一生，一笔** | 78 s | 原创叙事：出生的一团卷曲→风筝→打开的书→台阶→门→山顶的旗→坠落与裂缝→心结→松开→一株花→日落成圆 | [films/life/](films/life/README.md) |

通用引擎：[engine/linefilm.js](engine/linefilm.js)——路径段、解析圆、螺线、同心环、点光源、
科普字幕、多孔填金、跟随笔尖的镜头、反向光脉冲，全部由 `cues.json` 驱动。

---

## ATELIER LINEA（10 秒复原）

用本项目已经沉淀的《一笔画》设计与方法笔记，**从零重写**了一条连续线条短片：
一条香槟金细线在深蓝留白里从画面外进入，长出树苗，枝条延伸成屋檐与房子，
房子长成天际线，天际线隆起为山脊并在浪尖绕出一个环，环加拱门成为标志，
金色由“线”转为“面”，最后落版 `ATELIER LINEA / 始于一线`。
成片 10 秒、1920×1080、30 fps、300 帧、带配乐。

- 成片母版：[out/video.mp4](out/video.mp4)
- 轻量预览：[out/preview.mp4](out/preview.mp4)
- 海报：[out/poster.jpg](out/poster.jpg) · 故事板：[out/storyboard.jpg](out/storyboard.jpg)
- 技术检查：[out/check.json](out/check.json)

## 这次“复原”复用了什么、重写了什么

复用的是**判断**，不是代码：

| 来源（本项目已有） | 用在哪 |
| --- | --- |
| `demo/mg-styles-15/demos/03-line-art/DESIGN.md` | 为什么连续细线能叙事、要迁移哪些要素、镜头与笔尖的关系 |
| 同目录 `METHOD.md` | 先选有连接关系的形体、路径长度驱动显露、只做一次线面转换、声音读事件表 |
| 同目录 `EXPERIENCE.md` | 纹理/字体/时间数据都是复现依赖；先看最终代码与成片再谈方法 |
| `reproduction/UPSTREAM_PROMPT.md` | 叙事分镜（种子→树苗→建筑→天际线→标志→填金→字标） |
| `source/harness/render.mjs`、`mgaudio`、字体与颗粒纹理 | 渲染管线、配乐工具、共享素材 |
| 上游重建成片 | 只作为**参考帧**：量出最终构图坐标、读节奏、对照检查 |

重写的是**实现**：`film/cues.json` 里的每一条路径、每一个时间点、镜头模型、
填金与门洞的合成、字标排版、`film/audio.py` 的整段配乐。没有复制上游 `film.js`。

详细对照见 [REBUILD-NOTES.md](REBUILD-NOTES.md)，可复用的方法见 [docs/METHOD.md](docs/METHOD.md)，
后续创新方向见 [docs/NEXT.md](docs/NEXT.md)。

## 目录

```
DeepseekDemo/
  engine/linefilm.js  一笔画通用引擎（两部片共用）
  film/               10 秒复原片的源码（index.html / film.js / cues.json / audio.py）
  films/two-points/   60 秒原创科普片的源码 + 自己的 out/
  out/                10 秒片的母版、预览、海报、故事板、对照图、静帧、技术检查
  assets/             从共享素材同步来的字体与颗粒（HardLink，不复制 24 MB 字体）
  tools/              sync-assets.ps1 / render.ps1 / check.py / compare.py
  tools/dev/          量参考帧、读笔尖轨迹、出联系表的小工具（做新片时用得上）
  docs/METHOD.md      一笔画制作方法
  docs/NEXT.md        下一步可以怎么用它做新片
  REBUILD-NOTES.md    10 秒片：文档 → 实现的对照、与原片的差异清单
```

`cues.json` 就是一部片的全部“数据”：`pieces`（路径与收笔时刻）、`circle` / `spiral` / `rings`
（解析圆、螺线、同心环）、`dots`（点光源）、`logo`（圆面、孔、填金）、`captions`（科普字幕）、
`pulse`、`camera`（缩放曲线 + 跟随参数 + 交还构图）、`type`、`pen`、`look`、`music`。
**做新片只改这个文件 + `audio.py`。**

## 怎么跑

环境与 `demo/mg-styles-15` 共用（Chrome + Python venv + Node），第一次先同步素材：

```powershell
# 1. 字体与颗粒纹理（HardLink，不会把 24 MB 字体复制两份）
pwsh -ExecutionPolicy Bypass -File tools/sync-assets.ps1
# 2. 10 秒复原片：静帧 / 配乐 / 成片
pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode stills -Times "1.5,7.5,9.5"
pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode audio
pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode video
# 3. 60 秒科普片（输出自动落到 films/two-points/out/）
pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode audio -FilmName films/two-points
pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode video -FilmName films/two-points
# 4. 技术检查（用共享 venv 的 Python；--film 指定场景）
..\demo\mg-styles-15\.venv\Scripts\python.exe tools\check.py
..\demo\mg-styles-15\.venv\Scripts\python.exe tools\check.py --film films/two-points
```

> 注意：PowerShell 变量名大小写不敏感，脚本里若同时写 `$film` 与 `$Film` 会互相覆盖
> （踩过一次，现已改成 `$filmName` / `$filmDir` / `$outPath`）。

`-Query "dbg=cam"` 可以把镜头数值打到 `out/render-stills.log`，调试构图时很有用。
`-Query "dbg=disc"` 只画标志圆面（排查填金/门洞），`-Query "dbg=nodisc,nograin"` 只画线条。

`tools/check.py` 会解码成片、核对帧数/分辨率/帧率、量响度、抽帧出海报与故事板、
压一版预览片，并把结论写进 `out/check.json`；检查不通过会以非零码退出。

> 注：`-Mode stills` 的静帧写到 `out/stills/`，是从页面直接渲染的（对稿用）；
> `tools/check.py` 另把从**成片解码**的帧写到 `out/shots/`（验收用），两者不要混用。

## 状态

- 已本地渲染并通过解码检查：10.000 s、1920×1080、30 fps、**300 帧**，母版约 3.6 MB，预览约 0.6 MB。
  响度 −14.0 LUFS、真峰值 −2.9 dBTP。
- 十个抽样时刻的对照图：[out/comparison.jpg](out/comparison.jpg)（上两行为上游成片，下两行为本目录成片）。
- 构图与节奏对齐上游成片的十个抽样时刻（0.5–9.5 s），差异与原因写在 [REBUILD-NOTES.md](REBUILD-NOTES.md)。
- 配乐为本次新写（D 大调 ambient），只借用了共享音色库与“笔触声跟绘制包络”的做法。
- **主观验收仍待观看**：工程完成不等于效果通过，尤其镜头与配乐需要按正常速度看一遍。
