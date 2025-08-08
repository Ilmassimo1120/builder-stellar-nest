// Quote Service - Business logic for Smart Quoting Engine (CPQ)

import {
  Quote,
  QuoteLineItem,
  QuoteTemplate,
  QuoteAnalytics,
  MarginSettings,
  PricingRule,
  calculateQuoteTotals,
  generateQuoteNumber,
  createEmptyQuote,
  ProjectIntegration,
  ProductCatalogueItem,
  ClientDecision,
} from "./quoteTypes";
import { productCatalog } from "./productCatalog";

// Default margin settings
const DEFAULT_MARGIN_SETTINGS: MarginSettings = {
  defaultMarkup: 35, // 35% default markup
  categoryMarkups: {
    chargers: 30,
    accessories: 40,
    installation: 50,
    service: 60,
    custom: 35,
  },
  minimumMargin: 15,
  maximumDiscount: 25,
  volumeDiscounts: [
    {
      minimumQuantity: 5,
      discountPercentage: 5,
      applicableCategories: ["chargers"],
    },
    {
      minimumQuantity: 10,
      discountPercentage: 10,
      applicableCategories: ["chargers"],
    },
    {
      minimumQuantity: 20,
      discountPercentage: 15,
      applicableCategories: ["chargers"],
    },
  ],
};

class QuoteService {
  private quotes: Quote[] = [];
  private templates: QuoteTemplate[] = [];
  private marginSettings: MarginSettings = DEFAULT_MARGIN_SETTINGS;
  private pricingRules: PricingRule[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultTemplates();
  }

