$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$keyLine = Get-Content ".env.local" |
  Where-Object { $_ -match '^\s*INTERNAL_API_SECRET=' } |
  Select-Object -First 1

if (-not $keyLine) {
  throw "INTERNAL_API_SECRET was not found in .env.local"
}

$key = (($keyLine -split '=', 2)[1]).Trim().Trim('"').Trim("'")

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/import-fixtures" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $key" } `
  -ContentType "application/json" `
  -Body "{}" |
  ConvertTo-Json -Depth 10
