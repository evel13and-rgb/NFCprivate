# Datos editoriales

Esta carpeta mantiene separadas tres capas de trabajo:

- `quotes.intermediate.json` contiene la extracción automática.
- `authors.draft.json`, `works.draft.json` y `quotes.normalized.draft.json` son borradores generados por la normalización automática.
- `migration-report.json`, `normalization-report.json` y `editorial-review.md` son informes generados para revisar esos procesos.
- `editorial-decisions.json` es el registro manual de decisiones humanas. Su estructura está documentada en `editorial-decisions.schema.json`.

Desde la activación de la fase 4, esta carpeta conserva la línea base histórica de
la migración y sus controles reproducibles, pero ya no es la fuente editable del
catálogo. Directus/PostgreSQL es la fuente editorial principal para autores,
obras, frases, originales, hablantes, temas y fuentes. Los dos JSON bajo
`public/data/` siguen siendo artefactos estáticos versionados.

Los generadores históricos se niegan a sobrescribir esos artefactos. Solo pueden
producir una copia de diagnóstico bajo `/tmp` mediante `--legacy-preview`, por
ejemplo:

```sh
node scripts/build-public-quotes.mjs --legacy-preview
node scripts/build-public-literary-profiles.mjs --legacy-preview
```

`scripts/extract-editorial-quotes.mjs` se conserva únicamente como herramienta legacy
de la migración original desde `script.js`; no debe usarse para regenerar la fuente
editorial actual.

## Identificadores estables

`stable-identifiers.json` fija los IDs de autores y obras. Una corrección futura de
nombre, ortografía o título no debe cambiar un ID ya publicado. Antes de normalizar
una entidad nueva hay que asignarle deliberadamente un ID en ese registro; el
normalizador falla si intenta crear autores u obras sin registrar. Los slugs de los
borradores se derivan del ID estable, no del nombre visible actual.

Para comprobar que el registro y los borradores siguen alineados:

```sh
node scripts/validate-editorial-identifiers.mjs
```

## Qué no se edita a mano

No se deben corregir directamente los archivos de extracción, los borradores normalizados ni los informes generados. Una nueva ejecución de los scripts podría sobrescribir esos cambios y, además, se perdería la diferencia entre lo inferido automáticamente y lo decidido por una persona.

## Cómo registrar una decisión

Las decisiones nuevas se registran en la colección privada
`editorial_decisions` de Directus. Deben conservar el registro afectado, el valor
anterior, el nuevo valor, la razón, la persona revisora, la fecha y el estado
editorial. `editorial-decisions.json` queda congelado como antecedente de la
migración.

Los elementos de `_examples` son únicamente ejemplos y no representan decisiones activas. Para comprobar el registro sin modificar ningún borrador, ejecuta:

```sh
node scripts/validate-editorial-decisions.mjs
```

Las decisiones se mantienen aparte para conservar trazabilidad, permitir revisión y aceptación, y evitar que una corrección humana quede mezclada con resultados reproducibles de extracción o normalización. La validación no aplica las decisiones a ningún JSON generado.

## Fichas literarias manuales

`author-profiles.manual.json` y `work-profiles.manual.json` conservan la línea base
que se importó en Directus. Ya no deben editarse. Las fichas nuevas y sus cambios
se trabajan en las colecciones `authors`, `works` y `themes` del panel privado.

Durante la fase piloto estas colecciones pueden estar incompletas: no es necesario que cada autor u obra tenga ya una ficha. Se rellenarán progresivamente y la falta de fichas se informa como advertencia no bloqueante. Para validar las fichas existentes, sus identificadores y la cobertura actual, ejecuta:

```sh
node scripts/validate-editorial-profiles.mjs
```

Durante esta fase, `draft`, `reviewed` y `ready` son estados publicables; `empty` y
`hidden` quedan fuera de `public/data/literary-profiles.json`. Esta regla conserva
las fichas ya visibles mientras se completa su revisión. En el futuro CMS, el estado
del flujo editorial y la visibilidad pública deberán modelarse por separado.

## Validación global del catálogo

Para comprobar que la línea base histórica sigue íntegra, ejecuta:

```sh
npm run validate:editorial
```

El comando genera `catalog-validation-report.json`. No consulta ni modifica
PostgreSQL. Un **error bloqueante** indica que el archivo histórico ha perdido
integridad; no convierte esos archivos de nuevo en fuente editable.

Los archivos de `data/editorial/` son artefactos internos de extracción, revisión y control. No forman parte de los datos que se publican en la web y no deben exponerse mediante el proceso de publicación.

La clasificación campo por campo entre datos canónicos, privados y públicos se
documenta en `docs/contrato-datos-editoriales.md`.

## Vista previa del futuro catálogo público

`public-catalog.preview.json` es una transformación histórica y reproducible de
los antiguos borradores. Se genera únicamente para diagnóstico con:

```sh
node scripts/build-public-catalog-preview.mjs
```

Su estructura se documenta en `public-catalog.schema.json` y las incidencias de cada generación quedan en `public-catalog-report.json`. El generador excluye notas editoriales y campos privados, y marca explícitamente el resultado como `internal_preview`.

Esta vista previa **no está publicada** y no debe conectarse al frontend. La
exportación vigente de fichas desde PostgreSQL se comprueba con
`scripts/export-directus-profiles-preview.mjs` y siempre se escribe bajo `/tmp`.
