# 原作重建记录

重建日期：2026-10-13。来源为上游 commit `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` 的 `demos/01-flat-vector/`。本次执行作者代码，不是直接使用作者 MP4，也不是让模型依据 Prompt 重新写出原作。

## 成果与检查

- [本地重建片](video.mp4)：1920×1080、30 fps、300 帧、10.00 秒，H.264 + 48 kHz 双声道 AAC。
- [原片](../../../source/videos/01-flat-vector.mp4)、[十组对照帧](comparison.jpg)、[检查数据](check-result.json)。
- 最终成片测得响度约 −14.0 LUFS、真峰值约 −2.2 dBTP；渲染与合成约 20.4 秒，不含环境配置、下载、配乐生成和检查。
- 2026-10-13 本会话助手查看了十组对照帧；用户随后反馈“做的还挺好的”。助手没有完成实时播放／主观试听，用户这条反馈未细分画面与声音。

## 差异与修补

1. Windows 的 Chrome、GPU 参数、临时目录、路径分隔符与 FFmpeg 位置由共享运行脚本和补丁处理。
2. 补入 Fredoka、Resource Han Rounded、Noto Sans SC，保留来源、许可与哈希。中文字体 v0.990 的 SC 文件按上游 CN 路径存放；作者未发布字体原文件，不能保证字节一致。
3. matplotlib 3.9.1 在本机转为源码编译并失败，改用有 Windows wheel 的 3.9.2。
4. 首次合成的音轨填充使容器达 10.58 秒。补充按帧数计算的 `-t` 后，时长修正为 10.00 秒。早期检查记录见 [check-before-duration-fix.json](check-before-duration-fix.json)。
5. 原片部分运动帧模糊更明显，本次沿用源码默认 `mb=1`；字形、渲染细节和色彩元数据也存在差异，不能称为精确复制。
6. 音频检测器提示低频偏多（60 Hz 以下约 54.24%）；保留原配乐，待听感判断。上游写帧函数还有 MaxListenersExceededWarning，本次导出成功，未额外改写。

完整依赖和环境见 [SETUP.md](../../../tools/SETUP.md)。在项目目录运行 `tools/run.ps1 -Mode reproduction`、`.venv/Scripts/python.exe tools/check.py` 可重建和复核。

作者原始提示词见 [UPSTREAM_PROMPT.md](UPSTREAM_PROMPT.md)，本次仅作为研究资料阅读。新增创作与方法总结在上一级案例目录，不能将此重建结果归因于某个模型的独立审美能力。
