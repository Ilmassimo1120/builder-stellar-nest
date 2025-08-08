import { supabase } from '../supabase';

export type BucketName = 'charge-source-user-files' | 'charge-source-documents' | 'charge-source-videos';
export type AssetStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
export type AssetVisibility = 'private' | 'team' | 'public';
export type ChangelogAction = 'created' | 'updated' | 'approved' | 'rejected' | 'archived' | 'deleted' | 'downloaded';

export interface FileAssetMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  subcategory?: string;
  visibility?: AssetVisibility;
  accessPermissions?: Record<string, any>;
}

export interface FileAsset {
  id: string;
  fileName: string;
  filePath: string;
  bucketName: BucketName;
  fileSize: number;
  mimeType: string;
  title?: string;
  description?: string;
  tags: string[];
  category?: string;
  subcategory?: string;
  authorId: string;
  versionNumber: number;
  status: AssetStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  parentVersionId?: string;
  isCurrentVersion: boolean;
  visibility: AssetVisibility;
  accessPermissions: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export interface FileUploadRequest {
  file: File;
  bucket: BucketName;
  metadata: FileAssetMetadata;
  parentVersionId?: string; // For creating new versions
}

export interface SearchFilters {
  bucket?: BucketName;
  category?: string;
  tags?: string[];
  status?: AssetStatus;
  visibility?: AssetVisibility;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

export interface ChangelogEntry {
  id: string;
  assetId: string;
  action: ChangelogAction;
  changedBy: string;
  changes: Record<string, any>;
  notes?: string;
  createdAt: string;
}

export interface AssetShare {
  id: string;
  assetId: string;
  sharedBy: string;
  sharedWith?: string;
  shareToken: string;
  expiresAt?: string;
  accessLevel: 'view' | 'download' | 'edit';
  createdAt: string;
}

class EnhancedFileStorageService {
  private readonly buckets: BucketName[] = [
    'charge-source-user-files',
    'charge-source-documents', 
    'charge-source-videos'
  ];

  private readonly maxFileSizes: Record<BucketName, number> = {
    'charge-source-user-files': 50 * 1024 * 1024, // 50MB
    'charge-source-documents': 100 * 1024 * 1024, // 100MB  
    'charge-source-videos': 500 * 1024 * 1024, // 500MB
  };

  private readonly allowedMimeTypes: Record<BucketName, string[]> = {
    'charge-source-user-files': [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    'charge-source-documents': [
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint', 'application/zip',
      'application/x-zip-compressed', 'image/jpeg', 'image/png'
    ],
    'charge-source-videos': [
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
      'video/x-ms-wmv', 'video/3gpp', 'video/x-flv'
    ]
  };

  /**
   * Safely formats error objects into readable strings
   */
  private formatError(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object') {
      // Handle Supabase error format
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      // Handle PostgreSQL/database errors
      if ('code' in error && 'details' in error) {
        const dbError = error as any;
        return `Database error (${dbError.code}): ${dbError.message || dbError.details || 'Unknown database error'}`;
      }
      // Try to extract meaningful error information
      try {
        const errorStr = JSON.stringify(error);
        if (errorStr !== '{}') {
          return `Error: ${errorStr}`;
        }
      } catch {
        // JSON.stringify failed, fall back to default
      }
    }
    return defaultMessage;
  }

  /**
   * Validates file before upload based on bucket requirements
   */
  validateFile(file: File, bucket: BucketName): { valid: boolean; error?: string } {
    const maxSize = this.maxFileSizes[bucket];
    const allowedTypes = this.allowedMimeTypes[bucket];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB for ${bucket}`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type '${file.type}' is not allowed in ${bucket}`
      };
    }

    return { valid: true };
  }

  /**
   * Generates secure file path with versioning support
   */
  private generateFilePath(fileName: string, bucket: BucketName, userId: string, category?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const categoryPath = category ? `${category}/` : '';
    
    return `${userId}/${categoryPath}${timestamp}_${cleanFileName}`;
  }

  /**
   * Uploads a file with metadata to the specified bucket
   */
  async uploadFile(request: FileUploadRequest): Promise<FileAsset> {
    try {
      // More robust authentication check
      let user = null;
      let authError = null;

      // First try to get user
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.warn('getUser() failed, trying getSession():', userError.message);

        // Fallback to session check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session check also failed:', sessionError);
          authError = sessionError;
        } else if (session?.user) {
          console.log('Found user via session:', session.user.email);
          user = session.user;
        } else {
          console.error('No session found');
          authError = new Error('No active session');
        }
      } else if (authUser) {
        console.log('User authenticated for upload:', authUser.email);
        user = authUser;
      } else {
        console.error('No authenticated user found');
        authError = new Error('No user in auth response');
      }

