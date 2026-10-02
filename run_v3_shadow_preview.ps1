param(
  [Parameter(Mandatory=$true)]
  [int]$FixtureId,
  [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

Set-Location $project

$keyLine =
  Get-Content ".env.local" |
  Where-Object {
    $_ -match '^\s*INTERNAL_API_SECRET='
  } |
  Select-Object -Last 1

if (-not $keyLine) {
  throw "INTERNAL_API_SECRET was not found in .env.local"
}

$key =
  (($keyLine -split "=", 2)[1]).
    Trim().
    Trim('"').
    Trim("'")

$body =
  @{
    fixtureId =
      $FixtureId
  } |
  ConvertTo-Json

curl.exe `
  --fail-with-body `
  --silent `
  --show-error `
  -X POST `
  -H "Authorization: Bearer $key" `
  -H "Content-Type: application/json" `
  -d $body `
  "$($BaseUrl.TrimEnd('/'))/api/admin/analysis-v3-preview"
