#!/usr/bin/env bash

set -Eeuo pipefail

readonly PROJECT_ROOT='/srv/paramoliterario/source'
readonly COMPOSE_FILE="$PROJECT_ROOT/ops/directus/compose.yaml"
readonly COUNTS_SQL="$PROJECT_ROOT/ops/directus/backup-counts.sql"
readonly BACKUP_DIRECTORY='/var/lib/paramo-directus/backups'
readonly LOCK_FILE='/run/lock/paramo-directus-backup.lock'
readonly DATABASE_NAME='paramo_editorial'
readonly DATABASE_USER='directus'
readonly RETENTION_COUNT=14
readonly AUTOMATIC_PATTERN='daily-paramo-editorial-*.dump'

usage() {
  printf 'Uso: %s --dry-run|--apply\n' "$0"
}

validate_environment() {
  [[ "$PROJECT_ROOT" == '/srv/paramoliterario/source' ]]
  [[ "$BACKUP_DIRECTORY" == '/var/lib/paramo-directus/backups' ]]
  [[ -f "$COMPOSE_FILE" ]]
  [[ -f "$COUNTS_SQL" ]]
  command -v docker >/dev/null
  command -v jq >/dev/null
  command -v sha256sum >/dev/null
  command -v flock >/dev/null
  docker compose -f "$COMPOSE_FILE" ps --status running --services \
    | grep -Fxq 'database'
}

database_counts() {
  docker compose -f "$COMPOSE_FILE" exec -T database \
    psql --username="$DATABASE_USER" --dbname="$DATABASE_NAME" \
      --no-align --tuples-only < "$COUNTS_SQL"
}

postgres_version() {
  docker compose -f "$COMPOSE_FILE" exec -T database \
    psql --username="$DATABASE_USER" --dbname="$DATABASE_NAME" \
      --no-align --tuples-only \
      --command='SHOW server_version;'
}

apply_retention() {
  local -a automatic_backups=()
  local backup_name backup_path index
  mapfile -t automatic_backups < <(
    find "$BACKUP_DIRECTORY" -maxdepth 1 -type f \
      -name "$AUTOMATIC_PATTERN" -printf '%f\n' | sort -r
  )
  for (( index=RETENTION_COUNT; index<${#automatic_backups[@]}; index+=1 )); do
    backup_name="${automatic_backups[$index]}"
    if [[ ! "$backup_name" =~ ^daily-paramo-editorial-[0-9]{8}T[0-9]{6}Z\.dump$ ]]; then
      printf 'Nombre automático inesperado; se rechaza borrar: %s\n' "$backup_name" >&2
      return 1
    fi
    backup_path="$BACKUP_DIRECTORY/$backup_name"
    printf 'Retención: eliminando copia automática antigua %s\n' "$backup_path"
    rm -f -- "$backup_path" "$backup_path.sha256" "$backup_path.manifest.json"
  done
}

dry_run() {
  local counts
  counts="$(database_counts)"
  jq -e 'type == "object" and (.quotes | type == "number")' <<< "$counts" >/dev/null
  jq -n \
    --arg backup_directory "$BACKUP_DIRECTORY" \
    --argjson retention "$RETENTION_COUNT" \
    --argjson entity_counts "$counts" \
    '{
      mode: "dry-run",
      writes_backup: false,
      backup_directory: $backup_directory,
      automatic_retention_count: $retention,
      manual_backups_affected: false,
      entity_counts: $entity_counts
    }'
}

apply_backup() {
  umask 077
  mkdir -p -m 0700 "$BACKUP_DIRECTORY"
  mkdir -p -m 0755 "$(dirname "$LOCK_FILE")"
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    printf 'Ya hay otra copia editorial en ejecución.\n' >&2
    return 1
  fi

  local timestamp final_path temporary_path manifest_path manifest_temporary
  local checksum_path checksum_temporary counts version size hash created_at
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  final_path="$BACKUP_DIRECTORY/daily-paramo-editorial-$timestamp.dump"
  temporary_path="$final_path.tmp"
  manifest_path="$final_path.manifest.json"
  manifest_temporary="$manifest_path.tmp"
  checksum_path="$final_path.sha256"
  checksum_temporary="$checksum_path.tmp"

  if [[ -e "$final_path" || -e "$temporary_path" ]]; then
    printf 'La ruta de copia ya existe: %s\n' "$final_path" >&2
    return 1
  fi
  trap 'rm -f -- "$temporary_path" "$manifest_temporary" "$checksum_temporary"' RETURN

  docker compose -f "$COMPOSE_FILE" exec -T database \
    pg_dump --username="$DATABASE_USER" --dbname="$DATABASE_NAME" \
      --format=custom --compress=6 --no-owner --no-privileges > "$temporary_path"
  [[ -s "$temporary_path" ]]
  docker compose -f "$COMPOSE_FILE" exec -T database \
    pg_restore --list < "$temporary_path" >/dev/null

  counts="$(database_counts)"
  jq -e 'type == "object" and (.quotes | type == "number")' <<< "$counts" >/dev/null
  version="$(postgres_version)"
  size="$(stat --format='%s' "$temporary_path")"
  hash="$(sha256sum "$temporary_path" | cut -d ' ' -f 1)"
  jq -n \
    --arg backup_file "$(basename "$final_path")" \
    --arg created_at "$created_at" \
    --arg database "$DATABASE_NAME" \
    --arg format 'postgresql-custom' \
    --arg postgres_version "$version" \
    --arg sha256 "$hash" \
    --argjson byte_size "$size" \
    --argjson entity_counts "$counts" \
    '{
      schema_version: 1,
      backup_file: $backup_file,
      created_at: $created_at,
      database: $database,
      format: $format,
      postgres_version: $postgres_version,
      byte_size: $byte_size,
      sha256: $sha256,
      entity_counts: $entity_counts
    }' > "$manifest_temporary"
  jq -e '.schema_version == 1 and (.sha256 | length == 64)' \
    "$manifest_temporary" >/dev/null
  printf '%s  %s\n' "$hash" "$(basename "$final_path")" > "$checksum_temporary"

  mv -- "$temporary_path" "$final_path"
  mv -- "$manifest_temporary" "$manifest_path"
  mv -- "$checksum_temporary" "$checksum_path"
  chmod 0600 "$final_path" "$manifest_path" "$checksum_path"
  apply_retention

  jq -n \
    --arg backup "$final_path" \
    --arg manifest "$manifest_path" \
    --arg sha256 "$hash" \
    --argjson byte_size "$size" \
    --argjson retention "$RETENTION_COUNT" \
    --argjson entity_counts "$counts" \
    '{
      mode: "apply",
      backup: $backup,
      manifest: $manifest,
      sha256: $sha256,
      byte_size: $byte_size,
      automatic_retention_count: $retention,
      manual_backups_affected: false,
      entity_counts: $entity_counts
    }'
}

if (( $# != 1 )); then
  usage >&2
  exit 2
fi

validate_environment
case "$1" in
  --dry-run)
    dry_run
    ;;
  --apply)
    apply_backup
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
