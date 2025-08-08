import { 
  Customer, 
  CustomerProvider, 
  CustomerDeal, 
  CustomerContact, 
  CRMConfig,
  SyncResult,
  SyncStatus
} from '@shared/customer';

export class HubSpotCustomerProvider implements CustomerProvider {
  readonly name = 'hubspot';
  readonly requiresAuth = true;
  
  private config: CRMConfig | null = null;
  private isAuth = false;
  private baseUrl = 'https://api.hubapi.com';

  async authenticate(config: Partial<CRMConfig>): Promise<boolean> {
    if (!config.apiKey) {
      throw new Error('HubSpot API key is required');
    }

    try {
      // Test the API key by making a simple request
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts?limit=1`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.config = {
          provider: 'hubspot',
          apiKey: config.apiKey,
          syncEnabled: config.syncEnabled ?? true,
          syncFrequency: config.syncFrequency ?? 'hourly',
          autoCreateProjects: config.autoCreateProjects ?? false,
          autoSyncQuotes: config.autoSyncQuotes ?? true,
        };
        this.isAuth = true;
        return true;
      } else {
        console.error('HubSpot authentication failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('HubSpot authentication error:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.isAuth && !!this.config?.apiKey;
  }

  async getCustomers(limit = 100, offset = 0): Promise<Customer[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/crm/v3/objects/contacts?limit=${limit}&offset=${offset}&properties=email,firstname,lastname,company,phone,address,city,state,zip,country,createdate,lastmodifieddate`,
        {
          headers: {
            'Authorization': `Bearer ${this.config!.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.results.map((contact: any) => this.mapHubSpotContactToCustomer(contact));
    } catch (error) {
      console.error('Error fetching customers from HubSpot:', error);
      throw error;
    }
  }

  async getCustomer(id: string): Promise<Customer | null> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      // Check if it's a HubSpot ID (numeric) or our internal ID
      const hubspotId = id.startsWith('hubspot_') ? id.replace('hubspot_', '') : id;
      
      const response = await fetch(
        `${this.baseUrl}/crm/v3/objects/contacts/${hubspotId}?properties=email,firstname,lastname,company,phone,address,city,state,zip,country,createdate,lastmodifieddate`,
        {
          headers: {
            'Authorization': `Bearer ${this.config!.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const contact = await response.json();
      return this.mapHubSpotContactToCustomer(contact);
    } catch (error) {
      console.error('Error fetching customer from HubSpot:', error);
      return null;
    }
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Promise<Customer> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      const hubspotData = this.mapCustomerToHubSpot(customerData);
      
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: hubspotData }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const createdContact = await response.json();
      return this.mapHubSpotContactToCustomer(createdContact);
    } catch (error) {
      console.error('Error creating customer in HubSpot:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      const hubspotId = id.startsWith('hubspot_') ? id.replace('hubspot_', '') : id;
      const hubspotData = this.mapCustomerToHubSpot(updates);
      
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${hubspotId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: hubspotData }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const updatedContact = await response.json();
      return this.mapHubSpotContactToCustomer(updatedContact);
    } catch (error) {
      console.error('Error updating customer in HubSpot:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      const hubspotId = id.startsWith('hubspot_') ? id.replace('hubspot_', '') : id;
      
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${hubspotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting customer in HubSpot:', error);
      return false;
    }
  }

  async getCustomerDeals(customerId: string): Promise<CustomerDeal[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      const hubspotId = customerId.startsWith('hubspot_') ? customerId.replace('hubspot_', '') : customerId;
      
      // Get deals associated with this contact
      const response = await fetch(
        `${this.baseUrl}/crm/v4/objects/contacts/${hubspotId}/associations/deals`,
        {
          headers: {
            'Authorization': `Bearer ${this.config!.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const associations = await response.json();
      const dealIds = associations.results.map((assoc: any) => assoc.toObjectId);

      if (dealIds.length === 0) {
        return [];
      }

      // Fetch deal details
      const dealsResponse = await fetch(
        `${this.baseUrl}/crm/v3/objects/deals/batch/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: dealIds.map((id: string) => ({ id })),
            properties: ['dealname', 'amount', 'dealstage', 'probability', 'closedate', 'createdate', 'hs_lastmodifieddate'],
          }),
        }
      );

      if (!dealsResponse.ok) {
        throw new Error(`HubSpot API error: ${dealsResponse.statusText}`);
      }

      const dealsData = await dealsResponse.json();
      return dealsData.results.map((deal: any) => this.mapHubSpotDealToCustomerDeal(deal, customerId));
    } catch (error) {
      console.error('Error fetching customer deals from HubSpot:', error);
      return [];
    }
  }

  async createDeal(dealData: Omit<CustomerDeal, 'id' | 'createdAt' | 'updatedAt' | 'source'>): Promise<CustomerDeal> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      const hubspotData = {
        dealname: dealData.title,
        amount: dealData.value.toString(),
        dealstage: dealData.stage,
        probability: dealData.probability.toString(),
        closedate: dealData.expectedCloseDate,
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: hubspotData }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const createdDeal = await response.json();
      
      // Associate deal with contact
      const hubspotContactId = dealData.customerId.startsWith('hubspot_') 
        ? dealData.customerId.replace('hubspot_', '') 
        : dealData.customerId;

      await fetch(
        `${this.baseUrl}/crm/v4/objects/deals/${createdDeal.id}/associations/contacts/${hubspotContactId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.config!.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 4, // Deal to Contact association
          }]),
        }
      );

      return this.mapHubSpotDealToCustomerDeal(createdDeal, dealData.customerId);
    } catch (error) {
      console.error('Error creating deal in HubSpot:', error);
      throw error;
    }
  }

  async updateDeal(id: string, updates: Partial<CustomerDeal>): Promise<CustomerDeal> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    try {
      const hubspotId = id.startsWith('hubspot_deal_') ? id.replace('hubspot_deal_', '') : id;
      
      const hubspotData: any = {};
      if (updates.title) hubspotData.dealname = updates.title;
      if (updates.value !== undefined) hubspotData.amount = updates.value.toString();
      if (updates.stage) hubspotData.dealstage = updates.stage;
      if (updates.probability !== undefined) hubspotData.probability = updates.probability.toString();
      if (updates.expectedCloseDate) hubspotData.closedate = updates.expectedCloseDate;

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals/${hubspotId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: hubspotData }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const updatedDeal = await response.json();
      return this.mapHubSpotDealToCustomerDeal(updatedDeal, updates.customerId!);
    } catch (error) {
      console.error('Error updating deal in HubSpot:', error);
      throw error;
    }
  }

  async getCustomerContacts(customerId: string): Promise<CustomerContact[]> {
    // HubSpot doesn't have a direct "contacts/interactions" endpoint
    // This would typically integrate with HubSpot's engagement/activity APIs
    // For now, return empty array - could be enhanced with activity timeline
    return [];
  }

  async addContact(contact: Omit<CustomerContact, 'id'>): Promise<CustomerContact> {
    // This would create an engagement/note in HubSpot
    // For now, return a mock contact - could be enhanced with engagement API
    return {
      ...contact,
      id: `hubspot_contact_${Date.now()}`,
      externalId: `engagement_${Date.now()}`,
    };
  }

  async sync(): Promise<SyncResult> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with HubSpot');
    }

    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    try {
      // This would implement a full sync with HubSpot
      // For now, just return a basic result
      const timestamp = new Date().toISOString();
      
      return {
        success: true,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        recordsFailed: errors.length,
        errors,
        timestamp,
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
      lastSync: null,
      lastResult: null,
      nextSync: null,
    };
  }

  async linkProjectToCustomer(projectId: string, customerId: string): Promise<boolean> {
    // This would create a custom property or engagement in HubSpot
    return true;
  }

  async linkQuoteToCustomer(quoteId: string, customerId: string): Promise<boolean> {
    // This would create a custom property or engagement in HubSpot
    return true;
  }

  async notifyQuoteStatusChange(quoteId: string, status: string, customerId: string): Promise<boolean> {
    // This would create an engagement/note in HubSpot
    return true;
  }

  // Helper methods for data mapping
  private mapHubSpotContactToCustomer(contact: any): Customer {
    const props = contact.properties;
    
    return {
      id: `hubspot_${contact.id}`,
      externalId: contact.id,
      name: `${props.firstname || ''} ${props.lastname || ''}`.trim() || props.email,
      email: props.email || '',
      phone: props.phone || undefined,
      company: props.company || undefined,
      address: {
        street: props.address || undefined,
        city: props.city || undefined,
        state: props.state || undefined,
        postalCode: props.zip || undefined,
        country: props.country || undefined,
      },
      tags: [],
      customFields: {},
      source: 'hubspot',
      createdAt: props.createdate || new Date().toISOString(),
      updatedAt: props.lastmodifieddate || new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
    };
  }

  private mapCustomerToHubSpot(customer: Partial<Customer>): any {
    const hubspotData: any = {};
    
    if (customer.name) {
      const nameParts = customer.name.split(' ');
      hubspotData.firstname = nameParts[0];
      if (nameParts.length > 1) {
        hubspotData.lastname = nameParts.slice(1).join(' ');
      }
    }
    
    if (customer.email) hubspotData.email = customer.email;
    if (customer.phone) hubspotData.phone = customer.phone;
    if (customer.company) hubspotData.company = customer.company;
    
    if (customer.address) {
      if (customer.address.street) hubspotData.address = customer.address.street;
      if (customer.address.city) hubspotData.city = customer.address.city;
      if (customer.address.state) hubspotData.state = customer.address.state;
      if (customer.address.postalCode) hubspotData.zip = customer.address.postalCode;
      if (customer.address.country) hubspotData.country = customer.address.country;
    }
    
    return hubspotData;
  }

  private mapHubSpotDealToCustomerDeal(deal: any, customerId: string): CustomerDeal {
    const props = deal.properties;
    
    return {
      id: `hubspot_deal_${deal.id}`,
      customerId,
      title: props.dealname || 'Untitled Deal',
      value: parseFloat(props.amount || '0'),
      stage: props.dealstage || 'new',
      probability: parseInt(props.probability || '0'),
      expectedCloseDate: props.closedate || undefined,
      externalId: deal.id,
      source: 'hubspot',
      createdAt: props.createdate || new Date().toISOString(),
      updatedAt: props.hs_lastmodifieddate || new Date().toISOString(),
    };
  }
}
