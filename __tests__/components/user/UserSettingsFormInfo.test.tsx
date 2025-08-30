import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import userEvent from "@testing-library/user-event";
import UserSettingsFormInfo from "@/components/shared/User/UserSettingsFormInfo";

describe("UserSettingsFormInfo component", () => {
  it("should render username and email correct label", () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <UserSettingsFormInfo />
        </MemoryRouter>
      </AllTheProviders>
    );

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it("should show error message when username is empty", async () => {
    const user = userEvent.setup();
    render(
      <AllTheProviders>
        <MemoryRouter>
          <UserSettingsFormInfo />
        </MemoryRouter>
      </AllTheProviders>
    );

    const submitButton = screen.getByRole("button", {
      name: /userSettingsForm.saving/i,
    });
    await user.click(submitButton);

    expect(
      await screen.findByText("common.usernameMinLength")
    ).toBeInTheDocument();
  });
});
