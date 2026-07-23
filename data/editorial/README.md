# Datos editoriales

Esta carpeta mantiene separadas tres capas de trabajo:

- `quotes.intermediate.json` contiene la extracción automática.
- `authors.draft.json`, `works.draft.json` y `quotes.normalized.draft.json` son borradores generados por la normalización automática.
- `migration-report.json`, `normalization-report.json` y `editorial-review.md` son informes generados para revisar esos procesos.
- `editorial-decisions.json` es el registro manual de decisiones humanas. Su estructura está documentada en `editorial-decisions.schema.json`.

## Qué no se edita a mano

No se deben corregir directamente los archivos de extracción, los borradores normalizados ni los informes generados. Una nueva ejecución de los scripts podría sobrescribir esos cambios y, además, se perdería la diferencia entre lo inferido automáticamente y lo decidido por una persona.

## Cómo registrar una decisión

Añade un objeto a `decisions` en `editorial-decisions.json` con todos los campos definidos por el esquema. Usa el `legacy_index` de la cita afectada; para una decisión que no corresponda a una cita concreta, usa `null`. Documenta el valor anterior, el nuevo valor, la razón, la persona revisora, la fecha ISO 8601 y el estado editorial.

Los elementos de `_examples` son únicamente ejemplos y no representan decisiones activas. Para comprobar el registro sin modificar ningún borrador, ejecuta:

```sh
node scripts/validate-editorial-decisions.mjs
```

Las decisiones se mantienen aparte para conservar trazabilidad, permitir revisión y aceptación, y evitar que una corrección humana quede mezclada con resultados reproducibles de extracción o normalización. La validación no aplica las decisiones a ningún JSON generado.

## Fichas literarias manuales

`author-profiles.manual.json` y `work-profiles.manual.json` contienen información literaria revisable añadida manualmente, separada de los borradores automáticos. Sus campos y estados se documentan en `profiles.schema.json`.

Durante la fase piloto estas colecciones pueden estar incompletas: no es necesario que cada autor u obra tenga ya una ficha. Se rellenarán progresivamente y la falta de fichas se informa como advertencia no bloqueante. Para validar las fichas existentes, sus identificadores y la cobertura actual, ejecuta:

```sh
node scripts/validate-editorial-profiles.mjs
```

## Validación global del catálogo

Para revisar en un único paso la extracción, la normalización, las decisiones manuales y las fuentes y derechos, ejecuta:

```sh
npm run validate:editorial
```

El comando genera `catalog-validation-report.json`. Un **error bloqueante** indica una incoherencia estructural o una pérdida de integridad —por ejemplo, una referencia inexistente, un texto vacío o una alteración del texto extraído— y hace que el comando termine con error. Una **advertencia editorial** identifica información válida para trabajar pero todavía pendiente de revisión humana, como derechos sin comprobar o posibles textos duplicados; por sí sola no invalida el catálogo.

Los archivos de `data/editorial/` son artefactos internos de extracción, revisión y control. No forman parte de los datos que se publican en la web y no deben exponerse mediante el proceso de publicación.

## Vista previa del futuro catálogo público

`public-catalog.preview.json` es una transformación interna y reproducible de los borradores editoriales, con una estructura cercana a la que podrá consumir la web en el futuro. Se genera con:

```sh
node scripts/build-public-catalog-preview.mjs
```

Su estructura se documenta en `public-catalog.schema.json` y las incidencias de cada generación quedan en `public-catalog-report.json`. El generador excluye notas editoriales y campos privados, y marca explícitamente el resultado como `internal_preview`.

Esta vista previa **no está publicada**, no debe conectarse todavía al frontend ni consumirse en producción. Las fuentes y los derechos siguen pendientes de verificación. Cuando termine la revisión editorial y jurídica, esta estructura servirá como base del futuro JSON público versionado.
