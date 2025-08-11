import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, RefreshCw } from "lucide-react";

export default function ClearStorageButton() {
  const clearUserData = () => {
    // Clear all localStorage data
    localStorage.removeItem("chargeSourceUser");
    localStorage.removeItem("chargeSourceRememberMe");

    // Clear any other user-related storage
    localStorage.clear();

    // Reload the page to reset state
    window.location.reload();
  };

  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <AlertDescription>
          <strong>UUID Format Issue Detected:</strong> You have an old user
          session with invalid UUID format. Click below to clear the session and
          fix this issue.
        </AlertDescription>
      </Alert>

      <Button variant="destructive" onClick={clearUserData} className="w-full">
        <Trash2 className="h-4 w-4 mr-2" />
        Clear User Session & Reload
      </Button>

      <p className="text-xs text-muted-foreground">
        This will log you out and clear any cached user data with the old UUID
        format. You can then log back in with the new UUID format.
      </p>
    </div>
  );
}
