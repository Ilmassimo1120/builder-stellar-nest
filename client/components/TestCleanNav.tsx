import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CleanAdminNavigation from "./CleanAdminNavigation";
import { useAuth } from "@/hooks/useAuth";

export default function TestCleanNav() {
  const { user } = useAuth();

  if (!user || (user.role !== "admin" && user.role !== "global_admin")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clean Navigation Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Log in as an admin user to see the clean navigation design.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>✨ Clean Admin Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-background">
          <CleanAdminNavigation />
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Improvements:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Grouped related items into logical dropdowns</li>
            <li>
              Primary actions (Dashboard, Projects, Quotes) always visible
            </li>
            <li>Catalog items grouped under "Catalog" dropdown</li>
            <li>Admin tools grouped under "Admin" dropdown</li>
            <li>Quick create actions in organized dropdown</li>
            <li>Much cleaner, less cluttered interface</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
