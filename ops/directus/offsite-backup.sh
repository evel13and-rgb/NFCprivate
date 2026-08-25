#!/usr/bin/env bash

set -Eeuo pipefail

readonly BACKUP_DIRECTORY='/var/lib/paramo-directus/backups'
readonly DEFAULT_CONFIG_FILE='/etc/paramoliterario/directus/restic.env'
readonly DEFAULT_CACHE_DIRECTORY='/var/cache/paramo-restic'
readonly LOCK_FILE='/run/lock/paramo-directus-offsite-backup.lock'
readonly SNAPSHOT_HOST='paramoliterario-vps'
readonly SNAPSHOT_TAG='paramo-editorial'
readonly KEEP_DAILY=30
readonly KEEP_WEEKLY=12
readonly KEEP_MONTHLY=12
readonly MAX_BACKUP_AGE_SECONDS=129600

CONFIG_FILE="${PARAMO_RESTIC_ENV_FILE:-$DEFAULT_CONFIG_FILE}"
CACHE_DIRECTORY="${PARAMO_RESTIC_CACHE_DIRECTORY:-$DEFAULT_CACHE_DIRECTORY}"

usage() {
  printf 'Uso: %s --dry-run|--init|--apply|--restore-test\n' "$0"
}

require_private_root_file() {
  local path="$1"
  local mode owner
  [[ -f "$path" ]]
  mode="$(stat --format='%a' "$path")"
  owner="$(stat --format='%u' "$path")"
  [[ "$owner" == '0' ]]
  (( 8#$mode <= 8#600 ))
}

load_configuration() {
  require_private_root_file "$CONFIG_FILE" || {
    printf 'La configuración debe existir, pertenecer a root y tener modo 0600 o más restrictivo: %s\n' \
      "$CONFIG_FILE" >&2
    return 1
  }

  set -a
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
  set +a

  : "${RESTIC_REPOSITORY:?Falta RESTIC_REPOSITORY en $CONFIG_FILE}"
  : "${RESTIC_PASSWORD_FILE:?Falta RESTIC_PASSWORD_FILE en $CONFIG_FILE}"
  require_private_root_file "$RESTIC_PASSWORD_FILE" || {
    printf 'La contraseña de restic debe pertenecer a root y tener modo 0600 o más restrictivo: %s\n' \
      "$RESTIC_PASSWORD_FILE" >&2
    return 1
  }
  [[ -s "$RESTIC_PASSWORD_FILE" ]]

  if [[ "$RESTIC_REPOSITORY" == s3:* ]]; then
    : "${AWS_ACCESS_KEY_ID:?Falta AWS_ACCESS_KEY_ID en $CONFIG_FILE}"
    : "${AWS_SECRET_ACCESS_KEY:?Falta AWS_SECRET_ACCESS_KEY en $CONFIG_FILE}"
  fi
}

validate_environment() {
  [[ "$BACKUP_DIRECTORY" == '/var/lib/paramo-directus/backups' ]]
  [[ -d "$BACKUP_DIRECTORY" ]]
  command -v restic >/dev/null
  command -v jq >/dev/null
  command -v sha256sum >/dev/null
  command -v flock >/dev/null
  load_configuration
}

latest_automatic_backup() {
  find "$BACKUP_DIRECTORY" -maxdepth 1 -type f \
    -name 'daily-paramo-editorial-*.dump' -printf '%f\n' \
    | grep -E '^daily-paramo-editorial-[0-9]{8}T[0-9]{6}Z\.dump$' \
    | sort -r \
    | head -n 1
}

validate_backup_triplet() {
  local directory="$1"
  local backup_name="$2"
  local backup_path="$directory/$backup_name"
  local manifest_path="$backup_path.manifest.json"
  local checksum_path="$backup_path.sha256"
  local expected_hash actual_hash manifest_file

  [[ "$backup_name" =~ ^daily-paramo-editorial-[0-9]{8}T[0-9]{6}Z\.dump$ ]]
  [[ -s "$backup_path" && -s "$manifest_path" && -s "$checksum_path" ]]
  expected_hash="$(jq -er '.sha256 | select(test("^[0-9a-f]{64}$"))' "$manifest_path")"
  manifest_file="$(jq -er '.backup_file' "$manifest_path")"
  [[ "$manifest_file" == "$backup_name" ]]
  actual_hash="$(sha256sum "$backup_path" | cut -d ' ' -f 1)"
  [[ "$actual_hash" == "$expected_hash" ]]
  (
    cd "$directory"
    sha256sum --check --status "$(basename "$checksum_path")"
  )
  printf '%s\n' "$actual_hash"
}

validate_backup_freshness() {
  local backup_path="$1"
  local current_epoch backup_epoch age
  current_epoch="$(date -u +%s)"
  backup_epoch="$(stat --format='%Y' "$backup_path")"
  age=$(( current_epoch - backup_epoch ))
  (( age >= 0 && age <= MAX_BACKUP_AGE_SECONDS ))
  printf '%s\n' "$age"
}

repository_kind() {
  if [[ "$RESTIC_REPOSITORY" == s3:* ]]; then
    printf 's3\n'
  elif [[ "$RESTIC_REPOSITORY" == /* ]]; then
    printf 'local\n'
  else
    printf 'other\n'
  fi
}

restic_command() {
  restic --cache-dir "$CACHE_DIRECTORY" "$@"
}

prepare_runtime() {
  umask 077
  mkdir -p -m 0700 "$CACHE_DIRECTORY"
  mkdir -p -m 0755 "$(dirname "$LOCK_FILE")"
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    printf 'Ya hay otra operación restic editorial en ejecución.\n' >&2
    return 1
  fi
}

current_backup_metadata() {
  local backup_name backup_hash backup_age
  backup_name="$(latest_automatic_backup)"
  [[ -n "$backup_name" ]]
  backup_hash="$(validate_backup_triplet "$BACKUP_DIRECTORY" "$backup_name")"
  backup_age="$(validate_backup_freshness "$BACKUP_DIRECTORY/$backup_name")"
  jq -n \
    --arg backup "$BACKUP_DIRECTORY/$backup_name" \
    --arg sha256 "$backup_hash" \
    --argjson age_seconds "$backup_age" \
    '{backup: $backup, sha256: $sha256, age_seconds: $age_seconds}'
}

dry_run() {
  local metadata kind
  metadata="$(current_backup_metadata)"
  kind="$(repository_kind)"
  jq -n \
    --arg mode 'dry-run' \
    --arg repository_kind "$kind" \
    --arg source_directory "$BACKUP_DIRECTORY" \
    --argjson keep_daily "$KEEP_DAILY" \
    --argjson keep_weekly "$KEEP_WEEKLY" \
    --argjson keep_monthly "$KEEP_MONTHLY" \
    --argjson current_backup "$metadata" \
    '{
      mode: $mode,
      writes_remote: false,
      repository_kind: $repository_kind,
      source_directory: $source_directory,
      retention: {
        daily: $keep_daily,
        weekly: $keep_weekly,
        monthly: $keep_monthly
      },
      current_backup: $current_backup
    }'
}

initialize_repository() {
  prepare_runtime
  restic_command init
  jq -n \
    --arg mode 'init' \
    --arg repository_kind "$(repository_kind)" \
    '{mode: $mode, initialized: true, repository_kind: $repository_kind}'
}

apply_backup() {
  local metadata snapshot_id
  prepare_runtime
  metadata="$(current_backup_metadata)"

  restic_command backup "$BACKUP_DIRECTORY" \
    --host "$SNAPSHOT_HOST" \
    --tag "$SNAPSHOT_TAG" \
    --exclude='*.tmp' \
    --one-file-system
  restic_command forget \
    --host "$SNAPSHOT_HOST" \
    --tag "$SNAPSHOT_TAG" \
    --keep-daily "$KEEP_DAILY" \
    --keep-weekly "$KEEP_WEEKLY" \
    --keep-monthly "$KEEP_MONTHLY" \
    --prune
  snapshot_id="$(
    restic_command snapshots --json --host "$SNAPSHOT_HOST" --tag "$SNAPSHOT_TAG" \
      | jq -er 'sort_by(.time) | last | .short_id // .id[0:8]'
  )"

  jq -n \
    --arg mode 'apply' \
    --arg snapshot_id "$snapshot_id" \
    --argjson current_backup "$metadata" \
    '{
      mode: $mode,
      encrypted_before_upload: true,
      snapshot_created: true,
      snapshot_id: $snapshot_id,
      current_backup: $current_backup
    }'
}

restore_test() {
  local restore_directory restored_backup_directory backup_name backup_hash
  prepare_runtime
  restore_directory="$(mktemp -d)"
  trap 'rm -rf -- "$restore_directory"' RETURN

  restic_command check
  restic_command restore latest \
    --host "$SNAPSHOT_HOST" \
    --tag "$SNAPSHOT_TAG" \
    --target "$restore_directory"
  restored_backup_directory="$restore_directory$BACKUP_DIRECTORY"
  [[ -d "$restored_backup_directory" ]]
  backup_name="$(
    find "$restored_backup_directory" -maxdepth 1 -type f \
      -name 'daily-paramo-editorial-*.dump' -printf '%f\n' \
      | grep -E '^daily-paramo-editorial-[0-9]{8}T[0-9]{6}Z\.dump$' \
      | sort -r \
      | head -n 1
  )"
  [[ -n "$backup_name" ]]
  backup_hash="$(validate_backup_triplet "$restored_backup_directory" "$backup_name")"

  jq -n \
    --arg mode 'restore-test' \
    --arg restored_backup "$backup_name" \
    --arg sha256 "$backup_hash" \
    '{
      mode: $mode,
      repository_checked: true,
      restored: true,
      checksum_verified: true,
      restored_backup: $restored_backup,
      sha256: $sha256,
      temporary_files_removed: true
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
  --init)
    initialize_repository
    ;;
  --apply)
    apply_backup
    ;;
  --restore-test)
    restore_test
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
