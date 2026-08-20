BEGIN;

CREATE OR REPLACE FUNCTION set_editorial_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.date_updated = now();
  RETURN NEW;
END;
$$;

CREATE TABLE authors (
  id text PRIMARY KEY CHECK (id ~ '^author-[a-z0-9-]+$'),
  canonical_name text NOT NULL,
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_name text NOT NULL,
  birth_year smallint,
  death_year smallint,
  country text,
  language text,
  period text,
  movement text,
  short_biography text,
  portrait_file uuid REFERENCES directus_files(id) ON DELETE SET NULL,
  portrait_alt text,
  portrait_caption text,
  portrait_credit text,
  portrait_source_url text,
  portrait_rights text,
  portrait_object_position varchar(16),
  workflow_status varchar(24) NOT NULL DEFAULT 'draft'
    CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'archived')),
  visibility varchar(16) NOT NULL DEFAULT 'hidden'
    CHECK (visibility IN ('hidden', 'public', 'scheduled')),
  verification_status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected')),
  publish_at timestamptz,
  sort integer,
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now(),
  CHECK (birth_year IS NULL OR birth_year BETWEEN -4000 AND 3000),
  CHECK (death_year IS NULL OR death_year BETWEEN -4000 AND 3000),
  CHECK (birth_year IS NULL OR death_year IS NULL OR death_year >= birth_year)
);

CREATE TABLE works (
  id text PRIMARY KEY CHECK (id ~ '^work-[a-z0-9-]+$'),
  display_title text NOT NULL,
  original_title text,
  slug text NOT NULL UNIQUE,
  primary_author_id text REFERENCES authors(id) ON DELETE SET NULL,
  legacy_work text UNIQUE,
  publication_year smallint,
  genre text,
  short_summary text,
  context text,
  tone text,
  workflow_status varchar(24) NOT NULL DEFAULT 'draft'
    CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'archived')),
  visibility varchar(16) NOT NULL DEFAULT 'hidden'
    CHECK (visibility IN ('hidden', 'public', 'scheduled')),
  verification_status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected')),
  publish_at timestamptz,
  sort integer,
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now(),
  CHECK (publication_year IS NULL OR publication_year BETWEEN -4000 AND 3000)
);

CREATE TABLE work_contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id text NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  role varchar(32) NOT NULL DEFAULT 'author',
  sort integer,
  date_created timestamptz NOT NULL DEFAULT now(),
  UNIQUE (work_id, author_id, role)
);

CREATE TABLE speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id text NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  slug text,
  description text,
  verification_status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected')),
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (work_id, slug)
);

CREATE TABLE quotes (
  id text PRIMARY KEY CHECK (id ~ '^quote-[0-9]+$'),
  legacy_index integer NOT NULL UNIQUE CHECK (legacy_index >= 0),
  text text NOT NULL CHECK (length(text) > 0),
  highlight text,
  language varchar(16) NOT NULL,
  quote_type varchar(32) NOT NULL,
  author_id text REFERENCES authors(id) ON DELETE SET NULL,
  work_id text NOT NULL REFERENCES works(id) ON DELETE RESTRICT,
  speaker_id uuid REFERENCES speakers(id) ON DELETE SET NULL,
  speaker_display_name text,
  attribution_type varchar(32) NOT NULL,
  legacy_attribution text,
  legacy_work text,
  source_collection text,
  has_line_breaks boolean NOT NULL DEFAULT false,
  text_hash char(64) NOT NULL CHECK (text_hash ~ '^[a-f0-9]{64}$'),
  publication_excluded boolean NOT NULL DEFAULT false,
  workflow_status varchar(24) NOT NULL DEFAULT 'draft'
    CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'archived')),
  visibility varchar(16) NOT NULL DEFAULT 'hidden'
    CHECK (visibility IN ('hidden', 'public', 'scheduled')),
  verification_status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected')),
  reviewer_id uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  publish_at timestamptz,
  sort integer,
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quote_originals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_key text UNIQUE,
  quote_id text NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  original_text text NOT NULL CHECK (length(original_text) > 0),
  language varchar(16) NOT NULL,
  label text NOT NULL,
  source_note text,
  is_primary boolean NOT NULL DEFAULT true,
  workflow_status varchar(24) NOT NULL DEFAULT 'draft'
    CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'archived')),
  visibility varchar(16) NOT NULL DEFAULT 'hidden'
    CHECK (visibility IN ('hidden', 'public', 'scheduled')),
  verification_status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected')),
  reviewer_id uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE themes (
  id text PRIMARY KEY CHECK (id ~ '^theme-[a-z0-9-]+$'),
  label text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  verification_status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected')),
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE author_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id text NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  theme_id text NOT NULL REFERENCES themes(id) ON DELETE RESTRICT,
  sort integer,
  UNIQUE (author_id, theme_id)
);

