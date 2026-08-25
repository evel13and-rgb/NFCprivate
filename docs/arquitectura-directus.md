# Arquitectura futura de la base editorial con Directus y PostgreSQL

## Estado y alcance

Este documento describe la arquitectura objetivo y el estado del piloto. Desde
el 20 de agosto de 2026 existe un Directus/PostgreSQL local y aislado con 18
colecciones editoriales, 231 campos y 46 relaciones. La importación base ya
incorporó 27 autores, 29 obras, 29 fuentes, 29 autorías y 29 relaciones
obra–fuente. La web actual no ha cambiado su fuente de datos.

La decisión principal es explícita:

> **Directus no será consultado por la web pública en cada visita.**

Directus será un panel editorial privado conectado a PostgreSQL. Un proceso de
publicación validado exportará desde la base de datos los documentos JSON
estáticos que consume la web.

## Objetivos

- Sustituir progresivamente la edición manual de los JSON internos por un panel
  editorial privado y comprensible.
- Conservar los identificadores estables actuales de frases, autores y obras.
- Separar contenido, revisión, verificación, derechos y visibilidad pública.
- Mantener trazabilidad sobre las correcciones y decisiones humanas.
- Permitir que el catálogo crezca sin convertir PostgreSQL o Directus en una
  dependencia en tiempo real de la web pública.
- Preparar el catálogo para originales, nuevas obras, perfiles, fuentes y audio.

## Por qué mantener JSON estático en producción

La web ya consume estos artefactos públicos:

- `public/data/quotes.json`.
- `public/data/literary-profiles.json`.

La arquitectura futura conservará ese contrato, al menos durante la migración.
Servir JSON estático mediante Nginx tiene varias ventajas:

- Las visitas no abren conexiones a PostgreSQL.
- El tráfico público no aumenta el consumo de RAM o CPU de Directus.
- La web continúa funcionando si Directus está detenido por mantenimiento.
- La base editorial y sus notas privadas no quedan expuestas al navegador.
- Una publicación defectuosa puede bloquearse antes de llegar a producción.
- Los artefactos publicados pueden versionarse, comprobarse y restaurarse.

Directus y PostgreSQL serán herramientas de gestión editorial, no componentes
del camino crítico de cada visita.

## Diagrama conceptual

```text
 Editores autorizados
          |
          | HTTPS privado y autenticado
          v
      Directus
          |
          | lectura y escritura editorial
          v
     PostgreSQL
          |
          | exportación deliberada
          v
 Generador + validadores
          |
          +-------------------------------+
          |                               |
          v                               v
 public/data/quotes.json      public/data/literary-profiles.json
          |                               |
          +---------------+---------------+
                          |
                          v
                         Nginx
                          |
                          v
                       Web pública
```

Una edición guardada en Directus no se convierte automáticamente en contenido
público. La publicación será una acción separada, auditable y reversible.

## Principios del modelo

### Identificadores estables

Los IDs existentes, como `quote-123`, `author-mary-shelley` y
`work-frankenstein`, se conservarán como claves públicas permanentes. Un cambio
de título, nombre visible u ortografía no debe cambiar el ID.

### Estado editorial y visibilidad separados

Cada entidad publicable tendrá, como mínimo, dos controles independientes:

- `workflow_status`: `draft`, `in_review`, `approved` o `archived`.
- `visibility`: `hidden`, `public` o `scheduled`.

Un elemento puede estar aprobado pero oculto. También puede estar en revisión y
seguir visible si una versión publicada anterior continúa siendo válida.

### Datos privados y públicos separados

La base contendrá notas, derechos, revisores y fuentes de trabajo que nunca deben
exportarse. El generador usará una lista explícita de campos públicos; no se
publicarán filas o columnas nuevas de manera implícita.

### Sin borrado editorial ordinario

Los roles editoriales archivarán registros en lugar de eliminarlos. Los permisos
de borrado físico se reservarán para administración y operaciones excepcionales.

## Colecciones propuestas

### `authors`

Contendrá la identidad canónica y la ficha pública del autor:

- `id`: ID textual estable.
- `display_name` y `canonical_name`.
- `birth_year`, `death_year`, `country`, `language`, `period` y `movement`.
- `short_biography`.
- `portrait_file`: relación con los archivos administrados por Directus.
- `workflow_status`, `visibility` y `verification_status`.
- Campos de creación, actualización y usuario proporcionados por Directus.

