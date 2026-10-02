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

$body = "{}"

if ($args.Count -gt 0) {
  $fixtureId = 0

  if (
    -not [int]::TryParse(
      $args[0],
      [ref]$fixtureId
    )
  ) {
    throw "Fixture ID must be an integer"
  }

  $body = @{
    providerFixtureId = $fixtureId
  } | ConvertTo-Json
}

$result = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/analysis-preview" `
  -Method Post `
  -Headers @{
    Authorization = "Bearer $key"
  } `
  -ContentType "application/json" `
  -Body $body

$result |
  ConvertTo-Json -Depth 30