CREATE TABLE work_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id text NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  theme_id text NOT NULL REFERENCES themes(id) ON DELETE RESTRICT,
  sort integer,
  UNIQUE (work_id, theme_id)
);

CREATE TABLE sources (
  id text PRIMARY KEY CHECK (id ~ '^source-[a-z0-9-]+$'),
  source_type varchar(32) NOT NULL,
  citation_label text NOT NULL,
  creator text,
  institution text,
  title text,
  edition text,
  publisher text,
  publication_year smallint,
  pages text,
  translator_name text,
  source_url text,
  bibliographic_identifiers jsonb NOT NULL DEFAULT '{}'::jsonb,
  accessed_at date,
  language varchar(16),
  rights_status varchar(32) NOT NULL DEFAULT 'pending',
  rights_notes text,
  verification_status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected')),
  notes text,
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now(),
  CHECK (publication_year IS NULL OR publication_year BETWEEN -4000 AND 3000)
);

CREATE TABLE author_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id text NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  relation_role varchar(32) NOT NULL DEFAULT 'information',
  notes text,
  sort integer,
  UNIQUE (author_id, source_id, relation_role)
);

CREATE TABLE work_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id text NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  relation_role varchar(32) NOT NULL DEFAULT 'information',
  notes text,
  sort integer,
  UNIQUE (work_id, source_id, relation_role)
);

CREATE TABLE quote_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id text NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  relation_role varchar(32) NOT NULL DEFAULT 'textual_source',
  notes text,
  sort integer,
  UNIQUE (quote_id, source_id, relation_role)
);

CREATE TABLE quote_original_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_original_id uuid NOT NULL REFERENCES quote_originals(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  relation_role varchar(32) NOT NULL DEFAULT 'original_source',
  notes text,
  sort integer,
  UNIQUE (quote_original_id, source_id, relation_role)
);

