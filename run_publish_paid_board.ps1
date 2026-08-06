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

$result = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/publish-paid-board" `
  -Method Post `
  -Headers @{
    Authorization = "Bearer $key"
  } `
  -ContentType "application/json" `
  -Body "{}"

$result |
  ConvertTo-Json -Depth 20
