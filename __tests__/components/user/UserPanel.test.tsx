import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import { describe, it, expect } from "vitest";
import UserPanel from "@/components/shared/User/UserPanel";
import userEvent from "@testing-library/user-event";

describe("UserPanel component", () => {
  it("should open popup when click on avatar", async () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <UserPanel />
        </MemoryRouter>
      </AllTheProviders>
    );

    const user = userEvent.setup();
    const userAvatar = screen.getByTestId("user-avatar-wrapper");
    expect(userAvatar).toBeInTheDocument();

    await user.click(userAvatar);

    const popup = await screen.findByTestId("user-panel-popover-content");
    expect(popup).toBeInTheDocument();
  });

  it("should have three buttons in open popup", async () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <UserPanel />
        </MemoryRouter>
      </AllTheProviders>
    );

    const user = userEvent.setup();
    const userAvatar = screen.getByTestId("user-avatar-wrapper");
    expect(userAvatar).toBeInTheDocument();

    await user.click(userAvatar);

    const popup = await screen.findByTestId("user-panel-popover-content");
    expect(popup).toBeInTheDocument();

    const buttons = popup.querySelectorAll("button");
    expect(buttons).toHaveLength(3);
  });
});
