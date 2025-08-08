import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Users,
  Settings,
  FileText,
  ShoppingCart,
} from "lucide-react";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
  icon: React.ReactNode;
}

export default function SupabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: "Connection",
      status: "pending",
      message: "Testing connection...",
      icon: <Database className="w-4 h-4" />,
    },
    {
      name: "Authentication",
      status: "pending",
      message: "Testing auth...",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "Users Table",
      status: "pending",
      message: "Testing users table...",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "Projects Table",
      status: "pending",
      message: "Testing projects table...",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      name: "Quotes Table",
      status: "pending",
      message: "Testing quotes table...",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      name: "Products Table",
      status: "pending",
      message: "Testing products table...",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      name: "Global Settings",
      status: "pending",
      message: "Testing settings table...",
      icon: <Settings className="w-4 h-4" />,
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (
    index: number,
    status: "success" | "error",
    message: string,
  ) => {
    setTests((prev) =>
      prev.map((test, i) =>
        i === index ? { ...test, status, message } : test,
      ),
    );
  };

  const runTests = async () => {
    setIsRunning(true);

    // Reset all tests
    setTests((prev) =>
      prev.map((test) => ({ ...test, status: "pending" as const })),
    );

    try {
      // Test 1: Basic Connection
      try {
        const { data, error } = await supabase
          .from("users")
          .select("count")
          .limit(1);
        if (error) throw error;
        updateTest(0, "success", "Connection established successfully");
      } catch (error) {
        updateTest(
          0,
          "error",
          `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      // Test 2: Authentication
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        updateTest(
          1,
          "success",
          user
            ? `Authenticated as: ${user.email}`
            : "No user authenticated (normal for initial setup)",
        );
      } catch (error) {
        updateTest(
          1,
          "error",
          `Auth test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      // Test 3: Users Table
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .limit(5);
        if (error) throw error;
        updateTest(
          2,
          "success",
          `Users table accessible (${data?.length || 0} records)`,
        );
      } catch (error) {
        updateTest(
          2,
          "error",
          `Users table error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      // Test 4: Projects Table
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .limit(5);
        if (error) throw error;
        updateTest(
          3,
          "success",
          `Projects table accessible (${data?.length || 0} records)`,
        );
      } catch (error) {
        updateTest(
          3,
          "error",
          `Projects table error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      // Test 5: Quotes Table
      try {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .limit(5);
        if (error) throw error;
        updateTest(
          4,
          "success",
          `Quotes table accessible (${data?.length || 0} records)`,
        );
      } catch (error) {
        updateTest(
          4,
          "error",
          `Quotes table error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      // Test 6: Products Table
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .limit(5);
        if (error) throw error;
        updateTest(
          5,
          "success",
          `Products table accessible (${data?.length || 0} records)`,
        );
      } catch (error) {
        updateTest(
          5,
          "error",
          `Products table error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      // Test 7: Global Settings Table
      try {
        const { data, error } = await supabase
          .from("global_settings")
          .select("*")
          .limit(5);
        if (error) throw error;
        updateTest(
          6,
          "success",
          `Global settings accessible (${data?.length || 0} records)`,
        );
      } catch (error) {
        updateTest(
          6,
          "error",
          `Global settings error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Test suite error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Success
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const successCount = tests.filter((t) => t.status === "success").length;
  const errorCount = tests.filter((t) => t.status === "error").length;
  const pendingCount = tests.filter((t) => t.status === "pending").length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Database Test Suite
        </CardTitle>
        <CardDescription>
          Test your ChargeSource Supabase database connection and schema
        </CardDescription>
        <div className="flex gap-2 mt-4">
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✓ {successCount} Passed
          </Badge>
          <Badge variant="destructive">✗ {errorCount} Failed</Badge>
          <Badge variant="secondary">⏳ {pendingCount} Pending</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? "Running Tests..." : "Run Database Tests"}
        </Button>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {test.icon}
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-gray-500">{test.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                {getStatusBadge(test.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• If tests fail, check your .env configuration</li>
            <li>
              • Run database migrations: <code>supabase db push</code>
            </li>
            <li>
              • Initialize sample data:{" "}
              <code>node scripts/setup-supabase.js</code>
            </li>
            <li>• Check Supabase dashboard for table creation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
