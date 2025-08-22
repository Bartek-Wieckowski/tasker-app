<<<<<<< HEAD
// Utilities do obsługi Push Notifications
import { supabase } from "./supabaseClient";

// Pobierz klucz publiczny z .env
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

if (!VAPID_PUBLIC_KEY) {
  console.warn("⚠️ VITE_VAPID_PUBLIC_KEY nie jest ustawiony w .env");
}

/**
 * Konwertuje VAPID klucz do formatu Uint8Array
=======
import { supabase } from "./supabaseClient";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

if (!VAPID_PUBLIC_KEY) {
  console.warn("⚠️ VITE_VAPID_PUBLIC_KEY doesn't exist in .env");
}

/**
 * Converts VAPID key to Uint8Array format
>>>>>>> origin/main
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
<<<<<<< HEAD
 * Sprawdza czy browser obsługuje push notifications
=======
 * Checks if browser supports push notifications
>>>>>>> origin/main
 */
export function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
<<<<<<< HEAD
 * Sprawdza obecne uprawnienia do notyfikacji
=======
 * Checks current notification permissions
>>>>>>> origin/main
 */
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission;
}

/**
<<<<<<< HEAD
 * Prosi o uprawnienia do notyfikacji
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error("Push notifications nie są obsługiwane");
=======
 * Requests notification permissions
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
>>>>>>> origin/main
  }

  return await Notification.requestPermission();
}

/**
<<<<<<< HEAD
 * Rejestruje push subscription
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    console.log("🔄 subscribeToPushNotifications started");

    // Sprawdź uprawnienia
    console.log("🔐 Requesting notification permission...");
    const permission = await requestNotificationPermission();
    console.log("🔐 Permission result:", permission);

    if (permission !== "granted") {
      console.log("❌ Permission not granted:", permission);
      return null;
    }

    // Sprawdź klucz VAPID
    console.log("🔑 Checking VAPID key...", { hasKey: !!VAPID_PUBLIC_KEY });
    if (!VAPID_PUBLIC_KEY) {
      throw new Error("VAPID public key nie jest skonfigurowany");
    }

    // Zarejestruj service worker
    console.log("🔧 Waiting for service worker...");
    const registration = await navigator.serviceWorker.ready;
    console.log("🔧 Service worker ready:", registration.scope);

    // Sprawdź czy już subskrybowany
    console.log("📱 Checking existing subscription...");
    let subscription = await registration.pushManager.getSubscription();
    console.log("📱 Existing subscription:", !!subscription);

    if (!subscription) {
      // Stwórz nową subskrypcję
      console.log("📝 Creating new subscription...");
=======
 * Registers push subscription
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    if (import.meta.env.DEV) {
      console.log("🔄 subscribeToPushNotifications started");
    }

    if (import.meta.env.DEV) {
      console.log("🔐 Requesting notification permission...");
    }
    const permission = await requestNotificationPermission();
    if (import.meta.env.DEV) {
      console.log("🔐 Permission result:", permission);
    }

    if (permission !== "granted") {
      if (import.meta.env.DEV) {
        console.log("❌ Permission not granted:", permission);
      }
      return null;
    }

    // Check VAPID key
    if (import.meta.env.DEV) {
      console.log("🔑 Checking VAPID key...", { hasKey: !!VAPID_PUBLIC_KEY });
    }
    if (!VAPID_PUBLIC_KEY) {
      throw new Error("VAPID public key is not configured");
    }

    // Register s ervice worker
    if (import.meta.env.DEV) {
      console.log("🔧 Waiting for service worker...");
    }
    const registration = await navigator.serviceWorker.ready;
    if (import.meta.env.DEV) {
      console.log("🔧 Service worker ready:", registration.scope);
    }

    // Check if already subscribed
    if (import.meta.env.DEV) {
      console.log("📱 Checking existing subscription...");
    }
    let subscription = await registration.pushManager.getSubscription();
    if (import.meta.env.DEV) {
      console.log("📱 Existing subscription:", !!subscription);
    }

    if (!subscription) {
      // Create new subscription
      if (import.meta.env.DEV) {
        console.log("📝 Creating new subscription...");
      }
>>>>>>> origin/main
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
<<<<<<< HEAD
      console.log("📝 New subscription created:", !!subscription);
    }

    if (subscription) {
      // Zapisz w Supabase
      console.log("💾 Saving subscription to Supabase...");
      await savePushSubscription(subscription);
      console.log("✅ Push subscription saved successfully");
=======
      if (import.meta.env.DEV) {
        console.log("📝 New subscription created:", !!subscription);
      }
    }

    if (subscription) {
      // Save to Supabase
      if (import.meta.env.DEV) {
        console.log("💾 Saving subscription to Supabase...");
      }
      await savePushSubscription(subscription);
      if (import.meta.env.DEV) {
        console.log("✅ Push subscription saved successfully");
      }
>>>>>>> origin/main
    }

    return subscription;
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error in subscribeToPushNotifications:", error);
=======
    if (import.meta.env.DEV) {
      console.error("❌ Error in subscribeToPushNotifications:", error);
    }
>>>>>>> origin/main
    throw error;
  }
}

/**
<<<<<<< HEAD
 * Zapisuje subscription w Supabase
=======
 * Saves subscription to Supabase
>>>>>>> origin/main
 */
