import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Working components
const IndexWorking = lazy(() => import("../pages/IndexWorking"));
const LoginWorking = lazy(() => import("../pages/LoginWorking"));
const DashboardWorking = lazy(() => import("../pages/DashboardWorking"));

// Loading component
const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppRoutesMinimal = () => (
  <Routes>
    <Route
      path="/"
      element={
        <div className="min-h-screen bg-background p-8">
          <h1 className="text-2xl font-bold">Home Page</h1>
          <p>Basic routing is working!</p>
        </div>
      }
    />
    <Route
      path="/test"
      element={
        <div className="min-h-screen bg-background p-8">
          <h1 className="text-2xl font-bold">Test Page</h1>
          <p>Test routing is working!</p>
        </div>
      }
    />
    <Route
      path="*"
      element={
        <div className="min-h-screen bg-background p-8">
          <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
        </div>
      }
    />
  </Routes>
);

export default AppRoutesMinimal;