La ficha no se separará inicialmente en una relación uno a uno. Mantenerla en
`authors` simplifica la edición y la exportación.

### `works`

Contendrá la identidad y la ficha literaria de cada obra:

- `id`: ID textual estable.
- `display_title` y `original_title`.
- `publication_year`, `genre`, `short_summary`, `context` y `tone`.
- `workflow_status`, `visibility` y `verification_status`.
- Metadatos de creación y actualización.

### `work_contributors`

Será la relación entre obras y autores o colaboradores. Incluirá:

- `work_id`.
- `author_id`.
- `role`: autor, coautor, traductor, editor, prologuista u otro.
- `sort`: orden de presentación.

Esta relación evita limitar una obra a una sola persona.

### `quotes`

Será el núcleo del catálogo:

- `id`: ID textual estable.
- `legacy_index`: índice anterior, único mientras se mantenga la compatibilidad.
- `text`: texto español de publicación.
- `highlight`.
- `language` y `quote_type`.
- `author_id`, `work_id` y `speaker_id`.
- `speaker_display_name` para atribuciones aún no normalizadas.
- `attribution_type`.
- `source_collection` como dato de procedencia de la migración.
- `text_hash` para comprobar la integridad del texto.
- `workflow_status`, `visibility` y `publish_at`.
- `sort` y metadatos de auditoría.

El hash se indexará para detectar coincidencias, pero no se impondrá como único:
dos fragmentos iguales pueden ser deliberados y requerir revisión editorial.

### `speakers`

Normalizará personajes o voces recurrentes:

- `id`.
- `work_id`.
- `display_name`.
- `description` privada opcional.
- Estado de verificación.

La relación será opcional porque no todas las atribuciones corresponden a un
personaje identificable.

### `quote_originals`

Permitirá asociar uno o varios textos originales a una frase:

- `id`.
- `quote_id`.
- `original_text`.
- `language` y `label`.
- `verification_status`.
- `is_primary`.
- `visibility`.
- `source_note` privada.

Solo se exportarán originales verificados y con visibilidad pública. El generador
mantendrá el contrato actual `original.text`, `original.lang` y `original.label`.

### `themes`

Será un vocabulario normalizado para evitar variantes accidentales. Se conectará
mediante:

- `author_themes`.
- `work_themes`.

### `sources`

Registrará referencias bibliográficas y documentales reutilizables:

- Autor, institución y título.
- Editorial, edición, año y páginas o localización.
- URL, identificadores bibliográficos y fecha de consulta.
- `verification_status`.
- `rights_status`.
- Notas editoriales y jurídicas privadas.

Las relaciones se mantendrán mediante tablas intermedias explícitas:

- `author_sources`.
- `work_sources`.
- `quote_sources`.
- `quote_original_sources`.

Estas tablas conservarán claves foráneas reales y podrán indicar la función de la
fuente: cotejo textual, biografía, contexto, imagen, derechos u otra.

### `editorial_decisions`

Conservará las decisiones humanas significativas:

- `id`.
- `quote_id` opcional.
- `decision_type` y `field_name`.
- `old_value` y `new_value` como `jsonb`.
- `reason`.
- `reviewer`: relación con el usuario de Directus.
- `reviewed_at`.
- `status`: `proposed`, `accepted`, `rejected` o `needs_review`.

El historial técnico de ediciones de Directus complementará esta colección, pero
no sustituirá la justificación de una decisión editorial.

### `voices`

Describirá las voces disponibles sin guardar secretos del proveedor en campos
públicos:

- Nombre editorial y nombre público.
- Proveedor, modelo e identificador técnico privado.
- Idioma y parámetros de generación.
- Estado de disponibilidad.
- Licencia, restricciones y notas privadas.

Las credenciales del proveedor se guardarán como secretos del entorno, nunca en
la colección ni en el repositorio.

### `quote_audio`

Registrará cada archivo de voz generado:

- `quote_id` y `voice_id`.
- Variante: traducción, original o actualización lingüística.
- Idioma.
- Archivo administrado por Directus o referencia a almacenamiento de objetos.
- Hash exacto del texto empleado para generar el audio.
- Duración, formato y tamaño en bytes.
- Estado: `pending`, `generating`, `ready`, `failed` o `stale`.
- Visibilidad y fecha de generación.
- Error técnico privado, si lo hubiera.