async function savePushSubscription(
  subscription: PushSubscription
): Promise<void> {
  try {
<<<<<<< HEAD
    console.log("📝 savePushSubscription started", {
      endpoint: subscription.endpoint,
    });

    // Pobierz aktualnego użytkownika
    console.log("👤 Getting current user...");
=======
    if (import.meta.env.DEV) {
      console.log("📝 savePushSubscription started", {
        endpoint: subscription.endpoint,
      });
    }

    // Get current user
    if (import.meta.env.DEV) {
      console.log("👤 Getting current user...");
    }
>>>>>>> origin/main
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

<<<<<<< HEAD
    console.log("👤 User result:", { hasUser: !!user, error: userError });

    if (userError || !user) {
      throw new Error("Użytkownik nie jest zalogowany");
    }

    // Przygotuj dane subscription
=======
    if (import.meta.env.DEV) {
      console.log("👤 User result:", {
        hasUser: !!user,
        error: userError,
      });
    }

    if (userError || !user) {
      throw new Error("User is not logged in");
    }

    // Prepare subscription data
>>>>>>> origin/main
    const keys = subscription.getKey
      ? {
          p256dh: subscription.getKey("p256dh"),
          auth: subscription.getKey("auth"),
        }
      : null;

    const subscriptionData = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh_key: keys?.p256dh
        ? btoa(String.fromCharCode(...new Uint8Array(keys.p256dh)))
        : "",
      auth_key: keys?.auth
        ? btoa(String.fromCharCode(...new Uint8Array(keys.auth)))
        : "",
      user_agent: navigator.userAgent,
      device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
        ? "mobile"
        : "desktop",
      browser_name: getBrowserName(),
      is_active: true,
      created_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    };

<<<<<<< HEAD
    // Sprawdź czy subscription już istnieje
    console.log("🔍 Checking for existing subscription...");
=======
    // Check if subscription already exists
    if (import.meta.env.DEV) {
      console.log("🔍 Checking for existing subscription...");
    }
>>>>>>> origin/main
    const { data: existing, error: selectError } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("endpoint", subscription.endpoint)
      .single();

<<<<<<< HEAD
    console.log("🔍 Existing subscription check:", {
      hasExisting: !!existing,
      selectError,
    });
=======
    if (import.meta.env.DEV) {
      console.log("🔍 Existing subscription check:", {
        hasExisting: !!existing,
        selectError,
      });
    }
>>>>>>> origin/main

    let error;

    if (existing) {
<<<<<<< HEAD
      // Update istniejącej subscription
      console.log("🔄 Updating existing subscription...");
=======
      // Update existing subscription
      if (import.meta.env.DEV) {
        console.log("🔄 Updating existing subscription...");
      }
>>>>>>> origin/main
      const result = await supabase
        .from("push_subscriptions")
        .update({
          is_active: true,
          last_used_at: new Date().toISOString(),
          user_agent: subscriptionData.user_agent,
          device_type: subscriptionData.device_type,
          browser_name: subscriptionData.browser_name,
        })
        .eq("user_id", user.id)
        .eq("endpoint", subscription.endpoint);

      error = result.error;
<<<<<<< HEAD
      console.log("🔄 Update result:", { error });
    } else {
      // Insert nowej subscription
      console.log("📝 Inserting new subscription...", subscriptionData);
=======
      if (import.meta.env.DEV) {
        console.log("🔄 Update result:", { error });
      }
    } else {
      // Insert nowej subscription
      if (import.meta.env.DEV) {
        console.log("📝 Inserting new subscription...", subscriptionData);
      }
>>>>>>> origin/main
      const result = await supabase
        .from("push_subscriptions")
        .insert(subscriptionData);

      error = result.error;
<<<<<<< HEAD
      console.log("📝 Insert result:", { error, data: result.data });
    }

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    console.log("✅ Subscription saved to Supabase successfully!");
  } catch (error) {
    console.error("❌ Błąd w savePushSubscription:", error);
=======
      if (import.meta.env.DEV) {
        console.log("📝 Insert result:", { error, data: result.data });
      }
    }

    if (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Database error:", error);
      }
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log("✅ Subscription saved to Supabase successfully!");
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("❌ Error in savePushSubscription:", error);
    }
>>>>>>> origin/main
    throw error;
  }
}

/**
<<<<<<< HEAD
 * Pobiera nazwę przeglądarki
=======
 * Gets browser name
>>>>>>> origin/main
 */
function getBrowserName(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "Unknown";
}

/**
<<<<<<< HEAD
 * Testuje powiadomienie lokalne
=======
 * Shows test notification
>>>>>>> origin/main
 */
export async function showTestNotification(): Promise<void> {
  const permission = await requestNotificationPermission();

  if (permission !== "granted") {
<<<<<<< HEAD
    throw new Error("Brak uprawnień do powiadomień");
  }

  // Testowe powiadomienie
  new Notification("Test powiadomienia", {
=======
    throw new Error("No permission to send notifications");
  }

  // Test notification
  new Notification("Test notification", {
>>>>>>> origin/main
    body: "To jest testowe powiadomienie z Tasker App!",
    icon: "/vite.svg",
    tag: "test-notification",
  });
}

<<<<<<< HEAD
console.log("📱 Push notifications utilities loaded");
=======
if (import.meta.env.DEV) {
  console.log("📱 Push notifications utilities loaded");
}
>>>>>>> origin/main
