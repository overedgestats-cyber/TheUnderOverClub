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

Write-Host ""
Write-Host "OFFICIAL PAID STATISTICS" -ForegroundColor Cyan

$official =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/statistics/official" `
    -Method Get

$official.statistics |
  ConvertTo-Json -Depth 30

Write-Host ""
Write-Host "INTERNAL MODEL STATISTICS" -ForegroundColor Yellow

$model =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/admin/statistics/model" `
    -Method Get `
    -Headers @{
      Authorization = "Bearer $key"
    }

$model.statistics |
  ConvertTo-Json -Depth 30
