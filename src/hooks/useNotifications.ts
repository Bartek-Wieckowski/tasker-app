// src/hooks/useNotifications.ts
import { useEffect, useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  showTestNotification,
} from "../lib/pushNotifications";

interface NotificationState {
  isEnabled: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isLoading: boolean;
}

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<NotificationState>({
    isEnabled: false,
    permission: null,
    subscription: null,
    isLoading: true,
  });

  // Inicjalizacja powiadomień
  const initializeNotifications = useCallback(async () => {
    console.log("🔄 Starting notification initialization...", {
      currentUser: !!currentUser,
      isSupported: isPushSupported(),
    });

    if (!currentUser) {
      console.log("❌ No current user, skipping initialization");
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (!isPushSupported()) {
      console.log("❌ Push not supported, skipping initialization");
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const permission = getNotificationPermission();
      console.log("🔐 Current permission:", permission);
      let subscription: PushSubscription | null = null;

      if (permission === "granted") {
        console.log(
          "✅ Permission granted, checking for existing subscription..."
        );
        try {
          const registration = await navigator.serviceWorker.ready;
          console.log("🔧 Service worker ready:", registration);
          subscription = await registration.pushManager.getSubscription();
          console.log("📱 Found subscription:", !!subscription);
        } catch (swError) {
          console.error("❌ Service worker error:", swError);
        }
      }

      const newState = {
        isEnabled: permission === "granted" && !!subscription,
        permission,
        subscription,
        isLoading: false,
      };

      console.log("📱 Setting final state:", newState);
      setState(newState);
    } catch (error) {
      console.error("❌ Error in initializeNotifications:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [currentUser]);

  // Włączanie powiadomień
  const enableNotifications = useCallback(async () => {
    try {
      console.log("🔄 Starting enableNotifications...");
      setState((prev) => ({ ...prev, isLoading: true }));

      // Poproś o uprawnienia i zasubskrybuj
      console.log("📝 Requesting push subscription...");
      const subscription = await subscribeToPushNotifications();
      console.log("📱 Subscription result:", !!subscription);

      if (subscription) {
        const newState = {
          isEnabled: true,
          permission: getNotificationPermission(),
          subscription,
          isLoading: false,
        };
        console.log("✅ Setting enabled state:", newState);
        setState(newState);

        console.log("✅ Push notifications enabled and saved to Supabase");
        return true;
      } else {
        const newState = {
          permission: getNotificationPermission(),
          isEnabled: false,
          isLoading: false,
          subscription: null,
        };
        console.log("❌ Failed to enable, setting state:", newState);
        setState((prev) => ({
          ...prev,
          ...newState,
        }));
        return false;
      }
    } catch (error) {
      console.error("❌ Error in enableNotifications:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Wyłączanie powiadomień
  const disableNotifications = useCallback(async () => {
    try {
      if (state.subscription) {
        // Unsubscribe z push manager
        await state.subscription.unsubscribe();

        // Oznacz jako nieaktywną w Supabase
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("push_subscriptions")
              .update({ is_active: false })
              .eq("user_id", user.id)
              .eq("endpoint", state.subscription.endpoint);
          }
        } catch (dbError) {
          console.warn("Could not update database:", dbError);
        }
      }

      setState((prev) => ({
        ...prev,
        isEnabled: false,
        subscription: null,
      }));

      console.log("🚫 Push notifications disabled");
      return true;
    } catch (error) {
      console.error("Błąd wyłączania powiadomień:", error);
      return false;
    }
  }, [state.subscription]);

  // Test powiadomienia (lokalne)
  const sendTestNotification = useCallback(async () => {
    try {
      await showTestNotification();
      console.log("🧪 Test notification sent");
    } catch (error) {
      console.error("Błąd test notification:", error);
      throw error;
    }
  }, []);

  // Efekt inicjalizujący
  useEffect(() => {
    if (currentUser) {
      initializeNotifications();
    }
  }, [currentUser, initializeNotifications]);

  return {
    // Stan
    ...state,
    isSupported: isPushSupported(),

    // Akcje
    enableNotifications,
    disableNotifications,
    sendTestNotification,

    // Dodatkowe info
    canEnable: isPushSupported() && state.permission !== "denied",
  };
};
