import { supabase } from '@/lib/supabase';

export interface UploadOptions {
  organizationId?: string;
  bucket?: 'charge-source-user-files' | 'charge-source-documents' | 'charge-source-videos';
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    fullPath: string;
    bucket: string;
  };
  error?: string;
}

export interface ListOptions {
  bucket?: string;
  organizationId?: string;
  limit?: number;
  offset?: number;
}

export interface FileInfo {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
  buckets?: any;
  signedUrl?: string;
  bucket: string;
  fullPath: string;
}

class SimpleDocumentService {
  /**
   * Upload a document using the direct Supabase client approach
   * Based on the sample code provided by the user
   */
  async uploadDocument(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'User must be authenticated'
        };
      }

      // Determine bucket and path
      const bucket = options.bucket || 'charge-source-documents';
      const uploadPath = options.organizationId 
        ? `${options.organizationId}/${file.name}` 
        : `${user.id}/${file.name}`;

      // Upload the file directly to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uploadPath, file, {
          upsert: options.upsert !== false // Default to true
        });

      if (error) {
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          bucket: bucket
        }
      };

    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Upload failed'
      };
    }
  }

  /**
   * List documents for a user or organization
   */
  async listDocuments(options: ListOptions = {}): Promise<{ files: FileInfo[]; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          files: [],
          error: 'User must be authenticated'
        };
      }

      const bucket = options.bucket || 'charge-source-documents';
      const folderPath = options.organizationId || user.id;

      // List files in the user's or organization's folder
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folderPath, {
          limit: options.limit || 100,
          offset: options.offset || 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        return {
          files: [],
          error: `Failed to list files: ${error.message}`
        };
      }

      // Get signed URLs for each file
      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const filePath = `${folderPath}/${file.name}`;
          const { data: urlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 3600); // 1 hour expiry

          return {
            ...file,
            signedUrl: urlData?.signedUrl,
            bucket: bucket,
            fullPath: filePath
          } as FileInfo;
        })
      );

      return {
        files: filesWithUrls
      };

    } catch (err) {
      return {
        files: [],
        error: err instanceof Error ? err.message : 'Failed to list documents'
      };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(fileName: string, options: { bucket?: string; organizationId?: string } = {}): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'User must be authenticated'
        };
      }

      const bucket = options.bucket || 'charge-source-documents';
      const folderPath = options.organizationId || user.id;
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        return {
          success: false,
          error: `Failed to delete file: ${error.message}`
        };
      }

      return {
        success: true
      };

    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete document'
      };
    }
  }

  /**
   * Get a signed URL for a document
   */
  async getDocumentUrl(fileName: string, options: { bucket?: string; organizationId?: string; expiresIn?: number } = {}): Promise<{ url?: string; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          error: 'User must be authenticated'
        };
      }

      const bucket = options.bucket || 'charge-source-documents';
      const folderPath = options.organizationId || user.id;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, options.expiresIn || 3600);

      if (error) {
        return {
          error: `Failed to get URL: ${error.message}`
        };
      }

      return {
        url: data.signedUrl
      };

    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to get document URL'
      };
    }
  }
}

export const simpleDocumentService = new SimpleDocumentService();
