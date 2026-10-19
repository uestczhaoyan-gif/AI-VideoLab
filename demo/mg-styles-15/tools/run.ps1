param(
    [ValidateSet('01-flat-vector','02-isometric','02-isometric-chip','03-line-art','04-3d-render','05-shape-morph')][string]$Case = '01-flat-vector',
    [ValidateSet('reproduction','extension')][string]$Mode = 'reproduction',
    [switch]$Stills,
    [switch]$SkipAudio,
    [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)
$ErrorActionPreference = 'Stop'
if ($Case -eq '02-isometric-chip' -and $Mode -ne 'extension') { throw 'The chip case is a new extension; use -Mode extension.' }
$projectRoot = Split-Path -Parent $PSScriptRoot
$caseRoot = Join-Path $projectRoot "demos\$Case"
$sourceSlug = @{ '01-flat-vector'='01-flat-vector'; '02-isometric'='03-isometric'; '03-line-art'='02-line-art'; '04-3d-render'='04-3d-render'; '05-shape-morph'='08-morph' }[$Case]
$pythonExe = Join-Path $projectRoot '.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $pythonExe)) { throw 'Create the project .venv and install tools/requirements-lock.txt first.' }
if (!(Test-Path -LiteralPath $Chrome)) { throw 'Set -Chrome to your Chrome executable.' }
$target = Join-Path $caseRoot $Mode
if ($Mode -eq 'extension') {
    $inputDir = Join-Path $target 'src'
    $env:MG_ROOT = $projectRoot
    $checks = Join-Path $target 'checks'
} else {
    $inputDir = Join-Path $projectRoot "source\demos\$sourceSlug"
    $env:MG_ROOT = Join-Path $projectRoot 'source'
    $checks = $target
}
if (!(Test-Path -LiteralPath (Join-Path $inputDir 'index.html'))) { throw "No scene exists for $Case / $Mode." }
New-Item -ItemType Directory -Force -Path $target,$checks,(Join-Path $projectRoot '.tmp') | Out-Null
$env:MG_CHROME = $Chrome
$env:MG_GPU_ARGS = '--use-angle=d3d11'
$env:MG_RENDER_LOCKDIR = Join-Path $projectRoot '.tmp\render-slots'
$env:MG_OUT_DIR = $checks
$env:TEMP = Join-Path $projectRoot '.tmp'
$env:TMP = $env:TEMP
$env:MPLCONFIGDIR = Join-Path $projectRoot '.tmp\matplotlib'
$env:PYTHONUTF8 = '1'
$env:VIDEOLAB_AUDIO_LIB = Join-Path $projectRoot 'source\lib\audio'
$env:VIDEOLAB_AUDIO_OUT = Join-Path $target 'audio.wav'
$env:MG_FFMPEG = (& $pythonExe -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())').Trim()
if ($LASTEXITCODE -ne 0) { throw 'FFmpeg lookup failed.' }
Push-Location $projectRoot
try {
    if ($Stills) {
        node source/harness/render.mjs $inputDir --stills '0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5,8.5,9.5'
        if ($LASTEXITCODE -ne 0) { throw 'Still rendering failed.' }
    } else {
        if (!$SkipAudio) {
            $audioLocal = $Case -eq '05-shape-morph' -and $Mode -eq 'reproduction'
            if ($audioLocal) { Push-Location $inputDir }
            try { & $pythonExe (Join-Path $inputDir 'audio.py') 2>&1 | Tee-Object -FilePath (Join-Path $checks 'audio.log') } finally { if ($audioLocal) { Pop-Location } }
            if ($LASTEXITCODE -ne 0) { throw 'Audio generation failed.' }
        }
        $audioPath = if ($Mode -eq 'extension') { Join-Path $target 'audio.wav' } else { Join-Path $inputDir 'out\audio.wav' }
        if (!(Test-Path -LiteralPath $audioPath)) { throw 'Audio file missing; run without -SkipAudio first.' }
        node source/harness/render.mjs $inputDir --audio $audioPath --out (Join-Path $target 'video.mp4') 2>&1 | Tee-Object -FilePath (Join-Path $checks 'render.log')
        if ($LASTEXITCODE -ne 0) { throw 'Video rendering failed.' }
    }
} finally {
    Pop-Location
}