      if (!user) {
        throw new Error('Please log in to upload files. ' + (authError?.message || 'Authentication required.'));
      }

      // Validate file
      const validation = this.validateFile(request.file, request.bucket);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate file path
      const filePath = this.generateFilePath(
        request.file.name, 
        request.bucket, 
        user.id, 
        request.metadata.category
      );

      // Check if storage bucket exists and upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(request.bucket)
        .upload(filePath, request.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Provide more helpful error messages for common issues
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
          throw new Error(`Storage bucket '${request.bucket}' not found. Please create the bucket in Supabase dashboard first.`);
        }
        if (uploadError.message.includes('permission') || uploadError.message.includes('unauthorized')) {
          throw new Error(`Permission denied. Please check storage bucket permissions for '${request.bucket}'.`);
        }
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Create database record
      const assetData = {
        file_name: request.file.name,
        file_path: filePath,
        bucket_name: request.bucket,
        file_size: request.file.size,
        mime_type: request.file.type,
        title: request.metadata.title,
        description: request.metadata.description,
        tags: request.metadata.tags || [],
        category: request.metadata.category,
        subcategory: request.metadata.subcategory,
        author_id: user.id,
        visibility: request.metadata.visibility || 'private',
        access_permissions: request.metadata.accessPermissions || {},
        status: 'draft' as AssetStatus
      };

