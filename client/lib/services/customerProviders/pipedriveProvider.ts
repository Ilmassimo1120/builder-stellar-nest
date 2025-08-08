import {
  Customer,
  CustomerProvider,
  CustomerDeal,
  CustomerContact,
  CRMConfig,
  SyncResult,
  SyncStatus,
} from "@shared/customer";

export class PipedriveCustomerProvider implements CustomerProvider {
  readonly name = "pipedrive";
  readonly requiresAuth = true;

  private config: CRMConfig | null = null;
  private isAuth = false;
  private baseUrl = "https://api.pipedrive.com/v1";

  async authenticate(config: Partial<CRMConfig>): Promise<boolean> {
    if (!config.apiKey) {
      throw new Error("Pipedrive API key is required");
    }

    if (!config.domain) {
      throw new Error("Pipedrive domain is required");
    }

    try {
      // Test the API key by making a simple request
      const response = await fetch(
        `${this.baseUrl}/persons?api_token=${config.apiKey}&limit=1`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        this.config = {
          provider: "pipedrive",
          apiKey: config.apiKey,
          domain: config.domain,
          syncEnabled: config.syncEnabled ?? true,
          syncFrequency: config.syncFrequency ?? "hourly",
          autoCreateProjects: config.autoCreateProjects ?? false,
          autoSyncQuotes: config.autoSyncQuotes ?? true,
        };
        this.isAuth = true;
        return true;
      } else {
        console.error("Pipedrive authentication failed:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Pipedrive authentication error:", error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.isAuth && !!this.config?.apiKey;
  }

  async getCustomers(limit = 100, offset = 0): Promise<Customer[]> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/persons?api_token=${this.config!.apiKey}&limit=${limit}&start=${offset}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Pipedrive API returned failure status");
      }

      return (data.data || []).map((person: any) =>
        this.mapPipedrivePersonToCustomer(person),
      );
    } catch (error) {
      console.error("Error fetching customers from Pipedrive:", error);
      throw error;
    }
  }

  async getCustomer(id: string): Promise<Customer | null> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedriveId = id.startsWith("pipedrive_")
        ? id.replace("pipedrive_", "")
        : id;

      const response = await fetch(
        `${this.baseUrl}/persons/${pipedriveId}?api_token=${this.config!.apiKey}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        return null;
      }

      return this.mapPipedrivePersonToCustomer(data.data);
    } catch (error) {
      console.error("Error fetching customer from Pipedrive:", error);
      return null;
    }
  }

  async createCustomer(
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt" | "source">,
  ): Promise<Customer> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedriveData = this.mapCustomerToPipedrive(customerData);

      const response = await fetch(
        `${this.baseUrl}/persons?api_token=${this.config!.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pipedriveData),
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to create person in Pipedrive");
      }

