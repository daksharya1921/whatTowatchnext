
-- Replace the existing permissive SELECT policy with admin-only
DROP POLICY IF EXISTS "Authenticated users can read all clicks" ON public.streaming_clicks;

CREATE POLICY "Only admins can read streaming clicks"
  ON public.streaming_clicks
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
