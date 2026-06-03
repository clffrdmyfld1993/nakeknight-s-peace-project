DROP POLICY IF EXISTS "Public can read released episodes" ON public.weekly_serials;

CREATE POLICY "Public can read published episodes"
  ON public.weekly_serials
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);
