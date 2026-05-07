/* ================================================================
   firebase-messaging-sw.js — Jesus Embassy PWA
   Location:  ROOT of repository  (same level as index.html)
   Served at: https://daviddchucks-hash.github.io/Church-website/firebase-messaging-sw.js

   GitHub Pages project site base: /Church-website/
   ── DO NOT rename or move this file ──────────────────────────
================================================================ */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* ── Firebase config — must be identical to index.html ────────── */
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

/* GitHub Pages base path */
const BASE = '/Church-website';

/* ================================================================
   BACKGROUND MESSAGE HANDLER
   Fires when a push arrives while the site is in the background,
   minimised, or the tab is closed.
================================================================ */
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message:', payload);

  const n    = payload.notification || {};
  const data = payload.data         || {};

  const title    = n.title || 'Jesus Embassy';
  const body     = n.body  || 'You have a new update from Jesus Embassy.';
  const icon     = n.icon  || `${BASE}/icons/icon-192.png`;
  const badge    = `${BASE}/icons/icon-96.png`;
  const tag      = data.tag || 'je-push';
  const clickUrl = n.click_action || data.url || `https://daviddchucks-hash.github.io${BASE}/`;

  return self.registration.showNotification(title, {
    body,
    icon,
    badge,
    image:              n.image || undefined,
    tag,
    renotify:           false,
    requireInteraction: false,
    vibrate:            [200, 100, 200, 100, 200],
    data:               { url: clickUrl, ...data },
    actions: [
      { action: 'open',    title: '🙏 Open App' },
      { action: 'dismiss', title: '✕ Dismiss'   }
    ]
  });
});

/* ================================================================
   NOTIFICATION CLICK HANDLER
================================================================ */
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked, action:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : `https://daviddchucks-hash.github.io${BASE}/`;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.startsWith(`https://daviddchucks-hash.github.io${BASE}`) &&
              'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});

/* ================================================================
   RAW PUSH FALLBACK
   Fires for any push the FCM SDK does not intercept.
================================================================ */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (_) {
    payload = { notification: { title: 'Jesus Embassy', body: event.data.text() } };
  }

  if (payload.notification && payload.notification.handled) return;

  const n     = payload.notification || {};
  const title = n.title || 'Jesus Embassy';

  event.waitUntil(
    self.registration.showNotification(title, {
      body:  n.body  || 'You have a new message.',
      icon:  n.icon  || `${BASE}/icons/icon-192.png`,
      badge: `${BASE}/icons/icon-96.png`,
      tag:   'je-fallback',
      data:  { url: `https://daviddchucks-hash.github.io${BASE}/` }
    })
  );
});

/* ================================================================
   LIFECYCLE — activate immediately, no waiting
================================================================ */
self.addEventListener('install',  ()  => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
