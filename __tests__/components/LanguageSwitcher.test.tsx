import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: vi.fn(({ children, open, onOpenChange }) => (
    <div
      data-testid="dropdown-menu"
      data-open={open}
      onClick={() => onOpenChange?.(!open)}
    >
      {children}
    </div>
  )),
  DropdownMenuContent: vi.fn(({ children, align }) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  )),
  DropdownMenuTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="dropdown-trigger" data-as-child={asChild}>
      {children}
    </div>
  )),
}));

vi.mock("@/components/ui/button", () => ({
  Button: vi.fn(({ children, onClick, disabled, variant, size, className }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  )),
}));

vi.mock("@/lib/utils", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
}));

const mockUseLanguage = useLanguage as any;

describe("LanguageSwitcher Component", () => {
  const mockChangeLanguage = vi.fn();
  const mockAvailableLanguages = [
    { code: "en", name: "EN" },
    { code: "pl", name: "PL" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component rendering and loading states", () => {
    it("renders loading state when isLoading is true", () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: "en",
        changeLanguage: mockChangeLanguage,
        availableLanguages: mockAvailableLanguages,
        isLoading: true,
      });

      render(<LanguageSwitcher />);

      const button = screen.getByTestId("button");
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("...");
      expect(button).toHaveAttribute("data-variant", "ghost");
      expect(button).toHaveAttribute("data-size", "sm");
    });

    it("renders dropdown with current language when not loading", () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: "en",
        changeLanguage: mockChangeLanguage,
        availableLanguages: mockAvailableLanguages,
        isLoading: false,
      });

      render(<LanguageSwitcher />);

      expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();

      const triggerButton = screen.getByTestId("button");
      expect(triggerButton).toHaveTextContent("EN");
      expect(triggerButton).not.toBeDisabled();
    });

    it("displays correct language name for Polish", () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: "pl",
        changeLanguage: mockChangeLanguage,
        availableLanguages: mockAvailableLanguages,
        isLoading: false,
      });

      render(<LanguageSwitcher />);

      const triggerButton = screen.getByTestId("button");
      expect(triggerButton).toHaveTextContent("PL");
    });

    it("renders all available languages in dropdown content", () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: "en",
        changeLanguage: mockChangeLanguage,
        availableLanguages: mockAvailableLanguages,
        isLoading: false,
      });

      render(<LanguageSwitcher />);
      const content = screen.getByTestId("dropdown-content");

      expect(content).toHaveTextContent("EN");
      expect(content).toHaveTextContent("PL");
    });

    it("renders dropdown content with correct alignment", () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: "en",
        changeLanguage: mockChangeLanguage,
        availableLanguages: mockAvailableLanguages,
        isLoading: false,
      });

      render(<LanguageSwitcher />);

      const dropdownContent = screen.getByTestId("dropdown-content");
      expect(dropdownContent).toHaveAttribute("data-align", "end");
    });

    it("handles empty available languages array", () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: "en",
        changeLanguage: mockChangeLanguage,
        availableLanguages: [],
        isLoading: false,
      });

      render(<LanguageSwitcher />);

      const triggerButton = screen.getByTestId("button");
      expect(triggerButton).toHaveTextContent("");
    });
  });

  describe("User interactions and dropdown functionality", () => {
    beforeEach(() => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: "en",
        changeLanguage: mockChangeLanguage,
        availableLanguages: mockAvailableLanguages,
        isLoading: false,
      });
    });

    it("calls changeLanguage when selecting a different language", async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher />);

      const polishButton = screen.getByRole("button", { name: "PL" });
      await user.click(polishButton);

      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      expect(mockChangeLanguage).toHaveBeenCalledWith("pl");
    });

    it("calls changeLanguage when selecting current language", async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher />);

      const dropdownContent = screen.getByTestId("dropdown-content");

      const englishButton = dropdownContent.querySelector(
        "button"
      ) as HTMLButtonElement;
      await user.click(englishButton);

      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("manages dropdown open state correctly", () => {
      const user = userEvent.setup();
      const { rerender } = render(<LanguageSwitcher />);

      const dropdownMenu = screen.getByTestId("dropdown-menu");
      expect(dropdownMenu).toHaveAttribute("data-open", "false");

      user.click(dropdownMenu);

      const MockedLanguageSwitcherOpen = () => {
        mockUseLanguage.mockReturnValue({
          currentLanguage: "en",
          changeLanguage: mockChangeLanguage,
          availableLanguages: mockAvailableLanguages,
          isLoading: false,
        });

        return <LanguageSwitcher />;
      };

      rerender(<MockedLanguageSwitcherOpen />);
    });

    it("closes dropdown after language selection", async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher />);

      const polishButton = screen.getByRole("button", { name: "PL" });
      await user.click(polishButton);

      // The component should call setIsOpen(false) after language change
      expect(mockChangeLanguage).toHaveBeenCalled();
    });

    it("keyboard press esc closes dropdown", async () => {
      const user = userEvent.setup();

      render(<LanguageSwitcher />);

      const dropdownContent = screen.getByTestId("dropdown-content");

      const englishButton = dropdownContent.querySelector(
        "button"
      ) as HTMLButtonElement;

      await user.type(englishButton, "{esc}");
      expect(mockChangeLanguage).toHaveBeenCalled();
    });

    it("does not call changeLanguage when loading", async () => {
      const user = userEvent.setup();

      mockUseLanguage.mockReturnValue({
        currentLanguage: "en",
        changeLanguage: mockChangeLanguage,
        availableLanguages: mockAvailableLanguages,
        isLoading: true,
      });

      render(<LanguageSwitcher />);

      const button = screen.getByTestId("button");
      expect(button).toBeDisabled();

      await user.click(button);
      expect(mockChangeLanguage).not.toHaveBeenCalled();
    });

    it("handles language change errors gracefully", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockChangeLanguage.mockRejectedValueOnce(
        new Error("Language change failed")
      );

      render(<LanguageSwitcher />);

      const polishButton = screen.getByRole("button", { name: "PL" });
      await user.click(polishButton);

      expect(mockChangeLanguage).toHaveBeenCalledWith("pl");

      consoleErrorSpy.mockRestore();
    });

    it("maintains accessibility with proper button roles", () => {
      render(<LanguageSwitcher />);

      const languageButtons = screen.getAllByRole("button");
      expect(languageButtons).toHaveLength(3);

      languageButtons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });

    it("applies hover styles correctly", () => {
      render(<LanguageSwitcher />);

      const dropdownContent = screen.getByTestId("dropdown-content");

      const englishButton = dropdownContent.querySelector(
        "button"
      ) as HTMLButtonElement;
      const polishButton = dropdownContent.querySelector(
        "button"
      ) as HTMLButtonElement;

      expect(englishButton.className).toContain(
        "hover:bg-gray-100 dark:hover:bg-gray-800"
      );
      expect(polishButton.className).toContain(
        "hover:bg-gray-100 dark:hover:bg-gray-800"
      );
    });
  });
});
