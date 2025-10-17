# ChargeSource Edge Function Deployment Guide

## Secure File Upload Edge Function

The `secure-file-upload` Edge Function provides enhanced security for file uploads by:

- Validating authentication server-side
- Using service role permissions
- Storing files in user-specific folders
- Generating unique filenames to prevent conflicts

## Deployment Steps

### 1. Deploy the Edge Function

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref tepmkljodsifaexmrinl

# Deploy the function
supabase functions deploy secure-file-upload
```

### 2. Set Environment Variables

In your Supabase Dashboard → Edge Functions → Settings:

```
SUPABASE_URL=https://tepmkljodsifaexmrinl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 3. Configure CORS (if needed)

Add to your Supabase project settings → API → CORS:

```
http://localhost:8080
https://your-production-domain.com
```

### 4. Verify Deployment

Test the function by checking:

- Supabase Dashboard → Edge Functions
- Function should appear as "Active"
- Test with a file upload in your application

## Security Features

1. **Authentication Validation**: Every request validates the user's JWT token
2. **User Isolation**: Files stored in `{user_id}/` folders
3. **RLS Policies**: Database-level security ensures users only access their files
4. **Unique Filenames**: Prevents accidental overwrites
5. **Server-side Processing**: No client-side exposure of service keys

## File Storage Structure

```
chargesource/
├── {user_id_1}/
│   ├── uuid1.pdf
│   ├── uuid2.jpg
│   └── uuid3.docx
├── {user_id_2}/
│   ├── uuid4.png
│   └── uuid5.xlsx
└── ...
```

## Error Handling

The function returns appropriate HTTP status codes:

- `405`: Method not allowed (non-POST requests)
- `401`: Missing authorization header
- `403`: Authentication failed
- `400`: No file uploaded
- `500`: Upload or server error
- `200`: Successful upload

## Client Integration

The ChargeSource application has been updated to use this Edge Function instead of direct storage uploads, providing:

- Better error handling
- Enhanced security
- Consistent authentication flow
- Improved debugging capabilities

## Monitoring

Monitor function performance in:

- Supabase Dashboard → Edge Functions → Logs
- Real-time error tracking
- Performance metrics
