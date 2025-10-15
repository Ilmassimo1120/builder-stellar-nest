// Test setup for Vitest + Testing Library
import '@testing-library/jest-dom';

// Provide a minimal localStorage shim if not present (for non-jsdom environments)
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => (store[k] = String(v)),
    removeItem: (k: string) => delete store[k],
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
  } as unknown as Storage;
}
