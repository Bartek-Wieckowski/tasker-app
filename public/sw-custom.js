/* eslint-disable no-undef */
// Prosty Service Worker z push notifications (bez Workbox)
console.log("🔧 Loading simple SW with push notifications...");

// Cache name
const CACHE_NAME = "tasker-app-v1";
const urlsToCache = ["/", "/index.html", "/favicon.svg"];

// Install event - cache resources
self.addEventListener("install", function (event) {
  console.log("🔧 SW Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log("📦 Caching app shell");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("✅ SW Install complete");
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", function (event) {
  console.log("🔧 SW Activating...");
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ SW Activate complete");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// 🔔 PUSH NOTIFICATIONS
self.addEventListener("push", function (event) {
  console.log("🔔 Push notification received in SW:", {
    hasData: !!event.data,
    timeStamp: new Date().toISOString(),
    event: event,
  });

  let notificationData = {
    // title: "Incomplete tasks",
    // body: "You have incomplete tasks",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { url: "/" },
  };

  // Parse notification data from server (this should always have data)
  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log("📦 Push data received from server:", pushData);

      // Use server data directly (server always sends complete notification)
      notificationData = pushData;
      console.log("✅ Using server notification data:", notificationData);
    } catch (e) {
      console.warn("❌ Could not parse push data, using fallback:", e);
      try {
        const rawText = event.data.text();
        console.log("📝 Raw push data as text:", rawText);
      } catch (textError) {
        console.log("📝 Could not get text data either:", textError);
      }
    }
  } else {
    console.log("⚠️ No data in push event, using fallback");
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    // actions: [
    //   {
    //     action: "view",
    //     title: "View tasks",
    //     icon: "/favicon.svg",
    //   },
    //   {
    //     action: "dismiss",
    //     title: "Dismiss",
    //   },
    // ],
    actions: [],
    requireInteraction: false,
    tag: "daily-todo-reminder",
    renotify: true,
  };

  console.log("📢 About to show notification:", {
    title: notificationData.title,
    options: options,
  });

  event.waitUntil(
    self.registration
      .showNotification(notificationData.title, options)
      .then(() => {
        console.log("✅ Notification shown successfully");
      })
      .catch((error) => {
        console.error("❌ Error showing notification:", error);
      })
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log("🖱️ Notification clicked:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Open app or navigate to tasks
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if window is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log("❌ Notification closed:", event);
});

console.log("✅ Simple Service Worker with push notifications loaded");
