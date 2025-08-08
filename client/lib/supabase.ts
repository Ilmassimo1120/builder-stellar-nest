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

// Connection testing functions
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return false;
  }
};

export const autoConfigureSupabase = async (): Promise<boolean> => {
  try {
    // Test connection to users table
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (!error) {
      console.log("✅ Supabase connection successful");
      return true;
    } else {
      console.log("⚠️ Supabase connection failed:", error.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Supabase auto-configuration failed:", error);
    return false;
  }
};

// Project service functions
export const projectService = {
  getAllProjects: async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

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
        .from('projects')
        .select('*')
        .eq('id', id)
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
        .from('projects')
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
        .from('projects')
        .update(updates)
        .eq('id', id)
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }
};

export type { Database };
