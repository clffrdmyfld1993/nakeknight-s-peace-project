
-- 1) Remove permissive SELECT on private chronicles bucket. Fulfillment uses service role + signed URLs.
DROP POLICY IF EXISTS "Public can read chronicles files" ON storage.objects;

-- 2) Restrict public read on weekly_serials to non-premium published episodes only.
DROP POLICY IF EXISTS "Public can read published episodes" ON public.weekly_serials;
CREATE POLICY "Public can read free published episodes"
ON public.weekly_serials
FOR SELECT
TO anon, authenticated
USING (is_published = true AND is_premium = false);
