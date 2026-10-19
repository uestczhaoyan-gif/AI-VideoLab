param([string]$Proxy='')
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$items=@(
 @('ofl/ibmplexmono/IBMPlexMono-Medium.ttf','assets/fonts/latin/ibmplexmono/IBMPlexMono-Medium.ttf'),
 @('ofl/ibmplexmono/OFL.txt','assets/fonts/latin/ibmplexmono/OFL.txt'),
 @('ofl/outfit/Outfit%5Bwght%5D.ttf','demos/08-morph/assets/fonts/Outfit-SemiBold.ttf'),
 @('ofl/outfit/OFL.txt','demos/08-morph/assets/fonts/OFL.txt')
)
foreach($item in $items){
 $target=Join-Path $root ('source/'+$item[1])
 New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
 if(!(Test-Path -LiteralPath $target)){
  $request=@{Uri=('https://raw.githubusercontent.com/google/fonts/main/'+$item[0]);OutFile=$target;TimeoutSec=60}
  if($Proxy){$request.Proxy=$Proxy};Invoke-WebRequest @request
 }
}
$manifest=Get-Content -Raw -LiteralPath (Join-Path $root 'demos/05-shape-morph/reproduction/asset-checksums.json') | ConvertFrom-Json
foreach($entry in $manifest){
 $file=Join-Path $root ('source/'+$entry.path)
 if((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $entry.sha256){throw "Input differs from recorded reproduction: $($entry.path)"}
}
'Recorded morph assets verified.'
