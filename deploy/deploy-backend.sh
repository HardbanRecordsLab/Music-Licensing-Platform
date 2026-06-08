#!/bin/bash
# ============================================================
# HRL Backend — Deploy script for VPS
# Usage: bash deploy/deploy-backend.sh
# Run from: /var/www/Music-Licensing-Platform (repo root on VPS)
# ============================================================

set -e  # exit on any error

REPO_DIR="/var/www/Music-Licensing-Platform"
DEPLOY_DIR="$REPO_DIR/deploy"
ENV_FILE="$DEPLOY_DIR/.env"

echo "======================================"
echo "  HRL Backend Deploy — $(date)"
echo "======================================"

# 1. Check .env exists
if [ ! -f "$ENV_FILE" ]; then
  echo ""
  echo "ERROR: $ENV_FILE not found!"
  echo "Create it from the example:"
  echo "  cp $DEPLOY_DIR/.env.example $ENV_FILE"
  echo "  nano $ENV_FILE   # fill in secrets"
  echo ""
  exit 1
fi

# 2. Pull latest code
echo "[1/5] Pulling latest code from git..."
cd "$REPO_DIR"
git pull origin main

# 3. Check SSL cert exists (needed for nginx)
CERT_PATH="/etc/letsencrypt/live/hrl-sync-hub.hardbanrecordslab.online/fullchain.pem"
if [ ! -f "$CERT_PATH" ]; then
  echo ""
  echo "WARNING: SSL certificate not found at $CERT_PATH"
  echo "Get it with:"
  echo "  apt install certbot"
  echo "  certbot certonly --standalone -d hrl-sync-hub.hardbanrecordslab.online"
  echo ""
  echo "Continuing without nginx SSL (HTTP only)..."
  # Start without nginx for now
  START_NGINX=false
else
  START_NGINX=true
fi

# 4. Build and start containers
echo "[2/5] Building Docker image..."
cd "$DEPLOY_DIR"

if [ "$START_NGINX" = false ]; then
  # Start only the API and redis, skip nginx
  docker compose --env-file .env up -d --build node-express-api cache-redis
else
  docker compose --env-file .env up -d --build
fi

# 5. Wait for health check
echo "[3/5] Waiting for backend to be healthy..."
sleep 5

MAX_TRIES=12
TRIES=0
until docker exec hrl_node_rest_api wget -qO- http://localhost:9108/api/health > /dev/null 2>&1; do
  TRIES=$((TRIES+1))
  if [ $TRIES -ge $MAX_TRIES ]; then
    echo "ERROR: Backend did not become healthy after 60s"
    echo "Check logs: docker logs hrl_node_rest_api --tail 50"
    exit 1
  fi
  echo "  Waiting... ($TRIES/$MAX_TRIES)"
  sleep 5
done

echo "[4/5] Backend is healthy!"

# 6. Show status
echo "[5/5] Container status:"
docker compose --env-file .env ps

echo ""
echo "======================================"
echo "  Deploy complete!"
echo "  API: https://hrl-sync-hub.hardbanrecordslab.online"
echo "  Health: https://hrl-sync-hub.hardbanrecordslab.online/api/health"
echo "======================================"
