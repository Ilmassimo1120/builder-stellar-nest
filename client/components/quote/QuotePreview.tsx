import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuotePreviewProps {
  data: any;
}

export default function QuotePreview({ data }: QuotePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Quote preview will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
