$ErrorActionPreference = 'Continue'
$k = 'gYu1s9N1wP'
$p1 = '70000001056265130'
$urls = @(
  "https://api.photo.2gis.com/1.0/photo/list?id=$p1&type=branch&key=$k&page=1&per_page=50",
  "https://api.photo.2gis.com/1.0/photo/list?object_id=$p1&object_type=branch&key=$k",
  "https://api.photo.2gis.com/2.0/photo/list?id=$p1&type=branch&key=$k&page=1&per_page=50",
  "https://api.photo.2gis.com/1.0/branch/$p1/photos?key=$k",
  "https://api.photo.2gis.com/photo/list?id=$p1&type=branch&key=$k",
  "https://api.photo.2gis.com/1.0/album/list?id=$p1&type=branch&key=$k",
  "https://api.photo.2gis.com/1.0/branch/get?id=$p1&key=$k",
  "https://api.photo.2gis.com/1.0/photo/list?id=$p1&key=$k",
  "https://api.photo.2gis.com/1.0/object/$p1/photos?key=$k"
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 25
    Write-Output ("OK {0} [{1}] {2}" -f $r.StatusCode, $r.Content.Length, $u)
    Write-Output ($r.Content.Substring(0, [Math]::Min(600, $r.Content.Length)))
    Write-Output "---"
  } catch {
    Write-Output ("ERR {0} | {1}" -f $_.Exception.Message, $u)
    Write-Output "---"
  }
}
