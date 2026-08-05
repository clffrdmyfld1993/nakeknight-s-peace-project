-- EPISODE PLAYS
CREATE TABLE public.episode_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.weekly_serials(id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer,
  ref text,
  user_agent text
);
GRANT INSERT ON public.episode_plays TO anon, authenticated;
GRANT ALL ON public.episode_plays TO service_role;
ALTER TABLE public.episode_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a play" ON public.episode_plays
  FOR INSERT TO anon, authenticated
  WITH CHECK (duration_seconds IS NULL OR (duration_seconds >= 0 AND duration_seconds <= 86400));
CREATE POLICY "Deny public read of plays" ON public.episode_plays
  FOR SELECT TO anon, authenticated USING (false);
CREATE INDEX idx_episode_plays_episode ON public.episode_plays(episode_id, played_at DESC);

-- EPISODE PROMOS
CREATE TABLE public.episode_promos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.weekly_serials(id) ON DELETE CASCADE,
  x_thread text,
  reddit_post text,
  ig_caption text,
  video_script text,
  run_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.episode_promos TO authenticated;
GRANT ALL ON public.episode_promos TO service_role;
ALTER TABLE public.episode_promos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read promos" ON public.episode_promos
  FOR SELECT TO authenticated USING (true);
CREATE UNIQUE INDEX idx_episode_promos_episode ON public.episode_promos(episode_id);

-- REFERRAL SHARES
CREATE TABLE public.referral_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text,
  network text NOT NULL,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.referral_shares TO anon, authenticated;
GRANT ALL ON public.referral_shares TO service_role;
ALTER TABLE public.referral_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a share" ON public.referral_shares
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(network) <= 40 AND (referral_code IS NULL OR length(referral_code) <= 60));
CREATE POLICY "Deny public read of shares" ON public.referral_shares
  FOR SELECT TO anon, authenticated USING (false);

-- LICENSE INQUIRIES
CREATE TABLE public.license_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  use_case text NOT NULL,
  budget text,
  referral_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.license_inquiries TO anon, authenticated;
GRANT ALL ON public.license_inquiries TO service_role;
ALTER TABLE public.license_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a licensing inquiry" ON public.license_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254
    AND length(name) BETWEEN 1 AND 120
    AND length(use_case) BETWEEN 1 AND 4000
  );
CREATE POLICY "Deny public read of inquiries" ON public.license_inquiries
  FOR SELECT TO anon, authenticated USING (false);

-- SAFE AGGREGATES
CREATE OR REPLACE FUNCTION public.get_episode_play_counts()
RETURNS TABLE(episode_id uuid, plays bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.episode_id, count(*)::bigint
  FROM public.episode_plays p
  JOIN public.weekly_serials w ON w.id = p.episode_id
  WHERE w.is_published = true
  GROUP BY p.episode_id
$$;
REVOKE EXECUTE ON FUNCTION public.get_episode_play_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_episode_play_counts() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_share_counts()
RETURNS TABLE(referral_code text, shares bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.referral_code, count(*)::bigint
  FROM public.referral_shares s
  WHERE s.referral_code IS NOT NULL
  GROUP BY s.referral_code
$$;
REVOKE EXECUTE ON FUNCTION public.get_share_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_share_counts() TO anon, authenticated;