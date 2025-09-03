import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AllTheProviders from "@/AllTheProviders";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import MobileStatsView from "@/components/shared/Stats/MobileStatsView";

const mockUseTodosStats = vi.hoisted(() => vi.fn());
vi.mock("@/api/queries/todos/useTodosStats", () => ({
  useTodosStats: mockUseTodosStats,
  StatsPeriod: {
    day: "day",
    week: "week",
    month: "month",
  },
}));

vi.mock("@/components/shared/Stats/AnimatedCircleProgress", () => ({
  default: ({
    percentage,
    color,
    label,
    count,
  }: {
    percentage: number;
    color: string;
    label: string;
    count: number;
  }) => (
    <div data-testid={`circle-progress-${label.toLowerCase()}`}>
      <div data-testid="percentage">{percentage}%</div>
      <div data-testid="color" style={{ color }}>
        {color}
      </div>
      <div data-testid="label">{label}</div>
      <div data-testid="count">{count}</div>
    </div>
  ),
}));

const mockAuthContext = {
  selectedDate: "2024-01-15",
  currentUser: { id: "test-user-id", email: "test@example.com" },
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

describe("MobileStatsView component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state when stats are loading", async () => {
    mockUseTodosStats.mockReturnValue({
      stats: null,
      isLoading: true,
      isError: false,
    });

    render(
      <AllTheProviders>
        <MemoryRouter>
          <MobileStatsView />
        </MemoryRouter>
      </AllTheProviders>
    );

    const loadingElement = screen.getByTestId("loader");
    expect(loadingElement).toBeInTheDocument();

    expect(screen.queryByText("stats.dayStats")).not.toBeInTheDocument();
  });

  it("should render stats data correctly and allow period switching", async () => {
    const mockStats = {
      total: 10,
      completed: 7,
      notStarted: 3,
      completedPercentage: 70,
      notStartedPercentage: 30,
    };

    mockUseTodosStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      isError: false,
    });

    render(
      <AllTheProviders>
        <MemoryRouter>
          <MobileStatsView />
        </MemoryRouter>
      </AllTheProviders>
    );

    const user = userEvent.setup();

    expect(screen.getByText("stats.dayStats")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();

    const completedCircle = screen.getByTestId(
      "circle-progress-stats.completed"
    );
    expect(completedCircle).toBeInTheDocument();
    expect(
      completedCircle.querySelector('[data-testid="percentage"]')
    ).toHaveTextContent("70%");
    expect(
      completedCircle.querySelector('[data-testid="count"]')
    ).toHaveTextContent("7");

    const notStartedCircle = screen.getByTestId(
      "circle-progress-stats.notstarted"
    );
    expect(notStartedCircle).toBeInTheDocument();
    expect(
      notStartedCircle.querySelector('[data-testid="percentage"]')
    ).toHaveTextContent("30%");
    expect(
      notStartedCircle.querySelector('[data-testid="count"]')
    ).toHaveTextContent("3");

    expect(screen.getByText("stats.totalTasks:")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    const weekButton = screen.getByText("stats.week");
    expect(weekButton).toBeInTheDocument();

    await user.click(weekButton);

    await waitFor(() => {
      expect(mockUseTodosStats).toHaveBeenCalledWith(
        "2024-01-15",
        mockAuthContext.currentUser,
        "week"
      );
    });

    const monthButton = screen.getByText("stats.month");
    await user.click(monthButton);

    await waitFor(() => {
      expect(mockUseTodosStats).toHaveBeenCalledWith(
        "2024-01-15",
        mockAuthContext.currentUser,
        "month"
      );
    });
  });

  it("should show error state when stats loading fails", async () => {
    mockUseTodosStats.mockReturnValue({
      stats: null,
      isLoading: false,
      isError: true,
    });

    render(
      <AllTheProviders>
        <MemoryRouter>
          <MobileStatsView />
        </MemoryRouter>
      </AllTheProviders>
    );

    expect(screen.getByText("stats.errorText")).toBeInTheDocument();

    expect(screen.queryByText("stats.dayStats")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("circle-progress-stats.completed")
    ).not.toBeInTheDocument();
  });

  it("should show empty state when no tasks exist", async () => {
    const emptyStats = {
      total: 0,
      completed: 0,
      notStarted: 0,
      completedPercentage: 0,
      notStartedPercentage: 0,
    };

    mockUseTodosStats.mockReturnValue({
      stats: emptyStats,
      isLoading: false,
      isError: false,
    });

    render(
      <AllTheProviders>
        <MemoryRouter>
          <MobileStatsView />
        </MemoryRouter>
      </AllTheProviders>
    );

    expect(screen.getByText("stats.dayStats")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();

    expect(screen.getByText("stats.noTasks")).toBeInTheDocument();

    const emptyStateSection = screen.getByText("stats.noTasks").parentElement;
    expect(emptyStateSection).toBeInTheDocument();
    const calendarIcon = emptyStateSection?.querySelector("svg");
    expect(calendarIcon).toBeInTheDocument();

    expect(
      screen.queryByTestId("circle-progress-stats.completed")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("circle-progress-stats.notstarted")
    ).not.toBeInTheDocument();

    expect(screen.queryByText("stats.totalTasks:")).not.toBeInTheDocument();
  });
});
