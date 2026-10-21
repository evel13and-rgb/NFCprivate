BEGIN;

ALTER TABLE quotes
ADD COLUMN letter_context jsonb;

ALTER TABLE quotes
ADD CONSTRAINT quotes_letter_context_object
CHECK (letter_context IS NULL OR jsonb_typeof(letter_context) = 'object');

COMMENT ON COLUMN quotes.letter_context IS
'Contexto epistolar público: {"recipient": "…", "date": "…", "place": "…", "note": "…"}. Recipient y date son obligatorios; place y note son opcionales.';

COMMIT;
