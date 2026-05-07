/* ================================================================
   firebase-messaging-sw.js
   Jesus Embassy PWA — Firebase Cloud Messaging Service Worker
   
   DEPLOY LOCATION: repo ROOT  (same level as index.html)
   GitHub Pages URL: https://daviddchucks-hash.github.io/Church-website/firebase-messaging-sw.js
   
   This file handles background push notifications (app closed / minimised).
================================================================ */

/* ── 1. Import Firebase compat SDKs (must use importScripts in SW) ── */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* ── 2. Firebase config — MUST match index.html exactly ─────────── */
const firebaseConfig = {
  apiKey:            'AIzaSyCuAIyM54XWy4DaYqoFYoEIUP0mQNaZQY4',
  authDomain:        'church-app-637f7.firebaseapp.com',
  projectId:         'church-app-637f7',
  storageBucket:     'church-app-637f7.firebasestorage.app',
  messagingSenderId: '534721516086',
  appId:             '1:534721516086:web:1dd27eae690c620098be97',
  measurementId:     'G-JJL8SP6LNW'
};

/* ── 3. Initialise Firebase inside the service worker ────────────── */
firebase.initializeApp(firebaseConfig);

/* ── 4. Retrieve a Firebase Messaging instance ───────────────────── */
const messaging = firebase.messaging();

/* ── 5. Background message handler ──────────────────────────────── */
/*
  Called when a push arrives while the app is:
    • Closed / not open at all
    • Open in a background tab
    • Installed as PWA but not currently focused

  For foreground messages (app open + tab focused) the onMessage()
  handler in index.html takes over instead.
*/
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notification = payload.notification || {};
  const data         = payload.data         || {};

  const notificationTitle   = notification.title || data.title || 'Jesus Embassy';
  const notificationOptions = {
    body:  notification.body  || data.body  || '',
    icon:  notification.icon  || data.icon  || '/Church-website/icons/icon-192.png',
    badge: data.badge                        || '/Church-website/icons/icon-96.png',
    tag:   data.tag           || 'je-push',   // collapses duplicate notifications
    renotify: true,
    data: {
      url: data.url || notification.click_action || 'https://daviddchucks-hash.github.io/Church-website/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/* ── 6. Notification click handler ──────────────────────────────── */
/*
  Opens / focuses the site when the user taps the notification.
*/
self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification.tag);
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : 'https://daviddchucks-hash.github.io/Church-website/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      /* If a window with the target URL is already open, focus it */
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      /* Otherwise open a new window */
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
