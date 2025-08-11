# Manual Storage Bucket Creation Guide

## ❌ Problem
SQL scripts cannot create storage buckets in Supabase. You need to create them manually through the dashboard.

## ✅ Solution: Manual Bucket Creation

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in the left sidebar

### Step 2: Create Each Bucket
Click **"New bucket"** and create these 3 buckets:

#### Bucket 1: charge-source-user-files
- **Name**: `charge-source-user-files`
- **Public**: ❌ **UNCHECKED** (Private)
- **Allowed MIME types**: Leave empty (will allow all)
- **File size limit**: 50MB

#### Bucket 2: charge-source-documents  
- **Name**: `charge-source-documents`
- **Public**: ❌ **UNCHECKED** (Private)
- **Allowed MIME types**: Leave empty (will allow all)
- **File size limit**: 100MB

#### Bucket 3: charge-source-videos
- **Name**: `charge-source-videos` 
- **Public**: ❌ **UNCHECKED** (Private)
- **Allowed MIME types**: Leave empty (will allow all)
- **File size limit**: 500MB

### Step 3: Verify Creation
After creating all 3 buckets, you should see them listed in your Storage dashboard.

### Step 4: Test
Go back to your DocumentTest page and click "Check Status" - all should show green checkmarks.

## 🎯 Quick Checklist
- [ ] charge-source-user-files (Private, 50MB)
- [ ] charge-source-documents (Private, 100MB)  
- [ ] charge-source-videos (Private, 500MB)
- [ ] All buckets are **PRIVATE** (unchecked public)
- [ ] Click "Check Status" to verify
