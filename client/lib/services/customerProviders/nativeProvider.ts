import {
  Customer,
  CustomerProvider,
  CustomerDeal,
  CustomerContact,
  CRMConfig,
  SyncResult,
  SyncStatus,
} from "@shared/customer";

export class NativeCustomerProvider implements CustomerProvider {
  readonly name = "native";
  readonly requiresAuth = false;

  private customers: Customer[] = [];
  private deals: CustomerDeal[] = [];
  private contacts: CustomerContact[] = [];
  private lastSyncTime: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  async authenticate(): Promise<boolean> {
    return true; // Native provider doesn't require authentication
  }

  isAuthenticated(): boolean {
    return true;
  }

  async getCustomers(limit = 100, offset = 0): Promise<Customer[]> {
    const start = offset;
    const end = offset + limit;
    return this.customers.slice(start, end);
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customers.find((c) => c.id === id) || null;
  }

  async createCustomer(
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt" | "source">,
  ): Promise<Customer> {
    const now = new Date().toISOString();
    const customer: Customer = {
      ...customerData,
      id: `native_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: "native",
      createdAt: now,
      updatedAt: now,
    };

    this.customers.push(customer);
    this.saveToStorage();
    return customer;
  }

  async updateCustomer(
    id: string,
    updates: Partial<Customer>,
  ): Promise<Customer> {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }

    const updatedCustomer = {
      ...this.customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.customers[index] = updatedCustomer;
    this.saveToStorage();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) {
      return false;
    }

    this.customers.splice(index, 1);

    // Also remove associated deals and contacts
    this.deals = this.deals.filter((d) => d.customerId !== id);
    this.contacts = this.contacts.filter((c) => c.customerId !== id);

    this.saveToStorage();
    return true;
  }

  async getCustomerDeals(customerId: string): Promise<CustomerDeal[]> {
    return this.deals.filter((d) => d.customerId === customerId);
  }

  async createDeal(
    dealData: Omit<CustomerDeal, "id" | "createdAt" | "updatedAt" | "source">,
  ): Promise<CustomerDeal> {
    const now = new Date().toISOString();
    const deal: CustomerDeal = {
      ...dealData,
      id: `native_deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: "native",
      createdAt: now,
      updatedAt: now,
    };

    this.deals.push(deal);
    this.saveToStorage();
    return deal;
  }

  async updateDeal(
    id: string,
    updates: Partial<CustomerDeal>,
  ): Promise<CustomerDeal> {
    const index = this.deals.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Deal with id ${id} not found`);
    }

    const updatedDeal = {
      ...this.deals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.deals[index] = updatedDeal;
    this.saveToStorage();
    return updatedDeal;
  }

  async getCustomerContacts(customerId: string): Promise<CustomerContact[]> {
    return this.contacts.filter((c) => c.customerId === customerId);
  }

  async addContact(
    contactData: Omit<CustomerContact, "id">,
  ): Promise<CustomerContact> {
    const contact: CustomerContact = {
      ...contactData,
      id: `native_contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.contacts.push(contact);
    this.saveToStorage();
    return contact;
  }

  async sync(): Promise<SyncResult> {
    // For native provider, sync just validates and cleans up data
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    try {
      // Validate all customers
      for (const customer of this.customers) {
        recordsProcessed++;
        try {
          // Basic validation - could add more sophisticated checks
          if (!customer.email || !customer.name) {
            errors.push(`Customer ${customer.id} is missing required fields`);
          }
        } catch (error) {
          errors.push(`Error validating customer ${customer.id}: ${error}`);
        }
      }

      this.lastSyncTime = new Date().toISOString();
      this.saveToStorage();

      return {
        success: errors.length === 0,
        recordsProcessed,
        recordsCreated: 0,
        recordsUpdated,
        recordsFailed: errors.length,
        errors,
        timestamp: this.lastSyncTime,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: recordsProcessed,
        errors: [`Sync failed: ${error}`],
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getLastSyncStatus(): Promise<SyncStatus> {
    return {
      isActive: false,
      lastSync: this.lastSyncTime,
      lastResult: null, // Could store this if needed
      nextSync: null, // Native provider doesn't have scheduled syncs
    };
  }

  async linkProjectToCustomer(
    projectId: string,
    customerId: string,
  ): Promise<boolean> {
    // For native provider, we'll store project links in local storage
    const projectLinks = this.getProjectLinks();
    projectLinks[projectId] = customerId;
    localStorage.setItem("customerProjectLinks", JSON.stringify(projectLinks));
    return true;
  }

  async linkQuoteToCustomer(
    quoteId: string,
    customerId: string,
  ): Promise<boolean> {
    // For native provider, we'll store quote links in local storage
    const quoteLinks = this.getQuoteLinks();
    quoteLinks[quoteId] = customerId;
    localStorage.setItem("customerQuoteLinks", JSON.stringify(quoteLinks));
    return true;
  }

  async notifyQuoteStatusChange(
    quoteId: string,
    status: string,
    customerId: string,
  ): Promise<boolean> {
    // Add a contact record for the status change
    await this.addContact({
      customerId,
      type: "note",
      subject: "Quote Status Updated",
      content: `Quote ${quoteId} status changed to: ${status}`,
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  // Helper methods for storage
  private loadFromStorage(): void {
    try {
      this.customers = safeGetLocal("nativeCustomers", []);
      this.deals = safeGetLocal("nativeDeals", []);
      this.contacts = safeGetLocal("nativeContacts", []);
      this.lastSyncTime = safeGetLocal("nativeLastSync", null);
    } catch (error) {
      console.warn("Error loading customer data from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("nativeCustomers", JSON.stringify(this.customers));
      localStorage.setItem("nativeDeals", JSON.stringify(this.deals));
      localStorage.setItem("nativeContacts", JSON.stringify(this.contacts));
      if (this.lastSyncTime) {
        localStorage.setItem("nativeLastSync", this.lastSyncTime);
      }
    } catch (error) {
      console.warn("Error saving customer data to storage:", error);
    }
  }

  private getProjectLinks(): Record<string, string> {
    try {
      const links = safeGetLocal("customerProjectLinks", {});
      return links || {};
    } catch {
      return {};
    }
  }

  private getQuoteLinks(): Record<string, string> {
    try {
      const links = safeGetLocal("customerQuoteLinks", {});
      return links || {};
    } catch {
      return {};
    }
  }

  // Public method to get linked customers
  getProjectCustomer(projectId: string): string | null {
    const links = this.getProjectLinks();
    return links[projectId] || null;
  }

  getQuoteCustomer(quoteId: string): string | null {
    const links = this.getQuoteLinks();
    return links[quoteId] || null;
  }
}
