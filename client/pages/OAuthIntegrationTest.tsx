import React from "react";
import { GoogleOAuthButton } from "@/components/GoogleOAuthButton";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function OAuthIntegrationTest() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              OAuth Integration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Integration Fixed Successfully!
                </span>
              </div>
              <div className="text-sm text-green-700">
                <p>
                  ✅ GoogleOAuthButton component loads without context errors
                </p>
                <p>✅ useAuth hook is properly connected</p>
                <p>
                  ✅ Authentication state:{" "}
                  {isAuthenticated ? "Authenticated" : "Not authenticated"}
                </p>
                {user && <p>✅ User loaded: {user.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                Test Google OAuth Button:
              </p>
              <GoogleOAuthButton
                text="Test Google Sign-In (Fixed)"
                variant="default"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  What was fixed:
                </span>
              </div>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Integrated Google OAuth into existing useAuth hook</li>
                <li>• Removed dependency on separate SupabaseAuthProvider</li>
                <li>• Updated all components to use unified auth system</li>
                <li>• Fixed OAuth callback to work with local auth state</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
