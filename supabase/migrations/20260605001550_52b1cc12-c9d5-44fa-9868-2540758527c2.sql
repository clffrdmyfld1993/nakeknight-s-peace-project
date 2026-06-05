
ALTER TABLE public.weekly_serials ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

-- Replace the public-read policy so premium episodes never expose audio_url/transcript directly.
DROP POLICY IF EXISTS "Public can read published episodes" ON public.weekly_serials;
CREATE POLICY "Public can read published episodes"
  ON public.weekly_serials
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);
