# Piloto editorial Directus/PostgreSQL

Esta carpeta define el piloto reproducible que se inicializó el 20 de agosto de
2026. Docker está instalado y los contenedores de Directus/PostgreSQL están
activos, saludables y limitados a la red prevista.

El piloto contiene 18 colecciones, 231 campos y 46 relaciones registradas en
Directus. La primera importación base incorporó 27 autores, 29 obras, 29 fuentes y
sus relaciones; frases, originales, temas y audio siguen pendientes. El
administrador inicial `paramorliterario@gmail.com` está creado y verificado.

## Decisiones del piloto

- Directus `12.3.0` y PostgreSQL `16.14-bookworm`, con sus digests exactos además
  de las etiquetas de versión.
- Sin Redis.
- PostgreSQL no publica ningún puerto en el host.
- Directus solo escucha en `127.0.0.1:8055`.
- Sin configuración de Nginx durante el piloto inicial.
- Acceso al panel mediante túnel SSH.
- Secretos en `/etc/paramoliterario/directus/`, fuera del repositorio.
- Base de datos en el volumen administrado `paramo-directus-postgres` y archivos
  subidos en `/var/lib/paramo-directus/`.
- Límites de 1 GiB para Directus y 640 MiB para PostgreSQL.
- Ningún contenedor escribe los JSON de producción.

El directorio `ops/` está excluido de `deploy-local.sh` y no se copia a la raíz
pública.

## Licencia

Directus 12 utiliza MSCL. El piloto puede comenzar en el nivel Core con un único
usuario y el modelo previsto cabe inicialmente en su límite de colecciones. Antes
de ampliar usuarios o pasar a uso editorial oficial deben revisarse los términos y
solicitarse una clave de la Open Innovation Grant si el titular cumple sus
requisitos.

No se incluirá una clave de licencia en Git.

## Preparación realizada en el host

Se completaron estas operaciones:

1. Instalar Docker Engine `29.7.2` y Compose `5.5.0` desde el repositorio oficial
   para Ubuntu 24.04.
2. Crear `/var/lib/paramo-directus/uploads` y `extensions` con propietarios
   compatibles con la imagen fijada. PostgreSQL utiliza un volumen administrado
   para que su UID interno no coincida con el usuario del backend en el host.
3. Crear `/etc/paramoliterario/directus/` con permisos restrictivos.
4. Generar valores aleatorios independientes para:
   - `postgres_password`.
   - `directus_secret`.
   Los archivos no deben terminar en un salto de línea; el directorio será
   `0700 root:root` y los archivos `0640 root:1000`, porque Directus se ejecuta
   como UID/GID 1000 dentro del contenedor.
5. Validar `compose.yaml` antes de arrancar servicios.
6. Descargar las imágenes y fijar sus digests exactos.
7. Arrancar el piloto y medir recursos antes de crear el modelo editorial.
8. Crear el modelo editorial vacío y guardar copias de seguridad antes de cada
   cambio estructural.
9. Registrar en Directus los metadatos de colecciones, campos y relaciones, y
   generar una instantánea declarativa sin secretos.

El administrador inicial se creó mediante la CLI interna de Directus. Su contraseña
temporal está en
`/etc/paramoliterario/directus/admin_initial_password`, con permisos `0600`, y no
forma parte de Compose ni Git. Debe cambiarse al iniciar sesión por primera vez y
el archivo temporal debe eliminarse después de comprobar el nuevo acceso.

## Acceso mediante túnel SSH

Una vez que el piloto esté en ejecución, desde un equipo autorizado:

```sh
ssh -L 8055:127.0.0.1:8055 usuario@servidor
```

El navegador accederá entonces a `http://127.0.0.1:8055`. El puerto 8055 no debe
abrirse en el firewall ni exponerse directamente a Internet.

## Operación prevista

Los comandos se ejecutarán desde la raíz del repositorio:

```sh
docker compose -f ops/directus/compose.yaml config
docker compose -f ops/directus/compose.yaml up -d
docker compose -f ops/directus/compose.yaml ps
docker compose -f ops/directus/compose.yaml logs --tail=100
```

## Esquema editorial

La primera migración versionada está en:

```text
ops/directus/migrations/001_editorial_schema.sql
```

Se aplica desde la raíz del repositorio y se detiene ante el primer error:

```sh
docker compose -f ops/directus/compose.yaml exec -T database \
  psql --set ON_ERROR_STOP=1 --username directus --dbname paramo_editorial \
  < ops/directus/migrations/001_editorial_schema.sql
```

La migración crea únicamente el modelo vacío. Debe aplicarse una sola vez sobre
una instalación de Directus sin esas tablas. La importación de autores, obras,
frases, originales y fuentes es un proceso posterior y separado.

La importación inicial de autores, obras y fuentes se prepara sin conectar con la
base de datos:

```sh
node scripts/prepare-directus-base-import.mjs --dry-run
node scripts/prepare-directus-base-import.mjs --json
node scripts/prepare-directus-base-import.mjs --sql
```

El modo predeterminado solo muestra el resumen. `--sql` emite por la salida
estándar una transacción revisable que se niega a trabajar si las tablas de
destino ya contienen datos. La incorporación al piloto se realizó después de
comparar las huellas del plan y crear una copia completa de PostgreSQL.

Después se registran los metadatos que convierten las tablas en un panel
utilizable. El configurador se niega a trabajar contra una URL que no sea local,
lee la contraseña desde el archivo protegido del host y no imprime credenciales:

```sh
node scripts/configure-directus-editorial-metadata.mjs --dry-run
node scripts/configure-directus-editorial-metadata.mjs
```

Las opciones `--skip-relations` y `--only-relations` permiten separar las dos
partes durante una recuperación. El proceso es repetible: las relaciones ya
registradas se detectan y no se duplican.

La instantánea revisada del modelo está en:

```text
ops/directus/schema/editorial-schema.yaml
```

Se regenera dentro del contenedor para que la versión de la CLI coincida con la
versión de Directus:

```sh
docker compose -f ops/directus/compose.yaml exec -T directus \
  node cli.js schema snapshot /tmp/editorial-schema.yaml --yes --format yaml
```

Antes de sustituir la copia del repositorio hay que revisar cantidades y buscar
credenciales o secretos. La instantánea esperada contiene 18 colecciones, 231
campos y 46 relaciones.

Detener el piloto no borra sus volúmenes:

```sh
docker compose -f ops/directus/compose.yaml stop
```

No se utilizará `down --volumes` en un entorno con datos que deban conservarse.

## Salud y recursos

Las comprobaciones mínimas serán:

```sh
curl --fail http://127.0.0.1:8055/server/ping
docker compose -f ops/directus/compose.yaml ps
docker stats --no-stream
free -h
vmstat 1 5
```

Durante el piloto se registrarán RAM máxima, swap, reinicios, uso de CPU y espacio
de disco. La web y el backend meteorológico deberán verificarse después de cada
cambio de infraestructura.

## Copias antes de considerar producción

- `pg_dump` diario con varias generaciones.
- Al menos una copia fuera del VPS.
- Copia independiente de `uploads`.
- Snapshot declarativo del esquema Directus guardado en Git.
- Prueba real de restauración en un entorno vacío.
- Snapshot del VPS antes de actualizar las imágenes.

## Publicación

El panel no publicará directamente. Un exportador externo leerá PostgreSQL,
generará artefactos temporales, ejecutará validaciones y registrará el resultado en
`publication_runs`. Solo una acción posterior y explícita podrá sustituir los JSON
públicos.

La web pública nunca consultará Directus en cada visita.
