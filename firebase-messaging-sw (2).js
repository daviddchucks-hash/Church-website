/* ================================================================
   firebase-messaging-sw.js — Jesus Embassy PWA
   DEPLOY TO: repo ROOT (same folder as index.html)
   URL: https://daviddchucks-hash.github.io/Church-website/firebase-messaging-sw.js
================================================================ */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* ── Firebase config — must match index.html exactly ── */
firebase.initializeApp({
  apiKey:            'AIzaSyCuAIyM54XWy4DaYqoFYoEIUP0mQNaZQY4',
  authDomain:        'church-app-637f7.firebaseapp.com',
  projectId:         'church-app-637f7',
  storageBucket:     'church-app-637f7.firebasestorage.app',
  messagingSenderId: '534721516086',
  appId:             '1:534721516086:web:1dd27eae690c620098be97',
  measurementId:     'G-JJL8SP6LNW'
});

var messaging = firebase.messaging();

var GH_BASE   = '/Church-website';
var SITE_URL  = 'https://daviddchucks-hash.github.io' + GH_BASE + '/';

/* ── Background message handler ── */
/* Fires when app is closed, backgrounded, or tab not focused */
messaging.onBackgroundMessage(function (payload) {
  console.log('[SW] Background message received:', payload);

  var notification = payload.notification || {};
  var data         = payload.data         || {};

  var title   = notification.title || data.title || 'Jesus Embassy';
  var body    = notification.body  || data.body  || '';
  var icon    = notification.icon  || data.icon  || GH_BASE + '/icons/icon-192.png';
  var badge   = data.badge                        || GH_BASE + '/icons/icon-96.png';
  var clickUrl = data.url || notification.click_action || SITE_URL;

  return self.registration.showNotification(title, {
    body:      body,
    icon:      icon,
    badge:     badge,
    tag:       data.tag || 'je-notification',
    renotify:  true,
    vibrate:   [200, 100, 200],
    data:      { url: clickUrl }
  });
});

/* ── Notification click handler ── */
self.addEventListener('notificationclick', function (event) {
  console.log('[SW] Notification clicked');
  event.notification.close();

  var targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : SITE_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.indexOf(GH_BASE) !== -1 && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/* ── SW install and activate — force immediate activation ── */
self.addEventListener('install', function (event) {
  console.log('[SW] Installing');
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  console.log('[SW] Activated');
  event.waitUntil(clients.claim());
});
