-- ChargeSource Storage RLS Policies Migration
-- Execute this in your Supabase SQL Editor

-- Ensure RLS is enabled on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create bucket if not exists (optional step)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chargesource', 'chargesource', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their specific bucket
CREATE OR REPLACE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'chargesource' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Allow users to view their own files
CREATE OR REPLACE POLICY "Allow user file access" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
    bucket_id = 'chargesource' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Allow users to update their own files
CREATE OR REPLACE POLICY "Allow user file updates" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'chargesource' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
)
WITH CHECK (
    bucket_id = 'chargesource' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Allow users to delete their own files
CREATE OR REPLACE POLICY "Allow user file deletions" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'chargesource' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Optional: Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
