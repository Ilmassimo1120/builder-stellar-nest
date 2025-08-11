import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineItemsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function LineItems({ data, onUpdate }: LineItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Line items management will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
