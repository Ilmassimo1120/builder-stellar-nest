import { initializeSupabase, isConnectedToSupabase } from './supabase';
import { migrationService } from './services/migrationService';

class AutoInitializationService {
  private initialized = false;
  private supabaseConnected = false;

  async initialize() {
    if (this.initialized) {
      console.log("🔄 AutoInit: Already initialized, returning cached result:", this.supabaseConnected);
      return this.supabaseConnected;
    }

    console.log("🚀 ChargeSource Auto-Initialization Starting...");

    try {
      // Step 1: Initialize Supabase connection
      console.log("🔄 AutoInit: Calling initializeSupabase()...");
      this.supabaseConnected = await initializeSupabase();
      console.log("🔄 AutoInit: initializeSupabase() returned:", this.supabaseConnected);

      if (this.supabaseConnected) {
        console.log("✅ ChargeSource connected to cloud database");

        // Step 2: Auto-migrate localStorage data if it exists
        await this.autoMigrateIfNeeded();
      } else {
        console.log("📱 ChargeSource running in local mode");
      }

      this.initialized = true;
      console.log("🔄 AutoInit: Initialization complete, result:", this.supabaseConnected);
      return this.supabaseConnected;
    } catch (error) {
      console.error("❌ Auto-initialization failed with error:", error);
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
        const result = await migrationService.migrateLocalStorageToSupabase(user);
        
        if (result.success) {
          console.log("✅ Auto-migration completed successfully");
        } else {
          console.log("⚠️ Auto-migration skipped:", result.message);
        }
      }
    } catch (error) {
      console.warn("⚠️ Auto-migration failed, continuing in hybrid mode:", error);
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
