# Frases en JSON público

`public/data/quotes.json` es la fuente runtime de frases que carga la web. Contiene el
contrato compatible con el frontend (`t`, `a`, `obra`, `highlight`, `lang` y `type`),
además de `id`, `legacy_index`, `authorId` y `workId`.

La fuente canónica interna está en `data/editorial/`. No se sirve esa carpeta ni se
publica `public-catalog.preview.json`. Para regenerar el runtime público:

```sh
node scripts/build-public-quotes.mjs
```

El generador exige 640 registros en la fuente editorial, cruza la extracción con el
catálogo normalizado, aplica las decisiones aceptadas —incluidas las exclusiones—,
comprueba campos obligatorios e impide IDs o índices heredados duplicados. El
frontend valida el recuento declarado por el propio artefacto, sin fijarlo a 640,
para admitir bajas editoriales deliberadas. Después de
regenerarlo deben ejecutarse `npm test` y las validaciones habituales del despliegue.

`script.js` contiene solo la lógica de la aplicación; ya no incluye el catálogo
completo. Si el JSON no se puede descargar o validar, `publicQuotes.js` ofrece tres
frases de emergencia con el mismo contrato. Ese fallback no es una segunda fuente
editorial y solo evita que la portada quede vacía.

Para añadir frases en el futuro, hay que incorporarlas mediante el flujo de revisión
de `data/editorial/`, conservar IDs e índices estables, validar el catálogo y volver a
generar `public/data/quotes.json`. No deben añadirse colecciones literarias a
`script.js` ni al fallback de emergencia.

Durante la migración a Directus puede generarse una vista previa equivalente sin
modificar el runtime público:

```sh
node scripts/export-directus-quotes-preview.mjs
```

El resultado se guarda por defecto en
`/tmp/paramo-directus-quotes-preview.json`. El exportador rechaza cualquier
destino fuera de `/tmp` y termina con error si el documento generado desde
Directus no coincide byte por byte con `public/data/quotes.json`.
