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

type NotificationState = {
  isEnabled: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isLoading: boolean;
};

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<NotificationState>({
    isEnabled: false,
    permission: null,
    subscription: null,
    isLoading: true,
  });

  const initializeNotifications = useCallback(async () => {
    if (import.meta.env.DEV) {
      console.log("🔄 Starting notification initialization...", {
        currentUser: !!currentUser,
        isSupported: isPushSupported(),
      });
    }

    if (!currentUser) {
      if (import.meta.env.DEV) {
        console.log("❌ No current user, skipping initialization");
      }
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (!isPushSupported()) {
      if (import.meta.env.DEV) {
        console.log("❌ Push not supported, skipping initialization");
      }
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const permission = getNotificationPermission();
      if (import.meta.env.DEV) {
        console.log("🔐 Current permission:", permission);
      }
      let subscription: PushSubscription | null = null;

      if (permission === "granted") {
        console.log(
          "✅ Permission granted, checking for existing subscription..."
        );
        try {
          const registration = await navigator.serviceWorker.ready;
          if (import.meta.env.DEV) {
            console.log("🔧 Service worker ready:", registration);
          }
          subscription = await registration.pushManager.getSubscription();
          if (import.meta.env.DEV) {
            console.log("📱 Found subscription:", !!subscription);
          }
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

      if (import.meta.env.DEV) {
        console.log("📱 Setting final state:", newState);
      }
      setState(newState);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Error in initializeNotifications:", error);
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [currentUser]);

  const enableNotifications = useCallback(async () => {
    try {
      if (import.meta.env.DEV) {
        console.log("🔄 Starting enableNotifications...");
      }
      setState((prev) => ({ ...prev, isLoading: true }));

      if (import.meta.env.DEV) {
        console.log("📝 Requesting push subscription...");
      }
      const subscription = await subscribeToPushNotifications();
      if (import.meta.env.DEV) {
        console.log("📱 Subscription result:", !!subscription);
      }

      if (subscription) {
        const newState = {
          isEnabled: true,
          permission: getNotificationPermission(),
          subscription,
          isLoading: false,
        };
        if (import.meta.env.DEV) {
          console.log("✅ Setting enabled state:", newState);
        }
        setState(newState);

        if (import.meta.env.DEV) {
          console.log("✅ Push notifications enabled and saved to Supabase");
        }
        return true;
      } else {
        const newState = {
          permission: getNotificationPermission(),
          isEnabled: false,
          isLoading: false,
          subscription: null,
        };
        if (import.meta.env.DEV) {
          console.log("❌ Failed to enable, setting state:", newState);
        }
        setState((prev) => ({
          ...prev,
          ...newState,
        }));
        return false;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Error in enableNotifications:", error);
      }
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const disableNotifications = useCallback(async () => {
    try {
      if (state.subscription) {
        await state.subscription.unsubscribe();

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

      if (import.meta.env.DEV) {
        console.log("🚫 Push notifications disabled");
      }
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Błąd wyłączania powiadomień:", error);
      }
      return false;
    }
  }, [state.subscription]);

  const sendTestNotification = useCallback(async () => {
    try {
      await showTestNotification();
      if (import.meta.env.DEV) {
        console.log("🧪 Test notification sent");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Błąd test notification:", error);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      initializeNotifications();
    }
  }, [currentUser, initializeNotifications]);

  return {
    ...state,
    isSupported: isPushSupported(),

    enableNotifications,
    disableNotifications,
    sendTestNotification,

    canEnable: isPushSupported() && state.permission !== "denied",
  };
};
