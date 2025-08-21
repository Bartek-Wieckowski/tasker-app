// src/components/NotificationSettings.tsx
import React from "react";
import { useNotifications } from "../../hooks/useNotifications";

export const PushNotificationTest: React.FC = () => {
  const {
    isEnabled,
    permission,
    isSupported,
    isLoading,
    canEnable,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">🔄 Ładowanie ustawień powiadomień...</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">
          ⚠️ Powiadomienia niedostępne
        </h3>
        <p className="text-yellow-700 text-sm">
          Twoja przeglądarka nie obsługuje push notifications lub używasz trybu
          prywatnego.
        </p>
      </div>
    );
  }

  const getStatusInfo = () => {
    if (permission === "denied") {
      return {
        bgColor: "bg-red-50",
        borderColor: "border-red-300",
        textColor: "text-red-800",
        icon: "🚫",
        message: "Powiadomienia zablokowane w przeglądarce",
        description:
          "Odblokuj powiadomienia w ustawieniach przeglądarki i odśwież stronę.",
      };
    }

    if (isEnabled) {
      return {
        bgColor: "bg-green-50",
        borderColor: "border-green-300",
        textColor: "text-green-800",
        icon: "✅",
        message: "Powiadomienia aktywne",
        description:
          "Będziesz otrzymywać powiadomienia o niezrealizowanych zadaniach.",
      };
    }

    if (permission === "granted") {
      return {
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-300",
        textColor: "text-yellow-800",
        icon: "⏳",
        message: "Uprawnienia przyznane",
        description: 'Kliknij "Włącz powiadomienia" aby aktywować subskrypcję.',
      };
    }

    return {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      textColor: "text-blue-800",
      icon: "💡",
      message: "Powiadomienia wyłączone",
      description:
        "Włącz powiadomienia aby otrzymywać przypomnienia o zadaniach.",
    };
  };

  const statusInfo = getStatusInfo();

  const handleEnableNotifications = async () => {
    try {
      const success = await enableNotifications();
      if (!success) {
        alert(
          "Nie udało się włączyć powiadomień. Sprawdź uprawnienia w przeglądarce."
        );
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      alert("Wystąpił błąd podczas włączania powiadomień.");
    }
  };

  const handleDisableNotifications = async () => {
    try {
      const success = await disableNotifications();
      if (!success) {
        alert("Nie udało się wyłączyć powiadomień.");
      }
    } catch (error) {
      console.error("Error disabling notifications:", error);
      alert("Wystąpił błąd podczas wyłączania powiadomień.");
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
    } catch (error) {
      console.error("Error sending test notification:", error);
      alert("Nie udało się wysłać testowego powiadomienia.");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          🔔 Powiadomienia o zadaniach
        </h3>
      </div>

      {/* Status */}
      <div
        className={`p-4 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
      >
        <div className="flex items-start space-x-3">
          <span className="text-lg">{statusInfo.icon}</span>
          <div className="flex-1">
            <p className={`font-medium ${statusInfo.textColor}`}>
              {statusInfo.message}
            </p>
            <p className={`text-sm mt-1 ${statusInfo.textColor} opacity-80`}>
              {statusInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Debug info - tylko w development */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>
            <strong>Permission:</strong> {permission || "unknown"}
          </p>
          <p>
            <strong>Enabled:</strong> {isEnabled ? "true" : "false"}
          </p>
          <p>
            <strong>Supported:</strong> {isSupported ? "true" : "false"}
          </p>
          <p>
            <strong>Can Enable:</strong> {canEnable ? "true" : "false"}
          </p>
        </div>
      )}

      {/* Akcje */}
      <div className="flex flex-wrap gap-3">
        {!isEnabled && canEnable && (
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔔 Włącz powiadomienia
          </button>
        )}

        {isEnabled && (
          <button
            onClick={handleDisableNotifications}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🚫 Wyłącz powiadomienia
          </button>
        )}

        {permission === "granted" && (
          <>
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🧪 Test lokalny
            </button>
          </>
        )}
      </div>

      {/* Instrukcje dla zablokowanych powiadomień */}
      {permission === "denied" && (
        <div className="text-sm text-gray-600 p-3 bg-gray-100 rounded-lg">
          <p className="font-medium mb-2">Jak odblokować powiadomienia:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Kliknij ikonę kłódki/informacji w pasku adresu</li>
            <li>Ustaw powiadomienia na "Zezwalaj"</li>
            <li>Odśwież stronę</li>
          </ol>
        </div>
      )}

      {/* Informacje dodatkowe */}
      {isEnabled && (
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="font-medium text-blue-800 mb-2">
            ℹ️ Jak działają powiadomienia:
          </p>
          <ul className="space-y-1 text-blue-700">
            <li>• Powiadomienia są wysyłane automatycznie przez system</li>
            <li>
              • Sprawdzanie zadań odbywa się codziennie o ustalonej godzinie
            </li>
            <li>
              • Otrzymasz powiadomienie tylko gdy masz niezrealizowane zadania
            </li>
            <li>• Możesz je wyłączyć w każdej chwili</li>
          </ul>
        </div>
      )}
    </div>
  );
};
