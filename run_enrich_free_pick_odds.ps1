param(
  [string]$Date = "",
  [switch]$Commit
)

$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
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

$key = (($keyLine -split "=", 2)[1]).Trim().Trim('"').Trim("'")

$payload = @{
  commit = [bool]$Commit
}

if ($Date) {
  $payload.date = $Date
}

$result =
  Invoke-RestMethod `
    -Uri "http://localhost:3000/api/admin/enrich-free-pick-odds" `
    -Method Post `
    -Headers @{
      Authorization = "Bearer $key"
    } `
    -ContentType "application/json" `
    -Body ($payload | ConvertTo-Json)

$result | ConvertTo-Json -Depth 30
