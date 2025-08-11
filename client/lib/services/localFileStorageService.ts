import { FileUpload, StoredFile, UploadProgress, UploadProgressCallback } from './fileStorageService';
import { FileAsset, FileUploadRequest, BucketName } from './enhancedFileStorageService';

/**
 * Local file storage service as fallback when Supabase is unavailable
 * Simulates file storage using localStorage and creates demo file records
 */
class LocalFileStorageService {
  private readonly storageKey = 'chargeSource_localFiles';
  private readonly maxFiles = 100; // Limit to prevent localStorage bloat

  /**
   * Simulates file upload when cloud storage is unavailable
   */
  async simulateFileUpload(request: FileUploadRequest): Promise<FileAsset> {
    try {
      // Get current user from local auth
      const storedUser = localStorage.getItem("chargeSourceUser");
      if (!storedUser) {
        throw new Error("Authentication required for file upload. Please log in.");
      }

      const userData = JSON.parse(storedUser);
      const user = { id: userData.id, email: userData.email };

      // Create file data (without actually storing the file content)
      const fileId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      
      // Generate file path similar to cloud storage
      const filePath = `${user.id}/${request.metadata.category || 'general'}/${timestamp.replace(/[:.]/g, '-')}_${request.file.name}`;

      // Create file record
      const fileAsset: FileAsset = {
        id: fileId,
        fileName: request.file.name,
        filePath: filePath,
        bucketName: request.bucket,
        fileSize: request.file.size,
        mimeType: request.file.type,
        title: request.metadata.title,
        description: request.metadata.description,
        tags: request.metadata.tags || [],
        category: request.metadata.category,
        subcategory: request.metadata.subcategory,
        authorId: user.id,
        versionNumber: 1,
        status: 'draft',
        approvedBy: undefined,
        approvedAt: undefined,
        rejectionReason: undefined,
        parentVersionId: request.parentVersionId,
        isCurrentVersion: true,
        visibility: request.metadata.visibility || 'private',
        accessPermissions: request.metadata.accessPermissions || {},
        createdAt: timestamp,
        updatedAt: timestamp,
        url: `blob:local-storage/${fileId}` // Fake URL for demo
      };

      // Store in localStorage
      this.saveLocalFile(fileAsset);

      console.log('🗄️ File simulated locally:', fileAsset.fileName);
      return fileAsset;

    } catch (error) {
      console.error('Local file simulation failed:', error);
      throw error;
    }
  }

