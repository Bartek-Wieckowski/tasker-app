import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatePicker from "@/components/shared/DatePicker";

vi.mock("date-fns", () => ({
  format: vi.fn(() => "2024-01-15"),
}));

vi.mock("@/lib/utils", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
}));

vi.mock("@/lib/helpers", () => ({
  dateCustomFormatting: vi.fn(() => "2024-01-15"),
  localeMap: {
    en: "en-US",
    pl: "pl-PL",
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: vi.fn((key) => {
      if (key === "datePicker.pickDate") return "Pick a date";
      return key;
    }),
  }),
}));

const mockAuthContext = {
  selectedDate: null,
  setSelectedDate: vi.fn(),
};

const mockGlobalSearchContext = {
  setIsGlobalSearch: vi.fn(),
  setSearchValueGlobal: vi.fn(),
  setGlobalSearchResult: vi.fn(),
};

const mockLanguageContext = {
  currentLanguage: "en",
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

vi.mock("@/contexts/GlobalSearchContext", () => ({
  useGlobalSearch: () => mockGlobalSearchContext,
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => mockLanguageContext,
}));

vi.mock("@/components/ui/button", () => ({
  Button: vi.fn(
    ({ children, onClick, className, "data-testid": testId, ...props }) => (
      <button
        onClick={onClick}
        className={className}
        data-testid={testId}
        {...props}
      >
        {children}
      </button>
    )
  ),
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: vi.fn(({ onDayClick }) => (
    <div data-testid="calendar">
      <button
        data-testid="calendar-day"
        onClick={() => onDayClick && onDayClick(new Date("2024-01-20"))}
      >
        20
      </button>
    </div>
  )),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: vi.fn(({ children, open }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  )),
  PopoverTrigger: vi.fn(({ children }) => (
    <div data-testid="popover-trigger">{children}</div>
  )),
  PopoverContent: vi.fn(({ children }) => (
    <div data-testid="popover-content">{children}</div>
  )),
}));

describe("DatePicker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.selectedDate = null;
  });

  describe("Initial rendering and display", () => {
    it("should render the date picker button with calendar icon", () => {
      render(<DatePicker />);

      const button = screen.getByTestId("date-picker-button");
      expect(button).toBeInTheDocument();

      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Date selection and interaction", () => {
    it("should open calendar popover when button is clicked", async () => {
      const user = userEvent.setup();
      render(<DatePicker />);

      const button = screen.getByTestId("date-picker-button");
      await user.click(button);

      const calendar = screen.getByTestId("calendar");
      expect(calendar).toBeInTheDocument();
    });

    it("should handle date selection and update contexts", async () => {
      const user = userEvent.setup();
      render(<DatePicker />);

      const button = screen.getByTestId("date-picker-button");
      await user.click(button);

      const dayButton = screen.getByTestId("calendar-day");
      await user.click(dayButton);

      expect(mockGlobalSearchContext.setIsGlobalSearch).toHaveBeenCalledWith(
        false
      );
      expect(mockGlobalSearchContext.setSearchValueGlobal).toHaveBeenCalledWith(
        ""
      );
      expect(
        mockGlobalSearchContext.setGlobalSearchResult
      ).toHaveBeenCalledWith([]);
    });
  });
});
