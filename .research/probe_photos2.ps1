$ErrorActionPreference = 'Continue'
$k = 'gYu1s9N1wP'
$p1 = '70000001056265130'
$tag = 'main/branch/201/70000001056265130/common'
$urls = @(
  "https://api.photo.2gis.com/1.0/photos?id=$p1&key=$k",
  "https://api.photo.2gis.com/1.0/photo?id=$p1&key=$k",
  "https://api.photo.2gis.com/2.0/photos?id=$p1&key=$k",
  "https://api.photo.2gis.com/1.0/branch/photos?id=$p1&key=$k",
  "https://api.photo.2gis.com/photos?id=$p1&key=$k",
  "https://api.photo.2gis.com/1.0/photo/get?id=$p1&key=$k",
  "https://api.photo.2gis.com/1.0/album/photos?tag=$tag&key=$k",
  "https://api.photo.2gis.com/1.0/tag/photos?tag=$tag&key=$k",
  "https://api.photo.2gis.com/1.0/photo/list?tag=$tag&key=$k",
  "https://public-api.reviews.2gis.com/2.0/objects/$p1/photos?key=6e7e1929-4ea9-4a5d-8c05-d601860389bd",
  "https://public-api.reviews.2gis.com/2.0/branches/$p1/photos?key=6e7e1929-4ea9-4a5d-8c05-d601860389bd&limit=50",
  "https://public-api.reviews.2gis.com/3.0/branches/$p1/photos?key=6e7e1929-4ea9-4a5d-8c05-d601860389bd"
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20
    $c = $r.Content
    if ($c.Length -lt 200) { Write-Output ("NOTFOUND? {0} | {1}" -f $u, $c) }
    else { Write-Output ("OK [{0}] {1}" -f $c.Length, $u); Write-Output ($c.Substring(0,[Math]::Min(700,$c.Length))) }
    Write-Output "---"
  } catch { Write-Output ("ERR {0} | {1}" -f $_.Exception.Message, $u); Write-Output "---" }
}
