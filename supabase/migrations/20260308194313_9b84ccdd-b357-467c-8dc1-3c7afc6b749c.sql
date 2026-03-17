
CREATE TABLE public.streaming_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_title TEXT NOT NULL,
  imdb_id TEXT,
  provider_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.streaming_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert clicks (for analytics even without auth)
CREATE POLICY "Anyone can insert streaming clicks"
  ON public.streaming_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can read their own clicks
CREATE POLICY "Users can read own clicks"
  ON public.streaming_clicks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
