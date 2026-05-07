importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCuAIyM54XWy4DaYqoFYoEIUP0mQNaZQY4",
  authDomain: "church-app-637f7.firebaseapp.com",
  projectId: "church-app-637f7",
  storageBucket: "church-app-637f7.firebasestorage.app",
  messagingSenderId: "534721516086",
  appId: "1:534721516086:web:1dd27eae690c620098be97"
});

const messaging = firebase.messaging();

// 🔔 Background notification handler
messaging.onBackgroundMessage(function(payload) {
  console.log("Background message received:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png" // optional
  });
});