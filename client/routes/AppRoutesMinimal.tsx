import React from "react";
import { Routes, Route } from "react-router-dom";

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
