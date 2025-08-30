import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import { describe, it, expect } from "vitest";
import TodosTabsList from "@/components/shared/Todos/TodosTabsList";
import { Tabs } from "@/components/ui/tabs";

describe("TodosTabsList component", () => {
  it("should render all correct tabs label", () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <Tabs>
            <TodosTabsList categorySetHandler={() => {}} />
          </Tabs>
        </MemoryRouter>
      </AllTheProviders>
    );

    expect(screen.getByText("todosTabs.all")).toBeInTheDocument();
    expect(screen.getByText("todosTabs.completed")).toBeInTheDocument();
    expect(screen.getByText("todosTabs.notCompleted")).toBeInTheDocument();
  });
});
