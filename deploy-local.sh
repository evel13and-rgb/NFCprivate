#!/usr/bin/env bash

set -Eeuo pipefail

readonly SOURCE_DIR='/srv/paramoliterario/source'
readonly DEPLOY_DIR='/var/www/paramo-literario'

usage() {
  printf 'Uso: %s --check|--dry-run|--publish\n' "$0"
}

validate_paths() {
  if [[ "$SOURCE_DIR" != '/srv/paramoliterario/source' ]]; then
    printf 'Error: ruta de origen no autorizada: %s\n' "$SOURCE_DIR" >&2
    exit 1
  fi

  if [[ "$DEPLOY_DIR" != '/var/www/paramo-literario' ]]; then
    printf 'Error: ruta de destino no autorizada: %s\n' "$DEPLOY_DIR" >&2
    exit 1
  fi

  if [[ ! -d "$SOURCE_DIR/.git" ]]; then
    printf 'Error: el origen no es el repositorio esperado: %s\n' "$SOURCE_DIR" >&2
    exit 1
  fi

  if [[ ! -d "$DEPLOY_DIR" ]]; then
    printf 'Error: no existe el destino esperado: %s\n' "$DEPLOY_DIR" >&2
    exit 1
  fi
}

run_check() {
  validate_paths
  cd "$SOURCE_DIR"

  printf '\n== Pruebas ==\n'
  npm test

  printf '\n== Sintaxis JavaScript versionado ==\n'
  mapfile -d '' js_files < <(git ls-files -z -- '*.js')
  if (( ${#js_files[@]} == 0 )); then
    printf 'No hay archivos JavaScript versionados.\n'
  else
    for js_file in "${js_files[@]}"; do
      node --check "$js_file"
    done
  fi

  printf '\n== Comprobacion del diff ==\n'
  git diff --check

  printf '\n== Estado Git ==\n'
  git status --short
}

rsync_args() {
  RSYNC_ARGS=(
    --recursive
    --links
    --perms
    --times
    --devices
    --specials
    --delete-delay
    --itemize-changes
    --filter='protect /server/weather-state.json'
    --filter='hide /server/weather-state.json'
    --filter='protect /server/weather-override.json'
    --filter='hide /server/weather-override.json'
    --filter='protect /.env'
    --filter='hide /.env'
    --filter='protect /runtime/***'
    --filter='hide /runtime/***'
    --exclude='/.git/'
    --exclude='/.github/'
    --exclude='/.agents/'
    --exclude='/.codex/'
    --exclude='/.vscode/'
    --exclude='/.idea/'
    --exclude='/node_modules/'
    --exclude='/tests/'
    --exclude='/docs/'
    --exclude='/scripts/'
    --exclude='/data/editorial/'
    --exclude='/deploy-local.sh'
    --exclude='*.log'
    --exclude='*.tmp'
    --exclude='*.temp'
    --exclude='*.swp'
    --exclude='*.swo'
    --exclude='*~'
    --exclude='*.tar.gz'
  )
}

run_dry_run() {
  run_check
  rsync_args

  printf '\n== Simulacion de publicacion (no escribe nada) ==\n'
  rsync --dry-run "${RSYNC_ARGS[@]}" "$SOURCE_DIR/" "$DEPLOY_DIR/"
}

run_publish() {
  run_dry_run

  printf '\nEscribe PUBLICAR para aplicar exactamente los cambios mostrados: '
  read -r confirmation
  if [[ "$confirmation" != 'PUBLICAR' ]]; then
    printf 'Publicacion cancelada.\n'
    exit 1
  fi

  rsync_args
  printf '\n== Publicacion ==\n'
  rsync "${RSYNC_ARGS[@]}" "$SOURCE_DIR/" "$DEPLOY_DIR/"
  printf 'Publicacion terminada. Nginx no se ha recargado.\n'
}

if (( $# != 1 )); then
  usage >&2
  exit 2
fi

case "$1" in
  --check)
    run_check
    ;;
  --dry-run)
    run_dry_run
    ;;
  --publish)
    run_publish
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
