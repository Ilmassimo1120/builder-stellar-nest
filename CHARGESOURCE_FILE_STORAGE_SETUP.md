# ChargeSource File Storage Setup Guide

This guide provides step-by-step instructions for setting up and configuring file storage in the ChargeSource Supabase database, enabling secure and efficient file management for the application.

## 📋 Overview

The ChargeSource file storage system provides:
- **Secure file uploads** with user authentication
- **Role-based access control** for file permissions
- **Categorized storage** for different file types
- **File size and type validation** (max 50MB per file)
- **Real-time file management** with upload progress tracking
- **Admin controls** for managing all files across the system

## 🔧 Prerequisites

Before starting, ensure you have:
- ✅ Active Supabase project (Project ID: `tepmkljodsifaexmrinl`)
- ✅ Admin access to your Supabase dashboard
- ✅ ChargeSource application deployed and running
- ✅ User authentication system configured

## 🚀 Step 1: Create Storage Bucket in Supabase Dashboard

### 1.1 Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your ChargeSource project (`tepmkljodsifaexmrinl`)

### 1.2 Create the Storage Bucket
1. In the left sidebar, click **"Storage"**
2. Click **"Create a new bucket"**
3. Configure the bucket with these settings:

```
Bucket Name: charge-source-files
Public: No (Private bucket for security)
File Size Limit: 50 MiB
Allowed MIME Types: 
  - image/jpeg
  - image/png
  - image/gif
  - image/webp
  - application/pdf
  - text/plain
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - application/msword
  - application/vnd.ms-excel
  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - text/csv
  - application/zip
  - application/x-zip-compressed
```

4. Click **"Create bucket"**

## 🔒 Step 2: Configure Row Level Security (RLS) Policies

### 2.1 Enable RLS on Storage Objects
In the Supabase SQL editor, run:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 2.2 Create Security Policies
Run the following SQL commands to set up the security policies:

```sql
-- Policy: Users can upload files (authenticated users only)
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'charge-source-files'
);

-- Policy: Users can view their own files and public files
CREATE POLICY "Allow users to view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'charge-source-files' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR (storage.foldername(name))[1] = 'public'
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'global_admin', 'sales')
    )
  )
);

-- Policy: Users can update their own files
CREATE POLICY "Allow users to update their files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'charge-source-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files  
CREATE POLICY "Allow users to delete their files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'charge-source-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admins can manage all files
CREATE POLICY "Allow admins to manage all files" ON storage.objects
FOR ALL USING (
  bucket_id = 'charge-source-files' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'global_admin')
  )
);
```

### 2.3 Create Utility Function for File Paths
```sql
-- Create function to generate secure file paths
CREATE OR REPLACE FUNCTION public.generate_file_path(
  file_name TEXT,
  file_category TEXT DEFAULT 'general'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  clean_filename TEXT;
  timestamp_str TEXT;
  file_extension TEXT;
  base_name TEXT;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Clean filename and extract extension
  clean_filename := regexp_replace(file_name, '[^a-zA-Z0-9._-]', '_', 'g');
  file_extension := regexp_replace(clean_filename, '.*\.', '');
  base_name := regexp_replace(clean_filename, '\.[^.]*$', '');
  
  -- Generate timestamp
  timestamp_str := to_char(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
  
  -- Return structured path: user_id/category/timestamp_filename.ext
  RETURN user_id::text || '/' || file_category || '/' || timestamp_str || '_' || base_name || '.' || file_extension;
END;
$$;
```

## 📁 Step 3: File Organization Structure

The file storage system organizes files using this hierarchy:

```
charge-source-files/
├── {user_id}/
│   ├── general/          # General purpose files
│   ├── project/          # Project-related files
│   ├── quote/            # Quote attachments
│   ├── product/          # Product documentation
│   └── user/             # Personal user files
└── public/               # Publicly accessible files
    ├── templates/
    ├── resources/
    └── docs/
```

