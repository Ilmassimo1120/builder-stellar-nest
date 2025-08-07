import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppTest() {
  const handleClick = () => {
    alert("App is working correctly!");
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>App Status Check</CardTitle>
        <CardDescription>
          Testing basic functionality of the ChargeSource app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you can see this card and the button works, the app is functioning correctly.
          </p>
          <Button onClick={handleClick} className="w-full">
            Test App Functionality
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
