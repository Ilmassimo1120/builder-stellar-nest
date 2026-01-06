# Supabase Edge Functions Deployment Guide

## Overview

ChargeSource uses the following Supabase Edge Functions for secure file operations and PDF generation:

1. **secure-file-upload** - Handles file uploads to storage buckets
2. **secure-file-list** - Lists files in a user's directory
3. **secure-file-delete** - Deletes files from storage
4. **generate-quote-pdf** - Generates PDF quotes
5. **calculate-quote-totals** - Calculates quote line item totals

---

## Prerequisites

Before deploying edge functions, ensure you have:

- [ ] **Supabase CLI installed** - https://supabase.com/docs/guides/cli/getting-started
- [ ] **Logged in to Supabase** - `supabase login`
- [ ] **Project linked** - `supabase link --project-ref XXXXXXXXXXXX`
- [ ] **Environment variables configured** - `.env.local` with `SUPABASE_ACCESS_TOKEN`
- [ ] **All 3 storage buckets created**:
  - `charge-source-user-files`
  - `charge-source-documents`
  - `charge-source-videos`

---

## Deployment Steps

### Step 1: Install Supabase CLI (if not already installed)

```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -sSfL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh

# Windows (npm)
npm install -g supabase
```

### Step 2: Authenticate with Supabase

```bash
supabase login
# Follow the browser prompt to authenticate
# Your access token will be saved in ~/.supabase/access-token
```

### Step 3: Link Your Project

```bash
# Replace XXXXXXXXXXXX with your Supabase project ID
supabase link --project-ref XXXXXXXXXXXX
```

To find your project ID:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings → General
4. Copy the "Project ID"

### Step 4: Deploy Each Function

Deploy the functions one by one:

```bash
# Deploy secure-file-upload
supabase functions deploy secure-file-upload

# Deploy secure-file-list
supabase functions deploy secure-file-list

# Deploy secure-file-delete
supabase functions deploy secure-file-delete

# Deploy generate-quote-pdf
supabase functions deploy generate-quote-pdf

# Deploy calculate-quote-totals
supabase functions deploy calculate-quote-totals
```

Or deploy all at once:

```bash
supabase functions deploy
```

### Step 5: Verify Deployment

Check that all functions are deployed:

```bash
supabase functions list
```

Expected output:
```
Deployment Status: Success
Function            Last Deployed
secure-file-upload  2024-01-06 14:30:00 UTC
secure-file-list    2024-01-06 14:30:10 UTC
secure-file-delete  2024-01-06 14:30:20 UTC
generate-quote-pdf  2024-01-06 14:30:30 UTC
calculate-quote-totals 2024-01-06 14:30:40 UTC
```

---

## Function Details

### 1. secure-file-upload

**Purpose:** Securely upload files to Supabase storage buckets

**Endpoint:** `https://[project-id].supabase.co/functions/v1/secure-file-upload`

**Request:**
```json
{
  "bucket": "charge-source-user-files",
  "path": "documents/my-file.pdf",
  "file": "base64-encoded-file-content"
}
```

**Response:**
```json
{
  "success": true,
  "path": "documents/my-file.pdf",
  "size": 1024,
  "createdAt": "2024-01-06T14:30:00Z"
}
```

### 2. secure-file-list

**Purpose:** List files in a user's directory

**Endpoint:** `https://[project-id].supabase.co/functions/v1/secure-file-list`

**Request:**
```json
{
  "bucket": "charge-source-user-files",
  "path": "documents/"
}
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "name": "my-file.pdf",
      "path": "documents/my-file.pdf",
      "size": 1024,
      "created_at": "2024-01-06T14:30:00Z"
    }
  ]
}
```

### 3. secure-file-delete

**Purpose:** Delete a file from storage

**Endpoint:** `https://[project-id].supabase.co/functions/v1/secure-file-delete`

**Request:**
```json
{
  "bucket": "charge-source-user-files",
  "path": "documents/my-file.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### 4. generate-quote-pdf

**Purpose:** Generate a PDF quote document

**Endpoint:** `https://[project-id].supabase.co/functions/v1/generate-quote-pdf`

