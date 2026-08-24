/*
# Create storage bucket for cleaning schedule photos

## Overview
Creates a public storage bucket for uploading cleaning schedule profile photos (class president, vice presidents).

## Security
- Authenticated users can read all photos
- Only admins can insert, update, or delete photos
- Admin check is done via direct query to public.profiles to avoid cross-schema function issues
*/

INSERT INTO storage.buckets (id, name, public) VALUES ('cleaning-photos', 'cleaning-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "cleaning_photos_select" ON storage.objects;
CREATE POLICY "cleaning_photos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cleaning-photos');

DROP POLICY IF EXISTS "cleaning_photos_insert" ON storage.objects;
CREATE POLICY "cleaning_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cleaning-photos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "cleaning_photos_update" ON storage.objects;
CREATE POLICY "cleaning_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cleaning-photos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (bucket_id = 'cleaning-photos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "cleaning_photos_delete" ON storage.objects;
CREATE POLICY "cleaning_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cleaning-photos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));