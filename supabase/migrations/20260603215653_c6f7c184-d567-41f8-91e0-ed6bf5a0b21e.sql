CREATE TABLE public.weekly_serials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  episode_number integer NOT NULL UNIQUE,
  description text,
  transcript_text text,
  audio_url text,
  cover_url text,
  duration_seconds integer,
  release_date timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX weekly_serials_release_idx ON public.weekly_serials (release_date DESC);
CREATE INDEX weekly_serials_episode_idx ON public.weekly_serials (episode_number);

GRANT SELECT ON public.weekly_serials TO anon, authenticated;
GRANT ALL ON public.weekly_serials TO service_role;

ALTER TABLE public.weekly_serials ENABLE ROW LEVEL SECURITY;

-- Public can only see episodes that are published AND already released
CREATE POLICY "Public can read released episodes"
  ON public.weekly_serials
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND release_date <= now());

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_weekly_serials_updated_at
  BEFORE UPDATE ON public.weekly_serials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
