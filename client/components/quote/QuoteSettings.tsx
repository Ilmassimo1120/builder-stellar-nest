import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuoteSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function QuoteSettings({ data, onUpdate }: QuoteSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Quote settings will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
