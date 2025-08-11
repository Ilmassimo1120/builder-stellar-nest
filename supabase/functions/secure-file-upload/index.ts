import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req: Request) => {
  // Validate request method
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // Extract authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Validate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response("Authentication failed", { status: 403 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

    // Get bucket from form data or default to documents
    const bucket =
      (formData.get("bucket") as string) || "charge-source-documents";
    const organizationId = formData.get("organizationId") as string;

    // Determine upload path: organization files vs user files
    const uploadPath = organizationId
      ? `${organizationId}/${uniqueFilename}`
      : `${user.id}/${uniqueFilename}`;

    // Upload to specified bucket with proper path structure
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, file, {
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "File uploaded successfully",
        path: data.path,
        bucket: bucket,
        organizationId: organizationId || null,
        userId: user.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
