// Quote system data models and interfaces for the Smart Quoting Engine (CPQ)

export interface QuoteLineItem {
  id: string;
  type: "charger" | "accessory" | "installation" | "service" | "custom";
  productId?: string; // For future Product Catalogue integration
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  markup: number; // Markup percentage
  cost: number; // Base cost before markup
  unit: "each" | "hour" | "meter" | "sqm" | "linear_meter";
  specifications?: Record<string, any>;
  supplierInfo?: {
    supplierId?: string;
    supplierName?: string;
    partNumber?: string;
    leadTime?: string;
  };
  isOptional?: boolean;
  notes?: string;
}

export interface QuoteTotals {
  subtotal: number;
  gst: number;
  gstRate: number; // 10% for Australia
  discount: number;
  discountType: "percentage" | "fixed";
  total: number;
  totalExGst: number;
}

export interface ClientInfo {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  abn?: string;
  company: string;
}

export interface QuoteSettings {
  validityDays: number;
  terms: string;
  notes: string;
  paymentTerms: string;
  warranty: string;
  deliveryTerms: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  projectId?: string; // Links to project management system
  templateId?: string; // For quote templates
  version: number;
  status:
    | "draft"
    | "pending_review"
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected"
    | "expired";

  // Client information
  clientInfo: ClientInfo;

  // Quote content
  title: string;
  description: string;
  lineItems: QuoteLineItem[];
  totals: QuoteTotals;

  // Settings and terms
  settings: QuoteSettings;

  // Dates
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  validUntil: string;
  acceptedAt?: string;

  // User information
  createdBy: string;
  assignedTo?: string;

  // Integration data
  projectData?: {
    siteAddress?: string;
    siteType?: string;
    projectName?: string;
    estimatedInstallDate?: string;
  };

  // Client interaction
  clientViews: QuoteView[];
  comments: QuoteComment[];

  // File attachments
  attachments: QuoteAttachment[];

  // Approval workflow
  approvals: QuoteApproval[];
  requiresApproval: boolean;
}

export interface QuoteView {
  id: string;
  viewedAt: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number; // seconds spent viewing
}

export interface QuoteComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isInternal: boolean; // Internal notes vs client-visible comments
}

