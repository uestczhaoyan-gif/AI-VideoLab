$root=Split-Path -Parent $PSScriptRoot
$record=Join-Path $root 'demos/04-3d-render/reproduction/job-status.json'
$job=if(Test-Path -LiteralPath $record){Get-Content -LiteralPath $record -Raw | ConvertFrom-Json}else{$null}
$process=if($job){Get-Process -Id $job.pid -ErrorAction SilentlyContinue}else{$null}
$alive=$process -and $process.StartTime.ToUniversalTime() -eq ([datetime]$job.process_started).ToUniversalTime()
$task=Get-ScheduledTask -TaskName 'VideoLab-SoftLanding-FullQuality' -ErrorAction SilentlyContinue
$frames=@(Get-ChildItem -LiteralPath (Join-Path $root 'source/demos/04-3d-render/out/frames') -Filter '*.png' -ErrorAction SilentlyContinue | Where-Object Name -Match '^\d{4}\.png$')
$effective=if($job.phase -in @('rendering','compositing','checking') -and !$alive){'interrupted'}else{$job.phase}
[pscustomobject]@{phase=$effective;process_alive=[bool]$alive;task_state=[string]$task.State;completed_frames=$frames.Count;required_frames=240;last_frame_write=($frames | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime;last_message=$job.message}
