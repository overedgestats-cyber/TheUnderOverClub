$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$keyLine = Get-Content ".env.local" |
  Where-Object {
    $_ -match '^\s*INTERNAL_API_SECRET='
  } |
  Select-Object -Last 1

if (-not $keyLine) {
  throw "INTERNAL_API_SECRET was not found in .env.local"
}

$key = (($keyLine -split "=", 2)[1]).Trim().Trim('"').Trim("'")

$baseUrl = "http://localhost:3000"

if ($args.Count -ge 1 -and $args[0]) {
  $baseUrl = $args[0].TrimEnd("/")
}

curl.exe `
  --fail-with-body `
  --silent `
  --show-error `
  -H "Authorization: Bearer $key" `
  "$baseUrl/api/cron/daily-publish"
