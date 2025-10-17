import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Index from "../Index";
import { vi, describe, it, expect } from "vitest";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

describe("Index landing page", () => {
  it("renders hero and primary CTAs", () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Streamline Your/i }),
    ).toBeTruthy();

    const ctas = screen.getAllByRole("link", { name: /Start Free Trial|Get Started/i });
    expect(ctas.length).toBeGreaterThan(0);
  });
});
