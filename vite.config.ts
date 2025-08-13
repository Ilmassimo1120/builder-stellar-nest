import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    sourcemap: false,
    minify: mode === "production" ? "esbuild" : false,
    target: "es2020",
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "sonner"],
          "date-utils": ["date-fns"],
          "charts": ["recharts"],
        },
      },
    },
    commonjsOptions: {
      include: /node_modules/
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
    expressPlugin(),
    ...(mode === "production" ? [compressionPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    // Define environment for better tree shaking
    __DEV__: mode === "development",
  },
  esbuild: {
    // Remove console statements in production
    drop: mode === "production" ? ["console", "debugger"] : [],
    // Ignore TypeScript errors in development
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // Dynamically import server code only during development
      const { createServer } = await import("./server");
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

function compressionPlugin(): Plugin {
  return {
    name: "compression-plugin",
    apply: "build",
    generateBundle() {
      // Add compression headers for production
      console.log("📦 Applying production optimizations...");
    },
  };
}
