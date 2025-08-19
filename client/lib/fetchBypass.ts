/**
 * FullStory Bypass Utility
 *
 * FullStory intercepts window.fetch and can break API calls.
 * This utility provides alternative methods to bypass FullStory interference.
 */

// Store original fetch before FullStory wraps it
const originalFetch =
  typeof window !== "undefined" && window.fetch
    ? window.fetch.bind(window)
    : null;

/**
 * Detect if FullStory is active and intercepting fetch
 */
export const isFullStoryActive = (): boolean => {
  if (typeof window === "undefined") return false;

  return !!(
    (window as any).FS ||
    document.querySelector('script[src*="fullstory"]') ||
    document.querySelector('script[src*="fs.js"]') ||
    (window.fetch && window.fetch.toString().includes("fullstory"))
  );
};

/**
 * Alternative fetch implementation using XMLHttpRequest
 * This bypasses FullStory's fetch interception
 */
export const fetchBypass = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || "GET";

    xhr.open(method, url, true);

    // Set headers
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    // Handle response
    xhr.onload = () => {
      const response = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: new Headers(
          xhr
            .getAllResponseHeaders()
            .split("\r\n")
            .reduce(
              (headers, line) => {
                const [key, value] = line.split(": ");
                if (key && value) headers[key] = value;
                return headers;
              },
              {} as Record<string, string>,
            ),
        ),
      });
      resolve(response);
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Request timeout"));

    // Set timeout if specified
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Request aborted"));
      });
    }

    // Send request
    xhr.send((options.body as string) || null);
  });
};

/**
 * Smart fetch that automatically chooses the best method
 * Uses native fetch if safe, otherwise uses XMLHttpRequest bypass
 */
export const smartFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  // If FullStory is detected, use XMLHttpRequest bypass
  if (isFullStoryActive()) {
    console.log("🔄 FullStory detected, using XMLHttpRequest bypass for:", url);
    return fetchBypass(url, options);
  }

  // Use native fetch if safe
  return fetch(url, options);
};

/**
 * Restore original fetch if available
 */
export const getOriginalFetch = (): typeof fetch | null => {
  return originalFetch;
};
