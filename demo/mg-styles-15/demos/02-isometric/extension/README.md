# SUNGRID · 一束阳光，点亮一座小镇

等轴风格的新概念迁移实验。原版复现获用户认可后，由模型依据已拆解的方法重新设计和编码；不是上游演示片，也没有沿用上游城市场景源码。

## 文件

- `src/index.html`：字体、画面与文字层。
- `src/film.js`：新写的太阳、面板、电池、住宅、能量路径、镜头与时间更新。
- `src/cues.json`：视觉／音频公共事件表。
- `src/audio.py`：新写的旋律、和弦、节奏与事件音效编排。
- `PROMPT.md`：本次 brief、模型已有上下文及可迁移提示草案。
- `video.mp4`／`preview.mp4`：母版与观看预览；`storyboard.jpg`：检查用分镜。
- `checks/`：可再生成的检查产物；`check-result.json`：成片技术报告。

## 复用与改写

复用固定版本 mg-styles-15 的 `js/render.js` 累计渲染器及其 `anim.js` 依赖、Three.js、公共音色库、字体与 Windows 渲染适配。保留各自上游许可，参见项目 `UPSTREAM-LICENSE` 和字体目录许可。新写场景、对象、运动状态、文案、事件表及音乐编排。

原版 16 次内部子采样，本例采用 8 次；没有声称两者画质完全相同。住宅与电池是示意形体，发电控制、逆变器和配电等实际工程环节未建模。

## 事件设计

0–3.3 秒建立能源岛；3.3 秒开始可见传输；4.6 秒起电池逐格点亮；6.4 秒释放供能光点；7.6 秒起住宅依次亮灯；9.3–12 秒保留收束构图。电池指示灯表示曾建立储能状态，不是计量电量的物理仿真。

## 运行

在 `demo/mg-styles-15` 执行：

```powershell
.\tools\run.ps1 -Case 02-isometric -Mode extension -Stills
.\tools\run.ps1 -Case 02-isometric -Mode extension
.\.venv\Scripts\python.exe tools/check-video.py demos/02-isometric/extension/video.mp4
```

本例能否达到用户期待，由成片观看验收；工程检查不替代主观审听与审美评价。

## 本次交付

[轻量预览](preview.mp4) · [母版](video.mp4) · [分镜](storyboard.jpg) · [技术报告](check-result.json)

已完成 360 帧解码、音轨测量、随机定位一致性与抽样分镜检查；等待用户观看验收。声音审计保留高频较少、低频较薄提示，详见上级阶段经验。
