// Performance utilities for ChargeSource app
import React, { useCallback, useRef, useEffect } from "react";

/**
 * Debounce hook for preventing excessive API calls or state updates
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay],
  );
}

/**
 * Throttle hook for rate-limiting expensive operations
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000,
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    }) as T,
    [callback, delay],
  );
}

/**
 * Local storage hook with error handling and JSON parsing
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const getValue = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const currentValue = getValue();
        const newValue =
          typeof value === "function"
            ? (value as (prev: T) => T)(currentValue)
            : value;

        localStorage.setItem(key, JSON.stringify(newValue));

        // Dispatch custom event for cross-component updates
        window.dispatchEvent(
          new CustomEvent("localStorageChange", {
            detail: { key, value: newValue },
          }),
        );
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, getValue],
  );

  return [getValue(), setValue];
}

/**
 * Optimized intersection observer for lazy loading
 */
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {},
) {
  const targetRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      callback(entry);
    }, options);

    observer.observe(targetRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return targetRef;
}

/**
 * Async error boundary utility
 */
export function withErrorBoundary<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  fallback?: (error: Error) => void,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error("Async operation failed:", error);
      if (fallback) {
        fallback(error as Error);
      }
      throw error;
    }
  }) as T;
}

/**
 * Memory-efficient array operations
 */
export const arrayUtils = {
  /**
   * Remove duplicates by key efficiently
   */
  uniqueBy<T>(array: T[], keyFn: (item: T) => string | number): T[] {
    const seen = new Set();
    return array.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  /**
   * Chunked processing for large arrays
   */
  async processInChunks<T, R>(
    array: T[],
    processor: (chunk: T[]) => Promise<R[]>,
    chunkSize: number = 100,
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      const chunkResults = await processor(chunk);
      results.push(...chunkResults);

      // Allow UI to breathe
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return results;
  },
};

/**
 * Bundle size optimization - lazy load heavy components
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return React.lazy(factory);
}
