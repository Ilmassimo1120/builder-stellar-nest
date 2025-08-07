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
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fd8af561546d8452e90f10c66e582c7bd%2F30d900209495466eb21054f3229abe7e?format=webp&width=800"
        alt="Charge N Go"
        className={`${sizeClasses[size]} object-contain`}
      />

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
