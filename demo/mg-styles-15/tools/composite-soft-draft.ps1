$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$out=Join-Path $root 'demos/04-3d-render/draft'
$python=Join-Path $root '.venv/Scripts/python.exe'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$env:MG_ROOT=Join-Path $root 'source'
$env:MG_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:MG_GPU_ARGS='--use-angle=d3d11'
$env:MG_RENDER_LOCKDIR=Join-Path $root '.tmp/render-slots'
$env:MG_OUT_DIR=$out
$env:MG_FFMPEG=(& $python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())').Trim()
$env:PYTHONUTF8='1'
Push-Location $root
try {
 & $python -c "from pathlib import Path; from PIL import Image; p=Path('source/demos/04-3d-render/out/draft-frames'); files=[p/f'{i:04d}.png' for i in range(240)]; assert all(f.exists() for f in files); images=[Image.open(f) for f in files]; assert all(im.size==(480,270) for im in images); [im.verify() for im in images]; print('240 draft plates validated')"
 if($LASTEXITCODE -ne 0){throw 'Draft frames incomplete or invalid'}
 node source/harness/render.mjs source/demos/04-3d-render --query frames=draft-frames --scale 0.5 --audio source/demos/04-3d-render/out/audio.wav --out demos/04-3d-render/draft/preview.mp4 2>&1 | Tee-Object -FilePath (Join-Path $out 'composite.log')
 if($LASTEXITCODE -ne 0){throw 'Draft compositing failed'}
 & $python tools/check-video.py demos/04-3d-render/draft/preview.mp4
 if($LASTEXITCODE -ne 0){throw 'Draft decode check failed'}
} finally {Pop-Location}
