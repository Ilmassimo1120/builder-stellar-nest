export function safeParse<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch (err) {
    console.warn("safeParse: failed to parse JSON, returning fallback", err);
    return fallback;
  }
}

export function safeGetLocal<T = any>(key: string, fallback: T): T {
  try {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') {
      const raw = (globalThis as any).localStorage.getItem(key);
      return safeParse<T>(raw, fallback);
    }
    return fallback;
  } catch (err) {
    console.warn("safeGetLocal: error accessing localStorage", err);
    return fallback;
  }
}

export function generateId(prefix = "", index?: number): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof (crypto as any).randomUUID === "function"
    ) {
      return prefix + (crypto as any).randomUUID();
    }
  } catch (e) {
    // ignore and fallback
  }
  const now = Date.now();
  if (typeof index === "number") return `${prefix}${now}-${index}`;
  return `${prefix}${now}-${Math.floor(Math.random() * 10000)}`;
}
