import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuoteData {
  id: string
  quoteNumber: string
  title: string
  clientInfo: any
  lineItems: any[]
  totals: any
  settings: any
  validUntil: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from auth token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { quoteId } = await req.json()

    // Fetch quote data from Supabase
    const { data: quote, error: quoteError } = await supabaseClient
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      return new Response(
        JSON.stringify({ error: 'Quote not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate PDF using Puppeteer or similar
    // For now, return a placeholder response
    const pdfData = await generatePDF(quote)

    return new Response(pdfData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.quote_number}.pdf"`,
      },
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function generatePDF(quote: any): Promise<Uint8Array> {
  // This is a simplified PDF generation
  // In production, you'd use libraries like jsPDF, Puppeteer, or PDFKit
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Quote ${quote.quote_number}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .client-info { margin-bottom: 30px; }
            .line-items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .line-items th, .line-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .line-items th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            .total { font-size: 18px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>QUOTATION</h1>
            <h2>Quote #${quote.quote_number}</h2>
            <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>${quote.client_info.company || quote.client_info.name}</strong></p>
            <p>${quote.client_info.contactPerson}</p>
            <p>${quote.client_info.email}</p>
            <p>${quote.client_info.phone}</p>
            <p>${quote.client_info.address}</p>
        </div>
        
        <table class="line-items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${quote.line_items.map((item: any) => `
                    <tr>
                        <td>
                            <strong>${item.name}</strong>
                            <br><small>${item.description}</small>
                        </td>
                        <td>${item.quantity}</td>
                        <td>$${item.unitPrice.toLocaleString()}</td>
                        <td>$${item.totalPrice.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <p>Subtotal: $${quote.totals.subtotal.toLocaleString()}</p>
            <p>GST (10%): $${quote.totals.gst.toLocaleString()}</p>
            <p class="total">Total: $${quote.totals.total.toLocaleString()}</p>
        </div>
        
        ${quote.settings.terms ? `
            <div style="margin-top: 40px;">
                <h3>Terms & Conditions</h3>
                <p>${quote.settings.terms}</p>
            </div>
        ` : ''}
    </body>
    </html>
  `

  // For demo purposes, return HTML as bytes
  // In production, convert HTML to PDF using Puppeteer
  return new TextEncoder().encode(htmlContent)
}
