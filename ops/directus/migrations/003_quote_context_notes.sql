BEGIN;

ALTER TABLE quotes
ADD COLUMN context_notes jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE quotes
ADD CONSTRAINT quotes_context_notes_array
CHECK (jsonb_typeof(context_notes) = 'array');

COMMENT ON COLUMN quotes.context_notes IS
'Notas contextuales públicas y estructuradas: [{"term": "…", "explanation": "…"}].';

COMMIT;
