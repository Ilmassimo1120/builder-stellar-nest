import { createClient } from 'npm:@supabase/supabase-js';

Deno.serve(async (req: Request) => {
  // Validate request method
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Extract authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Validate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response('Authentication failed', { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const bucket = url.searchParams.get('bucket') || 'charge-source-documents';
    const organizationId = url.searchParams.get('organizationId');

    // Determine folder to list: organization files vs user files
    const folderPath = organizationId || user.id;

    // List files in specified folder and bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get signed URLs for each file
    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const filePath = `${folderPath}/${file.name}`;
        const { data: urlData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        return {
          ...file,
          signedUrl: urlData?.signedUrl,
          fullPath: filePath,
          bucket: bucket,
          organizationId: organizationId || null,
          userId: user.id
        };
      })
    );

    return new Response(JSON.stringify({ 
      files: filesWithUrls,
      total: data?.length || 0
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
