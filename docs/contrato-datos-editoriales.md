# Contrato de datos editoriales

Este documento separa tres niveles:

- **Interno canónico:** colecciones privadas de Directus/PostgreSQL; no se sirven
  directamente.
- **Privado editorial:** auditoría, derechos o notas de trabajo; nunca se exporta.
- **Público:** contrato generado que puede consumir el frontend.

## Citas

| Campo interno | Clasificación | Salida pública |
| --- | --- | --- |
| `legacy_index` | Canónico estable | `legacy_index` e `id: quote-N` |
| `text` | Canónico | `t` |
| `legacy_attribution` | Interno | `a`, salvo corrección aceptada de hablante |
| `legacy_work` | Interno | `obra` |
| `highlight` | Canónico revisable | `highlight` |
| `language` | Canónico | `lang` |
| `type` | Canónico | `type` |
| `author_id` | Canónico normalizado | `authorId` |
| `work_id` | Canónico normalizado | `workId` |
| `speaker_name` | Interno editorial | Puede resolver `a`; no se expone como campo propio |
| `attribution_type` | Interno editorial | No se expone actualmente |
| `source_collection` | Interno técnico | No se expone |
| `has_line_breaks` | Interno derivado | No se expone; los saltos permanecen en `t` |
| `text_hash` | Interno de integridad | No se expone |

## Originales

La colección `quote_originals` es interna. Solo se exportan:

| Interno | Público |
| --- | --- |
| `original_text` | `original.text` |
| `original_lang` | `original.lang` |
| `label` | `original.label` |

`status` y `source_note` son privados. Solo un original con `status: reviewed`
puede publicarse.

## Autores y obras

Las colecciones `authors` y `works` son internas. Los IDs son públicos y
permanentes; `legacy_work`, los estados editoriales, las notas y los detalles de
auditoría no se exportan. Los archivos homónimos bajo `data/editorial/` son la
línea base histórica congelada.

Las fichas aprobadas y visibles se exportan desde Directus a
`public/data/literary-profiles.json`. Se publican únicamente los campos
biográficos, bibliográficos, temáticos y de retrato enumerados por
`export-directus-profiles-preview.mjs`. Son privados:

- `profile_status` y `verification_status`.
- `source_notes`, `rights_notes`, `updated_at` y `editorial_notes`.
- Cualquier `notes` de trabajo.

Las referencias bibliográficas preparadas expresamente como `sources` se convierten
en `information_sources`; no debe colocarse en ellas una nota privada.

## Fuentes, derechos y decisiones

Las colecciones `sources` y `editorial_decisions` son privadas en su totalidad.
No se publican ediciones de trabajo, estados jurídicos, notas de derechos,
personas revisoras, fechas de revisión ni razones internas.

Las decisiones aceptadas pueden modificar el artefacto público durante su
generación, pero el registro de la decisión no se incorpora al artefacto.

## Artefactos públicos

Los únicos documentos editoriales destinados al frontend son:

- `public/data/quotes.json`.
- `public/data/literary-profiles.json`.

`data/editorial/public-catalog.preview.json` sigue siendo una vista previa interna,
aunque su forma se parezca a un contrato público futuro.

Ningún archivo bajo `data/editorial/` debe ser servido por Nginx ni copiado durante
el despliegue.
