// Global type declarations for ChargeSource

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

// Extend ImportMeta for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_ENABLE_DEBUG?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_ERROR_REPORTING?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_ALLOWED_FILE_TYPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Supabase client type extensions
declare namespace Supabase {
  interface SupabaseClient {
    supabaseUrl?: string;
    supabaseKey?: string;
  }
}

// Global window extensions
declare global {
  interface Window {
    // Add any global window properties here
  }
}

export {};
