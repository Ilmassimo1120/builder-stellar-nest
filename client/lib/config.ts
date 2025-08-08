// Environment configuration with validation for ChargeSource
import { z } from "zod";

// Environment variable schema with strict validation
const envSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),

  // Supabase Configuration
  VITE_SUPABASE_URL: z
    .string()
    .url()
    .default("https://tepmkljodsifaexmrinl.supabase.co"),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .default(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcG1rbGpvZHNpZmFleG1yaW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDQwMjUsImV4cCI6MjA3MDE4MDAyNX0.n4WdeHUHHc5PuJV8-2oDn826CoNxNzHHbt4KxeAhOYc",
    ),

  // Optional environment variables
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_GOOGLE_MAPS_API_KEY: z.string().optional(),
  VITE_ANALYTICS_ID: z.string().optional(),

  // Feature flags
  VITE_ENABLE_DEBUG: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  VITE_ENABLE_ERROR_REPORTING: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
});

// Parse and validate environment variables
function parseEnvironment() {
  try {
    const rawEnv = {
      NODE_ENV: import.meta.env.NODE_ENV,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
      VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
      VITE_ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING,
    };

    return envSchema.parse(rawEnv);
  } catch (error) {
    console.error("❌ Environment validation failed:", error);

    // In development, show detailed error
    if (import.meta.env.DEV) {
      console.error("Environment variables:", import.meta.env);
    }

    throw new Error(
      "Invalid environment configuration. Please check your .env file.",
    );
  }
}

// Export validated configuration
export const config = parseEnvironment();

// Configuration objects for different services
export const supabaseConfig = {
  url: config.VITE_SUPABASE_URL,
  anonKey: config.VITE_SUPABASE_ANON_KEY,
} as const;

export const appConfig = {
  environment: config.NODE_ENV,
  isDevelopment: config.DEV,
  isProduction: config.PROD,
  features: {
    debug: config.VITE_ENABLE_DEBUG,
    analytics: config.VITE_ENABLE_ANALYTICS,
    errorReporting: config.VITE_ENABLE_ERROR_REPORTING,
  },
} as const;

export const integrationConfig = {
  sentry: {
    dsn: config.VITE_SENTRY_DSN,
    enabled: config.VITE_ENABLE_ERROR_REPORTING && !!config.VITE_SENTRY_DSN,
  },
  googleMaps: {
    apiKey: config.VITE_GOOGLE_MAPS_API_KEY,
    enabled: !!config.VITE_GOOGLE_MAPS_API_KEY,
  },
  analytics: {
    id: config.VITE_ANALYTICS_ID,
    enabled: config.VITE_ENABLE_ANALYTICS && !!config.VITE_ANALYTICS_ID,
  },
} as const;

// Utility functions
export const configUtils = {
  /**
   * Check if a required service is properly configured
   */
  isServiceConfigured: (
    service: "supabase" | "sentry" | "googleMaps" | "analytics",
  ): boolean => {
    switch (service) {
      case "supabase":
        return !!(config.VITE_SUPABASE_URL && config.VITE_SUPABASE_ANON_KEY);
      case "sentry":
        return integrationConfig.sentry.enabled;
      case "googleMaps":
        return integrationConfig.googleMaps.enabled;
      case "analytics":
        return integrationConfig.analytics.enabled;
      default:
        return false;
    }
  },

  /**
   * Get missing required configuration
   */
  getMissingConfig: (): string[] => {
    const missing: string[] = [];

    if (!config.VITE_SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
    if (!config.VITE_SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");

    return missing;
  },

  /**
   * Validate configuration and throw if invalid
   */
  validateRequiredConfig: (): void => {
    const missing = configUtils.getMissingConfig();
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }
  },

  /**
   * Get configuration summary for debugging
   */
  getConfigSummary: () => ({
    environment: config.NODE_ENV,
    supabaseConfigured: configUtils.isServiceConfigured("supabase"),
    sentryConfigured: configUtils.isServiceConfigured("sentry"),
    googleMapsConfigured: configUtils.isServiceConfigured("googleMaps"),
    analyticsConfigured: configUtils.isServiceConfigured("analytics"),
    features: appConfig.features,
  }),
};

// Log configuration status in development
if (appConfig.isDevelopment) {
  console.log("🔧 ChargeSource Configuration:", configUtils.getConfigSummary());

  const missing = configUtils.getMissingConfig();
  if (missing.length > 0) {
    console.warn("⚠️ Missing optional environment variables:", missing);
  }
}

// Validate required configuration on startup
try {
  configUtils.validateRequiredConfig();
  if (appConfig.isDevelopment) {
    console.log("✅ Required configuration validated successfully");
  }
} catch (error) {
  console.error("❌ Configuration validation failed:", error);
  if (appConfig.isProduction) {
    throw error; // Fail fast in production
  }
}

export default config;