      let result;
      if (request.parentVersionId) {
        // Create new version
        const { data, error } = await supabase.rpc('create_new_version', {
          parent_asset_id: request.parentVersionId,
          new_file_path: filePath,
          new_file_name: request.file.name,
          new_file_size: request.file.size,
          new_mime_type: request.file.type
        });

        if (error) throw error;
        
        // Get the new version record
        const { data: versionData, error: versionError } = await supabase
          .from('file_assets')
          .select('*')
          .eq('id', data)
          .single();

        if (versionError) throw versionError;
        result = versionData;
      } else {
        // Create new asset
        const { data, error } = await supabase
          .from('file_assets')
          .insert([assetData])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Log creation
      await this.logChange(result.id, 'created', 'File uploaded successfully');

      return this.mapToFileAsset(result);
    } catch (error) {
      const errorMessage = this.formatError(error, 'Unknown upload error');
      console.error('File upload error:', errorMessage, error);
      throw new Error(`Upload failed: ${errorMessage}`);
    }
  }

  /**
   * Searches files with advanced filtering
   */
  async searchFiles(filters: SearchFilters = {}): Promise<FileAsset[]> {
    try {
      // Check authentication using local auth system first
      let user = null;

      // Try local auth first
      try {
        const storedUser = localStorage.getItem('chargeSourceUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          user = { id: userData.id, email: userData.email };
        }
      } catch (error) {
        console.warn('Local auth check failed for search:', error);
      }

      // Fallback to Supabase auth if no local user
      if (!user) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          console.log('No authenticated user found for search');
          return []; // Return empty array if not authenticated
        } else {
          user = authUser;
        }
      }

      let query = supabase
        .from('file_assets')
        .select('*');

      // Apply filters
      if (filters.bucket) {
        query = query.eq('bucket_name', filters.bucket);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.trim().replace(/[%_]/g, '\\$&'); // Escape SQL wildcards
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`);
      }

      // Only show current versions by default
      query = query.eq('is_current_version', true);

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapToFileAsset);
    } catch (error) {
      const errorMessage = this.formatError(error, 'Unknown search error');
      console.error('Search error:', errorMessage, error);
      throw new Error(`Search failed: ${errorMessage}`);
    }
  }

  /**
   * Gets a specific file asset by ID
   */
  async getAsset(assetId: string): Promise<FileAsset | null> {
    try {
      const { data, error } = await supabase
        .from('file_assets')
        .select('*')
        .eq('id', assetId)
        .single();

      if (error) throw error;

      return this.mapToFileAsset(data);
    } catch (error) {
      const errorMessage = this.formatError(error, 'Unknown error');
      console.error('Get asset error:', errorMessage, error);
      return null;
    }
  }

  /**
   * Updates asset metadata
   */
  async updateAssetMetadata(
    assetId: string, 
    metadata: Partial<FileAssetMetadata>, 
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_asset_metadata', {
        asset_id: assetId,
        new_title: metadata.title,
        new_description: metadata.description,
        new_tags: metadata.tags,
        new_category: metadata.category,
        new_subcategory: metadata.subcategory,
        update_notes: notes
      });

      if (error) throw error;
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown metadata update error';
      console.error('Update metadata error:', errorMessage, error);
      throw new Error(`Metadata update failed: ${errorMessage}`);
    }
  }

  /**
   * Downloads a file
   */
  async downloadFile(assetId: string): Promise<Blob> {
    try {
      const asset = await this.getAsset(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const { data, error } = await supabase.storage
        .from(asset.bucketName)
        .download(asset.filePath);

      if (error) throw error;

      // Log download
      await this.logChange(assetId, 'downloaded', 'File downloaded');

      return data;
    } catch (error) {
      const errorMessage = this.formatError(error, 'Unknown download error');
      console.error('Download error:', errorMessage, error);
      throw new Error(`Download failed: ${errorMessage}`);
    }
  }

  /**
   * Gets signed URL for file access
   */
  async getSignedUrl(assetId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const asset = await this.getAsset(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const { data, error } = await supabase.storage
        .from(asset.bucketName)
        .createSignedUrl(asset.filePath, expiresIn);

      if (error) throw error;

      return data.signedUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown signed URL error';
      console.error('Get signed URL error:', errorMessage, error);
      throw new Error(`Failed to get signed URL: ${errorMessage}`);
    }
  }

  /**
   * Deletes a file asset
   */
  async deleteAsset(assetId: string): Promise<boolean> {
    try {
      const asset = await this.getAsset(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(asset.bucketName)
        .remove([asset.filePath]);

      if (storageError) throw storageError;

      // Log deletion before removing from database
      await this.logChange(assetId, 'deleted', 'File deleted');

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_assets')
        .delete()
        .eq('id', assetId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
      console.error('Delete error:', errorMessage, error);
      throw new Error(`Delete failed: ${errorMessage}`);
    }
  }

  /**
   * Approves or rejects an asset
   */
  async approveAsset(assetId: string, approve: boolean, rejectionReason?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('approve_asset', {
        asset_id: assetId,
        approve,
        rejection_reason: rejectionReason
      });

      if (error) throw error;
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown approval error';
      console.error('Approve asset error:', errorMessage, error);
      throw new Error(`Approval failed: ${errorMessage}`);
    }
  }

  /**
   * Gets version history for an asset
   */
  async getVersionHistory(assetId: string): Promise<FileAsset[]> {
    try {
      // Find the parent version ID or use the current asset ID if it's already a parent
      const { data: currentAsset, error: currentError } = await supabase
        .from('file_assets')
        .select('id, parent_version_id')
        .eq('id', assetId)
        .single();

      if (currentError) throw currentError;

      const parentId = currentAsset.parent_version_id || assetId;

      // Get all versions including the parent
      const { data, error } = await supabase
        .from('file_assets')
        .select('*')
        .or(`id.eq.${parentId},parent_version_id.eq.${parentId}`)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToFileAsset);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown version history error';
      console.error('Get version history error:', errorMessage, error);
      throw new Error(`Failed to get version history: ${errorMessage}`);
    }
  }

  /**
   * Gets changelog for an asset
   */
  async getAssetChangelog(assetId: string): Promise<ChangelogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('file_asset_changelog')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown changelog error';
      console.error('Get changelog error:', errorMessage, error);
      throw new Error(`Failed to get changelog: ${errorMessage}`);
    }
  }

  /**
   * Creates a share link for an asset
   */
  async createShareLink(
    assetId: string, 
    accessLevel: 'view' | 'download' | 'edit' = 'view',
    expiresIn?: number
  ): Promise<AssetShare> {
    try {
      const shareToken = crypto.randomUUID();
      const expiresAt = expiresIn 
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('file_asset_shares')
        .insert([{
          asset_id: assetId,
          share_token: shareToken,
          expires_at: expiresAt,
          access_level: accessLevel
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown share link error';
      console.error('Create share link error:', errorMessage, error);
      throw new Error(`Failed to create share link: ${errorMessage}`);
    }
  }

  /**
   * Gets asset by share token
   */
  async getAssetByShareToken(shareToken: string): Promise<FileAsset | null> {
    try {
      const { data: shareData, error: shareError } = await supabase
        .from('file_asset_shares')
        .select('*, file_assets(*)')
        .eq('share_token', shareToken)
        .single();

      if (shareError) throw shareError;

      // Check if link has expired
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        throw new Error('Share link has expired');
      }

      return this.mapToFileAsset(shareData.file_assets);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown share token error';
      console.error('Get asset by share token error:', errorMessage, error);
      return null;
    }
  }

  /**
   * Gets storage usage statistics
   */
  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
    bucketBreakdown: Record<BucketName, { files: number; size: number }>;
    categoryBreakdown: Record<string, { files: number; size: number }>;
  }> {
    try {
      // Check authentication using local auth system first
      let user = null;

      // Try local auth first
      try {
        const storedUser = localStorage.getItem('chargeSourceUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          user = { id: userData.id, email: userData.email };
        }
      } catch (error) {
        console.warn('Local auth check failed for storage usage:', error);
      }

      // Fallback to Supabase auth if no local user
      if (!user) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          console.log('No authenticated user found for storage usage');
          return {
            totalFiles: 0,
            totalSize: 0,
            bucketBreakdown: this.buckets.reduce((acc, bucket) => {
              acc[bucket] = { files: 0, size: 0 };
              return acc;
            }, {} as Record<BucketName, { files: number; size: number }>),
            categoryBreakdown: {}
          };
        } else {
          user = authUser;
        }
      }

      const { data, error } = await supabase
        .from('file_assets')
        .select('bucket_name, category, file_size')
        .eq('is_current_version', true);

      if (error) throw error;

      const totalFiles = data?.length || 0;
      const totalSize = data?.reduce((sum, file) => {
        const fileSize = Number(file.file_size) || 0;
        return sum + fileSize;
      }, 0) || 0;

      const bucketBreakdown = this.buckets.reduce((acc, bucket) => {
        const bucketFiles = data?.filter(f => f.bucket_name === bucket) || [];
        acc[bucket] = {
          files: bucketFiles.length,
          size: bucketFiles.reduce((sum, f) => {
            const fileSize = Number(f.file_size) || 0;
            return sum + fileSize;
          }, 0)
        };
        return acc;
      }, {} as Record<BucketName, { files: number; size: number }>);

      const categoryBreakdown = data?.reduce((acc, file) => {
        const category = file.category || 'uncategorized';
        if (!acc[category]) {
          acc[category] = { files: 0, size: 0 };
        }
        acc[category].files++;
        acc[category].size += Number(file.file_size) || 0;
        return acc;
      }, {} as Record<string, { files: number; size: number }>) || {};

      return {
        totalFiles,
        totalSize,
        bucketBreakdown,
        categoryBreakdown
      };
    } catch (error) {
      const errorMessage = this.formatError(error, 'Unknown storage usage error');
      console.error('Get storage usage error:', errorMessage, error);
      throw new Error(`Failed to get storage usage: ${errorMessage}`);
    }
  }

  /**
   * Logs a change to the changelog
   */
  private async logChange(assetId: string, action: ChangelogAction, notes?: string): Promise<void> {
    try {
      await supabase
        .from('file_asset_changelog')
        .insert([{
          asset_id: assetId,
          action,
          notes
        }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown log error';
      console.error('Log change error:', errorMessage, error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Maps database record to FileAsset interface
   */
  private mapToFileAsset(data: any): FileAsset {
    if (!data) {
      throw new Error('Invalid data provided to mapToFileAsset');
    }

    return {
      id: data.id || '',
      fileName: data.file_name || '',
      filePath: data.file_path || '',
      bucketName: data.bucket_name as BucketName,
      fileSize: Number(data.file_size) || 0,
      mimeType: data.mime_type || '',
      title: data.title || null,
      description: data.description || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category || null,
      subcategory: data.subcategory || null,
      authorId: data.author_id || '',
      versionNumber: Number(data.version_number) || 1,
      status: data.status || 'draft',
      approvedBy: data.approved_by || null,
      approvedAt: data.approved_at || null,
      rejectionReason: data.rejection_reason || null,
      parentVersionId: data.parent_version_id || null,
      isCurrentVersion: Boolean(data.is_current_version),
      visibility: data.visibility || 'private',
      accessPermissions: data.access_permissions || {},
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    };
  }
}

export const enhancedFileStorageService = new EnhancedFileStorageService();
export default enhancedFileStorageService;
