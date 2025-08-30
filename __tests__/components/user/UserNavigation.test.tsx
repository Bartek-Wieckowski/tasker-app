import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import { describe, it, expect } from "vitest";
import UserNavigation from "@/components/shared/User/UserNavigation";

describe("UserNavigation component", () => {
  it("should login link in navigation have special class if we are on login route", async () => {
    render(
      <AllTheProviders>
        <MemoryRouter initialEntries={["/login"]}>
          <UserNavigation />
        </MemoryRouter>
      </AllTheProviders>
    );

    const nav = screen.getByRole("navigation"); //
    expect(nav).toBeInTheDocument();

    const loginLink = await screen.findByRole("link", { name: /login/i });

    expect(loginLink).toHaveAttribute("href", "/login");
    expect(loginLink).toHaveClass(
      "before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500"
    );
  });

  it("should register link in navigation have special class if we are on login route", async () => {
    render(
      <AllTheProviders>
        <MemoryRouter initialEntries={["/register"]}>
          <UserNavigation />
        </MemoryRouter>
      </AllTheProviders>
    );

    const nav = screen.getByRole("navigation"); //
    expect(nav).toBeInTheDocument();

    const registerLink = await screen.findByRole("link", { name: /register/i });

    expect(registerLink).toHaveAttribute("href", "/register");
    expect(registerLink).toHaveClass(
      "before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500"
    );
  });
});
