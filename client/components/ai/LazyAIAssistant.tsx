import React, { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";

// Lazy load the heavy AI components
const AIChat = lazy(() => import("./AIChat"));
const AIFileSearch = lazy(() => import("./AIFileSearch"));
const AISuggestions = lazy(() => import("./AISuggestions"));

interface LazyAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "chat" | "search" | "suggestions";
}

const AILoadingFallback = () => (
  <Card className="w-full h-96">
    <CardContent className="flex items-center justify-center h-full">
      <div className="text-center">
        <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
      </div>
    </CardContent>
  </Card>
);

export function LazyAIAssistant({ 
  isOpen, 
  onClose, 
  initialMode = "chat" 
}: LazyAIAssistantProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-4 top-4 bottom-4 w-96 bg-background border rounded-lg shadow-lg">
        <Suspense fallback={<AILoadingFallback />}>
          {initialMode === "chat" && <AIChat onClose={onClose} />}
          {initialMode === "search" && <AIFileSearch onClose={onClose} />}
          {initialMode === "suggestions" && <AISuggestions onClose={onClose} />}
        </Suspense>
      </div>
    </div>
  );
}

export default LazyAIAssistant;
