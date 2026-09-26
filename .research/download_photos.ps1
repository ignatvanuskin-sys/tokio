$ErrorActionPreference = 'Stop'
$research = $PSScriptRoot
$root = Split-Path -Parent $research
$raw = Join-Path $research 'photos_raw'
New-Item -ItemType Directory -Force -Path $raw | Out-Null
$data = Get-Content (Join-Path $research 'results.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$i = 0
$manifest = @()
foreach ($p in $data.photos) {
  $i++
  $name = ('p{0:d2}.jpg' -f $i)
  $dest = Join-Path $raw $name
  if (-not (Test-Path $dest)) {
    curl.exe -s -L --max-time 60 -A "Mozilla/5.0" -e "https://2gis.kz/" $p.url -o $dest
  }
  if (Test-Path $dest) {
    $len = (Get-Item $dest).Length
    $manifest += [pscustomobject]@{ file = $name; bytes = $len; src = $p.url; alt = $p.caption_or_alt; declared = $p.size }
    Write-Output ("{0}  {1,10} bytes" -f $name, $len)
  } else {
    Write-Output "MISSING $name"
  }
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $research 'photos_manifest.json')
Write-Output "TOTAL DOWNLOADED: $($manifest.Count)"
