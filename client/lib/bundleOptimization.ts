// Bundle size optimization utilities
import React, { lazy } from "react";

/**
 * Lazy load components with error boundaries
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ComponentType,
) => {
  const LazyComponent = lazy(factory);

  if (fallback) {
    return (props: React.ComponentProps<T>) => {
      const FallbackComponent = fallback;
      return React.createElement(
        React.Suspense,
        { fallback: React.createElement(FallbackComponent) },
        React.createElement(LazyComponent, props),
      );
    };
  }

  return LazyComponent;
};

/**
 * Dynamic import with preloading
 */
export const dynamicImport = <T>(
  factory: () => Promise<T>,
  preload: boolean = false,
) => {
  let modulePromise: Promise<T> | null = null;

  const load = () => {
    if (!modulePromise) {
      modulePromise = factory();
    }
    return modulePromise;
  };

  // Preload if requested
  if (preload) {
    // Use requestIdleCallback if available
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => load());
    } else {
      setTimeout(() => load(), 0);
    }
  }

  return load;
};

/**
 * Lazy load heavy libraries
 */
export const lazyLibraries = {
  // Lazy load date-fns
  dateFns: dynamicImport(() => import("date-fns")),

  // Lazy load Recharts for analytics
  recharts: dynamicImport(() => import("recharts")),

  // Lazy load Framer Motion for animations
  framerMotion: dynamicImport(() => import("framer-motion")),

  // Lazy load React Hook Form
  reactHookForm: dynamicImport(() => import("react-hook-form")),
};

/**
 * Code splitting by route
 */
export const lazyPages = {
  Dashboard: createLazyComponent(() => import("../pages/Dashboard")),
  Projects: createLazyComponent(() => import("../pages/Projects")),
  ProjectWizard: createLazyComponent(() => import("../pages/ProjectWizard")),
  Login: createLazyComponent(() => import("../pages/Login")),
  Register: createLazyComponent(() => import("../pages/Register")),
};

/**
 * Tree shaking helpers - only import what's needed
 */
export const iconUtils = {
  // Instead of importing all lucide-react icons, import only needed ones
  getIcon: (name: string) => {
    const iconMap = {
      plus: () => import("lucide-react").then((mod) => ({ default: mod.Plus })),
      edit: () => import("lucide-react").then((mod) => ({ default: mod.Edit })),
      trash: () =>
        import("lucide-react").then((mod) => ({ default: mod.Trash2 })),
      eye: () => import("lucide-react").then((mod) => ({ default: mod.Eye })),
      copy: () => import("lucide-react").then((mod) => ({ default: mod.Copy })),
      // Add more as needed
    };

    return iconMap[name as keyof typeof iconMap]?.();
  },
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const preloadFont = (href: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    link.href = href;
    document.head.appendChild(link);
  };

  // Preload critical images
  const preloadImage = (src: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  };

  // Only run in browser
  if (typeof window !== "undefined") {
    // Add your critical resources here
    // preloadFont('/fonts/inter-var.woff2');
    // preloadImage('/logo.svg');
  }
};

/**
 * Monitor bundle size in development
 */
export const bundleAnalyzer = {
  logBundleInfo: () => {
    if (import.meta.env.DEV) {
      console.group("📦 Bundle Analysis");
      console.log("Environment:", import.meta.env.MODE);
      console.log("Build timestamp:", new Date().toISOString());

      // Log loaded modules count
      if ("performance" in window && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType("resource");
        const jsResources = resources.filter((r) => r.name.includes(".js"));
        const cssResources = resources.filter((r) => r.name.includes(".css"));

        console.log("JavaScript resources:", jsResources.length);
        console.log("CSS resources:", cssResources.length);
        console.log("Total resources:", resources.length);
      }

      console.groupEnd();
    }
  },
};

// Auto-run bundle analysis in development
if (import.meta.env.DEV) {
  // Run after initial load
  setTimeout(() => {
    bundleAnalyzer.logBundleInfo();
  }, 2000);
}
