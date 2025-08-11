import { supabase } from '../supabase';
import { localFileStorageService } from './localFileStorageService';

export interface FileUpload {
  file: File;
  category: 'general' | 'project' | 'quote' | 'product' | 'user' | 'public';
  metadata?: {
    projectId?: string;
    quoteId?: string;
    productId?: string;
    description?: string;
  };
}

export interface StoredFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  category: string;
  metadata: any;
  url?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

class FileStorageService {
  private readonly bucketName = 'documents';
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv',
    'application/zip',
    'application/x-zip-compressed'
  ];

  /**
   * Validates a file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`
      };
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type '${file.type}' is not allowed`
      };
    }

    return { valid: true };
  }

  /**
   * Generates a secure file path based on user ID and category
   */
  private generateFilePath(fileName: string, category: string, userId: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExtension = fileName.split('.').pop() || '';
    const baseName = fileName.replace(/\.[^.]*$/, '');
    
    return `${userId}/${category}/${timestamp}_${baseName}.${fileExtension}`;
  }

  /**
   * Uploads a file to Supabase storage
   */
  async uploadFile(
    upload: FileUpload,
    onProgress?: UploadProgressCallback
  ): Promise<StoredFile> {
    try {
      // Check local auth first (primary system)
      let user = null;
      let isAuthenticated = false;

      try {
        const storedUser = localStorage.getItem("chargeSourceUser");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          user = {
            id: userData.id,
            email: userData.email,
          };
          isAuthenticated = true;
          console.log("Using local auth for file upload:", userData.email);
        }
      } catch (error) {
        console.warn("Local auth check failed:", error);
      }

      // Fallback to Supabase auth if no local user
      if (!isAuthenticated) {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !authUser) {
          throw new Error('Authentication required for file upload. Please log in.');
        }
        user = authUser;
        isAuthenticated = true;
      }

      if (!user) {
        throw new Error('User must be authenticated to upload files');
      }

      // Validate file
      const validation = this.validateFile(upload.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate secure file path
      const filePath = this.generateFilePath(upload.file.name, upload.category, user.id);

      // Try direct storage upload first, fallback to edge function
      let uploadData = null;
      let uploadError = null;

      try {
        // Try direct Supabase storage upload
        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .upload(filePath, upload.file, {
            upsert: true,
            contentType: upload.file.type
          });

        if (error) {
          uploadError = error;
          console.log('Direct storage upload failed, trying edge function...', error.message);
        } else {
          uploadData = data;
          console.log('File uploaded successfully via direct storage:', filePath);
        }
      } catch (error) {
        console.log('Storage upload error, will try edge function:', error);
        uploadError = error;
      }

      // If direct upload failed, try edge function
      if (uploadError && uploadData === null) {
        try {
          // Get auth token for edge function
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !session?.access_token) {
            throw new Error("Authentication required for file upload. Please log in.");
          }

          // Create form data for edge function
          const formData = new FormData();
          formData.append('file', upload.file);

          // Call secure upload edge function
          const response = await fetch(`${supabase.supabaseUrl}/functions/v1/secure-file-upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
          }

          const uploadResult = await response.json();
          uploadData = { path: uploadResult.path };
          uploadError = null;
        } catch (edgeFunctionError) {
          // If both methods fail, use local storage fallback
          console.warn('Both cloud storage methods failed, using local storage fallback');

          try {
            // Convert to enhanced upload format for local storage
            const localUpload = {
              file: upload.file,
              bucket: 'documents' as any,
              metadata: {
                title: upload.file.name.replace(/\.[^/.]+$/, ''),
                description: upload.metadata?.description,
                tags: [],
                category: upload.category,
                subcategory: undefined,
                visibility: 'private' as any
              }
            };

            const localResult = await localFileStorageService.simulateBasicFileUpload(upload, onProgress);
            uploadData = { path: localResult.path };
            uploadError = null;
            console.log('✅ File stored locally as fallback:', localResult.name);
          } catch (localError) {
            console.error('Local storage fallback failed:', localError);
            throw new Error(`All storage methods failed: ${edgeFunctionError.message}`);
          }
        }
      }

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      // Create file record
      const storedFile: StoredFile = {
        id: uploadData.id || crypto.randomUUID(),
        name: upload.file.name,
        path: filePath,
        size: upload.file.size,
        mimeType: upload.file.type,
        category: upload.category,
        metadata: upload.metadata || {},
        url: urlData.publicUrl,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate progress for callback
      if (onProgress) {
        onProgress({ loaded: upload.file.size, total: upload.file.size, percentage: 100 });
      }

      return storedFile;

    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Downloads a file from storage
   */
  async downloadFile(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  }

  /**
   * Gets a signed URL for file access
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to get signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get signed URL error:', error);
      throw error;
    }
  }

  /**
   * Lists files for the current user
   */
  async listUserFiles(category?: string): Promise<StoredFile[]> {
    try {
      // Check local auth first
      let user = null;

      try {
        const storedUser = localStorage.getItem("chargeSourceUser");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          user = { id: userData.id, email: userData.email };
        }
      } catch (error) {
        console.warn("Local auth check failed for file listing:", error);
      }

      // Fallback to Supabase auth
      if (!user) {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !authUser) {
          throw new Error('User must be authenticated');
        }
        user = authUser;
      }

      const prefix = category ? `${user.id}/${category}/` : `${user.id}/`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(prefix, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }

      // Convert to StoredFile format
      return data.map(file => ({
        id: file.id || crypto.randomUUID(),
        name: file.metadata?.originalName || file.name,
        path: `${prefix}${file.name}`,
        size: file.metadata?.size || 0,
        mimeType: file.metadata?.mimetype || '',
        category: file.metadata?.category || 'general',
        metadata: file.metadata || {},
        userId: user.id,
        createdAt: file.created_at || new Date().toISOString(),
        updatedAt: file.updated_at || new Date().toISOString()
      }));

    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  /**
   * Updates file metadata
   */
  async updateFileMetadata(filePath: string, metadata: any): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .update(filePath, new Blob([]), {
          metadata
        });

      if (error) {
        throw new Error(`Metadata update failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Update metadata error:', error);
      throw error;
    }
  }

  /**
   * Gets file information without downloading
   */
  async getFileInfo(filePath: string): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('', {
          search: filePath
        });

      if (error) {
        throw new Error(`Failed to get file info: ${error.message}`);
      }

      return data[0] || null;
    } catch (error) {
      console.error('Get file info error:', error);
      throw error;
    }
  }

  /**
   * Checks if user has permission to access a file
   */
  async checkFilePermissions(filePath: string): Promise<boolean> {
    try {
      // Check local auth first
      let user = null;

      try {
        const storedUser = localStorage.getItem("chargeSourceUser");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          user = { id: userData.id, email: userData.email };
        }
      } catch (error) {
        console.warn("Local auth check failed for permission check:", error);
      }

      // Fallback to Supabase auth
      if (!user) {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !authUser) {
          return false;
        }
        user = authUser;
      }

      // Check if file belongs to user or if user is admin
      const pathParts = filePath.split('/');
      if (pathParts[0] === user.id) {
        return true;
      }

      // Check if user has admin privileges
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      return userProfile?.role === 'admin' || userProfile?.role === 'global_admin';

    } catch (error) {
      console.error('Check permissions error:', error);
      return false;
    }
  }

  /**
   * Batch upload multiple files
   */
  async uploadMultipleFiles(
    uploads: FileUpload[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<StoredFile[]> {
    const results: StoredFile[] = [];

    for (let i = 0; i < uploads.length; i++) {
      try {
        const result = await this.uploadFile(uploads[i], (progress) => {
          if (onProgress) {
            onProgress(i, progress);
          }
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${i}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Get storage usage for current user
   */
  async getStorageUsage(): Promise<{ totalFiles: number; totalSize: number }> {
    try {
      const files = await this.listUserFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      return {
        totalFiles: files.length,
        totalSize
      };
    } catch (error) {
      console.error('Get storage usage error:', error);
      return { totalFiles: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService();
export default fileStorageService;
