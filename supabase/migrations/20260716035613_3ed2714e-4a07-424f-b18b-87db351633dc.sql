
-- 1. Extend weekly_serials
ALTER TABLE public.weekly_serials
  ADD COLUMN IF NOT EXISTS week_year text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fun_facts jsonb,
  ADD COLUMN IF NOT EXISTS moral_lesson text,
  ADD COLUMN IF NOT EXISTS cover_prompt text,
  ADD COLUMN IF NOT EXISTS show_notes text,
  ADD COLUMN IF NOT EXISTS run_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS weekly_serials_week_year_key
  ON public.weekly_serials (week_year)
  WHERE week_year IS NOT NULL;

-- Update the public-read policy to require published status
DROP POLICY IF EXISTS "Public can read free published episodes" ON public.weekly_serials;
CREATE POLICY "Public can read free published episodes"
  ON public.weekly_serials FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND is_premium = false AND status IN ('published','archived'));

-- 2. lore_bible
CREATE TABLE IF NOT EXISTS public.lore_bible (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('character','place','artifact','theme')),
  name text NOT NULL,
  summary text NOT NULL,
  first_seen_episode integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, name)
);

GRANT SELECT ON public.lore_bible TO authenticated;
GRANT ALL ON public.lore_bible TO service_role;

ALTER TABLE public.lore_bible ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read lore"
  ON public.lore_bible FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER lore_bible_updated
  BEFORE UPDATE ON public.lore_bible
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. automation_logs
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  step text NOT NULL,
  level text NOT NULL CHECK (level IN ('info','warn','error')),
  message text NOT NULL,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS automation_logs_run_idx
  ON public.automation_logs (run_id, created_at);

GRANT ALL ON public.automation_logs TO service_role;

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role bypasses RLS; anon/authenticated get nothing.

-- 4. episode_polls
CREATE TABLE IF NOT EXISTS public.episode_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.weekly_serials(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS episode_polls_episode_idx
  ON public.episode_polls (episode_id);

GRANT SELECT ON public.episode_polls TO anon, authenticated;
GRANT ALL ON public.episode_polls TO service_role;

ALTER TABLE public.episode_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read polls for published episodes"
  ON public.episode_polls FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.weekly_serials ws
    WHERE ws.id = episode_polls.episode_id
      AND ws.is_published = true
      AND ws.status IN ('published','archived')
  ));
