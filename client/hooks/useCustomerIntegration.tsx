import { useState, useEffect, useCallback } from "react";
import { Customer } from "@shared/customer";
import { customerService } from "@/lib/services/customerService";

interface UseCustomerIntegrationProps {
  projectId?: string;
  quoteId?: string;
}

export function useCustomerIntegration({
  projectId,
  quoteId,
}: UseCustomerIntegrationProps = {}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load linked customer for project or quote
  const loadLinkedCustomer = useCallback(async () => {
    if (!projectId && !quoteId) return;

    try {
      setLoading(true);
      setError(null);

      let linkedCustomer: Customer | null = null;

      if (projectId) {
        linkedCustomer = await customerService.getProjectCustomer(projectId);
      } else if (quoteId) {
        linkedCustomer = await customerService.getQuoteCustomer(quoteId);
      }

      setCustomer(linkedCustomer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer");
      console.error("Error loading linked customer:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, quoteId]);

  // Link customer to project
  const linkToProject = useCallback(
    async (customerId: string, targetProjectId: string) => {
      try {
        setError(null);
        const success = await customerService.linkProjectToCustomer(
          targetProjectId,
          customerId,
        );

        if (success) {
          // Reload customer if this is the current project
          if (targetProjectId === projectId) {
            await loadLinkedCustomer();
          }
          return true;
        } else {
          setError("Failed to link customer to project");
          return false;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to link customer",
        );
        console.error("Error linking customer to project:", err);
        return false;
      }
    },
    [projectId, loadLinkedCustomer],
  );

  // Link customer to quote
  const linkToQuote = useCallback(
    async (customerId: string, targetQuoteId: string) => {
      try {
        setError(null);
        const success = await customerService.linkQuoteToCustomer(
          targetQuoteId,
          customerId,
        );

        if (success) {
          // Reload customer if this is the current quote
          if (targetQuoteId === quoteId) {
            await loadLinkedCustomer();
          }
          return true;
        } else {
          setError("Failed to link customer to quote");
          return false;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to link customer",
        );
        console.error("Error linking customer to quote:", err);
        return false;
      }
    },
    [quoteId, loadLinkedCustomer],
  );

  // Notify customer of quote status change
  const notifyQuoteStatusChange = useCallback(
    async (targetQuoteId: string, status: string, customerId?: string) => {
      try {
        const targetCustomerId = customerId || customer?.id;
        if (!targetCustomerId) {
          return false;
        }

        return await customerService.notifyQuoteStatusChange(
          targetQuoteId,
          status,
          targetCustomerId,
        );
      } catch (err) {
        console.error("Error notifying customer of quote status change:", err);
        return false;
      }
    },
    [customer],
  );

  // Auto-sync quote status to CRM
  const syncQuoteStatus = useCallback(
    async (targetQuoteId: string, status: string, customerId?: string) => {
      const config = customerService.getConfig();
      if (!config.autoSyncQuotes) {
        return;
      }

      return await notifyQuoteStatusChange(targetQuoteId, status, customerId);
    },
    [notifyQuoteStatusChange],
  );

  // Get customer for external use
  const getCustomer = useCallback(
    async (customerId: string): Promise<Customer | null> => {
      try {
        return await customerService.getCustomer(customerId);
      } catch (err) {
        console.error("Error fetching customer:", err);
        return null;
      }
    },
    [],
  );

  // Search customers
  const searchCustomers = useCallback(
    async (query: string): Promise<Customer[]> => {
      try {
        return await customerService.searchCustomers(query);
      } catch (err) {
        console.error("Error searching customers:", err);
        return [];
      }
    },
    [],
  );

  // Load customer on component mount
  useEffect(() => {
    loadLinkedCustomer();
  }, [loadLinkedCustomer]);

  return {
    // State
    customer,
    loading,
    error,

    // Actions
    linkToProject,
    linkToQuote,
    notifyQuoteStatusChange,
    syncQuoteStatus,
    getCustomer,
    searchCustomers,
    reload: loadLinkedCustomer,

    // Utils
    isLinked: !!customer,
    customerId: customer?.id,
  };
}

// Wrapper hook for project-specific customer integration
export function useProjectCustomer(projectId?: string) {
  return useCustomerIntegration({ projectId });
}

// Wrapper hook for quote-specific customer integration
export function useQuoteCustomer(quoteId?: string) {
  return useCustomerIntegration({ quoteId });
}

// Hook for CRM configuration
export function useCRMConfig() {
  const [config, setConfig] = useState(customerService.getConfig());
  const [providers, setProviders] = useState(
    customerService.getAvailableProviders(),
  );

  const updateConfig = useCallback(
    async (newConfig: Partial<typeof config>) => {
      const success = await customerService.setConfig(newConfig);
      if (success) {
        setConfig(customerService.getConfig());
      }
      return success;
    },
    [],
  );

  const testConnection = useCallback(async () => {
    const provider = customerService.getActiveProvider();
    if (provider.requiresAuth) {
      return await provider.authenticate(config);
    }
    return true;
  }, [config]);

  const syncNow = useCallback(async () => {
    return await customerService.sync();
  }, []);

  return {
    config,
    providers,
    updateConfig,
    testConnection,
    syncNow,
    isConnected: customerService.getActiveProvider().isAuthenticated(),
  };
}
