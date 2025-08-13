import { supabase } from "../supabase";
import { directSupabase } from "../directSupabase";

export interface FixResult {
  success: boolean;
  message: string;
  details?: string;
  action?: string;
}

class ConnectionFixService {
  /**
   * Automatically try to fix storage bucket issues by creating missing buckets
   */
  async createMissingBuckets(): Promise<FixResult> {
    try {
      console.log("🔧 Attempting to create missing storage buckets...");

      const requiredBuckets = [
        "charge-source-user-files",
        "charge-source-documents",
        "charge-source-videos",
      ];

      // First, check which buckets exist
      const { data: existingBuckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        return {
          success: false,
          message: "Failed to list existing buckets",
          details: listError.message,
          action: "Check Supabase connection and permissions",
        };
      }

      const existingBucketNames = existingBuckets?.map((b) => b.name) || [];
      const missingBuckets = requiredBuckets.filter(
        (name) => !existingBucketNames.includes(name),
      );

      if (missingBuckets.length === 0) {
        return {
          success: true,
          message: "All required buckets already exist",
          details: `Found: ${existingBucketNames.join(", ")}`,
        };
      }

      // Try to create missing buckets (this may fail due to permissions)
      const createResults = [];
      for (const bucketName of missingBuckets) {
        try {
          const { data, error } = await supabase.storage.createBucket(
            bucketName,
            {
              public: false,
              allowedMimeTypes: ["image/*", "application/pdf", "video/*"],
              fileSizeLimit: 50 * 1024 * 1024, // 50MB
            },
          );

          if (error) {
            createResults.push({
              bucket: bucketName,
              success: false,
              error: error.message,
            });
          } else {
            createResults.push({ bucket: bucketName, success: true });
          }
        } catch (err) {
          createResults.push({
            bucket: bucketName,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      const successfulCreations = createResults.filter((r) => r.success);
      const failedCreations = createResults.filter((r) => !r.success);

      if (successfulCreations.length > 0 && failedCreations.length === 0) {
        return {
          success: true,
          message: `Successfully created ${successfulCreations.length} missing buckets`,
          details: successfulCreations.map((r) => r.bucket).join(", "),
        };
      } else if (successfulCreations.length > 0) {
        return {
          success: true,
          message: `Partially successful: created ${successfulCreations.length} buckets`,
          details: `Created: ${successfulCreations.map((r) => r.bucket).join(", ")}. Failed: ${failedCreations.map((r) => r.bucket).join(", ")}`,
          action: "Check Supabase dashboard for failed bucket creations",
        };
      } else {
        return {
          success: false,
          message: "Failed to create any buckets",
          details: failedCreations
            .map((r) => `${r.bucket}: ${r.error}`)
            .join("; "),
          action: "Create buckets manually in Supabase dashboard",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Bucket creation process failed",
        details: error instanceof Error ? error.message : "Unknown error",
        action: "Check Supabase connection and service role permissions",
      };
    }
  }

  /**
   * Test if CORS issues can be resolved by making a simple request
   */
  async testCorsConfiguration(): Promise<FixResult> {
    try {
      console.log("🔧 Testing CORS configuration...");

      // Try a simple request that would fail with CORS issues
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("CORS") ||
          error.message.includes("blocked by CORS policy")
        ) {
          return {
            success: false,
            message: "CORS configuration issue detected",
            details: error.message,
            action:
              "Add your domain to Supabase CORS origins in Dashboard → Settings → API",
          };
        } else {
          return {
            success: true,
            message: "CORS appears to be configured correctly",
            details: "Request completed without CORS errors",
          };
        }
      }

      return {
        success: true,
        message: "CORS configuration test passed",
        details: "No CORS-related errors detected",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("CORS") ||
        errorMessage.includes("blocked by CORS policy")
      ) {
        return {
          success: false,
          message: "CORS blocking detected",
          details: errorMessage,
          action: "Configure CORS origins in Supabase dashboard",
        };
      }

      return {
        success: false,
        message: "Connection test failed",
        details: errorMessage,
        action: "Check network connectivity and Supabase configuration",
      };
    }
  }

  /**
   * Validate environment variables and configuration
   */
  async validateEnvironmentConfiguration(): Promise<FixResult> {
    try {
      console.log("🔧 Validating environment configuration...");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const issues = [];

      if (!supabaseUrl) {
        issues.push("VITE_SUPABASE_URL is not set");
      } else if (
        supabaseUrl.includes("your-project") ||
        supabaseUrl.includes("localhost")
      ) {
        issues.push("VITE_SUPABASE_URL contains placeholder value");
      }

      if (!supabaseAnonKey) {
        issues.push("VITE_SUPABASE_ANON_KEY is not set");
      } else if (
        supabaseAnonKey.includes("your-anon-key") ||
        supabaseAnonKey.length < 100
      ) {
        issues.push("VITE_SUPABASE_ANON_KEY appears to be invalid");
      }

      // Test URL format
      if (supabaseUrl) {
        try {
          const url = new URL(supabaseUrl);
          if (!url.hostname.includes("supabase.co")) {
            issues.push(
              "VITE_SUPABASE_URL does not appear to be a valid Supabase URL",
            );
          }
        } catch {
          issues.push("VITE_SUPABASE_URL is not a valid URL");
        }
      }

      if (issues.length > 0) {
        return {
          success: false,
          message: `Found ${issues.length} configuration issues`,
          details: issues.join("; "),
          action:
            "Update environment variables in .env file or deployment settings",
        };
      }

      return {
        success: true,
        message: "Environment configuration is valid",
        details: `URL: ${supabaseUrl}, Key length: ${supabaseAnonKey?.length || 0} characters`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to validate environment configuration",
        details: error instanceof Error ? error.message : "Unknown error",
        action: "Check environment variable setup",
      };
    }
  }

  /**
   * Test basic connectivity to external services
   */
  async testNetworkConnectivity(): Promise<FixResult> {
    try {
      console.log("🔧 Testing network connectivity...");

      // Test connectivity to a simple external service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("https://httpbin.org/get", {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          success: true,
          message: "Network connectivity is working",
          details: `Response status: ${response.status}`,
        };
      } else {
        return {
          success: false,
          message: "Network connectivity issues detected",
          details: `HTTP ${response.status} - ${response.statusText}`,
          action: "Check firewall settings and internet connection",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("aborted")) {
        return {
          success: false,
          message: "Network request timed out",
          details: "Request took longer than 5 seconds",
          action: "Check internet connection speed and stability",
        };
      }

      return {
        success: false,
        message: "Network connectivity test failed",
        details: errorMessage,
        action: "Check internet connection and DNS settings",
      };
    }
  }

  /**
   * Run all automated fixes
   */
  async runAllFixes(): Promise<FixResult[]> {
    console.log("🔧 Running all automated connection fixes...");

    const results = await Promise.allSettled([
      this.validateEnvironmentConfiguration(),
      this.testNetworkConnectivity(),
      this.testCorsConfiguration(),
      this.createMissingBuckets(),
    ]);

    return results.map((result, index) => {
      const testNames = [
        "Environment Configuration",
        "Network Connectivity",
        "CORS Configuration",
        "Storage Buckets",
      ];

      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          success: false,
          message: `${testNames[index]} fix failed`,
          details:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
          action: "Check logs for more details",
        };
      }
    });
  }

  /**
   * Get user-friendly recommendations based on fix results
   */
  getRecommendations(fixResults: FixResult[]): string[] {
    const recommendations = [];

    fixResults.forEach((result) => {
      if (!result.success && result.action) {
        recommendations.push(result.action);
      }
    });

    // Add general recommendations
    if (fixResults.some((r) => !r.success)) {
      recommendations.push(
        "Check the Supabase project dashboard for any service outages",
      );
      recommendations.push(
        "Verify your Supabase project is active and not paused",
      );
      recommendations.push("Ensure your API keys have not expired");
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

export const connectionFixService = new ConnectionFixService();
