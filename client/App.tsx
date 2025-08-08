import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { autoInit } from "@/lib/autoInit";
import { AuthProvider } from "./hooks/useAuth";
import { EnhancedAIAssistant } from "./components/EnhancedAIAssistant";
import AppRoutes from "./routes/AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <EnhancedAIAssistant />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Auto-initialize the app
autoInit.initialize();

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