Si cambia el texto o su hash, el audio correspondiente pasará a `stale` y no se
publicará hasta ser regenerado o aprobado de nuevo.

PostgreSQL almacenará los metadatos, no los bytes del audio. Los archivos podrán
residir inicialmente en disco y migrarse a almacenamiento de objetos cuando su
volumen lo aconseje.

### `publication_runs`

Registrará cada intento de generar o publicar los artefactos estáticos:

- `id` y fecha.
- Usuario o proceso que lo inició.
- Entorno: `preview` o `production`.
- Estado: iniciado, validado, publicado o fallido.
- Versión del esquema de exportación.
- Número de frases, autores, obras, originales y audios.
- Hash de cada artefacto generado.
- Advertencias y errores.
- Identificador del commit o versión desplegada, cuando corresponda.

Este registro no sustituye las copias de seguridad ni el historial Git. Sirve para
saber qué contenido de la base produjo cada publicación.

## Relaciones principales

- Un autor puede participar en muchas obras y una obra puede tener muchos
  colaboradores mediante `work_contributors`.
- Una obra puede contener muchas frases y muchos hablantes.
- Una frase puede relacionarse con un autor atribuido, una obra y un hablante.
- Una frase puede tener varios originales, fuentes, decisiones y audios.
- Autores y obras pueden compartir temas y fuentes.
- Una voz puede utilizarse para muchos audios.
- Los archivos de retrato y audio se relacionarán con el sistema de archivos de
  Directus, sin almacenarse como binarios en PostgreSQL.

## Flujo de publicación

1. Un editor crea o modifica contenido en Directus.
2. El contenido avanza por borrador, revisión y aprobación.
3. Un proceso de vista previa lee únicamente datos candidatos a publicación.
4. El exportador aplica las decisiones aceptadas y selecciona exclusivamente los
   campos públicos.
5. Se ejecutan validaciones de integridad, relaciones, derechos y contrato JSON.
6. Se generan artefactos temporales y sus hashes.
7. Si hay errores bloqueantes, la publicación se detiene y producción conserva la
   versión anterior.
8. Una acción explícita publica atómicamente los JSON validados.
9. `publication_runs` registra el resultado y los hashes publicados.

Una escritura en Directus nunca debe sobrescribir directamente los JSON de
producción.

## Fuentes y derechos

- Las fuentes podrán reutilizarse entre autores, obras, frases y originales.
- Las notas jurídicas y editoriales serán privadas por defecto.
- La publicación exigirá estados de derechos compatibles con la política que se
  defina para cada tipo de contenido o archivo.
- Una fuente pendiente no debe desaparecer: debe producir una advertencia o un
  bloqueo según el tipo de contenido y el riesgo.
- Retratos, audios y otros archivos tendrán crédito, procedencia, licencia y fecha
  de verificación propios.
- Las referencias destinadas al lector se exportarán mediante campos públicos
  específicos; no se reutilizarán notas internas como texto público.

## Fases de migración recomendadas

### Fase 0: preparación y capacidad

- Medir durante varios días RAM, CPU, disco, swap y procesos actuales del VPS.
- La copia diaria de PostgreSQL, su retención y una restauración semanal aislada
  están automatizadas; queda añadir una copia cifrada fuera del VPS.
- Preparar un entorno de prueba separado de producción.
- Cerrar el modelo, los permisos y el contrato de exportación.

### Fase 1: PostgreSQL y Directus aislados (completada para el piloto)

- Directus y PostgreSQL ya están instalados en el piloto aislado.
- Las colecciones y relaciones ya están creadas y versionadas.
- El espacio editorial privado, sus vistas y los permisos públicos cerrados ya
  están comprobados; los roles separados se crearán cuando exista una segunda
  cuenta humana.
- Los JSON actuales continúan siendo el runtime canónico y la web sigue sin
  consultar Directus.

### Fase 2: importación reproducible (completada para el catálogo actual)

- Autores, obras, fuentes, hablantes, 640 frases y 640 originales están importados
  mediante procesos reproducibles.
- Los IDs, `legacy_index`, textos, hashes y relaciones coinciden con los archivos
  editoriales y con el JSON público vigente.
