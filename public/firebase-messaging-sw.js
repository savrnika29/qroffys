importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

try {
  // Initialize Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyCxfFs9DU2pFMWSh8VftZkeGHFltd5BDqI",
    authDomain: "qroffy-77b23.firebaseapp.com",
    projectId: "qroffy-77b23",
    storageBucket: "qroffy-77b23.firebasestorage.app",
    messagingSenderId: "902415119788",
    appId: "1:902415119788:web:4be147d95f48a0234b7609",
    measurementId: "G-4H0NMH8692",
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle =
      payload.notification?.title || payload.data?.title || "New Notification";
    const notificationOptions = {
      body:
        payload.notification?.body ||
        payload.data?.body ||
        "You have a new notification",
      icon:
        payload.notification?.icon ||
        payload.data?.icon ||
        "/firebase-logo.png",
      data: payload.data || {},
    };

    // Show the notification
    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Handle notification click
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification.data?.url || "/notification"; // Default to /notification

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Focus on existing window if it matches the URL
          for (const client of clientList) {
            if (client.url.includes(url) && "focus" in client) {
              return client.focus();
            }
          }
          // Open a new window if no matching window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  });
} catch (error) {
  console.error("[firebase-messaging-sw.js] Error:", error);
}