export interface QuoteAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface QuoteApproval {
  id: string;
  approverUserId: string;
  approverName: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  timestamp: string;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  lineItems: Omit<QuoteLineItem, "id" | "totalPrice">[];
  settings: QuoteSettings;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

// Quote builder state management
export interface QuoteBuilderState {
  quote: Quote;
  selectedLineItemId?: string;
  isEditing: boolean;
  isDirty: boolean;
  lastSaved?: string;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// Pricing calculation interfaces
export interface PricingRule {
  id: string;
  name: string;
  type: "volume_discount" | "early_payment" | "loyalty" | "seasonal" | "custom";
  condition: string;
  discount: number;
  discountType: "percentage" | "fixed";
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface MarginSettings {
  defaultMarkup: number;
  categoryMarkups: Record<string, number>;
  minimumMargin: number;
  maximumDiscount: number;
  volumeDiscounts: VolumeDiscount[];
}

export interface VolumeDiscount {
  minimumQuantity: number;
  discountPercentage: number;
  applicableCategories: string[];
}

// Product catalogue preparation interfaces
export interface ProductCatalogueItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  specifications: Record<string, any>;
  pricing: {
    cost: number;
    listPrice: number;
    recommendedRetail: number;
  };
  inventory: {
    inStock: number;
    reserved: number;
    available: number;
    leadTime: string;
  };
  supplier: {
    id: string;
    name: string;
    partNumber: string;
    minimumOrderQuantity: number;
  };
  images: string[];
  documents: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Client portal interfaces
export interface ClientPortalAccess {
  quoteId: string;
  accessToken: string;
  expiresAt: string;
  allowComments: boolean;
  allowDocumentDownload: boolean;
  trackViewing: boolean;
}

export interface ClientDecision {
  quoteId: string;
  decision: "accepted" | "rejected";
  timestamp: string;
  signature?: string;
  comments?: string;
  requestedChanges?: string[];
}

// Analytics and reporting interfaces
export interface QuoteAnalytics {
  totalQuotes: number;
  totalValue: number;
  conversionRate: number;
  averageQuoteValue: number;
  averageResponseTime: number;
  statusBreakdown: Record<string, number>;
  monthlyTrends: QuoteMetric[];
  topProducts: ProductMetric[];
}

export interface QuoteMetric {
  period: string;
  count: number;
  value: number;
  conversions: number;
}

export interface ProductMetric {
  productId: string;
  productName: string;
  quotedQuantity: number;
  quotedValue: number;
  conversions: number;
}

// Integration interfaces
export interface ProjectIntegration {
  projectId: string;
  projectName: string;
  clientRequirements: any; // From project wizard
  siteAssessment: any;
  chargerSelection: any;
  estimatedBudget: string;
  rawProjectData?: any; // Complete project data from project management system
}

export interface SupplierIntegration {
  supplierId: string;
  apiEndpoint: string;
  apiKey: string;
  productSync: boolean;
  pricingSync: boolean;
  inventorySync: boolean;
  lastSync: string;
}

// PDF generation interfaces
export interface PDFTemplate {
  id: string;
  name: string;
  type: "quote" | "invoice" | "proposal";
  template: string; // HTML template
  styles: string; // CSS styles
  variables: string[]; // Available template variables
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PDFGenerationOptions {
  templateId: string;
  includeTerms: boolean;
  includeAttachments: boolean;
  includeSpecifications: boolean;
  watermark?: string;
  headerLogo?: string;
  footerText?: string;
}

// Email templates for quote delivery
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

// Workflow automation
export interface QuoteWorkflow {
  id: string;
  name: string;
  trigger: "quote_created" | "quote_sent" | "quote_viewed" | "quote_expired";
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: "equals" | "greater_than" | "less_than" | "contains";
  value: any;
}

export interface WorkflowAction {
  type: "send_email" | "create_task" | "update_status" | "send_notification";
  parameters: Record<string, any>;
}

// Utility functions for quote operations
export const createEmptyQuote = (projectId?: string): Quote => {
  const now = new Date().toISOString();
  const quoteNumber = `QT-${Date.now()}`;

  return {
    id: `quote-${Date.now()}`,
    quoteNumber,
    projectId,
    version: 1,
    status: "draft",
    clientInfo: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      company: "",
    },
    title: "",
    description: "",
    lineItems: [],
    totals: {
      subtotal: 0,
      gst: 0,
      gstRate: 10,
      discount: 0,
      discountType: "percentage",
      total: 0,
      totalExGst: 0,
    },
    settings: {
      validityDays: 30,
      terms: "Payment is due within 30 days of invoice date.",
      notes: "",
      paymentTerms: "30 days net",
      warranty: "12 months parts and labour warranty",
      deliveryTerms: "Standard delivery 5-10 business days",
    },
    createdAt: now,
    updatedAt: now,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "",
    clientViews: [],
    comments: [],
    attachments: [],
    approvals: [],
    requiresApproval: false,
  };
};

export const calculateQuoteTotals = (
  lineItems: QuoteLineItem[],
  discount: number = 0,
  discountType: "percentage" | "fixed" = "percentage",
): QuoteTotals => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = subtotal * (discount / 100);
  } else {
    discountAmount = discount;
  }

  const totalExGst = subtotal - discountAmount;
  const gst = totalExGst * 0.1; // 10% GST for Australia
  const total = totalExGst + gst;

  return {
    subtotal,
    gst,
    gstRate: 10,
    discount: discountAmount,
    discountType,
    total,
    totalExGst,
  };
};

export const generateQuoteNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const timestamp = Date.now().toString().slice(-6);
  return `QT${year}${month}-${timestamp}`;
};
