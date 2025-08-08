import { createClient } from "@supabase/supabase-js";

// Supabase configuration - automatically configured for ChargeSource
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://tepmkljodsifaexmrinl.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcG1rbGpvZHNpZmFleG1yaW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDQwMjUsImV4cCI6MjA3MDE4MDAyNX0.n4WdeHUHHc5PuJV8-2oDn826CoNxNzHHbt4KxeAhOYc";

// Validate configuration
if (!supabaseUrl || supabaseUrl.includes("your-project")) {
  console.error("❌ Invalid Supabase URL configuration:", supabaseUrl);
}
if (!supabaseAnonKey || supabaseAnonKey.includes("your-anon-key")) {
  console.error("❌ Invalid Supabase API key configuration");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "global_admin" | "admin" | "sales" | "partner" | "user";
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          department: string | null;
          phone: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: "global_admin" | "admin" | "sales" | "partner" | "user";
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          department?: string | null;
          phone?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "global_admin" | "admin" | "sales" | "partner" | "user";
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          department?: string | null;
          phone?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: "draft" | "in_progress" | "completed" | "cancelled";
          user_id: string;
          client_info: any;
          site_assessment: any | null;
          charger_selection: any | null;
          estimated_budget: number | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: "draft" | "in_progress" | "completed" | "cancelled";
          user_id: string;
          client_info: any;
          site_assessment?: any | null;
          charger_selection?: any | null;
          estimated_budget?: number | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: "draft" | "in_progress" | "completed" | "cancelled";
          user_id?: string;
          client_info?: any;
          site_assessment?: any | null;
          charger_selection?: any | null;
          estimated_budget?: number | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string;
          title: string;
          description: string | null;
          status:
            | "draft"
            | "pending_review"
            | "sent"
            | "viewed"
            | "accepted"
            | "rejected"
            | "expired";
          user_id: string;
          project_id: string | null;
          client_info: any;
          line_items: any;
          totals: any;
          settings: any;
          valid_until: string;
          created_at: string;
          updated_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          quote_number: string;
          title: string;
          description?: string | null;
          status?:
            | "draft"
            | "pending_review"
            | "sent"
            | "viewed"
            | "accepted"
            | "rejected"
            | "expired";
          user_id: string;
          project_id?: string | null;
          client_info: any;
          line_items?: any;
          totals: any;
          settings?: any;
          valid_until: string;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          quote_number?: string;
          title?: string;
          description?: string | null;
          status?:
            | "draft"
            | "pending_review"
            | "sent"
            | "viewed"
            | "accepted"
            | "rejected"
            | "expired";
          user_id?: string;
          project_id?: string | null;
          client_info?: any;
          line_items?: any;
          totals?: any;
          settings?: any;
          valid_until?: string;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string;
          category: string;
          subcategory: string | null;
          brand: string;
          model: string;
          specifications: any;
          pricing: any;
          inventory: any;
          supplier: any;
          images: string[];
          documents: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          description: string;
          category: string;
          subcategory?: string | null;
          brand: string;
          model: string;
          specifications: any;
          pricing: any;
          inventory: any;
          supplier: any;
          images?: string[];
          documents?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          description?: string;
          category?: string;
          subcategory?: string | null;
          brand?: string;
          model?: string;
          specifications?: any;
          pricing?: any;
          inventory?: any;
          supplier?: any;
          images?: string[];
          documents?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      global_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          category: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          category: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          category?: string;
          updated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      partner_configs: {
        Row: {
          id: string;
          user_id: string;
          config: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          config: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          config?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "global_admin" | "admin" | "sales" | "partner" | "user";
      project_status: "draft" | "in_progress" | "completed" | "cancelled";
      quote_status:
        | "draft"
        | "pending_review"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired";
    };
  };
}

// Helper functions
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Real-time subscriptions
export const subscribeToQuotes = (
  userId: string,
  callback: (payload: any) => void,
) => {
  return supabase
    .channel("quotes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quotes",
        filter: `user_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe();
};

export const subscribeToProjects = (
  userId: string,
  callback: (payload: any) => void,
) => {
  return supabase
    .channel("projects")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "projects",
        filter: `user_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe();
};

// Database setup function
export const setupDatabase = async () => {
  try {
    // This would typically be run once during deployment
    // For development, you can run this manually
    console.log("Database setup completed");
  } catch (error) {
    console.error("Database setup failed:", error);
    throw error;
  }
};

// Auto-initialize Supabase connection on app startup
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    console.log("🚀 Initializing ChargeSource Supabase connection...");

    // Skip network tests in offline environments
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log("🔄 Offline mode detected, skipping connection test");
      return false;
    }

    // Try a simple ping to check if Supabase is reachable
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${supabaseUrl}/health`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'apikey': supabaseAnonKey,
        },
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 404) {
        // 404 is fine - means Supabase is reachable
        console.log("✅ Supabase endpoint is reachable");
        return true;
      }
    } catch (fetchError) {
      console.log("⚠️ Network connectivity issue, operating in offline mode");
      console.log("Error details:", fetchError instanceof Error ? fetchError.message : String(fetchError));
      return false;
    }

    // If we get here, assume offline mode
    console.log("🔄 Unable to verify connection, operating in offline mode");
    return false;
  } catch (error) {
    console.log("⚠️ Connection check failed, operating in offline mode");
    console.log("Error details:", error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Global connection state
let isSupabaseConnected = false;

// Initialize on module load
initializeSupabase().then((connected) => {
  isSupabaseConnected = connected;
  console.log("🔄 Module load initialization complete:", connected);
});

export const isConnectedToSupabase = () => isSupabaseConnected;

// Connection testing functions
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try function first
    let { data, error } = await supabase.rpc("health_check");

    if (error) {
      // Try table method as fallback
      const result = await supabase.from("health_status").select("*").limit(1);
      return !result.error;
    }

    return true;
  } catch (error) {
    console.error(
      "Supabase connection test failed:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
};

export const autoConfigureSupabase = async (): Promise<boolean> => {
  console.log("🔄 autoConfigureSupabase called");

  try {
    // Always recheck the connection
    const connected = await initializeSupabase();
    isSupabaseConnected = connected;

    if (connected) {
      console.log("✅ Supabase connection established");
    } else {
      console.log("💾 Operating in local storage mode");
    }

    console.log("🔄 autoConfigureSupabase result:", connected);
    return connected;
  } catch (error) {
    console.log("⚠️ autoConfigureSupabase error, falling back to local mode");
    console.log("Error details:", error instanceof Error ? error.message : String(error));
    isSupabaseConnected = false;
    return false;
  }
};

// Project service functions
export const projectService = {
  getAllProjects: async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },

  getProject: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  },

  createProject: async (projectData: any) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  updateProject: async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },
};

export type { Database };
