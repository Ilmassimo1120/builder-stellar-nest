-- ChargeSource Storage Buckets Fix
-- Run this script in your Supabase SQL Editor

-- 1. First, ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Create the required storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('charge-source-user-files', 'charge-source-user-files', false, 52428800, '{"image/*","application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/*"}'),
  ('charge-source-documents', 'charge-source-documents', false, 52428800, '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/*","text/*"}'),
  ('charge-source-videos', 'charge-source-videos', false, 524288000, '{"video/*","audio/*"}')
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DO $$ 
BEGIN
  -- charge-source-user-files policies
  DROP POLICY IF EXISTS "Users can view their own user files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own user files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own user files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own user files" ON storage.objects;
  
  -- charge-source-documents policies
  DROP POLICY IF EXISTS "Users can view their own documents storage" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own documents storage" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own documents storage" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own documents storage" ON storage.objects;
  
  -- charge-source-videos policies
  DROP POLICY IF EXISTS "Users can view their own videos storage" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own videos storage" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own videos storage" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own videos storage" ON storage.objects;
END $$;

-- 4. Create RLS policies for charge-source-user-files bucket
CREATE POLICY "Users can view their own user files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'charge-source-user-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own user files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'charge-source-user-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own user files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'charge-source-user-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own user files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'charge-source-user-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Create RLS policies for charge-source-documents bucket
CREATE POLICY "Users can view their own documents storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'charge-source-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own documents storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'charge-source-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own documents storage" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'charge-source-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'charge-source-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. Create RLS policies for charge-source-videos bucket
CREATE POLICY "Users can view their own videos storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'charge-source-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own videos storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'charge-source-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own videos storage" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'charge-source-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own videos storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'charge-source-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. Verify the setup (these are just informational queries)
-- You can run these separately to verify everything worked

-- Check buckets were created:
-- SELECT id, name, public, file_size_limit FROM storage.buckets ORDER BY created_at;

-- Check RLS policies were created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'objects' AND schemaname = 'storage'
-- ORDER BY policyname;

-- Check RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'objects' AND schemaname = 'storage';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ ChargeSource storage buckets and RLS policies have been set up successfully!';
  RAISE NOTICE '📁 Created buckets: charge-source-user-files, charge-source-documents, charge-source-videos';
  RAISE NOTICE '🔒 Applied Row Level Security policies for user isolation';
  RAISE NOTICE '🎯 Your app should now be able to access storage buckets!';
END $$;
