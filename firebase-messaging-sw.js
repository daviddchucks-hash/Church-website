/* ================================================================
   firebase-messaging-sw.js
   Firebase Cloud Messaging Service Worker — Jesus Embassy PWA
   Place this file in the ROOT of your project (same level as index.html)
================================================================ */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* ── Firebase config (must match index.html exactly) ─────────── */
firebase.initializeApp({
  apiKey:            'AIzaSyCuAIyM54XWy4DaYqoFYoEIUP0mQNaZQY4',
  authDomain:        'church-app-637f7.firebaseapp.com',
  projectId:         'church-app-637f7',
  storageBucket:     'church-app-637f7.firebasestorage.app',
  messagingSenderId: '534721516086',
  appId:             '1:534721516086:web:1dd27eae690c620098be97',
  measurementId:     'G-JJL8SP6LNW'
});

const messaging = firebase.messaging();

/* ── Background message handler ─────────────────────────────────
   Fires when a push arrives while the app is in the background,
   minimised, or the tab is closed.
   Firebase will auto-display a default notification; this handler
   lets you customise title, body, icon, and actions.
──────────────────────────────────────────────────────────────── */
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const { title, body, icon, image, clickAction } = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle = title || 'Jesus Embassy';
  const notificationOptions = {
    body:    body  || 'You have a new message from Jesus Embassy.',
    icon:    icon  || '/Church-website-/icons/icon-192.png',
    badge:   '/Church-website-/icons/icon-96.png',
    image:   image || undefined,
    tag:     data.tag || 'je-notification',   // collapses duplicate notifications
    renotify: false,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: clickAction || data.url || '/Church-website-/',
      ...data
    },
    actions: [
      { action: 'open',    title: '🙏 Open App'   },
      { action: 'dismiss', title: 'Dismiss'        }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/* ── Notification click handler ─────────────────────────────────
   Handles taps on background notifications.
──────────────────────────────────────────────────────────────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/Church-website-/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      /* If app window is already open, focus it */
      for (const client of windowClients) {
        if (client.url.includes('/Church-website-/') && 'focus' in client) {
          return client.focus();
        }
      }
      /* Otherwise open a new window */
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/* ── Push event fallback ─────────────────────────────────────────
   In case the FCM SDK doesn't handle the raw push event.
──────────────────────────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try { payload = event.data.json(); } catch (_) {
    payload = { notification: { title: 'Jesus Embassy', body: event.data.text() } };
  }

  const { title, body, icon } = payload.notification || {};

  event.waitUntil(
    self.registration.showNotification(title || 'Jesus Embassy', {
      body:  body || 'You have a new update.',
      icon:  icon || '/Church-website-/icons/icon-192.png',
      badge: '/Church-website-/icons/icon-96.png',
      data:  { url: '/Church-website-/' }
    })
  );
});
