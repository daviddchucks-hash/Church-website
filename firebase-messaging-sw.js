/*
 * firebase-messaging-sw.js
 * ════════════════════════════════════════════════════════════════
 *  Jesus Embassy PWA — Firebase Cloud Messaging Service Worker
 *  Repo:  daviddchucks-hash/Church-website
 *  URL:   https://daviddchucks-hash.github.io/Church-website/firebase-messaging-sw.js
 *
 *  DEPLOYMENT: place this file in the REPO ROOT (same level as index.html)
 *  GitHub Pages will serve it at:
 *    https://daviddchucks-hash.github.io/Church-website/firebase-messaging-sw.js
 *
 *  REGISTERED BY index.html with:
 *    scope: '/Church-website/fcm/'   <- dedicated scope, no conflict with PWA SW
 * ════════════════════════════════════════════════════════════════
 */

/* Self-diagnostics */
console.log('[FCM-SW] Script parsing started');
console.log('[FCM-SW] SW location:', self.location.href);

/* Load Firebase compat SDKs */
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  console.log('[FCM-SW] Firebase scripts loaded successfully');
} catch (e) {
  console.error('[FCM-SW] FATAL: importScripts failed:', e.message);
}

/* Firebase config - MUST be identical to FB_CONFIG in index.html */
var FB_CONFIG = {
  apiKey:            'AIzaSyCuAIyM54XWy4DaYqoFYoEIUP0mQNaZQY4',
  authDomain:        'church-app-637f7.firebaseapp.com',
  projectId:         'church-app-637f7',
  storageBucket:     'church-app-637f7.firebasestorage.app',
  messagingSenderId: '534721516086',
  appId:             '1:534721516086:web:1dd27eae690c620098be97',
  measurementId:     'G-JJL8SP6LNW'
};

var GH_BASE  = '/Church-website';
var SITE_URL = 'https://daviddchucks-hash.github.io' + GH_BASE + '/';

/* Initialise Firebase */
var messaging;
try {
  var fbApp = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp(FB_CONFIG);
  messaging = firebase.messaging(fbApp);
  console.log('[FCM-SW] Firebase Messaging initialised. Project:', fbApp.options.projectId);
} catch (e) {
  console.error('[FCM-SW] FATAL: Firebase init failed:', e.message);
}

/*
 * INSTALL
 * skipWaiting() forces this SW to become active immediately instead of
 * waiting for all tabs to close. Without this a new SW sits in 'waiting'
 * state and push events still go to the OLD SW.
 */
self.addEventListener('install', function (event) {
  console.log('[FCM-SW] Install event - calling skipWaiting()');
  self.skipWaiting();
});

/*
 * ACTIVATE
 * clients.claim() makes this SW take control of all open pages immediately.
 * Without this the first page load after install is not controlled by the
 * new SW so push subscription may reference the wrong (old) SW.
 */
self.addEventListener('activate', function (event) {
  console.log('[FCM-SW] Activate event - calling clients.claim()');
  event.waitUntil(clients.claim());
});

/* Allow the page to force-activate an update */
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[FCM-SW] SKIP_WAITING received - activating now');
    self.skipWaiting();
  }
});

/*
 * BACKGROUND MESSAGE HANDLER
 * Called when the app tab is closed, backgrounded, or screen is off.
 * NOT called when the app tab is focused (that goes to onMessage in index.html).
 */
if (messaging) {
  messaging.onBackgroundMessage(function (payload) {
    console.log('[FCM-SW] Background message received:', JSON.stringify(payload));

    var notification = payload.notification || {};
    var data         = payload.data         || {};

    var title    = notification.title || data.title || 'Jesus Embassy';
    var body     = notification.body  || data.body  || '';
    var icon     = notification.icon  || data.icon  || GH_BASE + '/icons/icon-192.png';
    var badge    =                       data.badge || GH_BASE + '/icons/icon-96.png';
    var tag      =                       data.tag   || 'je-notification';
    var clickUrl = data.url || notification.click_action || SITE_URL;

    var options = {
      body:               body,
      icon:               icon,
      badge:              badge,
      tag:                tag,
      renotify:           true,
      vibrate:            [200, 100, 200],
      requireInteraction: false,
      data:               { url: clickUrl }
    };

    console.log('[FCM-SW] Showing notification:', title, '|', body);

    return self.registration.showNotification(title, options)
      .then(function () {
        console.log('[FCM-SW] showNotification() succeeded');
      })
      .catch(function (err) {
        console.error('[FCM-SW] showNotification() FAILED:', err.message);
      });
  });
} else {
  /*
   * FALLBACK raw push handler
   * If Firebase SDK crashed, we still show a notification from the raw push event.
   */
  console.error('[FCM-SW] messaging undefined - registering raw push fallback');

  self.addEventListener('push', function (event) {
    console.log('[FCM-SW] RAW push event (Firebase not initialised)');

    var data = {};
    try {
      data = event.data ? event.data.json() : {};
    } catch (e) {
      data = { title: 'Jesus Embassy', body: event.data ? event.data.text() : '' };
    }

    var options = {
      body:    data.body  || '',
      icon:    GH_BASE + '/icons/icon-192.png',
      badge:   GH_BASE + '/icons/icon-96.png',
      tag:     'je-fallback',
      data:    { url: SITE_URL }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Jesus Embassy', options)
    );
  });
}

/* NOTIFICATION CLICK - open or focus the PWA */
self.addEventListener('notificationclick', function (event) {
  console.log('[FCM-SW] Notification clicked. Tag:', event.notification.tag);
  event.notification.close();

  var targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : SITE_URL;

  console.log('[FCM-SW] Opening URL:', targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.indexOf('daviddchucks-hash.github.io/Church-website') !== -1 &&
              'focus' in client) {
            console.log('[FCM-SW] Focusing existing tab');
            return client.focus();
          }
        }
        if (clients.openWindow) {
          console.log('[FCM-SW] Opening new window');
          return clients.openWindow(targetUrl);
        }
      })
      .catch(function (err) {
        console.error('[FCM-SW] notificationclick error:', err.message);
      })
  );
});

/* Catch-all SW error handler */
self.onerror = function (msg, src, line) {
  console.error('[FCM-SW] Uncaught error:', msg, '| src:', src, '| line:', line);
};

console.log('[FCM-SW] Script fully parsed and ready');
