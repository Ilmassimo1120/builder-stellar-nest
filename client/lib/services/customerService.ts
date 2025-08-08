import { 
  Customer, 
  CustomerProvider, 
  CustomerDeal, 
  CustomerContact, 
  CRMConfig,
  SyncResult,
  SyncStatus,
  CustomerSyncEvent,
  CustomerListOptions,
  CustomerSearchFilters
} from '@shared/customer';
import { NativeCustomerProvider } from './customerProviders/nativeProvider';
import { HubSpotCustomerProvider } from './customerProviders/hubspotProvider';
import { PipedriveCustomerProvider } from './customerProviders/pipedriveProvider';

export class CustomerService {
  private providers: Map<string, CustomerProvider> = new Map();
  private activeProvider: CustomerProvider;
  private config: CRMConfig;
  private eventListeners: Map<string, ((event: CustomerSyncEvent) => void)[]> = new Map();

  constructor() {
    // Initialize providers
    this.providers.set('native', new NativeCustomerProvider());
    this.providers.set('hubspot', new HubSpotCustomerProvider());
    this.providers.set('pipedrive', new PipedriveCustomerProvider());

    // Load configuration
    this.config = this.loadConfig();
    
    // Set active provider
    this.activeProvider = this.providers.get(this.config.provider) || this.providers.get('native')!;
  }

  // Configuration Management
  async setConfig(config: Partial<CRMConfig>): Promise<boolean> {
    const newConfig = { ...this.config, ...config };
    
    try {
      // Validate and authenticate with new provider if changed
      if (config.provider && config.provider !== this.config.provider) {
        const newProvider = this.providers.get(config.provider);
        if (!newProvider) {
          throw new Error(`Provider ${config.provider} not found`);
        }

        if (newProvider.requiresAuth) {
          const authSuccess = await newProvider.authenticate(newConfig);
          if (!authSuccess) {
            throw new Error(`Authentication failed for ${config.provider}`);
          }
        }

        this.activeProvider = newProvider;
      } else if (this.activeProvider.requiresAuth && (config.apiKey || config.domain)) {
        // Re-authenticate if credentials changed
        const authSuccess = await this.activeProvider.authenticate(newConfig);
        if (!authSuccess) {
          throw new Error('Authentication failed with new credentials');
        }
      }

      this.config = newConfig;
      this.saveConfig();
      
      this.emitEvent({
        type: 'sync.completed',
        data: { configUpdated: true },
        timestamp: new Date().toISOString(),
        source: this.config.provider,
      });

      return true;
    } catch (error) {
      console.error('Error setting customer service config:', error);
      return false;
    }
  }

  getConfig(): CRMConfig {
    return { ...this.config };
  }

