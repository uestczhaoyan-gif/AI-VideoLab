$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../../..'))
$python=Join-Path $root '.venv/Scripts/python.exe';$out=$PSScriptRoot
$env:MG_ROOT=$root;$env:MG_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe';$env:MG_GPU_ARGS='--use-angle=d3d11';$env:TEMP=Join-Path $root '.tmp';$env:TMP=$env:TEMP;$env:MG_RENDER_LOCKDIR=Join-Path $env:TEMP 'render-slots';$env:MG_OUT_DIR=$out
$env:VIDEOLAB_AUDIO_LIB=Join-Path $root 'source/lib/audio';$env:VIDEOLAB_AUDIO_OUT=Join-Path $out 'audio.wav';$env:PYTHONUTF8='1';$env:MG_FFMPEG=(& $python -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())').Trim()
Push-Location $root
try{
 & $python (Join-Path $out 'src/audio.py') 2>&1 | Tee-Object (Join-Path $out 'audio.log');if($LASTEXITCODE -ne 0){throw 'Audio generation failed'}
 node source/harness/render.mjs (Join-Path $out 'src') --audio (Join-Path $out 'audio.wav') --out (Join-Path $out 'video.mp4') 2>&1 | Tee-Object (Join-Path $out 'render.log');if($LASTEXITCODE -ne 0){throw 'Video render failed'}
 & $env:MG_FFMPEG -y -v error -i (Join-Path $out 'video.mp4') -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -movflags +faststart (Join-Path $out 'preview.mp4');if($LASTEXITCODE -ne 0){throw 'Preview encode failed'}
}finally{Pop-Location}
