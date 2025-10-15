import { useState, useEffect, useCallback, useRef } from "react";

// Cache for localStorage values to prevent repeated JSON parsing
import { safeGetLocal } from "@/lib/safeLocalStorage";
const storageCache = new Map<string, any>();
const listeners = new Map<string, Set<(value: any) => void>>();

// Custom event for cross-tab synchronization
const STORAGE_EVENT = "optimized-storage-change";

interface StorageOptions {
  cache?: boolean;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

/**
 * Optimized localStorage hook with caching and cross-tab sync
 * Prevents repeated JSON parsing and provides better performance
 */
export function useOptimizedStorage<T>(
  key: string,
  defaultValue: T,
  options: StorageOptions = {},
): [T, (value: T | ((prev: T) => T)) => void] {
  const {
    cache = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const isMountedRef = useRef(true);

  // Get initial value with caching
  const getStoredValue = useCallback((): T => {
    if (typeof window === "undefined") return defaultValue;

    try {
      // Check cache first if caching is enabled
      if (cache && storageCache.has(key)) {
        return storageCache.get(key);
      }

      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      const parsed = deserialize(item);

      // Update cache
      if (cache) {
        storageCache.set(key, parsed);
      }

      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, cache, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update localStorage and cache
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") return;

      try {
        const currentValue = getStoredValue();
        const newValue =
          typeof value === "function"
            ? (value as (prev: T) => T)(currentValue)
            : value;

        // Update localStorage
        localStorage.setItem(key, serialize(newValue));

        // Update cache
        if (cache) {
          storageCache.set(key, newValue);
        }

        // Update state if component is still mounted
        if (isMountedRef.current) {
          setStoredValue(newValue);
        }

        // Notify other instances
        notifyListeners(key, newValue);

        // Dispatch custom event for cross-tab sync
        window.dispatchEvent(
          new CustomEvent(STORAGE_EVENT, {
            detail: { key, value: newValue },
          }),
        );
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, cache, getStoredValue],
  );

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null && isMountedRef.current) {
        try {
          const newValue = deserialize(e.newValue);

          // Update cache
          if (cache) {
            storageCache.set(key, newValue);
          }

          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key && isMountedRef.current) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      STORAGE_EVENT,
      handleCustomStorageChange as EventListener,
    );

    // Register listener for programmatic updates
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }

    const keyListeners = listeners.get(key)!;
    const updateListener = (newValue: any) => {
      if (isMountedRef.current) {
        setStoredValue(newValue);
      }
    };
    keyListeners.add(updateListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        STORAGE_EVENT,
        handleCustomStorageChange as EventListener,
      );
      keyListeners.delete(updateListener);
    };
  }, [key, deserialize, cache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [storedValue, setValue];
}

// Notify all listeners for a specific key
function notifyListeners(key: string, value: any) {
  const keyListeners = listeners.get(key);
  if (keyListeners) {
    keyListeners.forEach((listener) => listener(value));
  }
}

// Utility functions for common storage operations
export const storageUtils = {
  /**
   * Clear cache for a specific key
   */
  clearCache: (key: string) => {
    storageCache.delete(key);
  },

  /**
   * Clear entire cache
   */
  clearAllCache: () => {
    storageCache.clear();
  },

  /**
   * Get cache stats
   */
  getCacheStats: () => ({
    size: storageCache.size,
    keys: Array.from(storageCache.keys()),
  }),

  /**
   * Preload frequently accessed keys
   */
  preloadKeys: (keys: string[]) => {
    keys.forEach((key) => {
      try {
        const parsed = safeGetLocal<any>(key, null);
        if (parsed !== null) {
          storageCache.set(key, parsed);
        }
      } catch (error) {
        console.warn(`Error preloading key "${key}":`, error);
      }
    });
  },
};

// Hook for projects specifically
export function useProjectsStorage() {
  return useOptimizedStorage("chargeSourceProjects", [], {
    cache: true,
  });
}

// Hook for drafts specifically
export function useDraftsStorage() {
  return useOptimizedStorage("chargeSourceDrafts", [], {
    cache: true,
  });
}

// Hook for user preferences
export function useUserPreferences() {
  return useOptimizedStorage(
    "chargeSourceUserPrefs",
    {
      theme: "light",
      notifications: true,
      autoSave: true,
    },
    {
      cache: true,
    },
  );
}
