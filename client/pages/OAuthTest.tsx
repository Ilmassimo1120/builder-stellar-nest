import React from "react";
import { GoogleOAuthButton } from "@/components/GoogleOAuthButton";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Link } from "react-router-dom";
import { ArrowLeft, User, LogOut } from "lucide-react";

export default function OAuthTest() {
  const { user, isAuthenticated, logout } = useSupabaseAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-primary"
            >
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            OAuth Test Page
          </h1>
          <p className="text-muted-foreground">
            Test Google OAuth integration
          </p>
        </div>

        {/* OAuth Test Card */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              {isAuthenticated ? "Authenticated!" : "Test Google Sign-In"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Signed in successfully!
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  
                  <Button asChild className="w-full">
                    <Link to="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Google OAuth requires proper configuration in your Supabase project.
                    Make sure you have:
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-600 mt-2 space-y-1">
                    <li>Enabled Google provider in Supabase Auth settings</li>
                    <li>Added your Google Client ID and Secret</li>
                    <li>Configured redirect URLs</li>
                  </ul>
                </div>

                <GoogleOAuthButton 
                  text="Test Google Sign-In"
                  variant="default"
                />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Or go to{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      regular login page
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
            <li>Configure Google OAuth in Supabase dashboard</li>
            <li>Click "Test Google Sign-In" button above</li>
            <li>Complete Google OAuth flow</li>
            <li>You should be redirected back and see user info</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
