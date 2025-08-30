import Logo from "@/components/shared/Logo";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "@/routes/constants";
import { render } from "../setup";

describe("Logo component", () => {
  it("should render Logo component", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    const linkElement = getByText(/tasker/i);
    expect(linkElement).toBeInTheDocument();
  });

  it("should change route to home when tasker text(logo) is clicked", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/some-route"]}>
        <Routes>
          <Route path={ROUTES.home} element={<div>Homepage</div>} />
          <Route path="/some-route" element={<Logo />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByText("tasker"));

    expect(getByText("Homepage")).toBeInTheDocument();
  });
});
