import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectWizard from "./pages/ProjectWizard";
import ProjectDetail from "./pages/ProjectDetail";
import Quotes from "./pages/Quotes";
import QuoteBuilder from "./pages/QuoteBuilder";
import ClientPortal from "./pages/ClientPortal";
import ConnectionTest from "./pages/ConnectionTest";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Project Management Routes */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <ProjectWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />

            {/* Development/Testing Routes */}
            <Route path="/test-connection" element={<ConnectionTest />} />

            {/* Quoting Routes */}
            <Route
              path="/quotes"
              element={
                <Placeholder
                  title="Smart Quoting Engine"
                  description="Dynamic quoting tool with CPQ capabilities"
                  features={[
                    "Component selection",
                    "Auto cost calculation",
                    "Template library",
                    "Margin control",
                    "PDF generation",
                  ]}
                />
              }
            />
            <Route
              path="/quotes/new"
              element={
                <Placeholder
                  title="Create Quote"
                  description="Generate professional quotes with our CPQ engine"
                  features={[
                    "Dynamic pricing",
                    "Component selection",
                    "Labor calculation",
                    "Material costs",
                    "Customer-facing PDFs",
                  ]}
                />
              }
            />

            {/* Procurement Routes */}
            <Route
              path="/catalogue"
              element={
                <Placeholder
                  title="Product Catalogue"
                  description="Browse and manage EV charging equipment and components"
                  features={[
                    "Real-time inventory",
                    "Supplier pricing",
                    "Product specifications",
                    "Compatibility checks",
                    "Order management",
                  ]}
                />
              }
            />
            <Route
              path="/procurement"
              element={
                <Placeholder
                  title="Procurement & Suppliers"
                  description="Manage supplier relationships and procurement processes"
                  features={[
                    "Supplier integration",
                    "Inventory tracking",
                    "Order conversion",
                    "Delivery tracking",
                    "Payment gateway",
                  ]}
                />
              }
            />

            {/* Client Management */}
            <Route
              path="/clients"
              element={
                <Placeholder
                  title="Client Management"
                  description="Manage client relationships and project portfolios"
                  features={[
                    "Client dashboard",
                    "Project history",
                    "Communication logs",
                    "Contact management",
                    "Billing information",
                  ]}
                />
              }
            />

            {/* Document Management */}
            <Route
              path="/documents"
              element={
                <Placeholder
                  title="Document Management"
                  description="Upload and organize project documents"
                  features={[
                    "Drawing uploads",
                    "Photo management",
                    "Invoice storage",
                    "Compliance documents",
                    "Version control",
                  ]}
                />
              }
            />

            {/* Marketing & Growth */}
            <Route
              path="/marketing"
              element={
                <Placeholder
                  title="Marketing & Growth"
                  description="Referral programs and business growth tools"
                  features={[
                    "Referral system",
                    "Affiliate marketing",
                    "Lead tracking",
                    "Performance analytics",
                    "Customer retention",
                  ]}
                />
              }
            />

            {/* Integrations */}
            <Route
              path="/integrations"
              element={
                <Placeholder
                  title="Integrations"
                  description="Connect with accounting, CRM, and other business tools"
                  features={[
                    "MYOB/Xero/QuickBooks",
                    "CRM integration",
                    "API connections",
                    "Data synchronization",
                    "Workflow automation",
                  ]}
                />
              }
            />

            {/* Training & Support */}
            <Route
              path="/training"
              element={
                <Placeholder
                  title="Training Portal"
                  description="Installation training, videos, and certifications"
                  features={[
                    "Video tutorials",
                    "Installation guides",
                    "Certification tracking",
                    "Progress monitoring",
                    "Resource library",
                  ]}
                />
              }
            />
            <Route
              path="/support"
              element={
                <Placeholder
                  title="Support Center"
                  description="Get help with your EV infrastructure projects"
                  features={[
                    "Help documentation",
                    "Technical support",
                    "Live chat",
                    "Ticket system",
                    "FAQ database",
                  ]}
                />
              }
            />

            {/* Business Pages */}
            <Route
              path="/features"
              element={
                <Placeholder
                  title="Features"
                  description="Comprehensive overview of ChargeSource capabilities"
                  features={[
                    "Feature comparison",
                    "Use cases",
                    "Benefits overview",
                    "ROI calculator",
                    "Demo videos",
                  ]}
                />
              }
            />
            <Route
              path="/pricing"
              element={
                <Placeholder
                  title="Pricing Plans"
                  description="Choose the right plan for your electrical contracting business"
                  features={[
                    "Plan comparison",
                    "Feature breakdown",
                    "Custom pricing",
                    "Enterprise options",
                    "Free trial",
                  ]}
                />
              }
            />

            {/* Auth & Account - login route moved to top */}
            <Route
              path="/settings"
              element={
                <Placeholder
                  title="Account Settings"
                  description="Manage your account and preferences"
                  features={[
                    "Profile management",
                    "Team settings",
                    "Billing information",
                    "Notification preferences",
                    "Security settings",
                  ]}
                />
              }
            />

            {/* Legal & Info */}
            <Route
              path="/about"
              element={
                <Placeholder
                  title="About ChargeSource"
                  description="Learn about our mission to electrify Australia's infrastructure"
                />
              }
            />
            <Route
              path="/contact"
              element={
                <Placeholder
                  title="Contact Us"
                  description="Get in touch with our team for support or sales inquiries"
                />
              }
            />
            <Route
              path="/privacy"
              element={
                <Placeholder
                  title="Privacy Policy"
                  description="How we protect and handle your data"
                />
              }
            />
            <Route
              path="/terms"
              element={
                <Placeholder
                  title="Terms of Service"
                  description="Terms and conditions for using ChargeSource"
                />
              }
            />

            {/* Compliance & Help */}
            <Route
              path="/compliance"
              element={
                <Placeholder
                  title="Compliance Center"
                  description="AS/NZS 3000 and regulatory compliance resources"
                  features={[
                    "Compliance checklists",
                    "Regulation updates",
                    "Certification tracking",
                    "Audit trails",
                    "Documentation",
                  ]}
                />
              }
            />
            <Route
              path="/help"
              element={
                <Placeholder
                  title="Help Center"
                  description="Find answers and get support"
                  features={[
                    "Search documentation",
                    "Video tutorials",
                    "FAQ section",
                    "Contact support",
                    "Community forum",
                  ]}
                />
              }
            />

            {/* API & Developer */}
            <Route
              path="/api"
              element={
                <Placeholder
                  title="API Documentation"
                  description="Integrate ChargeSource with your existing systems"
                  features={[
                    "REST API",
                    "Webhooks",
                    "SDK libraries",
                    "Code examples",
                    "Rate limits",
                  ]}
                />
              }
            />

            {/* Future Features */}
            <Route
              path="/monitoring"
              element={
                <Placeholder
                  title="Site Monitoring"
                  description="Real-time monitoring and load management (coming soon)"
                  features={[
                    "Real-time monitoring",
                    "Load management",
                    "Performance analytics",
                    "Alerts & notifications",
                    "Remote diagnostics",
                  ]}
                />
              }
            />
            <Route
              path="/grants"
              element={
                <Placeholder
                  title="Rebate & Grant Assistant"
                  description="Government incentive and rebate management"
                  features={[
                    "Eligibility checker",
                    "Pre-filled forms",
                    "Application tracking",
                    "Deadline reminders",
                    "Documentation",
                  ]}
                />
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Prevent multiple createRoot calls during HMR
const container = document.getElementById("root")!;
const root = (window as any).__app_root__ || createRoot(container);
if (!(window as any).__app_root__) {
  (window as any).__app_root__ = root;
}
root.render(<App />);
