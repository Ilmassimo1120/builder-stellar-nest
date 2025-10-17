import {
  enhancedFileStorageService,
  FileAsset,
  SearchFilters,
  BucketName,
} from "./enhancedFileStorageService";
import { supabase } from "../supabase";
import { safeGetLocal } from "../safeLocalStorage";

/**
 * Safe wrapper around enhanced file storage service with comprehensive error handling
 * This service ensures no [object Object] errors reach the UI
 */
class SafeFileStorageService {
  private formatError(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      // Handle network/fetch errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return "Network connection failed. Please check your internet connection and try again.";
      }
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object") {
      // Handle fetch/network errors
      if ("name" in error && error.name === "TypeError") {
        return "Network connection failed. Please check your internet connection and try again.";
      }
      // Handle Supabase error format
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
      // Handle other error objects safely
      try {
        const errorStr = JSON.stringify(error);
        if (errorStr !== "{}") {
          return `Connection error: ${errorStr}`;
        }
      } catch {
        // JSON.stringify failed, fall back to default
      }
    }
    return defaultMessage;
  }

  private async checkAuthentication(): Promise<{
    authenticated: boolean;
    user: any | null;
    error: string | null;
  }> {
    // Check local auth first (primary system)
    try {
      const storedUser = safeGetLocal("chargeSourceUser", null);
      if (storedUser) {
        return {
          authenticated: true,
          user: { id: storedUser.id, email: storedUser.email },
          error: null,
        };
      }
    } catch (error) {
      console.warn("Local auth check failed:", error);
    }

    // Fallback to Supabase auth if local auth not available
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        return {
          authenticated: false,
          user: null,
          error: this.formatError(error, "Authentication error"),
        };
      }
      if (!user) {
        return {
          authenticated: false,
          user: null,
          error: "No authenticated user",
        };
      }
      return { authenticated: true, user, error: null };
    } catch (error) {
      return {
        authenticated: false,
        user: null,
        error: this.formatError(error, "Authentication check failed"),
      };
    }
  }

  async searchFiles(
    filters: SearchFilters = {},
  ): Promise<{ files: FileAsset[]; error: string | null }> {
    try {
      const authCheck = await this.checkAuthentication();
      if (!authCheck.authenticated) {
        console.log("Search blocked - not authenticated:", authCheck.error);
        return { files: [], error: null }; // Return empty results, not an error
      }

      const files = await enhancedFileStorageService.searchFiles(filters);
      return { files, error: null };
    } catch (error) {
      const errorMessage = this.formatError(error, "Search failed");
      console.error("Safe search error:", errorMessage, error);
      return { files: [], error: errorMessage };
    }
  }

  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
    bucketBreakdown: Partial<Record<BucketName, { files: number; size: number }>>;
    categoryBreakdown: Record<string, { files: number; size: number }>;
    error: string | null;
  }> {
    try {
      const authCheck = await this.checkAuthentication();
      if (!authCheck.authenticated) {
        console.log(
          "Storage usage blocked - not authenticated:",
          authCheck.error,
        );
        // Return empty stats instead of error
        return {
          totalFiles: 0,
          totalSize: 0,
          bucketBreakdown: {
            "charge-source-user-files": { files: 0, size: 0 },
            "charge-source-documents": { files: 0, size: 0 },
            "charge-source-videos": { files: 0, size: 0 },
          },
          categoryBreakdown: {},
          error: null,
        };
      }

      const usage = await enhancedFileStorageService.getStorageUsage();
      return { ...usage, error: null };
    } catch (error) {
      const errorMessage = this.formatError(
        error,
        "Failed to get storage usage",
      );
      console.error("Safe storage usage error:", errorMessage, error);
      return {
        totalFiles: 0,
        totalSize: 0,
        bucketBreakdown: {
          "charge-source-user-files": { files: 0, size: 0 },
          "charge-source-documents": { files: 0, size: 0 },
          "charge-source-videos": { files: 0, size: 0 },
        },
        categoryBreakdown: {},
        error: errorMessage,
      };
    }
  }

  async getAsset(
    assetId: string,
  ): Promise<{ asset: FileAsset | null; error: string | null }> {
    try {
      const authCheck = await this.checkAuthentication();
      if (!authCheck.authenticated) {
        return { asset: null, error: "Authentication required" };
      }

      const asset = await enhancedFileStorageService.getAsset(assetId);
      return { asset, error: null };
    } catch (error) {
      const errorMessage = this.formatError(error, "Failed to get asset");
      console.error("Safe get asset error:", errorMessage, error);
      return { asset: null, error: errorMessage };
    }
  }

  async downloadFile(
    assetId: string,
  ): Promise<{ blob: Blob | null; error: string | null }> {
    try {
      const authCheck = await this.checkAuthentication();
      if (!authCheck.authenticated) {
        return { blob: null, error: "Authentication required" };
      }

      const blob = await enhancedFileStorageService.downloadFile(assetId);
      return { blob, error: null };
    } catch (error) {
      const errorMessage = this.formatError(error, "Download failed");
      console.error("Safe download error:", errorMessage, error);
      return { blob: null, error: errorMessage };
    }
  }

  async getSignedUrl(
    assetId: string,
    expiresIn: number = 3600,
  ): Promise<{ url: string | null; error: string | null }> {
    try {
      const authCheck = await this.checkAuthentication();
      if (!authCheck.authenticated) {
        return { url: null, error: "Authentication required" };
      }

      const url = await enhancedFileStorageService.getSignedUrl(
        assetId,
        expiresIn,
      );
      return { url, error: null };
    } catch (error) {
      const errorMessage = this.formatError(error, "Failed to get signed URL");
      console.error("Safe signed URL error:", errorMessage, error);
      return { url: null, error: errorMessage };
    }
  }

  // Pass through other methods with basic error handling
  async deleteAsset(
    assetId: string,
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const authCheck = await this.checkAuthentication();
      if (!authCheck.authenticated) {
        return { success: false, error: "Authentication required" };
      }

      const success = await enhancedFileStorageService.deleteAsset(assetId);
      return { success, error: null };
    } catch (error) {
      const errorMessage = this.formatError(error, "Delete failed");
      console.error("Safe delete error:", errorMessage, error);
      return { success: false, error: errorMessage };
    }
  }

  // For backwards compatibility, expose the original service for advanced usage
  get originalService() {
    return enhancedFileStorageService;
  }
}

export const safeFileStorageService = new SafeFileStorageService();
export default safeFileStorageService;
