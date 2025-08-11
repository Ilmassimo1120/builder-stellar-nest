import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

export const createStorageBuckets: RequestHandler = async (req, res) => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Missing Supabase configuration",
        details: "VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
      });
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Define required buckets for ChargeSource
    const buckets = [
      {
        name: "charge-source-user-files",
        public: false,
        allowedMimeTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "text/csv",
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
        description: "Personal files and general documents",
      },
      {
        name: "charge-source-documents",
        public: false,
        allowedMimeTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "text/csv",
          "application/zip",
          "application/x-zip-compressed",
        ],
        fileSizeLimit: 100 * 1024 * 1024, // 100MB
        description: "Official documents, manuals, and reports",
      },
      {
        name: "charge-source-videos",
        public: false,
        allowedMimeTypes: [
          "video/mp4",
          "video/mpeg",
          "video/quicktime",
          "video/x-msvideo",
          "video/webm",
        ],
        fileSizeLimit: 500 * 1024 * 1024, // 500MB
        description: "Training videos and media content",
      },
    ];

    // Check existing buckets
    const { data: existingBuckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      return res.status(500).json({
        error: "Failed to list existing buckets",
        details: listError.message,
      });
    }

    const existingNames = existingBuckets?.map((b) => b.name) || [];
    const results = [];

    // Create missing buckets
    for (const bucket of buckets) {
      if (existingNames.includes(bucket.name)) {
        results.push({
          name: bucket.name,
          status: "exists",
          message: "Bucket already exists",
        });
        continue;
      }

      const { error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.allowedMimeTypes,
        fileSizeLimit: bucket.fileSizeLimit,
      });

      if (error) {
        if (
          error.message.includes("already exists") ||
          error.message.includes("duplicate")
        ) {
          results.push({
            name: bucket.name,
            status: "exists",
            message: "Bucket already exists",
          });
        } else {
          results.push({
            name: bucket.name,
            status: "error",
            message: error.message,
          });
        }
      } else {
        results.push({
          name: bucket.name,
          status: "created",
          message: "Bucket created successfully",
        });
      }
    }

    // Final verification
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    const finalNames = finalBuckets?.map((b) => b.name) || [];
    const requiredNames = buckets.map((b) => b.name);
    const missing = requiredNames.filter((name) => !finalNames.includes(name));

    res.json({
      success: missing.length === 0,
      message:
        missing.length === 0
          ? "All storage buckets are ready!"
          : `Missing buckets: ${missing.join(", ")}`,
      results,
      buckets: finalNames,
      missing,
    });
  } catch (error) {
    console.error("Bucket creation error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