- Las frases y originales del catálogo actual constan como aprobados, públicos y
  verificados, con revisor y fecha registrados.
- Las copias anteriores y posteriores a la importación y aprobación permiten
  recuperar cada hito.

### Fase 3: exportación paralela (en curso)

- La vista previa generada desde Directus coincide byte por byte con el JSON
  vigente y no contiene campos privados.
- El candidato de publicación selecciona únicamente registros publicables, se
  genera bajo `/tmp` y puede registrar recuentos, hashes y resultado en
  `publication_runs`.
- Altas, borradores, modificaciones de traducción u original, exclusiones y bajas
  ya se prueban en memoria y exigen autorización cuando afectan al candidato.
- La preparación atómica con copia y reversión está implementada y probada, pero
  no se ha aplicado porque el candidato actual es idéntico al JSON vigente.
- La confirmación posterior comprueba Git, la copia desplegada y la respuesta
  HTTPS antes de marcar una ejecución como `published`.
- El circuito está implementado, pero la publicación real permanece separada y
  no se ejecutará hasta que exista un cambio editorial deliberado.

### Fase 4: panel como fuente editorial

- Congelar la edición manual de los JSON canónicos.
- Declarar PostgreSQL como fuente editorial principal.
- Mantener exportación, validación y publicación como procesos separados.
- Conservar durante un periodo una vía documentada de reversión.

### Fase 5: audio y crecimiento

- Activar la cola de generación de audio con concurrencia limitada.
- Medir CPU, RAM, disco y coste por proveedor.
- Incorporar almacenamiento de objetos antes de que el volumen de archivos haga
  difícil respaldar o mover el VPS.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Exposición de notas o derechos privados | Lista cerrada de campos exportables y pruebas automáticas |
| Pérdida o cambio de IDs | Claves textuales estables, restricciones y validación previa a importar |
| Publicación accidental de borradores | Separar flujo editorial, visibilidad y acción de publicación |
| Diferencias entre JSON y base de datos | Exportación determinista, hashes y comparación paralela |
| Error que deja JSON incompleto | Generación temporal y sustitución atómica solo tras validar |
| Dependencia total de Directus | La web pública continúa sirviendo la última exportación estática válida |
| Consumo excesivo de RAM | Límites de procesos, medición y ausencia de consultas públicas en tiempo real |
| Crecimiento del audio | Archivos fuera de PostgreSQL, cuotas y almacenamiento de objetos |
| Pérdida de datos | Copias automáticas de PostgreSQL, archivos y configuración; pruebas de restauración |
| Acceso no autorizado al panel | HTTPS, roles mínimos, autenticación fuerte, actualizaciones y restricción de red |
| Migración irreversible | Importaciones repetibles, conservación de JSON y plan de reversión |
| Cambio de licencia, límites o costes de Directus | Revisar términos antes del piloto y antes del corte; conservar exportadores independientes |

## Requisitos mínimos orientativos del VPS

La capacidad definitiva deberá decidirse con mediciones reales. Como base prudente
para alojar en el mismo VPS la web actual, PostgreSQL y un Directus de uso editorial
reducido:

- 2 vCPU.
- 4 GB de RAM.
- 40 GB de SSD, más el margen necesario para copias y archivos.
- 2 GB de swap como protección, no como sustituto de RAM.
- Copias de seguridad externas al propio VPS.
- Espacio libre sostenido de al menos un 20-25 %.

Con 2 GB de RAM podría construirse una prueba muy limitada, pero no se considera
una base cómoda para producción compartida. Directus y PostgreSQL añaden consumo
permanente aunque haya pocos registros; el texto del catálogo crecerá mucho más
despacio que los procesos, las imágenes y los audios.

El audio no debe dimensionarse únicamente con esos 40 GB. Antes de activarlo hay
que estimar cantidad de frases, voces, idiomas, formato y tasa de bits. Si se prevé
un crecimiento grande, el almacenamiento de objetos debe formar parte del diseño
desde esa fase.

### Línea base medida el 20 de agosto de 2026

