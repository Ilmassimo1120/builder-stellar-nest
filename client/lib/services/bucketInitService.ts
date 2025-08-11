import { supabase } from "../supabase";
import { createClient } from "@supabase/supabase-js";
import { BucketName } from "./enhancedFileStorageService";

export class BucketInitService {
  private readonly buckets: Array<{
    id: BucketName;
    name: string;
    public: boolean;
    allowedMimeTypes?: string[];
    fileSizeLimit?: number;
  }> = [
    {
      id: "product-images",
      name: "product-images",
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    },
    {
      id: "documents",
      name: "documents",
      public: false,
      allowedMimeTypes: [
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "application/zip",
        "image/jpeg",
        "image/png",
      ],
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    },
    {
      id: "quote-attachments",
      name: "quote-attachments",
      public: false,
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
      fileSizeLimit: 20 * 1024 * 1024, // 20MB
    },
  ];

  /**
   * Get service role client for admin operations
   */
  private getServiceRoleClient() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey =
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
      (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY ||
      (window as any).SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      throw new Error(
        "Service role key not found. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.",
      );
    }

    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Initialize storage buckets - creates them if they don't exist
   */
  async initializeBuckets(): Promise<{
    success: boolean;
    created: string[];
    existing: string[];
    errors: string[];
  }> {
    const result = {
      success: true,
      created: [] as string[],
      existing: [] as string[],
      errors: [] as string[],
    };

    console.log("🚀 Initializing storage buckets...");

    try {
      // Use service role client for admin operations
      const serviceClient = this.getServiceRoleClient();

      // First, check which buckets already exist
      const { data: existingBuckets, error: listError } =
        await serviceClient.storage.listBuckets();

      if (listError) {
        console.warn(
          "Warning: Could not list existing buckets:",
          listError.message,
        );
        // Continue anyway - we'll try to create and handle conflicts
      }

      const existingBucketIds = existingBuckets?.map((b) => b.id) || [];
      console.log("📋 Existing buckets:", existingBucketIds);

      // Create each bucket
      for (const bucket of this.buckets) {
        try {
          if (existingBucketIds.includes(bucket.id)) {
            console.log(`✅ Bucket '${bucket.id}' already exists`);
            result.existing.push(bucket.id);
            continue;
          }

          console.log(`🆕 Creating bucket '${bucket.id}'...`);
          const { data: createData, error: createError } =
            await serviceClient.storage.createBucket(bucket.id, {
              public: bucket.public,
              allowedMimeTypes: bucket.allowedMimeTypes,
              fileSizeLimit: bucket.fileSizeLimit,
            });

          if (createError) {
            // Check if it's just a "bucket already exists" error
            if (
              createError.message.includes("already exists") ||
              createError.message.includes("duplicate")
            ) {
              console.log(
                `✅ Bucket '${bucket.id}' already exists (from error)`,
              );
              result.existing.push(bucket.id);
            } else {
              console.error(
                `❌ Failed to create bucket '${bucket.id}':`,
                createError.message,
              );
              result.errors.push(`${bucket.id}: ${createError.message}`);
              result.success = false;
            }
          } else {
            console.log(`✅ Created bucket '${bucket.id}' successfully`);
            result.created.push(bucket.id);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ Exception creating bucket '${bucket.id}':`,
            errorMessage,
          );
          result.errors.push(`${bucket.id}: ${errorMessage}`);
          result.success = false;
        }
      }

      // Summary
      console.log("📊 Bucket initialization summary:");
      console.log(`   Created: ${result.created.length} buckets`);
      console.log(`   Existing: ${result.existing.length} buckets`);
      console.log(`   Errors: ${result.errors.length} errors`);

      if (result.errors.length > 0) {
        console.warn("⚠️ Some buckets could not be created:", result.errors);
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during bucket initialization";
      console.error("❌ Bucket initialization failed:", errorMessage);

      result.success = false;
      result.errors.push(errorMessage);
      return result;
    }
  }

  /**
   * Check if all required buckets exist
   */
  async checkBuckets(): Promise<{
    allExist: boolean;
    missing: string[];
    existing: string[];
  }> {
    try {
      const { data: existingBuckets, error } =
        await supabase.storage.listBuckets();

      if (error) {
        console.warn("Could not check buckets:", error.message);
        return {
          allExist: false,
          missing: this.buckets.map((b) => b.id),
          existing: [],
        };
      }

      const existingIds = existingBuckets?.map((b) => b.id) || [];
      const requiredIds = this.buckets.map((b) => b.id);
      const missing = requiredIds.filter((id) => !existingIds.includes(id));

      return {
        allExist: missing.length === 0,
        missing,
        existing: existingIds.filter((id) => requiredIds.includes(id)),
      };
    } catch (error) {
      console.error("Error checking buckets:", error);
      return {
        allExist: false,
        missing: this.buckets.map((b) => b.id),
        existing: [],
      };
    }
  }

  /**
   * Get bucket status for UI display
   */
  async getBucketStatus() {
    const check = await this.checkBuckets();

    return {
      ...check,
      buckets: this.buckets.map((bucket) => ({
        id: bucket.id,
        name: bucket.name,
        exists: check.existing.includes(bucket.id),
        maxSize: this.formatFileSize(bucket.fileSizeLimit || 0),
        allowedTypes: bucket.allowedMimeTypes?.length || 0,
      })),
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

export const bucketInitService = new BucketInitService();
