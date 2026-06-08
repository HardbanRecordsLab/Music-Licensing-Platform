# ============================================================
# HRL Backend — Deploy via SSH from Windows
# Usage: .\deploy\deploy-backend.ps1
# Requires: SSH key at C:\Users\HRL\.ssh\id_ed25519
# ============================================================

$VPS_HOST = "84.247.162.167"
$VPS_USER = "root"
$SSH_KEY  = "C:\Users\HRL\.ssh\id_ed25519"
$REPO_DIR = "/var/www/Music-Licensing-Platform"

Write-Host "======================================"
Write-Host "  HRL Backend Deploy to VPS"
Write-Host "  Host: $VPS_HOST"
Write-Host "======================================"

# Build the remote command
$remote_cmd = @"
set -e
cd $REPO_DIR

# Pull latest
git pull origin main

# Check .env
if [ ! -f deploy/.env ]; then
  echo 'ERROR: deploy/.env missing on VPS. Create it first:'
  echo '  cp deploy/.env.example deploy/.env && nano deploy/.env'
  exit 1
fi

# Build and start
cd deploy
docker compose --env-file .env up -d --build node-express-api cache-redis

# Wait for health
echo 'Waiting for health check...'
sleep 8
wget -qO- http://localhost:9108/api/health && echo 'OK: Backend healthy' || echo 'WARNING: Health check failed - check logs'

docker compose --env-file .env ps
"@

# Run on VPS
ssh -i $SSH_KEY -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" $remote_cmd

Write-Host ""
Write-Host "Done. Check: https://hrl-sync-hub.hardbanrecordslab.online/api/health"
