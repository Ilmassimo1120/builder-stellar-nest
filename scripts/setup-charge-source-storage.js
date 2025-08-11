#!/usr/bin/env node

/**
 * ChargeSource Document Storage Setup Script
 * Creates the required storage buckets and database tables for document management
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setupChargeSourceStorage() {
  console.log("🗂️ ChargeSource Document Storage Setup");
  console.log("=====================================\n");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing required environment variables:");
    console.error("   - VITE_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    console.log("\n📝 Add these to your .env file or use DevServerControl to set them.");
    process.exit(1);
  }

  console.log("🔗 Connecting to Supabase...");
  console.log(`📍 URL: ${SUPABASE_URL}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Define required buckets for ChargeSource document storage
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
        "image/webp"
      ],
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
      description: "Personal files and general documents for users"
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
        "application/x-zip-compressed"
      ],
      fileSizeLimit: 100 * 1024 * 1024, // 100MB
      description: "Official documents, manuals, and reports"
    },
    {
      name: "charge-source-videos",
      public: false,
      allowedMimeTypes: [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm"
      ],
      fileSizeLimit: 500 * 1024 * 1024, // 500MB
      description: "Training videos and media content"
    }
  ];

  console.log("\n📋 Required Buckets:");
  buckets.forEach(bucket => {
    console.log(`   • ${bucket.name} (Private) - ${Math.round(bucket.fileSizeLimit / 1024 / 1024)}MB max`);
  });

  try {
    // Step 1: Create Storage Buckets
    console.log("\n🔍 Checking existing buckets...");
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const existingNames = existingBuckets?.map(b => b.name) || [];
    console.log(`   Found ${existingBuckets?.length || 0} existing buckets: ${existingNames.join(', ') || 'none'}`);

    let created = 0;
    let existing = 0;
    let errors = 0;

    console.log("\n🚀 Creating storage buckets...");
    
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
        fileSizeLimit: bucket.fileSizeLimit
      });

      if (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
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

    // Step 2: Create Database Tables for Document Metadata
    console.log("\n🗃️ Creating database tables...");
    
    const createDocumentMetadataTable = `
      CREATE TABLE IF NOT EXISTS document_metadata (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        organization_id UUID DEFAULT NULL,
        bucket_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type TEXT NOT NULL,
        category TEXT DEFAULT 'uncategorized',
        tags TEXT[] DEFAULT '{}',
        description TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
        version INTEGER DEFAULT 1,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        approved_by UUID REFERENCES auth.users(id) DEFAULT NULL,
        approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        UNIQUE(bucket_name, file_path)
      );
    `;

    const createDocumentVersionsTable = `
      CREATE TABLE IF NOT EXISTS document_versions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        document_id UUID REFERENCES document_metadata(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        change_notes TEXT,
        UNIQUE(document_id, version_number)
      );
    `;

    const createRLSPolicies = `
      -- Enable RLS
      ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
      ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

      -- Document metadata policies
      CREATE POLICY "Users can view their own documents" ON document_metadata
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own documents" ON document_metadata
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own documents" ON document_metadata
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own documents" ON document_metadata
        FOR DELETE USING (auth.uid() = user_id);

      -- Document versions policies
      CREATE POLICY "Users can view versions of their documents" ON document_versions
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM document_metadata 
            WHERE id = document_versions.document_id 
            AND user_id = auth.uid()
          )
        );
      
      CREATE POLICY "Users can create versions of their documents" ON document_versions
        FOR INSERT WITH CHECK (
          auth.uid() = created_by AND
          EXISTS (
            SELECT 1 FROM document_metadata 
            WHERE id = document_versions.document_id 
            AND user_id = auth.uid()
          )
        );
    `;

    const createIndexes = `
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_document_metadata_user_id ON document_metadata(user_id);
      CREATE INDEX IF NOT EXISTS idx_document_metadata_organization_id ON document_metadata(organization_id);
      CREATE INDEX IF NOT EXISTS idx_document_metadata_bucket_name ON document_metadata(bucket_name);
      CREATE INDEX IF NOT EXISTS idx_document_metadata_status ON document_metadata(status);
      CREATE INDEX IF NOT EXISTS idx_document_metadata_category ON document_metadata(category);
      CREATE INDEX IF NOT EXISTS idx_document_metadata_created_at ON document_metadata(created_at);
      CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
    `;

    const createUpdateTrigger = `
      -- Create updated_at trigger
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_document_metadata_updated_at ON document_metadata;
      CREATE TRIGGER update_document_metadata_updated_at
        BEFORE UPDATE ON document_metadata
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute database setup
    const dbQueries = [
      { name: "Document metadata table", query: createDocumentMetadataTable },
      { name: "Document versions table", query: createDocumentVersionsTable },
      { name: "RLS policies", query: createRLSPolicies },
      { name: "Database indexes", query: createIndexes },
      { name: "Update trigger", query: createUpdateTrigger }
    ];

    for (const { name, query } of dbQueries) {
      console.log(`   🏗️ Creating ${name}...`);
      const { error: dbError } = await supabase.rpc('exec_sql', { sql: query });
      
      if (dbError) {
        console.log(`   ⚠️ ${name} - ${dbError.message}`);
      } else {
        console.log(`   ✅ ${name} - Created successfully`);
      }
    }

    // Final status
    console.log("\n📊 Setup Summary:");
    console.log(`   🪣 Buckets created: ${created}`);
    console.log(`   🪣 Buckets already existed: ${existing}`);
    console.log(`   ❌ Bucket errors: ${errors}`);
    console.log(`   🗃️ Database tables: Created`);

    if (errors === 0) {
      console.log("\n🎉 ChargeSource document storage is ready!");
      console.log("\n📝 Next steps:");
      console.log("   1. Test file uploads in the app");
      console.log("   2. Visit: /enhanced-file-storage");
      console.log("   3. Try uploading documents to different buckets");
      console.log("   4. Check the Documents tab for uploaded files");
    } else {
      console.log("\n⚠️  Some buckets could not be created. Check the errors above.");
    }

    // Verify final state
    console.log("\n🔍 Final verification...");
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    const finalNames = finalBuckets?.map(b => b.name) || [];
    const requiredNames = buckets.map(b => b.name);
    const missing = requiredNames.filter(name => !finalNames.includes(name));
    
    if (missing.length === 0) {
      console.log("   ✅ All required buckets verified!");
    } else {
      console.log(`   ⚠️  Still missing: ${missing.join(', ')}`);
    }

  } catch (error) {
    console.error("\n❌ Setup failed:");
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// Run the script
setupChargeSourceStorage().catch(console.error);
