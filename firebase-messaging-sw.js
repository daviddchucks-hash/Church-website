/* ================================================================
   firebase-messaging-sw.js — Jesus Embassy PWA
   
   LOCATION: ROOT of repository (same level as index.html)
   FULL URL:  https://daviddchucks-hash.github.io/Church-website/firebase-messaging-sw.js
   
   GitHub Pages project site: /Church-website/
   DO NOT rename or move this file.
================================================================ */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

console.log('[FCM SW] Service worker loading…');

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
const BASE      = '/Church-website';
const SITE_URL  = 'https://daviddchucks-hash.github.io' + BASE + '/';

console.log('[FCM SW] Firebase initialised. Messaging ready.');

/* ================================================================
   BACKGROUND PUSH HANDLER
   Fires when app is closed, backgrounded, or tab is not focused.
================================================================ */
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const n         = payload.notification || {};
  const data      = payload.data         || {};
  const title     = n.title   || 'Jesus Embassy';
  const body      = n.body    || 'You have a new update from Jesus Embassy.';
  const icon      = n.icon    || BASE + '/icons/icon-192.png';
  const badge     = BASE      + '/icons/icon-96.png';
  const tag       = data.tag  || 'je-push';
  const clickUrl  = n.click_action || data.url || SITE_URL;

  console.log('[FCM SW] Showing notification:', title, '|', body);

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
      { action: 'dismiss', title: '✕ Dismiss'  }
    ]
  });
});

/* ================================================================
   NOTIFICATION CLICK HANDLER
================================================================ */
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked. Action:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : SITE_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if (win.url.startsWith('https://daviddchucks-hash.github.io' + BASE) && 'focus' in win) {
          console.log('[FCM SW] Focusing existing window.');
          return win.focus();
        }
      }
      console.log('[FCM SW] Opening new window:', url);
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

/* ================================================================
   RAW PUSH FALLBACK
   Handles any push the FCM SDK doesn't intercept.
================================================================ */
self.addEventListener('push', (event) => {
  console.log('[FCM SW] Raw push event received.');
  if (!event.data) return;

  let payload = {};
  try   { payload = event.data.json(); }
  catch (_) { payload = { notification: { title: 'Jesus Embassy', body: event.data.text() } }; }

  /* Skip if FCM SDK already handled it */
  if (payload.notification && payload.notification.handled) return;

  const n     = payload.notification || {};
  const title = n.title || 'Jesus Embassy';
  const body  = n.body  || 'New update available.';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  BASE + '/icons/icon-192.png',
      badge: BASE + '/icons/icon-96.png',
      tag:   'je-fallback',
      data:  { url: SITE_URL }
    })
  );
});

/* ================================================================
   LIFECYCLE
   skipWaiting ensures updated SW activates immediately.
   clients.claim lets SW control all open pages right away.
================================================================ */
self.addEventListener('install', (e) => {
  console.log('[FCM SW] Installing…');
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  console.log('[FCM SW] Activated. Claiming clients…');
  e.waitUntil(self.clients.claim());
});
