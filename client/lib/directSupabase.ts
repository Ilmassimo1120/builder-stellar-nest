import { createClient } from "@supabase/supabase-js";

import { createClient } from "@supabase/supabase-js";
import { safeGetLocal } from "./safeLocalStorage";

// Direct Supabase client that bypasses environment checks
// This is specifically for testing the storage functionality

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration");
}

// Create a direct client without environment restrictions
export const directSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Simple authentication function for testing
export const testLogin = async (email: string) => {
  // For testing, we'll create a mock session
  const testUser = {
    id: crypto.randomUUID(),
    email: email,
    aud: "authenticated",
    role: "authenticated",
    user_metadata: {},
    app_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Store user in localStorage for persistence
  localStorage.setItem("directSupabaseUser", JSON.stringify(testUser));

  return testUser;
};

export const testLogout = () => {
  localStorage.removeItem("directSupabaseUser");
};

export const getTestUser = () => {
  const stored = localStorage.getItem("directSupabaseUser");
  return stored ? JSON.parse(stored) : null;
};

// Test if buckets are accessible
export const testBucketAccess = async () => {
  try {
    console.log("Testing bucket access with direct client...");
    const { data, error } = await directSupabase.storage.listBuckets();

    console.log("Direct bucket test result:", { data, error });

    if (error) {
      return { success: false, error: error.message, buckets: [] };
    }

    const bucketNames = data?.map((b) => b.name) || [];
    const requiredBuckets = [
      "charge-source-user-files",
      "charge-source-documents",
      "charge-source-videos",
    ];
    const foundBuckets = requiredBuckets.filter((name) =>
      bucketNames.includes(name),
    );

    return {
      success: true,
      buckets: bucketNames,
      foundRequired: foundBuckets,
      missingRequired: requiredBuckets.filter(
        (name) => !bucketNames.includes(name),
      ),
    };
  } catch (err) {
    console.error("Direct bucket test error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      buckets: [],
    };
  }
};

// Test file upload
export const testFileUpload = async (
  file: File,
  bucket: string = "charge-source-documents",
) => {
  try {
    const user = getTestUser();
    if (!user) {
      return { success: false, error: "No test user logged in" };
    }

    const filename = `${Date.now()}-${file.name}`;
    const uploadPath = `${user.id}/${filename}`;

    console.log(
      `Testing file upload to bucket: ${bucket}, path: ${uploadPath}`,
    );

    const { data, error } = await directSupabase.storage
      .from(bucket)
      .upload(uploadPath, file, {
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        path: data.path,
        fullPath: data.fullPath || uploadPath,
        bucket: bucket,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

// Test file listing
export const testFileList = async (
  bucket: string = "charge-source-documents",
) => {
  try {
    const user = getTestUser();
    if (!user) {
      return { success: false, error: "No test user logged in", files: [] };
    }

    console.log(`Testing file list for bucket: ${bucket}, user: ${user.id}`);

    const { data, error } = await directSupabase.storage
      .from(bucket)
      .list(user.id, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return { success: false, error: error.message, files: [] };
    }

    // Get signed URLs for files
    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const filePath = `${user.id}/${file.name}`;
        const { data: urlData } = await directSupabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600);

        return {
          ...file,
          signedUrl: urlData?.signedUrl,
          fullPath: filePath,
          bucket: bucket,
        };
      }),
    );

    return {
      success: true,
      files: filesWithUrls,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      files: [],
    };
  }
};
