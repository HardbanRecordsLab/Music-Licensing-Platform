#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$ROOT_DIR/deploy/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ENV_FILE"
  set +a
fi

BACKUP_DIR="$ROOT_DIR/deploy/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
echo "Creating backup $BACKUP_DIR/backup-$TIMESTAMP"

if [[ -z "$(docker compose -f deploy/docker-compose.yml ps -q db-mysql)" ]]; then
  echo "ERROR: db-mysql service is not running. Start the stack before backup."
  exit 1
fi

MYSQL_USER="${WORDPRESS_DB_USER:-hrl_mysql_user}"
MYSQL_PASSWORD="${WORDPRESS_DB_PASSWORD:-hrl_db_strong_password_901}"
MYSQL_DB="${WORDPRESS_DB_NAME:-hrl_commerce_db}"

docker compose -f deploy/docker-compose.yml exec -T db-mysql sh -c \
  "exec mysqldump --single-transaction --quick --user=\"$MYSQL_USER\" --password=\"$MYSQL_PASSWORD\" \"$MYSQL_DB\"" > "$BACKUP_DIR/mysql-$TIMESTAMP.sql"

tar czf "$BACKUP_DIR/wp-data-$TIMESTAMP.tar.gz" -C "$ROOT_DIR/deploy" wp-app wp-content

echo "Backup complete: $BACKUP_DIR"
