import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@2.4.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ACCESS_TOKEN") ?? "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // Parse body
    const body = await req.json().catch(() => ({}));
    const quoteId = body.quoteId || body.quote_id;
    if (!quoteId) {
      return new Response(JSON.stringify({ error: "quoteId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch quote
    const { data: quote, error: quoteError } = await supabaseClient
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return new Response(JSON.stringify({ error: "Quote not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create PDF with pdf-lib
    const pdfBytes = await buildQuotePdf(quote);

    // Upload to storage (private bucket 'quote-attachments')
    const bucket = "quote-attachments";
    const filePath = `quotes/${quoteId}/quote-${quote.quote_number || quoteId}-${Date.now()}.pdf`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload PDF to storage" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a signed URL valid for 24 hours
    const expiresIn = 60 * 60 * 24;
    const { data: signed, error: signedError } = await supabaseClient.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (signedError) {
      console.error("Signed URL creation failed:", signedError);
    }

    // Attach to quote attachments metadata (append)
    const attachment = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      name: filePath.split("/").pop(),
      url: signed?.signedUrl ?? filePath,
      type: "application/pdf",
      size: pdfBytes.length,
      uploadedAt: new Date().toISOString(),
      uploadedBy: null,
    };

    // Merge into existing attachments array if present
    const currentAttachments = quote.attachments || [];
    const newAttachments = [...currentAttachments, attachment];

    const { data: updatedQuote, error: updateError } = await supabaseClient
      .from("quotes")
      .update({ attachments: newAttachments })
      .eq("id", quoteId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update quote attachments:", updateError);
    }

    return new Response(JSON.stringify({ success: true, file: attachment }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-quote-pdf error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function buildQuotePdf(quote: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  let y = height - margin;

  // Header
  page.drawText("ChargeSource", { x: margin, y: y, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText("QUOTATION", { x: width - margin - 100, y: y, size: 16, font: boldFont });
  y -= 24;

  page.drawText(`Quote #: ${quote.quote_number || quote.quoteNumber || quote.id}` , { x: width - margin - 200, y, size: 10, font, color: rgb(0.3,0.3,0.3) });
  y -= 18;
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: width - margin - 200, y, size: 10, font, color: rgb(0.3,0.3,0.3) });
  y -= 28;

  // Client info
  page.drawText("Bill To:", { x: margin, y, size: 12, font: boldFont });
  y -= 16;
  const client = quote.client_info || quote.clientInfo || {};
  const clientLines = [client.company || client.name, client.contactPerson, client.email, client.phone, client.address].filter(Boolean);
  for (const line of clientLines) {
    page.drawText(String(line), { x: margin, y, size: 10, font });
    y -= 14;
  }

  y -= 8;

  // Table header
  page.drawText("Description", { x: margin, y, size: 10, font: boldFont });
  page.drawText("Qty", { x: width - margin - 120, y, size: 10, font: boldFont });
  page.drawText("Unit", { x: width - margin - 90, y, size: 10, font: boldFont });
  page.drawText("Total", { x: width - margin - 40, y, size: 10, font: boldFont });
  y -= 16;

  // Line items
  const items = quote.line_items || quote.lineItems || [];
  for (const item of items) {
    if (y < margin + 60) {
      // new page
      const newPage = pdfDoc.addPage();
      y = newPage.getSize().height - margin;
      Object.assign(page, newPage);
    }

    page.drawText((item.name || "Untitled").slice(0, 80), { x: margin, y, size: 10, font });
    page.drawText(String(item.quantity ?? item.qty ?? 1), { x: width - margin - 120, y, size: 10, font });
    page.drawText(`$${Number(item.unitPrice ?? item.price ?? 0).toFixed(2)}`, { x: width - margin - 90, y, size: 10, font });
    page.drawText(`$${Number(item.totalPrice ?? item.total ?? (item.quantity * (item.unitPrice ?? item.price ?? 0))).toFixed(2)}`, { x: width - margin - 40, y, size: 10, font });
    y -= 14;

    if (item.description) {
      const desc = (item.description || "").slice(0, 200);
      page.drawText(desc, { x: margin + 8, y, size: 9, font: font, color: rgb(0.4,0.4,0.4) });
      y -= 12;
    }
  }

  y -= 8;

  // Totals
  const totals = quote.totals || quote.totals || { subtotal: 0, gst: 0, total: 0, discount: 0 };
  page.drawText(`Subtotal: $${Number(totals.subtotal ?? 0).toFixed(2)}`, { x: width - margin - 180, y, size: 10, font });
  y -= 14;
  if (totals.discount && totals.discount > 0) {
    page.drawText(`Discount: -$${Number(totals.discount ?? 0).toFixed(2)}`, { x: width - margin - 180, y, size: 10, font, color: rgb(0.0,0.5,0.2) });
    y -= 14;
  }
  page.drawText(`GST (10%): $${Number(totals.gst ?? 0).toFixed(2)}`, { x: width - margin - 180, y, size: 10, font });
  y -= 16;
  page.drawText(`Total: $${Number(totals.total ?? 0).toFixed(2)}`, { x: width - margin - 180, y, size: 12, font: boldFont });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
