param(
  [string]$Date = "",
  [switch]$Commit
)

$ErrorActionPreference = "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

Set-Location $project

$keyLine = Get-Content ".env.local" |
  Where-Object {
    $_ -match '^\s*INTERNAL_API_SECRET='
  } |
  Select-Object -Last 1

if (-not $keyLine) {
  throw "INTERNAL_API_SECRET was not found in .env.local"
}

$key = (
  ($keyLine -split "=", 2)[1]
).Trim().Trim('"').Trim("'")

$payload = @{
  commit = $Commit.IsPresent
}

if ($Date) {
  if (
    $Date -notmatch
    '^\d{4}-\d{2}-\d{2}$'
  ) {
    throw "Date must use YYYY-MM-DD format"
  }

  $payload.date = $Date
}

$body =
  $payload |
  ConvertTo-Json

$result = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/store-paid-analysis" `
  -Method Post `
  -Headers @{
    Authorization = "Bearer $key"
  } `
  -ContentType "application/json" `
  -Body $body

Write-Host ""

if ($Commit.IsPresent) {
  Write-Host "PERMANENT PAID ANALYSIS SAVE" -ForegroundColor Green
}
else {
  Write-Host "DRY RUN - NOTHING SAVED" -ForegroundColor Cyan
}

$result |
  ConvertTo-Json -Depth 30
