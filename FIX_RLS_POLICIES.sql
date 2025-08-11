-- Fix RLS Policies for ChargeSource Storage Testing
-- Run this in your Supabase SQL Editor to allow testing

-- Temporarily disable RLS on storage.objects to allow testing
-- WARNING: This is for testing only - don't use in production
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create more permissive policies for testing
-- Uncomment the section below if you prefer to keep RLS enabled with looser policies

-- DROP POLICY IF EXISTS "Allow all authenticated access to charge-source buckets" ON storage.objects;
-- CREATE POLICY "Allow all authenticated access to charge-source buckets" ON storage.objects
-- FOR ALL USING (
--   bucket_id IN ('charge-source-user-files', 'charge-source-documents', 'charge-source-videos')
-- );

-- Also ensure the document_metadata table has permissive policies for testing
DROP POLICY IF EXISTS "Allow all for testing" ON document_metadata;
CREATE POLICY "Allow all for testing" ON document_metadata
FOR ALL USING (true)
WITH CHECK (true);

-- Test the bucket access
-- This should now work without authentication errors
SELECT 'RLS policies updated for testing' as status;
