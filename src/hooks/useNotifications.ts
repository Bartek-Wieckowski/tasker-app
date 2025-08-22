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

<<<<<<< HEAD
interface NotificationState {
=======
type NotificationState = {
>>>>>>> origin/main
  isEnabled: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isLoading: boolean;
<<<<<<< HEAD
}
=======
};
>>>>>>> origin/main

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<NotificationState>({
    isEnabled: false,
    permission: null,
    subscription: null,
    isLoading: true,
  });

<<<<<<< HEAD
  // Inicjalizacja powiadomień
  const initializeNotifications = useCallback(async () => {
    console.log("🔄 Starting notification initialization...", {
      currentUser: !!currentUser,
      isSupported: isPushSupported(),
    });

    if (!currentUser) {
      console.log("❌ No current user, skipping initialization");
=======
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
>>>>>>> origin/main
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (!isPushSupported()) {
<<<<<<< HEAD
      console.log("❌ Push not supported, skipping initialization");
=======
      if (import.meta.env.DEV) {
        console.log("❌ Push not supported, skipping initialization");
      }
>>>>>>> origin/main
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const permission = getNotificationPermission();
<<<<<<< HEAD
      console.log("🔐 Current permission:", permission);
=======
      if (import.meta.env.DEV) {
        console.log("🔐 Current permission:", permission);
      }
>>>>>>> origin/main
      let subscription: PushSubscription | null = null;

      if (permission === "granted") {
        console.log(
          "✅ Permission granted, checking for existing subscription..."
        );
        try {
          const registration = await navigator.serviceWorker.ready;
<<<<<<< HEAD
          console.log("🔧 Service worker ready:", registration);
          subscription = await registration.pushManager.getSubscription();
          console.log("📱 Found subscription:", !!subscription);
=======
          if (import.meta.env.DEV) {
            console.log("🔧 Service worker ready:", registration);
          }
          subscription = await registration.pushManager.getSubscription();
          if (import.meta.env.DEV) {
            console.log("📱 Found subscription:", !!subscription);
          }
>>>>>>> origin/main
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

<<<<<<< HEAD
      console.log("📱 Setting final state:", newState);
      setState(newState);
    } catch (error) {
      console.error("❌ Error in initializeNotifications:", error);
=======
      if (import.meta.env.DEV) {
        console.log("📱 Setting final state:", newState);
      }
      setState(newState);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Error in initializeNotifications:", error);
      }
>>>>>>> origin/main
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [currentUser]);

<<<<<<< HEAD
  // Włączanie powiadomień
  const enableNotifications = useCallback(async () => {
    try {
      console.log("🔄 Starting enableNotifications...");
      setState((prev) => ({ ...prev, isLoading: true }));

      // Poproś o uprawnienia i zasubskrybuj
      console.log("📝 Requesting push subscription...");
      const subscription = await subscribeToPushNotifications();
      console.log("📱 Subscription result:", !!subscription);
=======
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
>>>>>>> origin/main

      if (subscription) {
        const newState = {
          isEnabled: true,
          permission: getNotificationPermission(),
          subscription,
          isLoading: false,
        };
<<<<<<< HEAD
        console.log("✅ Setting enabled state:", newState);
        setState(newState);

        console.log("✅ Push notifications enabled and saved to Supabase");
=======
        if (import.meta.env.DEV) {
          console.log("✅ Setting enabled state:", newState);
        }
        setState(newState);

        if (import.meta.env.DEV) {
          console.log("✅ Push notifications enabled and saved to Supabase");
        }
>>>>>>> origin/main
        return true;
      } else {
        const newState = {
          permission: getNotificationPermission(),
          isEnabled: false,
          isLoading: false,
          subscription: null,
        };
<<<<<<< HEAD
        console.log("❌ Failed to enable, setting state:", newState);
=======
        if (import.meta.env.DEV) {
          console.log("❌ Failed to enable, setting state:", newState);
        }
>>>>>>> origin/main
        setState((prev) => ({
          ...prev,
          ...newState,
        }));
        return false;
      }
    } catch (error) {
<<<<<<< HEAD
      console.error("❌ Error in enableNotifications:", error);
=======
      if (import.meta.env.DEV) {
        console.error("❌ Error in enableNotifications:", error);
      }
>>>>>>> origin/main
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

<<<<<<< HEAD
  // Wyłączanie powiadomień
  const disableNotifications = useCallback(async () => {
    try {
      if (state.subscription) {
        // Unsubscribe z push manager
        await state.subscription.unsubscribe();

        // Oznacz jako nieaktywną w Supabase
=======
  const disableNotifications = useCallback(async () => {
    try {
      if (state.subscription) {
        await state.subscription.unsubscribe();

>>>>>>> origin/main
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

<<<<<<< HEAD
      console.log("🚫 Push notifications disabled");
      return true;
    } catch (error) {
      console.error("Błąd wyłączania powiadomień:", error);
=======
      if (import.meta.env.DEV) {
        console.log("🚫 Push notifications disabled");
      }
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Błąd wyłączania powiadomień:", error);
      }
>>>>>>> origin/main
      return false;
    }
  }, [state.subscription]);

<<<<<<< HEAD
  // Test powiadomienia (lokalne)
  const sendTestNotification = useCallback(async () => {
    try {
      await showTestNotification();
      console.log("🧪 Test notification sent");
    } catch (error) {
      console.error("Błąd test notification:", error);
=======
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
>>>>>>> origin/main
      throw error;
    }
  }, []);

<<<<<<< HEAD
  // Efekt inicjalizujący
=======
>>>>>>> origin/main
  useEffect(() => {
    if (currentUser) {
      initializeNotifications();
    }
  }, [currentUser, initializeNotifications]);

  return {
<<<<<<< HEAD
    // Stan
    ...state,
    isSupported: isPushSupported(),

    // Akcje
=======
    ...state,
    isSupported: isPushSupported(),

>>>>>>> origin/main
    enableNotifications,
    disableNotifications,
    sendTestNotification,

<<<<<<< HEAD
    // Dodatkowe info
=======
>>>>>>> origin/main
    canEnable: isPushSupported() && state.permission !== "denied",
  };
};