CREATE TABLE editorial_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id text REFERENCES quotes(id) ON DELETE CASCADE,
  decision_type varchar(32) NOT NULL,
  field_name text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  reason text NOT NULL,
  reviewer_id uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  status varchar(24) NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'accepted', 'rejected', 'needs_review')),
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE voices (
  id text PRIMARY KEY CHECK (id ~ '^voice-[a-z0-9-]+$'),
  display_name text NOT NULL,
  public_name text,
  provider text NOT NULL,
  model text NOT NULL,
  provider_voice_id text NOT NULL,
  language varchar(16) NOT NULL,
  generation_parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  license text,
  rights_notes text,
  workflow_status varchar(24) NOT NULL DEFAULT 'draft'
    CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'archived')),
  visibility varchar(16) NOT NULL DEFAULT 'hidden'
    CHECK (visibility IN ('hidden', 'public', 'scheduled')),
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quote_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id text NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  quote_original_id uuid REFERENCES quote_originals(id) ON DELETE SET NULL,
  voice_id text NOT NULL REFERENCES voices(id) ON DELETE RESTRICT,
  variant varchar(32) NOT NULL
    CHECK (variant IN ('translation', 'original', 'linguistic_update')),
  language varchar(16) NOT NULL,
  file_id uuid REFERENCES directus_files(id) ON DELETE SET NULL,
  source_text_hash char(64) NOT NULL CHECK (source_text_hash ~ '^[a-f0-9]{64}$'),
  duration_ms integer CHECK (duration_ms IS NULL OR duration_ms >= 0),
  format varchar(16),
  size_bytes bigint CHECK (size_bytes IS NULL OR size_bytes >= 0),
  generation_status varchar(16) NOT NULL DEFAULT 'pending'
    CHECK (generation_status IN ('pending', 'generating', 'ready', 'failed', 'stale')),
  visibility varchar(16) NOT NULL DEFAULT 'hidden'
    CHECK (visibility IN ('hidden', 'public', 'scheduled')),
  generated_at timestamptz,
  error_message text,
  user_created uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  user_updated uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE publication_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiated_by uuid REFERENCES directus_users(id) ON DELETE SET NULL,
  environment varchar(16) NOT NULL CHECK (environment IN ('preview', 'production')),
  status varchar(16) NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'validated', 'published', 'failed')),
  schema_version integer NOT NULL CHECK (schema_version > 0),
  entity_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_hashes jsonb NOT NULL DEFAULT '{}'::jsonb,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  git_commit varchar(64),
  notes text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX works_primary_author_idx ON works(primary_author_id);
CREATE INDEX quotes_author_idx ON quotes(author_id);
CREATE INDEX quotes_work_idx ON quotes(work_id);
CREATE INDEX quotes_speaker_idx ON quotes(speaker_id);
CREATE INDEX quotes_text_hash_idx ON quotes(text_hash);
CREATE INDEX quotes_publication_idx ON quotes(visibility, workflow_status, publish_at);
CREATE INDEX quote_originals_quote_idx ON quote_originals(quote_id);
CREATE INDEX sources_verification_idx ON sources(verification_status, rights_status);
CREATE INDEX decisions_quote_status_idx ON editorial_decisions(quote_id, status);
CREATE INDEX quote_audio_quote_idx ON quote_audio(quote_id);
CREATE INDEX quote_audio_status_idx ON quote_audio(generation_status, visibility);
CREATE INDEX publication_runs_status_idx ON publication_runs(environment, status, started_at DESC);

CREATE TRIGGER authors_set_updated_at
BEFORE UPDATE ON authors
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER works_set_updated_at
BEFORE UPDATE ON works
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER speakers_set_updated_at
BEFORE UPDATE ON speakers
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER quotes_set_updated_at
BEFORE UPDATE ON quotes
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER quote_originals_set_updated_at
BEFORE UPDATE ON quote_originals
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER themes_set_updated_at
BEFORE UPDATE ON themes
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER sources_set_updated_at
BEFORE UPDATE ON sources
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER editorial_decisions_set_updated_at
BEFORE UPDATE ON editorial_decisions
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER voices_set_updated_at
BEFORE UPDATE ON voices
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

CREATE TRIGGER quote_audio_set_updated_at
BEFORE UPDATE ON quote_audio
FOR EACH ROW EXECUTE FUNCTION set_editorial_updated_at();

COMMENT ON TABLE authors IS 'Autores y fichas biográficas del catálogo editorial.';
COMMENT ON TABLE works IS 'Obras y fichas literarias del catálogo editorial.';
COMMENT ON TABLE quotes IS 'Fragmentos editoriales; fuente canónica futura del JSON público.';
COMMENT ON TABLE quote_originals IS 'Textos originales o versiones cotejadas de las frases.';
COMMENT ON TABLE sources IS 'Fuentes bibliográficas, verificaciones y derechos privados.';
COMMENT ON TABLE editorial_decisions IS 'Registro trazable de decisiones humanas significativas.';
COMMENT ON TABLE quote_audio IS 'Rendiciones de voz; PostgreSQL conserva metadatos, no el binario.';
COMMENT ON TABLE publication_runs IS 'Auditoría de vistas previas y publicaciones de artefactos estáticos.';

COMMIT;
