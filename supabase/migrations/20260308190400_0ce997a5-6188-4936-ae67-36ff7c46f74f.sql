
CREATE TABLE public.trending_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  fetched_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trending_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trending cache"
  ON public.trending_cache FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable extensions for cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
