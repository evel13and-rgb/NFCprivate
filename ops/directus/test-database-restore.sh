#!/usr/bin/env bash

set -Eeuo pipefail

readonly PROJECT_ROOT='/srv/paramoliterario/source'
readonly COMPOSE_FILE="$PROJECT_ROOT/ops/directus/compose.yaml"
readonly COUNTS_SQL="$PROJECT_ROOT/ops/directus/backup-counts.sql"
readonly BACKUP_DIRECTORY='/var/lib/paramo-directus/backups'
readonly RESTORE_DATABASE='paramo_editorial_restore'
backup_path=''

usage() {
  printf 'Uso: %s --latest|--backup=/var/lib/paramo-directus/backups/daily-paramo-editorial-...dump\n' "$0"
}

latest_backup() {
  local -a backups=()
  mapfile -t backups < <(
    find "$BACKUP_DIRECTORY" -maxdepth 1 -type f \
      -name 'daily-paramo-editorial-*.dump' -printf '%p\n' | sort -r
  )
  if (( ${#backups[@]} == 0 )); then
    printf 'No hay copias automáticas para restaurar.\n' >&2
    return 1
  fi
  printf '%s\n' "${backups[0]}"
}

validate_backup_path() {
  local resolved
  resolved="$(realpath -e -- "$1")"
  if [[ ! "$resolved" =~ ^/var/lib/paramo-directus/backups/daily-paramo-editorial-[0-9]{8}T[0-9]{6}Z\.dump$ ]]; then
    printf 'Ruta de copia automática no autorizada: %s\n' "$resolved" >&2
    return 1
  fi
  backup_path="$resolved"
}

if (( $# != 1 )); then
  usage >&2
  exit 2
fi
case "$1" in
  --latest)
    validate_backup_path "$(latest_backup)"
    ;;
  --backup=*)
    validate_backup_path "${1#--backup=}"
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

readonly manifest_path="$backup_path.manifest.json"
[[ -f "$manifest_path" ]]
command -v docker >/dev/null
command -v jq >/dev/null
command -v sha256sum >/dev/null

expected_hash="$(jq -er '.sha256' "$manifest_path")"
actual_hash="$(sha256sum "$backup_path" | cut -d ' ' -f 1)"
if [[ "$expected_hash" != "$actual_hash" ]]; then
  printf 'El hash de la copia no coincide con su manifiesto.\n' >&2
  exit 1
fi
expected_counts="$(jq -ec '.entity_counts' "$manifest_path")"

image_id="$(docker compose -f "$COMPOSE_FILE" images -q database)"
if [[ "$image_id" =~ ^[a-f0-9]{64}$ ]]; then
  image_id="sha256:$image_id"
elif [[ ! "$image_id" =~ ^sha256:[a-f0-9]{64}$ ]]; then
  printf 'No se pudo resolver la imagen PostgreSQL local.\n' >&2
  exit 1
fi
container_name="paramo-restore-test-$(date -u +%Y%m%dT%H%M%SZ)-$$"
if [[ ! "$container_name" =~ ^paramo-restore-test-[0-9]{8}T[0-9]{6}Z-[0-9]+$ ]]; then
  printf 'Nombre temporal no válido.\n' >&2
  exit 1
fi

cleanup() {
  if [[ "$container_name" =~ ^paramo-restore-test- ]]; then
    docker rm -f -- "$container_name" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

docker run --detach --rm \
  --name "$container_name" \
  --network none \
  --tmpfs /var/lib/postgresql/data:rw,noexec,nosuid,size=768m \
  --memory 640m \
  --cpus 1 \
  --pids-limit 128 \
  --env POSTGRES_HOST_AUTH_METHOD=trust \
  "$image_id" >/dev/null

ready=false
for _attempt in {1..40}; do
  if docker exec "$container_name" pg_isready --username=postgres >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  printf 'El PostgreSQL temporal no llegó a estar disponible.\n' >&2
  exit 1
fi

docker exec "$container_name" \
  createdb --username=postgres "$RESTORE_DATABASE"
docker exec -i "$container_name" \
  pg_restore --username=postgres --dbname="$RESTORE_DATABASE" \
    --exit-on-error --no-owner --no-privileges < "$backup_path"
actual_counts="$(
  docker exec -i "$container_name" \
    psql --username=postgres --dbname="$RESTORE_DATABASE" \
      --no-align --tuples-only < "$COUNTS_SQL"
)"
jq -e --argjson expected "$expected_counts" --argjson actual "$actual_counts" \
  '$expected == $actual' <<< '{}' >/dev/null

jq -n \
  --arg backup "$backup_path" \
  --arg sha256 "$actual_hash" \
  --arg image "$image_id" \
  --argjson entity_counts "$actual_counts" \
  '{
    restored: true,
    source_database_untouched: true,
    temporary_container_network: "none",
    backup: $backup,
    sha256: $sha256,
    postgres_image: $image,
    entity_counts: $entity_counts
  }'
