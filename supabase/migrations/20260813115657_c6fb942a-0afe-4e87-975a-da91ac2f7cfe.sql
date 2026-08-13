REVOKE EXECUTE ON FUNCTION public.insert_lead_rate_limited(text, text, text, text, text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_lead_rate_limited(text, text, text, text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_referral_counts() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_referral_counts() TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_episode_play_counts() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_episode_play_counts() TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_share_counts() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_share_counts() TO service_role;

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny public read of automation logs" ON public.automation_logs;
CREATE POLICY "Deny public read of automation logs"
ON public.automation_logs
FOR SELECT
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "Deny public write of automation logs" ON public.automation_logs;
CREATE POLICY "Deny public write of automation logs"
ON public.automation_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

REVOKE ALL ON TABLE public.automation_logs FROM anon, authenticated;
GRANT ALL ON TABLE public.automation_logs TO service_role;