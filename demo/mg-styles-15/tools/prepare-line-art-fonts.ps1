param([string]$Proxy = '')
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$items = @(
    @('ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf','latin/cormorantgaramond/CormorantGaramond-VF.ttf'),
    @('ofl/cormorantgaramond/OFL.txt','latin/cormorantgaramond/OFL.txt'),
    @('ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf','cjk/notoserifsc/NotoSerifSC-VF.ttf'),
    @('ofl/notoserifsc/OFL.txt','cjk/notoserifsc/OFL.txt')
)
foreach ($item in $items) {
    $target = Join-Path $project ('source/assets/fonts/' + $item[1])
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
    if (!(Test-Path -LiteralPath $target)) {
        $request = @{ Uri=('https://raw.githubusercontent.com/google/fonts/main/' + $item[0]); OutFile=$target; TimeoutSec=60 }
        if ($Proxy) { $request.Proxy = $Proxy }
        Invoke-WebRequest @request
    }
}
$manifest = Join-Path $project 'demos/03-line-art/reproduction/asset-checksums.json'
foreach ($asset in (Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json)) {
    if ($asset.path.StartsWith('assets/fonts/')) {
        $file = Join-Path $project ('source/' + $asset.path)
        if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $asset.sha256) {
            throw "Font version differs from the recorded reproduction: $($asset.path)"
        }
    }
}
Write-Output 'Line-art fonts and recorded hashes verified.'
