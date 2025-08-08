import { initializeSupabase, isConnectedToSupabase } from "./supabase";
import { migrationService } from "./services/migrationService";

class AutoInitializationService {
  private initialized = false;
  private supabaseConnected = false;

  async initialize() {
    console.log("🚀 ChargeSource Auto-Initialization Starting...");

    try {
      // Always test the connection fresh
      console.log("🔄 AutoInit: Testing Supabase connection...");

      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.log("⏰ Connection test timed out, using local mode");
          resolve(false);
        }, 8000); // 8 second timeout
      });

      const connectionPromise = initializeSupabase();

      this.supabaseConnected = await Promise.race([connectionPromise, timeoutPromise]);

      console.log(
        "🔄 AutoInit: Connection test result:",
        this.supabaseConnected,
      );

      if (this.supabaseConnected) {
        console.log("✅ ChargeSource connected to cloud database");

        // Step 2: Auto-migrate localStorage data if it exists
        try {
          await this.autoMigrateIfNeeded();
        } catch (migrationError) {
          console.warn("⚠️ Migration failed but continuing:", migrationError);
        }
      } else {
        console.log("📱 ChargeSource running in local mode");
      }

      this.initialized = true;
      console.log(
        "🔄 AutoInit: Initialization complete, result:",
        this.supabaseConnected,
      );
      return this.supabaseConnected;
    } catch (error) {
      console.log("⚠️ Auto-initialization encountered an error, using local mode");
      console.log("Error details:", error instanceof Error ? error.message : String(error));
      this.initialized = true;
      this.supabaseConnected = false;
      return false;
    }
  }

  private async autoMigrateIfNeeded() {
    try {
      // Check if there's localStorage data to migrate
      const hasLocalData = migrationService.checkMigrationNeeded();

      if (await hasLocalData) {
        console.log("📦 Automatically migrating local data to cloud...");

        // Try to get current user for migration
        const localUser = localStorage.getItem("chargeSourceUser");
        let user = null;

        if (localUser) {
          user = JSON.parse(localUser);
        }

        // Perform silent migration
        const result =
          await migrationService.migrateLocalStorageToSupabase(user);

        if (result.success) {
          console.log("✅ Auto-migration completed successfully");
        } else {
          console.log("⚠️ Auto-migration skipped:", result.message);
        }
      }
    } catch (error) {
      console.warn(
        "⚠️ Auto-migration failed, continuing in hybrid mode:",
        error,
      );
    }
  }

  isSupabaseConnected() {
    return this.supabaseConnected;
  }

  isInitialized() {
    return this.initialized;
  }
}

export const autoInit = new AutoInitializationService();

// Auto-initialize when the module loads
autoInit.initialize();