  /**
   * Simulates basic file upload for compatibility
   */
  async simulateBasicFileUpload(upload: FileUpload, onProgress?: UploadProgressCallback): Promise<StoredFile> {
    try {
      // Get current user from local auth
      const storedUser = localStorage.getItem("chargeSourceUser");
      if (!storedUser) {
        throw new Error("Authentication required for file upload. Please log in.");
      }

      const userData = JSON.parse(storedUser);
      const user = { id: userData.id, email: userData.email };

      // Simulate progress
      if (onProgress) {
        for (let i = 0; i <= 100; i += 25) {
          onProgress({ loaded: (upload.file.size * i) / 100, total: upload.file.size, percentage: i });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Create file record
      const fileId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      const filePath = `${user.id}/${upload.category}/${timestamp.replace(/[:.]/g, '-')}_${upload.file.name}`;

      const storedFile: StoredFile = {
        id: fileId,
        name: upload.file.name,
        path: filePath,
        size: upload.file.size,
        mimeType: upload.file.type,
        category: upload.category,
        metadata: upload.metadata || {},
        url: `blob:local-storage/${fileId}`,
        userId: user.id,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Convert to FileAsset format for storage
      const fileAsset: FileAsset = {
        id: fileId,
        fileName: upload.file.name,
        filePath: filePath,
        bucketName: 'documents' as BucketName,
        fileSize: upload.file.size,
        mimeType: upload.file.type,
        title: upload.file.name.replace(/\.[^/.]+$/, ''),
        description: upload.metadata?.description,
        tags: [],
        category: upload.category,
        subcategory: undefined,
        authorId: user.id,
        versionNumber: 1,
        status: 'draft',
        approvedBy: undefined,
        approvedAt: undefined,
        rejectionReason: undefined,
        parentVersionId: undefined,
        isCurrentVersion: true,
        visibility: 'private',
        accessPermissions: {},
        createdAt: timestamp,
        updatedAt: timestamp
      };

      this.saveLocalFile(fileAsset);

      console.log('🗄️ Basic file simulated locally:', storedFile.name);
      return storedFile;

    } catch (error) {
      console.error('Local basic file simulation failed:', error);
      throw error;
    }
  }

  /**
   * Gets all locally stored file records for current user
   */
  getLocalFiles(): FileAsset[] {
    try {
      const storedUser = localStorage.getItem("chargeSourceUser");
      if (!storedUser) {
        return [];
      }

      const userData = JSON.parse(storedUser);
      const userId = userData.id;

      const localFiles = localStorage.getItem(this.storageKey);
      if (!localFiles) {
        return [];
      }

      const allFiles: FileAsset[] = JSON.parse(localFiles);
      return allFiles.filter(file => file.authorId === userId);
    } catch (error) {
      console.error('Error getting local files:', error);
      return [];
    }
  }

  /**
   * Saves a file record to localStorage
   */
  private saveLocalFile(fileAsset: FileAsset): void {
    try {
      const existingFiles = this.getAllLocalFiles();
      existingFiles.push(fileAsset);

      // Limit number of files to prevent localStorage bloat
      if (existingFiles.length > this.maxFiles) {
        // Remove oldest files
        existingFiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        existingFiles.splice(0, existingFiles.length - this.maxFiles);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(existingFiles));
    } catch (error) {
      console.error('Error saving local file:', error);
    }
  }

  /**
   * Gets all locally stored files (all users)
   */
  private getAllLocalFiles(): FileAsset[] {
    try {
      const localFiles = localStorage.getItem(this.storageKey);
      return localFiles ? JSON.parse(localFiles) : [];
    } catch (error) {
      console.error('Error getting all local files:', error);
      return [];
    }
  }

  /**
   * Removes a local file record
   */
  removeLocalFile(fileId: string): boolean {
    try {
      const existingFiles = this.getAllLocalFiles();
      const filteredFiles = existingFiles.filter(file => file.id !== fileId);
      
      if (filteredFiles.length !== existingFiles.length) {
        localStorage.setItem(this.storageKey, JSON.stringify(filteredFiles));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing local file:', error);
      return false;
    }
  }

  /**
   * Clears all local file records for current user
   */
  clearUserFiles(): void {
    try {
      const storedUser = localStorage.getItem("chargeSourceUser");
      if (!storedUser) {
        return;
      }

      const userData = JSON.parse(storedUser);
      const userId = userData.id;

      const allFiles = this.getAllLocalFiles();
      const otherUserFiles = allFiles.filter(file => file.authorId !== userId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(otherUserFiles));
    } catch (error) {
      console.error('Error clearing user files:', error);
    }
  }

  /**
   * Gets storage usage stats for local files
   */
  getLocalStorageUsage(): { totalFiles: number; totalSize: number; storageUsed: string } {
    try {
      const userFiles = this.getLocalFiles();
      const totalFiles = userFiles.length;
      const totalSize = userFiles.reduce((sum, file) => sum + file.fileSize, 0);
      
      // Estimate localStorage usage
      const storageString = localStorage.getItem(this.storageKey) || '';
      const storageUsed = this.formatBytes(storageString.length * 2); // Rough estimate (UTF-16)

      return {
        totalFiles,
        totalSize,
        storageUsed
      };
    } catch (error) {
      console.error('Error getting local storage usage:', error);
      return { totalFiles: 0, totalSize: 0, storageUsed: '0 B' };
    }
  }

  /**
   * Formats bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Checks if we're in local storage mode
   */
  isLocalMode(): boolean {
    try {
      // Simple check - if we have local files but can't reach Supabase
      const localFiles = this.getLocalFiles();
      return localFiles.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const localFileStorageService = new LocalFileStorageService();
export default localFileStorageService;
