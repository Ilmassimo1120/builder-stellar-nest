#!/usr/bin/env node

/**
 * ChargeSource Storage Buckets Creation Script
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createBuckets() {
  console.log("🪣 ChargeSource Storage Bucket Setup");
  console.log("=====================================\n");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing required environment variables:");
    console.error("   - VITE_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  console.log("🔗 Connecting to Supabase...");
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service Key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Define required buckets
  const buckets = [
    {
      name: "product-images",
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      description: "Public product catalog images",
    },
    {
      name: "documents",
      public: false,
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/csv",
      ],
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
      description: "Private project documents and files",
    },
    {
      name: "quote-attachments",
      public: false,
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
      fileSizeLimit: 20 * 1024 * 1024, // 20MB
      description: "Private quote attachments and supporting documents",
    },
  ];

  console.log("\n📋 Required Buckets:");
  buckets.forEach((bucket) => {
    console.log(
      `   • ${bucket.name} (${bucket.public ? "Public" : "Private"}) - ${Math.round(bucket.fileSizeLimit / 1024 / 1024)}MB`,
    );
  });

  try {
    // First, check existing buckets
    console.log("\n🔍 Checking existing buckets...");
    const { data: existingBuckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const existingNames = existingBuckets?.map((b) => b.name) || [];
    console.log(
      `   Found ${existingBuckets?.length || 0} existing buckets: ${existingNames.join(", ") || "none"}`,
    );

    // Create missing buckets
    let created = 0;
    let existing = 0;
    let errors = 0;

    console.log("\n🚀 Creating buckets...");

    for (const bucket of buckets) {
      if (existingNames.includes(bucket.name)) {
        console.log(`   ✅ ${bucket.name} - Already exists`);
        existing++;
        continue;
      }

      console.log(`   🆕 Creating ${bucket.name}...`);

      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.allowedMimeTypes,
        fileSizeLimit: bucket.fileSizeLimit,
      });

      if (error) {
        if (
          error.message.includes("already exists") ||
          error.message.includes("duplicate")
        ) {
          console.log(`   ✅ ${bucket.name} - Already exists (from error)`);
          existing++;
        } else {
          console.log(`   ❌ ${bucket.name} - Failed: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`   ✅ ${bucket.name} - Created successfully`);
        created++;
      }
    }

    // Final status
    console.log("\n📊 Bucket Creation Summary:");
    console.log(`   🆕 Created: ${created} buckets`);
    console.log(`   ✅ Already existed: ${existing} buckets`);
    console.log(`   ❌ Errors: ${errors} buckets`);

    if (errors === 0) {
      console.log("\n🎉 All storage buckets are ready!");
      console.log("\n📝 Next steps:");
      console.log("   1. Test file uploads in the app");
      console.log("   2. Visit: http://localhost:8080/auth-test → Storage tab");
      console.log("   3. Try uploading a test file");
    } else {
      console.log(
        "\n⚠️  Some buckets could not be created. Check the errors above.",
      );
    }

    // Verify final state
    console.log("\n🔍 Final verification...");
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    const finalNames = finalBuckets?.map((b) => b.name) || [];
    const requiredNames = buckets.map((b) => b.name);
    const missing = requiredNames.filter((name) => !finalNames.includes(name));

    if (missing.length === 0) {
      console.log("   ✅ All required buckets verified!");
    } else {
      console.log(`   ⚠️  Still missing: ${missing.join(", ")}`);
    }
  } catch (error) {
    console.error("\n❌ Bucket creation failed:");
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// Run the script
createBuckets().catch(console.error);
