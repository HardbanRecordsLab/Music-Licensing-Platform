#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="$ROOT_DIR/deploy/backups"
FILE="${1:-}"

if [[ -z "$FILE" ]]; then
  FILE="$(ls -1t "$BACKUP_DIR"/mysql-*.sql 2>/dev/null | head -n 1)"
  if [[ -z "$FILE" ]]; then
    echo "No backups found in $BACKUP_DIR"
    exit 1
  fi
fi

if [[ ! -f "$FILE" ]]; then
  echo "Backup file not found: $FILE"
  exit 1
fi

BASE="$(basename "$FILE" .sql)"
TIMESTAMP="${BASE#mysql-}"
ARCHIVE="$BACKUP_DIR/wp-data-$TIMESTAMP.tar.gz"

if [[ ! -f "$ARCHIVE" ]]; then
  echo "Archive not found for $FILE: $ARCHIVE"
  exit 1
fi

echo "Restoring WordPress files from $ARCHIVE"
tar xzf "$ARCHIVE" -C "$ROOT_DIR/deploy"

echo "Preparing to restore database from $FILE"
if [[ -z "$(docker compose -f deploy/docker-compose.yml ps -q db-mysql)" ]]; then
  echo "ERROR: db-mysql service is not running. Start the stack before rollback."
  exit 1
fi

ENV_FILE="$ROOT_DIR/deploy/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ENV_FILE"
  set +a
fi

MYSQL_USER="${WORDPRESS_DB_USER:-hrl_mysql_user}"
MYSQL_PASSWORD="${WORDPRESS_DB_PASSWORD:-hrl_db_strong_password_901}"
MYSQL_DB="${WORDPRESS_DB_NAME:-hrl_commerce_db}"

docker compose -f deploy/docker-compose.yml exec -T db-mysql sh -c \
  "exec mysql --user=\"$MYSQL_USER\" --password=\"$MYSQL_PASSWORD\" \"$MYSQL_DB\"" < "$FILE"

echo "Rollback completed."
