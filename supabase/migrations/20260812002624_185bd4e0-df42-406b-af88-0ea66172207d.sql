REVOKE EXECUTE ON FUNCTION public.get_episode_play_counts() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_share_counts() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_episode_play_counts() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_share_counts() TO service_role;