#!/usr/bin/env bash

set -Eeuo pipefail

readonly PROJECT_ROOT='/srv/paramoliterario/source'
readonly COMPOSE_FILE="$PROJECT_ROOT/ops/directus/compose.yaml"
readonly BACKUP_DIRECTORY='/var/lib/paramo-directus/backups'
readonly MIGRATION_FILE="$PROJECT_ROOT/ops/directus/migrations/002_phase4_profile_authority.sql"
readonly CUTOVER_SCRIPT="$PROJECT_ROOT/scripts/prepare-directus-phase4-profile-cutover.mjs"
readonly RESTORE_DATABASE='paramo_editorial_phase4_test'

latest_backup="$({
  find "$BACKUP_DIRECTORY" -maxdepth 1 -type f \
    -name 'daily-paramo-editorial-*.dump' -printf '%p\n' | sort -r | head -n 1
})"
if [[ ! "$latest_backup" =~ ^/var/lib/paramo-directus/backups/daily-paramo-editorial-[0-9]{8}T[0-9]{6}Z\.dump$ ]]; then
  printf 'No se encontró una copia automática válida.\n' >&2
  exit 1
fi

manifest_path="$latest_backup.manifest.json"
expected_hash="$(jq -er '.sha256' "$manifest_path")"
actual_hash="$(sha256sum "$latest_backup" | cut -d ' ' -f 1)"
[[ "$actual_hash" == "$expected_hash" ]]

image_id="$(docker compose -f "$COMPOSE_FILE" images -q database)"
if [[ "$image_id" =~ ^[a-f0-9]{64}$ ]]; then
  image_id="sha256:$image_id"
elif [[ ! "$image_id" =~ ^sha256:[a-f0-9]{64}$ ]]; then
  printf 'No se pudo resolver la imagen PostgreSQL local.\n' >&2
  exit 1
fi

container_name="paramo-phase4-test-$(date -u +%Y%m%dT%H%M%SZ)-$$"
cutover_sql="$(mktemp)"
cleanup() {
  if [[ "$container_name" =~ ^paramo-phase4-test- ]]; then
    docker rm -f -- "$container_name" >/dev/null 2>&1 || true
  fi
  rm -f -- "$cutover_sql"
}
trap cleanup EXIT

node "$CUTOVER_SCRIPT" --sql > "$cutover_sql"
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
[[ "$ready" == true ]]

docker exec "$container_name" createdb --username=postgres "$RESTORE_DATABASE"
docker exec -i "$container_name" \
  pg_restore --username=postgres --dbname="$RESTORE_DATABASE" \
    --exit-on-error --no-owner --no-privileges < "$latest_backup"
phase4_schema_present="$({
  docker exec -i "$container_name" \
    psql --set ON_ERROR_STOP=1 --username=postgres --dbname="$RESTORE_DATABASE" \
      --tuples-only --no-align \
      --command="SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'authors' AND column_name = 'public_biography_long';"
})"
if [[ "$phase4_schema_present" == '0' ]]; then
  docker exec -i "$container_name" \
    psql --set ON_ERROR_STOP=1 --username=postgres --dbname="$RESTORE_DATABASE" \
    < "$MIGRATION_FILE" >/dev/null
elif [[ "$phase4_schema_present" != '1' ]]; then
  printf 'Estado inesperado del esquema de fase 4.\n' >&2
  exit 1
fi
docker exec -i "$container_name" \
  psql --set ON_ERROR_STOP=1 --username=postgres --dbname="$RESTORE_DATABASE" \
  < "$cutover_sql" >/dev/null

result="$({
  docker exec -i "$container_name" \
    psql --set ON_ERROR_STOP=1 --username=postgres --dbname="$RESTORE_DATABASE" \
      --tuples-only --no-align <<'SQL'
SELECT json_build_object(
  'public_authors', (SELECT count(*) FROM authors WHERE workflow_status = 'approved' AND visibility = 'public'),
  'public_works', (SELECT count(*) FROM works WHERE workflow_status = 'approved' AND visibility = 'public'),
  'themes', (SELECT count(*) FROM themes),
  'author_themes', (SELECT count(*) FROM author_themes),
  'work_themes', (SELECT count(*) FROM work_themes)
);
SQL
})"

jq -e '
  .public_authors == 23
  and .public_works == 28
  and .themes == 364
  and .author_themes == 371
  and .work_themes == 327
' <<< "$result" >/dev/null

jq -n \
  --arg backup "$latest_backup" \
  --arg sha256 "$actual_hash" \
  --argjson counts "$result" \
  '{
    phase4_cutover_validated: true,
    source_database_untouched: true,
    temporary_container_network: "none",
    backup: $backup,
    sha256: $sha256,
    counts: $counts
  }'
