
-- 1) Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.insert_lead_rate_limited(text, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.insert_lead_rate_limited(text, text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.insert_lead_rate_limited(text, text, text, text, text) TO anon;

REVOKE EXECUTE ON FUNCTION public.get_referral_counts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_referral_counts() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_referral_counts() TO authenticated;

-- 2) Explicit deny-read policies on leads (fail-closed reinforcement)
DROP POLICY IF EXISTS "Deny anon select on leads" ON public.leads;
CREATE POLICY "Deny anon select on leads"
  ON public.leads FOR SELECT
  TO anon, authenticated
  USING (false);

-- 3) Explicit storage.objects deny policies for private buckets
DROP POLICY IF EXISTS "Deny direct access to chronicles bucket" ON storage.objects;
CREATE POLICY "Deny direct access to chronicles bucket"
  ON storage.objects FOR ALL
  TO anon, authenticated
  USING (bucket_id <> 'chronicles')
  WITH CHECK (bucket_id <> 'chronicles');

DROP POLICY IF EXISTS "Deny direct access to digital-products bucket" ON storage.objects;
CREATE POLICY "Deny direct access to digital-products bucket"
  ON storage.objects FOR ALL
  TO anon, authenticated
  USING (bucket_id <> 'digital-products')
  WITH CHECK (bucket_id <> 'digital-products');
