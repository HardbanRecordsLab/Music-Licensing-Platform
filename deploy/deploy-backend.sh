#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed or not available in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed or not available in PATH."
  exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building backend only..."
npm run build:backend

echo "Starting backend services..."
docker compose -f deploy/docker-compose.yml up -d --build node-express-api cache-redis db-mysql

echo "Backend deployment completed. Use 'docker compose -f deploy/docker-compose.yml ps' to inspect containers."
