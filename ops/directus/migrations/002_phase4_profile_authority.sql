BEGIN;

ALTER TABLE authors
  ADD COLUMN public_biography_long text,
  ADD COLUMN public_tone_notes text,
  ADD COLUMN public_why_in_paramo text,
  ADD COLUMN public_information_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN portrait_path text,
  ADD CONSTRAINT authors_public_information_sources_array
    CHECK (jsonb_typeof(public_information_sources) = 'array');

ALTER TABLE works
  ADD COLUMN public_title text,
  ADD COLUMN public_language text,
  ADD COLUMN public_summary_long text,
  ADD COLUMN public_fragment_notes text,
  ADD COLUMN public_why_in_paramo text,
  ADD COLUMN public_information_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD CONSTRAINT works_public_information_sources_array
    CHECK (jsonb_typeof(public_information_sources) = 'array');

COMMENT ON COLUMN authors.public_information_sources IS
  'Referencias ya redactadas para la ficha pública; las fuentes estructuradas permanecen en sources.';
COMMENT ON COLUMN works.public_information_sources IS
  'Referencias ya redactadas para la ficha pública; las fuentes estructuradas permanecen en sources.';
COMMENT ON COLUMN authors.portrait_path IS
  'Ruta pública versionada del retrato mientras el binario no esté administrado por Directus.';

COMMIT;
