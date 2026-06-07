#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="${1:-http://localhost:9108}"

echo "Checking backend health at $BASE_URL/api/health"
if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required to run smoke checks."
  exit 1
fi

curl -fS "$BASE_URL/api/health"
echo

echo "Checking auth login with demo admin"
curl -fS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrl.pl","password":"adminpass"}'
echo

echo "Smoke check completed."
