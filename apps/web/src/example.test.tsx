import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Smoke test proving the Vitest + React Testing Library setup works.
// Replace with real component tests as you build features.
describe("web testing setup", () => {
  it("renders a component with React Testing Library", () => {
    render(<h1>Ondo</h1>);

    expect(screen.getByRole("heading", { name: "Ondo" })).toBeInTheDocument();
  });
});
