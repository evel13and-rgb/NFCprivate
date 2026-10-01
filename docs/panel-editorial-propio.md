# Panel editorial propio

## Decisión de arquitectura

El panel de Páramo sustituye la interfaz de trabajo de Directus, pero no la base
editorial ni sus permisos. El navegador habla únicamente con un backend privado
de Páramo; ese backend autentica contra Directus y limita las colecciones y los
campos que se pueden consultar o modificar.

```text
Navegador editorial
        |
        | cookie HttpOnly + rutas limitadas
        v
Panel Páramo (127.0.0.1:3040)
        |
        | token temporal, solo en memoria del servidor
        v
Directus (127.0.0.1:8055) -> PostgreSQL
        |
        | circuito validado existente
        v
JSON estáticos -> web pública
```

Directus queda oculto como motor de autenticación, permisos, API y auditoría. No
se conecta el panel directamente a PostgreSQL y no se entregan tokens de Directus
al JavaScript del navegador.

## Alcance del primer MVP

- Inicio y cierre de sesión con las cuentas existentes de Directus.
- Cookie de sesión `HttpOnly`, `SameSite=Strict` y opcionalmente `Secure`.
- Resumen de fragmentos, fichas públicas, fuentes pendientes y publicaciones.
- Búsqueda, filtros, paginación y edición de fragmentos, originales, autores,
  obras y fuentes.
- Cálculo automático de `text_hash` cuando cambia una traducción.
- Una modificación material devuelve el registro a revisión y verificación
  pendiente, salvo aprobación explícita en la misma operación.
- Registro de persona y fecha al aprobar o verificar fragmentos y originales.
- Historial de `publication_runs` en modo de solo lectura.
- Guardar y publicar siguen siendo acciones separadas.

El MVP no crea ni elimina registros. Tampoco ejecuta despliegues desde el
navegador. Esas operaciones se incorporarán únicamente cuando tengan un flujo de
confirmación, copia, validación y reversión equivalente al que ya existe.

## Ejecución local

Directus debe estar escuchando en `127.0.0.1:8055`. Después:

```sh
npm run editorial:start
```

El panel queda disponible en:

```text
http://127.0.0.1:3040/editorial/
```

Variables admitidas:

- `PARAMO_EDITORIAL_HOST`: interfaz de escucha; por defecto `127.0.0.1`.
- `PARAMO_EDITORIAL_PORT`: puerto; por defecto `3040`.
- `DIRECTUS_URL`: debe resolver a `localhost`, `127.0.0.1` o `::1`.
- `PARAMO_EDITORIAL_SECURE_COOKIE=true`: añade `Secure` a la cookie. Debe usarse
  cuando Nginx publique el panel bajo HTTPS.

## Despliegue recomendado

Mantener el servicio en `127.0.0.1:3040` y publicarlo con Nginx bajo una ruta
privada, por ejemplo `/editorial/`. En la primera puesta en producción conviene
conservar además la restricción por VPN, túnel SSH o lista de IP. El panel no
debe compartir caché con la web pública.

Antes de habilitar a una segunda persona se crearán en Directus un rol y una
política editoriales con privilegios mínimos. El panel hereda esos permisos: su
lista de campos permitidos reduce la superficie, pero no sustituye el control de
acceso del motor.

## Siguientes fases

1. Alta guiada de fragmentos, autores, obras y fuentes, con IDs estables.
2. Vista de cotejo en paralelo: traducción, original, fuente y decisión.
3. Bandeja de revisión y comentarios entre personas editoras.
4. Vista previa exacta del JSON candidato y de su diferencia con producción.
5. Publicación con doble confirmación, validadores, copia previa y reversión.
6. Gestión de retratos y audio.
