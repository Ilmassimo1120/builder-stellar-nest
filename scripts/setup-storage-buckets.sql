-- Storage bucket setup for ChargeSource file management
-- This script creates the required storage buckets and sets up policies

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('charge-source-user-files', 'charge-source-user-files', false),
  ('charge-source-documents', 'charge-source-documents', false),
  ('charge-source-videos', 'charge-source-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for user files bucket
CREATE POLICY "Users can view own files in user-files bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to user-files bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files in user-files bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files in user-files bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for documents bucket (more restrictive)
CREATE POLICY "Users can view files in documents bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'charge-source-documents');

CREATE POLICY "Users can upload to documents bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files in documents bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files in documents bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for videos bucket
CREATE POLICY "Users can view files in videos bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'charge-source-videos');

CREATE POLICY "Users can upload to videos bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files in videos bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files in videos bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
