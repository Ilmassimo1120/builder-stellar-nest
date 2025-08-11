import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuoteDetailsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function QuoteDetails({ data, onUpdate }: QuoteDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Quote details form will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
