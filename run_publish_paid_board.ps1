param(
  [Parameter(Mandatory = $false)]
  [string]$Date,

  [switch]$Commit
)

Write-Host ""
Write-Host "BLOCKED: this legacy runner used /api/admin/publish-paid-board and could publish the wrong Sofia date." -ForegroundColor Red
Write-Host ""
Write-Host "Use the current paid-analysis runner instead:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  powershell -ExecutionPolicy Bypass -File .\run_paid_board.ps1 -Date 2026-08-20" -ForegroundColor White
Write-Host ""
Write-Host "Review the output first. Only after review:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  powershell -ExecutionPolicy Bypass -File .\run_paid_board.ps1 -Date 2026-08-20 -Commit" -ForegroundColor White
Write-Host ""
exit 1
