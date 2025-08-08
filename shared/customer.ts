import { z } from 'zod';

// Customer data validation schemas
export const CustomerSchema = z.object({
  id: z.string(),
  externalId: z.string().optional(), // CRM system ID
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  source: z.enum(['hubspot', 'pipedrive', 'native']),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastSyncAt: z.string().optional(),
});

export const CustomerContactSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  type: z.enum(['email', 'phone', 'meeting', 'note']),
  subject: z.string(),
  content: z.string(),
  timestamp: z.string(),
  externalId: z.string().optional(),
});

export const CustomerDealSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  title: z.string(),
  value: z.number(),
  stage: z.string(),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().optional(),
  externalId: z.string().optional(),
  source: z.enum(['hubspot', 'pipedrive', 'native']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerContact = z.infer<typeof CustomerContactSchema>;
export type CustomerDeal = z.infer<typeof CustomerDealSchema>;

// Sync configuration
export interface CRMConfig {
  provider: 'hubspot' | 'pipedrive' | 'native';
  apiKey?: string;
  domain?: string;
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  autoCreateProjects: boolean;
  autoSyncQuotes: boolean;
}

// Sync status and results
export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  timestamp: string;
}

export interface SyncStatus {
  isActive: boolean;
  lastSync: string | null;
  lastResult: SyncResult | null;
  nextSync: string | null;
}

// Provider interface for different CRM systems
export interface CustomerProvider {
  // Configuration
  readonly name: string;
  readonly requiresAuth: boolean;
  
  // Authentication
  authenticate(config: Partial<CRMConfig>): Promise<boolean>;
  isAuthenticated(): boolean;
  
  // Customer operations
  getCustomers(limit?: number, offset?: number): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<boolean>;
  
  // Deal operations
  getCustomerDeals(customerId: string): Promise<CustomerDeal[]>;
  createDeal(deal: Omit<CustomerDeal, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Promise<CustomerDeal>;
  updateDeal(id: string, updates: Partial<CustomerDeal>): Promise<CustomerDeal>;
  
  // Contact history
  getCustomerContacts(customerId: string): Promise<CustomerContact[]>;
  addContact(contact: Omit<CustomerContact, 'id'>): Promise<CustomerContact>;
  
  // Sync operations
  sync(): Promise<SyncResult>;
  getLastSyncStatus(): Promise<SyncStatus>;
  
  // Project integration
  linkProjectToCustomer(projectId: string, customerId: string): Promise<boolean>;
  linkQuoteToCustomer(quoteId: string, customerId: string): Promise<boolean>;
  notifyQuoteStatusChange(quoteId: string, status: string, customerId: string): Promise<boolean>;
}

// Events for real-time updates
export interface CustomerSyncEvent {
  type: 'customer.created' | 'customer.updated' | 'customer.deleted' | 
        'deal.created' | 'deal.updated' | 'contact.added' | 'sync.completed';
  customerId?: string;
  data: any;
  timestamp: string;
  source: 'hubspot' | 'pipedrive' | 'native';
}

// Search and filter interfaces
export interface CustomerSearchFilters {
  query?: string;
  source?: 'hubspot' | 'pipedrive' | 'native' | 'all';
  tags?: string[];
  hasActiveDeals?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

export interface CustomerListOptions {
  filters?: CustomerSearchFilters;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'company';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
