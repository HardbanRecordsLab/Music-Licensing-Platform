param(
    [string]$ComposeFile = "deploy/docker-compose.yml"
)

Set-StrictMode -Version Latest
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root\.. 

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not available in PATH."
    exit 1
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not available in PATH."
    exit 1
}

Write-Host "Installing dependencies..."
npm install

Write-Host "Building backend only..."
npm run build:backend

Write-Host "Starting backend services..."
docker compose -f $ComposeFile up -d --build node-express-api cache-redis db-mysql

Write-Host "Backend deployment completed. Use 'docker compose -f $ComposeFile ps' to inspect running containers."
