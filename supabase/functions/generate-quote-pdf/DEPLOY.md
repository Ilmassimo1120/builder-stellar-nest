Deployment steps for supabase/functions/generate-quote-pdf

1. Ensure you have the Supabase CLI installed and authenticated:

   npm install -g supabase
   supabase login

2. From the repository root, run:

   cd supabase/functions/generate-quote-pdf
   supabase functions deploy generate-quote-pdf --project-ref <your-project-ref> --prod

   - Replace <your-project-ref> with your Supabase project ref (found in the Supabase dashboard URL).
   - Use --prod or omit to deploy to preview depending on your environment.

3. Required environment variables for the function (set in Supabase dashboard or via supabase secrets):

   - SUPABASE_URL: the Supabase project URL (e.g., https://xyz.supabase.co)
   - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN: service role key or access token with rights to storage and DB updates

   To set secrets via the CLI:

   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
   supabase secrets set SUPABASE_URL="https://<project>.supabase.co"

4. Make sure the storage bucket named "quote-attachments" exists and is configured as needed (private/public). See CHARGESOURCE_FILE_STORAGE_SETUP.md for bucket setup and access policies.

5. After deployment, test the function:

   - From the browser UI (QuoteBuilder), click PDF and verify the response and that the attachment appears in the quote attachments list.
   - Alternatively, call the function directly (authenticated) via curl:

     curl -X POST "https://<project>.supabase.co/functions/v1/generate-quote-pdf" \
      -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
      -H "Content-Type: application/json" \
      -d '{"quoteId":"<quote-id>"}'

6. Troubleshooting:

   - Check function logs in Supabase dashboard -> Functions -> select function -> Logs.
   - Ensure service role key has storage permissions and DB write permissions.
   - If attachment signed URL fails, verify bucket CORS and permissions.

7. Continuous deployment / CI:
   - Add a step in your CI (Netlify/Vercel or GitHub Actions) to deploy functions using the supabase CLI with secrets stored in CI.

If you'd like, I can prepare a Netlify or GitHub Actions CI step template for automatic deployment. If you prefer to deploy via the Builder.io MCP integrations, open the MCP popover and connect Supabase.
