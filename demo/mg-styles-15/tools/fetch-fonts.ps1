$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    $latin = 'source/assets/fonts/latin/fredoka'
    $noto = 'source/assets/fonts/cjk/notosanssc'
    $rounded = 'source/assets/fonts/cjk/resourcehanrounded'
    New-Item -ItemType Directory -Force -Path $latin,$noto,$rounded,'downloads/rhr-extracted' | Out-Null
    $downloads = @{
        "$latin/Fredoka-VF.ttf" = 'https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/Fredoka%5Bwdth,wght%5D.ttf'
        "$latin/OFL.txt" = 'https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/OFL.txt'
        "$noto/NotoSansSC-VF.ttf" = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf'
        "$noto/OFL.txt" = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt'
        "$rounded/OFL-License.txt" = 'https://raw.githubusercontent.com/CyanoHao/Resource-Han-Rounded/master/OFL-License.txt'
        "$rounded/LICENSE.md" = 'https://raw.githubusercontent.com/CyanoHao/Resource-Han-Rounded/master/LICENSE.md'
        'downloads/RHR-TTF-0.990.7z' = 'https://github.com/CyanoHao/Resource-Han-Rounded/releases/download/v0.990/RHR-TTF-0.990.7z'
    }
    foreach ($entry in $downloads.GetEnumerator()) {
        if (!(Test-Path -LiteralPath $entry.Key)) {
            Invoke-WebRequest -Uri $entry.Value -OutFile $entry.Key
        }
    }
    tar -xf downloads/RHR-TTF-0.990.7z -C downloads/rhr-extracted ResourceHanRoundedSC-Bold.ttf ResourceHanRoundedSC-Heavy.ttf
    if ($LASTEXITCODE -ne 0) { throw 'Font archive extraction failed.' }
    foreach ($weight in @('Bold','Heavy')) {
        Copy-Item -LiteralPath "downloads/rhr-extracted/ResourceHanRoundedSC-$weight.ttf" -Destination "$rounded/ResourceHanRoundedCN-$weight.ttf"
    }
    foreach ($font in (Get-Content -LiteralPath tools/font-checksums.json -Raw | ConvertFrom-Json)) {
        $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path 'source' $font.path)).Hash
        if ($actual -ne $font.sha256) { throw "Font changed or download incomplete: $($font.path). Verify the source version before updating checksums." }
    }
    Write-Output 'Fonts and recorded SHA256 checksums verified.'
} finally {
    Pop-Location
}
