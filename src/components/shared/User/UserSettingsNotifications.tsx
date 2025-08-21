import { useState } from "react";
import { Info } from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { useTranslation } from "react-i18next";

export const UserSettingsNotifications = () => {
  const {
    isEnabled,
    isSupported,
    isLoading,
    canEnable,
    enableNotifications,
    disableNotifications,
  } = useNotifications();
  const { t } = useTranslation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">
          {t("userSettingsNotifications.loading")}
        </span>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <span className="text-sm text-yellow-800">
          {t("userSettingsNotifications.browserNotSupported")}
        </span>
      </div>
    );
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        await enableNotifications();
      } else {
        await disableNotifications();
      }
    } catch (error) {
      // Error handled silently
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          {t("userSettingsNotifications.title")}
        </label>
        {isEnabled && (
          <Popover open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800"
              >
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">
                  {t("userSettingsNotifications.descriptionTitle")}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t("userSettingsNotifications.description")}</li>
                  <li>• {t("userSettingsNotifications.description2")}</li>
                  <li>• {t("userSettingsNotifications.description3")}</li>
                  <li>• {t("userSettingsNotifications.description4")}</li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="notifications"
            checked={!isEnabled}
            onChange={() => handleToggleNotifications(false)}
            disabled={!canEnable && !isEnabled}
            className="text-red-600 focus:ring-red-500"
          />
          <span className="text-sm text-gray-600">
            {t("userSettingsNotifications.disabled")}
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="notifications"
            checked={isEnabled}
            onChange={() => handleToggleNotifications(true)}
            disabled={!canEnable && !isEnabled}
            className="text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">
            {t("userSettingsNotifications.enabled")}
          </span>
        </label>
      </div>
    </div>
  );
};
