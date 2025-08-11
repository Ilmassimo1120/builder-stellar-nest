# ChargeSource Document Storage Integration Guide

## Overview

Your ChargeSource app now has a fully functional document storage system that supports:

- ✅ **User and Organization File Management**: Upload files for specific users or organizations
- ✅ **Three Storage Buckets**: User files (50MB), Documents (100MB), Videos (500MB)
- ✅ **Secure Edge Functions**: Authentication-protected upload, list, and delete operations
- ✅ **Metadata Tracking**: Database tables for document metadata, versioning, and approval workflows
- ✅ **Category Organization**: Categorize documents (manuals, reports, specifications, etc.)
- ✅ **Status Management**: Draft, pending approval, approved, rejected, archived

## Architecture

### Storage Buckets

```
charge-source-user-files     - Personal files (50MB max)
charge-source-documents      - Official documents (100MB max)
charge-source-videos         - Training videos (500MB max)
```

### File Path Structure

```
User files:         ${user.id}/${filename}
Organization files: ${organizationId}/${filename}
```

### Edge Functions

```
POST /api/functions/secure-file-upload   - Upload documents
GET  /api/functions/secure-file-list     - List user/org documents
DELETE /api/functions/secure-file-delete - Delete documents
```

### Database Tables

```sql
document_metadata    - File metadata, categories, status, descriptions
document_versions    - Version history and change tracking
```

## Integration Steps

### 1. Set Up Storage (Already Done!)

The storage buckets and database tables are ready. Use the **ChargeSource Storage Setup** component on the `/enhanced-file-storage` page to verify and create any missing buckets.

### 2. Upload Documents

```typescript
// Example: Upload a document with organization context
const formData = new FormData();
formData.append("file", selectedFile);
formData.append("bucket", "charge-source-documents");
formData.append("organizationId", "org-123"); // Optional

const response = await fetch("/api/functions/secure-file-upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
  body: formData,
});
```

### 3. Track Document Metadata

```typescript
import { documentMetadataService } from "@/lib/services/documentMetadataService";

// Create document metadata after upload
await documentMetadataService.createDocumentMetadata({
  user_id: user.id,
  organization_id: organizationId,
  bucket_name: "charge-source-documents",
  file_path: uploadResult.path,
  original_filename: file.name,
  file_size: file.size,
  mime_type: file.type,
  category: "specification",
  description: "EV charger installation specs",
  status: "draft",
});
```

### 4. List Documents

```typescript
// Get all documents for a user
const { data: documents } = await documentMetadataService.getDocumentsByUser(
  user.id,
  {
    bucket: "charge-source-documents",
    organizationId: "org-123",
    status: "approved",
  },
);
```

### 5. Integration with ChargeSource Features

#### Project Documents

```typescript
// When creating a project, associate documents
const projectDocuments = await documentMetadataService.getDocumentsByUser(
  user.id,
  {
    bucket: "charge-source-documents",
    organizationId: project.organizationId,
    status: "approved",
  },
);
```

#### Quote Attachments

```typescript
// Attach documents to quotes
const quoteAttachments = documents.filter(
  (doc) => doc.category === "specification" || doc.category === "manual",
);
```

#### Customer Portal Access

```typescript
// Share approved documents with customers
const customerDocuments = await documentMetadataService.getDocumentsByUser(
  user.id,
  {
    organizationId: customer.organizationId,
    status: "approved",
  },
);
```

## Available Components

### 1. EnhancedFileStorage

- **Path**: `/enhanced-file-storage`
- **Purpose**: Full document management interface
- **Features**: Upload, categorize, approve, organize documents

### 2. ChargeSourceStorageSetup

- **Component**: `<ChargeSourceStorageSetup />`
- **Purpose**: One-click bucket creation and verification
- **Usage**: Include in admin or setup pages

### 3. DocumentTest

- **Path**: `/document-test`
- **Purpose**: Test upload/download functionality
- **Features**: Upload to any bucket, view metadata, test Edge Functions

### 4. EnhancedFileManager

- **Component**: `<EnhancedFileManager />`
- **Purpose**: File browsing and management
- **Features**: Filtering, approval workflows, version control

## API Endpoints

### Upload Document

```http
POST /api/functions/secure-file-upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [File]
bucket: charge-source-documents
organizationId: org-123 (optional)
```

### List Documents

```http
GET /api/functions/secure-file-list?bucket=charge-source-documents&organizationId=org-123
Authorization: Bearer {token}
```

### Delete Document

```http
DELETE /api/functions/secure-file-delete?filename=document.pdf&bucket=charge-source-documents&organizationId=org-123
Authorization: Bearer {token}
```

## Database Schema

### document_metadata

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
organization_id UUID NULL
bucket_name     TEXT NOT NULL
file_path       TEXT NOT NULL
original_filename TEXT NOT NULL
file_size       BIGINT NOT NULL
mime_type       TEXT NOT NULL
category        TEXT DEFAULT 'uncategorized'
tags            TEXT[] DEFAULT '{}'
description     TEXT
status          TEXT DEFAULT 'draft'
version         INTEGER DEFAULT 1
metadata        JSONB DEFAULT '{}'
created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
approved_by     UUID REFERENCES auth.users(id)
approved_at     TIMESTAMP WITH TIME ZONE
```

### document_versions

```sql
id              UUID PRIMARY KEY
document_id     UUID REFERENCES document_metadata(id)
version_number  INTEGER NOT NULL
file_path       TEXT NOT NULL
file_size       BIGINT NOT NULL
created_by      UUID REFERENCES auth.users(id)
created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
change_notes    TEXT
```

## Security Features

- ✅ **Row Level Security (RLS)**: Users can only access their own documents
- ✅ **Authentication Required**: All operations require valid JWT tokens
- ✅ **File Type Validation**: MIME type restrictions per bucket
- ✅ **File Size Limits**: Enforced at bucket level
- ✅ **Organization Isolation**: Organization files are properly isolated
- ✅ **Approval Workflows**: Status-based access control

## Usage in ChargeSource App

### 1. Project Documentation

- Store installation manuals, specifications, and compliance documents
- Associate documents with specific projects and customers
- Version control for updated documentation

### 2. Quote Management

- Attach technical specifications to quotes
- Include installation guides and product manuals
- Share approved documents with customers

### 3. Customer Portal

- Provide customers with approved project documents
- Share installation guides and maintenance manuals
- Download invoices and compliance certificates

### 4. Training Materials

- Store training videos for electricians
- Organize by equipment type or installation procedure
- Version control for updated training content

### 5. Compliance Tracking

- Store compliance certificates and inspection reports
- Track approval status and expiration dates
- Organize by regulatory requirement

## Testing

Visit `/document-test` to test the full upload and retrieval workflow:

1. **Upload Test**: Upload files to different buckets
2. **Metadata Test**: Add categories, descriptions, and tags
3. **Organization Test**: Test organization vs user file separation
4. **Retrieval Test**: List and filter documents
5. **Edge Function Test**: Verify all API endpoints work

## Next Steps

1. **Integrate with Projects**: Connect documents to project records
2. **Customer Access**: Add customer portal document sharing
3. **Quote Attachments**: Include documents in quote generation
4. **Approval Workflows**: Implement manager approval for sensitive documents
5. **Search & Filter**: Add advanced search capabilities
6. **File Preview**: Add in-browser preview for common file types

Your ChargeSource document storage is now fully operational and ready for integration! 🎉
