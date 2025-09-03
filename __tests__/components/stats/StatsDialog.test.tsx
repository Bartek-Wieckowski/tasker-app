import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import { describe, it, expect } from "vitest";
import StatsDialog from "@/components/shared/Stats/StatsDialog";

describe("StatsDialog component", () => {
  it("should have status text when dialog is open", async () => {
    render(
      <AllTheProviders>
        <MemoryRouter>
          <StatsDialog open={true} onOpenChange={() => {}} />
        </MemoryRouter>
      </AllTheProviders>
    );

    const popup = await screen.findByTestId("stats-dialog-content");
    expect(popup).toBeInTheDocument();

    const statusText = screen.getByText("stats.status");
    expect(statusText).toBeInTheDocument();
  });
});
