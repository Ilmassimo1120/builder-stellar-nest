import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";
import ConnectionStatus from "@/components/ConnectionStatus";
import SupabaseStorageDiagnostics from "@/components/SupabaseStorageDiagnostics";
import { Logo } from "@/components/ui/logo";

export default function CloudStatus() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <Logo size="lg" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cloud Status</h1>
          <p className="text-muted-foreground">
            Monitor your ChargeSource cloud connection and sync status
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ChargeSource Cloud Connection</CardTitle>
                <CardDescription>
                  Real-time status of your cloud database connection and sync
                  services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConnectionStatus />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <SupabaseStorageDiagnostics />
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5" />
                      Storage Testing
                    </CardTitle>
                    <CardDescription>
                      Test file uploads and monitor storage quota limits
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/storage-testing">Open Storage Tests</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Need to test your storage buckets before committing to a paid
                plan? Use our interactive Storage Testing Dashboard to upload
                test files, monitor quota usage, and verify your Supabase
                storage limits work as expected.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
