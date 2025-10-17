import { supabase } from "../supabase";
import {
  Quote,
  QuoteLineItem,
  QuoteTemplate,
  ProductCatalogueItem,
} from "../quoteTypes";
import { UserRole } from "../rbac";

class SupabaseQuoteService {
  // Get all quotes for current user
  async getAllQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get specific quote
  async getQuote(quoteId: string): Promise<Quote | null> {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (error) {
      console.error("Error fetching quote:", error);
      return null;
    }
    return data;
  }

  // Create new quote
  async createQuote(projectId?: string, templateId?: string): Promise<Quote> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Generate quote number
    const quoteNumber = await this.generateQuoteNumber();

    // Get project data if projectId provided
    let projectData = null;
    let clientInfo = {
      id: "",
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      company: "",
    };

    if (projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (project) {
        projectData = project;
        clientInfo = project.client_info;
      }
    }

    // Apply template if provided
    let lineItems: any[] = [];
    let settings = {
      validityDays: 30,
      terms: "",
      notes: "",
      paymentTerms: "30 days net",
      warranty: "12 months parts and labour",
      deliveryTerms: "5-10 business days",
    };

    if (templateId) {
      const { data: template } = await supabase
        .from("quote_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (template) {
        lineItems = template.line_items;
        settings = { ...settings, ...template.settings };
      }
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + settings.validityDays);

    const newQuote = {
      quote_number: quoteNumber,
      title: projectData?.name || "New Quote",
      description: projectData?.description || "",
      status: "draft" as const,
      user_id: user.id,
      project_id: projectId || null,
      client_info: clientInfo,
      line_items: lineItems,
      totals: {
        subtotal: 0,
        discount: 0,
        discountType: "percentage",
        gst: 0,
        total: 0,
      },
      settings,
      valid_until: validUntil.toISOString(),
      template_id: templateId || null,
    };

