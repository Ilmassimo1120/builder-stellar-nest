import { PlugZap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  // Ensure size is valid, fallback to "md" if invalid
  const validSize = (size === "sm" || size === "md" || size === "lg" || size === "xl") ? size : "md";

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textSizes = {
    sm: { main: "text-sm", sub: "text-xs" },
    md: { main: "text-lg", sub: "text-sm" },
    lg: { main: "text-xl", sub: "text-base" },
    xl: { main: "text-2xl", sub: "text-lg" }
  };

  // Get the text sizes for the valid size
  const currentTextSize = textSizes[validSize];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fd8af561546d8452e90f10c66e582c7bd%2F30d900209495466eb21054f3229abe7e?format=webp&width=800"
        alt="Charge N Go"
        className={`${sizeClasses[validSize]} object-contain`}
      />

      {showText && (
        <div className="flex flex-col">
          <span className={`${currentTextSize.main} font-bold`}>
            ChargeSource
          </span>
          <span className={`${currentTextSize.sub} text-muted-foreground`}>
            Powered By Charge N Go Australia
          </span>
        </div>
      )}
    </div>
  );
}
