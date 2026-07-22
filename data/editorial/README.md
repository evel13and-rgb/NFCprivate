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

## Validación global del catálogo

Para revisar en un único paso la extracción, la normalización, las decisiones manuales y las fuentes y derechos, ejecuta:

```sh
npm run validate:editorial
```

El comando genera `catalog-validation-report.json`. Un **error bloqueante** indica una incoherencia estructural o una pérdida de integridad —por ejemplo, una referencia inexistente, un texto vacío o una alteración del texto extraído— y hace que el comando termine con error. Una **advertencia editorial** identifica información válida para trabajar pero todavía pendiente de revisión humana, como derechos sin comprobar o posibles textos duplicados; por sí sola no invalida el catálogo.

Los archivos de `data/editorial/` son artefactos internos de extracción, revisión y control. No forman parte de los datos que se publican en la web y no deben exponerse mediante el proceso de publicación.
