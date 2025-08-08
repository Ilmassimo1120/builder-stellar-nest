import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

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

export type { Database };
