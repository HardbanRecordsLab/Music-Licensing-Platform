param(
    [string]$Url = "http://localhost:9108"
)

Set-StrictMode -Version Latest
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root\..

Write-Host "Checking backend health at $Url/api/health"
try {
    $health = Invoke-RestMethod -Uri "$Url/api/health" -Method Get -ErrorAction Stop
    Write-Host "Health response:" ($health | ConvertTo-Json)
} catch {
    Write-Error "Health check failed: $_"
    exit 1
}

Write-Host "Checking auth login with demo admin"
try {
    $login = Invoke-RestMethod -Uri "$Url/api/auth/login" -Method Post -ContentType 'application/json' -Body '{"email":"admin@hrl.pl","password":"adminpass"}' -ErrorAction Stop
    Write-Host "Login response:" ($login | ConvertTo-Json)
} catch {
    Write-Error "Auth login failed: $_"
    exit 1
}

Write-Host "Smoke check completed successfully."
