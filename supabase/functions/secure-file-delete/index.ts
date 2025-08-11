import { createClient } from 'npm:@supabase/supabase-js';

Deno.serve(async (req: Request) => {
  // Validate request method
  if (req.method !== 'DELETE') {
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

    // Get parameters from URL
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');
    const bucket = url.searchParams.get('bucket') || 'charge-source-documents';
    const organizationId = url.searchParams.get('organizationId');

    if (!filename) {
      return new Response('Filename parameter required', { status: 400 });
    }

    // Determine folder path: organization files vs user files
    const folderPath = organizationId || user.id;
    const filePath = `${folderPath}/${filename}`;

    // Check if file exists and belongs to user/organization
    const { data: fileInfo, error: fileError } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        search: filename
      });

    if (fileError) {
      console.error('File check error:', fileError);
      return new Response(JSON.stringify({ error: fileError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fileExists = fileInfo?.some(file => file.name === filename);
    if (!fileExists) {
      return new Response('File not found or access denied', { status: 404 });
    }

    // Delete the file
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      message: 'File deleted successfully',
      filename: filename,
      bucket: bucket,
      organizationId: organizationId || null,
      userId: user.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
