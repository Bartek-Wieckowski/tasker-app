import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import LoginForm from "@/components/shared/Forms/LoginForm";
import userEvent from "@testing-library/user-event";

describe("LoginForm component", () => {
  it("should render all correct label", () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AllTheProviders>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    const submitButton = screen.getByText("common.login");
    expect(submitButton).toHaveAttribute("type", "submit");

    expect(submitButton).toBeInTheDocument();
  });

  it("should render google button with icon", () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AllTheProviders>
    );

    const googleButton = screen.getByRole("button", {
      name: /loginPage.loginWithGoogle/i,
    });
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveAttribute("type", "button");
    expect(within(googleButton).getByRole("img")).toBeInTheDocument();
  });

  it("should show error message when email is empty", async () => {
    const user = userEvent.setup();
    render(
      <AllTheProviders>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AllTheProviders>
    );

    const submitButton = screen.getByText("common.login");
    await user.click(submitButton);

    expect(await screen.findByText("common.emailInvalid")).toBeInTheDocument();
  });
});
