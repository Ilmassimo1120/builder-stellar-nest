import React, { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Lazy load tab components for better performance
const QuoteDetails = lazy(() => import("./QuoteDetails"));
const LineItems = lazy(() => import("./LineItems"));
const QuoteSettings = lazy(() => import("./QuoteSettings"));
const QuotePreview = lazy(() => import("./QuotePreview"));

interface QuoteBuilderTabsProps {
  quoteData: any;
  onQuoteUpdate: (data: any) => void;
}

const LoadingSpinner = () => (
  <Card>
    <CardContent className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2">Loading...</span>
    </CardContent>
  </Card>
);

export function QuoteBuilderTabs({
  quoteData,
  onQuoteUpdate,
}: QuoteBuilderTabsProps) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="items">Line Items</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <Suspense fallback={<LoadingSpinner />}>
          <QuoteDetails data={quoteData} onUpdate={onQuoteUpdate} />
        </Suspense>
      </TabsContent>

      <TabsContent value="items">
        <Suspense fallback={<LoadingSpinner />}>
          <LineItems data={quoteData} onUpdate={onQuoteUpdate} />
        </Suspense>
      </TabsContent>

      <TabsContent value="settings">
        <Suspense fallback={<LoadingSpinner />}>
          <QuoteSettings data={quoteData} onUpdate={onQuoteUpdate} />
        </Suspense>
      </TabsContent>

      <TabsContent value="preview">
        <Suspense fallback={<LoadingSpinner />}>
          <QuotePreview data={quoteData} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}

export default QuoteBuilderTabs;