  // Storage operations
  private loadFromStorage(): void {
    try {
      const quotesData = localStorage.getItem("chargeSourceQuotes");
      if (quotesData) {
        this.quotes = JSON.parse(quotesData);
      }

      const templatesData = localStorage.getItem("chargeSourceQuoteTemplates");
      if (templatesData) {
        this.templates = JSON.parse(templatesData);
      }

      const marginsData = localStorage.getItem("chargeSourceMarginSettings");
      if (marginsData) {
        this.marginSettings = {
          ...DEFAULT_MARGIN_SETTINGS,
          ...JSON.parse(marginsData),
        };
      }
    } catch (error) {
      console.error("Error loading quote data from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("chargeSourceQuotes", JSON.stringify(this.quotes));
      localStorage.setItem(
        "chargeSourceQuoteTemplates",
        JSON.stringify(this.templates),
      );
      localStorage.setItem(
        "chargeSourceMarginSettings",
        JSON.stringify(this.marginSettings),
      );
    } catch (error) {
      console.error("Error saving quote data to storage:", error);
    }
  }

  // Quote CRUD operations
  createQuote(projectId?: string, templateId?: string): Quote {
    let quote = createEmptyQuote(projectId);

    if (templateId) {
      const template = this.getTemplate(templateId);
      if (template) {
        quote = this.applyTemplate(quote, template);
      }
    }

    if (projectId) {
      const projectData = this.getProjectData(projectId);
      if (projectData) {
        quote = this.integrateProjectData(quote, projectData);
      }
    }

    quote.quoteNumber = generateQuoteNumber();
    this.quotes.unshift(quote);
    this.saveToStorage();

    return quote;
  }

  getQuote(quoteId: string): Quote | null {
    return this.quotes.find((q) => q.id === quoteId) || null;
  }

  getAllQuotes(): Quote[] {
    return [...this.quotes];
  }

  updateQuote(quote: Quote): Quote {
    const index = this.quotes.findIndex((q) => q.id === quote.id);
    if (index !== -1) {
      quote.updatedAt = new Date().toISOString();
      this.quotes[index] = quote;
      this.saveToStorage();
    }
    return quote;
  }

  deleteQuote(quoteId: string): boolean {
    const index = this.quotes.findIndex((q) => q.id === quoteId);
    if (index !== -1) {
      this.quotes.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  duplicateQuote(quoteId: string): Quote | null {
    const originalQuote = this.getQuote(quoteId);
    if (!originalQuote) return null;

    const newQuote: Quote = {
      ...originalQuote,
      id: `quote-${Date.now()}`,
      quoteNumber: generateQuoteNumber(),
      version: 1,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: undefined,
      acceptedAt: undefined,
      clientViews: [],
      comments: [],
      approvals: [],
    };

    this.quotes.unshift(newQuote);
    this.saveToStorage();
    return newQuote;
  }

  // Line item operations
  addLineItem(
    quoteId: string,
    lineItem: Omit<QuoteLineItem, "id" | "totalPrice">,
  ): Quote | null {
    const quote = this.getQuote(quoteId);
    if (!quote) return null;

    const newLineItem: QuoteLineItem = {
      ...lineItem,
      id: `line-${Date.now()}`,
      totalPrice: this.calculateLineItemTotal(
        lineItem.quantity,
        lineItem.unitPrice,
        lineItem.markup,
      ),
    };

    quote.lineItems.push(newLineItem);
    quote.totals = calculateQuoteTotals(
      quote.lineItems,
      quote.totals.discount,
      quote.totals.discountType,
    );

    return this.updateQuote(quote);
  }

  updateLineItem(
    quoteId: string,
    lineItemId: string,
    updates: Partial<QuoteLineItem>,
  ): Quote | null {
    const quote = this.getQuote(quoteId);
    if (!quote) return null;

    const lineItemIndex = quote.lineItems.findIndex(
      (item) => item.id === lineItemId,
    );
    if (lineItemIndex === -1) return null;

    const updatedLineItem = { ...quote.lineItems[lineItemIndex], ...updates };

    // Recalculate total price if quantity, unit price, or markup changed
    if (
      updates.quantity !== undefined ||
      updates.unitPrice !== undefined ||
      updates.markup !== undefined
    ) {
      updatedLineItem.totalPrice = this.calculateLineItemTotal(
        updatedLineItem.quantity,
        updatedLineItem.unitPrice,
        updatedLineItem.markup,
      );
    }

    quote.lineItems[lineItemIndex] = updatedLineItem;
    quote.totals = calculateQuoteTotals(
      quote.lineItems,
      quote.totals.discount,
      quote.totals.discountType,
    );

    return this.updateQuote(quote);
  }

  removeLineItem(quoteId: string, lineItemId: string): Quote | null {
    const quote = this.getQuote(quoteId);
    if (!quote) return null;

    quote.lineItems = quote.lineItems.filter((item) => item.id !== lineItemId);
    quote.totals = calculateQuoteTotals(
      quote.lineItems,
      quote.totals.discount,
      quote.totals.discountType,
    );

    return this.updateQuote(quote);
  }

  // Pricing calculations
  private calculateLineItemTotal(
    quantity: number,
    unitPrice: number,
    markup: number,
  ): number {
    return quantity * unitPrice * (1 + markup / 100);
  }

  calculateMarginForCategory(category: string): number {
    return (
      this.marginSettings.categoryMarkups[category] ||
      this.marginSettings.defaultMarkup
    );
  }

  applyVolumeDiscount(lineItems: QuoteLineItem[]): QuoteLineItem[] {
    const categoryQuantities: Record<string, number> = {};

    // Calculate total quantities per category
    lineItems.forEach((item) => {
      categoryQuantities[item.category] =
        (categoryQuantities[item.category] || 0) + item.quantity;
    });

    // Apply volume discounts
    return lineItems.map((item) => {
      const categoryQuantity = categoryQuantities[item.category];
      const applicableDiscount = this.marginSettings.volumeDiscounts
        .filter(
          (discount) =>
            discount.applicableCategories.includes(item.category) &&
            categoryQuantity >= discount.minimumQuantity,
        )
        .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

      if (applicableDiscount) {
        const discountedPrice =
          item.unitPrice * (1 - applicableDiscount.discountPercentage / 100);
        return {
          ...item,
          unitPrice: discountedPrice,
          totalPrice: this.calculateLineItemTotal(
            item.quantity,
            discountedPrice,
            item.markup,
          ),
        };
      }

      return item;
    });
  }

  // Template operations
  createTemplate(
    template: Omit<QuoteTemplate, "id" | "createdAt" | "usageCount">,
  ): QuoteTemplate {
    const newTemplate: QuoteTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    this.templates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  getTemplate(templateId: string): QuoteTemplate | null {
    return this.templates.find((t) => t.id === templateId) || null;
  }

  getAllTemplates(): QuoteTemplate[] {
    return [...this.templates];
  }

  applyTemplate(quote: Quote, template: QuoteTemplate): Quote {
    const lineItems = template.lineItems.map((item) => ({
      ...item,
      id: `line-${Date.now()}-${Math.random()}`,
      totalPrice: this.calculateLineItemTotal(
        item.quantity,
        item.unitPrice,
        item.markup,
      ),
    }));

    const updatedQuote = {
      ...quote,
      lineItems,
      settings: { ...template.settings },
      templateId: template.id,
    };

    updatedQuote.totals = calculateQuoteTotals(lineItems, 0, "percentage");

    // Increment template usage
    const templateIndex = this.templates.findIndex((t) => t.id === template.id);
    if (templateIndex !== -1) {
      this.templates[templateIndex].usageCount++;
      this.saveToStorage();
    }

    return updatedQuote;
  }

  // Project integration
  private getProjectData(projectId: string): ProjectIntegration | null {
    try {
      // Load from existing project management system
      const projects = JSON.parse(
        localStorage.getItem("chargeSourceProjects") || "[]",
      );
      const project = projects.find((p: any) => p.id === projectId);

      if (project) {
        return {
          projectId,
          projectName: project.name || project.projectInfo?.name,
          clientRequirements: project.clientRequirements,
          siteAssessment: project.siteAssessment,
          chargerSelection: project.chargerSelection,
          estimatedBudget: project.estimatedBudget,
          // Include raw project data for comprehensive integration
          rawProjectData: project,
        };
      }

      // Also check project drafts if not found in main projects
      const drafts = JSON.parse(
        localStorage.getItem("chargeSourceProjectDrafts") || "[]",
      );
      const draft = drafts.find((d: any) => d.id === projectId);

      if (draft) {
        return {
          projectId,
          projectName: draft.siteAssessment?.projectName || draft.draftName,
          clientRequirements: draft.clientRequirements,
          siteAssessment: draft.siteAssessment,
          chargerSelection: draft.chargerSelection,
          estimatedBudget: draft.estimatedBudget,
          rawProjectData: draft,
        };
      }
    } catch (error) {
      console.error("Error loading project data:", error);
    }
    return null;
  }

  integrateProjectData(quote: Quote, projectData: ProjectIntegration): Quote {
    const rawProject = projectData.rawProjectData;
    const clientReq = projectData.clientRequirements || {};

    // Update client information from project - comprehensive integration
    if (projectData.clientRequirements || rawProject) {
      quote.clientInfo = {
        id: projectData.projectId,
        name:
          clientReq.contactPersonName ||
          rawProject?.client_name ||
          rawProject?.client ||
          "",
        contactPerson:
          clientReq.contactPersonName ||
          rawProject?.contactPerson ||
          rawProject?.contact_person_name ||
          "",
        email:
          clientReq.contactEmail ||
          rawProject?.contact_email ||
          rawProject?.email ||
          "",
        phone:
          clientReq.contactPhone ||
          rawProject?.contact_phone ||
          rawProject?.phone ||
          "",
        address:
          projectData.siteAssessment?.siteAddress ||
          rawProject?.site_address ||
          rawProject?.siteAddress ||
          rawProject?.location ||
          "",
        company:
          rawProject?.client_name ||
          clientReq.organizationType ||
          rawProject?.organization_type ||
          rawProject?.company ||
          "",
        abn: rawProject?.abn || "",
      };
    }

    // Update project information - comprehensive integration
    quote.title =
      projectData.projectName ||
      rawProject?.name ||
      rawProject?.project_name ||
      quote.title;
    quote.description =
      rawProject?.notes ||
      rawProject?.description ||
      projectData.siteAssessment?.additionalNotes ||
      clientReq?.specialRequirements ||
      quote.description;

    // Update project data
    quote.projectData = {
      projectId: projectData.projectId,
      projectName: projectData.projectName,
      siteAddress:
        projectData.siteAssessment?.siteAddress ||
        rawProject?.site_address ||
        rawProject?.location,
      siteType: projectData.siteAssessment?.siteType || rawProject?.site_type,
      projectObjective:
        projectData.clientRequirements?.projectObjective ||
        rawProject?.project_objective,
    };

    // Set project ID for reference
    quote.projectId = projectData.projectId;

    // Auto-generate line items from charger selection
    if (projectData.chargerSelection) {
      this.generateLineItemsFromProject(quote, projectData);
    }

    return quote;
  }

  private generateLineItemsFromProject(
    quote: Quote,
    projectData: ProjectIntegration,
  ): void {
    const chargerSelection = projectData.chargerSelection;

    if (
      chargerSelection.chargingType &&
      chargerSelection.powerRating &&
      chargerSelection.numberOfChargers
    ) {
      // Main charger line item
      const chargerQuantity = parseInt(chargerSelection.numberOfChargers) || 1;
      const chargerName = `${chargerSelection.powerRating} ${chargerSelection.chargingType.replace("-", " ").toUpperCase()} Charger`;

      let basePrice = 8000; // Default base price
      if (chargerSelection.chargingType === "dc-fast") {
        basePrice = 45000;
      } else if (chargerSelection.powerRating === "22kw") {
        basePrice = 12000;
      }

      const chargerLineItem: Omit<QuoteLineItem, "id" | "totalPrice"> = {
        type: "charger",
        name: chargerName,
        description: `${chargerSelection.powerRating} charging station with ${chargerSelection.connectorTypes?.join(", ") || "standard"} connectors`,
        category: "chargers",
        quantity: chargerQuantity,
        unitPrice: basePrice,
        cost: basePrice * 0.7, // 70% cost ratio
        markup: this.calculateMarginForCategory("chargers"),
        unit: "each",
        specifications: {
          powerRating: chargerSelection.powerRating,
          chargingType: chargerSelection.chargingType,
          mountingType: chargerSelection.mountingType,
          connectorTypes: chargerSelection.connectorTypes,
          weatherProtection: chargerSelection.weatherProtection,
          networkConnectivity: chargerSelection.networkConnectivity,
        },
      };

      this.addLineItem(quote.id, chargerLineItem);

      // Installation services
      const installationLineItem: Omit<QuoteLineItem, "id" | "totalPrice"> = {
        type: "installation",
        name: "Professional Installation",
        description:
          "Complete installation including electrical work, mounting, and commissioning",
        category: "installation",
        quantity: chargerQuantity,
        unitPrice: 2500,
        cost: 1500,
        markup: this.calculateMarginForCategory("installation"),
        unit: "each",
      };

      this.addLineItem(quote.id, installationLineItem);

      // Accessories if weather protection is required
      if (chargerSelection.weatherProtection) {
        const canopyLineItem: Omit<QuoteLineItem, "id" | "totalPrice"> = {
          type: "accessory",
          name: "Weather Protection Canopy",
          description: "Protective canopy for outdoor installation",
          category: "accessories",
          quantity: Math.ceil(chargerQuantity / 2), // One canopy per 2 chargers
          unitPrice: 3500,
          cost: 2200,
          markup: this.calculateMarginForCategory("accessories"),
          unit: "each",
        };

        this.addLineItem(quote.id, canopyLineItem);
      }
    }
  }

  // Product catalogue integration
  getProductCatalogueItems(category?: string): ProductCatalogueItem[] {
    try {
      return productCatalog.getProducts(category ? { category } : undefined);
    } catch (error) {
      console.warn('Product catalog not available, using mock data');
      return this.getMockCatalogueItems(category);
    }
  }

  private getMockCatalogueItems(category?: string): ProductCatalogueItem[] {
    const mockItems: ProductCatalogueItem[] = [
      {
        id: "prod-1",
        sku: "CHG-AC-7KW",
        name: "7kW AC Charging Station",
        description:
          "Single-phase AC charging station suitable for residential and light commercial use",
        category: "chargers",
        subcategory: "ac-chargers",
        brand: "ChargePoint",
        model: "Home Flex",
        specifications: {
          powerRating: "7kW",
          inputVoltage: "240V",
          outputVoltage: "240V",
          connectorType: "Type 2",
          dimensions: "330 x 193 x 107 mm",
          weight: "4.2kg",
          protection: "IP54",
        },
        pricing: {
          cost: 1200,
          listPrice: 1800,
          recommendedRetail: 2400,
        },
        inventory: {
          inStock: 25,
          reserved: 5,
          available: 20,
          leadTime: "3-5 business days",
        },
        supplier: {
          id: "sup-1",
          name: "ChargePoint",
          partNumber: "CPH25-L2-P-NA",
          minimumOrderQuantity: 1,
        },
        images: [],
        documents: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "prod-2",
        sku: "CHG-DC-50KW",
        name: "50kW DC Fast Charging Station",
        description:
          "Commercial DC fast charging station with dual connector support",
        category: "chargers",
        subcategory: "dc-chargers",
        brand: "ABB",
        model: "Terra 54",
        specifications: {
          powerRating: "50kW",
          inputVoltage: "400V AC 3-phase",
          outputVoltage: "150-920V DC",
          connectorTypes: ["CCS2", "CHAdeMO"],
          dimensions: "700 x 500 x 1700 mm",
          weight: "380kg",
          protection: "IP54",
        },
        pricing: {
          cost: 35000,
          listPrice: 50000,
          recommendedRetail: 65000,
        },
        inventory: {
          inStock: 8,
          reserved: 2,
          available: 6,
          leadTime: "2-3 weeks",
        },
        supplier: {
          id: "sup-2",
          name: "ABB",
          partNumber: "TERRA54CJ",
          minimumOrderQuantity: 1,
        },
        images: [],
        documents: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return category
      ? mockItems.filter((item) => item.category === category)
      : mockItems;
  }

  addProductToQuote(
    quoteId: string,
    productId: string,
    quantity: number = 1,
  ): Quote | null {
    const product = this.getProductCatalogueItems().find(
      (p) => p.id === productId,
    );
    if (!product) return null;

    const lineItem: Omit<QuoteLineItem, "id" | "totalPrice"> = {
      type: "charger",
      productId: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity,
      unitPrice: product.pricing.recommendedRetail,
      cost: product.pricing.cost,
      markup: this.calculateMarginForCategory(product.category),
      unit: "each",
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

  // Quote workflow and status management
  sendQuote(quoteId: string): Quote | null {
    const quote = this.getQuote(quoteId);
    if (!quote) return null;

    quote.status = "sent";
    quote.sentAt = new Date().toISOString();

    return this.updateQuote(quote);
  }

  acceptQuote(quoteId: string, clientDecision: ClientDecision): Quote | null {
    const quote = this.getQuote(quoteId);
    if (!quote) return null;

    quote.status = "accepted";
    quote.acceptedAt = clientDecision.timestamp;

    // Add comment with client acceptance
    quote.comments.push({
      id: `comment-${Date.now()}`,
      userId: "client",
      userName: quote.clientInfo.contactPerson,
      message: clientDecision.comments || "Quote accepted",
      timestamp: clientDecision.timestamp,
      isInternal: false,
    });

    return this.updateQuote(quote);
  }

  rejectQuote(quoteId: string, clientDecision: ClientDecision): Quote | null {
    const quote = this.getQuote(quoteId);
    if (!quote) return null;

    quote.status = "rejected";

    // Add comment with rejection reason
    quote.comments.push({
      id: `comment-${Date.now()}`,
      userId: "client",
      userName: quote.clientInfo.contactPerson,
      message: clientDecision.comments || "Quote rejected",
      timestamp: clientDecision.timestamp,
      isInternal: false,
    });

    return this.updateQuote(quote);
  }

  // Analytics and reporting
  getQuoteAnalytics(): QuoteAnalytics {
    const totalQuotes = this.quotes.length;
    const totalValue = this.quotes.reduce(
      (sum, quote) => sum + quote.totals.total,
      0,
    );
    const acceptedQuotes = this.quotes.filter(
      (q) => q.status === "accepted",
    ).length;
    const conversionRate =
      totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    const averageQuoteValue = totalQuotes > 0 ? totalValue / totalQuotes : 0;

    const statusBreakdown = this.quotes.reduce(
      (acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalQuotes,
      totalValue,
      conversionRate,
      averageQuoteValue,
      averageResponseTime: 2.5, // Mock data
      statusBreakdown,
      monthlyTrends: [], // Will be implemented with time-series data
      topProducts: [], // Will be implemented with product analytics
    };
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
    if (this.templates.length === 0) {
      const defaultTemplates = [
        {
          name: "Residential AC Charging Package",
          description:
            "Standard package for residential single or dual AC charger installation",
          category: "residential",
          isDefault: true,
          lineItems: [
            {
              type: "charger" as const,
              name: "7kW AC Charging Station",
              description:
                "Wall-mounted AC charging station with Type 2 connector",
              category: "chargers",
              quantity: 1,
              unitPrice: 2400,
              cost: 1680,
              markup: 30,
              unit: "each" as const,
            },
            {
              type: "installation" as const,
              name: "Standard Installation",
              description:
                "Professional installation including electrical work and commissioning",
              category: "installation",
              quantity: 1,
              unitPrice: 1500,
              cost: 900,
              markup: 50,
              unit: "each" as const,
            },
            {
              type: "service" as const,
              name: "Annual Maintenance",
              description: "12-month maintenance and support package",
              category: "service",
              quantity: 1,
              unitPrice: 300,
              cost: 120,
              markup: 60,
              unit: "each" as const,
              isOptional: true,
            },
          ],
          settings: {
            validityDays: 30,
            terms: "Payment is due within 30 days of invoice date.",
            notes:
              "Installation includes all necessary electrical work and permits.",
            paymentTerms: "30 days net",
            warranty: "24 months parts and labour warranty",
            deliveryTerms: "Standard delivery 5-10 business days",
          },
          createdBy: "system",
        },
        {
          name: "Commercial DC Fast Charging Hub",
          description:
            "Complete commercial DC fast charging solution with multiple units",
          category: "commercial",
          isDefault: true,
          lineItems: [
            {
              type: "charger" as const,
              name: "50kW DC Fast Charging Station",
              description:
                "Commercial DC fast charger with CCS2 and CHAdeMO connectors",
              category: "chargers",
              quantity: 4,
              unitPrice: 65000,
              cost: 45500,
              markup: 25,
              unit: "each" as const,
            },
            {
              type: "installation" as const,
              name: "Commercial Installation Package",
              description:
                "Complete installation including site preparation, electrical work, and commissioning",
              category: "installation",
              quantity: 1,
              unitPrice: 45000,
              cost: 27000,
              markup: 40,
              unit: "each" as const,
            },
            {
              type: "accessory" as const,
              name: "Weather Protection Canopy",
              description:
                "Protective canopy structure for outdoor installation",
              category: "accessories",
              quantity: 2,
              unitPrice: 8500,
              cost: 5950,
              markup: 35,
              unit: "each" as const,
            },
            {
              type: "service" as const,
              name: "Premium Maintenance Package",
              description: "24/7 monitoring and maintenance for 24 months",
              category: "service",
              quantity: 1,
              unitPrice: 12000,
              cost: 4800,
              markup: 60,
              unit: "each" as const,
            },
          ],
          settings: {
            validityDays: 60,
            terms:
              "Payment terms: 30% deposit, 40% on delivery, 30% on completion.",
            notes:
              "Project includes all necessary permits, grid connection coordination, and compliance certifications.",
            paymentTerms: "Staged payments as per contract",
            warranty: "36 months comprehensive warranty with 24/7 support",
            deliveryTerms: "8-12 weeks from order confirmation",
          },
          createdBy: "system",
        },
      ];

      defaultTemplates.forEach((template) => {
        this.createTemplate(template);
      });
    }
  }
}

export const quoteService = new QuoteService();
export default quoteService;
