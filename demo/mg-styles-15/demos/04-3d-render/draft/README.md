# Soft Landing · 低清完整动态预览

这是从原版 Blender 场景重新渲染的完整动作预览，不是作者视频，也不是 1080p 原质量复现完成品。

- 三维底片：480×270、Cycles CPU、4 samples、自适应阈值 0.15。
- 合成：上游网页调色、文字、景深与颗粒；960×540、24 fps、10 秒、240 帧。
- 音轨：重新运行上游配乐脚本，根据重建的碰撞事件合成。
- 只用于先看完整运动与节奏。低采样与降噪会损失细节，不能用于原质量材质验收。

成片：`preview.mp4`；解码报告：`check-result.json`；分镜：`storyboard.jpg`。

复现：先以 `blender-cpu.py -- render --range 0:239 --pct 25 --samples 4 --thresh 0.15 --out out/draft-frames --skip` 输出底片，再运行 `tools/composite-soft-draft.ps1`。
