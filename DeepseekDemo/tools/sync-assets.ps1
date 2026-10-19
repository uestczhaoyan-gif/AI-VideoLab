# Copies (or hard-links) the shared fonts and grain texture into DeepseekDemo/assets.
# The originals stay in demo/mg-styles-15/source/assets (MIT project, OFL fonts).
param([switch]$Copy)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $PSScriptRoot
$workspace = Split-Path -Parent $here
$src = Join-Path $workspace 'demo\mg-styles-15\source\assets'
$map = @(
    @{ from = 'fonts\latin\cormorantgaramond\CormorantGaramond-VF.ttf'; to = 'fonts\CormorantGaramond-VF.ttf'; lic = 'fonts\latin\cormorantgaramond\OFL.txt' },
    @{ from = 'fonts\cjk\notoserifsc\NotoSerifSC-VF.ttf';             to = 'fonts\NotoSerifSC-VF.ttf';             lic = 'fonts\cjk\notoserifsc\OFL.txt' },
    @{ from = 'textures\grain\grain_fine_2048.png';                   to = 'textures\grain_fine_2048.png' }
)
foreach ($m in $map) {
    $from = Join-Path $src $m.from
    $to = Join-Path $here ("assets\" + $m.to)
    if (!(Test-Path -LiteralPath $from)) { throw "Missing shared asset: $from" }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $to) | Out-Null
    if (Test-Path -LiteralPath $to) { Write-Host "exists  $($m.to)"; }
    elseif ($Copy) { Copy-Item -LiteralPath $from -Destination $to; Write-Host "copied  $($m.to)" }
    else {
        try { New-Item -ItemType HardLink -Path $to -Target $from | Out-Null; Write-Host "linked  $($m.to)" }
        catch { Copy-Item -LiteralPath $from -Destination $to; Write-Host "copied  $($m.to)" }
    }
    if ($m.lic) {
        $licTo = Join-Path $here ("assets\licenses\" + (Split-Path -Leaf $m.lic) + '.' + ((Split-Path -Leaf $m.to) -replace '\.ttf$', '') + '.txt')
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $licTo) | Out-Null
        if (!(Test-Path -LiteralPath $licTo)) { Copy-Item -LiteralPath (Join-Path $src $m.lic) -Destination $licTo }
    }
}
Write-Host 'assets ready'