**Request:**
```json
{
  "quoteId": "quote-123",
  "quote": {
    "number": "QT-2024-001",
    "clientName": "ABC Company",
    "items": [
      {
        "description": "EV Charger Installation",
        "quantity": 2,
        "unitPrice": 5000,
        "total": 10000
      }
    ],
    "total": 10000
  }
}
```

**Response:**
```json
{
  "success": true,
  "pdfUrl": "https://[bucket-url]/quotes/quote-123.pdf",
  "size": 45678
}
```

### 5. calculate-quote-totals

**Purpose:** Calculate line item totals and grand total

**Endpoint:** `https://[project-id].supabase.co/functions/v1/calculate-quote-totals`

**Request:**
```json
{
  "items": [
    {
      "description": "Installation",
      "quantity": 1,
      "unitPrice": 5000
    },
    {
      "description": "Labor",
      "quantity": 10,
      "unitPrice": 150
    }
  ],
  "taxRate": 0.10
}
```

**Response:**
```json
{
  "items": [
    {
      "description": "Installation",
      "quantity": 1,
      "unitPrice": 5000,
      "total": 5000
    },
    {
      "description": "Labor",
      "quantity": 10,
      "unitPrice": 150,
      "total": 1500
    }
  ],
  "subtotal": 6500,
  "tax": 650,
  "total": 7150
}
```

---

## Testing Functions Locally

Before deploying, test functions locally:

```bash
# Start local development server
supabase start

# Run a specific function
supabase functions serve secure-file-upload

# In another terminal, test the function
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/secure-file-upload' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"bucket":"charge-source-user-files","path":"test.txt","file":"dGVzdCBjb250ZW50"}'
```

---

## Troubleshooting

### Error: "Project not linked"
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### Error: "Authentication required"
```bash
supabase logout
supabase login
```

### Error: "Function not found" after deployment

Wait 30 seconds and try again - functions take time to propagate.

### Check function logs

```bash
supabase functions logs secure-file-upload

# Filter by time
supabase functions logs secure-file-upload --since 2024-01-06T00:00:00Z
```

### View function details

```bash
supabase functions info secure-file-upload
```

---

## Post-Deployment Checklist

After deploying all functions:

- [ ] All 5 functions appear in `supabase functions list`
- [ ] No errors in function logs: `supabase functions logs`
- [ ] Test file upload with a small test file
- [ ] Test file listing with `secure-file-list`
- [ ] Test PDF generation with `generate-quote-pdf`
- [ ] Verify quote calculations work

---

## Integration with Frontend

Once deployed, the frontend will automatically use these functions. The app communicates through:

1. **File Upload** → `secure-file-upload` function
2. **File Management** → `secure-file-list` and `secure-file-delete` functions
3. **Quote Generation** → `generate-quote-pdf` function
4. **Quote Calculations** → `calculate-quote-totals` function

No code changes needed on the frontend if you've deployed the functions correctly.

---

## Updating Functions

To update a function after making code changes:

```bash
# Edit the function code in supabase/functions/[function-name]/index.ts

# Redeploy
supabase functions deploy [function-name]

# Or redeploy all
supabase functions deploy
```

---

## Environment Variables in Functions

If functions need environment variables (API keys, etc.), they can be set in:

1. **Locally:** Create `supabase/.env.local`
2. **Production:** Set in Supabase Dashboard → Project Settings → Edge Functions

Functions can access environment variables via:
```typescript
const apiKey = Deno.env.get("MY_API_KEY");
```

---

## Cost Considerations

- **Edge Functions:** 1 million invocations/month free tier
- **Execution time:** $0.50 per 1 million compute seconds
- **Monitor usage:** Supabase Dashboard → Project Settings → Billing

For ChargeSource (typical usage):
- ~1000 file uploads/month = 1000 invocations
- ~500 PDF generations/month = 500 invocations
- Should stay well within free tier

---

## Support & Documentation

- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Deno Docs:** https://docs.deno.com
- **ChargeSource Issues:** Check CHARGESOURCE_OPERATIONAL_REQUIREMENTS.md

---

**Status:** Edge Functions ready for deployment  
**Last Updated:** January 2025  
**Next Step:** Run `supabase functions deploy` to deploy all functions
