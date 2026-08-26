#!/usr/bin/env bash

set -Eeuo pipefail

readonly CONFIG_DIRECTORY='/etc/paramoliterario/directus'
readonly CONFIG_FILE="$CONFIG_DIRECTORY/restic.env"
readonly PASSWORD_FILE="$CONFIG_DIRECTORY/restic_password"

usage() {
  printf 'Uso: sudo %s --apply\n' "$0"
}

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

require_value_without_whitespace() {
  local label="$1"
  local value="$2"
  [[ -n "$value" ]] || fail "$label no puede estar vacío."
  [[ "$value" != *[[:space:]]* ]] || fail "$label no puede contener espacios."
}

if (( $# != 1 )) || [[ "$1" != '--apply' ]]; then
  usage >&2
  exit 2
fi

(( EUID == 0 )) || fail 'Este asistente debe ejecutarse con sudo.'
[[ -t 0 && -t 1 ]] || fail 'Se necesita una terminal interactiva para no exponer secretos.'
command -v install >/dev/null || fail 'No se encuentra install.'

if [[ -e "$CONFIG_FILE" || -e "$PASSWORD_FILE" ]]; then
  fail 'La configuración ya existe; se rechaza sobrescribir credenciales.'
fi

printf 'Los valores sensibles no se mostrarán mientras escribes.\n'
read -r -p 'Nombre exacto del bucket privado: ' bucket_name
read -r -p 'Endpoint S3 (ejemplo: s3.eu-central-003.backblazeb2.com): ' endpoint
read -r -p 'Key ID de la Application Key limitada: ' key_id
read -r -s -p 'Application Key: ' application_key
printf '\n'
read -r -s -p 'Contraseña de restic guardada ya en tu gestor: ' restic_password
printf '\n'
read -r -s -p 'Repite la contraseña de restic: ' restic_password_confirmation
printf '\n'

endpoint="${endpoint#https://}"
endpoint="${endpoint#http://}"
endpoint="${endpoint%/}"

[[ "$bucket_name" =~ ^[a-z0-9][a-z0-9-]{4,61}[a-z0-9]$ ]] \
  || fail 'El nombre del bucket debe tener 6-63 caracteres: minúsculas, números y guiones.'
[[ "$endpoint" =~ ^s3\.([a-z0-9-]+)\.backblazeb2\.com$ ]] \
  || fail 'El endpoint no tiene el formato S3 oficial de Backblaze.'
region="${BASH_REMATCH[1]}"
require_value_without_whitespace 'Key ID' "$key_id"
require_value_without_whitespace 'Application Key' "$application_key"
(( ${#restic_password} >= 32 )) \
  || fail 'La contraseña de restic debe tener al menos 32 caracteres.'
[[ "$restic_password" == "$restic_password_confirmation" ]] \
  || fail 'Las dos contraseñas de restic no coinciden.'

umask 077
temporary_directory="$(mktemp -d)"
trap 'rm -rf -- "$temporary_directory"' EXIT
temporary_config="$temporary_directory/restic.env"
temporary_password="$temporary_directory/restic_password"

{
  printf 'RESTIC_REPOSITORY=%q\n' "s3:https://$endpoint/$bucket_name"
  printf 'RESTIC_PASSWORD_FILE=%q\n' "$PASSWORD_FILE"
  printf 'AWS_ACCESS_KEY_ID=%q\n' "$key_id"
  printf 'AWS_SECRET_ACCESS_KEY=%q\n' "$application_key"
  printf 'AWS_DEFAULT_REGION=%q\n' "$region"
} > "$temporary_config"
printf '%s\n' "$restic_password" > "$temporary_password"

install -d -o root -g root -m 0700 "$CONFIG_DIRECTORY"
install -o root -g root -m 0600 "$temporary_config" "$CONFIG_FILE"
install -o root -g root -m 0600 "$temporary_password" "$PASSWORD_FILE"

unset application_key restic_password restic_password_confirmation

printf '{\n'
printf '  "configured": true,\n'
printf '  "credentials_echoed": false,\n'
printf '  "config_file": "%s",\n' "$CONFIG_FILE"
printf '  "password_file": "%s",\n' "$PASSWORD_FILE"
printf '  "permissions": "0600",\n'
printf '  "next_step": "offsite-backup.sh --dry-run"\n'
printf '}\n'
