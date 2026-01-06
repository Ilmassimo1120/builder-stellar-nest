import { supabase } from "../supabase";

export interface QuotaInfo {
  totalSize: number;
  limitSize: number;
  remainingSize: number;
  usagePercent: number;
  totalFiles: number;
  buckets: BucketQuotaInfo[];
  isNearLimit: boolean;
  isExceeded: boolean;
}

export interface BucketQuotaInfo {
  name: string;
  totalSize: number;
  fileCount: number;
  usagePercent: number;
}

export interface StorageMetrics {
  uploadSpeed: number; // MB/s
  uploadTime: number; // milliseconds
  downloadSpeed: number; // MB/s
  downloadTime: number; // milliseconds
  fileSize: number; // bytes
}

class StorageQuotaService {
  private readonly QUOTA_PER_BUCKET = 50 * 1024 * 1024; // 50MB per bucket
  private readonly NEAR_LIMIT_THRESHOLD = 0.8; // 80% threshold

  /**
   * Get current storage quota information for all buckets
   */
  async getQuotaInfo(): Promise<QuotaInfo> {
    const requiredBuckets = [
      "product-images",
      "documents",
      "quote-attachments",
    ];
    let totalSize = 0;
    let totalFiles = 0;
    const buckets: BucketQuotaInfo[] = [];

    try {
      // Get bucket list to verify they exist
      const { data: bucketList, error: listError } =
        await supabase.storage.listBuckets();

      if (listError || !bucketList) {
        console.error("Failed to list buckets:", listError);
        throw new Error(`Failed to list buckets: ${listError?.message}`);
      }

      // Calculate usage for each required bucket
      for (const bucketName of requiredBuckets) {
        try {
          const bucketInfo = await this.getBucketUsage(bucketName);
          totalSize += bucketInfo.totalSize;
          totalFiles += bucketInfo.fileCount;
          buckets.push(bucketInfo);
        } catch (error) {
          console.warn(`Failed to get usage for bucket ${bucketName}:`, error);
          // Continue with other buckets
          buckets.push({
            name: bucketName,
            totalSize: 0,
            fileCount: 0,
            usagePercent: 0,
          });
        }
      }

      // Calculate total quota (assuming 50MB per bucket, or shared limit)
      // For now, treating each bucket as independent 50MB
      const totalQuota = requiredBuckets.length * this.QUOTA_PER_BUCKET;
      const remainingSize = Math.max(0, totalQuota - totalSize);
      const usagePercent = totalQuota > 0 ? (totalSize / totalQuota) * 100 : 0;
      const isNearLimit = usagePercent >= this.NEAR_LIMIT_THRESHOLD * 100;
      const isExceeded = totalSize > totalQuota;

      return {
        totalSize,
        limitSize: totalQuota,
        remainingSize,
        usagePercent,
        totalFiles,
        buckets,
        isNearLimit,
        isExceeded,
      };
    } catch (error) {
      console.error("Error getting quota info:", error);
      throw error;
    }
  }

  /**
   * Get storage usage for a specific bucket
   */
  private async getBucketUsage(bucketName: string): Promise<BucketQuotaInfo> {
    try {
      let totalSize = 0;
      let fileCount = 0;
      let offset = 0;
      const pageSize = 100;

      // List all files in bucket with pagination
      while (true) {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list("", {
            limit: pageSize,
            offset,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (error) {
          throw new Error(
            `Failed to list files in ${bucketName}: ${error.message}`,
          );
        }

        if (!files || files.length === 0) {
          break;
        }

        files.forEach((file) => {
          if (!file.name.startsWith(".")) {
            // Ignore system files
            totalSize += file.metadata?.size || 0;
            fileCount++;
          }
        });

        // If we got fewer files than the page size, we've reached the end
        if (files.length < pageSize) {
          break;
        }

        offset += pageSize;
      }

      const usagePercent =
        this.QUOTA_PER_BUCKET > 0
          ? (totalSize / this.QUOTA_PER_BUCKET) * 100
          : 0;

      return {
        name: bucketName,
        totalSize,
        fileCount,
        usagePercent,
      };
    } catch (error) {
      console.error(`Error getting usage for bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Generate a test file of specified size
   */
  generateTestFile(sizeInMB: number): File {
    const sizeInBytes = sizeInMB * 1024 * 1024;
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks: Uint8Array[] = [];

    for (let i = 0; i < sizeInBytes; i += chunkSize) {
      const currentChunkSize = Math.min(chunkSize, sizeInBytes - i);
      const chunk = new Uint8Array(currentChunkSize);
      crypto.getRandomValues(chunk);
      chunks.push(chunk);
    }

    const blob = new Blob(chunks, { type: "application/octet-stream" });
    return new File([blob], `test-${sizeInMB}MB-${Date.now()}.bin`, {
      type: "application/octet-stream",
    });
  }

  /**
   * Upload a test file and measure performance
   */
  async uploadTestFile(
    bucketName: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<StorageMetrics> {
    const startTime = performance.now();
    const fileSize = file.size;
    const filePath = `tests/${file.name}`;

    try {
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      const uploadTime = performance.now() - startTime;
      const uploadSpeed = fileSize / (uploadTime / 1000) / 1024 / 1024; // MB/s

      // Store file path for cleanup
      if (data) {
        sessionStorage.setItem(`test-file-${Date.now()}`, filePath);
      }

      return {
        uploadSpeed: Math.round(uploadSpeed * 100) / 100,
        uploadTime: Math.round(uploadTime),
        downloadSpeed: 0,
        downloadTime: 0,
        fileSize,
      };
    } catch (error) {
      console.error("Upload test failed:", error);
      throw error;
    }
  }

  /**
   * Download a test file and measure performance
   */
  async downloadTestFile(
    bucketName: string,
    filePath: string,
  ): Promise<StorageMetrics> {
    const startTime = performance.now();

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      const downloadTime = performance.now() - startTime;
      const fileSize = data?.size || 0;
      const downloadSpeed = fileSize / (downloadTime / 1000) / 1024 / 1024; // MB/s

      return {
        uploadSpeed: 0,
        uploadTime: 0,
        downloadSpeed: Math.round(downloadSpeed * 100) / 100,
        downloadTime: Math.round(downloadTime),
        fileSize,
      };
    } catch (error) {
      console.error("Download test failed:", error);
      throw error;
    }
  }

  /**
   * Delete a test file
   */
  async deleteTestFile(bucketName: string, filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Delete test file failed:", error);
      throw error;
    }
  }

  /**
   * Clean up old test files (older than 1 hour)
   */
  async cleanupOldTestFiles(bucketName: string): Promise<number> {
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list("tests/", {
          sortBy: { column: "created_at", order: "asc" },
        });

      if (error || !files) {
        return 0;
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const filesToDelete: string[] = [];

      files.forEach((file) => {
        const createdAt = new Date(file.created_at);
        if (createdAt < oneHourAgo) {
          filesToDelete.push(`tests/${file.name}`);
        }
      });

      if (filesToDelete.length > 0) {
        await supabase.storage.from(bucketName).remove(filesToDelete);
      }

      return filesToDelete.length;
    } catch (error) {
      console.error("Cleanup failed:", error);
      return 0;
    }
  }

  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Format speed to human-readable format
   */
  formatSpeed(mbps: number): string {
    if (mbps < 1) {
      return Math.round(mbps * 1000) + " KB/s";
    }
    return Math.round(mbps * 100) / 100 + " MB/s";
  }
}

export const storageQuotaService = new StorageQuotaService();
