# Windows 环境与重建

工作目录为 `demo/mg-styles-15/`。已运行环境：Python 3.11.3、Node 24.14.0、Chrome 154.0.8037.98、FFmpeg 7.1。需要 Git、npm、PowerShell 和支持 7z 的 `tar`。

当前工作区已配置；以下供新目录重建，已有 `source/` 时不要重复克隆覆盖。

```powershell
git clone --depth 1 --filter=blob:none --sparse https://github.com/Vincentwei1021/mg-styles-15.git source
git -C source fetch --depth 1 origin 49052d80bfaf9fa8412cc9710530e5e95a3b8d8c
git -C source checkout --detach FETCH_HEAD
git -C source sparse-checkout set --no-cone '/*' '!/*/' '/harness/' '/demos/01-flat-vector/' '/lib/audio/' '/assets/fonts/' '/prompts/01-flat-vector.md' '/videos/01-flat-vector.mp4' '/videos/01-flat-vector.jpg'
git -C source apply ../tools/windows-render.patch
Copy-Item tools/package-lock.json source/package-lock.json
npm.cmd ci --prefix source --ignore-scripts --no-audit --no-fund
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --only-binary=:all: -r tools/requirements-lock.txt
.\tools\fetch-fonts.ps1
.\tools\run.ps1 -Mode reproduction
.\tools\run.ps1 -Mode extension
```

FFmpeg 来自虚拟环境内的 `imageio-ffmpeg`，无需全局安装。Chrome 不在默认路径时，为运行脚本传入 `-Chrome '实际路径'`。

字体来自 [Google Fonts](https://github.com/google/fonts) 和 [Resource Han Rounded v0.990](https://github.com/CyanoHao/Resource-Han-Rounded/releases/tag/v0.990)。获取脚本保留许可并验证 SHA256；Google Fonts 地址指向主分支，未来若字节变化会报错，需确认版本，不能直接忽略校验。

渲染补丁包括 Windows 路径与 FFmpeg 配置、精确限制音轨时长，以及允许拓展源码和检查输出存放在 `source/` 外。上游动画代码没有为拓展作品改写；拓展场景独立保存在案例内。
