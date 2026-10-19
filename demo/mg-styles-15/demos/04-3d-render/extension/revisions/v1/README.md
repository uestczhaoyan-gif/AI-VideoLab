# RIPPLE · 一触，层层回应

原版三维复现通过用户验收后制作的新概念拓展。一个珊瑚色软胶球落在中央软垫，四圈椭圆体按距离依次起伏，最终回归安静的整体构图。

## 文件与状态

- `src/scene.py`：独立新写的 Blender 场景、材质、灯光、相机、运动与帧渲染。
- `src/cues.json`：8 秒／24 fps 的共同事件表。
- `src/index.html`：画面底片与标题合成；`src/audio.py`：新的音乐／音效编排。
- `PROMPT.md`：创作要求与迭代记录。
- `draft/preview.mp4`：960×540、4 samples 的完整动作预览，不作为最终画质验收。
- `video.mp4`：完成后生成的 1080p、16 samples 正式拓展片。
- `checks/`：试帧、渲染日志和任务状态；`work/` 与帧目录为可再生成缓存。

## 复用边界

本例重新编写几何、布局、材质参数、灯光、运动及声音编排，复用共享浏览器渲染器、音色库、字体和已经验证的 Blender 执行环境。没有调用原作 `sim.py` 或原城市场景，不拿原作成片当作拓展素材。

软垫与球通过人为设计的压缩／回弹表达柔软，周围物体使用按圈延迟的衰减振荡。这是风格化响应设计，不是波动传播的科学仿真。字体及共享音色遵循其原许可。

## 运行

进入 `demo/mg-styles-15`：

```powershell
.\tools\render-ripple.ps1 -Draft
.\tools\render-ripple.ps1
```

仅在全部预览底片已存在时，可用 `-Draft -CompositeOnly` 合成。已有渲染任务运行时不要重复执行。原质量的一次性任务名为 `VideoLab-Ripple-FullQuality`，无周期触发，状态记录在 `checks/ripple-status.json`；必须同时核对任务／进程和实际帧数，不能单看状态文本。

当前交付：[8 秒动态预览](draft/preview.mp4)，已通过完整解码检查；1080p 版本仍在渲染，不作为已完成成果链接。
