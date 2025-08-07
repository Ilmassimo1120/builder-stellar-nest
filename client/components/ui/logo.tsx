import { PlugZap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: { main: "text-sm", sub: "text-xs" },
    md: { main: "text-lg", sub: "text-sm" },
    lg: { main: "text-xl", sub: "text-base" }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Replace this PlugZap icon with your actual Charge N Go logo */}
      {/* <img src="/logo-charge-n-go.png" alt="Charge N Go" className={sizeClasses[size]} /> */}
      <PlugZap className={`${sizeClasses[size]} text-primary`} />
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size].main} font-bold text-primary`}>
            Charge N Go
          </span>
          <span className={`${textSizes[size].sub} text-muted-foreground`}>
            ChargeSource Platform
          </span>
        </div>
      )}
    </div>
  );
}
