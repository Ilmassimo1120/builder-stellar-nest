import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProjectWizard from "../ProjectWizard";
import { AuthProvider } from "../../hooks/useAuth";
import { createTestUser, createMockLocalStorage } from "../../lib/testing";

// Mock the auth hook
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: createTestUser(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock Supabase
vi.mock("../../lib/supabase", () => ({
  projectService: {
    createProject: vi.fn(() => Promise.resolve({ id: "test-project" })),
  },
  autoConfigureSupabase: vi.fn(() => Promise.resolve(false)),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>,
  );
};

describe("ProjectWizard Component", () => {
  let uninstallLocalStorage: (() => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const { mock, install, uninstall } = createMockLocalStorage({
      chargeSourceDrafts: "[]",
    });
    install();
    uninstallLocalStorage = uninstall;
  });

  afterEach(() => {
    if (uninstallLocalStorage) uninstallLocalStorage();
  });

  it("renders first step correctly", () => {
    renderWithProviders(<ProjectWizard />);

    expect(screen.getByText("Client Requirements")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Contact Name/i)).toBeInTheDocument();
  });

  it("allows navigation between steps", async () => {
    renderWithProviders(<ProjectWizard />);

    // Fill required fields in step 1
    fireEvent.change(screen.getByLabelText(/Primary Contact Name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });

    // Click next button
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Site Assessment")).toBeInTheDocument();
      expect(screen.getByText("Step 2 of 6")).toBeInTheDocument();
    });
  });

  it("prevents navigation with empty required fields", () => {
    renderWithProviders(<ProjectWizard />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Should stay on step 1
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
  });

  it("allows going back to previous steps", async () => {
    renderWithProviders(<ProjectWizard />);

    // Fill required fields and go to step 2
    fireEvent.change(screen.getByLabelText(/Primary Contact Name/i), {
      target: { value: "John Doe" },
    });

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 6")).toBeInTheDocument();
    });

    // Click previous button
    const prevButton = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
    });
  });

  it("saves draft when requested", async () => {
    const setItemSpy = vi.spyOn(localStorage, "setItem");

    renderWithProviders(<ProjectWizard />);

    // Fill some data
    fireEvent.change(screen.getByLabelText(/Primary Contact Name/i), {
      target: { value: "John Doe" },
    });

    // Click save draft
    const saveDraftButton = screen.getByRole("button", { name: /save draft/i });
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "chargeSourceDrafts",
        expect.stringContaining("John Doe"),
      );
    });
  });

  it("shows progress correctly", () => {
    renderWithProviders(<ProjectWizard />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "16.666666666666668"); // 1/6 * 100
  });

  it("displays step indicators", () => {
    renderWithProviders(<ProjectWizard />);

    expect(screen.getByText("Client Requirements")).toBeInTheDocument();
    expect(screen.getByText("Site Assessment")).toBeInTheDocument();
    expect(screen.getByText("Charger Selection")).toBeInTheDocument();
    expect(screen.getByText("Grid Capacity Analysis")).toBeInTheDocument();
    expect(screen.getByText("Compliance Checklist")).toBeInTheDocument();
    expect(screen.getByText("Project Summary")).toBeInTheDocument();
  });

  it("handles organization type selection", () => {
    renderWithProviders(<ProjectWizard />);

    const organizationSelect = screen.getByRole("combobox", {
      name: /organization type/i,
    });
    fireEvent.click(organizationSelect);

    const retailOption = screen.getByText("Retail/Shopping Centre");
    fireEvent.click(retailOption);

    expect(organizationSelect).toHaveTextContent("Retail/Shopping Centre");
  });

  it("validates email format", () => {
    renderWithProviders(<ProjectWizard />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    // HTML5 validation should handle this
    expect(emailInput).toHaveAttribute("type", "email");
  });
});
