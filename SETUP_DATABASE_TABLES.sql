-- ChargeSource Document Management Database Tables
-- Run this script in your Supabase SQL Editor to create the required tables

-- Create document_metadata table
CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID DEFAULT NULL,
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT DEFAULT 'uncategorized',
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id) DEFAULT NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(bucket_name, file_path)
);

-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES document_metadata(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_notes TEXT,
  UNIQUE(document_id, version_number)
);

-- Enable Row Level Security
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_metadata
DROP POLICY IF EXISTS "Users can view their own documents" ON document_metadata;
CREATE POLICY "Users can view their own documents" ON document_metadata
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON document_metadata;
CREATE POLICY "Users can insert their own documents" ON document_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON document_metadata;
CREATE POLICY "Users can update their own documents" ON document_metadata
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON document_metadata;
CREATE POLICY "Users can delete their own documents" ON document_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for document_versions
DROP POLICY IF EXISTS "Users can view versions of their documents" ON document_versions;
CREATE POLICY "Users can view versions of their documents" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_metadata 
      WHERE id = document_versions.document_id 
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create versions of their documents" ON document_versions;
CREATE POLICY "Users can create versions of their documents" ON document_versions
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM document_metadata 
      WHERE id = document_versions.document_id 
      AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_metadata_user_id ON document_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_organization_id ON document_metadata(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_bucket_name ON document_metadata(bucket_name);
CREATE INDEX IF NOT EXISTS idx_document_metadata_status ON document_metadata(status);
CREATE INDEX IF NOT EXISTS idx_document_metadata_category ON document_metadata(category);
CREATE INDEX IF NOT EXISTS idx_document_metadata_created_at ON document_metadata(created_at);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at column
DROP TRIGGER IF EXISTS update_document_metadata_updated_at ON document_metadata;
CREATE TRIGGER update_document_metadata_updated_at
  BEFORE UPDATE ON document_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('charge-source-user-files', 'charge-source-user-files', false),
  ('charge-source-documents', 'charge-source-documents', false),
  ('charge-source-videos', 'charge-source-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage buckets
-- charge-source-user-files policies
DROP POLICY IF EXISTS "Users can view their own user files" ON storage.objects;
CREATE POLICY "Users can view their own user files" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload their own user files" ON storage.objects;
CREATE POLICY "Users can upload their own user files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own user files" ON storage.objects;
CREATE POLICY "Users can update their own user files" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own user files" ON storage.objects;
CREATE POLICY "Users can delete their own user files" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- charge-source-documents policies
DROP POLICY IF EXISTS "Users can view their own documents storage" ON storage.objects;
CREATE POLICY "Users can view their own documents storage" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload their own documents storage" ON storage.objects;
CREATE POLICY "Users can upload their own documents storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own documents storage" ON storage.objects;
CREATE POLICY "Users can update their own documents storage" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own documents storage" ON storage.objects;
CREATE POLICY "Users can delete their own documents storage" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- charge-source-videos policies
DROP POLICY IF EXISTS "Users can view their own videos storage" ON storage.objects;
CREATE POLICY "Users can view their own videos storage" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload their own videos storage" ON storage.objects;
CREATE POLICY "Users can upload their own videos storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own videos storage" ON storage.objects;
CREATE POLICY "Users can update their own videos storage" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own videos storage" ON storage.objects;
CREATE POLICY "Users can delete their own videos storage" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
