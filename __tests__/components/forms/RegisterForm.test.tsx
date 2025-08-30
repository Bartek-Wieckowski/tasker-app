import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterForm from "@/components/shared/Forms/RegisterForm";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import userEvent from "@testing-library/user-event";

describe("RegisterForm component", () => {
  it("should render all correct label", () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <RegisterForm />
        </MemoryRouter>
      </AllTheProviders>
    );

    expect(screen.getByLabelText(/common.username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/common.email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/common.password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /common.register/i })
    ).toBeInTheDocument();
  });

  it("should show error message when username is empty", async () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <RegisterForm />
        </MemoryRouter>
      </AllTheProviders>
    );
    const user = userEvent.setup();
    const button = await screen.findByRole("button");
    await user.click(button);

    expect(
      await screen.findByText("common.usernameMinLength")
    ).toBeInTheDocument();
  });
});
