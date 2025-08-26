import { Bell, BellOff } from "lucide-react";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

export default function NotificationBell() {
  const {
    isEnabled,
    isSupported,
    isLoading,
    canEnable,
    enableNotifications,
    disableNotifications,
  } = useNotificationContext();
  const { t } = useTranslation();

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };
  return (
    <>
      {isSupported && (
        <>
          {isLoading ? (
            <div className="loaderThreeBars" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleNotifications}
              disabled={!canEnable && !isEnabled}
              className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
              title={
                isEnabled
                  ? t("userSettingsNotifications.enabled")
                  : t("userSettingsNotifications.disabled")
              }
            >
              {isEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
          )}
        </>
      )}
    </>
  );
}
