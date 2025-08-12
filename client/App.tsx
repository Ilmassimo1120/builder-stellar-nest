import React, { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/hooks/useAuth";
import { SupportAIAssistant } from "@/components/SupportAIAssistant";
import { appConfig } from "@/lib/config";
import { preloadCriticalResources } from "@/lib/bundleOptimization";
import "@/global.css";

// Create query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Global loading fallback
const GlobalLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Preload critical resources
    preloadCriticalResources();

    // Log app initialization in development
    if (appConfig.isDevelopment) {
      console.log("🚀 ChargeSource App initialized");
      console.log("Environment:", appConfig.environment);
      console.log("Features:", appConfig.features);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<GlobalLoadingFallback />}>
              <div className="min-h-screen bg-background">
                <ErrorBoundary
                  fallback={
                    <div className="p-4 text-center">
                      <h2 className="text-lg font-semibold mb-2">
                        Navigation Error
                      </h2>
                      <p className="text-muted-foreground">
                        There was an error loading the navigation. Please
                        refresh the page.
                      </p>
                    </div>
                  }
                >
                  <AppRoutes />
                </ErrorBoundary>

                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 4000,
                  }}
                />

                {/* Global Support AI Assistant */}
                <SupportAIAssistant />
              </div>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
