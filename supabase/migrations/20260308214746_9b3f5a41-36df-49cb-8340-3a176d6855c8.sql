
CREATE TABLE public.plot_recommendations_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imdb_id text NOT NULL,
  title text NOT NULL,
  recommendations jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(imdb_id)
);

ALTER TABLE public.plot_recommendations_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plot cache"
  ON public.plot_recommendations_cache
  FOR SELECT
  USING (true);
