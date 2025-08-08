import React, { useState, useEffect } from "react";
import {
  Database,
  Cloud,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  FileText,
  Package,
  Building,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { migrationService } from "@/lib/services/migrationService";

interface MigrationStats {
  connected: boolean;
  userCount: number;
  projectCount: number;
  quoteCount: number;
  productCount: number;
}

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function MigrationModal({ isOpen, onClose, onSuccess }: MigrationModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const handleMigration = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to migrate your data",
        variant: "destructive",
      });
      return;
    }

    setMigrating(true);
    setProgress(0);
    setCurrentStep("Starting migration...");

    try {
      // Simulate progress updates
      const steps = [
        "Connecting to Supabase...",
        "Migrating projects...",
        "Migrating quotes...",
        "Migrating products...",
        "Migrating settings...",
        "Finalizing migration...",
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress(((i + 1) / steps.length) * 90); // Leave 10% for completion
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Perform actual migration
      const result = await migrationService.migrateLocalStorageToSupabase(user);

      setProgress(100);
      setCurrentStep("Migration completed!");

      if (result.success) {
        toast({
          title: "Migration Successful",
          description: result.message,
        });
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Migration Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep("");
        onClose();
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Migrate to Supabase
          </DialogTitle>
          <DialogDescription>
            Move your local data to the cloud for better reliability and
            collaboration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {migrating && (
            <div className="space-y-3">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {currentStep}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              Migration Benefits
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cloud backup and sync</li>
              <li>• Real-time collaboration</li>
              <li>• Better performance</li>
              <li>• Advanced features</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Important</h4>
                <p className="text-sm text-amber-800">
                  Your local data will remain as backup. The migration is safe
                  and reversible.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={migrating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMigration}
              disabled={migrating}
              className="flex-1"
            >
              {migrating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Migration
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SupabaseMigration() {
  const [stats, setStats] = useState<MigrationStats>({
    connected: false,
    userCount: 0,
    projectCount: 0,
    quoteCount: 0,
    productCount: 0,
  });
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const [supabaseStats, needsMigration] = await Promise.all([
        migrationService.getSupabaseStatus(),
        migrationService.checkMigrationNeeded(),
      ]);

      setStats(supabaseStats);
      setMigrationNeeded(needsMigration);
    } catch (error) {
      console.error("Error checking migration status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrationSuccess = () => {
    checkStatus(); // Refresh stats
    setMigrationNeeded(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Checking Supabase status...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Supabase Integration
              </CardTitle>
              <CardDescription>
                Cloud database and real-time features powered by Supabase
              </CardDescription>
            </div>
            <Badge
              variant={stats.connected ? "default" : "secondary"}
              className={stats.connected ? "bg-green-100 text-green-800" : ""}
            >
              {stats.connected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Offline Mode
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{stats.userCount}</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{stats.projectCount}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{stats.quoteCount}</div>
              <div className="text-sm text-muted-foreground">Quotes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{stats.productCount}</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
          </div>

          {/* Migration Section */}
          {migrationNeeded && (
            <>
              <Separator />
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg flex-shrink-0">
                    <Cloud className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Upgrade to Cloud Storage
                    </h3>
                    <p className="text-blue-800 mb-4">
                      You have local data that can be migrated to Supabase for
                      better reliability, real-time sync, and collaboration
                      features.
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => setShowMigrationModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Migrate to Cloud
                      </Button>
                      <Button variant="outline" onClick={checkStatus} size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Status
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Features */}
          {stats.connected && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium">Active Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Real-time synchronization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Cloud backup & restore</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Multi-device access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Team collaboration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Row-level security</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <MigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onSuccess={handleMigrationSuccess}
      />
    </>
  );
}
