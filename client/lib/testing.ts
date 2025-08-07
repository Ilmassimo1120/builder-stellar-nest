// Testing utilities for ChargeSource app
import { vi } from "vitest";

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

/**
 * Mock Google Maps API for testing
 */
export const mockGoogleMaps = () => {
  const mockMap = {
    setZoom: vi.fn(),
    setCenter: vi.fn(),
    fitBounds: vi.fn(),
  };

  const mockMarker = {
    setMap: vi.fn(),
    addListener: vi.fn(),
  };

  const mockInfoWindow = {
    open: vi.fn(),
    close: vi.fn(),
  };

  global.window.google = {
    maps: {
      Map: vi.fn(() => mockMap),
      Marker: vi.fn(() => mockMarker),
      InfoWindow: vi.fn(() => mockInfoWindow),
      LatLngBounds: vi.fn(() => ({
        extend: vi.fn(),
      })),
      Size: vi.fn(),
    },
  };

  return { mockMap, mockMarker, mockInfoWindow };
};

/**
 * Mock Supabase client for testing
 */
export const mockSupabase = () => {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    auth: {
      signIn: vi.fn(() => Promise.resolve({ data: null, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null }),
      ),
    },
  };
};

/**
 * Create test project data
 */
export const createTestProject = (overrides = {}) => ({
  id: "test-project-1",
  name: "Test EV Project",
  client: "Test Client",
  status: "Planning",
  progress: 50,
  value: "$100,000",
  deadline: "2024-12-31",
  location: "Sydney, NSW",
  type: "Commercial DC Fast Charging",
  createdAt: "2024-01-01",
  ...overrides,
});

/**
 * Create test user data
 */
export const createTestUser = (overrides = {}) => ({
  id: "test-user-1",
  name: "Test User",
  email: "test@example.com",
  company: "Test Company",
  role: "contractor",
  ...overrides,
});

/**
 * Wait for async operations in tests
 */
export const waitFor = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock router for testing
 */
export const mockRouter = {
  navigate: vi.fn(),
  location: {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
  },
};

/**
 * Test helper for component rendering with providers
 */
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  // This would be implemented with React Testing Library
  // For now, it's a placeholder for the testing structure
  return {
    render: vi.fn(),
    ...options,
  };
};
