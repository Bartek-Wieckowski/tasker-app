import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import NotificationBell from "@/components/shared/NotificationBell";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useTranslation } from "react-i18next";

vi.mock("@/contexts/NotificationContext");
vi.mock("react-i18next");

vi.mock("lucide-react", () => ({
  Bell: vi.fn(({ className }) => (
    <div data-testid="bell-icon" className={className}>
      Bell
    </div>
  )),
  BellOff: vi.fn(({ className }) => (
    <div data-testid="bell-off-icon" className={className}>
      BellOff
    </div>
  )),
}));

vi.mock("@/components/ui/button", () => ({
  Button: vi.fn(
    ({ children, onClick, disabled, title, className, ...props }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={className}
        data-testid="notification-button"
        {...props}
      >
        {children}
      </button>
    )
  ),
}));

describe("NotificationBell Component", () => {
  const mockEnableNotifications = vi.fn();
  const mockDisableNotifications = vi.fn();
  const mockSendTestNotification = vi.fn();
  const mockT = vi.fn((key: string) => key);

  vi.mocked(useTranslation).mockReturnValue({
    t: mockT,
  } as any);

  beforeEach(() => {});

  const createMockNotificationContext = (overrides: any = {}) => ({
    isEnabled: false,
    isSupported: true,
    isLoading: false,
    canEnable: true,
    enableNotifications: mockEnableNotifications,
    disableNotifications: mockDisableNotifications,
    sendTestNotification: mockSendTestNotification,
    permission: "default" as NotificationPermission,
    subscription: null,
    ...overrides,
  });

  describe("Render component in different states", () => {
    it("does not render anything when notifications are not supported", () => {
      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext({
          isEnabled: false,
          isSupported: false,
        })
      );

      const { container } = render(<NotificationBell />);
      expect(container.firstChild).toBeNull();
    });

    it("renders loader when isLoading is true", () => {
      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext({
          isLoading: true,
        })
      );

      render(<NotificationBell />);
      expect(document.querySelector(".loaderThreeBars")).toBeInTheDocument();
      expect(
        screen.queryByTestId("notification-button")
      ).not.toBeInTheDocument();
    });

    it("renders button with Bell icon when notifications are enabled", () => {
      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext({
          isEnabled: true,
        })
      );

      render(<NotificationBell />);

      const button = screen.getByTestId("notification-button");
      const bellIcon = screen.getByTestId("bell-icon");

      expect(button).toBeInTheDocument();
      expect(bellIcon).toBeInTheDocument();
      expect(screen.queryByTestId("bell-off-icon")).not.toBeInTheDocument();
      expect(button).toHaveAttribute(
        "title",
        "userSettingsNotifications.enabled"
      );
      expect(button).not.toBeDisabled();
    });

    it("renders button with BellOff icon when notifications are disabled", () => {
      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext()
      );

      render(<NotificationBell />);

      const button = screen.getByTestId("notification-button");
      const bellOffIcon = screen.getByTestId("bell-off-icon");

      expect(button).toBeInTheDocument();
      expect(bellOffIcon).toBeInTheDocument();
      expect(screen.queryByTestId("bell-icon")).not.toBeInTheDocument();
      expect(button).toHaveAttribute(
        "title",
        "userSettingsNotifications.disabled"
      );
      expect(button).not.toBeDisabled();
    });

    it("correctly uses translations", () => {
      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext({
          isEnabled: true,
        })
      );

      render(<NotificationBell />);

      expect(mockT).toHaveBeenCalledWith("userSettingsNotifications.enabled");
    });
  });

  describe("Functionality of clicking and error handling", () => {
    it("calls enableNotifications when notifications are disabled", async () => {
      const user = userEvent.setup();

      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext()
      );

      render(<NotificationBell />);

      const button = screen.getByTestId("notification-button");
      await user.click(button);

      expect(mockEnableNotifications).toHaveBeenCalledTimes(1);
      expect(mockDisableNotifications).not.toHaveBeenCalled();
    });

    it("calls disableNotifications when notifications are enabled", async () => {
      const user = userEvent.setup();

      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext({
          isEnabled: true,
        })
      );

      render(<NotificationBell />);

      const button = screen.getByTestId("notification-button");
      await user.click(button);

      expect(mockDisableNotifications).toHaveBeenCalledTimes(1);
      expect(mockEnableNotifications).not.toHaveBeenCalled();
    });

    it("checks accessibility - checks if the button has the correct title", () => {
      vi.mocked(useNotificationContext).mockReturnValue(
        createMockNotificationContext({
          isEnabled: true,
        })
      );

      render(<NotificationBell />);

      const button = screen.getByTestId("notification-button");
      expect(button).toHaveAttribute(
        "title",
        "userSettingsNotifications.enabled"
      );

      expect(button).toBeVisible();
    });
  });
});
