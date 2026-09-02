# Frases en JSON público

`public/data/quotes.json` es la fuente runtime de frases que carga la web. Contiene el
contrato compatible con el frontend (`t`, `a`, `obra`, `highlight`, `lang` y `type`),
además de `id`, `legacy_index`, `authorId` y `workId`.

La fuente editorial principal es Directus/PostgreSQL. `data/editorial/` conserva
la línea base histórica de la migración y no se sirve. Para generar un candidato
publicable bajo `/tmp`:

```sh
node scripts/prepare-directus-quotes-publication.mjs
```

El exportador selecciona registros aprobados, visibles y verificados; valida
fuentes, derechos, relaciones, hashes, IDs e índices heredados. El frontend valida
el recuento declarado por el propio artefacto, sin fijarlo a 640, para admitir
altas o bajas editoriales deliberadas.

`script.js` contiene solo la lógica de la aplicación; ya no incluye el catálogo
completo. Si el JSON no se puede descargar o validar, `publicQuotes.js` ofrece tres
frases de emergencia con el mismo contrato. Ese fallback no es una segunda fuente
editorial y solo evita que la portada quede vacía.

Para añadir frases se usa el flujo de revisión de Directus, conservando IDs e
índices estables. Después se registra el candidato, se prepara de forma atómica,
se revisa y versiona el diff, se despliega y se finaliza el `publication_run`. No
deben añadirse colecciones literarias a `script.js`, al fallback de emergencia ni
a los JSON históricos.

La equivalencia puede comprobarse sin modificar el runtime público:

```sh
node scripts/export-directus-quotes-preview.mjs
```

El resultado se guarda por defecto en
`/tmp/paramo-directus-quotes-preview.json`. El exportador rechaza cualquier
destino fuera de `/tmp` y termina con error si el documento generado desde
Directus no coincide byte por byte con `public/data/quotes.json`.

La verificación de texto y fuentes no equivale por sí sola a autorización de
publicación. Para el catálogo ya publicado, el cambio de estado se prepara y se
aplica de forma separada con `approve-directus-current-catalog.mjs`. La operación
solo puede aprobar la instantánea que siga coincidiendo exactamente con el JSON
vigente y exige confirmar su SHA-256; nunca sustituye el archivo público.

El paso siguiente genera en `/tmp` un candidato compuesto exclusivamente por
registros publicables:

```sh
node scripts/prepare-directus-quotes-publication.mjs
```

Con `--record` se conserva en `publication_runs` el commit, los recuentos, los
hashes y el resultado de la validación. Incluso una ejecución validada continúa
siendo una vista previa: la sustitución del JSON y el despliegue son acciones
posteriores, separadas y explícitas.

Los comportamientos ante altas, modificaciones, exclusiones y bajas se ensayan
sin cambiar datos reales mediante `simulate-directus-publication-changes.mjs`.
Una alta en borrador debe quedar fuera sin alterar el candidato; cualquier cambio
ya aprobado debe aparecer en la comparación y quedar bloqueado hasta recibir
`--allow-content-changes` en una ejecución deliberada de vista previa.

Un candidato validado se prepara mediante
`stage-directus-quotes-publication.mjs`. El proceso usa el hash vigente como
bloqueo optimista, exige cuatro confirmaciones independientes, crea una copia
privada y sustituye el artefacto con una operación atómica. Preparar el archivo no
equivale a desplegarlo: el diff debe revisarse, probarse y versionarse antes de que
`deploy-local.sh` copie el repositorio a la raíz servida por Nginx.

Después del despliegue,
`finalize-directus-quotes-deployment.mjs` compara el artefacto versionado, la copia
en `/var/www` y la respuesta HTTPS. `publication_runs.status` solo pasa a
`published` cuando los tres hashes coinciden y se proporcionan las confirmaciones
explícitas. Un fallo de red o una discrepancia no altera archivos ni convierte una
preparación en publicación exitosa.