    const { data, error } = await supabase
      .from("quotes")
      .insert(newQuote)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update quote
  async updateQuote(quote: Quote): Promise<Quote> {
    const { data, error } = await supabase
      .from("quotes")
      .update({
        title: quote.title,
        description: quote.description,
        client_info: quote.clientInfo,
        line_items: quote.lineItems,
        totals: quote.totals,
        settings: quote.settings,
        valid_until: quote.validUntil,
      })
      .eq("id", quote.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Add line item
  async addLineItem(
    quoteId: string,
    lineItem: Omit<QuoteLineItem, "id" | "totalPrice">,
  ): Promise<Quote | null> {
    const quote = await this.getQuote(quoteId);
    if (!quote) return null;

    const newLineItem = {
      ...lineItem,
      id: `line-${Date.now()}`,
      totalPrice: 0, // Will be calculated by Edge Function
    };

    const updatedLineItems = [...((quote as any).line_items || quote.lineItems || []), newLineItem];

    // Calculate totals using Edge Function
    const { data: calculation } = await supabase.functions.invoke(
      "calculate-quote-totals",
      {
        body: {
          lineItems: updatedLineItems,
          discount: quote.totals.discount,
          discountType: quote.totals.discountType,
        },
      },
    );

    if (calculation) {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          line_items: calculation.lineItems,
          totals: calculation.totals,
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return null;
  }

  // Update line item
  async updateLineItem(
    quoteId: string,
    lineItemId: string,
    updates: Partial<QuoteLineItem>,
  ): Promise<Quote | null> {
    const quote = await this.getQuote(quoteId);
    if (!quote) return null;

    const lineItemIndex = ((quote as any).line_items || quote.lineItems || []).findIndex(
      (item: any) => item.id === lineItemId,
    );
    if (lineItemIndex === -1) return null;

    const updatedLineItems = [...((quote as any).line_items || quote.lineItems || [])];
    updatedLineItems[lineItemIndex] = {
      ...updatedLineItems[lineItemIndex],
      ...updates,
    };

    // Recalculate totals
    const { data: calculation } = await supabase.functions.invoke(
      "calculate-quote-totals",
      {
        body: {
          lineItems: updatedLineItems,
          discount: quote.totals.discount,
          discountType: quote.totals.discountType,
        },
      },
    );

    if (calculation) {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          line_items: calculation.lineItems,
          totals: calculation.totals,
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return null;
  }

  // Remove line item
  async removeLineItem(
    quoteId: string,
    lineItemId: string,
  ): Promise<Quote | null> {
    const quote = await this.getQuote(quoteId);
    if (!quote) return null;

    const updatedLineItems = ((quote as any).line_items || quote.lineItems || []).filter(
      (item: any) => item.id !== lineItemId,
    );

    // Recalculate totals
    const { data: calculation } = await supabase.functions.invoke(
      "calculate-quote-totals",
      {
        body: {
          lineItems: updatedLineItems,
          discount: quote.totals.discount,
          discountType: quote.totals.discountType,
        },
      },
    );

    if (calculation) {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          line_items: calculation.lineItems,
          totals: calculation.totals,
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return null;
  }

  // Add product to quote
  async addProductToQuote(
    quoteId: string,
    productId: string,
    quantity: number = 1,
  ): Promise<Quote | null> {
    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("Product not found:", productId);
      return null;
    }

    // Create line item from product
    const lineItem = {
      type: "charger" as const,
      productId: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity,
      unitPrice: product.pricing.recommendedRetail,
      cost: product.pricing.cost,
      markup: this.getDefaultMarkupForCategory(product.category),
      unit: "each" as const,
      specifications: product.specifications,
      supplierInfo: {
        supplierId: product.supplier.id,
        supplierName: product.supplier.name,
        partNumber: product.supplier.partNumber,
        leadTime: product.inventory.leadTime,
      },
    };

    return this.addLineItem(quoteId, lineItem);
  }

  // Send quote
  async sendQuote(quoteId: string): Promise<Quote | null> {
    const { data, error } = await supabase
      .from("quotes")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", quoteId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity("quote_sent", "quote", quoteId);

    return data;
  }

  // Generate PDF
  async generatePDF(quoteId: string): Promise<Blob> {
    const { data, error } = await supabase.functions.invoke(
      "generate-quote-pdf",
      {
        body: { quoteId },
      },
    );

    if (error) throw error;
    return data;
  }

  // Get templates
  async getAllTemplates(): Promise<QuoteTemplate[]> {
    const { data, error } = await supabase
      .from("quote_templates")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  }

  // Create template
  async createTemplate(
    template: Omit<QuoteTemplate, "id" | "createdAt" | "usageCount">,
  ): Promise<QuoteTemplate> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("quote_templates")
      .insert({
        name: template.name,
        description: template.description,
        category: template.category,
        line_items: template.lineItems,
        settings: template.settings,
        is_default: template.isDefault,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get quote analytics
  async getQuoteAnalytics() {
    // This would be implemented with proper database queries
    // For now, return mock data
    return {
      totalQuotes: 0,
      totalValue: 0,
      conversionRate: 0,
      averageQuoteValue: 0,
      averageResponseTime: 0,
      statusBreakdown: {},
      monthlyTrends: [],
      topProducts: [],
    };
  }

  // Helper methods
  private async generateQuoteNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Get count of quotes this month
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const { count } = await supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    const sequence = String((count || 0) + 1).padStart(4, "0");
    return `QUO-${year}${month}-${sequence}`;
  }

  private getDefaultMarkupForCategory(category: string): number {
    const markups = {
      chargers: 30,
      accessories: 40,
      installation: 50,
      service: 60,
      custom: 35,
    };
    return markups[category as keyof typeof markups] || 35;
  }

  private async logActivity(
    action: string,
    resourceType: string,
    resourceId: string,
    details?: any,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    });
  }

  // Real-time subscriptions
  subscribeToQuotes(callback: (payload: any) => void) {
    return supabase
      .channel("quotes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quotes",
        },
        callback,
      )
      .subscribe();
  }
}

export const supabaseQuoteService = new SupabaseQuoteService();
export default supabaseQuoteService;
