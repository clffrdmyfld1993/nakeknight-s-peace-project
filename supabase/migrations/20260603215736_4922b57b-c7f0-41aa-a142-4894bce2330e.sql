CREATE POLICY "Public can read chronicles files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'chronicles');
