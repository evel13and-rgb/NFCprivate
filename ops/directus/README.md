# Piloto editorial Directus/PostgreSQL

Esta carpeta define el piloto reproducible que se inicializó el 20 de agosto de
2026. Docker está instalado y los contenedores de Directus/PostgreSQL están
activos, saludables y limitados a la red prevista.

El piloto contiene únicamente las tablas internas de Directus. El administrador
inicial `paramorliterario@gmail.com` está creado y verificado. Todavía no se ha
creado el modelo editorial ni se han importado datos.

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
