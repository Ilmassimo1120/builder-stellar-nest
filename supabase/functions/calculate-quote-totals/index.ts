import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LineItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  cost: number
  markup: number
  category: string
  totalPrice?: number
}

interface QuoteTotals {
  subtotal: number
  discount: number
  discountType: 'percentage' | 'fixed'
  gst: number
  total: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

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

    const { lineItems, discount = 0, discountType = 'percentage' } = await req.json()

    // Get global settings for GST rate
    const { data: gstSetting } = await supabaseClient
      .from('global_settings')
      .select('value')
      .eq('key', 'gst_rate')
      .single()

    const gstRate = gstSetting?.value || 10 // Default 10%

    // Calculate line item totals
    const processedLineItems = lineItems.map((item: LineItem) => ({
      ...item,
      totalPrice: calculateLineItemTotal(item.quantity, item.unitPrice, item.markup)
    }))

    // Calculate totals
    const totals = calculateQuoteTotals(processedLineItems, discount, discountType, gstRate)

    // Apply volume discounts if applicable
    const { data: volumeDiscounts } = await supabaseClient
      .from('global_settings')
      .select('value')
      .eq('key', 'volume_discounts')
      .single()

    let finalLineItems = processedLineItems
    if (volumeDiscounts?.value) {
      finalLineItems = applyVolumeDiscounts(processedLineItems, volumeDiscounts.value)
      // Recalculate totals after volume discounts
      const newTotals = calculateQuoteTotals(finalLineItems, discount, discountType, gstRate)
      Object.assign(totals, newTotals)
    }

    return new Response(
      JSON.stringify({
        lineItems: finalLineItems,
        totals
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

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

function calculateLineItemTotal(quantity: number, unitPrice: number, markup: number): number {
  return quantity * unitPrice * (1 + markup / 100)
}

function calculateQuoteTotals(
  lineItems: LineItem[],
  discount: number,
  discountType: 'percentage' | 'fixed',
  gstRate: number
): QuoteTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  
  let discountAmount = 0
  if (discountType === 'percentage') {
    discountAmount = subtotal * (discount / 100)
  } else {
    discountAmount = discount
  }

  const discountedSubtotal = subtotal - discountAmount
  const gst = discountedSubtotal * (gstRate / 100)
  const total = discountedSubtotal + gst

  return {
    subtotal,
    discount: discountAmount,
    discountType,
    gst,
    total
  }
}

function applyVolumeDiscounts(lineItems: LineItem[], volumeDiscounts: any[]): LineItem[] {
  const categoryQuantities: Record<string, number> = {}

  // Calculate total quantities per category
  lineItems.forEach((item) => {
    categoryQuantities[item.category] = (categoryQuantities[item.category] || 0) + item.quantity
  })

  // Apply volume discounts
  return lineItems.map((item) => {
    const categoryQuantity = categoryQuantities[item.category]
    const applicableDiscount = volumeDiscounts
      .filter((discount) =>
        discount.applicableCategories.includes(item.category) &&
        categoryQuantity >= discount.minimumQuantity
      )
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0]

    if (applicableDiscount) {
      const discountedPrice = item.unitPrice * (1 - applicableDiscount.discountPercentage / 100)
      return {
        ...item,
        unitPrice: discountedPrice,
        totalPrice: calculateLineItemTotal(item.quantity, discountedPrice, item.markup)
      }
    }

    return item
  })
}
