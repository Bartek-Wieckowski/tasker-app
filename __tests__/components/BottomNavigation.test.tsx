import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import { describe, it, expect } from "vitest";
import { Tabs } from "@/components/ui/tabs";
import BottomNavigation from "@/components/shared/BottomNavigation";

describe("BottomNavigation component", () => {
  it("should render 3 correct icons", () => {
    const { container } = render(
      <AllTheProviders>
        <MemoryRouter>
          <Tabs>
            <BottomNavigation activeTab="all" onTabChange={() => {}} />
          </Tabs>
        </MemoryRouter>
      </AllTheProviders>
    );

    const buttons = container.querySelectorAll("button");

    const navigationButtons = Array.from(buttons).slice(0, 3);

    expect(navigationButtons).toHaveLength(3);

    const allIcon = navigationButtons[0].querySelector("svg");
    const completedIcon = navigationButtons[1].querySelector("svg");
    const notCompletedIcon = navigationButtons[2].querySelector("svg");

    expect(allIcon).toBeInTheDocument();
    expect(completedIcon).toBeInTheDocument();
    expect(notCompletedIcon).toBeInTheDocument();
  });
});
