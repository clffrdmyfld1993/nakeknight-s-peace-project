
-- Rate-limited public lead insert. Rejects >5 inserts per email in a rolling 1 hour window.
CREATE OR REPLACE FUNCTION public.insert_lead_rate_limited(
  _email text,
  _source text,
  _magnet text DEFAULT NULL,
  _referral_code text DEFAULT NULL,
  _user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  recent_count int;
BEGIN
  IF _email IS NULL OR _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_email) > 254 THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  SELECT count(*) INTO recent_count
  FROM public.leads
  WHERE lower(email) = lower(_email)
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded, try again later';
  END IF;

  INSERT INTO public.leads(email, source, magnet, referral_code, user_agent)
  VALUES (
    lower(_email),
    COALESCE(nullif(left(_source, 120), ''), 'homepage'),
    nullif(left(_magnet, 200), ''),
    nullif(left(_referral_code, 120), ''),
    nullif(left(_user_agent, 500), '')
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_lead_rate_limited(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_lead_rate_limited(text, text, text, text, text) TO anon, authenticated;

-- Aggregated referral leaderboard (no PII exposed).
CREATE OR REPLACE FUNCTION public.get_referral_counts()
RETURNS TABLE(referral_code text, referrals bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT referral_code, count(*)::bigint AS referrals
  FROM public.leads
  WHERE referral_code IS NOT NULL
    AND length(referral_code) > 0
  GROUP BY referral_code
  ORDER BY count(*) DESC
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.get_referral_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_referral_counts() TO anon, authenticated;
