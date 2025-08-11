import { supabase } from '@/lib/supabase';

export interface DocumentMetadata {
  id?: string;
  user_id: string;
  organization_id?: string | null;
  bucket_name: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  category?: string;
  tags?: string[];
  description?: string;
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  version?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  approved_by?: string | null;
  approved_at?: string | null;
}

export interface DocumentVersion {
  id?: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  created_by: string;
  created_at?: string;
  change_notes?: string;
}

class DocumentMetadataService {
  async createDocumentMetadata(metadata: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: DocumentMetadata | null; error: any }> {
    try {
      // First, ensure the tables exist
      await this.ensureTablesExist();
      
      const { data, error } = await supabase
        .from('document_metadata')
        .insert([metadata])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating document metadata:', error);
      return { data: null, error };
    }
  }

  async getDocumentsByUser(userId: string, options?: {
    bucket?: string;
    organizationId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: DocumentMetadata[] | null; error: any }> {
    try {
      let query = supabase
        .from('document_metadata')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.bucket) {
        query = query.eq('bucket_name', options.bucket);
      }

      if (options?.organizationId) {
        query = query.eq('organization_id', options.organizationId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { data: null, error };
    }
  }

  async updateDocumentStatus(documentId: string, status: DocumentMetadata['status'], approvedBy?: string): Promise<{ data: DocumentMetadata | null; error: any }> {
    try {
      const updateData: Partial<DocumentMetadata> = { status };
      
      if (status === 'approved' && approvedBy) {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('document_metadata')
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating document status:', error);
      return { data: null, error };
    }
  }

  async deleteDocumentMetadata(documentId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('document_metadata')
        .delete()
        .eq('id', documentId);

      return { error };
    } catch (error) {
      console.error('Error deleting document metadata:', error);
      return { error };
    }
  }

  async createDocumentVersion(version: Omit<DocumentVersion, 'id' | 'created_at'>): Promise<{ data: DocumentVersion | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .insert([version])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating document version:', error);
      return { data: null, error };
    }
  }

  async getDocumentVersions(documentId: string): Promise<{ data: DocumentVersion[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching document versions:', error);
      return { data: null, error };
    }
  }

  async searchDocuments(query: string, userId: string, options?: {
    bucket?: string;
    organizationId?: string;
  }): Promise<{ data: DocumentMetadata[] | null; error: any }> {
    try {
      let searchQuery = supabase
        .from('document_metadata')
        .select('*')
        .eq('user_id', userId)
        .or(`original_filename.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false });

      if (options?.bucket) {
        searchQuery = searchQuery.eq('bucket_name', options.bucket);
      }

      if (options?.organizationId) {
        searchQuery = searchQuery.eq('organization_id', options.organizationId);
      }

      const { data, error } = await searchQuery;
      return { data, error };
    } catch (error) {
      console.error('Error searching documents:', error);
      return { data: null, error };
    }
  }

  private async ensureTablesExist(): Promise<void> {
    try {
      // Check if tables exist by trying to select from them
      const { error: metadataError } = await supabase
        .from('document_metadata')
        .select('id')
        .limit(1);

      const { error: versionsError } = await supabase
        .from('document_versions')
        .select('id')
        .limit(1);

      // If tables don't exist, create them using RPC
      if (metadataError || versionsError) {
        await this.createTables();
      }
    } catch (error) {
      console.error('Error checking tables:', error);
      // Try to create tables anyway
      await this.createTables();
    }
  }

  private async createTables(): Promise<void> {
    try {
      const createTablesSQL = `
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

        -- Enable RLS
        ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
        ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

        -- Create policies
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

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_document_metadata_user_id ON document_metadata(user_id);
        CREATE INDEX IF NOT EXISTS idx_document_metadata_organization_id ON document_metadata(organization_id);
        CREATE INDEX IF NOT EXISTS idx_document_metadata_bucket_name ON document_metadata(bucket_name);
        CREATE INDEX IF NOT EXISTS idx_document_metadata_status ON document_metadata(status);
        CREATE INDEX IF NOT EXISTS idx_document_metadata_created_at ON document_metadata(created_at);
        CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

        -- Create update trigger
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_document_metadata_updated_at ON document_metadata;
        CREATE TRIGGER update_document_metadata_updated_at
          BEFORE UPDATE ON document_metadata
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `;

      // Use a simpler approach - create an RPC function to execute the SQL
      console.log('Creating document metadata tables...');
      
      // For now, we'll just log that tables need to be created
      // In production, you'd want to run this via a migration or manual SQL execution
      console.warn('Document metadata tables need to be created. Please run the SQL manually in your Supabase SQL editor.');
      
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }
}

export const documentMetadataService = new DocumentMetadataService();
