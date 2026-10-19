param([switch]$Draft,[switch]$CompositeOnly)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$ext=Join-Path $root 'demos/04-3d-render/extension'
$python=Join-Path $root '.venv/Scripts/python.exe'
$jobFile=Join-Path $ext 'checks/ripple-status.json'
function Status([string]$phase,[string]$message){
 @{phase=$phase;message=$message;pid=$PID;updated=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath ($jobFile+'.tmp') -Encoding utf8
 Move-Item -LiteralPath ($jobFile+'.tmp') -Destination $jobFile -Force
}
(Get-Process -Id $PID).PriorityClass='BelowNormal'
$env:PYTHONUTF8='1'
Push-Location $root
try {
 if(!$CompositeOnly){
  Status 'rendering' 'RIPPLE full-resolution frames; independent new scene.'
  $pct=if($Draft){50}else{100}
  $samples=if($Draft){4}else{16}
  & 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' -b --factory-startup -P demos/04-3d-render/extension/src/scene.py -- --all --pct $pct --samples $samples 2>&1 | Tee-Object -FilePath (Join-Path $ext 'checks/full-render.log') | ForEach-Object { $_; if($_ -match '^FRAME (\d+) ([\d.]+)s'){Status 'rendering' ("Completed frame {0}/191 in {1}s" -f $Matches[1],$Matches[2])} }
  if($LASTEXITCODE -ne 0){throw 'Blender render failed'}
 }
 $folder=if($Draft){'draft-frames'}else{'frames'}
 $dimension=if($Draft){960}else{1920}
 & $python -c "from pathlib import Path; from PIL import Image; p=Path('demos/04-3d-render/extension/$folder'); frames=[Image.open(p/f'{i:04d}.png') for i in range(192)]; assert all(im.width==$dimension for im in frames); [im.verify() for im in frames]"
 if($LASTEXITCODE -ne 0){throw 'Frame validation failed'}
 Status 'compositing' 'Frames complete; composing soundtrack and typography.'
 if($Draft){
  $out=Join-Path $ext 'draft';New-Item -ItemType Directory -Force -Path $out | Out-Null
  $env:MG_ROOT=$root;$env:MG_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe';$env:MG_GPU_ARGS='--use-angle=d3d11';$env:MG_RENDER_LOCKDIR=Join-Path $root '.tmp/render-slots';$env:MG_OUT_DIR=$out
  $env:MG_FFMPEG=(& $python -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())').Trim()
  $env:VIDEOLAB_AUDIO_LIB=Join-Path $root 'source/lib/audio';$env:VIDEOLAB_AUDIO_OUT=Join-Path $ext 'audio.wav'
  & $python demos/04-3d-render/extension/src/audio.py
  if($LASTEXITCODE -ne 0){throw 'Audio failed'}
  node source/harness/render.mjs demos/04-3d-render/extension/src --query draft=1 --scale 0.5 --audio demos/04-3d-render/extension/audio.wav --out demos/04-3d-render/extension/draft/preview.mp4
  if($LASTEXITCODE -ne 0){throw 'Draft composite failed'}
  & $python tools/check-video.py demos/04-3d-render/extension/draft/preview.mp4
 }else{
  & "$PSScriptRoot/run.ps1" -Case 04-3d-render -Mode extension
  & $python tools/check-video.py demos/04-3d-render/extension/video.mp4
 }
 if($LASTEXITCODE -ne 0){throw 'Decode checks failed'}
 Status 'ready_for_review' $(if($Draft){'Half-resolution motion preview completed; full resolution pending.'}else{'Full-resolution extension completed; user review pending.'})
}catch{Status 'failed' $_.Exception.Message;throw}finally{Pop-Location}