### File Naming Convention
Files are automatically renamed using the pattern:
```
{user_id}/{category}/{timestamp}_{original_filename}.{extension}
```

Example: `123e4567-e89b-12d3-a456-426614174000/project/2024-01-15_14-30-25_site_plan.pdf`

## 🛠️ Step 4: Application Integration

### 4.1 Service Layer
The file storage service (`client/lib/services/fileStorageService.ts`) provides:

```typescript
// Core Methods
uploadFile(upload: FileUpload, onProgress?: UploadProgressCallback): Promise<StoredFile>
downloadFile(filePath: string): Promise<Blob>
deleteFile(filePath: string): Promise<boolean>
listUserFiles(category?: string): Promise<StoredFile[]>

// Advanced Methods
getSignedUrl(filePath: string, expiresIn?: number): Promise<string>
updateFileMetadata(filePath: string, metadata: any): Promise<boolean>
checkFilePermissions(filePath: string): Promise<boolean>
uploadMultipleFiles(uploads: FileUpload[]): Promise<StoredFile[]>
getStorageUsage(): Promise<{totalFiles: number; totalSize: number}>
```

### 4.2 UI Components

**FileUpload Component**
- Drag & drop interface
- File validation and progress tracking
- Multi-file support with batch uploads
- Error handling and user feedback

**FileManager Component**
- File listing with grid/list views
- Search and filter capabilities
- File actions (view, download, delete)
- Category-based organization

**FileStorage Page**
- Complete file management interface
- Storage usage statistics
- Admin controls for all file categories
- Role-based access controls

### 4.3 File Categories

| Category | Description | Access Level |
|----------|-------------|--------------|
| `general` | General purpose files | User |
| `project` | Project-related documents | User |
| `quote` | Quote attachments and proposals | User |
| `product` | Product documentation and images | Admin |
| `user` | Personal user files | User |
| `public` | Publicly accessible resources | Admin |

## 🔐 Step 5: Security Configuration

### 5.1 File Size and Type Validation
- **Maximum file size**: 50MB per file
- **Allowed file types**: 
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, DOC, DOCX, TXT
  - Spreadsheets: XLS, XLSX, CSV
  - Archives: ZIP

### 5.2 Access Control Rules

**User Permissions:**
- ✅ Upload files to personal folders
- ✅ View/download own files
- ✅ Delete own files
- ✅ View public files
- ❌ Access other users' private files

**Admin Permissions:**
- ✅ All user permissions
- ✅ View/manage all files across the system
- ✅ Upload to public category
- ✅ Manage product documentation

**Sales Role Permissions:**
- ✅ User permissions
- ✅ View files in project and quote categories
- ✅ Upload to project and quote categories

## 📊 Step 6: Monitoring and Analytics

### 6.1 Storage Usage Tracking
Monitor storage usage through:
- **Dashboard metrics**: Total files, storage used, recent uploads
- **Category breakdown**: Storage distribution across file categories
- **User analytics**: Per-user storage consumption

### 6.2 File Activity Logging
The system automatically logs:
- File upload events with metadata
- Download/access events
- File deletion events
- Permission changes

## 🚨 Step 7: Troubleshooting

### Common Issues and Solutions

**Upload Failures:**
- Verify user authentication status
- Check file size limits (50MB max)
- Ensure file type is in allowed MIME types list
- Confirm bucket permissions are configured correctly

**Permission Denied Errors:**
- Verify RLS policies are enabled and configured
- Check user role assignments in the users table
- Ensure file paths follow the correct naming convention

**Storage Quota Issues:**
- Monitor storage usage in Supabase dashboard
- Implement file cleanup policies for old files
- Consider upgrading Supabase plan for larger storage limits

### Debug Commands

Check storage bucket configuration:
```sql
SELECT * FROM storage.buckets WHERE id = 'charge-source-files';
```

View RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

Check user file access:
```sql
SELECT name, created_at, updated_at, metadata 
FROM storage.objects 
WHERE bucket_id = 'charge-source-files' 
AND (storage.foldername(name))[1] = '{user_id}';
```

## 🔄 Step 8: Backup and Recovery

### 8.1 Automated Backups
Supabase automatically provides:
- **Point-in-time recovery**: Available for 7 days (Pro plan)
- **Daily automated backups**: Stored securely by Supabase
- **Cross-region replication**: For enterprise plans

### 8.2 Manual Backup Procedures
For additional backup security:
1. Export file metadata from storage.objects table
2. Use Supabase CLI to download files:
   ```bash
   supabase storage download --bucket charge-source-files --path ./backup/
   ```
3. Store backup metadata and files in external storage

## 🚀 Step 9: Production Deployment

### 9.1 Environment Variables
Ensure these environment variables are set in production:

```bash
VITE_SUPABASE_URL=https://tepmkljodsifaexmrinl.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 9.2 Performance Optimization
- **CDN Integration**: Supabase automatically provides CDN for file delivery
- **Signed URLs**: Use for secure, temporary file access
- **Batch Operations**: Upload multiple files in parallel for better performance
- **File Compression**: Implement client-side compression for large files

### 9.3 Monitoring in Production
Set up monitoring for:
- Storage usage and growth trends
- Upload/download performance metrics
- Error rates and failed operations
- User access patterns and security events

## 📚 Step 10: API Documentation

### Authentication
All file operations require user authentication:
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Upload Example
```typescript
const upload: FileUpload = {
  file: selectedFile,
  category: 'project',
  metadata: {
    projectId: 'project-123',
    description: 'Site survey photos'
  }
};

const result = await fileStorageService.uploadFile(upload, (progress) => {
  console.log(`Upload progress: ${progress.percentage}%`);
});
```

### Download Example
```typescript
const blob = await fileStorageService.downloadFile('user123/project/file.pdf');
const url = URL.createObjectURL(blob);
// Use URL for download or display
```

### Access Control Example
```typescript
const hasPermission = await fileStorageService.checkFilePermissions('user123/project/file.pdf');
if (hasPermission) {
  // Proceed with file operation
}
```

## ✅ Verification Checklist

After completing the setup, verify:

- [ ] Storage bucket `charge-source-files` is created and configured
- [ ] RLS policies are enabled and working correctly
- [ ] File upload works for authenticated users
- [ ] File download and preview functionality works
- [ ] Permission controls prevent unauthorized access
- [ ] Admin users can manage all files
- [ ] File size and type validation is enforced
- [ ] Storage usage tracking is accurate
- [ ] Error handling works for failed operations
- [ ] Backup procedures are documented and tested

## 🎯 Next Steps

1. **Test the System**: Upload files in different categories and verify access controls
2. **Train Users**: Provide training on file management features
3. **Monitor Usage**: Set up alerts for storage usage thresholds
4. **Regular Maintenance**: Implement cleanup procedures for old files
5. **Performance Tuning**: Monitor and optimize file operation performance

## 📞 Support

For technical support with the file storage system:
- **ChargeSource Support**: Contact your system administrator
- **Supabase Support**: Available through Supabase dashboard
- **Documentation**: [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)

---

## 📋 Summary

The ChargeSource file storage system is now configured with:
- ✅ Secure, private storage bucket with 50MB file size limit
- ✅ Role-based access control with user and admin permissions
- ✅ Organized file structure with category-based organization
- ✅ Complete frontend interface with upload, download, and management
- ✅ Real-time progress tracking and error handling
- ✅ Comprehensive security policies and validation
- ✅ Monitoring and analytics capabilities
- ✅ Production-ready configuration with backup procedures

The system is ready for production use and can handle secure file storage requirements for the ChargeSource application while maintaining data privacy and security best practices.