      return this.mapPipedrivePersonToCustomer(data.data);
    } catch (error) {
      console.error("Error creating customer in Pipedrive:", error);
      throw error;
    }
  }

  async updateCustomer(
    id: string,
    updates: Partial<Customer>,
  ): Promise<Customer> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedriveId = id.startsWith("pipedrive_")
        ? id.replace("pipedrive_", "")
        : id;
      const pipedriveData = this.mapCustomerToPipedrive(updates);

      const response = await fetch(
        `${this.baseUrl}/persons/${pipedriveId}?api_token=${this.config!.apiKey}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pipedriveData),
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to update person in Pipedrive");
      }

      return this.mapPipedrivePersonToCustomer(data.data);
    } catch (error) {
      console.error("Error updating customer in Pipedrive:", error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedriveId = id.startsWith("pipedrive_")
        ? id.replace("pipedrive_", "")
        : id;

      const response = await fetch(
        `${this.baseUrl}/persons/${pipedriveId}?api_token=${this.config!.apiKey}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Error deleting customer in Pipedrive:", error);
      return false;
    }
  }

  async getCustomerDeals(customerId: string): Promise<CustomerDeal[]> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedriveId = customerId.startsWith("pipedrive_")
        ? customerId.replace("pipedrive_", "")
        : customerId;

      const response = await fetch(
        `${this.baseUrl}/persons/${pipedriveId}/deals?api_token=${this.config!.apiKey}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        return [];
      }

      return (data.data || []).map((deal: any) =>
        this.mapPipedriveDealToCustomerDeal(deal, customerId),
      );
    } catch (error) {
      console.error("Error fetching customer deals from Pipedrive:", error);
      return [];
    }
  }

  async createDeal(
    dealData: Omit<CustomerDeal, "id" | "createdAt" | "updatedAt" | "source">,
  ): Promise<CustomerDeal> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedrivePersonId = dealData.customerId.startsWith("pipedrive_")
        ? dealData.customerId.replace("pipedrive_", "")
        : dealData.customerId;

      const pipedriveData = {
        title: dealData.title,
        value: dealData.value,
        person_id: parseInt(pipedrivePersonId),
        probability: dealData.probability,
        expected_close_date: dealData.expectedCloseDate,
        stage_id: this.mapStageToStageId(dealData.stage),
      };

      const response = await fetch(
        `${this.baseUrl}/deals?api_token=${this.config!.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pipedriveData),
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to create deal in Pipedrive");
      }

      return this.mapPipedriveDealToCustomerDeal(
        data.data,
        dealData.customerId,
      );
    } catch (error) {
      console.error("Error creating deal in Pipedrive:", error);
      throw error;
    }
  }

  async updateDeal(
    id: string,
    updates: Partial<CustomerDeal>,
  ): Promise<CustomerDeal> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedriveId = id.startsWith("pipedrive_deal_")
        ? id.replace("pipedrive_deal_", "")
        : id;

      const pipedriveData: any = {};
      if (updates.title) pipedriveData.title = updates.title;
      if (updates.value !== undefined) pipedriveData.value = updates.value;
      if (updates.probability !== undefined)
        pipedriveData.probability = updates.probability;
      if (updates.expectedCloseDate)
        pipedriveData.expected_close_date = updates.expectedCloseDate;
      if (updates.stage)
        pipedriveData.stage_id = this.mapStageToStageId(updates.stage);

      const response = await fetch(
        `${this.baseUrl}/deals/${pipedriveId}?api_token=${this.config!.apiKey}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pipedriveData),
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to update deal in Pipedrive");
      }

      return this.mapPipedriveDealToCustomerDeal(
        data.data,
        updates.customerId!,
      );
    } catch (error) {
      console.error("Error updating deal in Pipedrive:", error);
      throw error;
    }
  }

  async getCustomerContacts(customerId: string): Promise<CustomerContact[]> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedriveId = customerId.startsWith("pipedrive_")
        ? customerId.replace("pipedrive_", "")
        : customerId;

      const response = await fetch(
        `${this.baseUrl}/persons/${pipedriveId}/activities?api_token=${this.config!.apiKey}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        return [];
      }

      return (data.data || []).map((activity: any) =>
        this.mapPipedriveActivityToContact(activity, customerId),
      );
    } catch (error) {
      console.error("Error fetching customer contacts from Pipedrive:", error);
      return [];
    }
  }

  async addContact(
    contact: Omit<CustomerContact, "id">,
  ): Promise<CustomerContact> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    try {
      const pipedrivePersonId = contact.customerId.startsWith("pipedrive_")
        ? contact.customerId.replace("pipedrive_", "")
        : contact.customerId;

      const activityData = {
        subject: contact.subject,
        note: contact.content,
        type: this.mapContactTypeToPipedriveType(contact.type),
        person_id: parseInt(pipedrivePersonId),
        done: 1, // Mark as completed
      };

      const response = await fetch(
        `${this.baseUrl}/activities?api_token=${this.config!.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(activityData),
        },
      );

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to create activity in Pipedrive");
      }

      return {
        ...contact,
        id: `pipedrive_activity_${data.data.id}`,
        externalId: data.data.id.toString(),
      };
    } catch (error) {
      console.error("Error adding contact in Pipedrive:", error);
      throw error;
    }
  }

  async sync(): Promise<SyncResult> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with Pipedrive");
    }

    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    try {
      // This would implement a full sync with Pipedrive
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

  async linkProjectToCustomer(
    projectId: string,
    customerId: string,
  ): Promise<boolean> {
    // This would create a custom field or note in Pipedrive
    return true;
  }

  async linkQuoteToCustomer(
    quoteId: string,
    customerId: string,
  ): Promise<boolean> {
    // This would create a custom field or note in Pipedrive
    return true;
  }

  async notifyQuoteStatusChange(
    quoteId: string,
    status: string,
    customerId: string,
  ): Promise<boolean> {
    // This would create an activity/note in Pipedrive
    return true;
  }

  // Helper methods for data mapping
  private mapPipedrivePersonToCustomer(person: any): Customer {
    return {
      id: `pipedrive_${person.id}`,
      externalId: person.id.toString(),
      name: person.name || person.email?.value || "Unknown",
      email: person.email?.value || "",
      phone: person.phone?.value || undefined,
      company: person.org_name || undefined,
      address: this.extractAddress(person),
      tags: [],
      customFields: {},
      source: "pipedrive",
      createdAt: person.add_time || new Date().toISOString(),
      updatedAt: person.update_time || new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
    };
  }

  private mapCustomerToPipedrive(customer: Partial<Customer>): any {
    const pipedriveData: any = {};

    if (customer.name) pipedriveData.name = customer.name;
    if (customer.email) {
      pipedriveData.email = [
        { value: customer.email, primary: true, label: "work" },
      ];
    }
    if (customer.phone) {
      pipedriveData.phone = [
        { value: customer.phone, primary: true, label: "work" },
      ];
    }
    if (customer.company) pipedriveData.org_name = customer.company;

    return pipedriveData;
  }

  private mapPipedriveDealToCustomerDeal(
    deal: any,
    customerId: string,
  ): CustomerDeal {
    return {
      id: `pipedrive_deal_${deal.id}`,
      customerId,
      title: deal.title || "Untitled Deal",
      value: deal.value || 0,
      stage: this.mapStageIdToStage(deal.stage_id),
      probability: deal.probability || 0,
      expectedCloseDate: deal.expected_close_date || undefined,
      externalId: deal.id.toString(),
      source: "pipedrive",
      createdAt: deal.add_time || new Date().toISOString(),
      updatedAt: deal.update_time || new Date().toISOString(),
    };
  }

  private mapPipedriveActivityToContact(
    activity: any,
    customerId: string,
  ): CustomerContact {
    return {
      id: `pipedrive_activity_${activity.id}`,
      customerId,
      type: this.mapPipedriveTypeToContactType(activity.type),
      subject: activity.subject || "Activity",
      content: activity.note || "",
      timestamp: activity.add_time || new Date().toISOString(),
      externalId: activity.id.toString(),
    };
  }

  private extractAddress(person: any): any {
    // Pipedrive stores address in various formats, this is a basic extraction
    return {
      street: undefined,
      city: undefined,
      state: undefined,
      postalCode: undefined,
      country: undefined,
    };
  }

  private mapStageToStageId(stage: string): number {
    // This would map your stage names to Pipedrive stage IDs
    // You'd need to configure this based on your Pipedrive pipeline
    const stageMap: Record<string, number> = {
      new: 1,
      qualified: 2,
      proposal: 3,
      negotiation: 4,
      closed_won: 5,
      closed_lost: 6,
    };
    return stageMap[stage] || 1;
  }

  private mapStageIdToStage(stageId: number): string {
    // This would map Pipedrive stage IDs to your stage names
    const stageMap: Record<number, string> = {
      1: "new",
      2: "qualified",
      3: "proposal",
      4: "negotiation",
      5: "closed_won",
      6: "closed_lost",
    };
    return stageMap[stageId] || "new";
  }

  private mapContactTypeToPipedriveType(
    type: "email" | "phone" | "meeting" | "note",
  ): string {
    const typeMap: Record<string, string> = {
      email: "email",
      phone: "call",
      meeting: "meeting",
      note: "task",
    };
    return typeMap[type] || "task";
  }

  private mapPipedriveTypeToContactType(
    type: string,
  ): "email" | "phone" | "meeting" | "note" {
    const typeMap: Record<string, "email" | "phone" | "meeting" | "note"> = {
      email: "email",
      call: "phone",
      meeting: "meeting",
      task: "note",
    };
    return typeMap[type] || "note";
  }
}
