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

echo "Building application..."
npm run build

echo "Starting Docker Compose services..."
docker compose -f deploy/docker-compose.yml up -d --build

echo "Deployment completed. Use 'docker compose -f deploy/docker-compose.yml ps' to inspect containers."
