param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')]
  [string]$Date,

  [switch]$Commit
)

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

$key = (
  ($keyLine -split "=", 2)[1]
).Trim().Trim('"').Trim("'")

$body = @{
  date = $Date
  commit = [bool]$Commit
} | ConvertTo-Json -Depth 10

Write-Host ""
if ($Commit) {
  Write-Host "PAID BOARD COMMIT" -ForegroundColor Yellow
  Write-Host "Date: $Date"
  Write-Host "This will write the current paid-analysis slate to Supabase." -ForegroundColor Yellow
} else {
  Write-Host "PAID BOARD REVIEW / DRY RUN" -ForegroundColor Cyan
  Write-Host "Date: $Date"
  Write-Host "Nothing will be stored." -ForegroundColor DarkGray
}

$result = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/store-paid-analysis" `
  -Method Post `
  -Headers @{
    Authorization = "Bearer $key"
  } `
  -ContentType "application/json" `
  -Body $body

Write-Host ""
$result | ConvertTo-Json -Depth 40
