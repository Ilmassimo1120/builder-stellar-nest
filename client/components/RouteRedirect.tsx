import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface RouteRedirectProps {
  to: string;
  delay?: number;
}

export default function RouteRedirect({ to, delay = 0 }: RouteRedirectProps) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(to, { replace: true });
    }, delay);
    
    return () => clearTimeout(timer);
  }, [navigate, to, delay]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg font-medium mb-2">Redirecting...</div>
        <div className="text-sm text-muted-foreground">
          Taking you to {to}
        </div>
      </div>
    </div>
  );
}
