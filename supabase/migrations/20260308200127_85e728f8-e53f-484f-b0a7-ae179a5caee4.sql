
ALTER TABLE public.streaming_clicks ADD COLUMN region TEXT DEFAULT 'US';

-- Allow authenticated users to read ALL clicks (for analytics dashboard)
DROP POLICY IF EXISTS "Users can read own clicks" ON public.streaming_clicks;
CREATE POLICY "Authenticated users can read all clicks"
  ON public.streaming_clicks
  FOR SELECT
  TO authenticated
  USING (true);
