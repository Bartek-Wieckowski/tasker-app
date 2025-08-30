import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/shared/AppLayout";
import { render } from "./../../setup";

describe("AppLayout component", () => {
  it("should render two Container components", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AppLayout />} />
        </Routes>
      </MemoryRouter>
    );

    const containers = screen.getAllByTestId("container");

    expect(containers).toHaveLength(2);
  });

  it("should render Outlet inside the second Container", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route
              path="/"
              element={<div data-testid="outlet-content">Outlet Content</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const containers = screen.getAllByTestId("container");
    const outletContents = screen.getAllByTestId("outlet-content");

    expect(containers).toHaveLength(2);
    expect(outletContents).toHaveLength(2);

    const secondContainer = containers[1];
    const secondOutletContent = outletContents[1];

    expect(secondContainer).toContainElement(secondOutletContent);
  });
});