- 4 vCPU y carga prácticamente nula.
- 3,8 GiB de RAM total y 2,9 GiB disponibles.
- 4 GiB de swap, con uso residual inferior a 100 MiB después de la limpieza.
- 116 GB de disco, 26 GB usados y 90 GB disponibles: 23 % de ocupación.
- PM2 inactivo y deshabilitado; no administraba ninguna aplicación.
- Eliminados tres servidores HTTP temporales que escuchaban solo en localhost.
- El backend meteorológico continúa en `127.0.0.1:3030` bajo systemd.

La línea base permite realizar un piloto limitado en el VPS actual. No garantiza
por sí sola que Directus deba convertirse allí en servicio definitivo: durante el
piloto deben medirse RAM máxima, swap, reinicios y latencia.

### Primera medición del piloto

Con los contenedores recién inicializados y sin contenido editorial:

- Directus: aproximadamente 197 MiB de RAM.
- PostgreSQL: aproximadamente 63 MiB de RAM.
- RAM disponible del VPS: 2,6 GiB.
- Swap usada: aproximadamente 106 MiB, sin evidencia de crecimiento continuo.
- Disco: 25 % después de instalar Docker y descargar las imágenes.
- Directus y PostgreSQL: saludables.
- Directus: accesible solo mediante `127.0.0.1:8055`.
- PostgreSQL: sin puerto publicado en el host.
- Base inicial: 33 tablas internas de Directus, todavía sin colecciones
  editoriales.
- Administrador inicial creado y acceso autenticado verificado.

Esta medición es solo una línea base en reposo. Debe repetirse durante
importaciones, uso del panel, generación de JSON y copias de seguridad.

### Medición después de la primera carga

- Modelo registrado: 18 colecciones, 231 campos y 46 relaciones.
- Datos: 27 autores, 29 obras, 29 fuentes y 58 relaciones base, todas ocultas o
  internas; frases y originales todavía pendientes.
- Directus: aproximadamente 285 MiB de RAM.
- PostgreSQL: aproximadamente 73 MiB de RAM.
- Base completa: 11 MB; tablas editoriales: aproximadamente 920 KiB.
- RAM disponible del VPS: 2,3 GiB.
- Swap usada: aproximadamente 103 MiB.
- Disco: 25 %; aproximadamente 88 GB disponibles.

## Versiones de referencia para el piloto

A fecha de este documento se propone:

- Directus `12.3.0`, mediante su imagen oficial y con versión fijada.
- PostgreSQL `16.14-bookworm`, mediante la imagen oficial.
- Sin Redis en la primera fase.
- Directus limitado inicialmente a 1 GiB de RAM.
- PostgreSQL limitado inicialmente a 640 MiB de RAM.
- Directus escuchando únicamente en `127.0.0.1:8055`.

Usar la imagen oficial de Directus evita modificar el Node 18 que utiliza el VPS:
Directus moderno requiere Node 22 cuando se instala sin contenedor.

Las versiones se revisarán antes de cada instalación o actualización. Nunca se
utilizará la etiqueta `latest`.

## Licencia de Directus

Directus 12 utiliza la licencia MSCL y aplica niveles de uso. El nivel Core puede
utilizarse sin clave, pero tiene límites de asientos y colecciones. La arquitectura
propuesta cabe inicialmente dentro del límite actual de colecciones y el piloto
comenzará con un único usuario.

Antes de ampliar roles, usuarios o declarar el panel como infraestructura
editorial oficial hay que:

- Confirmar qué nivel corresponde al proyecto.
- Verificar los términos vigentes en ese momento.
- Solicitar la clave gratuita correspondiente si el titular cumple los requisitos
  de la Open Innovation Grant.
- Registrar la decisión y la fecha de revisión.

La configuración nunca intentará desactivar o eludir los controles de licencia.

## Decisiones pendientes antes de importar o publicar

- Elegir si Directus y PostgreSQL convivirán con la web o usarán otro VPS.
- Definir roles: administración, edición, revisión, derechos y publicación.
- Establecer la política exacta que convierte una advertencia de derechos en un
  bloqueo.
- Decidir el sistema de copias y practicar una restauración completa.
- Definir dónde se almacenarán retratos y audio.
- Diseñar el mecanismo de publicación atómica y reversión.
- Medir el VPS actual antes de fijar recursos y límites de los servicios.

Hasta completar estas decisiones, el piloto seguirá aislado y los JSON actuales
continuarán siendo la fuente canónica de producción.
