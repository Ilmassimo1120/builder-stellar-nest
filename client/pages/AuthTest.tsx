import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthTestComponent from "@/components/AuthTestComponent";
import StorageBucketTest from "@/components/StorageBucketTest";
import { SupabaseAuthProvider } from "@/hooks/useSupabaseAuth";
import { Info, Database, Key, Users, HardDrive } from "lucide-react";

export default function AuthTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Authentication System Test</h1>
          <p className="text-muted-foreground">
            Test and verify Supabase authentication integration
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page tests the Supabase authentication system integration. 
            Use this to verify signup, login, and session management functionality.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="supabase-auth" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="supabase-auth">
              <Database className="w-4 h-4 mr-2" />
              Supabase Auth
            </TabsTrigger>
            <TabsTrigger value="config">
              <Key className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="demo">
              Demo System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supabase-auth" className="space-y-4">
            <SupabaseAuthProvider>
              <AuthTestComponent />
            </SupabaseAuthProvider>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🔧 Supabase Configuration Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Environment Variables</h4>
                    <div className="text-sm space-y-1">
                      <div>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
                      <div>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Project Details</h4>
                    <div className="text-sm space-y-1">
                      <div>URL: {import.meta.env.VITE_SUPABASE_URL || "Not configured"}</div>
                      <div>Key Length: {import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0} chars</div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Required Setup:</strong><br />
                    1. Supabase project created ✅<br />
                    2. Environment variables configured ✅<br />
                    3. Database migrations applied ⚠️ (need to verify)<br />
                    4. Auth settings configured ⚠️ (need to verify)
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>👥 User Management Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      <strong>Database Status:</strong> Testing connection to users table and RLS policies.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-900 mb-2">
                      Next Steps for User Management:
                    </h4>
                    <div className="text-xs text-yellow-700 space-y-1">
                      <div>• Run database migrations: <code>supabase db push</code></div>
                      <div>• Verify RLS policies are applied</div>
                      <div>• Test user creation and profile management</div>
                      <div>• Configure email templates in Supabase dashboard</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎭 Demo Authentication System</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    The app currently has a localStorage-based demo auth system in addition to Supabase auth.
                    This is used for development and demo purposes. In production, only Supabase auth should be used.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>📧 demo@contractor.com.au / demo123</div>
                    <div>📧 admin@chargesource.com.au / admin123</div>
                    <div>📧 globaladmin@chargesource.com.au / admin123</div>
                    <div>📧 sales@chargesource.com.au / sales123</div>
                    <div>📧 partner@example.com / partner123</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
