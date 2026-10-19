param([string]$Blender='C:\Program Files\Blender Foundation\Blender 5.1\blender.exe')
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$out=Join-Path $root 'demos/04-3d-render/reproduction'
$python=Join-Path $root '.venv/Scripts/python.exe'
$status=Join-Path $out 'job-status.json'
New-Item -ItemType Directory -Force -Path $out | Out-Null
if(Test-Path -LiteralPath $status){
 $old=Get-Content -Raw -LiteralPath $status | ConvertFrom-Json
 if($old.phase -in @('rendering','compositing','checking')){
  $existing=Get-Process -Id $old.pid -ErrorAction SilentlyContinue
  if($existing -and $existing.StartTime.ToUniversalTime() -eq ([datetime]$old.process_started).ToUniversalTime()){throw 'A recorded render job is still running.'}
 }
}
$started=(Get-Date).ToUniversalTime().ToString('o')
$processStart=(Get-Process -Id $PID).StartTime.ToUniversalTime().ToString('o')
function Status([string]$phase,[string]$message){
 @{phase=$phase;message=$message;pid=$PID;process_started=$processStart;started=$started;updated=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath ($status+'.tmp') -Encoding utf8
 Move-Item -LiteralPath ($status+'.tmp') -Destination $status -Force
}
(Get-Process -Id $PID).PriorityClass='BelowNormal'
$env:PYTHONUTF8='1'
Push-Location $root
try {
 Status 'rendering' 'Original Cycles CPU, 1080p, 24 samples; resumable frame rendering.'
 & $Blender -b source/demos/04-3d-render/work/scene.blend -P tools/blender-cpu.py -- render --range 0:239 --skip 2>&1 | Tee-Object -FilePath (Join-Path $out 'blender-render.log') | ForEach-Object {
  $_
  if ($_ -match '^FRAME (\d+) ([\d.]+)s') {
   Status 'rendering' ("Last completed frame {0}/239 in {1}s. Original Cycles CPU, 1080p, 24 samples." -f $Matches[1],$Matches[2])
  }
 }
 if($LASTEXITCODE -ne 0){throw 'Blender rendering failed'}
 & $python tools/finish-soft.py --plates
 if($LASTEXITCODE -ne 0){throw 'Frame validation failed'}
 Status 'compositing' 'Rebuilding original soundtrack and browser overlay.'
 & "$PSScriptRoot/run.ps1" -Case 04-3d-render
 Status 'checking' 'Decode, reference comparison, audio measurement and preview encoding.'
 & $python tools/check.py --case 04-3d-render
 if($LASTEXITCODE -ne 0){throw 'Video comparison failed'}
 & $python tools/finish-soft.py
 if($LASTEXITCODE -ne 0){throw 'Final validation failed'}
 Status 'ready_for_review' 'Video and preview completed; subjective visual/audio review pending.'
} catch {
 Status 'failed' $_.Exception.Message
 throw
} finally {Pop-Location}
