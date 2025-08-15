import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/ui/logo";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for error in URL params
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription || 'Authentication failed');
          return;
        }

        // Get the session from the URL hash/query params
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setErrorMessage('Failed to get session');
          return;
        }

        if (data.session && data.session.user) {
          // Create user in local auth system from OAuth data
          const oauthUser = data.session.user;
          const userMetadata = oauthUser.user_metadata || {};

          // Generate UUID compatible ID
          const generateUUID = () => {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
              /[xy]/g,
              function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              },
            );
          };

          const localUser = {
            id: oauthUser.id || generateUUID(),
            email: oauthUser.email || '',
            name: userMetadata.full_name || userMetadata.name || oauthUser.email?.split('@')[0] || 'Google User',
            firstName: userMetadata.given_name || '',
            lastName: userMetadata.family_name || '',
            company: 'Google OAuth User',
            role: 'user' as const,
            verified: true,
            loginTime: new Date().toISOString(),
            registrationDate: new Date().toISOString(),
          };

          // Store in localStorage (matching the existing auth system)
          localStorage.setItem("chargeSourceUser", JSON.stringify(localUser));

          setStatus('success');
          // Small delay to show success state, then reload to refresh auth state
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage('No session found');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const getStatusContent = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="w-8 h-8 text-primary animate-spin" />,
          title: "Signing you in...",
          description: "Please wait while we complete your authentication.",
          variant: "default" as const
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
          title: "Sign in successful!",
          description: "Redirecting to your dashboard...",
          variant: "default" as const
        };
      case 'error':
        return {
          icon: <XCircle className="w-8 h-8 text-destructive" />,
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive" as const
        };
    }
  };

  const { icon, title, description, variant } = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
        </div>

        {/* Status Card */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {icon}
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {variant === "destructive" ? (
              <Alert variant="destructive">
                <AlertDescription>{description}</AlertDescription>
              </Alert>
            ) : (
              <p className="text-muted-foreground">{description}</p>
            )}

            {status === 'error' && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Return to Login
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Go to Homepage
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
