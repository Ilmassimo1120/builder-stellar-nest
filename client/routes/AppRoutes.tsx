import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy load all page components for better bundle splitting
const Index = lazy(() => import("../pages/Index"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Projects = lazy(() => import("../pages/Projects"));
const ProjectWizard = lazy(() => import("../pages/ProjectWizard"));
const ProjectDetail = lazy(() => import("../pages/ProjectDetail"));
const Quotes = lazy(() => import("../pages/Quotes"));
const QuoteBuilder = lazy(() => import("../pages/QuoteBuilder"));
const ClientPortal = lazy(() => import("../pages/ClientPortal"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Catalogue = lazy(() => import("../pages/Catalogue"));
const AdminCatalogue = lazy(() => import("../pages/AdminCatalogue"));
const Settings = lazy(() => import("../pages/Settings"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Users = lazy(() => import("../pages/Users"));
const Customers = lazy(() => import("../pages/Customers"));
const EnhancedFileStorage = lazy(() => import("../pages/EnhancedFileStorage"));
const FileStorage = lazy(() => import("../pages/FileStorage"));
const CloudStatus = lazy(() => import("../pages/CloudStatus"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Placeholder = lazy(() => import("../pages/Placeholder"));
const AuthTest = lazy(() => import("../pages/AuthTest"));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

// Reusable protected route wrapper with loading
const ProtectedLazyRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Suspense fallback={<PageLoading />}>{children}</Suspense>
  </ProtectedRoute>
);

// Public route wrapper with loading
const PublicLazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
);

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route
      path="/"
      element={
        <PublicLazyRoute>
          <Index />
        </PublicLazyRoute>
      }
    />
    <Route
      path="/login"
      element={
        <PublicLazyRoute>
          <Login />
        </PublicLazyRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicLazyRoute>
          <Register />
        </PublicLazyRoute>
      }
    />
    <Route
      path="/client/quote/:quoteId"
      element={
        <PublicLazyRoute>
          <ClientPortal />
        </PublicLazyRoute>
      }
    />

    {/* Protected Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedLazyRoute>
          <Dashboard />
        </ProtectedLazyRoute>
      }
    />

    {/* Project Management Routes */}
    <Route
      path="/projects"
      element={
        <ProtectedLazyRoute>
          <Projects />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/projects/new"
      element={
        <ProtectedLazyRoute>
          <ProjectWizard />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/projects/:projectId"
      element={
        <ProtectedLazyRoute>
          <ProjectDetail />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/projects/:projectId/edit"
      element={
        <ProtectedLazyRoute>
          <ProjectWizard />
        </ProtectedLazyRoute>
      }
    />

    {/* Quote Management Routes */}
    <Route
      path="/quotes"
      element={
        <ProtectedLazyRoute>
          <Quotes />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/quotes/new"
      element={
        <ProtectedLazyRoute>
          <QuoteBuilder />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/quotes/:quoteId"
      element={
        <ProtectedLazyRoute>
          <QuoteBuilder />
        </ProtectedLazyRoute>
      }
    />

    {/* File Storage Routes */}
    <Route
      path="/files"
      element={
        <ProtectedLazyRoute>
          <EnhancedFileStorage />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/files/legacy"
      element={
        <ProtectedLazyRoute>
          <FileStorage />
        </ProtectedLazyRoute>
      }
    />

    {/* Catalogue Routes */}
    <Route
      path="/catalogue"
      element={
        <ProtectedLazyRoute>
          <Catalogue />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/admin/catalogue"
      element={
        <ProtectedLazyRoute>
          <AdminCatalogue />
        </ProtectedLazyRoute>
      }
    />

    {/* Customer Management */}
    <Route
      path="/clients"
      element={
        <ProtectedLazyRoute>
          <Customers />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/customers"
      element={
        <ProtectedLazyRoute>
          <Customers />
        </ProtectedLazyRoute>
      }
    />

    {/* Admin Routes */}
    <Route
      path="/analytics"
      element={
        <ProtectedLazyRoute>
          <Analytics />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/users"
      element={
        <ProtectedLazyRoute>
          <Users />
        </ProtectedLazyRoute>
      }
    />

    {/* Settings Routes */}
    <Route
      path="/settings"
      element={
        <ProtectedLazyRoute>
          <Settings />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/cloud-status"
      element={
        <ProtectedLazyRoute>
          <CloudStatus />
        </ProtectedLazyRoute>
      }
    />
    <Route
      path="/auth-test"
      element={
        <PublicLazyRoute>
          <AuthTest />
        </PublicLazyRoute>
      }
    />
    <Route
      path="/AuthTest"
      element={
        <PublicLazyRoute>
          <AuthTest />
        </PublicLazyRoute>
      }
    />
    <Route
      path="/authtest"
      element={
        <PublicLazyRoute>
          <AuthTest />
        </PublicLazyRoute>
      }
    />
    <Route
      path="/auth_test"
      element={
        <PublicLazyRoute>
          <AuthTest />
        </PublicLazyRoute>
      }
    />

    {/* Placeholder Routes for Future Features */}
    <Route
      path="/documents"
      element={
        <PublicLazyRoute>
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
        </PublicLazyRoute>
      }
    />

    <Route
      path="/features"
      element={
        <PublicLazyRoute>
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
        </PublicLazyRoute>
      }
    />

    <Route
      path="/pricing"
      element={
        <PublicLazyRoute>
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
        </PublicLazyRoute>
      }
    />

    <Route
      path="/support"
      element={
        <PublicLazyRoute>
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
        </PublicLazyRoute>
      }
    />

    {/* Catch-all route */}
    <Route
      path="*"
      element={
        <PublicLazyRoute>
          <NotFound />
        </PublicLazyRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