  getActiveProvider(): CustomerProvider {
    return this.activeProvider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  // Customer Operations
  async getCustomers(options?: CustomerListOptions): Promise<Customer[]> {
    try {
      let customers: Customer[] = [];

      if (options?.filters?.source === 'all') {
        // Get customers from all providers
        const allCustomers = await Promise.all(
          Array.from(this.providers.values()).map(async (provider) => {
            try {
              if (provider.requiresAuth && !provider.isAuthenticated()) {
                return [];
              }
              return await provider.getCustomers(options.limit, options.offset);
            } catch (error) {
              console.warn(`Error fetching from ${provider.name}:`, error);
              return [];
            }
          })
        );
        customers = allCustomers.flat();
      } else if (options?.filters?.source && options.filters.source !== this.config.provider) {
        // Get customers from specific provider
        const provider = this.providers.get(options.filters.source);
        if (provider && (!provider.requiresAuth || provider.isAuthenticated())) {
          customers = await provider.getCustomers(options.limit, options.offset);
        }
      } else {
        // Get customers from active provider
        customers = await this.activeProvider.getCustomers(options?.limit, options?.offset);
      }

      // Apply filters
      if (options?.filters) {
        customers = this.applyFilters(customers, options.filters);
      }

      // Apply sorting
      if (options?.sortBy) {
        customers = this.sortCustomers(customers, options.sortBy, options.sortOrder);
      }

      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  async getCustomer(id: string): Promise<Customer | null> {
    try {
      // Try to determine provider from ID format
      const provider = this.detectProviderFromId(id);
      if (provider && provider !== this.activeProvider) {
        return await provider.getCustomer(id);
      }
      
      return await this.activeProvider.getCustomer(id);
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Promise<Customer> {
    try {
      const customer = await this.activeProvider.createCustomer(customerData);
      
      this.emitEvent({
        type: 'customer.created',
        customerId: customer.id,
        data: customer,
        timestamp: new Date().toISOString(),
        source: this.config.provider,
      });

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const provider = this.detectProviderFromId(id) || this.activeProvider;
      const customer = await provider.updateCustomer(id, updates);
      
      this.emitEvent({
        type: 'customer.updated',
        customerId: customer.id,
        data: { updates, customer },
        timestamp: new Date().toISOString(),
        source: this.config.provider,
      });

      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const provider = this.detectProviderFromId(id) || this.activeProvider;
      const success = await provider.deleteCustomer(id);
      
      if (success) {
        this.emitEvent({
          type: 'customer.deleted',
          customerId: id,
          data: { deleted: true },
          timestamp: new Date().toISOString(),
          source: this.config.provider,
        });
      }

      return success;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  }

  // Deal Operations
  async getCustomerDeals(customerId: string): Promise<CustomerDeal[]> {
    try {
      const provider = this.detectProviderFromId(customerId) || this.activeProvider;
      return await provider.getCustomerDeals(customerId);
    } catch (error) {
      console.error('Error fetching customer deals:', error);
      return [];
    }
  }

  async createDeal(dealData: Omit<CustomerDeal, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Promise<CustomerDeal> {
    try {
      const provider = this.detectProviderFromId(dealData.customerId) || this.activeProvider;
      const deal = await provider.createDeal(dealData);
      
      this.emitEvent({
        type: 'deal.created',
        customerId: dealData.customerId,
        data: deal,
        timestamp: new Date().toISOString(),
        source: this.config.provider,
      });

      return deal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async updateDeal(id: string, updates: Partial<CustomerDeal>): Promise<CustomerDeal> {
    try {
      const provider = this.detectProviderFromId(id) || this.activeProvider;
      const deal = await provider.updateDeal(id, updates);
      
      this.emitEvent({
        type: 'deal.updated',
        customerId: deal.customerId,
        data: { updates, deal },
        timestamp: new Date().toISOString(),
        source: this.config.provider,
      });

      return deal;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  // Contact History
  async getCustomerContacts(customerId: string): Promise<CustomerContact[]> {
    try {
      const provider = this.detectProviderFromId(customerId) || this.activeProvider;
      return await provider.getCustomerContacts(customerId);
    } catch (error) {
      console.error('Error fetching customer contacts:', error);
      return [];
    }
  }

  async addContact(contact: Omit<CustomerContact, 'id'>): Promise<CustomerContact> {
    try {
      const provider = this.detectProviderFromId(contact.customerId) || this.activeProvider;
      const createdContact = await provider.addContact(contact);
      
      this.emitEvent({
        type: 'contact.added',
        customerId: contact.customerId,
        data: createdContact,
        timestamp: new Date().toISOString(),
        source: this.config.provider,
      });

      return createdContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }

  // Sync Operations
  async sync(providerName?: string): Promise<SyncResult> {
    try {
      if (providerName) {
        const provider = this.providers.get(providerName);
        if (!provider) {
          throw new Error(`Provider ${providerName} not found`);
        }
        return await provider.sync();
      }

      const result = await this.activeProvider.sync();
      
      this.emitEvent({
        type: 'sync.completed',
        data: result,
        timestamp: new Date().toISOString(),
        source: this.config.provider,
      });

      return result;
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }

  async getSyncStatus(providerName?: string): Promise<SyncStatus> {
    try {
      if (providerName) {
        const provider = this.providers.get(providerName);
        if (!provider) {
          throw new Error(`Provider ${providerName} not found`);
        }
        return await provider.getLastSyncStatus();
      }

      return await this.activeProvider.getLastSyncStatus();
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isActive: false,
        lastSync: null,
        lastResult: null,
        nextSync: null,
      };
    }
  }

  // Project and Quote Integration
  async linkProjectToCustomer(projectId: string, customerId: string): Promise<boolean> {
    try {
      const provider = this.detectProviderFromId(customerId) || this.activeProvider;
      return await provider.linkProjectToCustomer(projectId, customerId);
    } catch (error) {
      console.error('Error linking project to customer:', error);
      return false;
    }
  }

  async linkQuoteToCustomer(quoteId: string, customerId: string): Promise<boolean> {
    try {
      const provider = this.detectProviderFromId(customerId) || this.activeProvider;
      return await provider.linkQuoteToCustomer(quoteId, customerId);
    } catch (error) {
      console.error('Error linking quote to customer:', error);
      return false;
    }
  }

  async notifyQuoteStatusChange(quoteId: string, status: string, customerId: string): Promise<boolean> {
    try {
      const provider = this.detectProviderFromId(customerId) || this.activeProvider;
      return await provider.notifyQuoteStatusChange(quoteId, status, customerId);
    } catch (error) {
      console.error('Error notifying quote status change:', error);
      return false;
    }
  }

  // Search functionality
  async searchCustomers(query: string, filters?: CustomerSearchFilters): Promise<Customer[]> {
    const searchFilters: CustomerSearchFilters = { ...filters, query };
    const options: CustomerListOptions = { filters: searchFilters };
    return await this.getCustomers(options);
  }

  // Event System
  addEventListener(eventType: string, callback: (event: CustomerSyncEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (event: CustomerSyncEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: CustomerSyncEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Helper Methods
  private detectProviderFromId(id: string): CustomerProvider | null {
    if (id.startsWith('hubspot_')) {
      return this.providers.get('hubspot') || null;
    }
    if (id.startsWith('pipedrive_')) {
      return this.providers.get('pipedrive') || null;
    }
    if (id.startsWith('native_')) {
      return this.providers.get('native') || null;
    }
    return null;
  }

  private applyFilters(customers: Customer[], filters: CustomerSearchFilters): Customer[] {
    let filtered = customers;

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.company && customer.company.toLowerCase().includes(query))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(customer => 
        filters.tags!.some(tag => customer.tags.includes(tag))
      );
    }

    if (filters.createdAfter) {
      filtered = filtered.filter(customer => 
        new Date(customer.createdAt) >= new Date(filters.createdAfter!)
      );
    }

    if (filters.createdBefore) {
      filtered = filtered.filter(customer => 
        new Date(customer.createdAt) <= new Date(filters.createdBefore!)
      );
    }

    return filtered;
  }

  private sortCustomers(customers: Customer[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Customer[] {
    return customers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'company':
          aValue = (a.company || '').toLowerCase();
          bValue = (b.company || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private loadConfig(): CRMConfig {
    try {
      const stored = localStorage.getItem('customerServiceConfig');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading customer service config:', error);
    }

    // Default configuration
    return {
      provider: 'native',
      syncEnabled: false,
      syncFrequency: 'hourly',
      autoCreateProjects: false,
      autoSyncQuotes: false,
    };
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('customerServiceConfig', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Error saving customer service config:', error);
    }
  }

  // Utility method to get customer for project/quote
  async getProjectCustomer(projectId: string): Promise<Customer | null> {
    try {
      // Try native provider first (which stores project links)
      const nativeProvider = this.providers.get('native') as NativeCustomerProvider;
      const customerId = nativeProvider?.getProjectCustomer?.(projectId);
      
      if (customerId) {
        return await this.getCustomer(customerId);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting project customer:', error);
      return null;
    }
  }

  async getQuoteCustomer(quoteId: string): Promise<Customer | null> {
    try {
      // Try native provider first (which stores quote links)
      const nativeProvider = this.providers.get('native') as NativeCustomerProvider;
      const customerId = nativeProvider?.getQuoteCustomer?.(quoteId);
      
      if (customerId) {
        return await this.getCustomer(customerId);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting quote customer:', error);
      return null;
    }
  }
}

// Singleton instance
export const customerService = new CustomerService();
