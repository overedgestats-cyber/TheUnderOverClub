$ErrorActionPreference = "Stop"

$project =
  "C:\Users\Marty\Desktop\theunderoverclub"

Set-Location $project

Write-Host ""
Write-Host "FREE PICKS STATISTICS" -ForegroundColor Cyan

$free =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/statistics/free" `
    -Method Get

$free.statistics |
  ConvertTo-Json -Depth 30

Write-Host ""
Write-Host "PAID PICKS STATISTICS" -ForegroundColor Yellow

$paid =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/statistics/paid" `
    -Method Get

$paid.statistics |
  ConvertTo-Json -Depth 30

Write-Host ""
Write-Host "COMBINED OVERVIEW" -ForegroundColor Green

$overview =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/statistics/overview" `
    -Method Get

$overview.statistics |
  ConvertTo-Json -Depth 30
