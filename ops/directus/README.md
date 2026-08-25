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

El espacio de trabajo privado se configura después de importar el catálogo. El
script crea vistas personales para frases, originales, fuentes, hablantes y
audio, además de marcadores para cada etapa de revisión. No modifica contenido,
no crea permisos públicos y es repetible:

```sh
node scripts/configure-directus-editorial-workspace.mjs --dry-run
node scripts/configure-directus-editorial-workspace.mjs
```

Mientras solo exista una persona administradora no se crea un rol editorial
adicional. Los roles y permisos separados se incorporarán cuando haya una
segunda cuenta humana con responsabilidades distintas.

La equivalencia entre la base privada y el contrato público se comprueba sin
sobrescribir el runtime de producción. El exportador solo admite destinos bajo
`/tmp`, valida fuentes, derechos, relaciones, hashes y campos públicos, y falla
si el resultado no coincide byte por byte con el JSON versionado:

```sh
node scripts/export-directus-quotes-preview.mjs
node scripts/export-directus-quotes-preview.mjs \
  --output=/tmp/paramo-directus-quotes-preview.json
```

Este paso es exclusivamente una vista previa. La publicación desde Directus
requerirá un comando diferente, una copia previa y una aprobación explícita.

Una vez cotejado todo el catálogo, su estado editorial puede alinearse con lo que
ya está publicado. La orden sin argumentos solo muestra el plan. Antes de aplicar
comprueba que Directus coincide byte por byte con el JSON público, que las fuentes
y derechos están validados y que la API anónima continúa cerrada:

```sh
node scripts/approve-directus-current-catalog.mjs
node scripts/approve-directus-current-catalog.mjs \
  --apply \
  --confirm-public-sha=<sha256-del-json-publico>
```

La aplicación requiere una copia PostgreSQL previa. Marca como aprobados y
públicos los registros que ya forman parte del JSON vigente, y registra quién y
cuándo los revisó. No escribe ni publica archivos estáticos. El hash explícito
impide aprobar por accidente una versión distinta de la revisada.

El candidato publicable se genera después, siempre bajo `/tmp`. La primera orden
es una simulación; la segunda registra el intento y su resultado en
`publication_runs`. Para registrar una ejecución, Git debe estar limpio:

```sh
node scripts/prepare-directus-quotes-publication.mjs
node scripts/prepare-directus-quotes-publication.mjs --record
```

Solo entran frases e originales aprobados, públicos, verificados y con revisión
registrada. También se vuelven a validar fuentes, derechos, relaciones y hashes.
Si el candidato difiere del JSON vigente, se detiene; `--allow-content-changes`
solo se utilizará tras revisar deliberadamente altas, bajas o modificaciones. La
ejecución validada no sustituye el JSON público ni despliega la web.

Antes de habilitar cambios reales se prueban en memoria los caminos de alta,
modificación de traducción u original, exclusión y baja. El control adicional
confirma que un borrador nuevo no altera el candidato y que cualquier cambio
publicable exige autorización explícita:

```sh
node scripts/simulate-directus-publication-changes.mjs
```

El informe se guarda en `/tmp`, sin conexión a Directus ni PostgreSQL.

La preparación atómica del artefacto es otra acción independiente. Sin `--stage`
solo valida el `publication_run`, el candidato y ambos hashes:

```sh
node scripts/stage-directus-quotes-publication.mjs \
  --run=<uuid-validado>
```

La escritura real exige `--stage`, repetir el UUID, confirmar los hashes y escribir
`--confirm-action=STAGE_QUOTES`. Si hay diferencias también exige
`--allow-content-changes`. Antes de sustituir el JSON crea una copia con permisos
privados en `/var/lib/paramo-directus/publication-backups` y usa `rename` atómico;
si falla la comprobación posterior, restaura automáticamente la versión previa.
Este paso solo prepara el repositorio y deja un `publication_run` de producción
validado: todavía no ejecuta `deploy-local.sh` ni marca la publicación como
desplegada.

La reversión también dispone de simulación y confirmaciones separadas:

```sh
node scripts/restore-directus-quotes-backup.mjs --backup=<ruta>
```

Después de preparar o restaurar un artefacto hay que revisar y versionar el diff
antes de considerar el despliegue web.

Tras versionar y ejecutar manualmente `deploy-local.sh --publish`, la ejecución de
producción todavía permanece `validated`. El finalizador comprueba que el mismo
hash está en Git, en `/var/www/paramo-literario/public/data/quotes.json` y en la
respuesta HTTPS real:

```sh
node scripts/finalize-directus-quotes-deployment.mjs \
  --run=<uuid-producción>
```

Solo con `--finalize`, el UUID repetido, el hash desplegado y
`--confirm-action=FINALIZE_QUOTES` actualiza el estado a `published`. No ejecuta
el despliegue, no modifica archivos y no toca Nginx. Si cualquier copia difiere,
la ejecución queda `validated` para permitir investigar o restaurar sin registrar
un falso éxito.

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

La copia local automática usa el formato personalizado de PostgreSQL, genera un
manifiesto con hashes y recuentos y conserva las 14 ejecuciones automáticas más
recientes. La retención solo reconoce nombres `daily-paramo-editorial-*.dump` y
no elimina las copias manuales históricas:

```sh
ops/directus/backup-database.sh --dry-run
ops/directus/backup-database.sh --apply
```

Cada semana, la última copia se restaura dentro de un PostgreSQL efímero con
`--network none` y almacenamiento `tmpfs`. Los recuentos restaurados deben
coincidir exactamente con el manifiesto:

```sh
ops/directus/test-database-restore.sh --latest
```

Los temporizadores versionados están en `ops/directus/systemd/`: copia diaria a
las 03:35 UTC y restauración semanal los domingos a las 04:30 UTC, ambas con un
retraso aleatorio pequeño. Esta política cubre fallos locales y restaurabilidad;
todavía hace falta una copia cifrada fuera del VPS para cubrir la pérdida total
del servidor.

## Publicación

El panel no publicará directamente. Un exportador externo leerá PostgreSQL,
generará artefactos temporales, ejecutará validaciones y registrará el resultado en
`publication_runs`. Solo una acción posterior y explícita podrá sustituir los JSON
públicos.

La web pública nunca consultará Directus en cada visita.
