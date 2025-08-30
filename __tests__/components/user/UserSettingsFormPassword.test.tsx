import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import userEvent from "@testing-library/user-event";
import UserSettingsFormPassword from "@/components/shared/User/UserSettingsFormPassword";

describe("UserSettingsFormPassword component", () => {
  it("should render new password correct label", () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <UserSettingsFormPassword />
        </MemoryRouter>
      </AllTheProviders>
    );

    expect(
      screen.getByLabelText(/userSettingsForm.newPassword/i)
    ).toBeInTheDocument();
  });

  it("should show error message when new password is empty", async () => {
    const user = userEvent.setup();
    render(
      <AllTheProviders>
        <MemoryRouter>
          <UserSettingsFormPassword />
        </MemoryRouter>
      </AllTheProviders>
    );

    const submitButton = screen.getByRole("button", {
      name: /userSettingsForm.saveNewPassword/i,
    });
    await user.click(submitButton);

    expect(
      await screen.findByText("common.passwordMinLength")
    ).toBeInTheDocument();
  });
});
