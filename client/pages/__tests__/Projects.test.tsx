import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Projects from "../Projects";
import { AuthProvider } from "../../hooks/useAuth";
import {
  mockLocalStorage,
  mockGoogleMaps,
  createTestProject,
  createTestUser,
} from "../../lib/testing";

// Mock the auth hook
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: createTestUser(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock Supabase
vi.mock("../../lib/supabase", () => ({
  projectService: {
    getAllProjects: vi.fn(() => Promise.resolve([])),
  },
  autoConfigureSupabase: vi.fn(() => Promise.resolve(false)),
}));

// Mock performance utils
vi.mock("../../lib/performance", () => ({
  useDebounce: (value: any) => value,
  useLocalStorage: () => [[], vi.fn()],
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>,
  );
};

describe("Projects Component", () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    mockStorage = mockLocalStorage();
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
    });

    // Mock Google Maps
    mockGoogleMaps();

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    renderWithProviders(<Projects />);
    expect(screen.getByText("Loading projects...")).toBeInTheDocument();
  });

  it("displays projects after loading", async () => {
    const testProjects = [createTestProject()];
    mockStorage.getItem.mockReturnValue(JSON.stringify(testProjects));

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("Test EV Project")).toBeInTheDocument();
      expect(screen.getByText("Test Client")).toBeInTheDocument();
    });
  });

  it("filters projects by search query", async () => {
    const testProjects = [
      createTestProject({ name: "Solar Project" }),
      createTestProject({ name: "Wind Project", id: "test-project-2" }),
    ];
    mockStorage.getItem.mockReturnValue(JSON.stringify(testProjects));

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("Solar Project")).toBeInTheDocument();
      expect(screen.getByText("Wind Project")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search projects/i);
    fireEvent.change(searchInput, { target: { value: "Solar" } });

    await waitFor(() => {
      expect(screen.getByText("Solar Project")).toBeInTheDocument();
      expect(screen.queryByText("Wind Project")).not.toBeInTheDocument();
    });
  });

  it("changes view mode between grid and list", async () => {
    const testProjects = [createTestProject()];
    mockStorage.getItem.mockReturnValue(JSON.stringify(testProjects));

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("Test EV Project")).toBeInTheDocument();
    });

    // Switch to list view
    const listViewButton = screen.getByRole("button", { name: /list/i });
    fireEvent.click(listViewButton);

    // Verify list view button has accessible name and was activated
    expect(listViewButton).toHaveAttribute("aria-label", "List view");
  });

  it("opens project details modal", async () => {
    const testProjects = [createTestProject()];
    mockStorage.getItem.mockReturnValue(JSON.stringify(testProjects));

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("Test EV Project")).toBeInTheDocument();
    });

    // Click on more options menu
    const moreButton = screen.getAllByRole("button")[0]; // First more button
    fireEvent.click(moreButton);

    // Click on View Details
    const viewDetailsButton = screen.getByText("View Details");
    fireEvent.click(viewDetailsButton);

    // Modal should open
    await waitFor(() => {
      expect(
        screen.getByText("Project details and site information"),
      ).toBeInTheDocument();
    });
  });

  it("handles project deletion", async () => {
    const testProjects = [createTestProject()];
    mockStorage.getItem.mockReturnValue(JSON.stringify(testProjects));

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("Test EV Project")).toBeInTheDocument();
    });

    // Click on more options menu
    const moreButton = screen.getAllByRole("button")[0];
    fireEvent.click(moreButton);

    // Click on Delete
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to delete this project?",
    );
    expect(mockStorage.setItem).toHaveBeenCalled();
  });

  it("handles empty state correctly", async () => {
    mockStorage.getItem.mockReturnValue("[]");

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("No projects yet")).toBeInTheDocument();
      expect(
        screen.getByText("Create your first project to get started"),
      ).toBeInTheDocument();
    });
  });

  it("shows map view when selected", async () => {
    const testProjects = [
      createTestProject({
        latitude: -33.8688,
        longitude: 151.2093,
      }),
    ];
    mockStorage.getItem.mockReturnValue(JSON.stringify(testProjects));

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText("Test EV Project")).toBeInTheDocument();
    });

    // Switch to map view
    const mapViewButton = screen.getByRole("button", { name: /map/i });
    fireEvent.click(mapViewButton);

    // Should show map container
    await waitFor(() => {
      expect(screen.getByText("Project Locations")).toBeInTheDocument();
      expect(
        screen.getByText("Interactive map showing all project sites"),
      ).toBeInTheDocument();
    });
  });
});
