# Originales de fragmentos

El campo `original` permite mostrar, de forma opcional, el pasaje en la lengua en que fue publicado. La carga editorial se hace en `data/editorial/originals.manual.json`; nunca se edita directamente `public/data/quotes.json`.

Cada entrada manual tiene esta forma:

```json
{
  "quote_id": "quote-123",
  "original_text": "Texto original cotejado…",
  "original_lang": "en",
  "label": "Original inglés",
  "status": "reviewed"
}
```

`label` es opcional para los idiomas conocidos por el generador. Los demás campos son obligatorios. Solo se publican entradas con `status: "reviewed"`.

Antes de añadir un pasaje:

1. Confirmar que `quote_id` existe en `public/data/quotes.json`.
2. Cotejar el original con una edición fiable ya documentada editorialmente.
3. Comprobar que el pasaje se alinea exactamente con la traducción española: mismo fragmento, sin ampliar ni recortar su sentido.
4. Preservar párrafos y saltos de línea del original.
5. Ejecutar `node scripts/build-public-quotes.mjs` y `npm test`.

No se deben inventar, reconstruir, aproximar ni traducir de vuelta originales. Una referencia bibliográfica a una obra no basta para añadir un pasaje: el texto concreto debe estar cotejado. La incorporación se hará por obra o por tandas pequeñas con revisión, no mediante una carga masiva sin control editorial.

El generador comprueba IDs inexistentes, duplicados, textos o idiomas vacíos y estados no revisados. El JSON público recibe exclusivamente `text`, `lang` y `label`; no expone estado ni nombres internos de campos editoriales.
