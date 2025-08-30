import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Todopage from "@/pages/Todopage";
import AllTheProviders from "@/AllTheProviders";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/api/queries/todos/useTodoById", () => ({
  useTodoById: () => ({
    isLoading: false,
    isError: false,
    todo: {
      id: "1",
      todo: "Test todo",
      is_completed: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  }),
}));

describe("Todopage component", () => {
  it("should render navigation with back icon", () => {
    const { container } = render(
      <AllTheProviders>
        <MemoryRouter initialEntries={["/todo/1"]}>
          <Todopage />
        </MemoryRouter>
      </AllTheProviders>
    );

    const backLink = screen.getByRole("link");
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
