# 视频来源采集工具

把一个 B 站视频变成**可引用的本地证据**：公开元数据、章节、低清流、按时间抽帧，以及本机语音转写。用于 [来源笔记](../../docs/theory/extractions/videos/) 的取证，不用于再分发原片。

## 它做什么

1. 读取公开视频页的元数据、分 P、简介与章节（匿名 API）。
2. 解析匿名可访问的低清 DASH 流（默认 AVC，最高 480p 左右）。
3. 下载视频轨与音频轨到忽略提交的证据目录。
4. 用 OpenCV 按固定间隔抽帧（默认 10 秒）。
5. 用 faster-whisper 在本机做中文语音转写，输出带时间戳的 SRT／JSON。

## 不做什么

- 不登录、不读取浏览器凭据、不绕过会员或地区限制。
- 不下载高清原片，不把视频／音频提交进 Git。
- 不做完整视听或主观听感评价；转写有识别误差，抽帧只是采样。来源笔记必须如实写覆盖范围。

## 依赖

- Python 3.11，`opencv-python`（已在本机环境）、`faster-whisper`。
- 模型：`python tools/intake/fetch_model.py small`（或 `medium`），缓存在 `~/.cache/videolab-models/`，不入库。
- 本机网络访问 huggingface.co 需经 `https://hf-mirror.com`，且 hf-xet 传输会卡住；`fetch_model.py` 用 curl 直连镜像下载，脚本里已设默认 `HF_ENDPOINT` 与 `HF_HUB_DISABLE_XET=1`。

## 用法

```sh
python tools/intake/fetch_model.py small
python tools/intake/intake.py BV1ztH96uE1Z
python tools/intake/intake.py BV1vsx66BE4p --frame-interval 10 --model small
python tools/intake/intake.py BV1ztH96uE1Z --skip-download --skip-asr
```

输出在 `docs/theory/_evidence/batch03/<BV>/`（`.gitignore` 排除）：

| 文件 | 内容 |
| --- | --- |
| `metadata.json` | 标题、作者、时长、简介、章节、字幕可得性 |
| `manifest.json` | 轨道选择、文件大小／SHA-256、抽帧与转写摘要 |
| `video.mp4` / `audio.m4a` | 低清研究副本，不发布 |
| `frames/t00000.jpg…` | 固定间隔抽帧 |
| `asr.json` / `asr.txt` / `asr.srt` | 本机转写，带时间戳 |

## 写来源笔记

采集只是证据。正式笔记按 [V06](../../docs/theory/extractions/videos/V06-BV1bqx76wEUM.md) 的结构人工撰写，分开记录：作者表述、可复现事实、本项目观察与缺失；写清完整视听、抽帧、转写各自的覆盖范围与误差。
