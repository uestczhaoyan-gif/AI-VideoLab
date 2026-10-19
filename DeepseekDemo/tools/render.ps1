# DeepseekDemo 渲染入口
#   pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode stills
#   pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode audio -FilmName films/two-points
#   pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode video -FilmName films/two-points
#   pwsh -ExecutionPolicy Bypass -File tools/render.ps1 -Mode stills -Times "1,3,5" -Query "dbg=cam"
#
# 注意：PowerShell 变量名大小写不敏感，$film 与 $Film 是同一个变量。本脚本统一用
# $filmName / $filmDir / $outPath，避免互相覆盖（这里踩过一次坑）。
param(
    [ValidateSet('stills', 'audio', 'video')][string]$Mode = 'stills',
    [string]$FilmName = 'film',
    [string]$OutDir = '',
    [string]$Times = '0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5,8.5,9.5',
    [string]$Query = '',
    [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)
$ErrorActionPreference = 'Stop'
$demoRoot = Split-Path -Parent $PSScriptRoot          # DeepseekDemo
$workspace = Split-Path -Parent $demoRoot             # VideoLab
$upstream = Join-Path $workspace 'demo\mg-styles-15'
$venv = Join-Path $upstream '.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $venv)) { throw "缺少共享 Python 环境：$venv" }
if (!(Test-Path -LiteralPath $Chrome)) { throw "未找到 Chrome，请用 -Chrome 指定路径。" }
$harness = Join-Path $upstream 'source\harness\render.mjs'
$filmDir = Join-Path $demoRoot $FilmName
if (!(Test-Path -LiteralPath (Join-Path $filmDir 'index.html'))) { throw "找不到场景：$filmDir\index.html" }
if (-not $OutDir) {
    if ($FilmName -eq 'film') { $OutDir = 'out' } else { $OutDir = Join-Path $FilmName 'out' }
}
$outPath = Join-Path $demoRoot $OutDir
$tmpPath = Join-Path $demoRoot '.tmp'
New-Item -ItemType Directory -Force -Path $outPath, $tmpPath, (Join-Path $tmpPath 'render-slots') | Out-Null

$env:MG_ROOT = $workspace
$env:MG_CHROME = $Chrome
$env:MG_GPU_ARGS = '--use-angle=d3d11'
$env:MG_RENDER_LOCKDIR = Join-Path $tmpPath 'render-slots'
$env:MG_OUT_DIR = $outPath
$env:TEMP = $tmpPath
$env:TMP = $tmpPath
$env:MPLCONFIGDIR = Join-Path $tmpPath 'matplotlib'
$env:PYTHONUTF8 = '1'
$env:VIDEOLAB_AUDIO_LIB = Join-Path $upstream 'source\lib\audio'
$env:VIDEOLAB_AUDIO_OUT = Join-Path $outPath 'audio.wav'
$env:MG_FFMPEG = (& $venv -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())').Trim()
if ($LASTEXITCODE -ne 0) { throw 'FFmpeg 查找失败。' }

# 子进程会把告警写到 stderr；在 $ErrorActionPreference='Stop' 下这会变成终止错误。
# 统一把输出收进 <out>\<日志>，只用退出码判断成败。
function Invoke-Logged([string]$Exe, [string[]]$Arguments, [string]$LogName) {
    $logPath = Join-Path $outPath $LogName
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & $Exe @Arguments 2>&1 | Tee-Object -FilePath $logPath | Out-Host }
    finally { $ErrorActionPreference = $previous }
    $code = $LASTEXITCODE
    if ($code -ne 0) { throw ("{0} 退出码 {1}，详见 {2}" -f (Split-Path -Leaf $Exe), $code, $logPath) }
}

Push-Location $workspace
try {
    switch ($Mode) {
        'stills' {
            $nodeArgs = @($harness, $filmDir, '--stills', $Times)
            if ($Query) { $nodeArgs += @('--query', $Query) }
            Invoke-Logged 'node' $nodeArgs 'render-stills.log'
        }
        'audio' {
            Invoke-Logged $venv @((Join-Path $filmDir 'audio.py')) 'audio.log'
        }
        'video' {
            $audioPath = Join-Path $outPath 'audio.wav'
            if (!(Test-Path -LiteralPath $audioPath)) { throw "缺少 $OutDir\audio.wav，先跑 -Mode audio。" }
            Invoke-Logged 'node' @($harness, $filmDir, '--audio', $audioPath, '--out', (Join-Path $outPath 'video.mp4')) 'render.log'
        }
    }
}
finally { Pop-Location }
